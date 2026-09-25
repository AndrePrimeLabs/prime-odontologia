<?php
/**
 * Handles all the WPConsent settings.
 *
 * @package WPConsent
 */

/**
 * Class WPConsent_Settings.
 */
class WPConsent_Settings {

	/**
	 * The key used for storing settings in the db.
	 *
	 * @var string
	 */
	protected $settings_key = 'wpconsent_settings';

	/**
	 * Options as they are loaded from the db.
	 *
	 * @var array
	 * @see WPConsent_Settings::get_options
	 */
	protected $options;

	/**
	 * Get an option by name with an optional default value.
	 *
	 * @param string $option_name The option name.
	 * @param mixed  $default The default value (optional).
	 *
	 * @return mixed
	 * @see get_option
	 */
	public function get_option( $option_name, $default = false ) {
		$options = $this->get_options();
		$value   = $default;
		if ( isset( $options[ $option_name ] ) ) {
			$value = $options[ $option_name ];
		}

		$value = apply_filters( 'wpconsent_get_option', $value, $option_name, $options );

		return apply_filters( "wpconsent_get_option_{$option_name}", $value, $option_name );
	}

	/**
	 * Get all the options as they are stored in the db.
	 *
	 * @return array
	 */
	public function get_options() {
		if ( ! isset( $this->options ) ) {
			$this->options = $this->load_options();
		}

		return $this->options;
	}

	/**
	 * Load the options from the db.
	 *
	 * @return array
	 */
	protected function load_options() {
		// Get default strings from the strings instance.
		$default_strings = wpconsent()->strings->get_strings();

		// Merge strings with other default settings.
		$defaults = array_merge(
			array(
				'banner_layout'              => 'long',
				'banner_position'            => 'bottom',
				'banner_background_color'    => '#04194e',
				'banner_text_color'          => '#ffffff',
				'banner_font_size'           => '16px',
				'banner_button_size'         => 'small',
				'banner_button_corner'       => 'slightly-rounded',
				'banner_button_type'         => 'filled',
				'banner_accept_bg'           => '#ffcd2a',
				'banner_accept_color'        => '#000000',
				'banner_cancel_bg'           => '#ffffff',
				'banner_cancel_color'        => '#000000',
				'banner_preferences_bg'      => '#ffffff',
				'banner_preferences_color'   => '#000000',
				'accept_button_enabled'      => 1,
				'button_order'               => array(
					0 => 'preferences',
					1 => 'cancel',
					2 => 'accept',
				),
				'banner_logo'                => '',
				'cancel_button_enabled'      => 1,
				'preferences_button_enabled' => 1,
				'consent_floating_icon'           => 'preferences',
				'enable_consent_banner'           => 0,
				'disable_close_button'            => 1,
				'manual_scan_pages'               => array(),
				// Scanner history and notification settings.
				'scanner_auto_update'             => 0,
				'scanner_email_notifications'     => 0,
				'scanner_email_addresses'         => '',
				'scanner_history_retention'       => 90,
				'consent_logs_auto_delete'        => 0,
				'consent_logs_retention_period'   => '1_year',
				// Banner analytics settings.
				'analytics_enabled'               => 1,
				'analytics_retention'             => 90,
				'analytics_excluded_roles'        => array( 'administrator', 'editor' ),
				'gcm_url_passthrough'             => 0,
				'gcm_ads_data_redaction'          => 0,
			),
			$default_strings
		);

		return get_option( $this->settings_key, $defaults );
	}

	/**
	 * Update an option in the settings object.
	 *
	 * @param string $option The option name.
	 * @param mixed  $value The new value.
	 *
	 * @return void
	 */
	public function update_option( $option, $value ) {
		$this->get_options();
		if ( empty( $value ) ) {
			$this->delete_option( $option );

			return;
		}
		if ( isset( $this->options[ $option ] ) && $this->options[ $option ] === $value ) {
			return;
		}
		$this->options[ $option ] = $value;

		$this->save_options();
	}

	/**
	 * Delete an option by its name.
	 *
	 * @param string $option The option name.
	 *
	 * @return void
	 */
	public function delete_option( $option ) {
		// If there's nothing to delete, do nothing.
		if ( isset( $this->options[ $option ] ) ) {
			unset( $this->options[ $option ] );
			$this->save_options();
		}
	}

	/**
	 * Save the current options object to the db.
	 *
	 * @return void
	 */
	protected function save_options() {
		$options = apply_filters( 'wpconsent_save_options', $this->options, $this->load_options() );

		update_option( $this->settings_key, (array) $options );
	}

	/**
	 * Check whether any of the given keys differ between two options arrays.
	 *
	 * Used by 'wpconsent_save_options' listeners that only need to react when
	 * specific settings actually change, rather than on every save.
	 *
	 * @param array $new_options Options array about to be saved.
	 * @param array $old_options Options array currently stored.
	 * @param array $keys        The keys to compare.
	 *
	 * @return bool
	 */
	public static function keys_changed( $new_options, $old_options, $keys ) {
		if ( ! is_array( $new_options ) ) {
			return false;
		}
		if ( ! is_array( $old_options ) ) {
			$old_options = array();
		}

		foreach ( $keys as $key ) {
			$old_value = isset( $old_options[ $key ] ) ? $old_options[ $key ] : null;
			$new_value = isset( $new_options[ $key ] ) ? $new_options[ $key ] : null;
			if ( $old_value !== $new_value ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Use an array to update multiple settings at once.
	 *
	 * @param array $options The new options array.
	 *
	 * @return void
	 */
	public function bulk_update_options( $options ) {
		$this->options = array_merge( $this->get_options(), $options );

		$this->save_options();
	}
}
