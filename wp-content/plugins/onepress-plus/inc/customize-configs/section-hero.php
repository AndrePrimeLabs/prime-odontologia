<?php
class Onepress_Section_Hero {
	/**
	 * @param $wp_customize WP_Customize_Manager
	 */
	function wp_customize( $wp_customize ) {

		// Hero section
		// Video MP4
		$wp_customize->add_setting( 'onepress_hero_video_mp4',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => '',
				'transport'         => 'refresh', // refresh or postMessage
			)
		);
		$wp_customize->add_control( new WP_Customize_Media_Control(
				$wp_customize,
				'onepress_hero_video_mp4',
				array(
					'label'    => esc_html__( 'Background Video (.MP4)', 'onepress-plus' ),
					'section'  => 'onepress_hero_images',
					'priority' => 100,
				)
			)
		);

		// Video webm
		$wp_customize->add_setting( 'onepress_hero_video_webm',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => '',
				'transport'         => 'refresh', // refresh or postMessage
			)
		);
		$wp_customize->add_control( new WP_Customize_Media_Control(
				$wp_customize,
				'onepress_hero_video_webm',
				array(
					'label'    => esc_html__( 'Background Video(.WEBM)', 'onepress-plus' ),
					'section'  => 'onepress_hero_images',
					'priority' => 105,
				)
			)
		);
		// Video OGV
		$wp_customize->add_setting( 'onepress_hero_video_ogv',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => '',
				'transport'         => 'refresh', // refresh or postMessage
			)
		);
		$wp_customize->add_control( new WP_Customize_Media_Control(
				$wp_customize,
				'onepress_hero_video_ogv',
				array(
					'label'    => esc_html__( 'Background Video(.OGV)', 'onepress-plus' ),
					'section'  => 'onepress_hero_images',
					'priority' => 110,
				)
			)
		);
		// Hero mobile video fallback
		$wp_customize->add_setting( 'onepress_hero_mobile_img',
			array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => '',
			)
		);
		$wp_customize->add_control( 'onepress_hero_mobile_img',
			array(
				'type'     => 'checkbox',
				'priority' => 115,
				'label'    => esc_html__( 'On mobile replace video with first background image.', 'onepress-plus' ),
				'section'  => 'onepress_hero_images',
			)
		);

		$wp_customize->add_section( 'onepress_hero_typo',
			array(
				'title'       => esc_html__( 'Hero', 'onepress-plus' ),
				'description' => '',
				'panel'       => 'onepress_typo',
			)
		);
		$wp_customize->add_setting(
			'onepress_hero_heading',
			array(
				'sanitize_callback' => 'onepress_sanitize_typography_field',
				'transport'         => 'postMessage',
				'priority'          => 100,
			)
		);

		$wp_customize->add_control(
			new OnePress_Customize_Typography_Control(
				$wp_customize,
				'onepress_hero_heading',
				array(
					'label'        => esc_html__( 'Heading Typography', 'onepress-plus' ),
					'section'      => 'onepress_hero_typo',
					'css_selector' => '.hero-large-text, .hcl2-content h1', // css selector for live view
					'fields'       => array(
						'font-family' => '',
						'font-style'  => '', // italic
						'font-weight' => '',
						'color'       => '',
					)
				)
			)
		);

		// END Hero section
	}
}

Onepress_Customize::get_instance()->add_section( 'hero', 'Onepress_Section_Hero' );