<?php

class Onepress_Section_Testimonials extends Onepress_Section_Base {

	function get_info() {
		return array(
			'label'   => __( 'Section: Testimonials', 'onepress-plus' ),
			'title'   => __( 'Testimonials', 'onepress-plus' ),
			'default' => false,
			'inverse' => false,
		);
	}

	/**
	 * @param $wp_customize WP_Customize_Manager
	 */
	function wp_customize( $wp_customize ) {

		/*
		------------------------------------------------------------------------*/
		/*
		  Section: Testimonials
		/*------------------------------------------------------------------------*/
		$wp_customize->add_panel(
			'onepress_testimonial',
			array(
				'priority'        => 220,
				'title'           => esc_html__( 'Section: Testimonials', 'onepress-plus' ),
				'description'     => '',
				'active_callback' => 'onepress_showon_frontpage',
			)
		);

		$wp_customize->add_section(
			'onepress_testimonial_settings',
			array(
				'priority'    => 3,
				'title'       => esc_html__( 'Section Settings', 'onepress-plus' ),
				'description' => '',
				'panel'       => 'onepress_testimonial',
			)
		);
		// Show Content
		/*
		$wp_customize->add_setting( 'onepress_testimonials_disable',
			array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => '',
			)
		);
		$wp_customize->add_control( 'onepress_testimonials_disable',
			array(
				'type'        => 'checkbox',
				'label'       => esc_html__('Hide this section?', 'onepress-plus'),
				'section'     => 'onepress_testimonial_settings',
				'description' => esc_html__('Check this box to hide this section.', 'onepress-plus'),
			)
		);
		*/

		// Section ID
		$wp_customize->add_setting(
			'onepress_testimonial_id',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => esc_html__( 'testimonials', 'onepress-plus' ),
			)
		);
		$wp_customize->add_control(
			'onepress_testimonial_id',
			array(
				'label'       => esc_html__( 'Section ID:', 'onepress-plus' ),
				'section'     => 'onepress_testimonial_settings',
				'description' => esc_html__( 'The section id, we will use this for link anchor.', 'onepress-plus' ),
			)
		);

		// Title
		$wp_customize->add_setting(
			'onepress_testimonial_title',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => esc_html__( 'Testimonials', 'onepress-plus' ),
			)
		);
		$wp_customize->add_control(
			'onepress_testimonial_title',
			array(
				'label'       => esc_html__( 'Section Title', 'onepress-plus' ),
				'section'     => 'onepress_testimonial_settings',
				'description' => '',
			)
		);

		// Sub Title
		$wp_customize->add_setting(
			'onepress_testimonial_subtitle',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => esc_html__( 'Section subtitle', 'onepress-plus' ),
			)
		);
		$wp_customize->add_control(
			'onepress_testimonial_subtitle',
			array(
				'label'       => esc_html__( 'Section Subtitle', 'onepress-plus' ),
				'section'     => 'onepress_testimonial_settings',
				'description' => '',
			)
		);

		// Description
		$wp_customize->add_setting(
			'onepress_testimonial_desc',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			new OnePress_Editor_Custom_Control(
				$wp_customize,
				'onepress_testimonial_desc',
				array(
					'label'       => esc_html__( 'Section Description', 'onepress-plus' ),
					'section'     => 'onepress_testimonial_settings',
					'description' => '',
				)
			)
		);

		$wp_customize->add_setting(
			'onepress_testimonial_layout',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '3',
			)
		);

		$wp_customize->add_control(
			'onepress_testimonial_layout',
			array(
				'label'       => esc_html__( 'Layout Setting', 'onepress-plus' ),
				'section'     => 'onepress_testimonial_settings',
				'description' => '',
				'type'        => 'select',
				'default'     => 'default',
				'choices'     => array(
					'1' => esc_html__( '1 Column', 'onepress-plus' ),
					'2' => esc_html__( '2 Columns', 'onepress-plus' ),
					'3' => esc_html__( '3 Columns', 'onepress-plus' ),
					'4' => esc_html__( '4 Columns', 'onepress-plus' ),
				),
			)
		);

		// Testimonials content
		$wp_customize->add_section(
			'onepress_testimonials_content',
			array(
				'priority'    => 3,
				'title'       => esc_html__( 'Section Content', 'onepress-plus' ),
				'description' => '',
				'panel'       => 'onepress_testimonial',
			)
		);
		$wp_customize->add_setting(
			'onepress_testimonial_boxes',
			array(
				'default'           => json_encode(
					array(
						array(
							'title'    => esc_html__( 'Praesent placerat', 'onepress-plus' ),
							'name'     => esc_html__( 'Alexander Rios', 'onepress-plus' ),
							'subtitle' => esc_html__( 'Founder & CEO', 'onepress-plus' ),
							'style'    => 'warning',
							'image'    => array(
								'url' => get_template_directory_uri() . '/assets/images/testimonial_1.jpg',
								'id'  => '',
							),
							'content'  => esc_html__( 'Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat.', 'onepress-plus' ),

						),
						array(
							'title'    => esc_html__( 'Cras iaculis', 'onepress-plus' ),
							'name'     => esc_html__( 'Alexander Max', 'onepress-plus' ),
							'subtitle' => esc_html__( 'Founder & CEO', 'onepress-plus' ),
							'style'    => 'success',
							'image'    => array(
								'url' => get_template_directory_uri() . '/assets/images/testimonial_2.jpg',
								'id'  => '',
							),
							'content'  => esc_html__( 'Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue eu vulputate.', 'onepress-plus' ),

						),
						array(
							'title'    => esc_html__( 'Fusce lobortis', 'onepress-plus' ),
							'name'     => esc_html__( 'Peter Mendez', 'onepress-plus' ),
							'subtitle' => esc_html__( 'Example Company', 'onepress-plus' ),
							'style'    => 'theme-primary',
							'image'    => array(
								'url' => get_template_directory_uri() . '/assets/images/testimonial_3.jpg',
								'id'  => '',
							),
							'content'  => esc_html__( 'Sed adipiscing ornare risus. Morbi est est, blandit sit amet, sagittis vel, euismod vel, velit. Pellentesque egestas sem. Suspendisse commodo ullamcorper magna egestas sem.', 'onepress-plus' ),
						),

					)
				),
				'sanitize_callback' => 'onepress_sanitize_repeatable_data_field',
				'transport'         => 'refresh', // refresh or postMessage
			)
		);

		$wp_customize->add_control(
			new Onepress_Customize_Repeatable_Control(
				$wp_customize,
				'onepress_testimonial_boxes',
				array(
					'label'         => esc_html__( 'Testimonial', 'onepress-plus' ),
					'description'   => '',
					'section'       => 'onepress_testimonials_content',
					'live_title_id' => 'title', // apply for unput text and textarea only
					'title_format'  => esc_html__( '[live_title]', 'onepress-plus' ), // [live_title]
					'max_item'      => 3, // Maximum item can add

					'fields'        => array(
						'title'        => array(
							'title'   => esc_html__( 'Title', 'onepress-plus' ),
							'type'    => 'text',
							'desc'    => '',
							'default' => esc_html__( 'Testimonial title', 'onepress-plus' ),
						),
						'name'         => array(
							'title'   => esc_html__( 'Name', 'onepress-plus' ),
							'type'    => 'text',
							'desc'    => '',
							'default' => esc_html__( 'User name', 'onepress-plus' ),
						),
						'image'        => array(
							'title'   => esc_html__( 'Avatar', 'onepress-plus' ),
							'type'    => 'media',
							'desc'    => esc_html__( 'Suggestion: 100x100px square image.', 'onepress-plus' ),
							'default' => array(
								'url' => get_template_directory_uri() . '/assets/images/testimonial_1.jpg',
								'id'  => '',
							),
						),
						'subtitle'     => array(
							'title'   => esc_html__( 'Subtitle', 'onepress-plus' ),
							'type'    => 'textarea',
							'default' => esc_html__( 'Example Company', 'onepress-plus' ),
						),
						'content'      => array(
							'title'   => esc_html__( 'Content', 'onepress-plus' ),
							'type'    => 'textarea',
							'default' => esc_html__( 'Whatever your user say', 'onepress-plus' ),
						),

						'style'        => array(
							'title'   => esc_html__( 'Style', 'onepress-plus' ),
							'type'    => 'select',
							'default' => 'light',
							'options' => array(
								'theme-primary' => esc_html__( 'Theme default', 'onepress-plus' ),
								'light'         => esc_html__( 'Light', 'onepress-plus' ),
								'primary'       => esc_html__( 'Primary', 'onepress-plus' ),
								'success'       => esc_html__( 'Success', 'onepress-plus' ),
								'info'          => esc_html__( 'Info', 'onepress-plus' ),
								'warning'       => esc_html__( 'Warning', 'onepress-plus' ),
								'danger'        => esc_html__( 'Danger', 'onepress-plus' ),
								'custom'        => esc_html__( 'Custom Color', 'onepress-plus' ),
							),
						),

						'custom_color' => array(
							'title'    => esc_html__( 'Custom Color', 'onepress-plus' ),
							'type'     => 'color',
							'desc'     => '',
							'default'  => '',
							'required' => array( 'style', '=', 'custom' ),
						),

					),

				)
			)
		);
	}
}


Onepress_Customize::get_instance()->add_section( 'testimonials', 'Onepress_Section_Testimonials' );
