<?php
namespace Manage\Modules\Api\Components;

use Manage\Modules\Api\Classes\Route;
use Manage\Modules\Api\Classes\Translation_Updater;
use Manage\Modules\Api\Classes\Temp_Backup;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Plugins extends Route {

	public function register_routes() {
		register_rest_route( static::NAMESPACE, '/plugins/install', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'install_plugin' ],
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
					'description' => 'The plugin slug (for type "slug") or URL (for type "url").',
					'sanitize_callback' => static function ( $value, $request ) {
						$type = $request->get_param( 'type' );

						return 'slug' === $type ? sanitize_text_field( $value ) : esc_url_raw( $value );
					},
				],
				'activate' => [
					'required' => false,
					'type' => 'boolean',
					'default' => false,
					'description' => 'If true, activate the plugin after a successful install.',
					'sanitize_callback' => 'rest_sanitize_boolean',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/plugins/activate', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'activate_plugin' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the plugin to activate.',
				],
				'network_activate' => [
					'required' => false,
					'type' => 'boolean',
					'default' => false,
					'description' => 'Whether to activate the plugin for all sites in a multisite network.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/plugins/deactivate', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'deactivate_plugin' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the plugin to deactivate.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/plugins/uninstall', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'uninstall_plugin' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the plugin to uninstall.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/plugins/update', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'update_plugin' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the plugin to update.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/plugins/rollback', [
			'methods' => 'GET',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'get_rollback_versions' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the plugin to get rollback versions for.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/plugins/rollback', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'rollback_plugin' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the plugin to rollback.',
				],
				'version' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The version to rollback to.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/plugins/update-translations', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'update_all_translations' ],
			'args' => [],
		] );

		register_rest_route( static::NAMESPACE, '/plugins/update-db', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'update_plugin_db' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the plugin to update database for.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/plugins/temp-backup', [
			'methods' => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'create_temp_backup' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The slug of the plugin to create temp backup for.',
				],
			],
		] );

		register_rest_route( static::NAMESPACE, '/plugins/changelog', [
			'methods' => 'GET',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'get_plugin_changelog' ],
			'args' => [
				'slug' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The plugin file slug (e.g., hello-dolly/hello.php).',
				],
			],
		] );
	}

	public function get_plugin_changelog( $request ) {
		$plugin_slug = $request->get_param( 'slug' );

		if ( empty( $plugin_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Plugin slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';

		$dir_slug = dirname( $plugin_slug );

		$api = plugins_api(
			'plugin_information',
			[
				'slug' => $dir_slug,
				'fields' => [
					'sections' => true,
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
			]
		);

		if ( is_wp_error( $api ) ) {
			if ( str_contains( $api->get_error_message(), 'Plugin not found.' ) ) {
				$api->add_data( [ 'status' => \WP_Http::NOT_FOUND ] );
			} else {
				$api->add_data( [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
			}

			return $api;
		}

		$changelog = '';
		if ( isset( $api->sections ) && is_array( $api->sections ) && isset( $api->sections['changelog'] ) ) {
			$changelog = (string) $api->sections['changelog'];
		}

		return rest_ensure_response( [
			'status' => 'success',
			'data' => [
				'changelog' => $changelog,
			],
		] );
	}

	public function install_plugin( $request ) {
		$type = $request->get_param( 'type' );
		$source = $request->get_param( 'source' );

		if ( empty( $type ) || empty( $source ) ) {
			return new \WP_Error( 'missing_parameters', 'Both type and source parameters are required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		if ( ! in_array( $type, [ 'slug', 'url' ], true ) ) {
			return new \WP_Error( 'invalid_type', 'Type must be either "slug" or "url".', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';

		$skin = new \WP_Ajax_Upgrader_Skin();
		$upgrader = new \Plugin_Upgrader( $skin );

		if ( 'url' === $type ) {
			$package_url = $this->get_package_url_from_plugin_url( $source );
		} else {
			$package_url = $this->get_package_url_from_plugin_slug( $source );
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

		$file = $upgrader->plugin_info();

		if ( ! $file ) {
			return new \WP_Error(
				'unable_to_determine_installed_plugin',
				'Unable to determine what plugin was installed.',
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$response_payload = [
			'status' => 'success',
			'message' => 'Plugin installed successfully.',
		];

		if ( $request->get_param( 'activate' ) ) {
			$activation_result = $this->activate_installed_plugin( $file, false );
			$response_payload['activated'] = ! is_wp_error( $activation_result );
		}

		return rest_ensure_response( $response_payload );
	}

	private function get_package_url_from_plugin_url( string $plugin_url ) {
		if ( ! filter_var( $plugin_url, FILTER_VALIDATE_URL ) ) {
			return new \WP_Error( 'invalid_url', 'Invalid plugin URL provided.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$parsed_url = wp_parse_url( $plugin_url );
		if ( ! $parsed_url || ( 'https' !== $parsed_url['scheme'] && 'http' !== $parsed_url['scheme'] ) ) {
			return new \WP_Error( 'invalid_url_scheme', 'Plugin URL must use HTTP or HTTPS protocol.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		return $plugin_url;
	}

	private function get_package_url_from_plugin_slug( string $plugin_slug ) {
		$api = plugins_api( 'plugin_information', [
			'slug' => $plugin_slug,
			'fields' => [
				'sections' => false,
				'language_packs' => true,
			],
		] );

		if ( is_wp_error( $api ) ) {
			if ( str_contains( $api->get_error_message(), 'Plugin not found.' ) ) {
				$api->add_data( [ 'status' => \WP_Http::NOT_FOUND ] );
			} else {
				$api->add_data( [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
			}

			return $api;
		}

		$status = install_plugin_install_status( $api );

		if ( 'install' !== $status['status'] ) {
			return new \WP_Error( 'already_installed', 'Plugin already installed.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		return $api->download_link;
	}

	public function activate_plugin( $request ) {
		$plugin_slug = $request->get_param( 'slug' );
		$network_activate = (bool) $request->get_param( 'network_activate' );

		if ( empty( $plugin_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Plugin slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$result = $this->activate_installed_plugin( $plugin_slug, $network_activate );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Plugin activated successfully.',
		] );
	}

	private function activate_installed_plugin( string $plugin_slug, bool $network_activate ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		$plugin_data = $this->get_plugin_data( $plugin_slug );

		if ( is_wp_error( $plugin_data ) ) {
			return $plugin_data;
		}

		if ( is_multisite() && ! $network_activate && is_network_only_plugin( $plugin_slug ) ) {
			return new \WP_Error( 'rest_network_only_plugin', 'Network only plugin must be network activated.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$activated = activate_plugin( $plugin_slug, '', $network_activate );

		if ( is_wp_error( $activated ) ) {
			$activated->add_data( [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );

			return $activated;
		}

		return true;
	}

	private function get_plugin_data( $plugin_slug ) {
		$plugins = get_plugins();

		if ( ! isset( $plugins[ $plugin_slug ] ) ) {
			return new \WP_Error( 'rest_plugin_not_found', 'Plugin not found.', [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		$data = $plugins[ $plugin_slug ];
		$data['_file'] = $plugin_slug;

		return $data;
	}

	private function get_plugin_status( $plugin ): string {
		if ( is_plugin_active_for_network( $plugin ) ) {
			return 'network-active';
		}

		if ( is_plugin_active( $plugin ) ) {
			return 'active';
		}

		return 'inactive';
	}

	public function deactivate_plugin( $request ) {
		$plugin_slug = $request->get_param( 'slug' );

		if ( empty( $plugin_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Plugin slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		deactivate_plugins( $plugin_slug, false );

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Plugin deactivated successfully.',
		] );
	}

	public function uninstall_plugin( $request ) {
		$plugin_slug = $request->get_param( 'slug' );

		if ( empty( $plugin_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Plugin slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		$plugin_data = $this->get_plugin_data( $plugin_slug );

		if ( is_wp_error( $plugin_data ) ) {
			return $plugin_data;
		}

		if ( is_plugin_active( $plugin_slug ) ) {
			return new \WP_Error( 'rest_cannot_delete_active_plugin', 'Cannot delete an active plugin. Please deactivate it first.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$deleted = delete_plugins( [ $plugin_slug ] );

		if ( is_wp_error( $deleted ) ) {
			$deleted->add_data( [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );

			return $deleted;
		}

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Plugin uninstalled successfully.',
		] );
	}

	public function get_rollback_versions( $request ) {
		$plugin_slug = $request->get_param( 'slug' );

		if ( empty( $plugin_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Plugin slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/plugin.php';
		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';

		$plugin_data = $this->get_plugin_data( $plugin_slug );

		if ( is_wp_error( $plugin_data ) ) {
			return $plugin_data;
		}

		$api = plugins_api(
			'plugin_information',
			[
				'slug' => dirname( $plugin_slug ),
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
			]
		);

		if ( is_wp_error( $api ) ) {
			if ( str_contains( $api->get_error_message(), 'Plugin not found.' ) ) {
				$api->add_data( [ 'status' => \WP_Http::NOT_FOUND ] );
			} else {
				$api->add_data( [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
			}

			return $api;
		}

		$versions = [];

		if ( isset( $api->versions ) && is_array( $api->versions ) ) {
			unset( $api->versions['trunk'] );

			foreach ( $api->versions as $version => $download_link ) {
				$versions[] = $version;
			}

			usort( $versions, 'version_compare' );
			$versions = array_reverse( $versions );

			$maximum_versions = 30;
			$versions = array_slice( $versions, 0, $maximum_versions );
		}

		$plugin_dir_name = dirname( $plugin_slug );
		$has_temp_backup = Temp_Backup::backup_exists( $plugin_dir_name, Temp_Backup::PLUGINS );

		return rest_ensure_response( [
			'status' => 'success',
			'data' => [
				'versions' => $versions,
				'has_temp_backup' => $has_temp_backup,
			],
		] );
	}

	public function rollback_plugin( $request ) {
		$plugin_slug = $request->get_param( 'slug' );
		$version = $request->get_param( 'version' );

		if ( empty( $plugin_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Plugin slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		if ( empty( $version ) ) {
			return new \WP_Error( 'missing_version', 'Version is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';

		$plugin_data = $this->get_plugin_data( $plugin_slug );

		if ( is_wp_error( $plugin_data ) ) {
			return $plugin_data;
		}

		$was_active = is_plugin_active( $plugin_slug );
		$was_network_active = is_multisite() && is_plugin_active_for_network( $plugin_slug );

		if ( $was_active || $was_network_active ) {
			deactivate_plugins( $plugin_slug, false, $was_network_active );
		}

		if ( 'temp-backup' === $version ) {
			$plugin_dir_name = dirname( $plugin_slug );
			$restore_result = Temp_Backup::restore_plugin_backup( $plugin_dir_name );

			if ( $was_active || $was_network_active ) {
				activate_plugin( $plugin_slug, '', $was_network_active );
			}

			if ( is_wp_error( $restore_result ) ) {
				return $restore_result;
			}

			return rest_ensure_response( [
				'status' => 'success',
				'message' => 'Plugin restored successfully from temp backup.',
				'restored_from' => 'temp_backup',
			] );
		}

		$download_url = sprintf(
			'https://downloads.wordpress.org/plugin/%s.%s.zip',
			dirname( $plugin_slug ),
			$version
		);

		$skin = new \WP_Ajax_Upgrader_Skin();
		$upgrader = new \Plugin_Upgrader( $skin );
		$result = $upgrader->install( $download_url, [
			'overwrite_package' => true,
		] );

		if ( is_wp_error( $result ) ) {
			return new \WP_Error(
				'rollback_failed',
				'Failed to rollback plugin: ' . $result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( is_wp_error( $skin->result ) ) {
			return new \WP_Error(
				'rollback_failed',
				'Failed to rollback plugin: ' . $skin->result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( $skin->get_errors()->has_errors() ) {
			return new \WP_Error(
				'rollback_failed',
				'Failed to rollback plugin: ' . $skin->get_error_messages(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( ! $result ) {
			return new \WP_Error(
				'rollback_failed',
				'Failed to rollback plugin for an unknown reason.',
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( $was_active || $was_network_active ) {
			activate_plugin( $plugin_slug, '', $was_network_active );
		}

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Plugin rolled back successfully to version ' . $version,
			'restored_from' => 'wordpress_org',
		] );
	}

	public function update_plugin( $request ) {
		$plugin_slug = $request->get_param( 'slug' );

		if ( empty( $plugin_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Plugin slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
		require_once ABSPATH . 'wp-admin/includes/update.php';

		$plugin_data = $this->get_plugin_data( $plugin_slug );

		if ( is_wp_error( $plugin_data ) ) {
			return $plugin_data;
		}

		// Check if there's an update available
		wp_update_plugins();
		$current = get_site_transient( 'update_plugins' );

		if ( ! isset( $current->response[ $plugin_slug ] ) ) {
			return new \WP_Error(
				'no_update_available',
				'No update available for this plugin.',
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		// Match wp_ajax_update_plugin(): bulk_upgrade does not deactivate active plugins.
		$skin = new \WP_Ajax_Upgrader_Skin();
		$upgrader = new \Plugin_Upgrader( $skin );
		$result = $upgrader->bulk_upgrade( [ $plugin_slug ] );

		if ( is_wp_error( $skin->result ) ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update plugin: ' . $skin->result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( $skin->get_errors()->has_errors() ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update plugin: ' . $skin->get_error_messages(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( false === $result ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update plugin: unable to connect to the filesystem.',
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$plugin_result = $result[ $plugin_slug ] ?? null;

		if ( is_wp_error( $plugin_result ) ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update plugin: ' . $plugin_result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( true === $plugin_result ) {
			return new \WP_Error(
				'no_update_available',
				'No update available for this plugin.',
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( empty( $plugin_result ) ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update plugin for an unknown reason.',
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$plugin_data = $this->get_plugin_data( $plugin_slug );
		$new_version = $plugin_data['Version'];

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Plugin updated successfully to version ' . $new_version,
		] );
	}

	public function update_all_translations( $request ) {
		return Translation_Updater::update_translations( 'plugin' );
	}

	public function update_plugin_db( $request ) {
		$plugin_slug = $request->get_param( 'slug' );

		if ( empty( $plugin_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Plugin slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		if ( ! is_plugin_active( $plugin_slug ) ) {
			return new \WP_Error(
				'plugin_not_active',
				'Plugin must be active to update its database.',
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( false !== strpos( $plugin_slug, 'woocommerce' ) ) {
			return $this->update_woocommerce_db();
		}

		if ( false !== strpos( $plugin_slug, 'elementor' ) ) {
			return $this->update_elementor_db( 'Elementor', '\Elementor\Core\Upgrade\Manager' );
		}

		if ( false !== strpos( $plugin_slug, 'elementor-pro' ) ) {
			return $this->update_elementor_db( 'Elementor Pro', '\ElementorPro\Core\Upgrade\Manager' );
		}

		return new \WP_Error( 'no_db_update_config', 'No database update configuration found for this plugin.', [ 'status' => \WP_Http::BAD_REQUEST ] );
	}

	private function update_woocommerce_db() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return new \WP_Error(
				'woocommerce_not_found',
				'WooCommerce is not installed or active.',
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$current_db_version = get_option( 'woocommerce_db_version', null );
		$update_db_version = WC()->version;

		if ( version_compare( $current_db_version, $update_db_version, '>=' ) ) {
			return rest_ensure_response( [
				'status' => 'success',
				'message' => 'WooCommerce database is already up to date.',
				'current_version' => $current_db_version,
			] );
		}

		try {
			if ( ! class_exists( 'WC_Install' ) ) {
				require_once WC_ABSPATH . 'includes/class-wc-install.php';
			}

			\WC_Install::run_manual_database_update();

			return rest_ensure_response( [
				'status' => 'success',
				'message' => 'WooCommerce database updated successfully.',
				'previous_version' => $current_db_version,
				'new_version' => $update_db_version,
			] );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'wc_db_update_failed',
				'Failed to update WooCommerce database: ' . $e->getMessage(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}
	}

	private function update_elementor_db( $plugin_name, $manager_class ) {
		if ( ! class_exists( 'Elementor\Plugin' ) ) {
			return new \WP_Error( 'elementor_not_found', 'Elementor is not installed or active.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		try {
			if ( ! class_exists( $manager_class ) ) {
				return new \WP_Error(
					'elementor_upgrade_manager_not_available',
					$plugin_name . ' upgrade manager class not available: ' . $manager_class,
					[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
				);
			}

			/** @var \Elementor\Core\Upgrade\Manager $manager */
			$manager = new $manager_class();

			$current_version = $manager->get_current_version();
			$new_version = $manager->get_new_version();

			if ( ! $manager->should_upgrade() ) {
				return rest_ensure_response( [
					'status' => 'success',
					'message' => $plugin_name . ' database is already up to date.',
					'current_version' => $current_version,
					'new_version' => $new_version,
				] );
			}

			$updater = $manager->get_task_runner();

			if ( $updater->is_process_locked() ) {
				return new \WP_Error(
					'elementor_upgrade_in_progress',
					$plugin_name . ' database upgrade is already in progress.',
					[ 'status' => \WP_Http::CONFLICT ]
				);
			}

			$callbacks = $manager->get_upgrade_callbacks();
			$did_tasks = false;

			if ( ! empty( $callbacks ) ) {
				if ( isset( \Elementor\Plugin::$instance->logger ) ) {
					\Elementor\Plugin::$instance->logger->get_logger()->info( 'Update DB has been started', [
						'meta' => [
							'plugin' => $manager->get_plugin_label(),
							'from' => $current_version,
							'to' => $new_version,
						],
					] );
				}

				$updater->handle_immediately( $callbacks );
				$did_tasks = true;
			}

			$manager->on_runner_complete( $did_tasks );

			if ( class_exists( '\Elementor\Plugin' ) && method_exists( '\Elementor\Plugin', 'instance' ) ) {
				$elementor = \Elementor\Plugin::instance();

				if ( isset( $elementor->files_manager ) && method_exists( $elementor->files_manager, 'clear_cache' ) ) {
					$elementor->files_manager->clear_cache();
				}

				if ( method_exists( $elementor, 'clear_cache' ) ) {
					$elementor->clear_cache();
				}
			}

			$final_current_version = $manager->get_current_version();
			$final_new_version = $manager->get_new_version();

			return rest_ensure_response( [
				'status' => 'success',
				'message' => $plugin_name . ' database updated successfully.',
				'previous_version' => $current_version,
				'new_version' => $final_current_version,
				'plugin_version' => $final_new_version,
				'callbacks_executed' => count( $callbacks ),
			] );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'elementor_db_update_failed',
				'Failed to update ' . $plugin_name . ' database: ' . $e->getMessage(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}
	}

	public function create_temp_backup( $request ) {
		$plugin_slug = $request->get_param( 'slug' );

		if ( empty( $plugin_slug ) ) {
			return new \WP_Error( 'missing_slug', 'Plugin slug is required.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$backup_result = Temp_Backup::create_plugin_backup( $plugin_slug );

		if ( is_wp_error( $backup_result ) ) {
			return $backup_result;
		}

		return rest_ensure_response( [
			'status' => 'success',
			'message' => 'Plugin temp backup created successfully.',
			'slug' => $plugin_slug,
		] );
	}
}
