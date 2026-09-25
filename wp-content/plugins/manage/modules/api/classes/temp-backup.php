<?php
namespace Manage\Modules\Api\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Temp_Backup {

	const BACKUP_DIR_NAME = 'manage-temp-backup';
	const PLUGINS = 'plugins';
	const THEMES = 'themes';

	public static function get_backup_dir( $type ): string {
		return WP_CONTENT_DIR . DIRECTORY_SEPARATOR . self::BACKUP_DIR_NAME . DIRECTORY_SEPARATOR . $type;
	}

	public static function create_plugin_backup( $plugin_slug ) {
		return self::create_backup( $plugin_slug, self::PLUGINS );
	}

	public static function create_theme_backup( $theme_slug ) {
		return self::create_backup( $theme_slug, self::THEMES );
	}

	private static function create_backup( $slug, $type ) {
		$source_dir = self::get_source_directory( $slug, $type );

		if ( ! file_exists( $source_dir ) ) {
			$error_code = $type . '_not_found';
			$error_message = ucfirst( $type ) . ' directory not found.';
			return new \WP_Error( $error_code, $error_message, [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		$backup_dir_result = self::create_backup_dir( $type );
		if ( is_wp_error( $backup_dir_result ) ) {
			return $backup_dir_result;
		}

		$backup_dir = self::get_backup_dir( $type );
		$backup_item_dir = $backup_dir . DIRECTORY_SEPARATOR . $slug;

		if ( file_exists( $backup_item_dir ) ) {
			$remove_result = self::remove_backup( $backup_item_dir, $type );
			if ( is_wp_error( $remove_result ) ) {
				return $remove_result;
			}
		}

		$copy_result = self::copy_directory( $source_dir, $backup_item_dir );
		if ( is_wp_error( $copy_result ) ) {
			return $copy_result;
		}

		return true;
	}

	private static function get_source_directory( $slug, $type ): string {
		if ( self::PLUGINS === $type ) {
			return WP_PLUGIN_DIR . DIRECTORY_SEPARATOR . $slug;
		}

		return get_theme_root() . DIRECTORY_SEPARATOR . $slug;
	}

	private static function create_backup_dir( $type ) {
		$subfolder_dir = self::get_backup_dir( $type );
		if ( ! file_exists( $subfolder_dir ) ) {
			if ( ! wp_mkdir_p( $subfolder_dir ) ) {
				return new \WP_Error( 'backup_subfolder_creation_failed', 'Failed to create backup subfolder: ' . $type, [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
			}
		}

		return true;
	}

	private static function remove_backup( $backup_item_dir, $type ) {
		if ( ! file_exists( $backup_item_dir ) ) {
			$error_code = 'backup_not_found';
			$error_message = ucfirst( $type ) . ' backup not found.';
			return new \WP_Error( $error_code, $error_message, [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		$remove_result = self::remove_directory( $backup_item_dir );
		if ( is_wp_error( $remove_result ) ) {
			return $remove_result;
		}

		return true;
	}

	public static function backup_exists( $slug, $type ): bool {
		if ( empty( $slug ) ) {
			return false;
		}

		if ( ! in_array( $type, [ self::PLUGINS, self::THEMES ], true ) ) {
			$type = self::PLUGINS;
		}

		$backup_dir = self::get_backup_dir( $type );
		$backup_item_dir = $backup_dir . DIRECTORY_SEPARATOR . $slug;

		return file_exists( $backup_item_dir );
	}

	public static function restore_plugin_backup( $plugin_slug ) {
		return self::restore_backup( $plugin_slug, self::PLUGINS );
	}

	public static function restore_theme_backup( $theme_slug ) {
		return self::restore_backup( $theme_slug, self::THEMES );
	}

	private static function restore_backup( $slug, $type ) {
		$destination_dir = self::get_source_directory( $slug, $type );

		if ( ! self::backup_exists( $slug, $type ) ) {
			$error_code = $type . '_backup_not_found';
			$error_message = ucfirst( $type ) . ' backup not found.';
			return new \WP_Error( $error_code, $error_message, [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		$backup_dir = self::get_backup_dir( $type );
		$backup_source_dir = $backup_dir . DIRECTORY_SEPARATOR . $slug;

		if ( file_exists( $destination_dir ) ) {
			$remove_result = self::remove_directory( $destination_dir );
			if ( is_wp_error( $remove_result ) ) {
				return $remove_result;
			}
		}

		$copy_result = self::copy_directory( $backup_source_dir, $destination_dir );
		if ( is_wp_error( $copy_result ) ) {
			return $copy_result;
		}

		return true;
	}

	private static function copy_directory( $source, $destination ) {
		if ( ! file_exists( $source ) ) {
			return new \WP_Error( 'source_not_found', 'Source directory not found.', [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		if ( ! is_dir( $source ) ) {
			return new \WP_Error( 'source_not_directory', 'Source is not a directory.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		if ( ! wp_mkdir_p( $destination ) ) {
			return new \WP_Error( 'destination_creation_failed', 'Failed to create destination directory.', [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
		}

		$iterator = new \RecursiveIteratorIterator(
			new \RecursiveDirectoryIterator( $source, \RecursiveDirectoryIterator::SKIP_DOTS ),
			\RecursiveIteratorIterator::SELF_FIRST
		);

		foreach ( $iterator as $item ) {
			$target = $destination . DIRECTORY_SEPARATOR . $iterator->getSubPathName();

			if ( $item->isDir() ) {
				if ( ! wp_mkdir_p( $target ) ) {
					return new \WP_Error( 'directory_copy_failed', 'Failed to create directory: ' . $target, [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
				}
			} else {
				if ( ! copy( $item, $target ) ) {
					return new \WP_Error( 'file_copy_failed', 'Failed to copy file: ' . $item, [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
				}
			}
		}

		return true;
	}

	private static function remove_directory( $directory ) {
		if ( ! file_exists( $directory ) ) {
			return true;
		}

		if ( ! is_dir( $directory ) ) {
			return new \WP_Error( 'not_directory', 'Path is not a directory.', [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$iterator = new \RecursiveIteratorIterator(
			new \RecursiveDirectoryIterator( $directory, \RecursiveDirectoryIterator::SKIP_DOTS ),
			\RecursiveIteratorIterator::CHILD_FIRST
		);

		foreach ( $iterator as $item ) {
			if ( $item->isDir() ) {
				if ( ! rmdir( $item ) ) {
					return new \WP_Error( 'directory_removal_failed', 'Failed to remove directory: ' . $item, [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
				}
			} else {
				if ( ! unlink( $item ) ) {
					return new \WP_Error( 'file_removal_failed', 'Failed to remove file: ' . $item, [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
				}
			}
		}

		if ( ! rmdir( $directory ) ) {
			return new \WP_Error( 'directory_removal_failed', 'Failed to remove main directory: ' . $directory, [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
		}

		return true;
	}
}
