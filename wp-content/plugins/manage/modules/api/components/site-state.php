<?php
namespace Manage\Modules\Api\Components;

use Manage\Modules\Api\Classes\Route;
use Manage\Modules\Api\Classes\Optimization_Stats;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Site_State extends Route {

	public function register_routes() {
		register_rest_route( static::NAMESPACE, '/site-state', [
			'methods'  => 'GET',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'get_site_state' ],
		] );
	}

	public function get_site_state() {
		return rest_ensure_response( [
			'status' => 'success',
			'data' => [
				'site_url' => get_site_url(),
				'home_url' => home_url(),
				'admin_url' => admin_url(),
				'wp_version' => get_bloginfo( 'version' ),
				'php_version' => phpversion(),
				'site_name' => get_bloginfo( 'name' ),
				'site_description' => get_bloginfo( 'description' ),
				'core' => $this->get_core_data(),
				'plugins' => $this->get_plugins_data(),
				'themes' => $this->get_themes_data(),
				'optimizations' => $this->get_optimizations_data(),
				'translations' => [
					'core' => $this->get_translation_updates( 'core' ),
					'plugins' => $this->get_translation_updates( 'plugin' ),
					'themes' => $this->get_translation_updates( 'theme' ),
				],
			],
		] );
	}

	private function get_plugins_data(): array {
		$response_plugins = [];
		$plugins = get_plugins();

		wp_update_plugins();

		$plugin_updates = get_site_transient( 'update_plugins' );

		foreach ( $plugins as $plugin_file => $plugin_data ) {
			if ( ! empty( $plugin_data['Name'] ) && ! empty( $plugin_data['Version'] ) ) {
				$has_update = false;
				$update_version = '';
				$update_package = '';
				$update_requires_wp = '';
				$update_requires_php = '';
				$update_compatibility = '';

				if ( isset( $plugin_updates->response[ $plugin_file ] ) ) {
					$has_update = true;
					$update_data = $plugin_updates->response[ $plugin_file ];
					$update_version = $update_data->new_version ?? '';
					$update_package = $update_data->package ?? '';
					$update_requires_wp = $update_data->requires ?? '';
					$update_requires_php = $update_data->requires_php ?? '';
					$update_compatibility = $update_data->compatibility ?? '';
				}

				$response_plugins[] = [
					'slug' => $plugin_file,
					'name' => $plugin_data['Name'],
					'version' => $plugin_data['Version'],
					'active' => is_plugin_active( $plugin_file ),
					'require_wp_version' => $plugin_data['RequiresWP'] ?? '',
					'require_php_version' => $plugin_data['RequiresPHP'] ?? '',
					'has_update' => $has_update,
					'update_data' => [
						'version' => $update_version,
						'package' => $update_package,
						'requires_wp' => $update_requires_wp,
						'requires_php' => $update_requires_php,
						'compatibility' => $update_compatibility,
					],
				];
			}
		}

		return $response_plugins;
	}

	private function get_themes_data(): array {
		$response_themes = [];
		$themes = wp_get_themes();
		$current_theme = get_stylesheet();

		wp_update_themes();

		$theme_updates = get_site_transient( 'update_themes' );

		foreach ( $themes as $theme_slug => $theme_data ) {
			if ( $theme_data instanceof \WP_Theme ) {
				$has_update = false;
				$update_version = '';
				$update_package = '';
				$update_requires_wp = '';
				$update_requires_php = '';

				if ( isset( $theme_updates->response[ $theme_slug ] ) ) {
					$has_update = true;
					$update_data = $theme_updates->response[ $theme_slug ];
					$update_version = $update_data['new_version'] ?? '';
					$update_package = $update_data['package'] ?? '';
					$update_requires_wp = $update_data['requires'] ?? '';
					$update_requires_php = $update_data['requires_php'] ?? '';
				}

				$is_child = ( $theme_data->get_template() !== $theme_data->get_stylesheet() );
				$parent_theme = '';

				if ( $is_child ) {
					$parent = $theme_data->parent();
					if ( $parent instanceof \WP_Theme ) {
						$parent_theme = $parent->get_stylesheet();
					}
				}

				$response_themes[] = [
					'slug' => $theme_slug,
					'name' => $theme_data->get( 'Name' ),
					'version' => $theme_data->get( 'Version' ),
					'active' => ( $theme_slug === $current_theme ),
					'description' => $theme_data->get( 'Description' ),
					'author' => $theme_data->get( 'Author' ),
					'author_uri' => $theme_data->get( 'AuthorURI' ),
					'theme_uri' => $theme_data->get( 'ThemeURI' ),
					'require_wp_version' => $theme_data->get( 'RequiresWP' ) ?? '',
					'require_php_version' => $theme_data->get( 'RequiresPHP' ) ?? '',
					'is_child' => $is_child,
					'parent_theme' => $parent_theme,
					'has_update' => $has_update,
					'update_data' => [
						'version' => $update_version,
						'package' => $update_package,
						'requires_wp' => $update_requires_wp,
						'requires_php' => $update_requires_php,
					],
				];
			}
		}

		return $response_themes;
	}

	private function get_core_data(): array {
		require_once ABSPATH . 'wp-admin/includes/update.php';

		wp_version_check();
		$core_updates = get_site_transient( 'update_core' );

		$has_update = false;
		$update_version = '';
		$update_package = '';
		$update_requires_php = '';

		if ( $core_updates && isset( $core_updates->updates[0] ) && 'upgrade' === $core_updates->updates[0]->response ) {
			$has_update = true;
			$update_data = $core_updates->updates[0];
			$update_version = $update_data->version ?? '';
			$update_package = $update_data->package ?? '';
			$update_requires_php = $update_data->php_version ?? '';
		}

		return [
			'version' => get_bloginfo( 'version' ),
			'has_update' => $has_update,
			'update_data' => [
				'version' => $update_version,
				'package' => $update_package,
				'requires_php' => $update_requires_php,
			],
		];
	}

	private function get_optimizations_data(): array {
		return Optimization_Stats::get_all_stats();
	}

	private function get_translation_updates( string $type ): array {
		$translation_updates = [];

		if ( function_exists( 'wp_get_translation_updates' ) ) {
			$updates = wp_get_translation_updates();

			foreach ( $updates as $update ) {
				if ( $type === $update->type ) {
					$translation_data = [
						'language' => $update->language,
						'version' => $update->version,
						'updated' => $update->updated,
						'package' => $update->package ?? '',
						'autoupdate' => $update->autoupdate ?? false,
					];

					// Add slug for plugin and theme translations, but not for core.
					if ( 'core' !== $type && isset( $update->slug ) ) {
						$translation_data['slug'] = $update->slug;
					}

					$translation_updates[] = $translation_data;
				}
			}
		}

		return $translation_updates;
	}
}
