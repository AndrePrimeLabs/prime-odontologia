<?php

class Onepress_Plus_Config {
	static private $_instance = null;

	static function get_instance() {
		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self();
		}
		return self::$_instance;
	}

	function get_order_styling_settings() {
		$sections = array(

			array(
				'title'            => esc_html__( 'Slider', 'onepress-plus' ),
				'section_id'       => 'slider',
				'id_translate'    => esc_html__( 'hero', 'onepress-plus' ),
				'show_section'     => 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),

			array(
				'title'            => esc_html__( 'Clients', 'onepress-plus' ),
				'section_id'       => 'clients',
				'id_translate'    => esc_html__( 'clients', 'onepress-plus' ),
				'show_section'     => '1',
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),
			array(
				'title'            => esc_html__( 'Features', 'onepress-plus' ),
				'section_id'       => 'features',
				'id_translate'    => esc_html__( 'features', 'onepress-plus' ),
				'show_section'     => get_theme_mod( 'onepress_features_disable', '' ) == 1 ? '' : 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),
			array(
				'title'            => esc_html__( 'About', 'onepress-plus' ),
				'section_id'       => 'about',
				'id_translate'    => esc_html__( 'about', 'onepress-plus' ),
				'show_section'     => get_theme_mod( 'onepress_about_disable', '' ) == 1 ? '' : 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),
			array(
				'title'            => esc_html__( 'Services', 'onepress-plus' ),
				'section_id'       => 'services',
				'id_translate'    => esc_html__( 'services', 'onepress-plus' ),
				'show_section'     => get_theme_mod( 'onepress_services_id', '' ) == 1 ? '' : 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),

			array(
				'title'            => esc_html__( 'Videolightbox', 'onepress-plus' ),
				'section_id'       => 'videolightbox',
				'id_translate'    => esc_html__( 'videolightbox', 'onepress-plus' ),
				'show_section'     => get_theme_mod( 'onepress_videolightbox_disable', '' ) == 1 ? '' : 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => array(
					'id'  => '',
					'url' => get_template_directory_uri() . '/assets/images/hero5.jpg',
				),
				'bg_video'         => '',
				'section_inverse'  => '1',
				'enable_parallax'  => '1',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),

			array(
				'title'            => esc_html__( 'Gallery', 'onepress-plus' ),
				'section_id'       => 'gallery',
				'id_translate'    => esc_html__( 'gallery', 'onepress-plus' ),
				'show_section'     => get_theme_mod( 'onepress_gallery_disable', 1 ) == 1 ? '' : 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),

			array(
				'title'            => esc_html__( 'Projects', 'onepress-plus' ),
				'section_id'       => 'projects',
				'id_translate'    => esc_html__( 'projects', 'onepress-plus' ),
				'show_section'     => 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),

			array(
				'title'            => esc_html__( 'Counter', 'onepress-plus' ),
				'section_id'       => 'counter',
				'id_translate'    => esc_html__( 'counter', 'onepress-plus' ),
				'show_section'     => get_theme_mod( 'onepress_counter_disable', '' ) == 1 ? '' : 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),

			array(
				'title'            => esc_html__( 'Testimonials', 'onepress-plus' ),
				'section_id'       => 'testimonials',
				'id_translate'    => esc_html__( 'testimonials', 'onepress-plus' ),
				'show_section'     => get_theme_mod( 'onepress_testimonials_disable', '' ) == 1 ? '' : 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),

			array(
				'title'            => esc_html__( 'Pricing', 'onepress-plus' ),
				'section_id'       => 'pricing',
				'id_translate'    => esc_html__( 'pricing', 'onepress-plus' ),
				'show_section'     => get_theme_mod( 'onepress_pricing_disable', '' ) == 1 ? '' : 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),

			array(
				'title'            => esc_html__( 'Call to Action', 'onepress-plus' ),
				'section_id'       => 'cta',
				'id_translate'    => esc_html__( 'cta', 'onepress-plus' ),
				'show_section'     => 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '1',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),

			array(
				'title'            => esc_html__( 'Team', 'onepress-plus' ),
				'section_id'       => 'team',
				'id_translate'    => esc_html__( 'team', 'onepress-plus' ),
				'show_section'     => get_theme_mod( 'onepress_team_disable', '' ) == 1 ? '' : 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),

			array(
				'title'            => esc_html__( 'News', 'onepress-plus' ),
				'section_id'       => 'news',
				'id_translate'    => esc_html__( 'news', 'onepress-plus' ),
				'show_section'     => get_theme_mod( 'onepress_news_disable', '' ) == 1 ? '' : 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),

			array(
				'title'            => esc_html__( 'Contact', 'onepress-plus' ),
				'section_id'       => 'contact',
				'id_translate'    => esc_html__( 'contact', 'onepress-plus' ),
				'show_section'     => get_theme_mod( 'onepress_contact_disable', '' ) == 1 ? '' : 1,
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),

			array(
				'title'            => esc_html__( 'Map', 'onepress-plus' ),
				'section_id'       => 'map',
				'id_translate'    => esc_html__( 'map', 'onepress-plus' ),
				'show_section'     => '1',
				'bg_color'         => '',
				'bg_opacity'       => '',
				'bg_opacity_color' => '',
				'bg_image'         => '',
				'bg_video'         => '',
				'section_inverse'  => '',
				'enable_parallax'  => '',
				'padding_top'      => '',
				'padding_bottom'   => '',
			),
		);

		return $sections;
	}

	/**
	 * Add more plus section
	 *
	 * @todo Ensure this hook apply before all plugins and theme loaded.
	 *
	 * @since 2.0.9
	 */
	function add_sections() {
		if ( ! class_exists( 'Onepress_Config' ) ) {
			// Add dots Navigation
			add_filter( 'onepress_sections_navigation_get_sections', array( $this, 'onepress_plus_get_sections' ) );
		} else {
			add_filter( 'onepress_get_sections', array( $this, 'onepress_plus_get_sections' ) );
		}
	}

	/**
	 * Add Sections Config
	 *
	 * @param $theme_sections
	 *
	 * @since 2.0.9
	 *
	 * @return array
	 */
	function onepress_plus_get_sections( $theme_sections ) {
		$_sections = OnePress_Plus::get_instance()->get_sections_settings();
		$sections = array(
			'hero' => array( // Don't mis hero slider.
				'label' => __( 'Section: Hero', 'onepress-plus' ),
				'title' => '',
				'default' => false,
				'inverse' => false,
			),
		);

		$plugin_sections = array();

		foreach ( Onepress_Customize::get_instance()->get_sections() as $sid => $s ) {

			if ( $s instanceof Onepress_Section_Base ) {
				if ( method_exists( $s, 'get_info' ) ) {
					$_info = $s->get_info();
					if ( ! empty( $_info ) ) {
						$_info['__class']        = $s;
						$plugin_sections[ $sid ] = $_info;
					} else {
						$plugin_sections[ $sid ] = $s;
					}
				}
			}
		}

		foreach ( $_sections as $index => $section ) {
			$section = wp_parse_args(
				$section,
				array(
					'section_id' => '',
					'subtitle' => '',
					'title' => '',
					'add_by' => '',
					'show_section' => 1,
				)
			);

			$id = $section['section_id'];

			if ( isset( $theme_sections[ $id ] ) ) {
				$sections[ $id ] = $theme_sections[ $id ];
				if ( isset( $plugin_sections[ $id ] ) ) {
					if ( is_array( $plugin_sections[ $id ] ) ) {
						$sections[ $id ] = $plugin_sections[ $id ];
					} else {
						$sections[ $id ]['__class'] = $plugin_sections[ $id ];
					}
				}
			} elseif ( isset( $plugin_sections[ $id ] ) ) {
				$sections[ $id ] = $plugin_sections[ $id ];
			} else {
				$sections[ $id ] = array(
					'label' => sprintf( __( 'Section: %s', 'onepress-plus' ), $section['title'] ),
					'title' => $section['title'],
					'id' => ( isset( $section['id_translate'] ) && $section['id_translate'] ) ? $section['id_translate'] : $id,
					'default' => ( $section['show_section'] ) ? true : false,
					'show_section' => $section['show_section'],
				);
				if ( isset( $plugin_sections[ $id ] ) ) {
					if ( is_array( $plugin_sections[ $id ] ) ) {
						$sections[ $id ] = $plugin_sections[ $id ];
					} else {
						$sections[ $id ]['__class'] = $plugin_sections[ $id ];
					}
				}
			}
		}

		return $sections;
	}

}

/**
 * @since 0.0.9
 */
// add_action( 'init', array( Onepress_Plus_Config::get_instance(), 'add_sections' ), 0 );
Onepress_Plus_Config::get_instance()->add_sections();
