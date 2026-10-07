<?php
		/**
		 * Studio MU-Plugins Loader
		 * Loads Studio-specific mu-plugins from a Studio-managed directory.
		 */

		// Define database constants if not already defined. It fixes the error
		// for imported sites that don't have those defined e.g. WP Cloud and
		// include plugins which try to access those directly e.g. Mailpoet
		if ( ! defined( 'DB_NAME' ) ) define( 'DB_NAME', 'database_name_here' );
		if ( ! defined( 'DB_USER' ) ) define( 'DB_USER', 'username_here' );
		if ( ! defined( 'DB_PASSWORD' ) ) define( 'DB_PASSWORD', 'password_here' );
		if ( ! defined( 'DB_HOST' ) ) define( 'DB_HOST', 'localhost' );
		if ( ! defined( 'DB_CHARSET' ) ) define( 'DB_CHARSET', 'utf8' );
		if ( ! defined( 'DB_COLLATE' ) ) define( 'DB_COLLATE', '' );

		// Set environment type to local if not already defined
		if ( ! defined( 'WP_ENVIRONMENT_TYPE' ) ) define( 'WP_ENVIRONMENT_TYPE', 'local' );

		$studio_mu_plugins_dir = '/var/folders/rh/4x6146ls1vvfcpd652wvs9cm0000gn/T/studio-mu-plugins-z9hnQe';

		if ( is_dir( $studio_mu_plugins_dir ) ) {
			$files = glob( $studio_mu_plugins_dir . '/*.php' );
			if ( $files ) {
				// Sort files to ensure consistent loading order
				sort( $files );
				foreach ( $files as $file ) {
					if ( is_file( $file ) ) {
						require_once $file;
					}
				}
			}
		}
		