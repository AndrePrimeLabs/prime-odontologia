<?php
/**
 * Lite-specific admin page loader.
 * Extends the default pages with lite-specific items.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Admin_Page_Loader_Lite.
 */
class WPConsent_Admin_Page_Loader_Lite extends WPConsent_Admin_Page_Loader {

	/**
	 * Load menu items from parent class and add class-specific ones.
	 *
	 * @return void
	 */
	public function hooks() {
		parent::hooks();

		add_action( 'admin_menu', array( $this, 'add_upgrade_menu_item' ), 40 );
		add_action( 'admin_head', array( $this, 'adjust_pro_menu_item_class' ) );
		add_action( 'admin_head', array( $this, 'admin_menu_styles' ), 11 );
	}

	/**
	 * Add lite-specific upgrade to pro menu item.
	 *
	 * @return void
	 */
	public function add_upgrade_menu_item() {
		add_submenu_page(
			'wpconsent',
			esc_html__( 'Upgrade to Pro', 'wpconsent-cookies-banner-privacy-suite' ),
			esc_html__( 'Upgrade to Pro', 'wpconsent-cookies-banner-privacy-suite' ),
			'manage_options',
			esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'admin-side-menu', 'wpconsent-admin' ) )
		);
	}

	/**
	 * Add the PRO badge to left sidebar menu item.
	 *
	 * @since 1.1.0
	 */
	public function adjust_pro_menu_item_class() {

		global $submenu;

		// Bail if plugin menu is not registered.
		if ( ! isset( $submenu['wpconsent'] ) ) {
			return;
		}

		$upgrade_link_position = key(
			array_filter(
				$submenu['wpconsent'],
				static function ( $item ) {
					return false !== strpos( $item[2], 'https://wpconsent.com/lite' );
				}
			)
		);

		// Bail if "Upgrade to Pro" menu item is not registered.
		if ( is_null( $upgrade_link_position ) ) {
			return;
		}

		$screen = get_current_screen();
		// Let's make sure we have an ID and the link is set in the menu.
		if ( isset( $screen->id ) && isset( $submenu['wpconsent'][ $upgrade_link_position ][2] ) ) {
			// Let's clean up the screen id a bit.
			$screen_id = str_replace(
				array(
					'toplevel_page_',
					'wpconsent_page_',
				),
				'',
				$screen->id
			);

			$submenu['wpconsent'][ $upgrade_link_position ][2] = str_replace( 'wpconsent-admin', $screen_id, $submenu['wpconsent'][ $upgrade_link_position ][2] );
		}

		// Prepare a HTML class.
		// phpcs:disable WordPress.WP.GlobalVariablesOverride.Prohibited
		if ( isset( $submenu['wpconsent'][ $upgrade_link_position ][4] ) ) {
			$submenu['wpconsent'][ $upgrade_link_position ][4] .= ' wpconsent-sidebar-upgrade-pro';
		} else {
			$submenu['wpconsent'][ $upgrade_link_position ][] = 'wpconsent-sidebar-upgrade-pro';
		}
		// phpcs:enable WordPress.WP.GlobalVariablesOverride.Prohibited
	}


	/**
	 * Output inline styles for the admin menu.
	 */
	public function admin_menu_styles() {
		$styles = 'a.wpconsent-sidebar-upgrade-pro { background-color: #59A56D !important; color: #fff !important; font-weight: 600 !important; }';

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		printf( '<style>%s</style>', $styles );
	}
}
