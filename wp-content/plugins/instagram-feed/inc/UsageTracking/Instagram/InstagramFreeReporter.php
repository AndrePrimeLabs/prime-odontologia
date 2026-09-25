<?php
/**
 * Instagram reporter for Smash Usage Tracking — Free plugin variant.
 *
 * Identical to a Pro reporter except license methods always return
 * free/null values since the Free plugin has no EDD license infrastructure.
 *
 * @package InstagramFeed\UsageTracking\Instagram
 * @since 6.10
 */

namespace InstagramFeed\UsageTracking\Instagram;

use InstagramFeed\UsageTracking\ReporterInterface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class InstagramFreeReporter implements ReporterInterface {

	// 1.1: errors.by_type accumulates across the reporting period (previously
	// a cron-time sample) and errors.expiring_token_errors is produced.
	const SCHEMA_VERSION = '1.1';

	/**
	 * Plugin slug for payload root.
	 *
	 * @return string
	 */
	public function get_plugin_slug() {
		return 'instagram';
	}

	/**
	 * Schema version for the report payload.
	 *
	 * @return string
	 */
	public function get_schema_version() {
		return self::SCHEMA_VERSION;
	}

	/**
	 * Configuration snapshot (environment, settings, sources, feeds).
	 *
	 * @return array
	 */
	public function get_configuration_snapshot() {
		$global_settings = $this->get_global_settings();

		// Single DB scan — reused for latest sample, summary, and features map.
		$all_feed_data = $this->get_all_feed_data();

		return array(
			'environment'      => $this->get_environment(),
			'global_settings'  => $global_settings,
			'sources'          => $this->get_sources_summary(),
			'latest_10_feeds'  => $this->get_latest_feeds( $all_feed_data ),
			'feeds'            => $this->get_feeds_summary( $all_feed_data ),
			'features_enabled' => $this->get_features_enabled( $all_feed_data, $global_settings ),
			'template_usage'   => $this->get_template_usage( $all_feed_data ),
			'source_types'     => $this->get_source_types( $all_feed_data ),
			'version'          => defined( 'SBIVER' ) ? SBIVER : '',
			'license_tier'     => $this->get_license_tier(),
			'license_status'   => $this->get_license_status(),
			'license_expires'  => $this->get_license_expires(),
			'license_item_id'  => $this->get_license_item_id(),
		);
	}

	/**
	 * Dynamic metrics for the given period.
	 *
	 * @param string|int $period_start Start of period (ISO 8601 or timestamp).
	 * @param string|int $period_end   End of period (ISO 8601 or timestamp).
	 * @return array
	 */
	public function get_dynamic_metrics( $period_start, $period_end ) {
		$ts_start = is_numeric( $period_start ) ? (int) $period_start : strtotime( $period_start );
		$ts_end   = is_numeric( $period_end ) ? (int) $period_end : strtotime( $period_end );

		return array(
			'period_start'     => $period_start,
			'period_end'       => $period_end,
			'performance'      => $this->get_performance_metrics(),
			'errors'           => $this->get_error_metrics( $ts_start, $ts_end ),
			'events'           => $this->get_events_for_period( $ts_start, $ts_end ),
			'days_active'      => $this->get_days_active( $period_start, $period_end ),
			'session_duration' => $this->get_session_duration(),
		);
	}

	/**
	 * Environment data (WP, PHP, theme, locale, multisite, install age).
	 *
	 * @return array
	 */
	private function get_environment() {
		$install_ts = null;
		$statuses   = get_option( 'sbi_statuses', array() );
		if ( ! empty( $statuses['first_install'] ) && is_numeric( $statuses['first_install'] ) ) {
			$install_ts = (int) $statuses['first_install'];
		}
		if ( null === $install_ts ) {
			$install_ts = (int) get_option( 'sbi_installed_timestamp', 0 );
		}
		$install_age_days = $install_ts ? max( 0, (int) ((time() - $install_ts) / DAY_IN_SECONDS) ) : 0;

		$theme      = wp_get_theme();
		$theme_name = $theme->exists() ? $theme->get( 'Name' ) : '';

		return array(
			'wp_version'           => get_bloginfo( 'version' ),
			'php_version'          => PHP_VERSION,
			'active_theme'         => $theme_name,
			'locale'               => get_locale(),
			'multisite'            => is_multisite(),
			'site_count'           => is_multisite() ? (int) get_blog_count() : 1,
			'active_plugins_count' => count(
                array_unique(
                    array_merge(
                        (array) get_option( 'active_plugins', array() ),
                        array_keys( (array) get_site_option( 'active_sitewide_plugins', array() ) )
                    )
                )
            ),
			'install_age_days'     => $install_age_days,
		);
	}

	/**
	 * Global Instagram Feed settings (caching, gdpr, preserve, advanced tab).
	 *
	 * @return array
	 */
	private function get_global_settings() {
		$settings = get_option( 'sb_instagram_settings', array() );
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		return array(
			'caching_type'             => isset( $settings['sbi_caching_type'] ) ? $settings['sbi_caching_type'] : 'background',
			'cron_interval'            => isset( $settings['sbi_cache_cron_interval'] ) ? $settings['sbi_cache_cron_interval'] : '12hours',
			'gdpr'                     => isset( $settings['gdpr'] ) ? $settings['gdpr'] : 'auto',
			'preserve_settings'        => ! empty( $settings['sb_instagram_preserve_settings'] ),
			'optimize_images'          => empty( $settings['sb_instagram_disable_resize'] ),
			'ajax_theme_loading_fix'   => ! empty( $settings['sb_instagram_ajax_theme'] ),
			'ajax_initial_load'        => ! empty( $settings['sb_ajax_initial'] ),
			'disable_js_image_load'    => ! empty( $settings['disable_js_image_loading'] ),
			'disable_admin_notice'     => ! empty( $settings['disable_admin_notice'] ),
			'enable_email_report'      => ! empty( $settings['enable_email_report'] ) && 'off' !== $settings['enable_email_report'],
			'email_notification_day'   => isset( $settings['email_notification'] ) ? $settings['email_notification'] : '',
			'email_notification_set'   => ! empty( $settings['email_notification_addresses'] ),
			'enqueue_js_in_head'       => ! empty( $settings['enqueue_js_in_head'] ),
			'enqueue_css_in_shortcode' => ! empty( $settings['enqueue_css_in_shortcode'] ),
		);
	}

	/**
	 * Sources summary (connected accounts count, account types).
	 *
	 * @return array
	 */
	private function get_sources_summary() {
		global $wpdb;
		$sources_table = $wpdb->prefix . 'sbi_sources';
		$table_exists  = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $sources_table ) ) === $sources_table;

		$connected_accounts_count = 0;
		$account_type             = array(
			'personal' => 0,
			'business' => 0,
			'basic'    => 0,
		);

		if ( $table_exists ) {
			$connected_accounts_count = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$sources_table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name derived from $wpdb->prefix, not user input.
			$personal_count           = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$sources_table} WHERE account_type = %s", 'personal' ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name derived from $wpdb->prefix, not user input.
			$business_count           = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$sources_table} WHERE account_type = %s", 'business' ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name derived from $wpdb->prefix, not user input.
			$basic_count              = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$sources_table} WHERE account_type = %s", 'basic' ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name derived from $wpdb->prefix, not user input.
			$account_type             = array(
				'personal' => $personal_count,
				'business' => $business_count,
				'basic'    => $basic_count,
			);
		}

		return array(
			'connected_accounts_count' => $connected_accounts_count,
			'account_type'             => $account_type,
		);
	}

	/**
	 * Whitelist of feed setting keys to track.
	 *
	 * @var string[]
	 */
	private static $feed_settings_whitelist = array(
		'type',
		'layout',
		'cols',
		'colsmobile',
		'num',
		'nummobile',
		'loadmore',
		'showheader',
		'lightbox',
		'disablelightbox',
		'enablemoderationmode',
		'shoppablelist',
		'moderationlist',
		'stories',
		'carousel',
		'hashtag',
		'tagged',
		'order',
		'mediatype',
		'videostypes',
		'igtvposts',
		'hoverdisplay',
		'captionlinks',
		'cachetime',
		'cacheunit',
		'headerstyle',
		'headersize',
		'outside_scrollable',
	);

	/**
	 * Load every feed's decoded settings plus feed_name, sorted newest-first.
	 *
	 * @return array[]
	 */
	private function get_all_feed_data(): array {
		global $wpdb;
		$table        = $wpdb->prefix . 'sbi_feeds';
		$table_exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) === $table;

		if ( ! $table_exists ) {
			return array();
		}

		$rows = $wpdb->get_results(
			"SELECT feed_name, settings FROM {$table} ORDER BY last_modified DESC LIMIT 500", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name derived from $wpdb->prefix, not user input.
			ARRAY_A
		);

		$out = array();
		foreach ( $rows as $row ) {
			$decoded = ! empty( $row['settings'] ) ? json_decode( $row['settings'], true ) : array();
			$out[]   = array(
				'feed_name' => isset( $row['feed_name'] ) ? sanitize_text_field( (string) $row['feed_name'] ) : '',
				'settings'  => is_array( $decoded ) ? $decoded : array(),
			);
		}

		return $out;
	}

	/**
	 * Latest 15 feeds with whitelisted settings.
	 *
	 * @param array[] $all_feed_data From get_all_feed_data().
	 * @return array
	 */
	private function get_latest_feeds( array $all_feed_data ): array {
		$feeds = array();
		foreach ( array_slice( $all_feed_data, 0, 15 ) as $row ) {
			$feed_name = $row['feed_name'];
			if ( strlen( $feed_name ) > 255 ) {
				$feed_name = substr( $feed_name, 0, 255 );
			}
			$feeds[] = array(
				'feed_name' => $feed_name,
				'settings'  => $this->pick_whitelisted_settings( $row['settings'] ),
			);
		}
		return $feeds;
	}

	/**
	 * Aggregate feed type and layout distribution across ALL feeds.
	 *
	 * @param array[] $all_feed_data From get_all_feed_data().
	 * @return array
	 */
	private function get_feeds_summary( array $all_feed_data ): array {
		$by_type   = array();
		$by_layout = array();

		foreach ( $all_feed_data as $row ) {
			$s      = $row['settings'];
			$type   = isset( $s['type'] ) ? (string) $s['type'] : 'user';
			$layout = isset( $s['layout'] ) ? (string) $s['layout'] : 'grid';

			$by_type[ $type ]     = ($by_type[ $type ] ?? 0) + 1;
			$by_layout[ $layout ] = ($by_layout[ $layout ] ?? 0) + 1;
		}

		return array(
			'total_count' => count( $all_feed_data ),
			'by_type'     => $by_type,
			'by_layout'   => $by_layout,
		);
	}

	/**
	 * Flat boolean feature map for the Laravel dashboard's feature adoption page.
	 *
	 * @param array[] $all_feed_data   From get_all_feed_data().
	 * @param array   $global_settings From get_global_settings().
	 * @return array<string,bool>
	 */
	private function get_features_enabled( array $all_feed_data, array $global_settings ): array {
		$feed_flags = array(
			'lightbox'         => false,
			'load_more'        => false,
			'show_header'      => false,
			'masonry_layout'   => false,
			'carousel_layout'  => false,
			'highlight_layout' => false,
			'hashtag_feeds'    => false,
			'tagged_feeds'     => false,
			'stories'          => false,
			'moderation'       => false,
			'shoppable'        => false,
			'ajax_initial'     => false,
		);

		foreach ( $all_feed_data as $row ) {
			$s = $row['settings'];

			if ( ! $feed_flags['lightbox'] && empty( $s['disablelightbox'] ) && empty( $s['sb_instagram_disable_lightbox'] ) ) {
$feed_flags['lightbox'] = true;
            }
			if ( ! $feed_flags['load_more'] && ! empty( $s['loadmore'] ) ) {
$feed_flags['load_more'] = true;
            }
			if ( ! $feed_flags['show_header'] && ! empty( $s['showheader'] ) ) {
$feed_flags['show_header'] = true;
            }
			if ( ! $feed_flags['masonry_layout'] && isset( $s['layout'] ) && 'masonry' === $s['layout'] ) {
$feed_flags['masonry_layout'] = true;
            }
			if ( ! $feed_flags['carousel_layout'] && isset( $s['layout'] ) && 'carousel' === $s['layout'] ) {
$feed_flags['carousel_layout'] = true;
            }
			if ( ! $feed_flags['highlight_layout'] && isset( $s['layout'] ) && 'highlight' === $s['layout'] ) {
$feed_flags['highlight_layout'] = true;
            }
			if ( ! $feed_flags['hashtag_feeds'] && isset( $s['type'] ) && 'hashtag' === $s['type'] ) {
$feed_flags['hashtag_feeds'] = true;
            }
			if ( ! $feed_flags['tagged_feeds'] && isset( $s['type'] ) && 'tagged' === $s['type'] ) {
$feed_flags['tagged_feeds'] = true;
            }
			if ( ! $feed_flags['stories'] && ! empty( $s['stories'] ) ) {
$feed_flags['stories'] = true;
            }
			if ( ! $feed_flags['moderation'] && ! empty( $s['enablemoderationmode'] ) ) {
$feed_flags['moderation'] = true;
            }
			if ( ! $feed_flags['shoppable'] && ! empty( $s['shoppablelist'] ) ) {
$feed_flags['shoppable'] = true;
            }

			if ( ! in_array( false, $feed_flags, true ) ) {
				break;
			}
		}

		return array_merge(
            $feed_flags,
            array(
				'optimize_images'    => (bool) ($global_settings['optimize_images'] ?? true),
				'ajax_theme_fix'     => (bool) ($global_settings['ajax_theme_loading_fix'] ?? false),
				'ajax_initial'       => (bool) ($global_settings['ajax_initial_load'] ?? false),
				'gdpr_enabled'       => isset( $global_settings['gdpr'] ) && 'auto' !== $global_settings['gdpr'],
				'background_caching' => ($global_settings['caching_type'] ?? '') === 'background',
				'email_report'       => (bool) ($global_settings['enable_email_report'] ?? false),
				'preserve_settings'  => (bool) ($global_settings['preserve_settings'] ?? false),
            )
        );
	}

	/**
	 * Return only whitelisted feed settings.
	 *
	 * @param array $settings Raw feed settings.
	 * @return array
	 */
	private function pick_whitelisted_settings( array $settings ) {
		$out = array();
		foreach ( self::$feed_settings_whitelist as $key ) {
			if ( ! array_key_exists( $key, $settings ) ) {
				continue;
			}
			$value = $settings[ $key ];
			if ( is_array( $value ) ) {
				$out[ $key ] = $value;
			} elseif ( is_scalar( $value ) ) {
				$out[ $key ] = $value;
			}
		}
		return $out;
	}

	/**
	 * Template distribution across all feeds.
	 * Uses the layout setting (the only visual template option in the Free plugin).
	 *
	 * @param array[] $all_feed_data From get_all_feed_data().
	 * @return array
	 */
	private function get_template_usage( array $all_feed_data ): array {
		$usage = array();
		foreach ( $all_feed_data as $row ) {
			$s                  = $row['settings'];
			$template           = isset( $s['layout'] ) && '' !== $s['layout'] ? (string) $s['layout'] : 'default';
			$usage[ $template ] = ($usage[ $template ] ?? 0) + 1;
		}
		return $usage;
	}

	/**
	 * Source type distribution across all feeds (user / hashtag / tagged).
	 *
	 * @param array[] $all_feed_data From get_all_feed_data().
	 * @return array
	 */
	private function get_source_types( array $all_feed_data ): array {
		$types = array();
		foreach ( $all_feed_data as $row ) {
			$s              = $row['settings'];
			$type           = isset( $s['type'] ) && '' !== $s['type'] ? (string) $s['type'] : 'user';
			$types[ $type ] = ($types[ $type ] ?? 0) + 1;
		}
		return $types;
	}

	// ── License methods ───────────────────────────────────────────────────────
	// The Free plugin has no EDD license infrastructure. These return static
	// values so the payload is always consistent and the dashboard can correctly
	// segment free vs paid sites.

	/** @return string */
	private function get_license_tier() {
return 'free'; }

	/** @return null */
	private function get_license_status() {
return null; }

	/** @return null */
	private function get_license_expires() {
return null; }

	/** @return null */
	private function get_license_item_id() {
return null; }

	// ── Metrics methods ───────────────────────────────────────────────────────

	/**
	 * Performance metrics (feed caches count, cache requests count).
	 *
	 * @return array
	 */
	private function get_performance_metrics() {
		global $wpdb;
		$cache_table  = $wpdb->prefix . 'sbi_feed_caches';
		$table_exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $cache_table ) ) === $cache_table;

		$feed_caches_count    = 0;
		$cache_requests_count = 0;

		if ( $table_exists ) {
			$feed_caches_count    = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$cache_table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name derived from $wpdb->prefix, not user input.
			$cache_requests_count = (int) get_option( 'sbi_smash_cache_requests_count', 0 );
		}

		return array(
			'feed_caches_count'    => $feed_caches_count,
			'cache_requests_count' => $cache_requests_count,
		);
	}

	/**
	 * Map an Instagram API error code to a category.
	 *
	 * Delegates to the Token_Health routing table so telemetry and the
	 * user-facing layer share one taxonomy (the previous local list called
	 * 100 not_found while the copy says token-invalid, and called 18 server
	 * while the runtime treats it as a hashtag limit). The Instagram-platform
	 * expiry codes are not map rows (AgDR-0085), so they are bucketed here.
	 *
	 * @param int|string $code
	 * @return string
	 */
	private function categorise_error_code( $code ): string {
		$code = (int) $code;

		if ( in_array( $code, \InstagramFeed\UsageTracking\ErrorAccumulator::EXPIRY_CODES, true ) ) {
			return 'auth';
		}

		$route = \InstagramFeed\Token_Health\MetaErrorMap::route( $code );

		return $route['telemetry_category'];
	}

	/**
	 * Error metrics: period-accurate categorised counts and latest 10 errors.
	 *
	 * Instagram stores errors under the `sb_instagram_errors` option; that
	 * option is a live snapshot, so `by_type` and `expiring_token_errors`
	 * come from the per-day ErrorAccumulator instead — errors recorded and
	 * cleared mid-week still count. `latest` stays a sample of what is in
	 * the option right now. One failure recorded at two layers may increment
	 * a bucket twice; counts are decision-grade trends, not exact totals.
	 *
	 * @param int $ts_start Period start timestamp.
	 * @param int $ts_end   Period end timestamp.
	 * @return array
	 */
	private function get_error_metrics( $ts_start, $ts_end ) {
		$reporter = get_option( 'sb_instagram_errors', array() );
		if ( ! is_array( $reporter ) ) {
			$reporter = array();
		}
		$connection = isset( $reporter['connection'] ) && is_array( $reporter['connection'] ) ? $reporter['connection'] : array();
		$accounts   = isset( $reporter['accounts'] ) && is_array( $reporter['accounts'] ) ? $reporter['accounts'] : array();
		$error_log  = isset( $reporter['error_log'] ) && is_array( $reporter['error_log'] ) ? $reporter['error_log'] : array();
		$revoked    = isset( $reporter['revoked'] ) && is_array( $reporter['revoked'] ) ? $reporter['revoked'] : array();

		$api_failures = count( $error_log ) > 0 ? count( $error_log ) : ( ! empty( $connection ) ? 1 : 0);

		$provider_errors = 0;
		foreach ( $accounts as $account_errors ) {
			if ( is_array( $account_errors ) ) {
				$provider_errors += count( $account_errors );
			}
		}

		$latest = $this->build_latest_errors_array( $reporter, $error_log, $connection, $accounts );

		$by_type = array(
			'auth'             => 0,
			'rate_limit'       => 0,
			'permission'       => 0,
			'not_found'        => 0,
			'server'           => 0,
			'network'          => 0,
			'misconfiguration' => 0,
			'other'            => 0,
		);

		$accumulated = \InstagramFeed\UsageTracking\ErrorAccumulator::totals_for_period( $ts_start, $ts_end );
		foreach ( $accumulated['by_type'] as $cat => $count ) {
			if ( array_key_exists( $cat, $by_type ) ) {
				$by_type[ $cat ] += (int) $count;
			} else {
				$by_type['other'] += (int) $count;
			}
		}

		$critical_count = 0;
		foreach ( $latest as $err ) {
			if ( ! empty( $err['critical'] ) ) {
++$critical_count;
            }
		}

		return array(
			'api_failures'          => $api_failures,
			'provider_errors'       => $provider_errors,
			'by_type'               => $by_type,
			'expiring_token_errors' => $accumulated['expiring_token_errors'],
			'critical_count'        => $critical_count,
			'revoked_accounts'      => count( $revoked ),
			'latest'                => array_slice( $latest, 0, 10 ),
		);
	}

	/**
	 * Build annotated error list (no tokens or PII).
	 */
	private function build_latest_errors_array( $reporter, $error_log, $connection, $accounts ) {
		$latest = array();

		foreach ( array_slice( $error_log, -10 ) as $log_entry ) {
			$str       = is_string( $log_entry ) ? $log_entry : '';
			$prefix    = '';
			$logged_at = '';

			if ( preg_match( '/^(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+-/', $str, $m ) ) {
				$logged_at = $m[1];
				$prefix    = $m[0];
			}

			$message  = trim( substr( $str, strlen( $prefix ) ) );
			$message  = $this->sanitize_error_message( $message, 300 );
			$code     = null;
			$category = 'other';

			if ( preg_match( '/(?:api error|error)\s+(\d{1,7})/i', $message, $cm ) ) {
				$code     = (int) $cm[1];
				$category = $this->categorise_error_code( $code );
			}

			$entry = array(
				'type'      => 'log',
				'category'  => $category,
				'logged_at' => $logged_at,
				'message'   => $message,
			);
			if ( null !== $code ) {
$entry['error_code'] = $code;
            }
			$latest[] = $entry;
		}

		if ( ! empty( $connection ) && isset( $connection['error_id'] ) ) {
			$error_id = $connection['error_id'];
			$code     = is_numeric( $error_id ) ? (int) $error_id : null;
			$category = null !== $code ? $this->categorise_error_code( $code ) : 'network';
			$latest[] = array(
				'type'       => 'connection',
				'category'   => $category,
				'error_code' => $code,
				'error_id'   => $error_id,
				'critical'   => ! empty( $connection['critical'] ),
			);
		}

		foreach ( $accounts as $account_id => $by_type ) {
			if ( ! is_array( $by_type ) ) {
continue;
            }
			foreach ( $by_type as $error_type => $err ) {
				if ( ! is_array( $err ) ) {
continue;
                }
				$code     = isset( $err['error']['code'] ) ? (int) $err['error']['code'] : (isset( $err['errorno'] ) ? (int) $err['errorno'] : null);
				$category = 'accesstoken' === $error_type ? 'auth' : (null !== $code ? $this->categorise_error_code( $code ) : 'auth');
				$item     = array(
					'type'       => 'account',
					'category'   => $category,
					'error_type' => $error_type,
					'critical'   => ! empty( $err['critical'] ),
				);
				if ( null !== $code ) {
$item['error_code'] = $code;
                }
				if ( isset( $err['errorno'] ) ) {
$item['errorno'] = $err['errorno'];
                }
				$latest[] = $item;
			}
		}

		$system_keys = array( 'resizing', 'database_create', 'upload_dir' );
		foreach ( $system_keys as $key ) {
			if ( empty( $reporter[ $key ] ) ) {
continue;
            }
			$msg      = is_array( $reporter[ $key ] ) ? wp_json_encode( $reporter[ $key ] ) : (string) $reporter[ $key ];
			$latest[] = array(
				'type'     => $key,
				'category' => 'other',
				'message'  => $this->sanitize_error_message( $msg, 300 ),
			);
		}

		return $latest;
	}

	/**
	 * Strip tokens and truncate error message.
	 */
	private function sanitize_error_message( $message, $max_len = 300 ) {
		// Redact known credential key=value patterns
		$message = preg_replace(
			'/\b(access_token|accesstoken|api_key|api_secret|client_id|client_secret|consumer_key|consumer_secret|secret_key|auth_token|refresh_token|private_key|token)\s*[=:]\s*["\']?[^\s&"\'\\\\,\]}\)]{4,}["\']?/i',
			'$1=[REDACTED]',
			$message
		);
		// Redact Bearer tokens
		$message = preg_replace( '/\bBearer\s+[A-Za-z0-9\-._~+\/]+=*/i', 'Bearer [REDACTED]', $message );
		if ( strlen( $message ) > $max_len ) {
			$message = substr( $message, 0, $max_len ) . '...';
		}
		return $message;
	}

	/**
	 * Days active in the given period.
	 */
	private function get_days_active( $period_start, $period_end ) {
		$dates = get_option( \InstagramFeed\UsageTracking\Config::OPTION_ACTIVE_DATES, array() );
		if ( ! is_array( $dates ) || empty( $dates ) ) {
			return 0;
		}
		$count = 0;
		$start = strtotime( $period_start );
		$end   = strtotime( $period_end );
		foreach ( $dates as $d ) {
			$ts = strtotime( $d );
			if ( false !== $ts && $ts >= $start && $ts <= $end ) {
				++$count;
			}
		}
		return $count;
	}

	/**
	 * Average of last recorded session durations in seconds.
	 */
	private function get_session_duration() {
		$durations = get_option( \InstagramFeed\UsageTracking\Config::OPTION_SESSION_DURATIONS, array() );
		if ( ! is_array( $durations ) || empty( $durations ) ) {
			return 0;
		}
		return (int) round( array_sum( $durations ) / count( $durations ) );
	}

	/**
	 * Event counts and last_date for each event.
	 */
	private function get_events_for_period( $ts_start, $ts_end ) {
		$events = get_option( 'sbi_smash_usage_events', array() );
		if ( ! is_array( $events ) ) {
			return array();
		}

		$first          = reset( $events );
		$is_legacy_list = is_array( $first ) && ! isset( $first['count'] ) && (isset( $first['event'] ) || isset( $first['timestamp'] ) || isset( $first['time'] ));

		if ( $is_legacy_list ) {
			$out = array();
			foreach ( $events as $entry ) {
				if ( ! is_array( $entry ) ) {
continue;
                }
				$ts = isset( $entry['timestamp'] ) ? (int) $entry['timestamp'] : (isset( $entry['time'] ) ? (int) $entry['time'] : 0);
				if ( $ts < $ts_start || $ts > $ts_end ) {
continue;
                }
				$name = isset( $entry['event'] ) ? $entry['event'] : (isset( $entry['name'] ) ? $entry['name'] : '');
				if ( '' !== $name ) {
					if ( ! isset( $out[ $name ] ) ) {
$out[ $name ] = array(
	'count'     => 0,
	'last_date' => null,
);
                    }
					++$out[ $name ]['count'];
					$date = $ts ? gmdate( 'Y-m-d', $ts ) : null;
					if ( $date && (null === $out[ $name ]['last_date'] || $date > $out[ $name ]['last_date']) ) {
$out[ $name ]['last_date'] = $date;
                    }
				}
			}
			return $out;
		}

		$out = array();
		foreach ( $events as $name => $value ) {
			if ( ! is_string( $name ) || '' === $name ) {
continue;
            }
			if ( is_array( $value ) && isset( $value['count'] ) ) {
				$last_date = isset( $value['last_date'] ) && is_string( $value['last_date'] ) ? $value['last_date'] : null;
				$last_ts   = $last_date ? strtotime( $last_date ) : false;
				if ( false === $last_ts || $last_ts < $ts_start || $last_ts > $ts_end ) {
					continue;
				}
				$out[ $name ] = array(
					'count'     => (int) $value['count'],
					'last_date' => $last_date,
				);
				continue;
			}
			if ( is_numeric( $value ) ) {
				$out[ $name ] = array(
					'count'     => (int) $value,
					'last_date' => null,
				);
			}
		}

		return $out;
	}
}
