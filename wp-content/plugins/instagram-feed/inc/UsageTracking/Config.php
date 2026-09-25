<?php
/**
 * Smash Usage Tracking configuration.
 *
 * API URL and option names. Reusable across plugins.
 *
 * @package InstagramFeed\UsageTracking
 * @since 6.10
 */

namespace InstagramFeed\UsageTracking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Config {

	/**
	 * Option key: enabled flag and last_send timestamp.
	 * Reuses the legacy usage-tracking option so existing consent carries over.
	 */
	const OPTION_TRACKING = 'sbi_usage_tracking';

	/**
	 * Default enabled state when the option has never been saved.
	 * Matches the legacy default: opt-in required for the free plugin.
	 */
	const DEFAULT_ENABLED = false;

	/**
	 * Option key: site token returned by the API.
	 */
	const OPTION_SITE_TOKEN = 'sbi_smash_usage_tracking_site_token';

	/**
	 * Option key: schedule metadata (optional).
	 */
	const OPTION_SCHEDULE = 'sbi_smash_usage_tracking_schedule';

	/**
	 * Option key: dates when plugin was active (Y-m-d), for days_active metric.
	 */
	const OPTION_ACTIVE_DATES = 'sbi_smash_usage_active_dates';

	/**
	 * Option key: last N session durations in seconds, for session_duration metric.
	 */
	const OPTION_SESSION_DURATIONS = 'sbi_smash_usage_session_durations';

	/**
	 * Cron hook name. Different from the Pro plugin and the legacy hook to avoid duplicate sends
	 * on sites where both free and pro are installed simultaneously.
	 */
	const CRON_HOOK = 'sbi_free_smash_usage_tracking_cron';

	/**
	 * Max request timeout in seconds for usage report (large payloads).
	 */
	const REQUEST_TIMEOUT = 30;

	/**
	 * Max payload size in bytes before send is skipped (default 2MB).
	 */
	const MAX_PAYLOAD_BYTES = 2097152;

	/**
	 * Register-site endpoint path (relative to API base).
	 */
	const REGISTER_SITE_PATH = '/v1/register-site';

	/**
	 * Usage report endpoint path (relative to API base).
	 */
	const USAGE_REPORT_PATH = '/v1/usage-report';

	/**
	 * Get the API base URL (filterable).
	 *
	 * @return string
	 */
	public static function get_api_url() {
		$url = defined( 'SBI_SMASH_USAGE_TRACKING_API_URL' ) ? SBI_SMASH_USAGE_TRACKING_API_URL : '';
		return (string) apply_filters( 'sbi_smash_usage_tracking_api_url', $url );
	}

	/**
	 * Get full URL for register-site endpoint.
	 *
	 * @return string
	 */
	public static function get_register_site_url() {
		return rtrim( self::get_api_url(), '/' ) . self::REGISTER_SITE_PATH;
	}

	/**
	 * Get full URL for usage-report endpoint.
	 *
	 * @return string
	 */
	public static function get_usage_report_url() {
		return rtrim( self::get_api_url(), '/' ) . self::USAGE_REPORT_PATH;
	}

	/**
	 * Check if tracking is enabled.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		$opt = get_option( self::OPTION_TRACKING, false );
		if ( ! is_array( $opt ) || ! array_key_exists( 'enabled', $opt ) ) {
			return self::DEFAULT_ENABLED;
		}
		return ! empty( $opt['enabled'] );
	}
}
