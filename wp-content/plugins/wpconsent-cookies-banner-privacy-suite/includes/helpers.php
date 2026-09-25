<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get the current Unix timestamp shifted to the site's timezone.
 *
 * Matches values stored with current_time( 'mysql' ), so date math done on
 * those columns stays on site-local days. Written as a parse of the site-time
 * string because WPCS discourages current_time( 'timestamp' ).
 *
 * @return int
 */
function wpconsent_site_time() {
	return strtotime( current_time( 'mysql' ) );
}

/**
 * Get a URL with UTM parameters.
 *
 * @param string $url The URL to add the params to.
 * @param string $medium The marketing medium.
 * @param string $campaign The campaign.
 * @param string $ad_content The utm_content param.
 *
 * @return string
 */
function wpconsent_utm_url( $url, $medium = '', $campaign = '', $ad_content = '' ) {
	$args = array(
		'utm_source'   => class_exists( 'WPConsent_License' ) ? 'proplugin' : 'liteplugin',
		'utm_medium'   => sanitize_key( $medium ),
		'utm_campaign' => sanitize_key( $campaign ),
	);

	if ( ! empty( $ad_content ) ) {
		$args['utm_content'] = sanitize_key( $ad_content );
	}

	$utm_url = add_query_arg(
		$args,
		$url
	);

	return apply_filters( 'wpconsent_utm_url', $utm_url, $url, $medium, $campaign, $ad_content );
}


/**
 * Check WP version and include the compatible upgrader skin.
 */
function wpconsent_require_upgrader() {

	global $wp_version;

	require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
	require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/class-wpconsent-skin.php';
}

/**
 * Get the HTML DOM object and load the simplehtmldom library if needed.
 *
 * @param string $html The HTML to parse.
 *
 * @return WPConsent_Simple_HTML_DOM|false
 */
function wpconsent_get_simplehtmldom( $html ) {
	if ( ! function_exists( 'wpconsent_str_get_html' ) ) {
		// Load the simple HTML DOM library only if we need it.
		require_once WPCONSENT_PLUGIN_PATH . 'lib/simplehtmldom/class-wpconsent-simple-html-dom.php';
	}

	return wpconsent_str_get_html( $html );
}

/**
 * Get the registrable domain from a hostname using the Public Suffix List.
 *
 * Lazy-loads the PSL library only when needed to avoid unnecessary memory usage.
 *
 * @param string $hostname The hostname to parse.
 *
 * @return string The registrable domain, or empty string on failure.
 */
function wpconsent_get_registrable_domain( $hostname ) {
	if ( ! class_exists( 'WPConsent_Public_Suffix_List' ) ) {
		// Load the Public Suffix List library only if we need it.
		require_once WPCONSENT_PLUGIN_PATH . 'lib/public-suffix-list/class-wpconsent-public-suffix-list.php';
	}

	return WPConsent_Public_Suffix_List::get_registrable_domain( $hostname );
}
