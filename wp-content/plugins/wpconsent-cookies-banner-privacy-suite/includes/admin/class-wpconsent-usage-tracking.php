<?php
/**
 * Class WPConsent_Usage_Tracking - The abstract class for the usage tracking.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The abstract class for the usage tracking.
 */
abstract class WPConsent_Usage_Tracking {
	/**
	 * Returns the current plugin version type ("lite" or "pro").
	 *
	 * @return string The version type.
	 * @since 1.0.0
	 */
	abstract public function get_type();

	/**
	 * Is the usage tracking enabled?
	 *
	 * @return bool
	 * @since 1.0.0
	 */
	abstract public function is_enabled();

	/**
	 * Usage Tracking endpoint.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	private $url = 'https://usage.wpconsent.com/v1/track';

	/**
	 * Option name to store the timestamp of the last run.
	 *
	 * @since 1.0.0
	 */
	const LAST_RUN = 'wpconsent_send_usage_last_run';

	/**
	 * Class Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'init' ), 2 );
		add_action( 'wpconsent_usage_tracking_cron', array( $this, 'process' ) );
	}

	/**
	 * Initiate the usage tracking cron.
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public function init() {
		if ( ! wp_next_scheduled( 'wpconsent_usage_tracking_cron' ) ) {
			$tracking             = array();
			$tracking['day']      = wp_rand( 0, 6 );
			$tracking['hour']     = wp_rand( 0, 23 );
			$tracking['minute']   = wp_rand( 0, 59 );
			$tracking['second']   = wp_rand( 0, 59 );
			$tracking['offset']   = ( $tracking['day'] * DAY_IN_SECONDS ) + ( $tracking['hour'] * HOUR_IN_SECONDS ) + ( $tracking['minute'] * MINUTE_IN_SECONDS ) + $tracking['second'];
			$tracking['initsend'] = strtotime( 'next sunday' ) + $tracking['offset'];

			wp_schedule_event( $tracking['initsend'], 'weekly', 'wpconsent_usage_tracking_cron' );
			update_option( 'wpconsent_usage_tracking_config', $tracking, false );
		}
	}

	/**
	 * Processes the usage tracking.
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public function process() {
		if ( ! $this->is_enabled() ) {
			return;
		}

		$last_run = get_option( self::LAST_RUN );

		// Make sure we do not run it more than once a day.
		if ( false !== $last_run && ( time() - $last_run ) < DAY_IN_SECONDS ) {
			return;
		}

		wp_remote_post(
			$this->get_url(),
			array(
				'timeout'    => 10,
				'headers'    => array(
					'Content-Type' => 'application/json; charset=utf-8',
				),
				'user-agent' => $this->get_user_agent(),
				'body'       => wp_json_encode( $this->get_data() ),
			)
		);

		// If we have completed successfully, recheck in 1 week.
		update_option( self::LAST_RUN, time() );
	}

	/**
	 * Gets the URL for the usage tracking api.
	 *
	 * @return string The URL to use for the api requests.
	 * @since 1.0.0
	 */
	private function get_url() {
		if ( defined( 'WPCONSENT_USAGE_TRACKING_URL' ) ) {
			return WPCONSENT_USAGE_TRACKING_URL;
		}

		return $this->url;
	}

	/**
	 * Retrieve the data to send to the usage tracking api.
	 *
	 * @return array
	 * @since 1.0.0
	 */
	public function get_data() {
		global $wpdb;

		$theme_data     = wp_get_theme();
		$activated      = get_option( 'wpconsent_activated', array() );
		$installed_date = isset( $activated['wpconsent'] ) ? $activated['wpconsent'] : null;

		$data = array(
			// Generic data (environment).
			'url'                           => home_url(),
			'php_version'                   => PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION,
			'wp_version'                    => get_bloginfo( 'version' ),
			'mysql_version'                 => $wpdb->db_version(),
			'server_version'                => isset( $_SERVER['SERVER_SOFTWARE'] ) ? sanitize_text_field( wp_unslash( $_SERVER['SERVER_SOFTWARE'] ) ) : '',
			'is_ssl'                        => is_ssl(),
			'is_multisite'                  => is_multisite(),
			'sites_count'                   => function_exists( 'get_blog_count' ) ? (int) get_blog_count() : 1,
			'active_plugins'                => $this->get_active_plugins(),
			'theme_name'                    => $theme_data->name,
			'theme_version'                 => $theme_data->version,
			'user_count'                    => function_exists( 'get_user_count' ) ? get_user_count() : null,
			'locale'                        => get_locale(),
			'timezone_offset'               => wp_timezone_string(),
			// WPConsent specific data.
			'wpconsent_version'             => WPCONSENT_VERSION,
			'wpconsent_license_key'         => null,
			'wpconsent_license_type'        => null,
			'wpconsent_is_pro'              => false,
			'wpconsent_lite_installed_date' => $installed_date,
		);

		// Add WPConsent settings and data.
		$data = array_merge( $data, $this->get_wpconsent_data() );

		return $data;
	}

	/**
	 * Return a list of active plugins.
	 *
	 * @return array An array of active plugin data.
	 * @since 1.0.0
	 */
	private function get_active_plugins() {
		if ( ! function_exists( 'get_plugins' ) ) {
			include ABSPATH . '/wp-admin/includes/plugin.php';
		}
		$active  = get_option( 'active_plugins', array() );
		$plugins = array_intersect_key( get_plugins(), array_flip( $active ) );

		return array_map(
			static function ( $plugin ) {
				if ( isset( $plugin['Version'] ) ) {
					return $plugin['Version'];
				}

				return 'Not Set';
			},
			$plugins
		);
	}

	/**
	 * Get the User Agent string that will be sent to the API.
	 *
	 * @return string
	 * @since 1.0.0
	 */
	public function get_user_agent() {
		return 'WPConsent/' . WPCONSENT_VERSION . '; ' . get_bloginfo( 'url' );
	}

	/**
	 * Get the WPConsent data - settings, languages, geo rules, DNT, etc.
	 *
	 * @return array
	 */
	public function get_wpconsent_data() {
		return array_merge(
			$this->get_wpconsent_stats(),
			$this->get_settings_data(),
			$this->get_geo_rules_data(),
			$this->get_languages_data()
		);
	}

	/**
	 * Get the WPConsent settings data, filtered to remove sensitive/unnecessary data.
	 *
	 * @return array
	 */
	protected function get_settings_data() {
		$settings = wpconsent()->settings->get_options();

		return array(
			'wpconsent_settings' => $this->filter_settings( $settings ),
		);
	}

	/**
	 * Filter settings by removing ignored fields and processing special cases.
	 *
	 * @param array $settings The raw settings array.
	 * @return array Filtered settings.
	 */
	protected function filter_settings( $settings ) {
		// Get the list of fields to ignore.
		$ignored_fields = $this->get_ignored_setting_fields();

		// Start with all settings.
		$filtered = $settings;

		foreach ( $ignored_fields as $field ) {
			unset( $filtered[ $field ] );
		}

		$filtered = $this->remove_language_content( $filtered );

		unset( $filtered['geolocation_groups'] );

		unset( $filtered['enabled_languages'] );

		$filtered = $this->sanitize_settings( $filtered );

		// Allow filtering.
		return apply_filters( 'wpconsent_usage_tracking_filtered_settings', $filtered, $settings );
	}

	/**
	 * Get the list of setting fields to ignore from tracking.
	 *
	 * @return array Array of setting keys to exclude.
	 */
	protected function get_ignored_setting_fields() {
		$ignored = array(
			// Banner content - we don't want to track user's custom messages.
			'banner_message',
			'accept_button_text',
			'cancel_button_text',
			'preferences_button_text',
			'preferences_panel_title',
			'preferences_panel_description',
			'cookie_policy_title',
			'cookie_policy_text',
			'save_preferences_button_text',
			'close_button_text',
			'content_blocking_placeholder_text',

			// Banner styling - purely aesthetic, not useful for analytics.
			'banner_background_color',
			'banner_text_color',
			'banner_accept_bg',
			'banner_accept_color',
			'banner_cancel_bg',
			'banner_cancel_color',
			'banner_preferences_bg',
			'banner_preferences_color',
			'button_order',

			// Banner logo - sensitive/personal.
			'banner_logo',

			// Cookie table headers - content.
			'cookie_table_header_name',
			'cookie_table_header_description',
			'cookie_table_header_duration',
			'cookie_table_header_service_url',

			// Internal flags.
			'has_auto_populated_pages',

			// Do Not Track settings.
			'dnt_submit_text',
			'dnt_field_first_name_label',
			'dnt_field_last_name_label',
			'dnt_field_email_label',
			'dnt_field_address_label',
			'dnt_field_zip_label',
			'dnt_field_city_label',
			'dnt_field_state_label',
			'dnt_field_country_label',
			'dnt_field_phone_label',
		);

		/**
		 * Filter the list of ignored setting fields.
		 *
		 * @param array $ignored Array of setting keys to exclude from tracking.
		 */
		return apply_filters( 'wpconsent_usage_tracking_ignored_settings', $ignored );
	}

	/**
	 * Remove language-specific content arrays from settings.
	 * Language codes can be 2-5 characters (e.g., 'en', 'sq', 'pt_BR', 'zh_CN').
	 *
	 * @param array $settings The settings array.
	 * @return array Settings with language content removed.
	 */
	protected function remove_language_content( $settings ) {
		foreach ( $settings as $key => $value ) {
			// Language codes are typically 2-5 chars, contain letters, underscores, and hyphens.
			// and contain translation keys like 'banner_message', 'accept_button_text', etc.
			if ( $this->is_language_content_key( $key, $value ) ) {
				unset( $settings[ $key ] );
			}
		}

		return $settings;
	}

	/**
	 * Check if a settings key represents language content.
	 *
	 * @param string $key   The setting key.
	 * @param mixed  $value The setting value.
	 * @return bool True if this is language content.
	 */
	protected function is_language_content_key( $key, $value ) {
		// Handle numeric keys - these could be language content arrays.
		if ( is_numeric( $key ) ) {
			return true;
		}

		// Check if key looks like a language code 2-5 chars, letters/underscores (e.g., 'en', 'sq', 'pt_BR', 'zh_CN').
		if ( preg_match( '/^[a-z]{2}([_-][a-z]{2,3})?$/i', $key ) ) {
			return true;
		}

		// Check if the value contains typical translation keys.
		return $this->array_contains_translation_keys( $value );
	}

	/**
	 * Check if an array contains translation keys.
	 *
	 * @param array $data The array to check.
	 * @return bool True if the array contains translation keys.
	 */
	protected function array_contains_translation_keys( $data ) {
		if ( ! is_array( $data ) ) {
			return false;
		}

		// Check if the value contains typical translation keys.
		$translation_keys = array(
			// Banner content.
			'banner_message',
			'accept_button_text',
			'cancel_button_text',
			'preferences_button_text',
			'preferences_panel_title',
			'preferences_panel_description',
			'content_blocking_placeholder_text',
			'cookie_policy_title',
		);

		foreach ( $translation_keys as $trans_key ) {
			if ( isset( $data[ $trans_key ] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Sanitize setting values for tracking.
	 *
	 * @param array $settings The filtered settings.
	 * @return array Sanitized settings.
	 */
	protected function sanitize_settings( $settings ) {
		foreach ( $settings as $key => $value ) {
			// Convert page IDs to boolean (just track if configured).
			if ( in_array( $key, array( 'cookie_policy_page', 'dnt_page_id' ), true ) ) {
				$settings[ $key ] = ! empty( $value ) ? 1 : 0;
				continue;
			}

			// Convert manual_scan_pages array to count (don't track actual page IDs).
			if ( 'manual_scan_pages' === $key && is_array( $value ) ) {
				$settings[ $key ] = count( $value );
				continue;
			}

			// Handle any other arrays (convert to JSON).
			if ( is_array( $value ) ) {
				$settings[ $key ] = wp_json_encode( $value );
			}
		}

		return $settings;
	}

	/**
	 * Get languages data for tracking.
	 *
	 * @return array
	 */
	protected function get_languages_data() {
		return array();
	}

	/**
	 * Get geolocation rules data for tracking.
	 *
	 * @return array
	 */
	protected function get_geo_rules_data() {
		return array();
	}

	/**
	 * Track WPConsent-specific data.
	 *
	 * @return array
	 */
	public function get_wpconsent_stats() {
		$wpconsent_data = array(
			'wpconsent_total_categories' => 0,
			'wpconsent_total_services'   => 0,
			'wpconsent_total_cookies'    => 0,
		);

		// Get categories and count them along with their services and cookies.
		$categories       = wpconsent()->cookies->get_categories();
		$total_categories = 0;
		$total_services   = 0;
		$total_cookies    = 0;

		foreach ( $categories as $category_slug => $category ) {
			$category_id = $category['id'];

			// Count this category (only if it has a valid ID).
			if ( $category_id > 0 ) {
				++$total_categories;
			}

			// Get cookies for this category.
			$cookies = wpconsent()->cookies->get_cookies_by_category( $category_id );

			// Skip if get_cookies_by_category returned an error.
			if ( ! is_array( $cookies ) ) {
				continue;
			}

			// Get services for this category.
			$services = wpconsent()->cookies->get_services_by_category( $category_id );

			// Skip if get_services_by_category returned an error.
			if ( ! is_array( $services ) ) {
				$services = array();
			}

			// Count cookies directly attached to this category.
			foreach ( $cookies as $cookie ) {
				// Ensure categories is an array before using it.
				if ( ! isset( $cookie['categories'] ) || ! is_array( $cookie['categories'] ) ) {
					continue;
				}

				if ( count( $cookie['categories'] ) === 1 && $cookie['categories'][0] === $category_id ) {
					++$total_cookies;
				}
			}

			// Count services and their cookies.
			foreach ( $services as $service ) {
				++$total_services;

				// Count cookies under this service.
				foreach ( $cookies as $cookie ) {
					// Ensure categories is an array before using it.
					if ( ! isset( $cookie['categories'] ) || ! is_array( $cookie['categories'] ) ) {
						continue;
					}

					if ( in_array( $service['id'], $cookie['categories'], true ) ) {
						++$total_cookies;
					}
				}
			}
		}

		$wpconsent_data['wpconsent_total_categories'] = $total_categories;
		$wpconsent_data['wpconsent_total_services']   = $total_services;
		$wpconsent_data['wpconsent_total_cookies']    = $total_cookies;

		return $wpconsent_data;
	}
}
