<?php
namespace Manage\Modules\Api\Components;

use Manage\Modules\Api\Classes\Route;
use Manage\Modules\Api\Classes\Translation_Updater;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Core extends Route {

	public function register_routes() {
		register_rest_route( static::NAMESPACE, '/core/update', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'update_core' ],
		] );

		register_rest_route( static::NAMESPACE, '/core/rollback', [
			'methods' => 'GET',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'get_rollback_versions' ],
		] );

		register_rest_route( static::NAMESPACE, '/core/rollback', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'rollback_core' ],
			'args' => [
				'version' => [
					'required' => true,
					'type' => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/core/update-translations', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'update_all_translations' ],
			'args' => [],
		] );

		register_rest_route( static::NAMESPACE, '/core/update-db', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'update_db' ],
		] );
	}

	public function update_core( $request ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		require_once ABSPATH . 'wp-admin/includes/update.php';

		wp_version_check();
		$current = get_site_transient( 'update_core' );

		if ( ! $current || ! isset( $current->updates[0] ) || 'upgrade' !== $current->updates[0]->response ) {
			return new \WP_Error(
				'no_update_available',
				'No WordPress core update available.',
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$update = $current->updates[0];

		// Perform the core update
		$skin = new \WP_Ajax_Upgrader_Skin();
		$upgrader = new \Core_Upgrader( $skin );
		$result = $upgrader->upgrade( $update );

		if ( is_wp_error( $result ) ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update WordPress core: ' . $result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( is_wp_error( $skin->result ) ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update WordPress core: ' . $skin->result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( $skin->get_errors()->has_errors() ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update WordPress core: ' . $skin->get_error_messages(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( ! $result ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update WordPress core for an unknown reason.',
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'WordPress core updated successfully.',
		] );
	}

	public function get_rollback_versions( $request ) {
		require_once ABSPATH . 'wp-admin/includes/update.php';

		$response = wp_remote_get( 'https://api.wordpress.org/core/version-check/1.7/' );

		if ( is_wp_error( $response ) ) {
			return new \WP_Error(
				'api_request_failed',
				'Failed to fetch WordPress versions: ' . $response->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		if ( ! $data || ! isset( $data['offers'] ) ) {
			return new \WP_Error(
				'invalid_api_response',
				'Invalid response from WordPress version API.',
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$versions = [];

		foreach ( $data['offers'] as $offer ) {
			if ( isset( $offer['version'] ) ) {
				$versions[] = $offer['version'];
			}
		}

		$versions = array_unique( $versions );

		usort( $versions, 'version_compare' );
		$versions = array_reverse( $versions );

		$maximum_versions = 30;
		$versions = array_slice( $versions, 0, $maximum_versions );

		return rest_ensure_response( [
			'status' => 'success',
			'data' => [
				'versions' => $versions,
			],
		] );
	}

	public function rollback_core( $request ) {
		$version = $request->get_param( 'version' );

		if ( empty( $version ) ) {
			return new \WP_Error( 'missing_version', 'Version is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/update.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

		$current_version = get_bloginfo( 'version' );

		if ( version_compare( $current_version, $version, '=' ) ) {
			return new \WP_Error(
				'same_version',
				'WordPress is already at version ' . $version,
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		// Construct download URL for the specific WordPress version
		$download_url = sprintf( 'https://wordpress.org/wordpress-%s.zip', $version );

		// Perform the core rollback
		$skin = new \WP_Ajax_Upgrader_Skin();
		$upgrader = new \Core_Upgrader( $skin );

		// Create proper package structure for Core_Upgrader
		$rollback_package = (object) [
			'response' => 'upgrade',
			'version' => $version,
			'current' => $current_version,
			'packages' => (object) [
				'rollback' => $download_url,
				'full' => $download_url,
			],
		];

		$result = $upgrader->upgrade( $rollback_package, [ 'do_rollback' => true ] );

		if ( is_wp_error( $result ) ) {
			return new \WP_Error(
				'rollback_failed',
				'Failed to rollback WordPress core: ' . $result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( is_wp_error( $skin->result ) ) {
			return new \WP_Error(
				'rollback_failed',
				'Failed to rollback WordPress core: ' . $skin->result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( $skin->get_errors()->has_errors() ) {
			return new \WP_Error(
				'rollback_failed',
				'Failed to rollback WordPress core: ' . $skin->get_error_messages(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( ! $result ) {
			return new \WP_Error(
				'rollback_failed',
				'Failed to rollback WordPress core for an unknown reason.',
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'WordPress core rolled back successfully.',
		] );
	}

	public function update_all_translations( $request ) {
		return Translation_Updater::update_translations( 'core' );
	}

	public function update_db() {
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		wp_upgrade();

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Database updated successfully.',
		] );
	}
}
