<?php
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'prime-pomelli-fonts', 'https://fonts.googleapis.com/css2?family=Acme&family=Inter:wght@300;400;600&display=swap', array(), null );
	wp_enqueue_style( 'prime-pomelli-fa', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', array(), '6.4.0' );
	wp_enqueue_style( 'prime-pomelli-style', get_stylesheet_uri(), array(), wp_get_theme()->get( 'Version' ) );
} );
add_action( 'wp_head', function () {
	echo '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}, 1 );
