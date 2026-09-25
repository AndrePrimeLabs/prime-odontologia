<?php
/**
 * Class used to load admin pages allowing child classes
 *  to replace or add pages by changing the classes used.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent admin page loader.
 */
class WPConsent_Admin_Page_Loader {

	/**
	 * Array of admin pages to load.
	 *
	 * @var array
	 */
	public $pages = array();

	/**
	 * Slugs of pages that should not be visible in the submenu.
	 *
	 * @var array
	 */
	public $hidden_pages = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->require_files();

		$this->hooks();
	}

	/**
	 * Load required files for the admin pages.
	 *
	 * @return void
	 */
	public function require_files() {
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/trait-wpconsent-input-select.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/trait-wpconsent-input-colorpicker.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/trait-wpconsent-input-wysiwyg.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/trait-wpconsent-input-media.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/trait-wpconsent-input-image-radio.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/trait-wpconsent-banner-preview.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/trait-wpconsent-services-upsell.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/trait-wpconsent-scan-pages.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/trait-wpconsent-analytics-report.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/class-wpconsent-docs.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/class-wpconsent-admin-page.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/class-wpconsent-admin-page-dashboard.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/class-wpconsent-admin-page-banner.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/class-wpconsent-admin-page-cookies.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/class-wpconsent-admin-page-scanner.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/class-wpconsent-admin-page-analytics.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/class-wpconsent-admin-page-onboarding.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/class-wpconsent-admin-page-geolocation.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/class-wpconsent-admin-page-consent-logs.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/class-wpconsent-admin-page-do-not-track.php';
		require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/pages/class-wpconsent-admin-page-tools.php';
	}

	/**
	 * Hooks.
	 *
	 * @return void
	 */
	public function hooks() {
		add_action( 'admin_menu', array( $this, 'register_admin_menu' ), 9 );

		// Hide submenus.
		add_filter( 'parent_file', array( $this, 'hide_menus' ), 1020 );

		// Add plugin action links.
		add_filter( 'plugin_action_links_' . WPCONSENT_PLUGIN_BASENAME, array( $this, 'add_plugin_action_links' ) );
	}

	/**
	 * Handler for registering the admin menu & loading pages.
	 *
	 * @return void
	 */
	public function register_admin_menu() {
		$this->add_main_menu_item();
		$this->load_pages();
	}

	/**
	 * Add the main menu item used for all the other admin pages.
	 *
	 * @return void
	 */
	public function add_main_menu_item() {
		$svg            = wpconsent_get_icon( 'logo', 50, 34, '0 0 145 100' );
		$wpconsent_icon = 'data:image/svg+xml;base64,' . base64_encode( $svg ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode

		add_menu_page(
			'WPConsent',
			'WPConsent',
			'manage_options',
			'wpconsent',
			array(
				$this,
				'admin_menu_page',
			),
			$wpconsent_icon,
			'82.50020790794560'
		);
	}

	/**
	 * Load the pages using their specific classes.
	 *
	 * @return void
	 */
	public function load_pages() {

		$this->prepare_pages();

		do_action( 'wpconsent_before_admin_pages_loaded', $this->pages );

		foreach ( $this->pages as $slug => $page_class ) {
			if ( ! class_exists( $page_class ) ) {
				continue;
			}
			$this->pages[ $slug ] = new $page_class();
			if ( $this->pages[ $slug ]->hide_menu ) {
				$this->hidden_pages[] = $this->pages[ $slug ]->page_slug;
			}
		}
	}

	/**
	 * Load the pages classes allowing child classes to replace.
	 *
	 * @return void
	 */
	public function prepare_pages() {
		$this->pages['dashboard']    = 'WPConsent_Admin_Page_Dashboard';
		$this->pages['banner']       = 'WPConsent_Admin_Page_Banner';
		$this->pages['scanner']      = 'WPConsent_Admin_Page_Scanner';
		$this->pages['analytics']    = 'WPConsent_Admin_Page_Analytics';
		$this->pages['cookies']      = 'WPConsent_Admin_Page_Cookies';
		$this->pages['geolocation']  = 'WPConsent_Admin_Page_Geolocation';
		$this->pages['tools']        = 'WPConsent_Admin_Page_Tools';
		$this->pages['consent_logs'] = 'WPConsent_Admin_Page_Consent_Logs';
		$this->pages['onboarding']   = 'WPConsent_Admin_Page_Onboarding';
		$this->pages['do_not_track'] = 'WPConsent_Admin_Page_Do_Not_Track';
	}

	/**
	 * Generic handler for the wpconsent pages.
	 *
	 * @return void
	 */
	public function admin_menu_page() {
		do_action( 'wpconsent_admin_page' );
	}

	/**
	 * Hide menu items for pages that should be hidden.
	 * We're using the parent_file filter to improve compatibility with admin-menu-editor.
	 *
	 * @param string $parent_file The parent file.
	 *
	 * @return string
	 */
	public function hide_menus( $parent_file ) {

		foreach ( $this->hidden_pages as $page ) {
			remove_submenu_page( 'wpconsent', $page );
		}

		return $parent_file;
	}


	/**
	 * Add links in the plugins list for easy navigation.
	 *
	 * @param $links
	 *
	 * @return array
	 */
	public function add_plugin_action_links( $links ) {
		$url  = add_query_arg(
			array(
				'page' => 'wpconsent',
			),
			admin_url( 'admin.php' )
		);
		$text = esc_html__( 'Dashboard', 'wpconsent-cookies-banner-privacy-suite' );

		$custom = array();

		$custom['wpconsentpro'] = sprintf(
			'<a href="%1$s" aria-label="%2$s" target="_blank" rel="noopener noreferrer" 
				style="color: #00a32a; font-weight: 700;" 
				onmouseover="this.style.color=\'#008a20\';" 
				onmouseout="this.style.color=\'#00a32a\';"
				>%3$s</a>',
			wpconsent_utm_url(
				'https://wpconsent.com/lite/',
				'all-plugins',
				'get-wpconsent-pro'
			),
			esc_attr__( 'Upgrade to WPConsent Pro', 'wpconsent-cookies-banner-privacy-suite' ),
			esc_html__( 'Get WPConsent Pro', 'wpconsent-cookies-banner-privacy-suite' )
		);

		$custom['settings'] = sprintf(
			'<a href="%1$s">%2$s</a>',
			$url,
			$text
		);

		return array_merge( $custom, $links );
	}
}
