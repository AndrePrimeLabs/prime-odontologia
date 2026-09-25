<?php
namespace Manage\Modules\Api\Components;

use Manage\Modules\Api\Classes\Route;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Login extends Route {

	const TEMP_LOGIN_TOKEN_TRANSIENT_KEY_PREFIX = 'manage_temp_login_token_';

	public function __construct() {
		parent::__construct();

		if ( ! empty( $_GET['manage-temp-login-token'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			add_action( 'init', [ $this, 'maybe_process_login' ] );
		}
	}

	public function register_routes() {
		register_rest_route( static::NAMESPACE, '/login/admins', [
			'methods'  => 'GET',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'get_admin_users' ],
		] );

		register_rest_route( static::NAMESPACE, '/login/user/(?P<id>\d+)', [
			'methods'  => 'GET',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'get_temp_login_url' ],
			'args' => [
				'id' => [
					'required' => true,
					'validate_callback' => function( $param ) {
						return is_numeric( $param );
					},
				],
			],
		] );
	}

	public function get_admin_users() {
		$admin_users = get_users( [
			'role' => 'administrator',
			'meta_query' => [
				[
					'key' => '_manage_system_user',
					'compare' => 'NOT EXISTS',
				],
			],
		] );

		$response_users = [];

		foreach ( $admin_users as $user ) {
			$response_users[] = [
				'user_ID' => (int) $user->ID,
				'display_name' => $user->display_name,
			];
		}

		return rest_ensure_response( [
			'status' => 'success',
			'data' => $response_users,
		] );
	}

	public function get_temp_login_url( $request ) {
		$user_id = (int) $request['id'];

		$user = get_user_by( 'ID', $user_id );
		if ( ! $user ) {
			return new \WP_Error( 'user_not_found', 'User not found.', [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		$token = self::generate_token();
		$transient_key = self::TEMP_LOGIN_TOKEN_TRANSIENT_KEY_PREFIX . $token;

		$expiration = 10 * MINUTE_IN_SECONDS;
		set_transient( $transient_key, $user_id, $expiration );

		$temp_url = add_query_arg( [
			'manage-temp-login-token' => $token,
		], admin_url() );

		return rest_ensure_response( [
			'status' => 'success',
			'data' => [
				'temp_login_url' => $temp_url,
				'expires_in_minutes' => 10,
			],
		] );
	}

	private static function generate_token( $length = 32 ): string {
		return bin2hex( random_bytes( $length ) );
	}

	public function maybe_process_login() {
		$token = sanitize_key( $_GET['manage-temp-login-token'] ?? '' ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( empty( $token ) ) {
			wp_safe_redirect( home_url() );
			exit;
		}

		$transient_key = self::TEMP_LOGIN_TOKEN_TRANSIENT_KEY_PREFIX . $token;
		$user_id = get_transient( $transient_key );

		if ( false === $user_id ) {
			wp_safe_redirect( home_url() );
			exit;
		}

		delete_transient( $transient_key );

		$user = get_user_by( 'ID', $user_id );
		if ( ! $user ) {
			wp_die( 'User no longer exists.', 'User Not Found', [ 'response' => (int) \WP_Http::NOT_FOUND ] );
		}

		if ( is_user_logged_in() ) {
			$current_user_id = get_current_user_id();
			if ( $user->ID !== $current_user_id ) {
				wp_logout();
			}
		}

		wp_set_current_user( $user_id, $user->user_login );
		wp_set_auth_cookie( $user_id );

		do_action( 'wp_login', $user->user_login, $user );

		wp_safe_redirect( admin_url() );
		exit;
	}
}
