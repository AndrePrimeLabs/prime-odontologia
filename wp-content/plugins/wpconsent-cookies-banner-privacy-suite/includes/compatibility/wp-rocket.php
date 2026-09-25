<?php
/**
 * WPConsent compatibility with WP Rocket.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'rocket_lrc_exclusions', 'wpconsent_wprocket_lrc_exclusions' );

/**
 * Exclude the WP Consent banner from LazyLoad.
 *
 * @param array $exclusions The current exclusions.
 *
 * @return array
 */
function wpconsent_wprocket_lrc_exclusions( $exclusions ) {
	$exclusions[] = 'id="wpconsent-root"';
	return $exclusions;
}
