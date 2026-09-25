<?php
/**
 * Load compatibility files.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load compatibility files for third-party plugins.
 *
 * @since 1.0.0
 */
function wpconsent_load_compatibility_files() {
	$compatibility_files = array(
		'php'                        => 'php.php',
		'wp-rocket'                  => 'wp-rocket.php',
		'wp-consent-api'             => 'wp-consent-api.php',
		'easy-digital-downloads'     => 'easy-digital-downloads.php',
		'bricks'                     => 'bricks.php',
		'divi'                       => 'divi.php',
		'avada'                      => 'avada.php',
	);

	foreach ( $compatibility_files as $slug => $file ) {
		$enabled = apply_filters( 'wpconsent_enable_compatibility', true, $slug, $file );

		if ( ! $enabled ) {
			continue;
		}

		if ( ! apply_filters( "wpconsent_enable_compatibility_$slug", true, $file ) ) {
			continue;
		}

		require_once WPCONSENT_PLUGIN_PATH . 'includes/compatibility/' . $file;
	}
}
add_action( 'plugins_loaded', 'wpconsent_load_compatibility_files', 3 );
