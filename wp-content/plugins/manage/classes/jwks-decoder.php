<?php
namespace Manage\Classes;

use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Jwks_Decoder {

	const JWKS_URL = 'https://my.elementor.com/.well-known/manage/jwks.json';
	const JWKS_TRANSIENT_KEY = '_manage_jwks_cache';
	const JWKS_CACHE_EXPIRATION = HOUR_IN_SECONDS;

	private static $jwks = null;

	public static function reset_cache() {
		self::$jwks = null;
		delete_transient( static::JWKS_TRANSIENT_KEY );
	}

	public static function decode( string $payload ) {

		if ( empty( $payload ) ) {
			return new \WP_Error( 'empty_payload', esc_html__( 'Payload is empty.', 'manage' ) );
		}

		if ( null === self::$jwks ) {
			self::$jwks = static::fetch_jwks();

			if ( null === self::$jwks ) {
				return new \WP_Error( 'invalid_jwks', esc_html__( 'Failed to fetch JWKS.', 'manage' ) );
			}
		}

		if ( ! class_exists( 'JWT' ) ) {
			require_once MANAGE_PATH . 'vendor/autoload.php';
		}

		try {
			return (array) JWT::decode( $payload, JWK::parseKeySet( self::$jwks ) );
		} catch ( \Throwable $th ) {
			if ( $th instanceof ExpiredException ) {
				return new \WP_Error( 'jwt_expired', esc_html__( 'JWT has expired.', 'manage' ) );
			}

			return new \WP_Error( 'jwt_decode_error', esc_html__( 'Failed to decode JWT', 'manage' ) . ': ' . $th->getMessage() );
		}
	}

	private static function fetch_jwks(): ?array {
		$cached_jwks = get_transient( static::JWKS_TRANSIENT_KEY );

		if ( false !== $cached_jwks ) {
			return $cached_jwks;
		}

		$response = wp_remote_get( static::JWKS_URL, [
			'timeout' => 10,
			'headers' => [
				'Accept' => 'application/json',
			],
		] );

		if ( is_wp_error( $response ) || \WP_Http::OK !== wp_remote_retrieve_response_code( $response ) ) {
			return null;
		}

		$jwks_data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( null !== $jwks_data ) {
			set_transient( static::JWKS_TRANSIENT_KEY, $jwks_data, static::JWKS_CACHE_EXPIRATION );
		}

		return $jwks_data;
	}
}
