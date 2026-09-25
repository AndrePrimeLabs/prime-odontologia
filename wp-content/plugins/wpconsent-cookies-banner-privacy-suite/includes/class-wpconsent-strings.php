<?php
/**
 * Handles all the WPConsent default strings.
 *
 * @package WPConsent
 */

/**
 * Class WPConsent_Strings.
 */
class WPConsent_Strings {

	/**
	 * Default strings array.
	 *
	 * @var array
	 */
	protected $strings;

	/**
	 * Load the default strings.
	 *
	 * @return array
	 */
	protected function load_strings() {
		return array(
			'banner_message'                    => __( 'We use cookies to improve your experience on our site. By using our site, you consent to cookies.', 'wpconsent-cookies-banner-privacy-suite' ),
			'accept_button_text'                => __( 'Accept All', 'wpconsent-cookies-banner-privacy-suite' ),
			'preferences_button_text'           => __( 'Preferences', 'wpconsent-cookies-banner-privacy-suite' ),
			'cancel_button_text'                => __( 'Reject', 'wpconsent-cookies-banner-privacy-suite' ),
			'preferences_panel_title'           => __( 'Cookie Preferences', 'wpconsent-cookies-banner-privacy-suite' ),
			'preferences_panel_description'     => __( 'Manage your cookie preferences below:', 'wpconsent-cookies-banner-privacy-suite' ),
			'cookie_policy_title'               => __( 'Cookie Policy', 'wpconsent-cookies-banner-privacy-suite' ),
			'cookie_policy_text'                => __( 'You can find more information in our {cookie_policy} and {privacy_policy}.', 'wpconsent-cookies-banner-privacy-suite' ),
			'save_preferences_button_text'      => __( 'Save and Close', 'wpconsent-cookies-banner-privacy-suite' ),
			'close_button_text'                 => __( 'Close', 'wpconsent-cookies-banner-privacy-suite' ),
			'content_blocking_placeholder_text' => __( 'Click here to accept {category} cookies and load this content', 'wpconsent-cookies-banner-privacy-suite' ),
			'gpc_toast_message'                 => __( 'GPC Signal Honored', 'wpconsent-cookies-banner-privacy-suite' ),
			'gpc_override_message'              => __( 'I understand GPC will be overwritten and want to allow this site to sell or share my personal information anyway', 'wpconsent-cookies-banner-privacy-suite' ),
			'cookie_table_header_name'          => __( 'Name', 'wpconsent-cookies-banner-privacy-suite' ),
			'cookie_table_header_description'   => __( 'Description', 'wpconsent-cookies-banner-privacy-suite' ),
			'cookie_table_header_duration'      => __( 'Duration', 'wpconsent-cookies-banner-privacy-suite' ),
			'cookie_table_header_service_url'   => __( 'Service URL', 'wpconsent-cookies-banner-privacy-suite' ),
		);
	}

	/**
	 * Get all strings.
	 *
	 * @return array
	 */
	public function get_strings() {
		if ( ! isset( $this->strings ) ) {
			$this->strings = $this->load_strings();
		}
		return $this->strings;
	}

	/**
	 * Get a string by key with an optional default value.
	 *
	 * @param string $key The string key.
	 * @param mixed  $default_value The default value (optional).
	 *
	 * @return string|mixed
	 */
	public function get_string( $key, $default_value = '' ) {
		if ( ! isset( $this->strings ) ) {
			$this->strings = $this->load_strings();
		}
		if ( isset( $this->strings[ $key ] ) ) {
			return $this->strings[ $key ];
		}

		return $default_value;
	}

	/**
	 * Get all string keys.
	 *
	 * @return array
	 */
	public function get_keys() {
		if ( ! isset( $this->strings ) ) {
			$this->strings = $this->load_strings();
		}
		return array_keys( $this->strings );
	}

	/**
	 * Check if a string key exists.
	 *
	 * @param string $key The string key.
	 *
	 * @return bool
	 */
	public function has_key( $key ) {
		if ( ! isset( $this->strings ) ) {
			$this->strings = $this->load_strings();
		}
		return isset( $this->strings[ $key ] );
	}
}
