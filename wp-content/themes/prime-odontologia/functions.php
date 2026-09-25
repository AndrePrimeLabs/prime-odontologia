<?php
/**
 * Prime Odontologia theme functions.
 *
 * @package prime-odontologia
 */

add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'prime-odontologia-fonts', 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&display=swap', array(), null );
	wp_enqueue_style(
		'prime-odontologia-style',
		get_parent_theme_file_uri( 'style.css' ),
		array( 'prime-odontologia-fonts' ),
		wp_get_theme()->get( 'Version' )
	);
} );

add_action( 'after_setup_theme', function () {
	add_editor_style( 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&display=swap' );
	add_editor_style( 'style.css' );

	register_nav_menus(
		array(
			'primary' => __( 'Menu Principal', 'prime-odontologia' ),
		)
	);
} );
