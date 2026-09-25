<?php
namespace Manage\Classes;

use Manage\Modules\Connect\Module as Connect;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Platform_Client {
	public const BASE_URL = 'https://my.elementor.com/';

	protected bool $refreshed = false;

	abstract protected static function get_api_path(): string;

	abstract protected static function get_grant_type(): string;

	protected static function get_base_url(): string {
		return trailingslashit( self::BASE_URL ) . ltrim( static::get_api_path(), '/' );
	}

	protected function get_remote_url( string $endpoint ): string {
		return trailingslashit( static::get_base_url() ) . ltrim( $endpoint, '/' );
	}

	protected static function is_connected(): bool {
		return Connect::is_connected();
	}

	protected function add_bearer_token( array $headers ): array {
		if ( static::is_connected() ) {
			$headers['Authorization'] = 'Bearer ' . Connect::get_connect()->data()->get_access_token( static::get_grant_type() );
		}

		return $headers;
	}

	protected function renew_access_token(): void {
		Connect::get_connect()->service()->renew_access_token( static::get_grant_type() );
		$this->refreshed = true;
	}

	protected function make_request( string $method, string $endpoint, array $body = [], array $headers = [], bool $send_json = false ) {
		$headers = array_replace_recursive(
			$headers,
			static::is_connected() ? $this->add_bearer_token( [] ) : []
		);

		if ( $send_json ) {
			$headers['Content-Type'] = 'application/json';
			$body = wp_json_encode( $body );
		}

		return $this->request(
			$method,
			$endpoint,
			[
				'timeout' => 100,
				'headers' => $headers,
				'body' => $body,
			]
		);
	}

	protected function should_retry_after_unauthorized(): bool {
		return true;
	}

	protected function handle_empty_body( string $raw_body, int $response_code, $decoded_body, array $response ) {
		if ( empty( $decoded_body ) && \WP_Http::OK !== $response_code ) {
			return new \WP_Error( $response_code, wp_remote_retrieve_response_message( $response ) );
		}

		return null;
	}

	protected function handle_non_ok_response( $decoded_body, int $response_code, array $response ): ?\WP_Error {
		return null;
	}

	protected function build_non_ok_error( $decoded_body, int $response_code, array $response ): \WP_Error {
		$message = $decoded_body->message ?? wp_remote_retrieve_response_message( $response );
		$message = is_array( $message ) ? join( ', ', $message ) : $message;
		$code = isset( $decoded_body->code ) ? (int) $decoded_body->code : $response_code;

		return new \WP_Error( $code, $message, $decoded_body );
	}

	protected function request( string $method, string $endpoint, array $args = [] ) {
		$args['method'] = $method;

		$response = wp_remote_request( $this->get_remote_url( $endpoint ), $args );

		if ( is_wp_error( $response ) ) {
			$message = $response->get_error_message();

			return new \WP_Error( $response->get_error_code(), is_array( $message ) ? join( ', ', $message ) : $message );
		}

		$body = wp_remote_retrieve_body( $response );
		$response_code = (int) wp_remote_retrieve_response_code( $response );

		if ( ! $response_code ) {
			return new \WP_Error( \WP_Http::INTERNAL_SERVER_ERROR, 'No Response' );
		}

		if ( 'null' === $body || 'OK' === $body ) {
			return true;
		}

		if ( in_array( $response_code, [ \WP_Http::CREATED, \WP_Http::NO_CONTENT ], true ) ) {
			return true;
		}

		$decoded_body = json_decode( $body );

		$empty_body_result = $this->handle_empty_body( $body, $response_code, $decoded_body, $response );
		if ( is_wp_error( $empty_body_result ) ) {
			return $empty_body_result;
		}

		if ( ! $this->refreshed && \WP_Http::UNAUTHORIZED === $response_code && $this->should_retry_after_unauthorized() ) {
			$this->renew_access_token();
			$args['headers'] = $this->add_bearer_token( $args['headers'] ?? [] );

			return $this->request( $method, $endpoint, $args );
		}

		$hook_result = $this->handle_non_ok_response( $decoded_body, $response_code, $response );
		if ( is_wp_error( $hook_result ) ) {
			return $hook_result;
		}

		if ( \WP_Http::OK !== $response_code ) {
			return $this->build_non_ok_error( $decoded_body, $response_code, $response );
		}

		return $decoded_body;
	}
}
