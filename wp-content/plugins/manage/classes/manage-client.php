<?php
namespace Manage\Classes;

use ElementorOne\Connect\Classes\GrantTypes;
use Manage\Modules\Connect\Module as Connect;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Manage_Client extends Platform_Client {
	private static ?Manage_Client $instance = null;

	public static function get_instance(): Manage_Client {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	protected static function get_api_path(): string {
		return 'manage/api/v1/';
	}

	protected static function get_grant_type(): string {
		return GrantTypes::CLIENT_CREDENTIALS;
	}

	public static function get_site_info(): array {
		return [
			'app_version' => MANAGE_VERSION,
			'site_lang' => get_bloginfo( 'language' ),
			'site_url' => trailingslashit( home_url() ),
		];
	}

	public static function get_client_id(): ?string {
		return Connect::get_connect()->data()->get_client_id();
	}

	public function make_request( $method, $endpoint, $body = [], array $headers = [], $send_json = false ) {
		$body = array_replace_recursive( $body, static::get_site_info() );

		if ( static::is_connected() ) {
			$headers = array_replace_recursive(
				$headers,
				$this->generate_authentication_headers( $endpoint )
			);
		}

		return parent::make_request( $method, $endpoint, $body, $headers, $send_json );
	}

	public static function is_connected(): bool {
		return Connect::is_connected();
	}

	protected function generate_authentication_headers( $endpoint ): array {
		$headers = [
			'endpoint' => $endpoint,
		];

		return $this->add_bearer_token( $headers );
	}

	protected function handle_empty_body( string $raw_body, int $response_code, $decoded_body, array $response ) {
		if ( empty( $decoded_body ) ) {
			return new \WP_Error( \WP_Http::UNPROCESSABLE_ENTITY, 'Wrong Server Response' );
		}

		return null;
	}

	protected function handle_non_ok_response( $decoded_body, int $response_code, array $response ): ?\WP_Error {
		if ( ! $this->refreshed && ! empty( $decoded_body->message ) && false !== strpos( $decoded_body->message, 'site url mismatch' ) ) {
			Connect::get_connect()->data()->set_home_url( 'https://wrongurl' );

			return new \WP_Error( \WP_Http::UNAUTHORIZED, 'site url mismatch' );
		}

		return null;
	}

	public static function register_website() {
		$home_url = trailingslashit( home_url() );

		return self::get_instance()->make_request( 'POST', 'sites', [
			'rest_url' => get_rest_url( null, 'manage/v1' ),
			'home_url' => $home_url,
		] );
	}

	public static function sync_website() {
		return self::get_instance()->make_request( 'POST', 'sites/sync' );
	}
}
