<?php
/**
 * Shortcode for the cookie policy page.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_shortcode( 'wpconsent_cookie_policy', 'wpconsent_cookie_policy_shortcode' );
add_action( 'wp_enqueue_scripts', 'wpconsent_cookie_policy_maybe_enqueue_in_head' );

/**
 * Register the cookie policy stylesheet. Idempotent — called from both
 * wp_enqueue_scripts and the shortcode so the handle is real regardless
 * of which fires first.
 *
 * @return void
 */
function wpconsent_cookie_policy_register_styles() {
	if ( wp_style_is( 'wpconsent-cookie-policy', 'registered' ) ) {
		return;
	}

	$asset_file = WPCONSENT_PLUGIN_PATH . 'build/cookie-policy.css.asset.php';
	$version    = WPCONSENT_VERSION;

	if ( file_exists( $asset_file ) ) {
		$asset = require $asset_file;
		if ( is_array( $asset ) && isset( $asset['version'] ) ) {
			$version = $asset['version'];
		}
	}

	wp_register_style(
		'wpconsent-cookie-policy',
		WPCONSENT_PLUGIN_URL . 'build/cookie-policy.css.css',
		array(),
		$version
	);
	wp_style_add_data( 'wpconsent-cookie-policy', 'rtl', 'replace' );
}

/**
 * Enqueue the cookie policy stylesheet in <head> when the shortcode is
 * detected in post content, to avoid a flash of unstyled content.
 *
 * @return void
 */
function wpconsent_cookie_policy_maybe_enqueue_in_head() {
	wpconsent_cookie_policy_register_styles();

	if ( ! is_singular() ) {
		return;
	}
	$post = get_post();
	if ( ! $post || ! has_shortcode( $post->post_content, 'wpconsent_cookie_policy' ) ) {
		return;
	}
	wp_enqueue_style( 'wpconsent-cookie-policy' );
}

/**
 * Outputs a list of cookies with settings to be used on the cookie policy page.
 *
 * @param array $atts The shortcode attributes.
 *
 * @return string
 */
function wpconsent_cookie_policy_shortcode( $atts = array() ) {
	// Fallback for page builders / widgets / template do_shortcode() paths
	// that don't store the shortcode in post_content.
	wpconsent_cookie_policy_register_styles();
	wp_enqueue_style( 'wpconsent-cookie-policy' );

	// Parse shortcode attributes with defaults.
	$atts = shortcode_atts(
		array(
			'category_heading' => 'h2',
			'service_heading'  => 'h3',
		),
		$atts
	);

	$allowed_tags = array( 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span' );

	// Let's make sure the heading tags are valid.
	$atts['category_heading'] = in_array( $atts['category_heading'], $allowed_tags, true ) ? $atts['category_heading'] : 'h2';
	$atts['service_heading']  = in_array( $atts['service_heading'], $allowed_tags, true ) ? $atts['service_heading'] : 'h3';

	$categories = wpconsent()->cookies->get_categories();
	$output     = '<div class="wpconsent-cookie-policy">';

	// Get translatable table headers from settings (same as preferences panel).
	// Fall back to default strings if the option is empty.
	$header_name = wpconsent()->settings->get_option( 'cookie_table_header_name', wpconsent()->strings->get_string( 'cookie_table_header_name' ) );
	$header_name = ! empty( $header_name ) ? $header_name : wpconsent()->strings->get_string( 'cookie_table_header_name' );

	$header_description = wpconsent()->settings->get_option( 'cookie_table_header_description', wpconsent()->strings->get_string( 'cookie_table_header_description' ) );
	$header_description = ! empty( $header_description ) ? $header_description : wpconsent()->strings->get_string( 'cookie_table_header_description' );

	$header_duration = wpconsent()->settings->get_option( 'cookie_table_header_duration', wpconsent()->strings->get_string( 'cookie_table_header_duration' ) );
	$header_duration = ! empty( $header_duration ) ? $header_duration : wpconsent()->strings->get_string( 'cookie_table_header_duration' );

	foreach ( $categories as $category ) {
		$cookies = wpconsent()->cookies->get_cookies_by_category( $category['id'] );
		if ( empty( $cookies ) ) {
			continue;
		}
		$output .= '<' . esc_attr( $atts['category_heading'] ) . ' class="wpconsent-cookie-category-name">' . esc_html( $category['name'] ) . '</' . esc_attr( $atts['category_heading'] ) . '>';
		$output .= '<p class="wpconsent-cookie-category-description">' . esc_html( $category['description'] ) . '</p>';

		$category_table  = '<table class="wpconsent-cookie-policy-table">';
		$category_table .= '<thead><tr><th>' . esc_html( $header_name ) . '</th><th>' . esc_html( $header_description ) . '</th><th>' . esc_html( $header_duration ) . '</th></tr></thead>';
		$category_table .= '<tbody>';

		$has_cookies = false;
		foreach ( $cookies as $cookie ) {
			if ( ! in_array( $category['id'], $cookie['categories'], true ) ) {
				continue;
			}
			$has_cookies = true;

			$category_table .= '<tr><td>' . esc_html( $cookie['cookie_id'] ) . '</td><td>' . esc_html( $cookie['description'] ) . '</td><td>' . esc_html( $cookie['duration'] ) . '</td></tr>';
		}
		$category_table .= '</tbody></table>';
		if ( $has_cookies ) {
			$output .= $category_table;
		}

		$services = wpconsent()->cookies->get_services_by_category( $category['id'] );
		foreach ( $services as $service ) {
			$output .= '<' . esc_attr( $atts['service_heading'] ) . ' class="wpconsent-cookie-service-name">' . esc_html( $service['name'] ) . '</' . esc_attr( $atts['service_heading'] ) . '>';
			$output .= '<p class="wpconsent-cookie-service-description">' . esc_html( $service['description'] ) . '</p>';
			if ( ! empty( $service['service_url'] ) ) {
				$output .= '<a href="' . esc_url( $service['service_url'] ) . '">' . esc_html__( 'Learn more', 'wpconsent-cookies-banner-privacy-suite' ) . '</a>';
			}

			$cookies = wpconsent()->cookies->get_cookies_by_service( $service['id'] );

			$output .= '<table class="wpconsent-cookie-policy-table">';
			$output .= '<thead><tr><th>' . esc_html( $header_name ) . '</th><th>' . esc_html( $header_description ) . '</th><th>' . esc_html( $header_duration ) . '</th></tr></thead>';
			$output .= '<tbody>';
			foreach ( $cookies as $cookie ) {
				$output .= '<tr><td>' . esc_html( $cookie['cookie_id'] ) . '</td><td>' . esc_html( $cookie['description'] ) . '</td><td>' . esc_html( $cookie['duration'] ) . '</td></tr>';
			}
			$output .= '</tbody></table>';
		}
	}

	$output .= '</div>';

	return $output;
}
