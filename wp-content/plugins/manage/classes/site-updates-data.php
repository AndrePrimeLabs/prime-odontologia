<?php
namespace Manage\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Updates_Data {

	public static function get_plugins_update_count(): int {
		wp_update_plugins();
		$plugin_updates = get_site_transient( 'update_plugins' );

		if ( ! $plugin_updates || empty( $plugin_updates->response ) ) {
			return 0;
		}

		return count( (array) $plugin_updates->response );
	}

	public static function get_themes_update_count(): int {
		wp_update_themes();
		$theme_updates = get_site_transient( 'update_themes' );

		if ( ! $theme_updates || empty( $theme_updates->response ) ) {
			return 0;
		}

		return count( (array) $theme_updates->response );
	}

	private static ?array $core_updates_summary = null;

	public static function get_core_has_update(): bool {
		return self::get_updates_summary_data()['has_update'];
	}

	public static function get_core_installed_version_when_outdated(): ?string {
		$core_state = self::get_updates_summary_data();

		if ( ! $core_state['has_update'] ) {
			return null;
		}

		return $core_state['installed_version'];
	}

	private static function get_updates_summary_data(): array {
		if ( null !== self::$core_updates_summary ) {
			return self::$core_updates_summary;
		}
		require_once ABSPATH . 'wp-admin/includes/update.php';

		wp_version_check();
		$core_updates = get_site_transient( 'update_core' );

		$has_update = $core_updates
			&& isset( $core_updates->updates[0] )
			&& 'upgrade' === $core_updates->updates[0]->response;

		self::$core_updates_summary = [
			'has_update' => $has_update,
			'installed_version' => get_bloginfo( 'version' ),
		];

		return self::$core_updates_summary;
	}

	public static function get_plugins_for_vulnerability_check(): array {
		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$plugins = [];

		foreach ( get_plugins() as $plugin_file => $plugin_data ) {
			if ( empty( $plugin_data['Version'] ) ) {
				continue;
			}

			$slug = dirname( $plugin_file );
			if ( '.' === $slug ) {
				$slug = basename( $plugin_file, '.php' );
			}

			if ( ! isset( $plugins[ $slug ] ) ) {
				$plugins[ $slug ] = [ 'versions' => [] ];
			}

			if ( ! in_array( $plugin_data['Version'], $plugins[ $slug ]['versions'], true ) ) {
				$plugins[ $slug ]['versions'][] = $plugin_data['Version'];
			}
		}

		return $plugins;
	}
}
