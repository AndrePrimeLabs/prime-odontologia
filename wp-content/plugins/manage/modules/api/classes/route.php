<?php
namespace Manage\Modules\Api\Classes;

use Manage\Classes\Manage_Client;
use Manage\Classes\Jwks_Decoder;
use Manage\Classes\System_User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Route {

	const NAMESPACE = 'manage/v1';

	abstract public function register_routes();

	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	public function token_authentication( $request ) {
		if ( $this->is_authentication_skipped() ) {
			return true;
		}

		$auth_header = $this->get_authorization_header( $request );

		if ( ! $auth_header ) {
			return new \WP_Error( 'no_auth_header', 'Authorization header missing.', [ 'status' => \WP_Http::UNAUTHORIZED ] );
		}

		if ( ! preg_match( '/Bearer\s(\S+)/', $auth_header, $matches ) ) {
			return new \WP_Error( 'invalid_token', 'Invalid or missing token.', [ 'status' => \WP_Http::FORBIDDEN ] );
		}

		$token = $matches[1];

		$jwt_payload = Jwks_Decoder::decode( $token );
		if ( is_wp_error( $jwt_payload ) ) {
			return new \WP_Error( $jwt_payload->get_error_code(), $jwt_payload->get_error_message(), [ 'status' => \WP_Http::FORBIDDEN ] );
		}

		if ( empty( $jwt_payload['sub'] ) || Manage_Client::get_client_id() !== $jwt_payload['sub'] ) {
			return new \WP_Error( 'invalid_site_id', 'Invalid site ID in token.', [ 'status' => \WP_Http::FORBIDDEN ] );
		}

		$system_user = System_User::get_system_user();

		if ( ! $system_user ) {
			return new \WP_Error( 'system_user_not_exists', 'System user does not exist.', [ 'status' => \WP_Http::FORBIDDEN ] );
		}

		$user_status = System_User::get_user_status( $system_user );

		if ( System_User::STATUS_USER_NO_PERMISSIONS === $user_status ) {
			return new \WP_Error( 'system_user_no_permissions', 'System user does not have admin permissions.', [ 'status' => \WP_Http::FORBIDDEN ] );
		}

		wp_set_current_user( $system_user->ID );

		return true;
	}

	private function get_authorization_header( \WP_REST_Request $request ): string {
		/*
		 * Some hosts/proxies (CDN/WAF, FastCGI, mod_security) strip the standard
		 * Authorization header before it reaches PHP. eis-manage sends the same
		 * Bearer token under X-Manage-Authorization as a fallback. Standard
		 * Authorization is preferred when both are present.
		 */
		foreach ( [ 'authorization', 'x-manage-authorization' ] as $header_name ) {
			$value = $request->get_header( $header_name );

			if ( $value ) {
				return $value;
			}
		}

		/*
		 * WP_REST_Server::get_headers() already handles HTTP_AUTHORIZATION and
		 * REDIRECT_HTTP_AUTHORIZATION, but getallheaders() can still surface the
		 * header on servers where neither $_SERVER key is populated.
		 */
		if ( function_exists( 'getallheaders' ) ) {
			foreach ( getallheaders() as $name => $value ) {
				if (
					strcasecmp( $name, 'authorization' ) === 0 ||
					strcasecmp( $name, 'x-manage-authorization' ) === 0
				) {
					return sanitize_text_field( $value );
				}
			}
		}

		return '';
	}

	private function is_authentication_skipped(): bool {
		if ( ! defined( 'MANAGE_DEV_MODE' ) || ! MANAGE_DEV_MODE ) {
			return false;
		}

		if ( ! $this->is_local_ip() ) {
			return false;
		}

		return true;
	}

	private function is_local_ip(): bool {
		if ( ! empty( $_SERVER['REMOTE_ADDR'] ) && in_array( $_SERVER['REMOTE_ADDR'], [ '127.0.0.1', '::1' ], true ) ) {
			return true;
		}

		return false;
	}
}
