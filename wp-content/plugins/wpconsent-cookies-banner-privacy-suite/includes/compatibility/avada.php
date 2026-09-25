<?php
/**
 * WPConsent compatibility with Avada theme.
 *
 * Prevents the consent banner and script blocking from appearing
 * in the Avada Live Builder editor.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'wpconsent_banner_output', 'wpconsent_avada_builder_output' );
add_filter( 'wpconsent_should_block_scripts', 'wpconsent_avada_builder_output' );

/**
 * Prevent the banner and script blocking in the Avada Live Builder editor.
 *
 * @param bool $value The current value.
 *
 * @return bool
 */
function wpconsent_avada_builder_output( $value ) {
	// Avada Live Builder uses the fb-edit parameter in the iframe URL.
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( isset( $_GET['fb-edit'] ) && current_user_can( 'edit_posts' ) ) {
		return false;
	}

	// Also check for the Fusion Builder preview frame function if available.
	if ( function_exists( 'fusion_is_preview_frame' ) && fusion_is_preview_frame() ) {
		return false;
	}

	return $value;
}
