<?php

namespace ImageOptimization\Classes\Image;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Backup_Path_Validator {
	/**
	 * Validates and resolves a backup file path.
	 *
	 * @param string $path Backup path stored in attachment meta.
	 *
	 * @return string|null Canonical resolved path if valid, null otherwise.
	 */
	public static function resolve( string $path ): ?string {
		if ( '' === $path ) {
			return null;
		}

		$resolved_path = realpath( $path );

		if ( false === $resolved_path ) {
			return null;
		}

		$upload_dir = wp_upload_dir();
		$uploads_base = realpath( $upload_dir['basedir'] );

		if ( false === $uploads_base ) {
			$uploads_base = wp_normalize_path( $upload_dir['basedir'] );
		} else {
			$uploads_base = wp_normalize_path( $uploads_base );
		}

		$resolved_path = wp_normalize_path( $resolved_path );
		$uploads_prefix = trailingslashit( $uploads_base );

		if ( 0 !== strpos( $resolved_path, $uploads_prefix ) && rtrim( $uploads_base, '/' ) !== $resolved_path ) {
			return null;
		}

		return $resolved_path;
	}
}
