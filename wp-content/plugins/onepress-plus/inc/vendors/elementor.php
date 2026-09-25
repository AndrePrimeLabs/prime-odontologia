<?php
namespace Elementor;

function onepress_plus_insert_elementor($atts)
{

    $atts = wp_parse_args( $atts, array(
        'id' => '',
        'slug' => ''
    ) );
    $post = false;
    if (  $atts['id'] ) {
        $post = get_post( $atts['id'] );
    }
    if ( ! $post ) {
        if ( $atts['slug'] ) {
            $post = get_page_by_path( $atts['slug'] );
        }
    }
    if ( ! $post ) {
        return '';
    }
    $post_id = $post->ID;

    $mod = get_post_meta( $post_id, '_elementor_edit_mode', true );

    if ( ! class_exists('Elementor\Plugin') || $mod != 'builder' ) {
        return apply_filters( 'the_content', $post->post_content );
    }

    $response = Plugin::instance()->frontend->get_builder_content_for_display($post_id);
    return $response;
}

add_shortcode('onepress_plus_insert_elementor', 'Elementor\onepress_plus_insert_elementor');

