<?php
/**
 * WPConsent Usage Tracking Lite
 *
 * @package WPConsent
 * @since 1.0.0
 */

/**
 * Class WPConsent_Usage_Tracking_Lite
 */
class WPConsent_Usage_Tracking_Lite extends WPConsent_Usage_Tracking {

	/**
	 * Get the type for the request.
	 *
	 * @return string The plugin type.
	 * @since 1.0.0
	 */
	public function get_type() {
		return 'lite';
	}

	/**
	 * Is the usage tracking enabled?
	 *
	 * @return bool
	 */
	public function is_enabled() {
		return boolval( wpconsent()->settings->get_option( 'usage_tracking' ) );
	}
}
