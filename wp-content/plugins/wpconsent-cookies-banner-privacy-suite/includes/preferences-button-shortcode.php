<?php
/**
 * Shortcode for the preferences button.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_shortcode( 'wpconsent_preferences_button', 'wpconsent_preferences_button_shortcode' );

/**
 * Outputs a button to open the cookie preferences panel.
 *
 * @param array $atts The shortcode attributes.
 *
 * @return string
 */
function wpconsent_preferences_button_shortcode( $atts = array() ) {
	// Parse shortcode attributes with defaults.
	$atts = shortcode_atts(
		array(
			'text'  => '',
			'class' => '',
		),
		$atts
	);

	// Get button text from attribute or use default.
	if ( ! empty( $atts['text'] ) ) {
		$button_text = $atts['text'];
	} else {
		$button_text = __( 'Cookie Preferences', 'wpconsent-cookies-banner-privacy-suite' );
	}

	// Build class string.
	$classes = array( 'wpconsent-open-preferences', 'button' );
	if ( ! empty( $atts['class'] ) ) {
		// Split by spaces to handle multiple classes.
		$custom_classes = explode( ' ', $atts['class'] );
		foreach ( $custom_classes as $custom_class ) {
			$sanitized = sanitize_html_class( $custom_class );
			if ( ! empty( $sanitized ) ) {
				$classes[] = $sanitized;
			}
		}
	}
	$class_string = implode( ' ', $classes );

	// Build the button output.
	$output = '<button type="button" class="' . esc_attr( $class_string ) . '">';
	$output .= esc_html( $button_text );
	$output .= '</button>';

	return $output;
}
