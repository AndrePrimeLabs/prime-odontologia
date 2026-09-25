<?php

class Onepress_Section_CTA extends Onepress_Section_Base {
	function get_info() {
		return array(
			'label' => __( 'Section: Call to Action', 'onepress-plus' ),
			'title' => '',
			'default' => false,
			'inverse' => false,
		);
	}
	function wp_customize( $wp_customize ) {

		$wp_customize->add_panel(
			'onepress_cta_panel',
			array(
				'priority'        => 240,
				'title'           => __( 'Section: Call to Action', 'onepress-plus' ),
				'description'     => '',
				'active_callback' => 'onepress_showon_frontpage',
			)
		);

		$wp_customize->add_section(
			'onepress_cta_settings',
			array(
				'priority' => 3,
				'title'    => __( 'Section Settings', 'onepress-plus' ),
				'panel'    => 'onepress_cta_panel',
			)
		);

		// Section ID.
		$wp_customize->add_setting(
			'onepress_cta_id',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'section-cta',
			)
		);
		$wp_customize->add_control(
			'onepress_cta_id',
			array(
				'label'   => __( 'Section ID', 'onepress-plus' ),
				'section' => 'onepress_cta_settings',
			)
		);

		// Title.
		$wp_customize->add_setting(
			'onepress_cta_title',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => __( 'Use these ribbons to display calls to action mid-page.', 'onepress-plus' ),
			)
		);
		$wp_customize->add_control(
			'onepress_cta_title',
			array(
				'label'   => __( 'Title', 'onepress-plus' ),
				'section' => 'onepress_cta_settings',
			)
		);

		// Button label.
		$wp_customize->add_setting(
			'onepress_cta_btn_label',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => __( 'Button Text', 'onepress-plus' ),
			)
		);
		$wp_customize->add_control(
			'onepress_cta_btn_label',
			array(
				'label'   => __( 'Button Text', 'onepress-plus' ),
				'section' => 'onepress_cta_settings',
			)
		);

		// Button link.
		$wp_customize->add_setting(
			'onepress_cta_btn_link',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			'onepress_cta_btn_link',
			array(
				'label'   => __( 'Button Link', 'onepress-plus' ),
				'section' => 'onepress_cta_settings',
			)
		);

		/**
		 * Button target.
		 *
		 * @since 2.2.1
		 */
		$wp_customize->add_setting(
			'onepress_cta_btn_target',
			array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => null,
			)
		);
		$wp_customize->add_control(
			'onepress_cta_btn_target',
			array(
				'label'         => __( 'Open In New Window', 'onepress-plus' ),
				'section'       => 'onepress_cta_settings',
				'type'          => 'checkbox',
			)
		);

		// Button link style.
		$wp_customize->add_setting(
			'onepress_cta_btn_link_style',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => 'theme-primary',
			)
		);
		$wp_customize->add_control(
			'onepress_cta_btn_link_style',
			array(
				'label'   => __( 'Button Link Style', 'onepress-plus' ),
				'section' => 'onepress_cta_settings',
				'type'    => 'select',
				'choices' => array(

					'theme-primary' => esc_html__( 'Theme default', 'onepress-plus' ),
					'btn-primary'   => esc_html__( 'Primary', 'onepress-plus' ),
					'btn-secondary' => esc_html__( 'Secondary', 'onepress-plus' ),
					'btn-success'   => esc_html__( 'Success', 'onepress-plus' ),
					'btn-info'      => esc_html__( 'Info', 'onepress-plus' ),
					'btn-warning'   => esc_html__( 'Warning', 'onepress-plus' ),
					'btn-danger'    => esc_html__( 'Danger', 'onepress-plus' ),

					'btn-outline-primary'   => esc_html__( 'Outline Primary', 'onepress-plus' ),
					'btn-outline-secondary' => esc_html__( 'Outline Secondary', 'onepress-plus' ),
					'btn-outline-success'   => esc_html__( 'Outline Success', 'onepress-plus' ),
					'btn-outline-info'      => esc_html__( 'Outline Info', 'onepress-plus' ),
					'btn-outline-warning'   => esc_html__( 'Outline Warning', 'onepress-plus' ),
					'btn-outline-danger'    => esc_html__( 'Outline Danger', 'onepress-plus' ),

				),

			)
		);

		// EN Add cta.
	}
}

Onepress_Customize::get_instance()->add_section( 'cta', 'Onepress_Section_CTA' );
