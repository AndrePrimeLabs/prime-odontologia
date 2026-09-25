<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WPConsent Connect.
 *
 * WPConsent Connect is our service that makes it easy to upgrade to WPConsent Pro
 * without having to manually install the WPConsent Pro plugin.
 *
 * @since 2.0.9
 */
class WPConsent_Connect {

	/**
	 * Constructor.
	 *
	 * @since 2.0.9
	 */
	public function __construct() {
		$this->hooks();
	}

	/**
	 * Hooks.
	 *
	 * @since 2.0.9
	 */
	public function hooks() {
		add_action( 'wpconsent_admin_page_content_wpconsent-cookies', array( $this, 'settings_enqueues' ) );
		add_action( 'wp_ajax_wpconsent_connect_url', array( $this, 'generate_url' ) );
		add_action( 'wp_ajax_nopriv_wpconsent_connect_process', array( $this, 'process' ) );
	}

	/**
	 * Settings page enqueues.
	 *
	 * @since 2.0.9
	 */
	public function settings_enqueues() {

		$admin_asset_file = WPCONSENT_PLUGIN_PATH . 'build/connect.asset.php';

		if ( ! file_exists( $admin_asset_file ) ) {
			return;
		}

		$asset = require $admin_asset_file;

		wp_enqueue_script( 'wpconsent-connect-js', WPCONSENT_PLUGIN_URL . 'build/connect.js', $asset['dependencies'], $asset['version'], true );
	}

	/**
	 * Generate and return the WPConsent Connect URL.
	 *
	 * @since 2.0.9
	 */
	public function generate_url() {

		// Run a security check.
		check_ajax_referer( 'wpconsent_admin' );

		// Check for permissions.
		if ( ! current_user_can( 'install_plugins' ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'You are not allowed to install plugins.', 'wpconsent-cookies-banner-privacy-suite' ) ) );
		}

		$key = ! empty( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';

		if ( empty( $key ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'Please enter your license key to connect.', 'wpconsent-cookies-banner-privacy-suite' ) ) );
		}

		if ( class_exists( 'WPConsent_Premium' ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'Only the Lite version can be upgraded.', 'wpconsent-cookies-banner-privacy-suite' ) ) );
		}

		// Verify pro version is not installed.
		$active = activate_plugin( 'wpconsent-premium/wpconsent-premium.php', false, false, true );

		if ( ! is_wp_error( $active ) ) {

			update_option( 'wpconsent_install', 1 ); // Run install routines.
			// Deactivate Lite.
			$plugin = plugin_basename( WPCONSENT_FILE );

			deactivate_plugins( $plugin );

			do_action( 'wpconsent_plugin_deactivated', $plugin );

			wp_send_json_success(
				array(
					'message' => esc_html__( 'WPConsent Pro is installed but not activated.', 'wpconsent-cookies-banner-privacy-suite' ),
					'reload'  => true,
				)
			);
		}

		// Generate URL.
		$oth        = hash( 'sha512', wp_rand() );
		$hashed_oth = hash_hmac( 'sha512', $oth, wp_salt() );

		update_option( 'wpconsent_connect_token', $oth );
		update_option( 'wpconsent_connect', $key );

		$version  = WPCONSENT_VERSION;
		$endpoint = admin_url( 'admin-ajax.php' );
		$redirect = admin_url( 'admin.php?page=wpconsent-cookies' );
		$url      = add_query_arg(
			array(
				'key'      => $key,
				'oth'      => $hashed_oth,
				'endpoint' => $endpoint,
				'version'  => $version,
				'siteurl'  => admin_url(),
				'homeurl'  => home_url(),
				'redirect' => rawurldecode( base64_encode( $redirect ) ), // phpcs:ignore
				'v'        => 2,
				'php'      => phpversion(),
				'wp'       => get_bloginfo( 'version' ),
			),
			'https://upgrade.wpconsent.com/'
		);

		wp_send_json_success(
			array(
				'url'      => $url,
				'back_url' => add_query_arg(
					array(
						'action' => 'wpconsent_connect',
						'oth'    => $oth,
					),
					$endpoint
				),
			)
		);
	}

	/**
	 * Process WPConsent Connect.
	 *
	 * @since 2.0.9
	 */
	public function process() {

		$error = esc_html__( 'There was an error while installing an upgrade. Please download the plugin from wpconsent.com and install it manually.', 'wpconsent-cookies-banner-privacy-suite' );

		// Verify params present (oth & download link).
		$post_oth = ! empty( $_REQUEST['oth'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['oth'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
		$post_url = ! empty( $_REQUEST['file'] ) ? esc_url_raw( wp_unslash( $_REQUEST['file'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification

		if ( empty( $post_oth ) || empty( $post_url ) ) {
			wp_send_json_error( $error );
		}

		// Verify oth.
		$oth = get_option( 'wpconsent_connect_token' );

		if ( hash_hmac( 'sha512', $oth, wp_salt() ) !== $post_oth ) {
			wp_send_json_error( $error );
		}

		// Delete so cannot replay.
		delete_option( 'wpconsent_connect_token' );

		// Set the current screen to avoid undefined notices.
		set_current_screen( 'wpconsent_page_wpconsent-cookies' );

		// Prepare variables.
		$url = esc_url_raw(
			add_query_arg(
				array( 'page' => 'wpconsent-cookies' ),
				admin_url( 'admin.php' )
			)
		);

		// Verify pro not activated.
		if ( class_exists( 'WPConsent_Premium' ) ) {
			wp_send_json_success( esc_html__( 'Plugin installed & activated.', 'wpconsent-cookies-banner-privacy-suite' ) );
		}

		// Verify pro not installed.
		$active = activate_plugin( 'wpconsent-premium/wpconsent-premium.php', $url, false, true );

		if ( ! is_wp_error( $active ) ) {
			$plugin = plugin_basename( WPCONSENT_FILE );

			deactivate_plugins( $plugin );

			do_action( 'wpconsent_plugin_deactivated', $plugin );

			wp_send_json_success( esc_html__( 'Plugin installed & activated.', 'wpconsent-cookies-banner-privacy-suite' ) );
		}

		$creds = request_filesystem_credentials( $url, '', false, false, null );

		// Check for file system permissions.
		if ( false === $creds || ! WP_Filesystem( $creds ) ) {
			wp_send_json_error(
				esc_html__( 'There was an error while installing an upgrade. Please check file system permissions and try again. Also, you can download the plugin from wpconsent.com and install it manually.', 'wpconsent-cookies-banner-privacy-suite' )
			);
		}

		/*
		 * We do not need any extra credentials if we have gotten this far, so let's install the plugin.
		 */
		// Do not allow WordPress to search/download translations, as this will break JS output.
		remove_action( 'upgrader_process_complete', array( 'Language_Pack_Upgrader', 'async_upgrade' ), 20 );

		wpconsent_require_upgrader();

		// Create the plugin upgrader with our custom skin.
		$installer = new Plugin_Upgrader( new WPConsent_Skin() );

		// Error check.
		if ( ! method_exists( $installer, 'install' ) ) {
			wp_send_json_error( $error );
		}

		// Check license key.
		$key = get_option( 'wpconsent_connect', false );

		if ( empty( $key ) ) {
			wp_send_json_error(
				new WP_Error(
					'403',
					esc_html__( 'No key provided.', 'wpconsent-cookies-banner-privacy-suite' )
				)
			);
		}

		$installer->install( $post_url ); // phpcs:ignore

		// Flush the cache and return the newly installed plugin basename.
		wp_cache_flush();

		$plugin_basename = $installer->plugin_info();

		if ( $plugin_basename ) {

			// Deactivate the lite version first.
			$plugin = plugin_basename( WPCONSENT_FILE );

			deactivate_plugins( $plugin );

			do_action( 'wpconsent_plugin_deactivated', $plugin );

			// Activate the plugin silently.
			$activated = activate_plugin( $plugin_basename, '', false, true );

			if ( ! is_wp_error( $activated ) ) {
				add_option( 'wpconsent_install', 1 );
				wp_send_json_success( esc_html__( 'Plugin installed & activated.', 'wpconsent-cookies-banner-privacy-suite' ) );
			} else {
				// Reactivate the lite plugin if pro activation failed.
				activate_plugin( plugin_basename( WPCONSENT_FILE ), '', false, true );
				wp_send_json_error( esc_html__( 'Pro version installed but needs to be activated on the Plugins page inside your WordPress admin.', 'wpconsent-cookies-banner-privacy-suite' ) );
			}
		}

		wp_send_json_error( $error );
	}
}

new WPConsent_Connect();
