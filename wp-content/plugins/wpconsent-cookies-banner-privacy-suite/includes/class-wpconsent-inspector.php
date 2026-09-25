<?php
/**
 * Class used to manage the cookie inspector.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Inspector.
 */
class WPConsent_Inspector {

	/**
	 * Option name for pending detected cookies.
	 *
	 * @var string
	 */
	const PENDING_OPTION_PREFIX = 'wpconsent_inspector_detected_cookies_';

	/**
	 * Nonce action for inspector AJAX requests.
	 *
	 * @var string
	 */
	const NONCE_ACTION = 'wpconsent_inspector';

	/**
	 * Cached active state to avoid redundant transient reads.
	 *
	 * @var bool|null
	 */
	protected $active_cache = null;

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'admin_post_wpconsent_start_inspector', array( $this, 'handle_start_inspector' ) );
		add_action( 'wp_ajax_wpconsent_inspector_deactivate', array( $this, 'ajax_deactivate' ) );
		add_action( 'wp_ajax_wpconsent_inspector_add_cookie', array( $this, 'ajax_add_cookie' ) );
		add_action( 'wp_ajax_wpconsent_inspector_save_for_review', array( $this, 'ajax_save_for_review' ) );
		add_action( 'wp_ajax_wpconsent_inspector_dismiss_cookie', array( $this, 'ajax_dismiss_cookie' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'maybe_enqueue_inspector' ) );
		add_action( 'wp_head', array( $this, 'output_early_interceptor' ), 1 );
		add_filter( 'wpconsent_frontend_js_data', array( $this, 'disable_geolocation_js_data' ) );
	}

	/**
	 * Disable geolocation in the frontend JS data when the inspector is active.
	 *
	 * Geolocation rules override settings like default_allow and enable_script_blocking
	 * at the JS level based on the visitor's region. During inspection, we need the base
	 * settings to be used so the admin can verify their configuration without regional
	 * overrides interfering.
	 *
	 * @param array $js_data The frontend JS data.
	 *
	 * @return array Filtered JS data with geolocation disabled.
	 */
	public function disable_geolocation_js_data( $js_data ) {
		if ( ! $this->is_active() ) {
			return $js_data;
		}

		if ( isset( $js_data['geolocation'] ) ) {
			$js_data['geolocation']['enabled']         = false;
			$js_data['geolocation']['location_groups'] = array();
		}

		return $js_data;
	}

	/**
	 * Output an inline interceptor in <head> that captures document.cookie
	 * writes from the very start of page load. The main inspector module
	 * (loaded later in the footer) reads the queued data so cookies set by
	 * early scripts still get duration and stack trace information.
	 *
	 * @return void
	 */
	public function output_early_interceptor() {
		if ( ! $this->is_active() ) {
			return;
		}
		?>
		<script id="wpconsent-early-interceptor">
		(function() {
			var d = Object.getOwnPropertyDescriptor( Document.prototype, 'cookie' );
			if ( ! d || ! d.set ) { return; }
			var origSet = d.set;
			var origGet = d.get;
			window.__wpconsentEarlyCookies = [];
			Object.defineProperty( document, 'cookie', {
				get: function() { return origGet.call( document ); },
				set: function( v ) {
					if ( window.__wpconsentEarlyCookies && window.__wpconsentEarlyCookies.length < 500 ) {
						window.__wpconsentEarlyCookies.push( {
							value: v,
							timestamp: Date.now(),
							page: window.location.href,
							stack: new Error().stack || ''
						} );
					}
					return origSet.call( document, v );
				},
				configurable: true
			} );
		})();
		</script>
		<?php
	}

	/**
	 * Get the transient key for the current user's inspector state.
	 *
	 * @return string
	 */
	protected function get_transient_key() {
		return 'wpconsent_inspector_active_' . get_current_user_id();
	}

	/**
	 * Get the option name for the current user's pending cookies.
	 *
	 * @return string
	 */
	protected function get_pending_option() {
		return self::PENDING_OPTION_PREFIX . get_current_user_id();
	}

	/**
	 * Get the admin review page URL.
	 *
	 * @return string
	 */
	public function get_review_url() {
		return admin_url( 'admin.php?page=wpconsent-scanner&view=inspector' );
	}

	/**
	 * Verify the current user has permission and send error if not.
	 *
	 * @return void Sends JSON error and dies if unauthorized.
	 */
	protected function require_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			) );
		}
	}

	/**
	 * Check if the inspector is active for the current user.
	 *
	 * @return bool
	 */
	public function is_active() {
		if ( ! is_user_logged_in() || ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		if ( null === $this->active_cache ) {
			$this->active_cache = (bool) get_transient( $this->get_transient_key() );
		}

		return $this->active_cache;
	}

	/**
	 * Handle the start inspector admin_post action.
	 *
	 * @return void
	 */
	public function handle_start_inspector() {
		check_admin_referer( 'wpconsent_start_inspector' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to use the inspector.', 'wpconsent-cookies-banner-privacy-suite' ) );
		}

		set_transient( $this->get_transient_key(), true, 30 * MINUTE_IN_SECONDS );

		// Mark the inspector as having been run at least once (for compliance score).
		wpconsent()->settings->update_option( 'inspector_completed', true );

		wp_safe_redirect( home_url() );
		exit;
	}

	/**
	 * AJAX handler to deactivate the inspector.
	 *
	 * @return void
	 */
	public function ajax_deactivate() {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );
		$this->require_permission();

		delete_transient( $this->get_transient_key() );

		wp_send_json_success();
	}

	/**
	 * AJAX handler to add a cookie and dismiss it from the pending queue.
	 *
	 * @return void
	 */
	public function ajax_add_cookie() {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );
		$this->require_permission();

		$cookie_id          = isset( $_POST['cookie_id'] ) ? sanitize_text_field( wp_unslash( $_POST['cookie_id'] ) ) : '';
		$cookie_name        = isset( $_POST['cookie_name'] ) ? sanitize_text_field( wp_unslash( $_POST['cookie_name'] ) ) : '';
		$cookie_description = isset( $_POST['cookie_description'] ) ? sanitize_textarea_field( wp_unslash( $_POST['cookie_description'] ) ) : '';
		$cookie_category    = isset( $_POST['cookie_category'] ) ? intval( $_POST['cookie_category'] ) : 0;
		$cookie_duration    = isset( $_POST['cookie_duration'] ) ? sanitize_text_field( wp_unslash( $_POST['cookie_duration'] ) ) : '';
		$cookie_service     = isset( $_POST['cookie_service'] ) ? intval( $_POST['cookie_service'] ) : 0;
		$dismiss            = isset( $_POST['dismiss'] ) && 'true' === sanitize_text_field( wp_unslash( $_POST['dismiss'] ) );

		if ( empty( $cookie_id ) || empty( $cookie_name ) || empty( $cookie_category ) ) {
			wp_send_json_error( array(
				'message' => esc_html__( 'Cookie ID, name, and category are required.', 'wpconsent-cookies-banner-privacy-suite' ),
			) );
		}

		// Services are child terms, so prefer service over category when assigning.
		$term_id = $cookie_service ? $cookie_service : $cookie_category;

		$post_id = wpconsent()->cookies->add_cookie( $cookie_id, $cookie_name, $cookie_description, $term_id, $cookie_duration );

		if ( is_wp_error( $post_id ) ) {
			wp_send_json_error( array(
				'message' => $post_id->get_error_message(),
			) );
		}

		// Remove from pending queue if requested.
		if ( $dismiss ) {
			$this->dismiss_pending_cookie( $cookie_id );
		}

		wp_send_json_success( array(
			'post_id'   => $post_id,
			'cookie_id' => $cookie_id,
			'name'      => $cookie_name,
			'category'  => $cookie_category,
			'service'   => $cookie_service,
		) );
	}

	/**
	 * Conditionally enqueue inspector scripts on the frontend.
	 *
	 * @return void
	 */
	public function maybe_enqueue_inspector() {
		if ( ! $this->is_active() ) {
			return;
		}

		$asset_file = WPCONSENT_PLUGIN_PATH . 'build/inspector.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'wpconsent-inspector-js',
			WPCONSENT_PLUGIN_URL . 'build/inspector.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'wpconsent-inspector-css',
			WPCONSENT_PLUGIN_URL . 'build/inspector.css',
			array(),
			$asset['version']
		);

		wp_localize_script(
			'wpconsent-inspector-js',
			'wpconsentInspector',
			$this->get_localized_data()
		);
	}

	/**
	 * Determine the inspector mode based on plugin settings.
	 *
	 * @return string 'optin', 'optout', or 'discovery'.
	 */
	public function get_inspector_mode() {
		$script_blocking = (bool) wpconsent()->settings->get_option( 'enable_script_blocking', 0 );

		if ( ! $script_blocking ) {
			return 'discovery';
		}

		$default_allow = (bool) wpconsent()->settings->get_option( 'default_allow', 0 );

		return $default_allow ? 'optout' : 'optin';
	}

	/**
	 * Get all translated strings for the inspector floating panel, keyed by mode.
	 *
	 * @param string $mode Inspector mode: 'optin', 'optout', or 'discovery'.
	 *
	 * @return array Associative array of i18n strings for the frontend panel.
	 */
	public function get_mode_i18n( $mode ) {
		$settings_url = admin_url( 'admin.php?page=wpconsent-cookies' );

		$strings = array(
			'guidanceNoCookies'   => __( 'Browse your site to detect cookies. Navigate to different pages to get a complete picture.', 'wpconsent-cookies-banner-privacy-suite' ),
			'reviewAction'        => __( 'Click Review Cookies to configure them.', 'wpconsent-cookies-banner-privacy-suite' ),
			'undocumentedWarning' => __( 'Unknown cookie loaded before consent', 'wpconsent-cookies-banner-privacy-suite' ),
			'blockingRuleWarning' => __( 'Loaded before consent — blocking rule may be missing', 'wpconsent-cookies-banner-privacy-suite' ),
			'finish'              => __( 'Finish Inspection', 'wpconsent-cookies-banner-privacy-suite' ),
			'reviewCookies'       => __( 'Review Cookies', 'wpconsent-cookies-banner-privacy-suite' ),
			'sectionAttention'    => __( 'Needs Attention', 'wpconsent-cookies-banner-privacy-suite' ),
			'sectionUndocumented' => __( 'Undocumented', 'wpconsent-cookies-banner-privacy-suite' ),
			'sectionOk'           => __( 'Working Correctly', 'wpconsent-cookies-banner-privacy-suite' ),
			'sectionAdminOnly'    => __( 'Admin only cookies', 'wpconsent-cookies-banner-privacy-suite' ),
			'adminOnlyExplainer'  => __( 'Only set when logged-in users access the WordPress admin. Regular visitors never see them. Document them only if needed.', 'wpconsent-cookies-banner-privacy-suite' ),
			'adminOnlyBadge'      => __( 'Admin only', 'wpconsent-cookies-banner-privacy-suite' ),
			/* translators: Used as "1 page" in cookie metadata. */
			'pageSingular'        => __( 'page', 'wpconsent-cookies-banner-privacy-suite' ),
			/* translators: Used as "3 pages" in cookie metadata. */
			'pagePlural'          => __( 'pages', 'wpconsent-cookies-banner-privacy-suite' ),
			/* translators: Used as "1 cookie" in guidance messages. */
			'cookieSingular'      => __( 'cookie', 'wpconsent-cookies-banner-privacy-suite' ),
			/* translators: Used as "3 cookies" in guidance messages. */
			'cookiePlural'        => __( 'cookies', 'wpconsent-cookies-banner-privacy-suite' ),
			'thisPageLooksGood'   => __( 'This page looks good! Use ↻ to reset the banner and re-check, or visit more pages.', 'wpconsent-cookies-banner-privacy-suite' ),
			/* translators: Preceded by a number, e.g. "3 pages inspected — all looking good!" */
			'pagesInspectedGood'  => __( 'pages inspected — looking good! Visit more pages or finish below.', 'wpconsent-cookies-banner-privacy-suite' ),
			'suggestedPagesLabel' => __( 'Visit next:', 'wpconsent-cookies-banner-privacy-suite' ),
			'minimizeHint'        => __( 'Minimize to browse your site', 'wpconsent-cookies-banner-privacy-suite' ),
			'minimizeTitle'       => __( 'Minimize — keep browsing', 'wpconsent-cookies-banner-privacy-suite' ),
			'panelTitle'          => __( 'WPConsent Cookie Inspector', 'wpconsent-cookies-banner-privacy-suite' ),
			'restartTitle'        => __( 'Reset cookies and show the banner again', 'wpconsent-cookies-banner-privacy-suite' ),
			'modeOptin'           => __( 'Opt-in mode', 'wpconsent-cookies-banner-privacy-suite' ),
			'modeOptout'          => __( 'Opt-out mode', 'wpconsent-cookies-banner-privacy-suite' ),
			'modeDiscovery'       => __( 'Discovery mode', 'wpconsent-cookies-banner-privacy-suite' ),
		);

		if ( 'discovery' === $mode ) {
			$strings['guidancePreBoundaryIssues']  = __( 'detected. Script blocking is disabled — cookies are expected to load freely.', 'wpconsent-cookies-banner-privacy-suite' );
			$strings['guidancePreBoundaryClean']   = __( 'No issues so far. Accept cookies on the banner to continue detection.', 'wpconsent-cookies-banner-privacy-suite' );
			$strings['guidancePostBoundaryIssues'] = __( 'found. Review them to add them to your cookie database.', 'wpconsent-cookies-banner-privacy-suite' );
			$strings['guidancePostBoundaryClean']  = __( 'All detected cookies are documented. Enable script blocking for full compliance verification.', 'wpconsent-cookies-banner-privacy-suite' );
			$strings['blockingDisabledNotice']     = sprintf(
				/* translators: %1$s is an opening link tag, %2$s is a closing link tag. */
				__( 'Script blocking is disabled. %1$sEnable it in your settings%2$s for compliance testing.', 'wpconsent-cookies-banner-privacy-suite' ),
				'<a href="' . esc_url( $settings_url ) . '">',
				'</a>'
			);
		} elseif ( 'optout' === $mode ) {
			$strings['guidancePreBoundaryIssues']  = __( 'loading as expected. Reject cookies on the banner to test if blocking works after rejection.', 'wpconsent-cookies-banner-privacy-suite' );
			$strings['guidancePreBoundaryClean']   = __( 'Cookies are loading as expected. Reject cookies on the banner to verify blocking works.', 'wpconsent-cookies-banner-privacy-suite' );
			$strings['guidancePostBoundaryIssues'] = __( 'not blocked after rejection. Review them to fix your blocking rules.', 'wpconsent-cookies-banner-privacy-suite' );
			$strings['guidancePostBoundaryClean']  = __( 'All cookies were properly blocked after rejection. Your site looks good!', 'wpconsent-cookies-banner-privacy-suite' );
			$strings['undocumentedWarning']        = __( 'Unknown cookie — not yet documented', 'wpconsent-cookies-banner-privacy-suite' );
			$strings['blockingRuleWarning']        = __( 'Not blocked after rejection — blocking rule may be missing', 'wpconsent-cookies-banner-privacy-suite' );
		} else {
			// optin (default / current behavior).
			$strings['guidancePreBoundaryIssues']  = __( 'loaded before consent. Accept cookies on the banner to check what loads after consent.', 'wpconsent-cookies-banner-privacy-suite' );
			$strings['guidancePreBoundaryClean']   = __( 'Looking good so far. Accept cookies on the banner to see what loads after consent.', 'wpconsent-cookies-banner-privacy-suite' );
			$strings['guidancePostBoundaryIssues'] = __( 'detected. Click Review Cookies to configure them.', 'wpconsent-cookies-banner-privacy-suite' );
			$strings['guidancePostBoundaryClean']  = __( 'All cookies are properly documented and blocked before consent. Your site looks good!', 'wpconsent-cookies-banner-privacy-suite' );
		}

		return $strings;
	}

	/**
	 * Get the localized data for the inspector JS.
	 *
	 * @return array
	 */
	public function get_localized_data() {
		$categories  = wpconsent()->cookies->get_categories();
		$service_map = $this->build_service_map( $categories );
		$mode        = $this->get_inspector_mode();

		return array(
			'ajaxurl'               => admin_url( 'admin-ajax.php' ),
			'nonce'                 => wp_create_nonce( self::NONCE_ACTION ),
			'documented_cookies'    => $this->get_documented_cookies( $categories, $service_map ),
			'adminContextPrefixes'  => $this->get_admin_context_cookie_prefixes(),
			'categories'            => $this->format_categories( $categories ),
			'services'              => $this->format_services_from_map( $service_map ),
			'review_url'            => $this->get_review_url(),
			'inspectorMode'         => $mode,
			'scriptBlockingEnabled' => 'discovery' !== $mode,
			'suggestedPages'        => $this->get_suggested_pages(),
			'bannerLayout'          => wpconsent()->settings->get_option( 'banner_layout', 'long' ),
			'bannerPosition'        => wpconsent()->settings->get_option( 'banner_position', 'top' ),
			'i18n'                  => $this->get_mode_i18n( $mode ),
		);
	}

	/**
	 * Add a page URL to the list if the post ID is valid, tracking its title
	 * in $known_labels so the label loop can skip url_to_postid().
	 *
	 * @param int   $page_id      The post/page ID.
	 * @param array $urls          URL list (passed by reference).
	 * @param array $known_labels  URL-to-title map (passed by reference).
	 */
	private function maybe_add_page_url( $page_id, &$urls, &$known_labels ) {
		$page_id = (int) $page_id;
		if ( $page_id <= 0 ) {
			return;
		}

		$url = get_permalink( $page_id );
		if ( $url ) {
			$urls[]                = $url;
			$known_labels[ $url ] = get_the_title( $page_id );
		}
	}

	/**
	 * Get suggested pages for multi-page inspection.
	 *
	 * Combines scanner URLs with auto-detected pages like WooCommerce
	 * checkout/cart and the site privacy policy page.
	 *
	 * @return array Array of [ 'url' => string, 'label' => string ] entries.
	 */
	protected function get_suggested_pages() {
		// Track URL => label for pages where we already know the post ID,
		// so we can skip expensive url_to_postid() lookups later.
		$known_labels = array();

		$urls = array();

		// Start with scanner-configured URLs.
		if ( isset( wpconsent()->scanner ) ) {
			$urls = wpconsent()->scanner->get_scan_urls();
		}

		// Add WooCommerce pages if available.
		if ( function_exists( 'wc_get_checkout_url' ) ) {
			$urls[] = wc_get_checkout_url();
		}
		if ( function_exists( 'wc_get_cart_url' ) ) {
			$urls[] = wc_get_cart_url();
		}
		if ( function_exists( 'wc_get_page_id' ) ) {
			$this->maybe_add_page_url( wc_get_page_id( 'shop' ), $urls, $known_labels );
			$this->maybe_add_page_url( wc_get_page_id( 'myaccount' ), $urls, $known_labels );
		}

		$this->maybe_add_page_url( (int) get_option( 'wp_page_for_privacy_policy' ), $urls, $known_labels );
		$this->maybe_add_page_url( (int) get_option( 'page_for_posts' ), $urls, $known_labels );

		// Add the latest published post as a sample content page.
		$latest_post = get_posts(
			array(
				'numberposts' => 1,
				'post_status' => 'publish',
			)
		);
		if ( ! empty( $latest_post ) ) {
			$this->maybe_add_page_url( $latest_post[0]->ID, $urls, $known_labels );
		}

		// Add a contact page if one exists (by slug convention).
		$contact_page = get_page_by_path( 'contact' );
		if ( ! $contact_page ) {
			$contact_page = get_page_by_path( 'contact-us' );
		}
		if ( $contact_page && 'publish' === $contact_page->post_status ) {
			$this->maybe_add_page_url( $contact_page->ID, $urls, $known_labels );
		}

		$urls = array_unique( $urls );
		$home = trailingslashit( home_url( '/' ) );

		$pages = array();
		foreach ( $urls as $url ) {
			if ( trailingslashit( $url ) === $home ) {
				$label = __( 'Home', 'wpconsent-cookies-banner-privacy-suite' );
			} elseif ( isset( $known_labels[ $url ] ) ) {
				$label = $known_labels[ $url ];
			} else {
				$post_id = url_to_postid( $url );
				$label   = $post_id ? get_the_title( $post_id ) : wp_parse_url( $url, PHP_URL_PATH );
				if ( empty( $label ) ) {
					$label = wp_parse_url( $url, PHP_URL_PATH );
				}
			}

			$pages[] = array(
				'url'   => $url,
				'label' => $label,
			);
		}

		return $pages;
	}

	/**
	 * Build a map of services keyed by service ID, queried once per category.
	 *
	 * @param array $categories Pre-fetched categories.
	 *
	 * @return array Map of service ID to service data including category_id.
	 */
	public function build_service_map( $categories ) {
		$service_map = array();

		foreach ( $categories as $slug => $category ) {
			$services = wpconsent()->cookies->get_services_by_category( $category['id'] );
			foreach ( $services as $service ) {
				$service['category_id']        = $category['id'];
				$service_map[ $service['id'] ] = $service;
			}
		}

		return $service_map;
	}

	/**
	 * AJAX handler to save detected cookies for review in admin.
	 *
	 * @return void
	 */
	public function ajax_save_for_review() {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );
		$this->require_permission();

		// Individual fields are sanitized after json_decode below.
		$cookies_json = isset( $_POST['cookies'] ) ? wp_unslash( $_POST['cookies'] ) : '[]'; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$cookies      = json_decode( $cookies_json, true );

		if ( ! is_array( $cookies ) || empty( $cookies ) ) {
			wp_send_json_error( array(
				'message' => esc_html__( 'No cookies to save.', 'wpconsent-cookies-banner-privacy-suite' ),
			) );
		}

		$sanitized = array();
		foreach ( $cookies as $cookie ) {
			$entry = array(
				'name'         => isset( $cookie['name'] ) ? sanitize_text_field( $cookie['name'] ) : '',
				'value'        => isset( $cookie['value'] ) ? sanitize_text_field( $cookie['value'] ) : '',
				'pages'        => ( isset( $cookie['pages'] ) && is_array( $cookie['pages'] ) ) ? array_map( 'esc_url_raw', $cookie['pages'] ) : array(),
				'consentState' => isset( $cookie['consentState'] ) ? sanitize_text_field( $cookie['consentState'] ) : 'pre-consent',
				'duration'     => isset( $cookie['duration'] ) ? sanitize_text_field( $cookie['duration'] ) : '',
			);

			if ( ! empty( $cookie['suggestedPattern'] ) ) {
				$entry['suggestedPattern'] = sanitize_text_field( $cookie['suggestedPattern'] );
				$entry['scriptUrl']        = ! empty( $cookie['scriptUrl'] ) ? esc_url_raw( $cookie['scriptUrl'] ) : '';
			}

			if ( ! empty( $cookie['inlineScript'] ) ) {
				// Cap at 10kb to prevent bloat from minified scripts.
				$inline               = sanitize_textarea_field( wp_unslash( $cookie['inlineScript'] ) );
				$entry['inlineScript'] = substr( $inline, 0, 10240 );
			}

			$sanitized[] = $entry;
		}

		$pages_count = isset( $_POST['pages_count'] ) ? absint( $_POST['pages_count'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Missing

		update_option( $this->get_pending_option(), array(
			'cookies'     => $sanitized,
			'pages_count' => $pages_count,
		) );

		delete_transient( $this->get_transient_key() );

		wp_send_json_success( array(
			'count'      => count( $sanitized ),
			'review_url' => $this->get_review_url(),
		) );
	}

	/**
	 * AJAX handler to dismiss a pending cookie from the review queue.
	 *
	 * @return void
	 */
	public function ajax_dismiss_cookie() {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );
		$this->require_permission();

		$cookie_name = isset( $_POST['cookie_name'] ) ? sanitize_text_field( wp_unslash( $_POST['cookie_name'] ) ) : '';

		if ( empty( $cookie_name ) ) {
			wp_send_json_error( array(
				'message' => esc_html__( 'Cookie name is required.', 'wpconsent-cookies-banner-privacy-suite' ),
			) );
		}

		$remaining = $this->dismiss_pending_cookie( $cookie_name );

		wp_send_json_success( array(
			'remaining' => $remaining,
		) );
	}

	/**
	 * Remove a cookie from the pending review queue.
	 *
	 * @param string $cookie_name Cookie name to remove.
	 *
	 * @return int Number of remaining pending cookies.
	 */
	protected function dismiss_pending_cookie( $cookie_name ) {
		$option_name = $this->get_pending_option();
		$data        = get_option( $option_name, array() );

		// Support both wrapped structure and legacy flat array.
		if ( isset( $data['cookies'] ) && is_array( $data['cookies'] ) ) {
			$cookies         = array_values( array_filter( $data['cookies'], function ( $cookie ) use ( $cookie_name ) {
				return $cookie_name !== $cookie['name'];
			} ) );
			$data['cookies'] = $cookies;
			update_option( $option_name, $data );
			return count( $cookies );
		}

		// Legacy flat array.
		$pending = array_values( array_filter( is_array( $data ) ? $data : array(), function ( $cookie ) use ( $cookie_name ) {
			return $cookie_name !== $cookie['name'];
		} ) );
		update_option( $option_name, $pending );
		return count( $pending );
	}

	/**
	 * Get pending cookies awaiting review.
	 *
	 * @return array Flat array of cookie entries.
	 */
	public function get_pending_cookies() {
		$data = get_option( $this->get_pending_option(), array() );
		// Handle the wrapped structure introduced in 1.x (legacy data is a flat array).
		if ( isset( $data['cookies'] ) && is_array( $data['cookies'] ) ) {
			return $data['cookies'];
		}
		return is_array( $data ) ? $data : array();
	}

	/**
	 * Get the number of pages inspected in the pending review session.
	 *
	 * @return int
	 */
	public function get_pending_pages_count() {
		$data = get_option( $this->get_pending_option(), array() );
		return isset( $data['pages_count'] ) ? (int) $data['pages_count'] : 0;
	}

	/**
	 * Return the list of cookie name prefixes that WordPress or registered
	 * plugins only set when a user is signed in (e.g. wp-settings-*).
	 *
	 * Exposed via the `wpconsent_inspector_admin_context_cookies` filter so
	 * site owners can extend the list without editing plugin JS.
	 *
	 * @return array List of string prefixes.
	 */
	public function get_admin_context_cookie_prefixes() {
		$defaults = array(
			'wp-settings-',
			'wordpress_logged_in_',
			'wordpress_sec_',
			'wordpress_test_cookie',
		);

		$filtered = apply_filters( 'wpconsent_inspector_admin_context_cookies', $defaults );

		if ( ! is_array( $filtered ) ) {
			_doing_it_wrong(
				'wpconsent_inspector_admin_context_cookies',
				esc_html__( 'Filter must return an array of cookie-name prefixes.', 'wpconsent-cookies-banner-privacy-suite' ),
				'1.1.6'
			);
			return $defaults;
		}

		$clean = array();
		foreach ( $filtered as $prefix ) {
			if ( ! is_scalar( $prefix ) ) {
				continue;
			}
			$prefix = trim( (string) $prefix );
			if ( '' !== $prefix ) {
				$clean[] = $prefix;
			}
		}

		return array_values( array_unique( $clean ) );
	}

	/**
	 * Get all documented cookies for matching.
	 *
	 * @param array $categories Optional. Pre-fetched categories to avoid redundant queries.
	 * @param array $service_map Optional. Pre-built service map from build_service_map().
	 *
	 * @return array
	 */
	public function get_documented_cookies( $categories = null, $service_map = null ) {
		if ( null === $categories ) {
			$categories = wpconsent()->cookies->get_categories();
		}

		if ( null === $service_map ) {
			$service_map = $this->build_service_map( $categories );
		}

		$cookies = array();
		foreach ( $categories as $slug => $category ) {
			$category_cookies = wpconsent()->cookies->get_cookies_by_category( $category['id'] );

			foreach ( $category_cookies as $cookie ) {
				$service_name = '';

				// Resolve service name from the cookie's term assignments.
				if ( ! empty( $cookie['categories'] ) ) {
					foreach ( $cookie['categories'] as $term_id ) {
						if ( isset( $service_map[ $term_id ] ) ) {
							$service_name = $service_map[ $term_id ]['name'];
							break;
						}
					}
				}

				$cookies[] = array(
					'cookie_id' => $cookie['cookie_id'],
					'name'      => $cookie['name'],
					'category'  => $category['name'],
					'slug'      => $slug,
					'service'   => $service_name,
				);
			}
		}

		return $cookies;
	}

	/**
	 * Format categories for JS consumption.
	 *
	 * @param array $categories Pre-fetched categories.
	 *
	 * @return array
	 */
	public function format_categories( $categories ) {
		$list = array();

		foreach ( $categories as $slug => $category ) {
			$list[] = array(
				'id'   => $category['id'],
				'name' => $category['name'],
				'slug' => $slug,
			);
		}

		return $list;
	}

	/**
	 * Format services for JS consumption from a pre-built service map.
	 *
	 * @param array $service_map Pre-built service map from build_service_map().
	 *
	 * @return array
	 */
	public function format_services_from_map( $service_map ) {
		$list = array();

		foreach ( $service_map as $service ) {
			$list[] = array(
				'id'          => $service['id'],
				'name'        => $service['name'],
				'category_id' => $service['category_id'],
			);
		}

		return $list;
	}

	/**
	 * Get categories and services lists for JS. Fetches data once to avoid duplicate queries.
	 *
	 * @return array { categories: array, services: array }
	 */
	public function get_categories_and_services() {
		$categories  = wpconsent()->cookies->get_categories();
		$service_map = $this->build_service_map( $categories );

		return array(
			'categories' => $this->format_categories( $categories ),
			'services'   => $this->format_services_from_map( $service_map ),
		);
	}
}
