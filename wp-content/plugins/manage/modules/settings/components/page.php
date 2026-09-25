<?php
namespace Manage\Modules\Settings\Components;

use Manage\Modules\Connect\Module as Connect;
use Manage\Modules\Settings\Module as Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Page {

	const MANAGE_ALL_SITES_URL = 'https://my.elementor.com/websites/sites/manage/all/';
	const MANAGE_SITE_OVERVIEW_URL = 'https://my.elementor.com/websites/sites/manage/site/{siteId}/overview/';
	const MANAGE_SITE_MONITORING_URL = 'https://my.elementor.com/websites/sites/manage/site/{siteId}/monitoring/';

	public function __construct() {
		add_action( 'admin_menu', [ $this, 'add_settings_page' ], 10010 );
		add_action( 'admin_action_manage_site_overview_redirect', [ $this, 'handle_site_overview_redirect' ] );
	}

	public function add_settings_page(): void {
		$page_menu = add_submenu_page(
			'elementor-home',
			esc_html__( 'Site management', 'manage' ),
			esc_html__( 'Site management', 'manage' ),
			'manage_options',
			Settings::SETTING_BASE_SLUG,
			[ $this, 'render_settings_page' ],
			60
		);

		add_action( 'load-' . $page_menu, [ $this, 'enqueue_assets' ] );
	}


	public function render_settings_page(): void {
		?>
		<!-- The hack required to wrap WP notifications -->
		<div class="wrap">
			<h1 style="display: none;" role="presentation"></h1>
		</div>
		<div id="elementor-manage-app"></div>
		<?php
	}

	public function enqueue_assets( $hook ): void {
		$asset_file = MANAGE_ASSETS_PATH . 'build/manage.asset.php';
		$asset = file_exists( $asset_file ) ? include $asset_file : [
			'dependencies' => [],
			'version' => MANAGE_VERSION,
		];

		wp_enqueue_script( 'elementor-manage-settings', MANAGE_ASSETS_URL . 'build/manage.js', $asset['dependencies'], $asset['version'], true );
		wp_enqueue_style( 'manage-settings-style', MANAGE_ASSETS_URL . 'build/style-manage.css', [], MANAGE_VERSION );

		$site_id = Connect::get_connect()->data()->get_client_id();

		wp_add_inline_script(
			'elementor-manage-settings',
			'window.elementorManageSettingsData = ' . wp_json_encode( [
				'wpRestNonce' => wp_create_nonce( 'wp_rest' ),
				'wpRestUrl' => rest_url(),
				'version' => MANAGE_VERSION,
				'isDevelopment' => defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG,
				'shareUsageData' => 'yes' === Connect::get_connect()->data()->get_share_usage_data(),
				'links' => [
					'allSites' => self::get_manage_all_sites_url(),
					'siteOverview' => self::get_manage_site_overview_url( $site_id ),
					'siteMonitoring' => self::get_manage_site_monitoring_url( $site_id ),
				],
			] ) . ';'
		);
	}

	public static function get_manage_all_sites_url(): string {
		return apply_filters( 'manage/all_sites_url', self::MANAGE_ALL_SITES_URL );
	}

	public static function get_manage_site_monitoring_url( string $site_id ): string {
		return apply_filters( 'manage/site_monitoring_url', str_replace( '{siteId}', $site_id, self::MANAGE_SITE_MONITORING_URL ) );
	}

	public static function get_manage_site_overview_url( string $site_id ): string {
		return apply_filters( 'manage/site_overview_url', str_replace( '{siteId}', $site_id, self::MANAGE_SITE_OVERVIEW_URL ) );
	}

	public function handle_site_overview_redirect(): void {
		check_admin_referer( 'manage_site_overview_redirect' );

		$site_id = Connect::get_connect()->data()->get_client_id();

		wp_redirect( self::get_manage_site_overview_url( $site_id ) ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
		exit;
	}
}
