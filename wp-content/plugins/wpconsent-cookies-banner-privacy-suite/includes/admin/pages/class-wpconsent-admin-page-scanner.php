<?php
/**
 * Admin paged used for the site scanner.
 *
 * @package WPConsent
 */

/**
 * Class WPConsent_Admin_Page_Cookies.
 */
class WPConsent_Admin_Page_Scanner extends WPConsent_Admin_Page {

	use WPConsent_Services_Upsell;
	use WPConsent_Scan_Pages;

	/**
	 * Page slug.
	 *
	 * @var string
	 */
	public $page_slug = 'wpconsent-scanner';

	/**
	 * Default view.
	 *
	 * @var string
	 */
	public $view = 'scanner';

	/**
	 * Available views.
	 *
	 * @var array
	 */
	public $views = array();

	/**
	 * Scan results.
	 *
	 * @var array
	 */
	protected $scan_results;

	/**
	 * Current action.
	 *
	 * @var string
	 */
	protected $action;

	/**
	 * Call this just to set the page title translatable.
	 */
	public function __construct() {
		$this->page_title = __( 'Website Scanner', 'wpconsent-cookies-banner-privacy-suite' );
		$this->menu_title = __( 'Scanner', 'wpconsent-cookies-banner-privacy-suite' );
		parent::__construct();
	}

	/**
	 * Page specific Hooks.
	 *
	 * @return void
	 */
	public function page_hooks() {
		$this->views = array(
			'scanner'   => __( 'Scanner', 'wpconsent-cookies-banner-privacy-suite' ),
			'inspector' => __( 'Inspector', 'wpconsent-cookies-banner-privacy-suite' ),
			'history'   => __( 'History', 'wpconsent-cookies-banner-privacy-suite' ),
			'settings'  => __( 'Auto Scanning', 'wpconsent-cookies-banner-privacy-suite' ),
		);
	}

	/**
	 * Override the output method to handle upsell for History and Settings views.
	 *
	 * @return void
	 */
	public function output() {
		// For history and settings views, show upsell modal with blurred content.
		if ( 'history' === $this->view || 'settings' === $this->view ) {
			$this->output_header();
			?>
			<div class="wpconsent-content">
				<div class="wpconsent-blur-area">
					<?php
					if ( 'history' === $this->view ) {
						$this->output_view_history();
					} else {
						$this->output_view_settings();
					}
					?>
				</div>
				<?php
				if ( 'history' === $this->view ) {
					echo WPConsent_Admin_page::get_upsell_box( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						esc_html__( 'Scanning History is a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
						'<p>' . esc_html__( 'Upgrade to WPConsent PRO to track all website scans over time. View detected services, monitor changes, and get notified when new services are found on your website.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>',
						array(
							'text' => esc_html__( 'Upgrade to PRO and Unlock "Scanning History"', 'wpconsent-cookies-banner-privacy-suite' ),
							'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'scanner-history-page', 'main' ) ),
						),
						array(
							'text' => esc_html__( 'Learn more about all the features', 'wpconsent-cookies-banner-privacy-suite' ),
							'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'scanner-history-page', 'features' ) ),
						)
					);
				} else {
					echo WPConsent_Admin_page::get_upsell_box( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						esc_html__( 'Scheduled Automatic Scans is a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
						'<p>' . esc_html__( 'Upgrade to WPConsent PRO to automatically update your cookie configuration when new services are detected. Get email notifications and control how long scan history is retained.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>',
						array(
							'text' => esc_html__( 'Upgrade to PRO and Unlock "Scanner Settings"', 'wpconsent-cookies-banner-privacy-suite' ),
							'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'scanner-settings-page', 'main' ) ),
						),
						array(
							'text' => esc_html__( 'Learn more about all the features', 'wpconsent-cookies-banner-privacy-suite' ),
							'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'scanner-settings-page', 'features' ) ),
						)
					);
				}
				?>
			</div>
			<?php
			return;
		}

		// Default behavior for scanner view.
		parent::output();
	}

	/**
	 * Get the scan results in one place.
	 *
	 * @return array
	 */
	protected function get_scan_results() {
		if ( ! isset( $this->scan_results ) ) {
			$this->scan_results = wpconsent()->scanner->get_scan_data();
		}

		return $this->scan_results;
	}

	/**
	 * Output the page content.
	 *
	 * @return void
	 */
	public function output_content() {
		if ( 'inspector' === $this->view ) {
			$this->output_view_inspector();
			return;
		}

		$this->metabox(
			esc_html__( 'Scan Overview', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_scan_overview()
		);

		$scan_data = $this->get_scan_results();

		if ( empty( $scan_data['data']['scripts'] ) ) {
			return;
		}

		$this->metabox(
			__( 'Detailed Report', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_scanner_input(),
			'',
			'wpconsent-scan-detailed-report'
		);
	}

	/**
	 * Output the inspector review view.
	 *
	 * @return void
	 */
	public function output_view_inspector() {
		$pending_cookies = wpconsent()->inspector->get_pending_cookies();
		$data            = wpconsent()->inspector->get_categories_and_services();
		$categories      = $data['categories'];
		$services        = $data['services'];
		$is_active       = wpconsent()->inspector->is_active();
		$cookies_url     = admin_url( 'admin.php?page=wpconsent-cookies' );
		$start_url       = wp_nonce_url(
			admin_url( 'admin-post.php?action=wpconsent_start_inspector' ),
			'wpconsent_start_inspector'
		);

		$title = ! empty( $pending_cookies )
			? esc_html__( 'Review Cookies', 'wpconsent-cookies-banner-privacy-suite' )
				. ' <span class="wpconsent-review-progress-badge" id="wpconsent-review-progress-badge">'
				. '<span id="wpconsent-review-badge-current">1</span> / '
				. count( $pending_cookies )
				. '</span>'
			: esc_html__( 'Cookie Inspector', 'wpconsent-cookies-banner-privacy-suite' );

		$this->metabox(
			$title,
			$this->get_inspector_unified_content( $pending_cookies, $is_active, $start_url, $cookies_url )
		);

		// Output data for the wizard JS (needed when pending cookies exist).
		if ( ! empty( $pending_cookies ) ) {
			?>
			<?php
			$is_pro = class_exists( 'WPConsent_License' );

			// Get existing blocking rules if available (Pro).
			$blocking_rules = array();
			if ( $is_pro && method_exists( wpconsent()->inspector, 'get_blocking_rules' ) ) {
				$blocking_rules = wpconsent()->inspector->get_blocking_rules();
			}
			?>
			<script>
				var wpconsentInspectorReview = <?php echo wp_json_encode( array(
					'cookies'       => $pending_cookies,
					'categories'    => $categories,
					'services'      => $services,
					'blockingRules' => $blocking_rules,
					'isPro'          => $is_pro,
					'pagesInspected' => $this->get_inspector_pages_count(),
					'upgradeUrl'     => wpconsent_utm_url( 'https://wpconsent.com/lite/', 'cookie-inspector', 'script-blocking' ),
					'nonce'         => wp_create_nonce( 'wpconsent_inspector' ),
					'ajaxurl'       => admin_url( 'admin-ajax.php' ),
					'cookiesUrl'    => $cookies_url,
					'startUrl'      => $start_url,
					'i18n'          => array(
						'serviceRequiredForBlocking' => __( 'Please select a service to create a blocking rule, or turn off the Block Script toggle to skip.', 'wpconsent-cookies-banner-privacy-suite' ),
						'none'                       => __( '— No service (category only) —', 'wpconsent-cookies-banner-privacy-suite' ),
						'chooseCategory'             => __( '— Choose Category —', 'wpconsent-cookies-banner-privacy-suite' ),
						'createNewService'           => __( '+ Create new service…', 'wpconsent-cookies-banner-privacy-suite' ),
						'addFromLibrary'             => __( '→ Add from Library', 'wpconsent-cookies-banner-privacy-suite' ),
						'addFromLibraryPro'          => __( '→ Add from Library (PRO)', 'wpconsent-cookies-banner-privacy-suite' ),
						/* translators: %s is the cookie category name. */
						'upgradePrompt'              => __( 'This cookie was loaded before consent. WPConsent Pro can trace some cookies to the script that added them and suggest a custom script blocking rule to prevent the script from loading before consent.', 'wpconsent-cookies-banner-privacy-suite' ),
						/* translators: %s is the blocking rule/service name. */
						'willBeBlocked'              => __( '✓ Will be blocked by the rule you created for %s', 'wpconsent-cookies-banner-privacy-suite' ),
						/* translators: %s is the blocking rule/service name. */
						'alreadyBlocked'             => __( '✓ Already blocked by %s', 'wpconsent-cookies-banner-privacy-suite' ),
						/* translators: %s is the cookie category name. */
						'blockDescription'           => __( 'Prevent this script from running until the visitor consents to %s cookies.', 'wpconsent-cookies-banner-privacy-suite' ),
						'summarySavedOne'            => __( '1 cookie documented', 'wpconsent-cookies-banner-privacy-suite' ),
						/* translators: %s is the number of cookies. */
						'summarySavedMany'           => __( '%s cookies documented', 'wpconsent-cookies-banner-privacy-suite' ),
						'summarySkippedOne'          => __( '1 cookie skipped', 'wpconsent-cookies-banner-privacy-suite' ),
						/* translators: %s is the number of cookies. */
						'summarySkippedMany'         => __( '%s cookies skipped', 'wpconsent-cookies-banner-privacy-suite' ),
						'summaryRulesOne'            => __( '1 blocking rule created', 'wpconsent-cookies-banner-privacy-suite' ),
						/* translators: %s is the number of blocking rules. */
						'summaryRulesMany'           => __( '%s blocking rules created', 'wpconsent-cookies-banner-privacy-suite' ),
						'summaryPagesOne'            => __( '1 page inspected', 'wpconsent-cookies-banner-privacy-suite' ),
						/* translators: %s is the number of pages. */
						'summaryPagesMany'           => __( '%s pages inspected', 'wpconsent-cookies-banner-privacy-suite' ),
						'loadedBeforeConsent'        => __( 'Loaded before consent', 'wpconsent-cookies-banner-privacy-suite' ),
					),
				) ); ?>
			</script>
			<?php

			// Output the new service modal template.
			$this->output_new_service_modal( $categories );

			// Output the service library modal for Pro users.
			if ( $is_pro ) {
				$this->output_service_library_modal();
			}
		}
	}

	/**
	 * Get the unified inspector content based on current state.
	 *
	 * @param array  $pending_cookies Pending cookies.
	 * @param bool   $is_active Whether the inspector is currently running.
	 * @param string $start_url URL to start the inspector.
	 * @param string $cookies_url URL to the cookies settings page.
	 *
	 * @return string
	 */
	public function get_inspector_unified_content( $pending_cookies, $is_active, $start_url, $cookies_url ) {
		ob_start();
		$mode = wpconsent()->inspector->get_inspector_mode();

		if ( ! empty( $pending_cookies ) ) {
			// State: Pending Review -- show the wizard directly.
			$this->render_inspector_wizard( $pending_cookies, $start_url, $cookies_url );
		} elseif ( $is_active ) {
			// State: Active -- inspector is running on the frontend.
			$this->render_inspector_active( $mode );
		} else {
			// State: Ready -- no pending cookies, inspector not running.
			$this->render_inspector_ready( $start_url, $mode );
		}

		return ob_get_clean();
	}

	/**
	 * Render the inspector mode badge with a short explanation.
	 *
	 * @param string $mode Inspector mode: 'optin', 'optout', or 'discovery'.
	 *
	 * @return void
	 */
	protected function render_inspector_mode_badge( $mode ) {
		$labels = array(
			'optin'     => __( 'Opt-in mode', 'wpconsent-cookies-banner-privacy-suite' ),
			'optout'    => __( 'Opt-out mode', 'wpconsent-cookies-banner-privacy-suite' ),
			'discovery' => __( 'Discovery mode', 'wpconsent-cookies-banner-privacy-suite' ),
		);
		$descriptions = array(
			'optin'     => __( 'Scripts are blocked until the visitor consents. Cookies loaded before consent are flagged as violations.', 'wpconsent-cookies-banner-privacy-suite' ),
			'optout'    => __( 'Scripts are allowed by default. Cookies that persist after the visitor rejects consent are flagged as violations.', 'wpconsent-cookies-banner-privacy-suite' ),
			'discovery' => __( 'Script blocking is disabled. The inspector detects cookies but does not verify blocking.', 'wpconsent-cookies-banner-privacy-suite' ),
		);

		$label       = isset( $labels[ $mode ] ) ? $labels[ $mode ] : $labels['optin'];
		$description = isset( $descriptions[ $mode ] ) ? $descriptions[ $mode ] : $descriptions['optin'];
		?>
		<div class="wpconsent-inspector-mode-badge wpconsent-inspector-mode-badge-<?php echo esc_attr( $mode ); ?>">
			<strong><?php echo esc_html( $label ); ?></strong>
			<span><?php echo esc_html( $description ); ?></span>
		</div>
		<?php
	}

	/**
	 * Render the ready state (no pending cookies, inspector not active).
	 *
	 * @param string $start_url URL to start the inspector.
	 * @param string $mode Inspector mode: 'optin', 'optout', or 'discovery'.
	 *
	 * @return void
	 */
	protected function render_inspector_ready( $start_url, $mode = 'optin' ) {
		?>
		<div id="wpconsent-inspector-state-ready">
			<?php $this->render_inspector_mode_badge( $mode ); ?>
			<?php if ( 'discovery' === $mode ) : ?>
				<div class="wpconsent-inspector-notice wpconsent-inspector-notice-warning">
					<p>
						<?php
						printf(
							/* translators: %1$s is an opening link tag, %2$s is a closing link tag. */
							esc_html__( 'Automatic script blocking is currently disabled. The inspector will detect cookies but cannot verify if they are properly blocked before consent. %1$sEnable script blocking%2$s in settings for full compliance testing.', 'wpconsent-cookies-banner-privacy-suite' ),
							'<a href="' . esc_url( admin_url( 'admin.php?page=wpconsent-cookies' ) ) . '">',
							'</a>'
						);
						?>
					</p>
				</div>
			<?php endif; ?>
			<p>
				<?php
				if ( 'optout' === $mode ) {
					esc_html_e( 'The Cookie Inspector opens your site with a floating panel that tracks every cookie in real time. Your cookies are cleared first so you see the site like a new visitor. Browse your pages, reject cookies on the banner to test if scripts are properly blocked, then click "Review Cookies" in the panel to come back here and document them.', 'wpconsent-cookies-banner-privacy-suite' );
				} else {
					esc_html_e( 'The Cookie Inspector opens your site with a floating panel that tracks every cookie in real time. Your cookies are cleared first so you see the site like a new visitor. Browse your pages, accept the consent banner to check what loads before and after consent, then click "Review Cookies" in the panel to come back here and document them.', 'wpconsent-cookies-banner-privacy-suite' );
				}
				?>
			</p>
			<p>
				<?php
				if ( 'optout' === $mode ) {
					esc_html_e( 'For each detected cookie you can set the category, assign a service, and add a description. Cookies that were not blocked after rejection are flagged so you know exactly what needs fixing.', 'wpconsent-cookies-banner-privacy-suite' );
				} elseif ( 'discovery' === $mode ) {
					esc_html_e( 'For each detected cookie you can set the category, assign a service, and add a description. Undocumented cookies are highlighted so you can add them to your cookie database.', 'wpconsent-cookies-banner-privacy-suite' );
				} else {
					esc_html_e( 'For each detected cookie you can set the category, assign a service, and add a description. Cookies that loaded before consent are flagged as violations so you know exactly what needs fixing.', 'wpconsent-cookies-banner-privacy-suite' );
				}
				?>
			</p>
			<?php $this->render_inspector_geolocation_notice(); ?>
			<?php if ( empty( wpconsent()->scanner->get_scan_data() ) ) : ?>
				<div class="wpconsent-inspector-notice wpconsent-inspector-notice-info">
					<p>
						<?php
						printf(
							/* translators: %1$s is an opening link tag, %2$s is a closing link tag. */
							esc_html__( 'We recommend %1$srunning a scan%2$s before using the inspector. Scanning pre-populates your cookie database so the inspector can identify which cookies are already documented.', 'wpconsent-cookies-banner-privacy-suite' ),
							'<a href="' . esc_url( admin_url( 'admin.php?page=wpconsent-scanner' ) ) . '">',
							'</a>'
						);
						?>
					</p>
				</div>
			<?php endif; ?>
			<?php $this->metabox_row_separator(); ?>
			<div class="wpconsent-metabox-form-row">
				<a href="<?php echo esc_url( $start_url ); ?>" class="wpconsent-button wpconsent-button-primary">
					<?php esc_html_e( 'Start Inspector', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</a>
			</div>
			<?php if ( ! class_exists( 'WPConsent_License' ) ) : ?>
				<div class="wpconsent-inspector-upsell">
					<div class="wpconsent-inspector-upsell-text">
						<h4><?php esc_html_e( 'Let WPConsent Pro do the detective work', 'wpconsent-cookies-banner-privacy-suite' ); ?></h4>
						<p>
							<?php esc_html_e( 'The inspector finds your cookies. Pro goes a step further and traces them back to the scripts that created them. That means you can block unwanted scripts in a few clicks, without touching any code.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
						</p>
					</div>
					<div class="wpconsent-inspector-upsell-action">
						<a href="<?php echo esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'cookie-inspector', 'script-blocking' ) ); ?>" class="wpconsent-button wpconsent-button-primary" target="_blank" rel="noopener noreferrer">
							<?php esc_html_e( 'Upgrade to Pro', 'wpconsent-cookies-banner-privacy-suite' ); ?>
						</a>
					</div>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Render the active state (inspector is running on the frontend).
	 *
	 * @param string $mode Inspector mode: 'optin', 'optout', or 'discovery'.
	 *
	 * @return void
	 */
	protected function render_inspector_active( $mode = 'optin' ) {
		?>
		<div id="wpconsent-inspector-state-active">
			<?php $this->render_inspector_mode_badge( $mode ); ?>
			<?php if ( 'discovery' === $mode ) : ?>
				<div class="wpconsent-inspector-notice wpconsent-inspector-notice-warning">
					<p>
						<?php
						printf(
							/* translators: %1$s is an opening link tag, %2$s is a closing link tag. */
							esc_html__( 'Automatic script blocking is disabled. Cookies will load freely regardless of consent. %1$sEnable script blocking%2$s for full compliance testing.', 'wpconsent-cookies-banner-privacy-suite' ),
							'<a href="' . esc_url( admin_url( 'admin.php?page=wpconsent-cookies' ) ) . '">',
							'</a>'
						);
						?>
					</p>
				</div>
			<?php endif; ?>
			<p>
				<?php
				if ( 'optout' === $mode ) {
					esc_html_e( 'The inspector is active on your site. Browse your pages and reject cookies on the banner — cookies loaded before and after rejection are tracked separately. When you\'re done, click "Review Cookies" in the floating panel to come back here and review them.', 'wpconsent-cookies-banner-privacy-suite' );
				} else {
					esc_html_e( 'The inspector is active on your site. Browse your pages and accept the consent banner — cookies loaded before and after consent are tracked separately. When you\'re done, click "Review Cookies" in the floating panel to come back here and review them.', 'wpconsent-cookies-banner-privacy-suite' );
				}
				?>
			</p>
			<?php $this->render_inspector_geolocation_notice(); ?>
			<?php $this->metabox_row_separator(); ?>
			<div class="wpconsent-metabox-form-row">
				<a href="<?php echo esc_url( home_url() ); ?>" class="wpconsent-button wpconsent-button-primary">
					<?php esc_html_e( 'Go to Site', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</a>
			</div>
		</div>
		<?php
	}

	/**
	 * Render the geolocation notice for the inspector.
	 *
	 * Overridden in Pro to show a notice when geolocation rules are configured.
	 *
	 * @return void
	 */
	protected function render_inspector_geolocation_notice() {
		// No-op in lite. Pro overrides this.
	}

	/**
	 * Render the wizard for reviewing pending cookies.
	 *
	 * @param array  $pending_cookies Pending cookies.
	 * @param string $start_url URL to start the inspector.
	 * @param string $cookies_url URL to the cookies settings page.
	 *
	 * @return void
	 */
	protected function render_inspector_wizard( $pending_cookies, $start_url, $cookies_url ) {
		?>
		<!-- Wizard -->
		<div id="wpconsent-inspector-review-wizard">
			<div id="wpconsent-inspector-review-loading">
				<p><?php esc_html_e( 'Loading cookies...', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			</div>
			<div id="wpconsent-inspector-review-form" style="display: none;">
			<div class="wpconsent-review-intro">
				<p>
					<?php
					printf(
						/* translators: %d is the number of cookies pending review. */
						esc_html( _n(
							'%d cookie was detected that is not yet documented in your settings. Review it below.',
							'%d cookies were detected that are not yet documented in your settings. Review them below.',
							count( $pending_cookies ),
							'wpconsent-cookies-banner-privacy-suite'
						) ),
						count( $pending_cookies )
					);
					?>
				</p>
			</div>

			<!-- Cookie name hero with consent state badge. -->
			<div class="wpconsent-review-cookie-hero">
				<span class="wpconsent-review-cookie-hero-label"><?php esc_html_e( 'Cookie Name', 'wpconsent-cookies-banner-privacy-suite' ); ?></span>
				<div class="wpconsent-review-cookie-hero-row">
					<code id="wpconsent-review-cookie-name" class="wpconsent-review-cookie-hero-name"></code>
					<span id="wpconsent-review-consent-badge" class="wpconsent-review-consent-badge" style="display: none;"></span>
				</div>
			</div>

			<div class="wpconsent-review-section-header">
				<h4><?php esc_html_e( 'Detected Information', 'wpconsent-cookies-banner-privacy-suite' ); ?></h4>
				<p><?php esc_html_e( 'Where and how this cookie was found on your site.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			</div>

			<div class="wpconsent-metabox-form-row">
				<div class="wpconsent-metabox-form-row-label">
					<label><?php esc_html_e( 'Detected On', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
				</div>
				<div class="wpconsent-metabox-form-row-input">
					<div id="wpconsent-review-cookie-pages"></div>
				</div>
			</div>

			<div class="wpconsent-metabox-form-row" id="wpconsent-review-source-row" style="display: none;">
				<div class="wpconsent-metabox-form-row-label">
					<label><?php esc_html_e( 'Likely Source', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
				</div>
				<div class="wpconsent-metabox-form-row-input">
					<code id="wpconsent-review-source-pattern"></code>
					<span class="wpconsent-input-area-description" id="wpconsent-review-source-url" style="display: block;"></span>
				</div>
			</div>

			<div class="wpconsent-review-section-header wpconsent-review-section-header--action">
				<h4><?php esc_html_e( 'Cookie Settings', 'wpconsent-cookies-banner-privacy-suite' ); ?></h4>
				<p><?php esc_html_e( 'Assign a category so this cookie is listed in your consent banner and privacy policy.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			</div>

			<div class="wpconsent-metabox-form-row">
				<div class="wpconsent-metabox-form-row-label">
					<label for="wpconsent-review-category"><?php esc_html_e( 'Category', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
				</div>
				<div class="wpconsent-metabox-form-row-input">
					<select id="wpconsent-review-category" class="wpconsent-input-select"></select>
				</div>
			</div>

			<div class="wpconsent-metabox-form-row">
				<div class="wpconsent-metabox-form-row-label">
					<label for="wpconsent-review-service"><?php esc_html_e( 'Service', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
				</div>
				<div class="wpconsent-metabox-form-row-input">
					<select id="wpconsent-review-service" class="wpconsent-input-select"></select>
				</div>
			</div>

			<?php
			$this->metabox_row(
				__( 'Description', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_input_textarea( 'wpconsent-review-description' ),
				'wpconsent-review-description'
			);

			$this->metabox_row(
				__( 'Duration', 'wpconsent-cookies-banner-privacy-suite' ),
				'<input type="text" id="wpconsent-review-duration" name="wpconsent-review-duration" class="wpconsent-input-text" style="max-width: 200px;" placeholder="' . esc_attr__( 'e.g. 2 years', 'wpconsent-cookies-banner-privacy-suite' ) . '">',
				'wpconsent-review-duration'
			);

			?>

			<?php if ( class_exists( 'WPConsent_License' ) ) : ?>
				<!-- Pro: Script Blocking Section (shown/hidden by JS based on trace data) -->
				<div id="wpconsent-review-blocking-section" style="display: none;">
					<div class="wpconsent-review-section-header wpconsent-review-section-header--action">
						<h4><?php esc_html_e( 'Script Blocking', 'wpconsent-cookies-banner-privacy-suite' ); ?></h4>
						<p><?php esc_html_e( 'Control when this script is allowed to run.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
					</div>
					<div id="wpconsent-review-already-blocked" style="display: none;">
						<div class="wpconsent-metabox-form-row">
							<div class="wpconsent-metabox-form-row-label">
								<label><?php esc_html_e( 'Script Blocking', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
							</div>
							<div class="wpconsent-metabox-form-row-input">
								<p id="wpconsent-review-blocked-message" style="color: var(--wpconsent-color-green); margin: 0;"></p>
							</div>
						</div>
					</div>

					<div id="wpconsent-review-create-rule" style="display: none;">
						<div class="wpconsent-metabox-form-row">
							<div class="wpconsent-metabox-form-row-label">
								<label for="wpconsent-review-block-toggle"><?php esc_html_e( 'Block Script', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
							</div>
							<div class="wpconsent-metabox-form-row-input">
								<label class="wpconsent-checkbox-toggle">
									<input type="checkbox" id="wpconsent-review-block-toggle" checked>
									<span class="wpconsent-checkbox-toggle-slider"></span>
								</label>
								<p class="description" id="wpconsent-review-block-description"></p>
							</div>
						</div>

						<div id="wpconsent-review-blocking-fields">
							<div class="wpconsent-metabox-form-row">
								<div class="wpconsent-metabox-form-row-label">
									<label for="wpconsent-review-script-tag"><?php esc_html_e( 'Script Tag', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
								</div>
								<div class="wpconsent-metabox-form-row-input">
									<input type="text" id="wpconsent-review-script-tag" class="wpconsent-input-text" placeholder="<?php esc_attr_e( 'e.g. connect.facebook.net/en_US/fbevents.js', 'wpconsent-cookies-banner-privacy-suite' ); ?>">
									<p class="description"><?php esc_html_e( 'Enter a unique string that identifies the script to block.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
								</div>
							</div>
							<div class="wpconsent-metabox-form-row">
								<div class="wpconsent-metabox-form-row-label">
									<label for="wpconsent-review-script-keywords"><?php esc_html_e( 'Script Keywords (optional)', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
								</div>
								<div class="wpconsent-metabox-form-row-input">
									<input type="text" id="wpconsent-review-script-keywords" class="wpconsent-input-text" placeholder="<?php esc_attr_e( 'e.g. fbq, fbq.push', 'wpconsent-cookies-banner-privacy-suite' ); ?>">
									<p class="description"><?php esc_html_e( 'JavaScript function names to block (comma separated).', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
								</div>
							</div>
						</div>

						<!-- Inline Script Source (Pro, shown when inlineScript data exists) -->
						<div id="wpconsent-review-inline-script-section" style="display: none;">
							<div class="wpconsent-metabox-form-row">
								<div class="wpconsent-metabox-form-row-label">
									<label><?php esc_html_e( 'Inline Script', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
								</div>
								<div class="wpconsent-metabox-form-row-input">
									<p class="wpconsent-input-area-description"><?php esc_html_e( 'This cookie was set by the inline script below. Click an identifier to add it as a Script Keyword for blocking.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
									<pre class="wpconsent-inline-script-block" id="wpconsent-review-inline-script-code"></pre>
								</div>
							</div>
						</div>

					</div>

				</div>
			<?php else : ?>
				<!-- Lite: Blurred Pro blocking preview with upgrade prompt. -->
				<div id="wpconsent-review-upgrade-prompt" style="display: none;">
					<div class="wpconsent-review-section-header wpconsent-review-section-header--action">
						<h4><?php esc_html_e( 'Script Blocking', 'wpconsent-cookies-banner-privacy-suite' ); ?></h4>
						<p><?php esc_html_e( 'Control when this script is allowed to run.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
					</div>
					<div class="wpconsent-review-pro-preview">
						<div class="wpconsent-review-pro-preview-fields">
							<div class="wpconsent-metabox-form-row">
								<div class="wpconsent-metabox-form-row-label">
									<label><?php esc_html_e( 'Block Script', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
								</div>
								<div class="wpconsent-metabox-form-row-input">
									<label class="wpconsent-checkbox-toggle">
										<input type="checkbox" checked disabled>
										<span class="wpconsent-checkbox-toggle-slider"></span>
									</label>
								</div>
							</div>
							<div class="wpconsent-metabox-form-row">
								<div class="wpconsent-metabox-form-row-label">
									<label><?php esc_html_e( 'Script Tag', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
								</div>
								<div class="wpconsent-metabox-form-row-input">
									<input type="text" class="wpconsent-input-text" value="connect.facebook.net/en_US/fbevents.js" disabled>
								</div>
							</div>
							<div class="wpconsent-metabox-form-row">
								<div class="wpconsent-metabox-form-row-label">
									<label><?php esc_html_e( 'Script Keywords', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
								</div>
								<div class="wpconsent-metabox-form-row-input">
									<input type="text" class="wpconsent-input-text" value="fbq, fbq.push" disabled>
								</div>
							</div>
						</div>
						<div class="wpconsent-review-pro-preview-overlay">
							<div class="wpconsent-inspector-upsell">
								<div class="wpconsent-inspector-upsell-text">
									<h4><?php esc_html_e( 'Custom script blocking available with WPConsent Pro.', 'wpconsent-cookies-banner-privacy-suite' ); ?></h4>
									<p id="wpconsent-review-upgrade-message"></p>
								</div>
								<div class="wpconsent-inspector-upsell-action">
									<a href="<?php echo esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'cookie-inspector', 'script-blocking' ) ); ?>" class="wpconsent-button wpconsent-button-primary" target="_blank" rel="noopener noreferrer">
										<?php esc_html_e( 'Upgrade to Pro', 'wpconsent-cookies-banner-privacy-suite' ); ?>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			<?php endif; ?>

			<div class="wpconsent-review-actions">
				<button type="button" class="wpconsent-button wpconsent-button-primary" id="wpconsent-review-save"><?php esc_html_e( 'Save & Next', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
				<button type="button" class="wpconsent-button wpconsent-button-text" id="wpconsent-review-skip"><?php esc_html_e( 'Skip — I\'ll handle this later', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
			</div>
			</div><!-- /#wpconsent-inspector-review-form -->
		</div>

		<!-- Complete state (shown by JS after all cookies reviewed) -->
		<div id="wpconsent-inspector-review-complete" style="display:none;">
			<p><?php esc_html_e( 'Review complete!', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			<div id="wpconsent-inspector-review-summary" class="wpconsent-inspector-review-summary"></div>
			<?php $this->metabox_row_separator(); ?>
			<div class="wpconsent-metabox-form-row" style="gap: 8px;">
				<a href="<?php echo esc_url( $cookies_url ); ?>" class="wpconsent-button wpconsent-button-primary">
					<?php esc_html_e( 'Go to Cookie Settings', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</a>
				<a href="<?php echo esc_url( $start_url ); ?>" class="wpconsent-button wpconsent-button-secondary">
					<?php esc_html_e( 'Run Another Inspection', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</a>
			</div>
		</div>
		<?php
	}

	/**
	 * Output the new service modal template.
	 *
	 * @param array $categories Available categories.
	 *
	 * @return void
	 */
	protected function output_new_service_modal( $categories ) {
		?>
		<div class="wpconsent-modal" id="wpconsent-modal-inspector-service">
			<div class="wpconsent-modal-inner">
				<form action="">
					<div class="wpconsent-modal-header">
						<h2><?php esc_html_e( 'Add New Service', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
						<button class="wpconsent-modal-close wpconsent-button wpconsent-button-just-icon" type="button">
							<span class="dashicons dashicons-no-alt"></span>
						</button>
					</div>
					<div class="wpconsent-modal-content">
						<div class="wpconsent-metabox-form-row">
							<div class="wpconsent-metabox-form-row-label">
								<label for="inspector_service_category"><?php esc_html_e( 'Category', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
							</div>
							<div class="wpconsent-metabox-form-row-input">
								<select id="inspector_service_category" name="service_category" class="wpconsent-input-select">
									<?php foreach ( $categories as $cat ) : ?>
										<option value="<?php echo esc_attr( $cat['id'] ); ?>"><?php echo esc_html( $cat['name'] ); ?></option>
									<?php endforeach; ?>
								</select>
							</div>
						</div>
						<div class="wpconsent-metabox-form-row">
							<div class="wpconsent-metabox-form-row-label">
								<label for="inspector_service_name"><?php esc_html_e( 'Service Name', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
							</div>
							<div class="wpconsent-metabox-form-row-input">
								<input type="text" id="inspector_service_name" name="service_name" class="wpconsent-input-text" required>
							</div>
						</div>
						<div class="wpconsent-metabox-form-row">
							<div class="wpconsent-metabox-form-row-label">
								<label for="inspector_service_description"><?php esc_html_e( 'Description', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
							</div>
							<div class="wpconsent-metabox-form-row-input">
								<textarea id="inspector_service_description" name="service_description" class="wpconsent-input-textarea"></textarea>
							</div>
						</div>
						<div class="wpconsent-metabox-form-row">
							<div class="wpconsent-metabox-form-row-label">
								<label for="inspector_service_url"><?php esc_html_e( 'Privacy Policy URL', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
							</div>
							<div class="wpconsent-metabox-form-row-input">
								<input type="text" id="inspector_service_url" name="service_url" class="wpconsent-input-text" placeholder="https://">
							</div>
						</div>
						<div class="wpconsent-modal-buttons">
							<button class="wpconsent-button wpconsent-button-primary" type="submit"><?php esc_html_e( 'Save', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
							<button class="wpconsent-button wpconsent-button-secondary" type="button"><?php esc_html_e( 'Cancel', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
						</div>
					</div>
					<input type="hidden" name="action" value="wpconsent_manage_service">
					<input type="hidden" name="post_id" value="">
					<?php wp_nonce_field( 'wpconsent_manage_service', 'wpconsent_manage_service_nonce' ); ?>
				</form>
			</div>
		</div>
		<?php
	}

	/**
	 * Output the service library modal HTML for the inspector page.
	 *
	 * @return void
	 */
	protected function output_service_library_modal() {
		?>
		<div class="wpconsent-modal" id="wpconsent-modal-add-service-from-library">
			<div class="wpconsent-modal-inner">
				<div class="wpconsent-modal-header">
					<h2><?php esc_html_e( 'Add Service From Library', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
					<button class="wpconsent-modal-close wpconsent-button wpconsent-button-just-icon" type="button">
						<span class="dashicons dashicons-no-alt"></span>
					</button>
				</div>
				<div class="wpconsent-modal-content">
					<div class="wpconsent-service-library-search">
						<input type="text"
							   class="wpconsent-input-text"
							   id="wpconsent-service-library-search"
							   placeholder="<?php esc_attr_e( 'Search services...', 'wpconsent-cookies-banner-privacy-suite' ); ?>"
						>
					</div>
					<div class="wpconsent-service-library-list">
						<div class="wpconsent-service-library-loading">
							<?php esc_html_e( 'Loading services...', 'wpconsent-cookies-banner-privacy-suite' ); ?>
						</div>
						<div class="wpconsent-service-library-items">
						</div>
					</div>
					<div class="wpconsent-modal-buttons">
						<button class="wpconsent-button wpconsent-button-secondary" type="button">
							<?php esc_html_e( 'Cancel', 'wpconsent-cookies-banner-privacy-suite' ); ?>
						</button>
					</div>
				</div>
				<input type="hidden" name="action" value="wpconsent_add_service_from_library">
				<input type="hidden" name="category_id" value="">
			</div>
		</div>
		<?php
	}

	/**
	 * Get the number of pages inspected in the current pending review session.
	 *
	 * @return int
	 */
	protected function get_inspector_pages_count() {
		return wpconsent()->inspector->get_pending_pages_count();
	}

	/**
	 * Get the markup for the scanner.
	 *
	 * @return string
	 */
	public function get_scanner_input() {
		$previous_scan = $this->get_scan_results();
		$categories    = wpconsent()->cookies->get_categories();
		if ( ! empty( $previous_scan ) ) {
			$previous_data = $previous_scan['data'];
		}
		ob_start();
		?>
		<form action="" id="wpconsent-scanner-form">
			<p>
				<?php esc_html_e( 'Below you can see a list of scripts and integrations detected on your website that use cookies and that WPConsent can automatically detect. We recommend adding cookie information for all of them. Once added, you can edit the details on the settings page.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
			</p>
			<?php
			if ( ! empty( $previous_data['scripts'] ) ) {
				foreach ( $previous_data['scripts'] as $category => $services ) {
					?>
					<h3><?php echo esc_html( $categories[ $category ]['name'] ); ?></h3>
					<div class="wpconsent-onboarding-selectable-list">
						<?php
						foreach ( $services as $service ) {
							$this->get_scan_service_template( $service );
						}
						?>
					</div>
					<?php
				}
			}
			?>
			<div class="<?php echo empty( $previous_data ) ? 'wpconsent-hidden' : ''; ?>" id="wpconsent-after-scan">
				<?php $this->services_upsell_box( 'scanner' ); ?>
				<label class="wpconsent-inline-styled-checkbox">
						<span class="wpconsent-styled-checkbox <?php echo wpconsent()->settings->get_option( 'enable_script_blocking', 1 ) ? 'checked' : ''; ?>">
							<input type="checkbox" name="script_blocking" <?php checked( wpconsent()->settings->get_option( 'enable_script_blocking', 1 ) ); ?>/>
						</span>
					<?php
					printf(
					// translators: %1$s is an opening link tag, %2$s is a closing link tag.
						esc_html__( 'Prevent known scripts from adding cookies before consent is given. %1$sLearn More%2$s', 'wpconsent-cookies-banner-privacy-suite' ),
						'<a target="_blank" rel="noopener noreferrer" href="' . esc_url( wpconsent_utm_url( 'https://wpconsent.com/docs/automatic-script-blocking', 'onboarding', 'scripb-blocking' ) ) . '">',
						'</a>'
					);
					?>
				</label>
				<div id="wpconsent-scanner-actions" class="wpconsent-metabox-form-row">
					<button class="wpconsent-button wpconsent-button-primary" id="wpconsent-save-scanner"><?php esc_html_e( 'Automatically Configure Cookies', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
				</div>
			</div>
			<input type="hidden" name="action" value="wpconsent_auto_configure"/>
			<?php wp_nonce_field( 'wpconsent_scan_website', 'wpconsent_scan_website_nonce' ); ?>
		</form>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the markup for a scanner service.
	 *
	 * @param array $data Service data.
	 *
	 * @return void
	 */
	public function get_scan_service_template( $data ) {
		?>
		<div class="wpconsent-onboarding-selectable-item wpconsent-show-hidden-container">
			<div class="wpconsent-onboarding-service-logo">
				<img src="<?php echo esc_url( $data['logo'] ); ?>" alt="<?php echo esc_attr( $data['service'] ); ?>"/>
			</div>
			<div class="wpconsent-onboarding-service-info">
				<h3><?php echo esc_html( $data['service'] ); ?></h3>
				<p><?php echo esc_html( $data['description'] ); ?></p>
				<div class="wpconsent-service-info-buttons">
					<?php if ( ! empty( $data['url'] ) ) { ?>
						<a href="<?php echo esc_url( $data['url'] ); ?>" class="wpconsent-button wpconsent-button-text" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Service URL', 'wpconsent-cookies-banner-privacy-suite' ); ?></a>
					<?php } ?>
					<?php if ( ! empty( $data['cookies'] ) ) { ?>
						<button type="button" class="wpconsent-button wpconsent-button-text wpconsent-show-hidden" data-target=".wpconsent-scanner-service-cookies-list" data-hide-label="<?php esc_attr_e( 'Hide Cookies', 'wpconsent-cookies-banner-privacy-suite' ); ?>"><?php esc_html_e( 'View Cookies', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
					<?php } ?>
					<?php if ( ! empty( $data['html'] ) ) { ?>
						<button type="button" class="wpconsent-button wpconsent-button-text wpconsent-show-hidden" data-target=".wpconsent-script-preview" data-hide-label="<?php esc_attr_e( 'Hide Script', 'wpconsent-cookies-banner-privacy-suite' ); ?>"><?php esc_html_e( 'View Script', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
					<?php } ?>
				</div>
				<?php if ( ! empty( $data['cookies'] ) ) { ?>
					<ul class="wpconsent-scanner-service-cookies-list wpconsent-hidden-preview">
						<?php foreach ( $data['cookies'] as $cookie => $cookie_data ) { ?>
							<li><?php echo esc_html( $cookie ); ?></li>
						<?php } ?>
					</ul>
				<?php } ?>
				<?php if ( ! empty( $data['html'] ) ) { ?>
					<pre class="wpconsent-script-preview wpconsent-hidden-preview"><?php echo esc_html( $data['html'] ); ?></pre>
				<?php } ?>
			</div>
			<div class="wpconsent-onboarding-service-checkbox">
				<label>
					<span class="wpconsent-styled-checkbox checked">
						<input type="checkbox" name="scanner_service[]" value="<?php echo esc_attr( $data['name'] ); ?>" checked/>
					</span>
				</label>
			</div>
		</div>
		<?php
	}

	/**
	 * Returns the scan overview markup.
	 *
	 * @return string
	 */
	public function get_scan_overview() {
		$scan_results = $this->get_scan_results();

		if ( ! empty( $scan_results ) ) {
			$scripts            = $scan_results['data']['scripts'];
			$last_ran_timestamp = $scan_results['date'];

			$scripts_count = 0;
			$cookies_count = 0;
			foreach ( $scripts as $category => $services ) {
				$scripts_count += count( $services );
				foreach ( $services as $service ) {
					$cookies_count += count( $service['cookies'] );
				}
			}
			$next_scheduled_scan = esc_html__( 'Not Scheduled', 'wpconsent-cookies-banner-privacy-suite' );
			if ( wpconsent()->settings->get_option( 'auto_scanner', 0 ) ) {
				$interval            = wpconsent()->settings->get_option( 'auto_scanner_interval', 1 );
				$last_ran            = wpconsent()->settings->get_option( 'auto_scanner_last_ran', 0 );
				$next_scheduled_scan = date_i18n( get_option( 'date_format' ), strtotime( "+{$interval} days", $last_ran ) );
			}

			$stats_to_show = array(
				array(
					'label' => __( 'Services Detected', 'wpconsent-cookies-banner-privacy-suite' ),
					'value' => $scripts_count,
				),
				array(
					'label' => __( 'Cookies In Use', 'wpconsent-cookies-banner-privacy-suite' ),
					'value' => $cookies_count,
				),
				array(
					'label' => __( 'Last Successful Scan', 'wpconsent-cookies-banner-privacy-suite' ),
					'value' => date_i18n( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( $last_ran_timestamp ) ),
				),
				array(
					'label' => __( 'Cookies Configured', 'wpconsent-cookies-banner-privacy-suite' ),
					'value' => isset( $scan_results['configured'] ),
				),
				array(
					'label' => __( 'Next Scheduled Scan', 'wpconsent-cookies-banner-privacy-suite' ),
					'value' => $next_scheduled_scan,
				),
			);
		}
		ob_start();
		if ( ! empty( $stats_to_show ) ) {
			?>
			<div class="wpconsent-scan-overview">
				<?php foreach ( $stats_to_show as $stat ) { ?>
					<div class="wpconsent-scan-overview-stat">
						<h3><?php echo esc_html( $stat['label'] ); ?></h3>
						<p>
							<?php if ( is_bool( $stat['value'] ) ) { ?>
								<span class="wpconsent-faux-checkbox <?php echo $stat['value'] ? esc_attr( 'wpconsent-checked' ) : ''; ?>"></span>
							<?php } else { ?>
								<?php echo esc_html( $stat['value'] ); ?>
							<?php } ?></p>
					</div>
				<?php } ?>
			</div>
		<?php } ?>

		<?php
		$this->metabox_row_separator();
		echo $this->get_manual_scan_input();  // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		?>

		<div class="wpconsent-metabox-form-row">
			<button id="wpconsent-start-scanner" class="wpconsent-button wpconsent-button-primary" type="button" data-action="reload"><?php esc_html_e( 'Scan Your Website', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
		</div>
		<p class="wpconsent-disclaimer">
			<?php
			printf(
			// translators: %1$s is an opening link tag, %2$s is a closing link tag, %3$s is an opening link tag.
				esc_html__( 'Please Note: By continuing with the website scan, you agree to send website data to our API for processing. This data is utilized to improve scanning accuracy and provide updated service and cookie descriptions. For details, please review our %1$sPrivacy Policy%2$s and %3$sTerms of Service%2$s.', 'wpconsent-cookies-banner-privacy-suite' ),
				'<a href="' . esc_url( wpconsent_utm_url( 'https://wpconsent.com/privacy-policy/', 'onboarding', 'privacy-policy' ) ) . '" target="_blank" rel="noopener noreferrer">',
				'</a>',
				'<a href="' . esc_url( wpconsent_utm_url( 'https://wpconsent.com/terms/', 'onboarding', 'terms-of-service' ) ) . '" target="_blank" rel="noopener noreferrer">'
			);
			?>
		</p>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the markup for the manual scan input.
	 *
	 * @return string
	 */
	public function get_manual_scan_input() {
		// Auto-populate important pages.
		$this->auto_populate_important_pages();

		ob_start();
		$selected_content_ids = wpconsent()->settings->get_option( 'manual_scan_pages', array() );

		$pages_args = array(
			'number'  => 20,
			'orderby' => 'title',
			'order'   => 'ASC',
		);
		if ( ! empty( $selected_content_ids ) ) {
			$pages_args['exclude'] = $selected_content_ids; // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude -- Excludes already-selected scan targets from a 20-item admin dropdown.
		}
		// Let's pre-load 20 pages.
		$pages = get_pages( $pages_args );
		?>
		<div class="wpconsent-manual-scan-description">
			<h3><?php esc_html_e( 'Select content to scan:', 'wpconsent-cookies-banner-privacy-suite' ); ?></h3>
		</div>
		<div class="wpconsent-manual-scan-row">
			<div class="wpconsent-inline-select-group">
				<select id="manual-scanner-page" name="manual_scanner_page" class="wpconsent-choices wpconsent-page-search" data-placeholder="<?php esc_attr_e( 'Search for a post/page...', 'wpconsent-cookies-banner-privacy-suite' ); ?>" data-search="true" data-ajax-action="wpconsent_search_content" data-ajax="true">
					<option value="0"><?php esc_html_e( 'Choose Page', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
					<?php
					foreach ( $pages as $page ) {
						?>
						<option value="<?php echo esc_attr( $page->ID ); ?>" data-url="<?php echo esc_url( get_permalink( $page->ID ) ); ?>">
							<?php printf( '%1$s (#%2$d)', esc_html( $page->post_title ), esc_attr( $page->ID ) ); ?>
						</option>
						<?php
					}
					?>
				</select>
			</div>
			<div class="wpconsent-scanner-selected-items-container">
				<!-- Homepage always scanned -->
				<div class="wpconsent-scanner-selected-item homepage" id="scanner-item-home">
					<div class="wpconsent-scanner-selected-item-info">
						<h3><?php esc_html_e( 'Home Page', 'wpconsent-cookies-banner-privacy-suite' ); ?></h3>
						<p><?php esc_html_e( 'Always Scanned', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
					</div>
				</div>
				<?php
				// Load saved selections.
				if ( ! empty( $selected_content_ids ) ) {
					foreach ( $selected_content_ids as $page_id ) {
						$page = get_post( $page_id );
						if ( $page ) {
							?>
							<div class="wpconsent-scanner-selected-item" id="scanner-item-<?php echo esc_attr( $page->ID ); ?>">
								<div class="wpconsent-scanner-selected-item-info">
									<h3><?php printf( '%1$s (#%2$d)', esc_html( $page->post_title ), esc_attr( $page->ID ) ); ?></h3>
									<a href="<?php echo esc_url( get_permalink( $page->ID ) ); ?>" target="_blank" rel="noopener noreferrer">
										<?php echo esc_html( wp_parse_url( get_permalink( $page->ID ), PHP_URL_PATH ) ); ?>
									</a>
								</div>
								<button type="button" class="wpconsent-remove-item" data-id="<?php echo esc_attr( $page->ID ); ?>">
									<span class="dashicons dashicons-no-alt"></span>
								</button>
								<input type="hidden" name="scanner_items[]" value="<?php echo esc_attr( $page->ID ); ?>">
							</div>
							<?php
						}
					}
				}
				?>
			</div>
		</div>

		<?php
		return ob_get_clean();
	}

	/**
	 * Output the history view with dummy data.
	 *
	 * @return void
	 */
	protected function output_view_history() {
		$dummy_history = $this->get_dummy_scan_history();
		ob_start();
		?>
		<div class="wpconsent-scan-history-table">
		<p><?php esc_html_e( 'View the history of all website scans. Track new services detected over time and monitor changes to your website\'s cookie usage.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
		<div class="tablenav top">
			<div class="actions alignleft">
				<button type="button" class="button"><?php esc_html_e( 'Export CSV', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
			</div>
			<div class="tablenav-pages">
				<span class="displaying-num"><?php echo esc_html( count( $dummy_history ) . ' ' . __( 'items', 'wpconsent-cookies-banner-privacy-suite' ) ); ?></span>
			</div>
		</div>
		<table class="wp-list-table widefat fixed striped">
			<thead>
				<tr>
					<th scope="col" class="column-scan_date"><?php esc_html_e( 'Scan Date', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
					<th scope="col" class="column-services_detected"><?php esc_html_e( 'Services Detected', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
					<th scope="col" class="column-new_services_count"><?php esc_html_e( 'New Services', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
					<th scope="col" class="column-removed_services_count"><?php esc_html_e( 'Removed Services', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
					<th scope="col" class="column-status"><?php esc_html_e( 'Status', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
					<th scope="col" class="column-actions"><?php esc_html_e( 'Actions', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $dummy_history as $item ) : ?>
					<tr>
						<td class="column-scan_date"><?php echo esc_html( $item['scan_date'] ); ?></td>
						<td class="column-services_detected"><?php echo esc_html( $item['services_detected'] ); ?></td>
						<td class="column-new_services_count">
							<?php if ( $item['new_services'] > 0 ) : ?>
								<span class="wpconsent-badge wpconsent-badge-new"><?php echo esc_html( $item['new_services'] ); ?></span>
							<?php else : ?>
								<?php echo esc_html( $item['new_services'] ); ?>
							<?php endif; ?>
						</td>
						<td class="column-removed_services_count">
							<?php if ( $item['removed_services'] > 0 ) : ?>
								<span class="wpconsent-badge wpconsent-badge-removed"><?php echo esc_html( $item['removed_services'] ); ?></span>
							<?php else : ?>
								<?php echo esc_html( $item['removed_services'] ); ?>
							<?php endif; ?>
						</td>
						<td class="column-status">
							<?php foreach ( $item['status'] as $status ) : ?>
								<span class="wpconsent-badge wpconsent-badge-<?php echo esc_attr( $status['class'] ); ?>"><?php echo esc_html( $status['label'] ); ?></span>
							<?php endforeach; ?>
						</td>
						<td class="column-actions">
							<div class="wpconsent-scan-history-actions">
								<button type="button" class="wpconsent-button wpconsent-button-primary"><?php esc_html_e( 'View Details', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
								<button type="button" class="wpconsent-button wpconsent-button-secondary"><?php esc_html_e( 'Delete', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
							</div>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
			<tfoot>
				<tr>
					<th scope="col" class="column-scan_date"><?php esc_html_e( 'Scan Date', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
					<th scope="col" class="column-services_detected"><?php esc_html_e( 'Services Detected', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
					<th scope="col" class="column-new_services_count"><?php esc_html_e( 'New Services', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
					<th scope="col" class="column-removed_services_count"><?php esc_html_e( 'Removed Services', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
					<th scope="col" class="column-status"><?php esc_html_e( 'Status', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
					<th scope="col" class="column-actions"><?php esc_html_e( 'Actions', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				</tr>
			</tfoot>
		</table>
		</div>
		<?php
		$content = ob_get_clean();

		$this->metabox(
			esc_html__( 'Scan History', 'wpconsent-cookies-banner-privacy-suite' ),
			$content
		);
	}

	/**
	 * Get dummy scan history data.
	 *
	 * @return array
	 */
	protected function get_dummy_scan_history() {
		return array(
			array(
				'scan_date'         => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( '-1 day' ) ),
				'services_detected' => 8,
				'new_services'      => 2,
				'removed_services'  => 0,
				'status'            => array(
					array(
						'class' => 'auto-updated',
						'label' => __( 'Auto-Updated', 'wpconsent-cookies-banner-privacy-suite' ),
					),
					array(
						'class' => 'email-sent',
						'label' => __( 'Email Sent', 'wpconsent-cookies-banner-privacy-suite' ),
					),
				),
			),
			array(
				'scan_date'         => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( '-8 days' ) ),
				'services_detected' => 6,
				'new_services'      => 1,
				'removed_services'  => 0,
				'status'            => array(
					array(
						'class' => 'auto-updated',
						'label' => __( 'Auto-Updated', 'wpconsent-cookies-banner-privacy-suite' ),
					),
				),
			),
			array(
				'scan_date'         => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( '-15 days' ) ),
				'services_detected' => 5,
				'new_services'      => 0,
				'removed_services'  => 1,
				'status'            => array(
					array(
						'class' => 'neutral',
						'label' => __( 'Completed', 'wpconsent-cookies-banner-privacy-suite' ),
					),
				),
			),
			array(
				'scan_date'         => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( '-22 days' ) ),
				'services_detected' => 6,
				'new_services'      => 0,
				'removed_services'  => 0,
				'status'            => array(
					array(
						'class' => 'neutral',
						'label' => __( 'Completed', 'wpconsent-cookies-banner-privacy-suite' ),
					),
				),
			),
			array(
				'scan_date'         => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( '-29 days' ) ),
				'services_detected' => 6,
				'new_services'      => 1,
				'removed_services'  => 0,
				'status'            => array(
					array(
						'class' => 'auto-updated',
						'label' => __( 'Auto-Updated', 'wpconsent-cookies-banner-privacy-suite' ),
					),
					array(
						'class' => 'email-sent',
						'label' => __( 'Email Sent', 'wpconsent-cookies-banner-privacy-suite' ),
					),
				),
			),
			array(
				'scan_date'         => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( '-36 days' ) ),
				'services_detected' => 5,
				'new_services'      => 0,
				'removed_services'  => 0,
				'status'            => array(
					array(
						'class' => 'neutral',
						'label' => __( 'Completed', 'wpconsent-cookies-banner-privacy-suite' ),
					),
				),
			),
			array(
				'scan_date'         => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( '-43 days' ) ),
				'services_detected' => 5,
				'new_services'      => 2,
				'removed_services'  => 0,
				'status'            => array(
					array(
						'class' => 'auto-updated',
						'label' => __( 'Auto-Updated', 'wpconsent-cookies-banner-privacy-suite' ),
					),
				),
			),
			array(
				'scan_date'         => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( '-50 days' ) ),
				'services_detected' => 3,
				'new_services'      => 0,
				'removed_services'  => 1,
				'status'            => array(
					array(
						'class' => 'email-sent',
						'label' => __( 'Email Sent', 'wpconsent-cookies-banner-privacy-suite' ),
					),
				),
			),
			array(
				'scan_date'         => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( '-57 days' ) ),
				'services_detected' => 4,
				'new_services'      => 1,
				'removed_services'  => 0,
				'status'            => array(
					array(
						'class' => 'auto-updated',
						'label' => __( 'Auto-Updated', 'wpconsent-cookies-banner-privacy-suite' ),
					),
				),
			),
			array(
				'scan_date'         => wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( '-64 days' ) ),
				'services_detected' => 3,
				'new_services'      => 0,
				'removed_services'  => 0,
				'status'            => array(
					array(
						'class' => 'neutral',
						'label' => __( 'Completed', 'wpconsent-cookies-banner-privacy-suite' ),
					),
				),
			),
		);
	}

	/**
	 * Output the settings view with dummy data.
	 *
	 * @return void
	 */
	protected function output_view_settings() {
		ob_start();
		?>
		<form method="post" action="">
			<!-- Auto Scanning -->
			<div class="wpconsent-metabox-form-row">
				<div class="wpconsent-metabox-form-row-label">
					<label for="auto_scanner"><?php esc_html_e( 'Auto Scanning', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
				</div>
				<div class="wpconsent-metabox-form-row-input">
					<label class="wpconsent-checkbox-toggle">
						<input type="checkbox" name="auto_scanner" id="auto_scanner" value="1" checked disabled />
						<span class="wpconsent-checkbox-toggle-slider"></span>
					</label>
					<p class="description"><?php esc_html_e( 'Automatically scan your website in the background to detect services that may track your visitors.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
				</div>
			</div>

			<?php $this->metabox_row_separator(); ?>

			<!-- Scan Interval -->
			<div class="wpconsent-metabox-form-row">
				<div class="wpconsent-metabox-form-row-label">
					<label for="auto_scanner_interval"><?php esc_html_e( 'Scan Interval', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
				</div>
				<div class="wpconsent-metabox-form-row-input">
					<select name="auto_scanner_interval" id="auto_scanner_interval" class="wpconsent-select" disabled>
						<option value="1" selected><?php esc_html_e( 'Daily', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
						<option value="7"><?php esc_html_e( 'Weekly', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
						<option value="30"><?php esc_html_e( 'Monthly', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
					</select>
					<p class="description"><?php esc_html_e( 'Choose how often to automatically scan your website for tracking services.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
				</div>
			</div>

			<?php $this->metabox_row_separator(); ?>

			<!-- Auto-Update Services -->
			<div class="wpconsent-metabox-form-row">
				<div class="wpconsent-metabox-form-row-label">
					<label for="scanner_auto_update"><?php esc_html_e( 'Auto-Update Services', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
				</div>
				<div class="wpconsent-metabox-form-row-input">
					<label class="wpconsent-checkbox-toggle">
						<input type="checkbox" name="scanner_auto_update" id="scanner_auto_update" value="1" checked disabled />
						<span class="wpconsent-checkbox-toggle-slider"></span>
					</label>
					<p class="description"><?php esc_html_e( 'Automatically add newly detected services to your cookie configuration.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
					<p><strong><?php esc_html_e( 'Note:', 'wpconsent-cookies-banner-privacy-suite' ); ?></strong> <?php esc_html_e( 'The scanner only adds new services, it never removes existing ones. This is by design since some services may only load on pages that are not scanned.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
				</div>
			</div>

			<?php $this->metabox_row_separator(); ?>

			<!-- Email Notifications -->
			<div class="wpconsent-metabox-form-row">
				<div class="wpconsent-metabox-form-row-label">
					<label for="scanner_email_notifications"><?php esc_html_e( 'Email Notifications', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
				</div>
				<div class="wpconsent-metabox-form-row-input">
					<label class="wpconsent-checkbox-toggle">
						<input type="checkbox" name="scanner_email_notifications" id="scanner_email_notifications" value="1" checked disabled />
						<span class="wpconsent-checkbox-toggle-slider"></span>
					</label>
					<p class="description"><?php esc_html_e( 'Send email notifications when new services are detected on your website.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
				</div>
			</div>

			<!-- Email Addresses -->
			<div class="wpconsent-metabox-form-row">
				<div class="wpconsent-metabox-form-row-label">
					<label for="scanner_email_addresses"><?php esc_html_e( 'Notification Email Addresses', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
				</div>
				<div class="wpconsent-metabox-form-row-input">
					<input type="text" name="scanner_email_addresses" id="scanner_email_addresses" value="<?php echo esc_attr( get_option( 'admin_email' ) ); ?>" class="wpconsent-input-email" disabled />
					<p class="description"><?php esc_html_e( 'Comma-separated list of email addresses to receive notifications. Leave empty to use the admin email.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
					<p>
						<button type="button" class="wpconsent-button wpconsent-button-secondary" disabled><?php esc_html_e( 'Send Test Email', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
					</p>
				</div>
			</div>

			<?php $this->metabox_row_separator(); ?>

			<!-- History Retention -->
			<div class="wpconsent-metabox-form-row">
				<div class="wpconsent-metabox-form-row-label">
					<label for="scanner_history_retention"><?php esc_html_e( 'History Retention (Days)', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
				</div>
				<div class="wpconsent-metabox-form-row-input">
					<input type="number" name="scanner_history_retention" id="scanner_history_retention" class="wpconsent-regular-text wpconsent-input-number" value="90" min="0" max="365" disabled />
					<p><?php esc_html_e( 'How long to keep scan history records. Set to 0 to keep forever.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
				</div>
			</div>

			<div class="wpconsent-metabox-form-row">
				<button type="button" class="wpconsent-button wpconsent-button-primary" disabled><?php esc_html_e( 'Save Settings', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
			</div>
		</form>
		<?php
		$content = ob_get_clean();

		$this->metabox(
			esc_html__( 'Scanner Settings', 'wpconsent-cookies-banner-privacy-suite' ),
			$content
		);
	}
}
