<?php
/**
 * Plugin Name: WPConsent
 * Description: Improve your WordPress website privacy compliance. Custom cookie banner, website scanner, automatic script blocking, and easy cookie configuration.
 * Version:     1.1.9
 * Author:      WPConsent
 * Author URI:  https://wpconsent.com
 * License:     GPL v2 or later
 * Requires at least: 5.6
 * Requires PHP: 7.0
 * Tested up to: 7.0
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wpconsent-cookies-banner-privacy-suite
 * Domain Path: /languages
 *
 * @package WPConsent
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Don't allow multiple versions to be active.
if ( function_exists( 'WPConsent' ) ) {

	if ( ! function_exists( 'wpconsent_pro_just_activated' ) ) {
		/**
		 * When we activate a Pro version, we need to do additional operations:
		 * 1) deactivate a Lite version;
		 * 2) register option which help to run all activation process for Pro version (custom tables creation, etc.).
		 */
		function wpconsent_pro_just_activated() {
			wpconsent_deactivate();
			add_option( 'wpconsent_install', 1 );
		}
	}
	add_action( 'activate_wpconsent-premium/wpconsent-premium.php', 'wpconsent_pro_just_activated' );

	if ( ! function_exists( 'wpconsent_lite_just_activated' ) ) {
		/**
		 * Store temporarily that the Lite version of the plugin was activated.
		 * This is needed because WP does a redirect after activation and
		 * we need to preserve this state to know whether user activated Lite or not.
		 */
		function wpconsent_lite_just_activated() {

			set_transient( 'wpconsent_lite_just_activated', true );
		}
	}
	add_action( 'activate_wpconsent-cookies-banner-privacy-suite/wpconsent.php', 'wpconsent_lite_just_activated' );

	if ( ! function_exists( 'wpconsent_lite_just_deactivated' ) ) {
		/**
		 * Store temporarily that Lite plugin was deactivated.
		 * Convert temporary "activated" value to a global variable,
		 * so it is available through the request. Remove from the storage.
		 */
		function wpconsent_lite_just_deactivated() {

			global $wpconsent_lite_just_activated, $wpconsent_lite_just_deactivated;

			$wpconsent_lite_just_activated   = (bool) get_transient( 'wpconsent_lite_just_activated' );
			$wpconsent_lite_just_deactivated = true;

			delete_transient( 'wpconsent_lite_just_activated' );
		}
	}
	add_action( 'deactivate_wpconsent-cookies-banner-privacy-suite/wpconsent.php', 'wpconsent_lite_just_deactivated' );

	if ( ! function_exists( 'wpconsent_deactivate' ) ) {
		/**
		 * Deactivate Lite if WPConsent already activated.
		 */
		function wpconsent_deactivate() {

			$plugin = 'wpconsent-cookies-banner-privacy-suite/wpconsent.php';

			deactivate_plugins( $plugin );

			do_action( 'wpconsent_plugin_deactivated', $plugin );
		}
	}
	add_action( 'admin_init', 'wpconsent_deactivate' );

	if ( ! function_exists( 'wpconsent_lite_notice' ) ) {
		/**
		 * Display the notice after deactivation when Pro is still active
		 * and user wanted to activate the Lite version of the plugin.
		 */
		function wpconsent_lite_notice() {

			global $wpconsent_lite_just_activated, $wpconsent_lite_just_deactivated;

			if (
				empty( $wpconsent_lite_just_activated ) ||
				empty( $wpconsent_lite_just_deactivated )
			) {
				return;
			}

			// Currently tried to activate Lite with Pro still active, so display the message.
			printf(
				'<div class="notice notice-warning">
					<p>%1$s</p>
					<p>%2$s</p>
				</div>',
				esc_html__( 'Heads up!', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'Your site already has WPConsent Pro activated. If you want to switch to WPConsent Lite, please first go to Plugins → Installed Plugins and deactivate WPConsent. Then, you can activate WPConsent Lite.', 'wpconsent-cookies-banner-privacy-suite' )
			);

			if ( isset( $_GET['activate'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				unset( $_GET['activate'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			}

			unset( $wpconsent_lite_just_activated, $wpconsent_lite_just_deactivated );
		}
	}
	add_action( 'admin_notices', 'wpconsent_lite_notice' );

	// Do not process the plugin code further.
	return;
}

/**
 * Main plugin class.
 */
class WPConsent {

	/**
	 * Holds the instance of the plugin.
	 *
	 * @since 1.0.0
	 *
	 * @var WPConsent The one true WPConsent
	 */
	private static $instance;

	/**
	 * Plugin version.
	 *
	 * @since 2.0.0
	 *
	 * @var string
	 */
	public $version = '';

	/**
	 * The admin page loader.
	 *
	 * @var WPConsent_Admin_Page_Loader
	 */
	public $admin_page_loader;

	/**
	 * The settings instance.
	 *
	 * @var WPConsent_Settings
	 */
	public $settings;

	/**
	 * The strings instance.
	 *
	 * @var WPConsent_Strings
	 */
	public $strings;

	/**
	 * The banner instance.
	 *
	 * @var WPConsent_Banner
	 */
	public $banner;

	/**
	 * The cookies instance.
	 *
	 * @var WPConsent_Cookies
	 */
	public $cookies;

	/**
	 * The cookie blocking instance.
	 *
	 * @var WPConsent_Cookie_Blocking
	 */
	public $cookie_blocking;

	/**
	 * Script blocker instance.
	 *
	 * @var WPConsent_Script_Blocker
	 */
	public $script_blocker;

	/**
	 * The dashboard instance.
	 *
	 * @var WPConsent_Dashboard
	 */
	public $dashboard;

	/**
	 * The recommended plugins instance.
	 *
	 * @var WPConsent_Recommended_Plugins
	 */
	public $recommended_plugins;

	/**
	 * The inspector instance.
	 *
	 * @var WPConsent_Inspector
	 */
	public $inspector;

	/**
	 * The scanner instance.
	 *
	 * @var WPConsent_Scanner
	 */
	public $scanner;

	/**
	 * The services instance.
	 *
	 * @var WPConsent_Services
	 */
	public $services;

	/**
	 * Admin notices instance.
	 *
	 * @var WPConsent_Notice
	 */
	public $notice;

	/**
	 * The file cache class.
	 *
	 * @var WPConsent_File_Cache
	 */
	public $file_cache;

	/**
	 * The admin notifications instance.
	 *
	 * @var WPConsent_Notifications
	 */
	public $notifications;

	/**
	 * The privacy integration instance.
	 *
	 * @var WPConsent_Privacy_Integration
	 */
	public $privacy_integration;

	/**
	 * Main instance of WPConsent.
	 *
	 * @return WPConsent
	 * @since 2.0.0
	 */
	public static function instance() {
		if ( ! isset( self::$instance ) && ! ( self::$instance instanceof WPConsent ) ) {
			self::$instance = new WPConsent();
		}

		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		$this->setup_constants();
		$this->includes();
		add_action( 'plugins_loaded', array( $this, 'load_components' ) );
	}

	/**
	 * Set up global constants.
	 *
	 * @return void
	 */
	private function setup_constants() {

		define( 'WPCONSENT_FILE', __FILE__ );

		$plugin_headers = get_file_data( WPCONSENT_FILE, array( 'version' => 'Version' ) );

		define( 'WPCONSENT_VERSION', $plugin_headers['version'] );
		define( 'WPCONSENT_PLUGIN_BASENAME', plugin_basename( WPCONSENT_FILE ) );
		define( 'WPCONSENT_PLUGIN_URL', plugin_dir_url( WPCONSENT_FILE ) );
		define( 'WPCONSENT_PLUGIN_PATH', plugin_dir_path( WPCONSENT_FILE ) );

		// Declare WP Consent API support.
		add_filter( 'wp_consent_api_registered_' . WPCONSENT_PLUGIN_BASENAME, '__return_true' );

		$this->version = WPCONSENT_VERSION;
	}

	/**
	 * Require the files needed for the plugin.
	 *
	 * @return void
	 */
	private function includes() {
		if ( is_admin() || ( defined( 'DOING_CRON' ) && DOING_CRON ) ) {
			require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/class-wpconsent-admin-page-loader.php';
			require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/admin-scripts.php';
			require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/admin-ajax.php';
			require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/class-wpconsent-services.php';
			require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/onboarding.php';
			require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/class-wpconsent-admin-notice.php';
			require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/class-wpconsent-notifications.php';
			require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/class-wpconsent-reminders.php';
			require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/class-wpconsent-privacy-integration.php';
			require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/class-wpconsent-recommended-plugins.php';
			require_once WPCONSENT_PLUGIN_PATH . 'includes/class-wpconsent-scanner.php';
		}
		require_once WPCONSENT_PLUGIN_PATH . 'includes/class-wpconsent-file-cache.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/class-wpconsent-install.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/icons.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/class-wpconsent-settings.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/class-wpconsent-strings.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/class-wpconsent-cookies.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/class-wpconsent-banner.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/class-wpconsent-content-placeholder.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/class-wpconsent-cookie-blocking.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/class-wpconsent-inspector.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/class-wpconsent-dashboard.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/frontend-scripts.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/class-wpconsent-script-blocker.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/cookie-policy-shortcode.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/preferences-button-shortcode.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/helpers.php';

		require_once WPCONSENT_PLUGIN_PATH . 'includes/lite/loader.php';
		// Load compatibility.
		require_once WPCONSENT_PLUGIN_PATH . 'includes/compatibility/loader.php';
	}

	/**
	 * Load components in the main plugin instance.
	 *
	 * @return void
	 */
	public function load_components() {
		if ( is_admin() || wp_doing_ajax() || defined( 'DOING_CRON' ) && DOING_CRON ) {
			$this->admin_page_loader   = new WPConsent_Admin_Page_Loader_Lite();
			$this->services            = WPConsent_Services::get_instance();
			$this->scanner             = WPConsent_Scanner::get_instance();
			$this->notice              = new WPConsent_Notice();
			$this->notifications       = new WPConsent_Notifications();
			$this->privacy_integration = new WPConsent_Privacy_Integration();

			// Load the reminders.
			new WPConsent_Reminders();
			new WPConsent_Usage_Tracking_Lite();

			$this->recommended_plugins = new WPConsent_Recommended_Plugins();
		}
		$this->file_cache = new WPConsent_File_Cache();
		$this->strings    = new WPConsent_Strings();
		$this->settings   = new WPConsent_Settings();
		$this->banner     = new WPConsent_Banner();
		$this->cookies    = new WPConsent_Cookies();

		$this->script_blocker = new WPConsent_Script_Blocker();
		// Load the cookie blocking functionality.
		$this->cookie_blocking = new WPConsent_Cookie_Blocking();
		$this->inspector       = new WPConsent_Inspector();
		$this->dashboard       = new WPConsent_Dashboard();
	}
}

require_once __DIR__ . '/includes/wpconsent.php';

wpconsent();
