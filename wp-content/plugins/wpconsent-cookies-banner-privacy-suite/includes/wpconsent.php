<?php
/**
 * WPConsent Lite.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get the main instance of WPConsent.
 *
 * @return WPConsent
 */
function wpconsent() {// phpcs:ignore WordPress.NamingConventions.ValidFunctionName.FunctionNameInvalid
	return WPConsent::instance();
}