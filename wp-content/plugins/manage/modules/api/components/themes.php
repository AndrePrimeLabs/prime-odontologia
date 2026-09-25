<?php
namespace Manage\Modules\Api\Components;

use Manage\Modules\Api\Classes\Route;
use Manage\Modules\Api\Classes\Translation_Updater;
use Manage\Modules\Api\Classes\Temp_Backup;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Themes extends Route {

	public function register_routes() {
		register_rest_route( static::NAMESPACE, '/themes/install', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'install_theme' ],
			'args' => [
				'type' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The type of installation: "slug" for WordPress.org repository or "url" for direct URL.',
					'enum' => [ 'slug', 'url' ],
					'sanitize_callback' => 'sanitize_text_field',
				],
				'source' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The theme slug (for type "slug") or URL (for type "url").',
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/themes/activate', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'activate_theme' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the theme to activate.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/themes/uninstall', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'uninstall_theme' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the theme to uninstall.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/themes/update', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'update_theme' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the theme to update.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/themes/rollback', [
			'methods'  => 'GET',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'get_rollback_versions' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the theme to get rollback versions for.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/themes/rollback', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'rollback_theme' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the theme to rollback.',
				],
				'version' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The version to rollback to.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/themes/update-translations', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'update_all_translations' ],
			'args' => [],
		] );

		register_rest_route( static::NAMESPACE, '/themes/temp-backup', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'create_theme_temp_backup' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the theme to create temp backup for.',
				],
			],
		] );
	}

	public function install_theme( $request ) {
		$type = $request->get_param( 'type' );
		$source = $request->get_param( 'source' );

		if ( empty( $type ) || empty( $source ) ) {
			return new \WP_Error( 'missing_parameters', 'Both type and source parameters are required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		if ( ! in_array( $type, [ 'slug', 'url' ], true ) ) {
			return new \WP_Error( 'invalid_type', 'Type must be either "slug" or "url".', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/theme.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		require_once ABSPATH . 'wp-admin/includes/theme-install.php';

		$skin = new \WP_Ajax_Upgrader_Skin();
		$upgrader = new \Theme_Upgrader( $skin );

		if ( 'url' === $type ) {
			$package_url = $this->get_package_url_from_theme_url( $source );
		} else {
			$package_url = $this->get_package_url_from_theme_slug( $source );
		}

		if ( is_wp_error( $package_url ) ) {
			return $package_url;
		}

		$result = $upgrader->install( $package_url );

		if ( is_wp_error( $result ) ) {
			$result->add_data( [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
			return $result;
		}

		if ( is_wp_error( $skin->result ) ) {
			$error_status = \WP_Http::INTERNAL_SERVER_ERROR;
			if ( 'folder_exists' === $skin->result->get_error_code() ) {
				$error_status = \WP_Http::BAD_REQUEST;
			}

			$skin->result->add_data( [ 'status' => $error_status ] );
			return $skin->result;
		}

		if ( $skin->get_errors()->has_errors() ) {
			$error = $skin->get_errors();
			$error->add_data( [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
			return $error;
		}

		if ( ! $result ) {
			return new \WP_Error(
				'unable_to_install_theme',
				'Unable to install the theme.',
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Theme installed successfully.',
		] );
	}

	private function get_package_url_from_theme_url( string $theme_url ) {
		if ( ! filter_var( $theme_url, FILTER_VALIDATE_URL ) ) {
			return new \WP_Error( 'invalid_url', 'Invalid theme URL provided.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$parsed_url = wp_parse_url( $theme_url );
		if ( ! $parsed_url || ( 'https' !== $parsed_url['scheme'] && 'http' !== $parsed_url['scheme'] ) ) {
			return new \WP_Error( 'invalid_url_scheme', 'Theme URL must use HTTP or HTTPS protocol.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		return $theme_url;
	}

	private function get_package_url_from_theme_slug( string $theme_slug ) {
		$installed_themes = wp_get_themes();
		if ( isset( $installed_themes[ $theme_slug ] ) ) {
			return new \WP_Error( 'already_installed', 'Theme already installed.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$api = themes_api( 'theme_information', [
			'slug' => $theme_slug,
			'fields' => [
				'sections' => false,
			],
		] );

		if ( is_wp_error( $api ) ) {
			if ( str_contains( $api->get_error_message(), 'Theme not found.' ) ) {
				$api->add_data( [ 'status' => \WP_Http::NOT_FOUND ] );
			} else {
				$api->add_data( [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
			}

			return $api;
		}

		return $api->download_link;
	}

	public function activate_theme( $request ) {
		$theme_slug = $request->get_param( 'slug' );

		if ( empty( $theme_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Theme slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/theme.php';

		$theme = wp_get_theme( $theme_slug );
		if ( ! $theme->exists() ) {
			return new \WP_Error( 'theme_not_found', 'Theme not found.', [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		if ( $theme->get_stylesheet() === get_stylesheet() ) {
			return new \WP_Error( 'already_active', 'Theme is already active.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		if ( ! $theme->is_allowed() ) {
			return new \WP_Error( 'broken_theme', 'Theme is broken or not compatible.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		switch_theme( $theme->get_stylesheet() );

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Theme activated successfully.',
		] );
	}

	public function uninstall_theme( $request ) {
		$theme_slug = $request->get_param( 'slug' );

		if ( empty( $theme_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Theme slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/theme.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';

		$theme = wp_get_theme( $theme_slug );
		if ( ! $theme->exists() ) {
			return new \WP_Error( 'theme_not_found', 'Theme not found.', [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		if ( $theme->get_stylesheet() === get_stylesheet() ) {
			return new \WP_Error( 'active_theme', 'Cannot delete an active theme.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$result = delete_theme( $theme_slug );

		if ( is_wp_error( $result ) ) {
			$result->add_data( [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
			return $result;
		}

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Theme uninstalled successfully.',
		] );
	}

	public function update_theme( $request ) {
		$theme_slug = $request->get_param( 'slug' );

		if ( empty( $theme_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Theme slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/theme.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		require_once ABSPATH . 'wp-admin/includes/update.php';

		$theme = wp_get_theme( $theme_slug );
		if ( ! $theme->exists() ) {
			return new \WP_Error( 'theme_not_found', 'Theme not found.', [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		wp_update_themes();
		$current = get_site_transient( 'update_themes' );

		if ( ! isset( $current->response[ $theme_slug ] ) ) {
			return new \WP_Error(
				'no_update_available',
				'No update available for this theme.',
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$skin = new \WP_Ajax_Upgrader_Skin();
		$upgrader = new \Theme_Upgrader( $skin );
		$result = $upgrader->upgrade( $theme_slug );

		if ( is_wp_error( $result ) ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update theme: ' . $result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( is_wp_error( $skin->result ) ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update theme: ' . $skin->result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( $skin->get_errors()->has_errors() ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update theme: ' . $skin->get_error_messages(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( ! $result ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update theme for an unknown reason.',
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$theme = wp_get_theme( $theme_slug );
		$new_version = $theme->get( 'Version' );

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Theme updated successfully to version ' . $new_version,
		] );
	}

	public function get_rollback_versions( $request ) {
		$theme_slug = $request->get_param( 'slug' );

		if ( empty( $theme_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Theme slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/theme.php';
		require_once ABSPATH . 'wp-admin/includes/theme-install.php';

		$theme = wp_get_theme( $theme_slug );
		if ( ! $theme->exists() ) {
			return new \WP_Error( 'theme_not_found', 'Theme not found.', [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		$api = themes_api( 'theme_information', [
			'slug' => $theme_slug,
			'fields' => [
				'versions' => true,
				'sections' => false,
				'description' => false,
				'tested' => false,
				'requires' => false,
				'rating' => false,
				'ratings' => false,
				'downloaded' => false,
				'downloadlink' => false,
				'last_updated' => false,
				'homepage' => false,
				'tags' => false,
				'compatibility' => false,
			],
		] );

		if ( is_wp_error( $api ) ) {
			if ( str_contains( $api->get_error_message(), 'Theme not found.' ) ) {
				$api->add_data( [ 'status' => \WP_Http::NOT_FOUND ] );
			} else {
				$api->add_data( [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
			}

			return $api;
		}

		$versions = [];

		if ( isset( $api->versions ) && is_array( $api->versions ) ) {
			foreach ( $api->versions as $version => $download_link ) {
				$versions[] = $version;
			}

			usort( $versions, 'version_compare' );
			$versions = array_reverse( $versions );

			$maximum_versions = 30;
			$versions = array_slice( $versions, 0, $maximum_versions );
		}

		$has_temp_backup = Temp_Backup::backup_exists( $theme_slug, Temp_Backup::THEMES );

		return rest_ensure_response( [
			'status' => 'success',
			'data' => [
				'versions' => $versions,
				'has_temp_backup' => $has_temp_backup,
			],
		] );
	}

	public function rollback_theme( $request ) {
		$theme_slug = $request->get_param( 'slug' );
		$version = $request->get_param( 'version' );

		if ( empty( $theme_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Theme slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		if ( empty( $version ) ) {
			return new \WP_Error( 'missing_version', 'Version is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/theme.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		require_once ABSPATH . 'wp-admin/includes/theme-install.php';

		$theme = wp_get_theme( $theme_slug );
		if ( ! $theme->exists() ) {
			return new \WP_Error( 'theme_not_found', 'Theme not found.', [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		if ( 'temp-backup' === $version ) {
			$restore_result = Temp_Backup::restore_theme_backup( $theme_slug );

			if ( is_wp_error( $restore_result ) ) {
				return $restore_result;
			}

			return rest_ensure_response( [
				'status' => 'success',
				'message' => 'Theme restored successfully from temp backup.',
				'restored_from' => 'temp_backup',
			] );
		}

		$download_url = sprintf(
			'https://downloads.wordpress.org/theme/%s.%s.zip',
			$theme_slug,
			$version
		);

		$skin = new \WP_Ajax_Upgrader_Skin();
		$upgrader = new \Theme_Upgrader( $skin );
		$result = $upgrader->install( $download_url, [
			'overwrite_package' => true,
		] );

		if ( is_wp_error( $result ) ) {
			return new \WP_Error(
				'rollback_failed',
				'Failed to rollback theme: ' . $result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( is_wp_error( $skin->result ) ) {
			return new \WP_Error(
				'rollback_failed',
				'Failed to rollback theme: ' . $skin->result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( $skin->get_errors()->has_errors() ) {
			return new \WP_Error(
				'rollback_failed',
				'Failed to rollback theme: ' . $skin->get_error_messages(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( ! $result ) {
			return new \WP_Error(
				'rollback_failed',
				'Failed to rollback theme for an unknown reason.',
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Theme rolled back successfully to version ' . $version,
			'restored_from' => 'wordpress_org',
		] );
	}

	public function update_all_translations( $request ) {
		return Translation_Updater::update_translations( 'theme' );
	}

	public function create_theme_temp_backup( $request ) {
		$theme_slug = $request->get_param( 'slug' );

		if ( empty( $theme_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Theme slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$backup_result = Temp_Backup::create_theme_backup( $theme_slug );

		if ( is_wp_error( $backup_result ) ) {
			return $backup_result;
		}

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Theme temp backup created successfully.',
			'slug' => $theme_slug,
		] );
	}
}
