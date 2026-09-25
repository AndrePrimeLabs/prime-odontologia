<?php
namespace Manage\Modules\Settings\Components;

use Manage\Classes\Manage_Client;
use Manage\Classes\Dashboard_Widget_Data;
use Manage\Classes\System_User;
use Manage\Classes\Utils;
use Manage\Modules\Connect\Module as Connect;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Routes {

	const REST_NAMESPACE = 'manage/v1/admin';

	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	public function register_routes() {
		register_rest_route( static::REST_NAMESPACE, '/generate-system-user', [
			'methods' => 'POST',
			'permission_callback' => [ Utils::class, 'user_is_admin' ],
			'callback' => [ $this, 'generate_system_user' ],
		] );

		register_rest_route( static::REST_NAMESPACE, '/sync', [
			'methods' => 'POST',
			'permission_callback' => [ Utils::class, 'user_is_admin' ],
			'callback' => [ $this, 'process_sync' ],
		] );

		register_rest_route( static::REST_NAMESPACE, '/settings', [
			'methods' => 'GET',
			'permission_callback' => [ Utils::class, 'user_is_admin' ],
			'callback' => [ $this, 'get_settings' ],
		] );

		register_rest_route( static::REST_NAMESPACE, '/dashboard-widget', [
			'methods' => 'GET',
			'permission_callback' => [ $this, 'dashboard_widget_permission' ],
			'callback' => [ $this, 'get_dashboard_widget' ],
		] );

		register_rest_route( static::REST_NAMESPACE, '/dashboard-widget/performance', [
			'methods' => 'GET',
			'permission_callback' => [ $this, 'dashboard_widget_permission' ],
			'callback' => [ $this, 'get_dashboard_widget_performance' ],
		] );
	}

	public function dashboard_widget_permission(): bool {
		if ( ! Utils::user_is_admin() ) {
			return false;
		}

		return Connect::is_connected();
	}

	public function get_dashboard_widget() {
		$aggregator = new Dashboard_Widget_Data();

		return rest_ensure_response( [
			'status' => 'success',
			'data' => $aggregator->get_all(),
		] );
	}

	public function get_dashboard_widget_performance() {
		$aggregator = new Dashboard_Widget_Data();

		return rest_ensure_response( [
			'status' => 'success',
			'data' => $aggregator->get_performance_summary(),
		] );
	}

	public function generate_system_user() {
		$is_fixed = System_User::autofix_system_user();
		if ( is_wp_error( $is_fixed ) ) {
			return $is_fixed;
		}

		return rest_ensure_response( [
			'status' => 'success',
			'data' => [
				'message' => 'System user generated successfully',
			],
		] );
	}

	public function process_sync() {
		if ( ! Connect::is_connected() ) {
			return new \WP_Error(
				'not_connected_to_manage',
				__( 'You are not connected to Manage.', 'manage' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		try {
			$response = Manage_Client::register_website();
		} catch ( \Throwable $t ) {
			return new \WP_Error(
				'register_website_failed',
				sprintf( __( 'An error occurred while processing the request: %s', 'manage' ), $t->getMessage() ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return rest_ensure_response( [
			'status' => 'success',
			'data' => [
				'message' => __( 'Website synced successfully', 'manage' ),
			],
		] );
	}

	public function get_settings() {
		return rest_ensure_response( [
			'isConnected' => Connect::is_connected(),
			'isElementorOne' => Connect::is_elementor_one(),
			'isUrlMismatch' => ! Connect::get_connect()->utils()->is_valid_home_url(),
			'systemUserStatus' => System_User::get_user_status(),
			'isRTL' => is_rtl(),
		] );
	}
}
