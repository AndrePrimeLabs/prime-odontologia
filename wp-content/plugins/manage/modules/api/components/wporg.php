<?php
namespace Manage\Modules\Api\Components;

use Manage\Modules\Api\Classes\Route;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Wporg extends Route {

	public function register_routes() {
		register_rest_route( self::NAMESPACE, '/wporg/plugins', [
			'methods' => 'GET',
			'callback' => [ $this, 'list_plugins' ],
			'permission_callback' => [ $this, 'token_authentication' ],
			'args' => [
				'page' => [
					'required' => false,
					'type' => 'integer',
					'default' => 1,
					'minimum' => 1,
					'description' => 'Page number for pagination.',
					'validate_callback' => [ $this, 'validate_page' ],
					'sanitize_callback' => 'absint',
				],
				'per_page' => [
					'required' => false,
					'type' => 'integer',
					'default' => 24,
					'minimum' => 1,
					'maximum' => 100,
					'description' => 'Number of plugins per page, max 100.',
					'validate_callback' => [ $this, 'validate_per_page' ],
					'sanitize_callback' => 'absint',
				],
				'browse' => [
					'required' => false,
					'type' => 'string',
					'default' => 'popular',
					'enum' => [ 'popular', 'new', 'updated', 'featured' ],
					'description' => 'Browse type - popular, new, updated, featured.',
					'validate_callback' => [ $this, 'validate_browse' ],
					'sanitize_callback' => 'sanitize_key',
				],
				'tag' => [
					'required' => false,
					'type' => 'string',
					'description' => 'Filter by tag.',
					'validate_callback' => [ $this, 'validate_optional_string' ],
					'sanitize_callback' => 'sanitize_text_field',
				],
				'author' => [
					'required' => false,
					'type' => 'string',
					'description' => 'Filter by author.',
					'validate_callback' => [ $this, 'validate_optional_string' ],
					'sanitize_callback' => 'sanitize_text_field',
				],
				'search' => [
					'required' => false,
					'type' => 'string',
					'description' => 'Search term for plugins.',
					'validate_callback' => [ $this, 'validate_optional_string' ],
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );

		register_rest_route( self::NAMESPACE, '/wporg/plugins/(?P<slug>[a-zA-Z0-9_-]+)', [
			'methods' => 'GET',
			'callback' => [ $this, 'get_plugin_info' ],
			'permission_callback' => [ $this, 'token_authentication' ],
		] );

		register_rest_route( self::NAMESPACE, '/wporg/themes', [
			'methods' => 'GET',
			'callback' => [ $this, 'list_themes' ],
			'permission_callback' => [ $this, 'token_authentication' ],
			'args' => [
				'page' => [
					'required' => false,
					'type' => 'integer',
					'default' => 1,
					'minimum' => 1,
					'description' => 'Page number for pagination.',
					'validate_callback' => [ $this, 'validate_page' ],
					'sanitize_callback' => 'absint',
				],
				'per_page' => [
					'required' => false,
					'type' => 'integer',
					'default' => 24,
					'minimum' => 1,
					'maximum' => 100,
					'description' => 'Number of themes per page, max 100.',
					'validate_callback' => [ $this, 'validate_per_page' ],
					'sanitize_callback' => 'absint',
				],
				'browse' => [
					'required' => false,
					'type' => 'string',
					'default' => 'popular',
					'enum' => [ 'popular', 'new', 'updated', 'featured' ],
					'description' => 'Browse type - popular, new, updated, featured.',
					'validate_callback' => [ $this, 'validate_browse' ],
					'sanitize_callback' => 'sanitize_key',
				],
				'tag' => [
					'required' => false,
					'type' => 'string',
					'description' => 'Filter by tag.',
					'validate_callback' => [ $this, 'validate_optional_string' ],
					'sanitize_callback' => 'sanitize_text_field',
				],
				'author' => [
					'required' => false,
					'type' => 'string',
					'description' => 'Filter by author.',
					'validate_callback' => [ $this, 'validate_optional_string' ],
					'sanitize_callback' => 'sanitize_text_field',
				],
				'search' => [
					'required' => false,
					'type' => 'string',
					'description' => 'Search term for themes.',
					'validate_callback' => [ $this, 'validate_optional_string' ],
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );

		register_rest_route( self::NAMESPACE, '/wporg/themes/(?P<slug>[a-zA-Z0-9_-]+)', [
			'methods' => 'GET',
			'callback' => [ $this, 'get_theme_info' ],
			'permission_callback' => [ $this, 'token_authentication' ],
		] );
	}

	public function validate_page( $value, $request, $param ) {
		$value = absint( $value );
		if ( $value < 1 ) {
			return new \WP_Error( 'invalid_page', 'Page number must be 1 or greater.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		return true;
	}

	public function validate_per_page( $value, $request, $param ) {
		$value = absint( $value );
		if ( $value < 1 || $value > 100 ) {
			return new \WP_Error( 'invalid_per_page', 'Per page value must be between 1 and 100.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		return true;
	}

	public function validate_browse( $value, $request, $param ) {
		$allowed_values = [ 'popular', 'new', 'updated', 'featured' ];
		if ( ! in_array( $value, $allowed_values, true ) ) {
			return new \WP_Error( 'invalid_browse', 'Browse parameter must be one of: ' . implode( ', ', $allowed_values ), [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		return true;
	}

	public function validate_optional_string( $value, $request, $param ) {
		if ( null !== $value && ! is_string( $value ) ) {
			return new \WP_Error( 'invalid_' . $param, ucfirst( $param ) . ' parameter must be a string.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		return true;
	}

	public function list_plugins( \WP_REST_Request $request ) {
		return $this->query_items( $request, 'plugins' );
	}

	private function query_items( \WP_REST_Request $request, $type ) {
		$search = $request->get_param( 'search' );
		$browse = $request->get_param( 'browse' );
		$tag = $request->get_param( 'tag' );
		$author = $request->get_param( 'author' );

		$fields = ( 'plugins' === $type ) ? $this->get_plugin_fields() : $this->get_theme_fields();
		$action = ( 'plugins' === $type ) ? 'query_plugins' : 'query_themes';

		$api_request = [
			'action' => $action,
			'request' => [
				'page' => $request->get_param( 'page' ),
				'per_page' => $request->get_param( 'per_page' ),
				'fields' => $fields,
			],
		];

		if ( $search ) {
			$api_request['request']['search'] = $search;
		}

		if ( $tag ) {
			$api_request['request']['tag'] = $tag;
		}

		if ( $author ) {
			$api_request['request']['author'] = $author;
		}

		$is_can_use_browse = empty( $tag ) && empty( $author ) && empty( $search );
		if ( $is_can_use_browse ) {
			$api_request['request']['browse'] = $browse;
		}

		$response = $this->make_wporg_request( $type, $api_request );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return rest_ensure_response( [
			'status' => 'success',
			'data' => $response,
		] );
	}

	private function get_plugin_fields(): array {
		return [
			'short_description' => true,
			'rating' => true,
			'ratings' => true,
			'downloaded' => true,
			'active_installs' => true,
			'last_updated' => true,
			'added' => true,
			'homepage' => true,
			'tags' => true,
			'icons' => true,
			'banners' => true,
		];
	}

	private function get_theme_fields(): array {
		return [
			'description' => true,
			'rating' => true,
			'ratings' => true,
			'downloaded' => true,
			'last_updated' => true,
			'creation_time' => true,
			'homepage' => true,
			'tags' => true,
			'screenshot_url' => true,
			'preview_url' => true,
		];
	}

	public function get_plugin_info( \WP_REST_Request $request ) {
		$slug = $request->get_param( 'slug' );

		if ( empty( $slug ) ) {
			return new \WP_Error( 'missing_plugin_slug', 'Plugin slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$api_request = [
			'action' => 'plugin_information',
			'request' => [
				'slug' => $slug,
				'fields' => [
					'short_description' => true,
					'description' => true,
					'installation' => true,
					'faq' => true,
					'screenshots' => true,
					'changelog' => true,
					'rating' => true,
					'ratings' => true,
					'downloaded' => true,
					'active_installs' => true,
					'last_updated' => true,
					'added' => true,
					'homepage' => true,
					'tags' => true,
					'donate_link' => true,
					'icons' => true,
					'banners' => true,
					'contributors' => true,
					'requires' => true,
					'tested' => true,
					'requires_php' => true,
					'versions' => true,
				],
			],
		];

		$response = $this->make_wporg_request( 'plugins', $api_request );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return rest_ensure_response( [
			'status' => 'success',
			'data' => $response,
		] );
	}

	public function list_themes( \WP_REST_Request $request ) {
		return $this->query_items( $request, 'themes' );
	}

	public function get_theme_info( \WP_REST_Request $request ) {
		$slug = $request->get_param( 'slug' );

		if ( empty( $slug ) ) {
			return new \WP_Error( 'missing_theme_slug', 'Theme slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$api_request = [
			'action' => 'theme_information',
			'request' => [
				'slug' => $slug,
				'fields' => [
					'description' => true,
					'rating' => true,
					'ratings' => true,
					'downloaded' => true,
					'last_updated' => true,
					'creation_time' => true,
					'homepage' => true,
					'tags' => true,
					'screenshot_url' => true,
					'preview_url' => true,
					'screenshots' => true,
					'versions' => true,
					'requires' => true,
					'tested' => true,
					'requires_php' => true,
				],
			],
		];

		$response = $this->make_wporg_request( 'themes', $api_request );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return rest_ensure_response( [
			'status' => 'success',
			'data' => $response,
		] );
	}

	private function make_wporg_request( string $type, array $request_data ) {
		$base_url = "https://api.wordpress.org/{$type}/info/1.2/";

		$query_params = http_build_query( $request_data );
		$url = $base_url . '?' . $query_params;

		$response = wp_remote_get( $url, [
			'timeout' => 30,
			'user-agent' => 'WordPress/' . get_bloginfo( 'version' ) . '; ' . home_url(),
		] );

		if ( is_wp_error( $response ) ) {
			return new \WP_Error( 'api_request_failed', 'Failed to fetch data from WordPress.org API.', [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
		}

		$response_code = (int) wp_remote_retrieve_response_code( $response );
		if ( \WP_Http::OK !== $response_code ) {
			return new \WP_Error( 'api_request_failed', 'WordPress.org API returned error code: ' . $response_code, [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		if ( ! $data ) {
			return new \WP_Error( 'api_response_invalid', 'Invalid response from WordPress.org API.', [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
		}

		return $data;
	}
}
