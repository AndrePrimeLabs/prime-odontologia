<?php
/**
 * Privacy integration functionality for WPConsent.
 * Adds cookie policy page setting to WordPress privacy settings.
 *
 * @package WPConsent
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Privacy_Integration
 *
 * Manages the addition of the Cookie Policy Page setting in WordPress privacy settings.
 */
class WPConsent_Privacy_Integration {

	/**
	 * WPConsent_Privacy_Integration constructor.
	 */
	public function __construct() {
		add_action( 'load-options-privacy.php', array( $this, 'handle_form_submissions' ) );

		// Enqueue scripts only on privacy page.
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_privacy_assets' ) );
	}

	/**
	 * Enqueue privacy assets if on privacy page.
	 *
	 * @param string $hook_suffix The current admin page hook suffix.
	 */
	public function enqueue_privacy_assets( $hook_suffix ) {
		if ( 'options-privacy.php' !== $hook_suffix ) {
			return;
		}

		// Check if we have the build file.
		$privacy_asset_file = WPCONSENT_PLUGIN_PATH . 'build/privacy.asset.php';

		if ( ! file_exists( $privacy_asset_file ) ) {
			return;
		}

		$asset = require $privacy_asset_file;

		// Enqueue the privacy JavaScript file.
		wp_enqueue_script(
			'wpconsent-privacy',
			WPCONSENT_PLUGIN_URL . 'build/privacy.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_localize_script(
			'wpconsent-privacy',
			'wpconsentPrivacy',
			array(
				'selectedPageId' => (int) wpconsent()->settings->get_option( 'cookie_policy_page', 0 ),
				'nonce'          => wp_create_nonce( 'set-cookie-policy-page' ),
				'labels'         => array(
					'cookiePolicyPage' => __( 'Cookie Policy Page', 'wpconsent-cookies-banner-privacy-suite' ),
					'useThisPage'      => __( 'Use This Page', 'wpconsent-cookies-banner-privacy-suite' ),
					'description'      => sprintf(
						/* translators: %1$s and %2$s are the opening and closing <a> tags linking to WPConsent settings. */
						__( 'Select an existing page to use as your %1$scookie policy page for WPConsent%2$s.', 'wpconsent-cookies-banner-privacy-suite' ),
						'<a href="' . esc_url( admin_url( 'admin.php?page=wpconsent-cookies' ) ) . '">',
						'</a>'
					),
				),
			)
		);
	}

	/**
	 * Handles form submissions for cookie policy page.
	 */
	public function handle_form_submissions() {
		if ( ! isset( $_POST['action'] ) || 'set-cookie-policy-page' !== $_POST['action'] ) {
			return;
		}

		global $pagenow;
		if ( 'options-privacy.php' !== $pagenow ) {
			return;
		}

		// Verify nonce and user capabilities.
		if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'set-cookie-policy-page' ) ) {
			wp_die( esc_html__( 'Security check failed.', 'wpconsent-cookies-banner-privacy-suite' ) );
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ) );
		}

		$cookie_policy_page_id = isset( $_POST['page_for_cookie_policy'] ) ? absint( $_POST['page_for_cookie_policy'] ) : 0;

		// Update WPConsent's cookie policy page setting.
		wpconsent()->settings->update_option( 'cookie_policy_page', $cookie_policy_page_id );

		$message = __( 'Cookie Policy page updated successfully.', 'wpconsent-cookies-banner-privacy-suite' );
		add_settings_error( 'page_for_cookie_policy', 'page_for_cookie_policy', $message, 'success' );
	}
}
