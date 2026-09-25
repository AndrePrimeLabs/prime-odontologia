<?php declare( strict_types = 1 ); ?>
<?php
/**
 * Modernist functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Modernist
 * @since Modernist 1.0
 */


if ( ! function_exists( 'modernist_support' ) ) :

	/**
	 * Sets up theme defaults and registers support for various WordPress features.
	 *
	 * @since Modernist 1.0
	 *
	 * @return void
	 */
	function modernist_support() {

		// Enqueue editor styles.
		add_editor_style( 'style.css' );

		// Make theme available for translation.
		load_theme_textdomain( 'modernist' );
	}

endif;

add_action( 'after_setup_theme', 'modernist_support' );

if ( ! function_exists( 'modernist_styles' ) ) :

	/**
	 * Enqueue styles.
	 *
	 * @since Modernist 1.0
	 *
	 * @return void
	 */
	function modernist_styles() {

		// Register theme stylesheet.
		wp_register_style(
			'block_canvas-style',
			get_stylesheet_directory_uri() . '/style.css',
			array(),
			wp_get_theme()->get( 'Version' )
		);

		// Enqueue theme stylesheet.
		wp_enqueue_style( 'block_canvas-style' );

	}

endif;

add_action( 'wp_enqueue_scripts', 'modernist_styles' );
