<?php
/**
 * WPConsent compatibility with Bricks Builder
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'wpconsent_banner_output', 'wpconsent_bricks_builder_output' );
add_filter( 'wpconsent_should_block_scripts', 'wpconsent_bricks_builder_output' );

/**
 * Prevent the banner from being displayed in Bricks Builder editor.
 *
 * @param bool $value The current value.
 *
 * @return bool
 */
function wpconsent_bricks_builder_output( $value ) {
	if ( function_exists( 'bricks_is_builder' ) && bricks_is_builder() ) {
		return false;
	}

	return $value;
}
