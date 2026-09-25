<?php
/**
 * WPConsent compatibility with Divi Builder
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'wpconsent_banner_output', 'wpconsent_divi_builder_output' );
add_filter( 'wpconsent_should_block_scripts', 'wpconsent_divi_builder_output' );

/**
 * Prevent the banner and script blocking in the Divi Builder editor.
 *
 * @param bool $value The current value.
 *
 * @return bool
 */
function wpconsent_divi_builder_output( $value ) {
	if ( function_exists( 'et_core_is_fb_enabled' ) && et_core_is_fb_enabled() ) {
		return false;
	}

	return $value;
}
