<?php
/**
 * Logic to run on plugin install.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Install.
 */
class WPConsent_Install {

	/**
	 * WPConsent_Install constructor.
	 */
	public function __construct() {
		register_activation_hook( WPCONSENT_FILE, array( $this, 'activate' ) );
		add_action( 'admin_init', array( $this, 'maybe_run_install' ) );
	}

	/**
	 * Activation hook.
	 *
	 * @return void
	 */
	public function activate() {
		// Use an action to have a single activation hook plugin-wide.
		do_action( 'wpconsent_plugin_activation' );

		set_transient( 'wpconsent_just_activated', class_exists( 'WPConsent_Premium' ) ? 'pro' : 'lite', 60 );
	}

	/**
	 * Maybe run the install.
	 *
	 * @return void
	 */
	public function maybe_run_install() {
		if ( ! is_admin() ) {
			return;
		}

		$activated = get_option( 'wpconsent_activated', array() );

		if ( empty( $activated['wpconsent'] ) ) {
			$activated['wpconsent'] = time();
			$activated['version']   = '0';
			update_option( 'wpconsent_activated', $activated );

			set_transient( 'wpconsent_onboarding_redirect', true, 60 );
		}

		// Maybe run manually just one time.
		$install = get_option( 'wpconsent_install', false );

		if ( ! empty( $install ) ) {
			$this->activate();
			delete_option( 'wpconsent_install' );
		}

		// If not first install, that means before 1.0.3.
		if ( ! isset( $activated['version'] ) ) {
			$activated['version'] = '1.0.0';
		}

		if ( isset( $activated['version'] ) && version_compare( $activated['version'], '1.0.5', '<' ) ) {
			$this->update_1_0_5();
		}

		do_action( 'wpconsent_before_version_update', $activated );

		// Re-fetch the option to preserve any changes made by upgrade hooks.
		$activated            = get_option( 'wpconsent_activated', array() );
		$activated['version'] = WPCONSENT_VERSION;
		update_option( 'wpconsent_activated', $activated );
	}

	/**
	 * Upgrade routine for version 1.0.5.
	 *
	 * @return void
	 */
	private function update_1_0_5() {
		// Clear the cache for script blocking.
		wpconsent()->file_cache->delete( 'script-blocking-data' );
	}
}

new WPConsent_Install();
