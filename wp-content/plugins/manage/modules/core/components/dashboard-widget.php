<?php
namespace Manage\Modules\Core\Components;

use Manage\Classes\Utils;
use Manage\Modules\Connect\Module as Connect;
use Manage\Modules\Settings\Components\Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dashboard_Widget {

	public function __construct() {
		add_filter( 'elementor_one/manage_dashboard_widget_is_delegated', '__return_true' );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
	}

	public function enqueue_assets(): void {
		if ( ! Utils::is_wp_dashboard_page() || ! Connect::is_connected() ) {
			return;
		}

		$asset_file = MANAGE_ASSETS_PATH . 'build/dashboard-widget.asset.php';
		$asset = file_exists( $asset_file ) ? include $asset_file : [
			'dependencies' => [],
			'version' => MANAGE_VERSION,
		];

		wp_enqueue_script(
			'elementor-manage-dashboard-widget',
			MANAGE_ASSETS_URL . 'build/dashboard-widget.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'elementor-manage-dashboard-widget',
			MANAGE_ASSETS_URL . 'build/dashboard-widget.css',
			[],
			MANAGE_VERSION
		);

		wp_add_inline_script(
			'elementor-manage-dashboard-widget',
			'window.elementorManageDashboardData = ' . wp_json_encode( [
				'wpRestNonce' => wp_create_nonce( 'wp_rest' ),
				'wpRestUrl' => rest_url(),
				'shareUsageData' => 'yes' === Connect::get_connect()->data()->get_share_usage_data(),
				'isRTL' => is_rtl(),
				'isDevelopment' => defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG,
				'isElementorOne' => Connect::is_elementor_one(),
				'links' => [
					'updatesPage' => admin_url( 'update-core.php' ),
					'myElementor' => Page::get_manage_all_sites_url(),
					'upgradeToOne' => apply_filters(
						'elementor_one/upgrade_url',
						'https://go.elementor.com/go-pro-upgrade-one-wp-menu/'
					),
				],
			] ) . ';'
		);
	}
}
