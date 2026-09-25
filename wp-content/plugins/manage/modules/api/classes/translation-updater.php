<?php
namespace Manage\Modules\Api\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Translation_Updater {

	/**
	 * Update translations for a specific type (plugin, theme, or core)
	 *
	 * @param string $type The type of translations to update ('plugin', 'theme', 'core')
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function update_translations( string $type ) {
		require_once ABSPATH . 'wp-admin/includes/update.php';
		require_once ABSPATH . 'wp-admin/includes/translation-install.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		require_once ABSPATH . 'wp-admin/includes/class-language-pack-upgrader.php';

		if ( ! class_exists( 'Language_Pack_Upgrader' ) ) {
			return new \WP_Error(
				'class_not_available',
				'Language Pack Upgrader class is not available.',
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$all_translation_updates = wp_get_translation_updates();

		$translation_updates = array_filter( $all_translation_updates, function( $update ) use ( $type ) {
			return isset( $update->type ) && $type === $update->type;
		} );

		if ( empty( $translation_updates ) ) {
			return rest_ensure_response( [
				'status' => 'success',
				'message' => sprintf( 'No %s translation updates available.', $type ),
				'updated_count' => 0,
			] );
		}

		$skin = new \WP_Ajax_Upgrader_Skin();
		$upgrader = new \Language_Pack_Upgrader( $skin );
		$result = $upgrader->bulk_upgrade( $translation_updates );

		if ( is_wp_error( $result ) ) {
			return new \WP_Error(
				'update_failed',
				'Failed to update translations: ' . $result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$updated_count = 0;
		$failed_updates = [];

		if ( is_array( $result ) ) {
			foreach ( $result as $update_result ) {
				if ( is_wp_error( $update_result ) ) {
					$failed_updates[] = $update_result->get_error_message();
				} else {
					$updated_count++;
				}
			}
		} elseif ( true === $result ) {
			$updated_count = count( $translation_updates );
		}

		$response_data = [
			'status' => 'success',
			'message' => sprintf( 'Updated %d %s translation(s) successfully.', $updated_count, $type ),
			'updated_count' => $updated_count,
			'total_available' => count( $translation_updates ),
		];

		if ( ! empty( $failed_updates ) ) {
			$response_data['failed_updates'] = $failed_updates;
			$response_data['message'] .= sprintf( ' %d update(s) failed.', count( $failed_updates ) );
		}

		return rest_ensure_response( $response_data );
	}
}
