<?php
/**
 * WPConsent compatibility with Easy Digital Downloads.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'edd_view_receipt', 'wpconsent_prevent_banner_edd_receipt_page' );

/**
 * Prevent the WP Consent banner from showing on the EDD receipt page.
 */
function wpconsent_prevent_banner_edd_receipt_page() {
	add_filter( 'wpconsent_banner_output', '__return_false' );
}
