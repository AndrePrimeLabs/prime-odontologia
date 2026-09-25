<?php
/**
 * WPConsent Admin Page Dashboard.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dashboard page class.
 */
class WPConsent_Admin_Page_Dashboard extends WPConsent_Admin_Page {

	use WPConsent_Banner_Preview;
	use WPConsent_Analytics_Report;

	/**
	 * Cached basic compliance items.
	 *
	 * @var array|null
	 */
	private $cached_basic_items;

	/**
	 * Cached advanced compliance items.
	 *
	 * @var array|null
	 */
	protected $cached_advanced_items;

	/**
	 * Cached docs slug map.
	 *
	 * @var array|null
	 */
	protected $cached_docs_by_slug;

	/**
	 * Page slug.
	 *
	 * @var string
	 */
	public $page_slug = 'wpconsent';

	/**
	 * Call this just to set the page title translatable.
	 */
	public function __construct() {
		$this->page_title = __( 'Dashboard', 'wpconsent-cookies-banner-privacy-suite' );
		parent::__construct();
	}

	/**
	 * Page hooks.
	 *
	 * @return void
	 */
	public function page_hooks() {
		add_filter( 'wpconsent_admin_js_data', array( $this, 'banner_preview_scripts' ) );
	}

	/**
	 * Format a translated string, falling back to the untranslated format
	 * if the active translation contains an invalid format specifier (a
	 * malformed community translation would otherwise throw a fatal
	 * ValueError on PHP 8+ and take down the whole dashboard).
	 *
	 * @param string $translated Translated format string.
	 * @param string $fallback   Untranslated (English) format string.
	 * @param mixed  ...$args    sprintf() arguments.
	 * @return string
	 */
	protected function safe_sprintf( $translated, $fallback, ...$args ) {
		try {
			return vsprintf( $translated, $args );
		} catch ( \ValueError $e ) {
			return vsprintf( $fallback, $args );
		}
	}

	/**
	 * Page content — prototype with placeholder data.
	 *
	 * @return void
	 */
	public function output_content() {
		$this->alert_bar();

		// Count actionable pending items (not upsells) to decide docs widget placement.
		$all_items      = $this->get_basic_items();
		$advanced_items = $this->get_advanced_items();
		$pending_count  = 0;
		foreach ( array_merge( $all_items, $advanced_items ) as $item ) {
			if ( ! $item['earned'] && empty( $item['upsell'] ) ) {
				$pending_count++;
			}
		}

		// If 5+ actionable pending items, the score widget is tall — put docs on the right.
		$docs_on_right = $pending_count >= 5;
		?>
		<div class="wpconsent-dashboard-grid">
			<div class="wpconsent-dashboard-grid-col">
				<?php $this->compliance_score_widget(); ?>
				<?php if ( ! $docs_on_right ) : ?>
					<?php $this->docs_widget(); ?>
				<?php endif; ?>
			</div>
			<div class="wpconsent-dashboard-grid-col">
				<?php $this->analytics_widget(); ?>
				<?php wpconsent()->recommended_plugins->recommended_plugins_widget(); ?>
				<?php $this->blog_feed_widget(); ?>
				<?php $this->banner_preview_box(); ?>
				<?php if ( $docs_on_right ) : ?>
					<?php $this->docs_widget(); ?>
				<?php endif; ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Alert bar — only shows time-sensitive conditions.
	 *
	 * @return void
	 */
	public function alert_bar() {
		$alerts = $this->get_alerts();
		if ( empty( $alerts ) ) {
			return;
		}

		$visible  = array_slice( $alerts, 0, 3 );
		$overflow = count( $alerts ) - 3;
		?>
		<div class="wpconsent-alert-bar">
			<?php foreach ( $visible as $alert ) : ?>
				<div class="wpconsent-alert-bar-item" data-alert-key="<?php echo esc_attr( $alert['key'] ); ?>">
					<span class="wpconsent-alert-bar-message"><?php echo esc_html( $alert['message'] ); ?></span>
					<a href="<?php echo esc_url( $alert['url'] ); ?>" class="wpconsent-button wpconsent-button-small wpconsent-button-primary">
						<?php echo esc_html( $alert['action'] ); ?>
					</a>
					<button type="button" class="wpconsent-alert-bar-dismiss" aria-label="<?php esc_attr_e( 'Dismiss', 'wpconsent-cookies-banner-privacy-suite' ); ?>">&times;</button>
				</div>
			<?php endforeach; ?>
			<?php if ( $overflow > 0 ) : ?>
				<div class="wpconsent-alert-bar-overflow">
					<?php
					/* translators: %d: number of additional alerts. */
					printf( esc_html__( 'and %d more...', 'wpconsent-cookies-banner-privacy-suite' ), (int) $overflow );
					?>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Build the list of active alerts.
	 *
	 * Only time-sensitive and state-change conditions — not things
	 * already visible as pending score items.
	 *
	 * @return array
	 */
	protected function get_alerts() {
		$alerts = array();

		// Unreviewed inspector findings.
		$pending = wpconsent()->inspector->get_pending_cookies();
		if ( ! empty( $pending ) ) {
			$alerts[] = array(
				'key'     => 'inspector_pending',
				/* translators: %d: number of cookies awaiting review. */
				'message' => $this->safe_sprintf( __( 'Inspector found %d cookies awaiting review.', 'wpconsent-cookies-banner-privacy-suite' ), 'Inspector found %d cookies awaiting review.', count( $pending ) ),
				'action'  => __( 'Review', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'     => admin_url( 'admin.php?page=wpconsent-scanner&view=inspector' ),
			);
		}

		// Scan overdue (>30 days).
		$scan_data = wpconsent()->scanner->get_scan_data();
		if ( ! empty( $scan_data['date'] ) ) {
			$days_ago = (int) floor( ( time() - strtotime( $scan_data['date'] ) ) / DAY_IN_SECONDS );
			if ( $days_ago > 30 ) {
				$alerts[] = array(
					'key'     => 'scan_overdue',
					/* translators: %d: number of days since last scan. */
					'message' => $this->safe_sprintf( __( 'Your last scan was %d days ago. Your site may have changed.', 'wpconsent-cookies-banner-privacy-suite' ), 'Your last scan was %d days ago. Your site may have changed.', $days_ago ),
					'action'  => __( 'Scan Now', 'wpconsent-cookies-banner-privacy-suite' ),
					'url'     => admin_url( 'admin.php?page=wpconsent-scanner' ),
				);
			}
		}

		return $alerts;
	}

	/**
	 * Get the basic compliance items with real data.
	 *
	 * @return array
	 */
	protected function get_basic_items() {
		if ( null !== $this->cached_basic_items ) {
			return $this->cached_basic_items;
		}

		// Consent banner enabled (20 pts).
		$banner_enabled = (bool) wpconsent()->settings->get_option( 'enable_consent_banner' );

		// Script blocking enabled (20 pts).
		$script_blocking = (bool) wpconsent()->settings->get_option( 'enable_script_blocking' );
		$all_scripts     = wpconsent()->script_blocker->get_all_scripts();
		$scripts_count   = 0;
		foreach ( $all_scripts as $scripts ) {
			$scripts_count += count( $scripts );
		}

		// Cookie policy configured (10 pts).
		$policy_page_id = (int) wpconsent()->settings->get_option( 'cookie_policy_page' );
		$policy_exists  = $policy_page_id > 0 && 'publish' === get_post_status( $policy_page_id );

		// Cookie categories configured (10 pts).
		// Count user-configured cookies, excluding the auto-created wpconsent_preferences cookie.
		$cookie_query = new WP_Query( array(
			'post_type'      => 'wpconsent_cookie',
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Filtering cookie posts by meta is required; admin-only, runs once per dashboard load.
				'relation' => 'OR',
				array(
					'key'     => 'wpconsent_cookie_id',
					'value'   => 'wpconsent_preferences',
					'compare' => '!=',
				),
				array(
					'key'     => 'wpconsent_cookie_id',
					'compare' => 'NOT EXISTS',
				),
			),
		) );
		$cookie_count   = $cookie_query->found_posts;
		$has_categories = $cookie_count > 0;

		// Website scanned in last 30 days (5 pts).
		$scan_data   = wpconsent()->scanner->get_scan_data();
		$scan_recent = false;
		$scan_days   = 0;
		$scan_time   = 0;
		if ( ! empty( $scan_data['date'] ) ) {
			$scan_time   = strtotime( $scan_data['date'] );
			$scan_days   = (int) floor( ( time() - $scan_time ) / DAY_IN_SECONDS );
			$scan_recent = $scan_days <= 30;
		}

		// Inspector run at least once (5 pts).
		$inspector_run = (bool) wpconsent()->settings->get_option( 'inspector_completed', false );

		// Scan findings reviewed (5 pts).
		$pending_cookies = wpconsent()->inspector->get_pending_cookies();
		$all_reviewed    = empty( $pending_cookies );

		// Google Consent Mode (5 pts) — only shown when Google services are detected.
		$has_google_services = $this->has_google_services();
		$gcm_enabled         = (bool) wpconsent()->settings->get_option( 'google_consent_mode', true );

		// Content blocking enabled (5 pts) — only shown when content-blockable services exist.
		$has_embeddable_services = $this->has_embeddable_services();
		$content_blocking        = (bool) wpconsent()->settings->get_option( 'enable_content_blocking' );

		$items = array(
			array(
				'label'       => __( 'Consent banner enabled', 'wpconsent-cookies-banner-privacy-suite' ),
				'points'      => 20,
				'earned'      => $banner_enabled,
				'detail'      => $banner_enabled
					? __( 'Your consent banner is active and showing to visitors.', 'wpconsent-cookies-banner-privacy-suite' )
					: __( 'Enable a consent banner to inform visitors about cookies.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'         => admin_url( 'admin.php?page=wpconsent-banner' ),
				'action_type' => 'toggle',
				'action_key'  => 'enable_consent_banner',
			),
			array(
				'label'       => __( 'Script blocking enabled', 'wpconsent-cookies-banner-privacy-suite' ),
				'points'      => 20,
				'earned'      => $script_blocking,
				'detail'      => $script_blocking
					/* translators: %d: number of scripts being managed. */
					? $this->safe_sprintf( __( '%d scripts managed.', 'wpconsent-cookies-banner-privacy-suite' ), '%d scripts managed.', $scripts_count )
					: __( 'Block tracking scripts until visitors give consent.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'         => admin_url( 'admin.php?page=wpconsent-cookies' ),
				'action_type' => 'toggle',
				'action_key'  => 'enable_script_blocking',
			),
			array(
				'label'       => __( 'Cookie policy configured', 'wpconsent-cookies-banner-privacy-suite' ),
				'points'      => 10,
				'earned'      => $policy_exists,
				'detail'      => $policy_exists
					/* translators: %s: the cookie policy page title. */
					? $this->safe_sprintf( __( 'Linked to "%s".', 'wpconsent-cookies-banner-privacy-suite' ), 'Linked to "%s".', get_the_title( $policy_page_id ) )
					: __( 'Set a cookie policy page so visitors can learn more.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'         => admin_url( 'admin.php?page=wpconsent-cookies' ) . '#cookie-policy-input',
				'action_type' => 'generate_policy',
				'action_key'  => 'cookie_policy',
			),
			array(
				'label'       => __( 'Cookie categories configured', 'wpconsent-cookies-banner-privacy-suite' ),
				'points'      => 10,
				'earned'      => $has_categories,
				'detail'      => $has_categories
					/* translators: %d: number of cookies documented. */
					? $this->safe_sprintf( __( '%d cookies documented.', 'wpconsent-cookies-banner-privacy-suite' ), '%d cookies documented.', $cookie_count )
					: __( 'Document cookies so visitors know what data is collected.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'         => admin_url( 'admin.php?page=wpconsent-cookies&view=cookies' ),
				'action_type' => 'configure_cookies',
				'action_key'  => '',
				'has_scan'    => ! empty( $scan_data['date'] ),
			),
			array(
				'label'       => __( 'Website scanned recently', 'wpconsent-cookies-banner-privacy-suite' ),
				'points'      => 5,
				'earned'      => $scan_recent,
				'detail'      => $scan_recent
					/* translators: %s: formatted date of last scan. */
					? $this->safe_sprintf( __( 'Last scan: %s.', 'wpconsent-cookies-banner-privacy-suite' ), 'Last scan: %s.', date_i18n( get_option( 'date_format' ), $scan_time ) )
					: ( ! empty( $scan_data['date'] )
						/* translators: %d: days since last scan. */
						? $this->safe_sprintf( __( 'Last scan was %d days ago. Run a new scan to check for changes.', 'wpconsent-cookies-banner-privacy-suite' ), 'Last scan was %d days ago. Run a new scan to check for changes.', $scan_days )
						: __( 'Scan your website to detect cookies and tracking scripts.', 'wpconsent-cookies-banner-privacy-suite' )
					),
				'url'         => admin_url( 'admin.php?page=wpconsent-scanner' ),
				'action_type' => 'link',
				'action_key'  => '',
			),
			array(
				'label'       => __( 'Inspector completed', 'wpconsent-cookies-banner-privacy-suite' ),
				'points'      => 5,
				'earned'      => $inspector_run,
				'detail'      => $inspector_run
					? __( 'Inspector has been run to verify cookie detection.', 'wpconsent-cookies-banner-privacy-suite' )
					: __( 'Run the Cookie Inspector to detect cookies in real-time.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'         => admin_url( 'admin.php?page=wpconsent-scanner&view=inspector' ),
				'action_type' => 'link',
				'action_key'  => '',
			),
			array(
				'label'       => __( 'All findings reviewed', 'wpconsent-cookies-banner-privacy-suite' ),
				'points'      => 5,
				'earned'      => $all_reviewed && $inspector_run,
				'detail'      => $all_reviewed
					? __( 'No pending findings to review.', 'wpconsent-cookies-banner-privacy-suite' )
					/* translators: %d: number of cookies pending review. */
					: $this->safe_sprintf( __( '%d cookies need categorization.', 'wpconsent-cookies-banner-privacy-suite' ), '%d cookies need categorization.', count( $pending_cookies ) ),
				'url'         => admin_url( 'admin.php?page=wpconsent-scanner&view=inspector' ),
				'action_type' => 'link',
				'action_key'  => '',
			),
		);

		// Content blocking — only add when embeddable services are registered.
		if ( $has_embeddable_services ) {
			$items[] = array(
				'label'       => __( 'Content blocking enabled', 'wpconsent-cookies-banner-privacy-suite' ),
				'points'      => 5,
				'earned'      => $content_blocking,
				'detail'      => $content_blocking
					? __( 'Embedded content is blocked until visitors give consent.', 'wpconsent-cookies-banner-privacy-suite' )
					: __( 'Block iframes and embeds like YouTube and Google Maps until consent is given.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'         => admin_url( 'admin.php?page=wpconsent-cookies' ) . '#enable_content_blocking',
				'action_type' => 'toggle',
				'action_key'  => 'enable_content_blocking',
			);
		}

		// Google Consent Mode — only add when Google services are present.
		if ( $has_google_services ) {
			$items[] = array(
				'label'       => __( 'Google Consent Mode', 'wpconsent-cookies-banner-privacy-suite' ),
				'points'      => 5,
				'earned'      => $gcm_enabled,
				'detail'      => $gcm_enabled
					? __( 'Google services respect visitor consent choices.', 'wpconsent-cookies-banner-privacy-suite' )
					: __( 'Let Google Analytics and Ads respect consent before tracking.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'         => admin_url( 'admin.php?page=wpconsent-cookies' ) . '#google_consent_mode',
				'action_type' => 'toggle',
				'action_key'  => 'google_consent_mode',
			);
		}

		$this->cached_basic_items = $items;

		return $items;
	}

	/**
	 * Check if the site has Google services registered.
	 *
	 * Uses the same logic as the frontend: checks service taxonomy terms
	 * for slugs containing "google". Result is cached in a transient.
	 *
	 * @return bool
	 */
	protected function has_google_services() {
		$cached = get_transient( 'wpconsent_has_google_services' );
		if ( false !== $cached ) {
			return 'yes' === $cached;
		}

		$services = get_terms( array(
			'taxonomy'   => 'wpconsent_category',
			'hide_empty' => false,
			'number'     => 0,
		) );

		if ( is_wp_error( $services ) ) {
			return false;
		}

		foreach ( $services as $service ) {
			if ( false !== strpos( $service->slug, 'google' ) ) {
				set_transient( 'wpconsent_has_google_services', 'yes', DAY_IN_SECONDS );

				return true;
			}
		}

		set_transient( 'wpconsent_has_google_services', 'no', DAY_IN_SECONDS );

		return false;
	}

	/**
	 * Check if the site has services with embeddable content (iframes, videos, maps).
	 *
	 * Cross-references content-blocking providers from the script library with
	 * services actually registered in the taxonomy. Result is cached in a transient.
	 *
	 * @return bool
	 */
	protected function has_embeddable_services() {
		$cached = get_transient( 'wpconsent_has_embeddable_services' );
		if ( false !== $cached ) {
			return 'yes' === $cached;
		}

		// Get provider keys that support content blocking (e.g., youtube, google-maps, vimeo).
		$providers = wpconsent()->script_blocker->get_content_blocking_providers();
		if ( empty( $providers ) ) {
			set_transient( 'wpconsent_has_embeddable_services', 'no', DAY_IN_SECONDS );

			return false;
		}

		// Check if any of these providers are registered as services on this site.
		$services = get_terms( array(
			'taxonomy'   => 'wpconsent_category',
			'hide_empty' => false,
			'number'     => 0,
		) );

		if ( is_wp_error( $services ) ) {
			return false;
		}

		$provider_keys = array_keys( $providers );
		foreach ( $services as $service ) {
			if ( in_array( $service->slug, $provider_keys, true ) ) {
				set_transient( 'wpconsent_has_embeddable_services', 'yes', DAY_IN_SECONDS );

				return true;
			}
		}

		set_transient( 'wpconsent_has_embeddable_services', 'no', DAY_IN_SECONDS );

		return false;
	}

	/**
	 * Get value stats to show below the score label.
	 *
	 * @return array Array of stat strings.
	 */
	protected function get_value_stats() {
		// Cookies documented.
		$total_cookies = (int) wp_count_posts( 'wpconsent_cookie' )->publish;

		// Days since activation.
		$activated_data = get_option( 'wpconsent_activated', array() );
		$activated      = ! empty( $activated_data['wpconsent'] ) ? (int) $activated_data['wpconsent'] : time();
		$days = (int) floor( ( time() - $activated ) / DAY_IN_SECONDS );

		$stats = array(
			/* translators: %d: number of cookies documented. */
			$this->safe_sprintf( __( '%d cookies documented', 'wpconsent-cookies-banner-privacy-suite' ), '%d cookies documented', $total_cookies ),
		);

		if ( $days > 0 ) {
			/* translators: %d: number of days since plugin activation. */
			$stats[] = $this->safe_sprintf( __( 'Active for %d days', 'wpconsent-cookies-banner-privacy-suite' ), 'Active for %d days', $days );
		}

		return $stats;
	}

	/**
	 * Compliance score widget.
	 *
	 * @return void
	 */
	public function compliance_score_widget() {
		$all_items      = $this->get_basic_items();
		$advanced_items = $this->get_advanced_items();

		// Split into earned and pending for both sections.
		$pending_basics  = array_filter( $all_items, function ( $item ) {
			return ! $item['earned'];
		} );
		$earned_basics   = array_filter( $all_items, function ( $item ) {
			return $item['earned'];
		} );
		$pending_advanced = array_filter( $advanced_items, function ( $item ) {
			return ! $item['earned'];
		} );
		$earned_advanced  = array_filter( $advanced_items, function ( $item ) {
			return $item['earned'];
		} );

		// Combine all earned for the toggle count.
		$all_earned = array_merge( $earned_basics, $earned_advanced );
		$all_total  = array_merge( $all_items, $advanced_items );
		$earned_count = count( $all_earned );
		$total_count  = count( $all_total );

		// Calculate score.
		// Lite: score is based on base items only, scaled to 75% max.
		// Pro: score is based on all items out of 100%.
		$has_upsells = false;
		foreach ( $advanced_items as $item ) {
			if ( ! empty( $item['upsell'] ) ) {
				$has_upsells = true;
				break;
			}
		}

		if ( $has_upsells ) {
			// Lite: only base items count. Upsell items appear in the UI but don't affect the score.
			// Scaling to 75 means a fully configured Lite user always reaches exactly 75%.
			$base_earned = 0;
			$base_total  = 0;
			foreach ( $all_items as $item ) {
				$base_total += $item['points'];
				if ( $item['earned'] ) {
					$base_earned += $item['points'];
				}
			}
			$percentage = $base_total > 0 ? (int) round( ( $base_earned / $base_total ) * 75 ) : 0;
		} else {
			// Pro: all items count toward a 100% score.
			$earned_points = 0;
			$total_points  = 0;
			foreach ( array_merge( $all_items, $advanced_items ) as $item ) {
				$total_points += $item['points'];
				if ( $item['earned'] ) {
					$earned_points += $item['points'];
				}
			}
			$percentage = $total_points > 0 ? (int) round( ( $earned_points / $total_points ) * 100 ) : 0;
		}

		// Status label and color.
		if ( $percentage >= 90 ) {
			$label = __( 'Excellent. All recommended features enabled.', 'wpconsent-cookies-banner-privacy-suite' );
			$color = 'green';
		} elseif ( $percentage >= 70 ) {
			$label = __( 'Good. Core setup done, more features available.', 'wpconsent-cookies-banner-privacy-suite' );
			$color = 'blue';
		} elseif ( $percentage >= 50 ) {
			$label = __( 'Getting there. A few steps to complete.', 'wpconsent-cookies-banner-privacy-suite' );
			$color = 'yellow';
		} else {
			$label = __( 'Just getting started. Let\'s set things up.', 'wpconsent-cookies-banner-privacy-suite' );
			$color = 'orange';
		}
		?>
		<div class="wpconsent-dashboard-box wpconsent-compliance-score">
			<div class="wpconsent-dashboard-box-title">
				<h2><?php esc_html_e( 'Site Consent Health', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
			</div>
			<div class="wpconsent-dashboard-box-content">
				<div class="wpconsent-score-header">
					<div class="wpconsent-score-ring wpconsent-score-ring-<?php echo esc_attr( $color ); ?>" style="--score-pct: <?php echo esc_attr( $percentage ); ?>">
						<span class="wpconsent-score-ring-value"><?php echo esc_html( $percentage ); ?>%</span>
					</div>
					<div class="wpconsent-score-header-text">
						<p class="wpconsent-score-label"><?php echo esc_html( $label ); ?></p>
						<?php
						$stats = $this->get_value_stats();
						if ( ! empty( $stats ) ) :
							?>
							<p class="wpconsent-score-stats">
								<?php
								$stat_parts = array();
								foreach ( $stats as $stat ) {
									if ( is_array( $stat ) && ! empty( $stat['url'] ) ) {
										$stat_parts[] = '<a href="' . esc_url( $stat['url'] ) . '">' . esc_html( $stat['text'] ) . '</a>';
									} else {
										$stat_parts[] = esc_html( is_array( $stat ) ? $stat['text'] : $stat );
									}
								}
								echo implode( ' · ', $stat_parts ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- each part is escaped above.
								?>
							</p>
						<?php endif; ?>
					</div>
				</div>

				<?php if ( $percentage < 50 ) : ?>
					<div class="wpconsent-wizard-cta">
						<p><?php esc_html_e( 'The quickest way to get set up is our guided wizard. It takes about two minutes.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
						<a href="<?php echo esc_url( admin_url( 'admin.php?page=wpconsent-onboarding' ) ); ?>" class="wpconsent-button wpconsent-button-primary">
							<?php esc_html_e( 'Run the Setup Wizard', 'wpconsent-cookies-banner-privacy-suite' ); ?>
						</a>
					</div>
				<?php endif; ?>

				<?php if ( ! empty( $pending_basics ) || ! empty( $pending_advanced ) ) : ?>
					<h3 class="wpconsent-score-section-title"><?php esc_html_e( 'To improve your score', 'wpconsent-cookies-banner-privacy-suite' ); ?></h3>
					<ul class="wpconsent-score-items">
						<?php
						foreach ( $pending_basics as $item ) :
							$this->render_score_item( $item );
						endforeach;
						foreach ( $pending_advanced as $item ) :
							$this->render_score_item( $item, true );
						endforeach;
						?>
					</ul>
				<?php endif; ?>

				<?php
				$suggestions = $this->get_suggestions();
				if ( ! empty( $suggestions ) ) :
					?>
					<div class="wpconsent-suggestions">
						<h3 class="wpconsent-score-section-title wpconsent-score-section-suggestions"><?php esc_html_e( 'Suggestions', 'wpconsent-cookies-banner-privacy-suite' ); ?></h3>
						<ul class="wpconsent-suggestion-list">
							<?php foreach ( $suggestions as $suggestion ) : ?>
								<li class="wpconsent-suggestion-item">
									<span class="wpconsent-suggestion-icon">&#128161;</span>
									<div class="wpconsent-suggestion-content">
										<div class="wpconsent-suggestion-header">
											<span class="wpconsent-suggestion-label"><?php echo esc_html( $suggestion['label'] ); ?></span>
											<button type="button" class="wpconsent-suggestion-dismiss" data-suggestion="<?php echo esc_attr( $suggestion['key'] ); ?>" aria-label="<?php esc_attr_e( 'Dismiss', 'wpconsent-cookies-banner-privacy-suite' ); ?>">&times;</button>
										</div>
										<span class="wpconsent-suggestion-detail"><?php echo esc_html( $suggestion['detail'] ); ?></span>
										<a href="<?php echo esc_url( $suggestion['url'] ); ?>" class="wpconsent-score-item-action"><?php esc_html_e( 'Set up', 'wpconsent-cookies-banner-privacy-suite' ); ?> &rarr;</a>
									</div>
								</li>
							<?php endforeach; ?>
						</ul>
					</div>
				<?php endif; ?>

				<?php
				$dismissed_suggestions = $this->get_dismissed_suggestions();
				$has_details           = ! empty( $all_earned ) || ! empty( $dismissed_suggestions );
				?>
				<?php if ( $has_details ) : ?>
					<?php
					/* translators: %1$d: earned count, %2$d: total count. */
					$show_text = $this->safe_sprintf( esc_html__( '%1$d of %2$d items complete · Show details', 'wpconsent-cookies-banner-privacy-suite' ), '%1$d of %2$d items complete · Show details', $earned_count, $total_count );
					/* translators: %1$d: earned count, %2$d: total count. */
					$hide_text = $this->safe_sprintf( esc_html__( '%1$d of %2$d items complete · Hide details', 'wpconsent-cookies-banner-privacy-suite' ), '%1$d of %2$d items complete · Hide details', $earned_count, $total_count );
					?>
					<div class="wpconsent-score-earned-toggle">
						<button type="button" class="wpconsent-score-toggle-btn" data-show-text="<?php echo esc_attr( $show_text ); ?>" data-hide-text="<?php echo esc_attr( $hide_text ); ?>">
							<span class="wpconsent-score-toggle-text"><?php echo esc_html( $show_text ); ?></span>
						</button>
					</div>
					<div class="wpconsent-score-details-content" style="display: none;">
						<?php if ( ! empty( $all_earned ) ) : ?>
							<ul class="wpconsent-score-items wpconsent-score-items-earned">
								<?php
								foreach ( $earned_basics as $item ) :
									$this->render_score_item( $item );
								endforeach;
								foreach ( $earned_advanced as $item ) :
									$this->render_score_item( $item, true );
								endforeach;
								?>
							</ul>
						<?php endif; ?>
						<div class="wpconsent-dismissed-suggestions-area" <?php echo empty( $dismissed_suggestions ) ? 'style="display:none;"' : ''; ?>>
							<h3 class="wpconsent-score-section-title wpconsent-score-section-dismissed"><?php esc_html_e( 'Dismissed suggestions', 'wpconsent-cookies-banner-privacy-suite' ); ?></h3>
							<ul class="wpconsent-suggestion-list wpconsent-suggestion-list-dismissed">
								<?php foreach ( $dismissed_suggestions as $suggestion ) : ?>
									<li class="wpconsent-suggestion-item wpconsent-suggestion-item-dismissed">
										<span class="wpconsent-suggestion-icon">&#128161;</span>
										<div class="wpconsent-suggestion-content">
											<div class="wpconsent-suggestion-header">
												<span class="wpconsent-suggestion-label"><?php echo esc_html( $suggestion['label'] ); ?></span>
											</div>
											<span class="wpconsent-suggestion-detail"><?php echo esc_html( $suggestion['detail'] ); ?></span>
											<a href="<?php echo esc_url( $suggestion['url'] ); ?>" class="wpconsent-score-item-action"><?php esc_html_e( 'Set up', 'wpconsent-cookies-banner-privacy-suite' ); ?> &rarr;</a>
										</div>
									</li>
								<?php endforeach; ?>
							</ul>
						</div>
					</div>
				<?php endif; ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Get the advanced compliance items.
	 *
	 * In Lite, these are upsell items. Pro overrides this method
	 * to return actionable items that count toward the score.
	 *
	 * @return array
	 */
	protected function get_advanced_items() {
		if ( null !== $this->cached_advanced_items ) {
			return $this->cached_advanced_items;
		}

		$items = array(
			array(
				'earned' => false,
				'label'  => __( 'Geolocation rules', 'wpconsent-cookies-banner-privacy-suite' ),
				'points' => 0,
				'detail' => __( 'Show the right consent experience per region.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'    => wpconsent_utm_url( 'https://wpconsent.com/lite/', 'dashboard', 'geolocation' ),
				'upsell' => true,
			),
			array(
				'earned' => false,
				'label'  => __( 'Consent logging enabled', 'wpconsent-cookies-banner-privacy-suite' ),
				'points' => 15,
				'detail' => __( 'Keep a log of visitor consent choices.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'    => wpconsent_utm_url( 'https://wpconsent.com/lite/', 'dashboard', 'consent-logging' ),
				'upsell' => true,
			),
			array(
				'earned' => false,
				'label'  => __( 'Auto-scanning enabled', 'wpconsent-cookies-banner-privacy-suite' ),
				'points' => 10,
				'detail' => __( 'Automatically detect new cookies as your site changes.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'    => wpconsent_utm_url( 'https://wpconsent.com/lite/', 'dashboard', 'auto-scanning' ),
				'upsell' => true,
			),
		);

		// Conditional: show multilanguage upsell if a translation plugin is active.
		if ( $this->has_translation_plugin() ) {
			$items[] = array(
				'earned' => false,
				'label'  => __( 'Automatic translations', 'wpconsent-cookies-banner-privacy-suite' ),
				'points' => 0,
				'detail' => __( 'Automatically translate your consent banner for multilingual visitors.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'    => wpconsent_utm_url( 'https://wpconsent.com/lite/', 'dashboard', 'multilanguage' ),
				'upsell' => true,
			);
		}

		$this->cached_advanced_items = $items;

		return $items;
	}

	/**
	 * Check if a supported translation plugin is active.
	 *
	 * @return bool
	 */
	protected function has_translation_plugin() {
		return function_exists( 'pll_current_language' )
			|| defined( 'ICL_SITEPRESS_VERSION' )
			|| class_exists( 'TRP_Translate_Press' );
	}

	/**
	 * Get suggestion items. Suggestions are dismissible and don't count toward score.
	 *
	 * Lite returns empty — suggestions are Pro features.
	 * Pro overrides this to return IAB TCF, Do Not Sell, etc.
	 *
	 * @return array
	 */
	protected function get_suggestions() {
		return array();
	}

	/**
	 * Get dismissed suggestion items for display in the details toggle.
	 *
	 * Lite returns empty. Pro overrides this.
	 *
	 * @return array
	 */
	protected function get_dismissed_suggestions() {
		return array();
	}

	/**
	 * Render a single compliance score item.
	 *
	 * @param array $item The item data.
	 * @param bool  $is_advanced Whether this is in the advanced section.
	 *
	 * @return void
	 */
	protected function render_score_item( $item, $is_advanced = false ) {
		$is_upsell = ! empty( $item['upsell'] );
		$classes   = 'wpconsent-score-item';
		$classes  .= $item['earned'] ? ' wpconsent-score-item-earned' : ' wpconsent-score-item-pending';
		if ( $is_upsell ) {
			$classes .= ' wpconsent-score-item-pro';
		}
		?>
		<li class="<?php echo esc_attr( $classes ); ?>">
			<span class="wpconsent-score-item-check"><?php echo $item['earned'] ? '&#10003;' : '&#9675;'; ?></span>
			<div class="wpconsent-score-item-content">
				<div class="wpconsent-score-item-header">
					<span class="wpconsent-score-item-label"><?php echo esc_html( $item['label'] ); ?></span>
					<?php if ( ! $is_upsell ) : ?>
					<span class="wpconsent-score-item-points">
						<?php echo esc_html( $item['points'] . ' ' . __( 'pts', 'wpconsent-cookies-banner-privacy-suite' ) ); ?>
					</span>
					<?php endif; ?>
				</div>
				<span class="wpconsent-score-item-detail"><?php echo esc_html( $item['detail'] ); ?></span>
				<?php if ( ! $item['earned'] ) : ?>
					<?php
					$action_type = isset( $item['action_type'] ) ? $item['action_type'] : 'link';
					$action_key  = isset( $item['action_key'] ) ? $item['action_key'] : '';
					?>
					<div class="wpconsent-score-item-actions">
						<?php if ( 'toggle' === $action_type && ! empty( $action_key ) ) : ?>
							<button type="button" class="wpconsent-score-action-toggle" data-setting="<?php echo esc_attr( $action_key ); ?>">
								<?php esc_html_e( 'Enable', 'wpconsent-cookies-banner-privacy-suite' ); ?>
							</button>
							<a href="<?php echo esc_url( $item['url'] ); ?>" class="wpconsent-score-item-action">
								<?php esc_html_e( 'Settings', 'wpconsent-cookies-banner-privacy-suite' ); ?> &rarr;
							</a>
						<?php elseif ( 'generate_policy' === $action_type ) : ?>
							<button type="button" class="wpconsent-score-action-generate-policy">
								<?php esc_html_e( 'Generate page', 'wpconsent-cookies-banner-privacy-suite' ); ?>
							</button>
							<a href="<?php echo esc_url( $item['url'] ); ?>" class="wpconsent-score-item-action">
								<?php esc_html_e( 'Choose page', 'wpconsent-cookies-banner-privacy-suite' ); ?> &rarr;
							</a>
						<?php elseif ( 'configure_cookies' === $action_type ) : ?>
							<?php if ( ! empty( $item['has_scan'] ) ) : ?>
								<a href="<?php echo esc_url( admin_url( 'admin.php?page=wpconsent-scanner#wpconsent-scan-detailed-report' ) ); ?>" class="wpconsent-score-action-btn">
									<?php esc_html_e( 'Configure from scan', 'wpconsent-cookies-banner-privacy-suite' ); ?>
								</a>
							<?php endif; ?>
							<a href="<?php echo esc_url( $item['url'] ); ?>" class="wpconsent-score-item-action">
								<?php esc_html_e( 'Configure manually', 'wpconsent-cookies-banner-privacy-suite' ); ?> &rarr;
							</a>
						<?php else : ?>
							<a href="<?php echo esc_url( $item['url'] ); ?>" class="wpconsent-score-item-action" <?php echo $is_upsell ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>>
								<?php
								if ( $is_upsell ) {
									esc_html_e( 'Upgrade to Pro', 'wpconsent-cookies-banner-privacy-suite' );
								} else {
									esc_html_e( 'Set up', 'wpconsent-cookies-banner-privacy-suite' );
								}
								?>
								&rarr;
							</a>
						<?php endif; ?>
					</div>
				<?php endif; ?>
			</div>
		</li>
		<?php
	}

	/**
	 * Banner preview widget.
	 *
	 * @return void
	 */
	public function banner_preview_box() {
		$banner_enabled = (bool) wpconsent()->settings->get_option( 'enable_consent_banner' );
		?>
		<div class="wpconsent-dashboard-box wpconsent-banner-preview-widget">
			<div class="wpconsent-dashboard-box-title">
				<h2><?php esc_html_e( 'Your Consent Banner', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
			</div>
			<div class="wpconsent-dashboard-box-content">
				<?php if ( ! $banner_enabled ) : ?>
					<p class="wpconsent-banner-preview-disabled"><?php esc_html_e( 'Banner is not active.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
				<?php endif; ?>
				<div class="wpconsent-banner-preview-container <?php echo ! $banner_enabled ? 'wpconsent-banner-preview-faded' : ''; ?>">
					<div class="wpconsent-banner-preview-wrapper">
						<?php wpconsent()->banner->output_banner(); ?>
					</div>
				</div>
			</div>
			<div class="wpconsent-dashboard-box-actions">
				<a href="<?php echo esc_url( $this->get_page_url( 'wpconsent-banner' ) ); ?>" class="wpconsent-button wpconsent-button-primary">
					<?php $banner_enabled ? esc_html_e( 'Customize Banner', 'wpconsent-cookies-banner-privacy-suite' ) : esc_html_e( 'Enable Banner', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</a>
			</div>
		</div>
		<?php
	}

	/**
	 * Banner analytics widget. Pro overrides get_analytics_widget_state() to
	 * supply real numbers; the markup lives here only.
	 *
	 * @return void
	 */
	public function analytics_widget() {
		$state = wp_parse_args(
			$this->get_analytics_widget_state(),
			array(
				'title'      => '',
				'pill'       => '',
				'pill_class' => 'wpconsent-analytics-pill',
				'message'    => '',
				'stats'      => '',
				'funnel'     => '',
				'button'     => array(),
			)
		);
		?>
		<div class="wpconsent-dashboard-box wpconsent-analytics-widget">
			<div class="wpconsent-dashboard-box-title">
				<h2><?php esc_html_e( 'Banner Analytics', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
			</div>
			<div class="wpconsent-dashboard-box-content">
				<?php if ( ! empty( $state['title'] ) ) : ?>
					<div class="wpconsent-analytics-widget-heading">
						<span class="wpconsent-analytics-widget-title"><?php echo esc_html( $state['title'] ); ?></span>
						<?php if ( ! empty( $state['pill'] ) ) : ?>
							<span class="<?php echo esc_attr( $state['pill_class'] ); ?>"><?php echo esc_html( $state['pill'] ); ?></span>
						<?php endif; ?>
					</div>
				<?php endif; ?>

				<?php if ( ! empty( $state['message'] ) ) : ?>
					<p><?php echo esc_html( $state['message'] ); ?></p>
				<?php endif; ?>

				<?php
				// Both are pre-escaped markup from WPConsent_Analytics_Report.
				echo $state['stats']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo $state['funnel']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				?>

			</div>
			<?php if ( ! empty( $state['button'] ) ) : ?>
				<div class="wpconsent-dashboard-box-actions">
					<a href="<?php echo esc_url( $state['button']['url'] ); ?>" class="wpconsent-button wpconsent-button-<?php echo esc_attr( isset( $state['button']['variant'] ) ? $state['button']['variant'] : 'primary' ); ?>" <?php echo empty( $state['button']['external'] ) ? '' : 'target="_blank" rel="noopener noreferrer"'; ?>>
						<?php echo esc_html( $state['button']['label'] ); ?>
					</a>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Describe what the analytics widget should show.
	 *
	 * Lite has no collection, so it describes the feature and shows dashes where
	 * the counters go.
	 *
	 * @return array
	 */
	protected function get_analytics_widget_state() {
		return array(
			'title'      => __( 'Not Collecting Yet', 'wpconsent-cookies-banner-privacy-suite' ),
			'pill'       => 'PRO',
			'pill_class' => 'wpconsent-pro-pill',
			'message'    => __( 'Analytics tells you how many visitors see your banner, how many accept, how many decline and how many ignore it. Data is collected on your own server, with no new cookies before a visitor decides.', 'wpconsent-cookies-banner-privacy-suite' ),
			'stats'      => $this->get_analytics_placeholder_row(),
			'button'     => array(
				'label'    => __( 'Upgrade to Pro', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'      => wpconsent_utm_url( 'https://wpconsent.com/lite/', 'dashboard', 'analytics-widget' ),
				'external' => true,
				'variant'  => 'orange',
			),
		);
	}

	/**
	 * Dashed counters for the states with nothing to show.
	 *
	 * @return string
	 */
	protected function get_analytics_placeholder_row() {
		$labels = array(
			__( 'Banner Views', 'wpconsent-cookies-banner-privacy-suite' ),
			__( 'Decisions', 'wpconsent-cookies-banner-privacy-suite' ),
			__( 'Acceptance Rate', 'wpconsent-cookies-banner-privacy-suite' ),
		);

		$stats = array();
		foreach ( $labels as $label ) {
			$stats[] = $this->analytics_stat( $label, '—' );
		}

		return $this->analytics_stats_row( $stats, 'empty' );
	}

	/**
	 * Blog feed widget showing recent announcements.
	 *
	 * @return void
	 */
	public function blog_feed_widget() {
		$articles = wpconsent()->dashboard->get_blog_articles();
		?>
		<div class="wpconsent-dashboard-box wpconsent-blog-feed-widget">
			<div class="wpconsent-dashboard-box-title">
				<h2><?php esc_html_e( "What's New", 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
			</div>
			<div class="wpconsent-dashboard-box-content">
				<?php if ( ! empty( $articles ) ) : ?>
					<ul class="wpconsent-blog-feed-list">
						<?php foreach ( $articles as $article ) : ?>
							<li class="wpconsent-blog-feed-item">
								<?php wpconsent_icon( 'announcement', 20, 20, '0 0 24 24' ); ?>
								<div class="wpconsent-blog-feed-item-content">
									<a href="<?php echo esc_url( wpconsent_utm_url( $article['link'], 'dashboard', 'blog-announcements' ) ); ?>" target="_blank" rel="noopener noreferrer" class="wpconsent-blog-feed-title">
										<?php echo esc_html( wp_trim_words( $article['title'], 10 ) ); ?>
									</a>
								</div>
							</li>
						<?php endforeach; ?>
					</ul>
				<?php else : ?>
					<p>
						<a href="<?php echo esc_url( wpconsent_utm_url( 'https://wpconsent.com/blog/', 'dashboard', 'blog-announcements' ) ); ?>" target="_blank" rel="noopener noreferrer">
							<?php esc_html_e( 'Visit our blog', 'wpconsent-cookies-banner-privacy-suite' ); ?>
						</a>
					</p>
				<?php endif; ?>
			</div>
			<?php if ( ! empty( $articles ) ) : ?>
				<div class="wpconsent-dashboard-box-actions">
					<a href="<?php echo esc_url( wpconsent_utm_url( 'https://wpconsent.com/blog/', 'dashboard', 'blog-announcements' ) ); ?>" target="_blank" rel="noopener noreferrer" class="wpconsent-button wpconsent-button-secondary">
						<?php esc_html_e( 'View all articles', 'wpconsent-cookies-banner-privacy-suite' ); ?>
					</a>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Get contextual documentation articles based on plugin state.
	 *
	 * Matches article slugs from the docs JSON against current configuration gaps.
	 * Contextual articles appear first, backfilled with fallback articles up to 5 total.
	 * Pro overrides this to add Pro-specific contextual rules.
	 *
	 * @return array Array of articles with 'title' and 'url' keys.
	 */
	protected function get_doc_articles() {
		$by_slug = $this->get_docs_by_slug();

		if ( empty( $by_slug ) ) {
			return array();
		}

		// Contextual rules: map unconfigured states to article slugs.
		$contextual_slugs = array();

		$banner_enabled = (bool) wpconsent()->settings->get_option( 'enable_consent_banner' );
		if ( ! $banner_enabled ) {
			$contextual_slugs[] = 'banner-content-and-text';
			$contextual_slugs[] = 'banner-layout-options';
		}

		$script_blocking = (bool) wpconsent()->settings->get_option( 'enable_script_blocking' );
		if ( ! $script_blocking ) {
			$contextual_slugs[] = 'automatic-script-blocking';
		}

		$scan_data = wpconsent()->scanner->get_scan_data();
		if ( empty( $scan_data['date'] ) ) {
			$contextual_slugs[] = 'scanning-your-website';
		}

		$policy_page_id = (int) wpconsent()->settings->get_option( 'cookie_policy_page' );
		$policy_exists  = $policy_page_id > 0 && 'publish' === get_post_status( $policy_page_id );
		if ( ! $policy_exists ) {
			$contextual_slugs[] = 'cookie-policy-page';
		}

		$cookie_count = (int) wp_count_posts( 'wpconsent_cookie' )->publish;
		if ( 0 === $cookie_count ) {
			$contextual_slugs[] = 'managing-cookie-categories';
			$contextual_slugs[] = 'managing-services';
		}

		// Fallback articles for when everything is configured.
		$fallback_slugs = array(
			'banner-styling',
			'google-consent-mode-v2',
			'content-blocking-and-placeholders',
			'how-to-customize-the-wpconsent-banner-with-css-variables',
			'troubleshooting-guide',
		);

		// Build the final article list: contextual first, backfill with fallbacks.
		$articles = array();
		$used     = array();

		foreach ( $contextual_slugs as $slug ) {
			if ( count( $articles ) >= 5 ) {
				break;
			}
			if ( isset( $by_slug[ $slug ] ) && ! isset( $used[ $slug ] ) ) {
				$articles[]    = $by_slug[ $slug ];
				$used[ $slug ] = true;
			}
		}

		foreach ( $fallback_slugs as $slug ) {
			if ( count( $articles ) >= 5 ) {
				break;
			}
			if ( isset( $by_slug[ $slug ] ) && ! isset( $used[ $slug ] ) ) {
				$articles[]    = $by_slug[ $slug ];
				$used[ $slug ] = true;
			}
		}

		return $articles;
	}

	/**
	 * Build a slug-to-doc lookup from the docs JSON data.
	 *
	 * @return array Associative array of slug => doc data.
	 */
	protected function get_docs_by_slug() {
		if ( null !== $this->cached_docs_by_slug ) {
			return $this->cached_docs_by_slug;
		}

		$docs = new WPConsent_Docs();
		$all  = $docs->get_docs();

		if ( empty( $all ) ) {
			return array();
		}

		$by_slug = array();
		foreach ( $all as $doc ) {
			if ( empty( $doc['url'] ) ) {
				continue;
			}
			$slug = trim( wp_parse_url( $doc['url'], PHP_URL_PATH ), '/' );
			$parts = explode( '/', $slug );
			$slug  = end( $parts );
			if ( ! empty( $slug ) ) {
				$by_slug[ $slug ] = $doc;
			}
		}

		$this->cached_docs_by_slug = $by_slug;

		return $by_slug;
	}

	/**
	 * Documentation widget with contextual article recommendations.
	 *
	 * @return void
	 */
	public function docs_widget() {
		$articles = $this->get_doc_articles();
		?>
		<div class="wpconsent-dashboard-box wpconsent-docs-widget">
			<div class="wpconsent-dashboard-box-title">
				<h2><?php esc_html_e( 'Help & Documentation', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
			</div>
			<div class="wpconsent-dashboard-box-content">
				<?php if ( ! empty( $articles ) ) : ?>
					<h3 class="wpconsent-docs-section-title"><?php esc_html_e( 'Recommended for you', 'wpconsent-cookies-banner-privacy-suite' ); ?></h3>
					<ul class="wpconsent-docs-list">
						<?php foreach ( $articles as $article ) : ?>
							<li class="wpconsent-docs-item">
								<a href="<?php echo esc_url( wpconsent_utm_url( $article['url'], 'dashboard', 'docs-widget' ) ); ?>" class="wpconsent-docs-link" data-doc-url="<?php echo esc_url( $article['url'] ); ?>">
									<?php echo esc_html( $article['title'] ); ?>
								</a>
							</li>
						<?php endforeach; ?>
					</ul>
				<?php else : ?>
					<p>
						<?php esc_html_e( 'Browse our documentation for guides, tutorials, and troubleshooting.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
					</p>
				<?php endif; ?>
			</div>
			<div class="wpconsent-dashboard-box-actions">
				<a href="#" class="wpconsent-button wpconsent-button-secondary wpconsent-show-help">
					<?php esc_html_e( 'Browse all documentation', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</a>
			</div>
		</div>
		<?php
	}
}
