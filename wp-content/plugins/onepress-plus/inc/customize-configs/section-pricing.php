<?php
class Onepress_Section_Pricing extends Onepress_Section_Base {
	function get_info(){
		return array(
			'label' => __( 'Section: Pricing', 'onepress-plus' ),
			'title' => __( 'Pricing Table', 'onepress-plus' ),
			'default' => false,
			'inverse' => false,
		);
	}
	/**
	 * @param $wp_customize WP_Customize_Manager
	 */
	function wp_customize( $wp_customize ) {

		/*------------------------------------------------------------------------*/
		/*  Section: Pricing Table
		/*------------------------------------------------------------------------*/
		$wp_customize->add_panel( 'onepress_pricing',
			array(
				'priority'        => 230,
				'title'           => __( 'Section: Pricing', 'onepress-plus' ),
				'description'     => '',
				'active_callback' => 'onepress_showon_frontpage'
			)
		);

		$wp_customize->add_section( 'onepress_pricing_settings',
			array(
				'priority' => 3,
				'title'    => __( 'Section Settings', 'onepress-plus' ),
				'panel'    => 'onepress_pricing',
			)
		);

		// Pricing ID
		$wp_customize->add_setting( 'onepress_pricing_id',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'pricing',
			)
		);
		$wp_customize->add_control( 'onepress_pricing_id',
			array(
				'label'       => __( 'Section ID', 'onepress-plus' ),
				'section'     => 'onepress_pricing_settings',
				'description' => '',
			)
		);

		// Project title
		$wp_customize->add_setting( 'onepress_pricing_title',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => __( 'Pricing Table', 'onepress-plus' ),
			)
		);
		$wp_customize->add_control( 'onepress_pricing_title',
			array(
				'label'       => __( 'Section Title', 'onepress-plus' ),
				'section'     => 'onepress_pricing_settings',
				'description' => '',
			)
		);

		// Project subtitle
		$wp_customize->add_setting( 'onepress_pricing_subtitle',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => __( 'Responsive pricing section', 'onepress-plus' ),
			)
		);
		$wp_customize->add_control( 'onepress_pricing_subtitle',
			array(
				'label'       => __( 'Some of our works', 'onepress-plus' ),
				'section'     => 'onepress_pricing_settings',
				'description' => '',
			)
		);

		// Description
		$wp_customize->add_setting( 'onepress_pricing_desc',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => '',
			)
		);
		$wp_customize->add_control( new OnePress_Editor_Custom_Control(
			$wp_customize,
			'onepress_pricing_desc',
			array(
				'label'       => esc_html__( 'Section Description', 'onepress-plus' ),
				'section'     => 'onepress_pricing_settings',
				'description' => '',
			)
		) );

		// Section content
		$wp_customize->add_section( 'onepress_pricing_content',
			array(
				'priority' => 3,
				'title'    => __( 'Section Content', 'onepress-plus' ),
				'panel'    => 'onepress_pricing',
			)
		);
		$wp_customize->add_setting(
			'onepress_pricing_plans',
			array(
				'default'           => json_encode(
					array(
						array(
							'title'    => esc_html__( 'Freelancer', 'onepress-plus' ),
							'code'     => esc_html__( '$', 'onepress-plus' ),
							'price'    => '9.90',
							'subtitle' => esc_html__( 'Perfect for single freelancers who work by themselves', 'onepress-plus' ),
							'content'  => esc_html__( "Support Forum \nFree hosting\n 1 hour of support\n 40MB of storage space", 'onepress-plus' ),
							'label'    => esc_attr__( 'Choose Plan', 'onepress-plus' ),
							'link'     => '#',
							'button'   => 'btn-theme-primary',
						),
						array(
							'title'    => esc_html__( 'Small Business', 'onepress-plus' ),
							'code'     => esc_html__( '$', 'onepress-plus' ),
							'price'    => '29.9',
							'subtitle' => esc_html__( 'Suitable for small businesses with up to 5 employees', 'onepress-plus' ),
							'content'  => esc_html__( "Support Forum \nFree hosting\n 10 hour of support\n 1GB of storage space", 'onepress-plus' ),
							'label'    => esc_attr__( 'Choose Plan', 'onepress-plus' ),
							'link'     => '#',
							'button'   => 'btn-success',
						),
						array(
							'title'    => esc_html__( 'Larger Business', 'onepress-plus' ),
							'code'     => esc_html__( '$', 'onepress-plus' ),
							'price'    => '59.90',
							'subtitle' => esc_html__( 'Great for large businesses with more than 5 employees', 'onepress-plus' ),
							'content'  => esc_html__( "Support Forum \nFree hosting\n Unlimited hours of support\n Unlimited storage space", 'onepress-plus' ),
							'label'    => esc_attr__( 'Choose Plan', 'onepress-plus' ),
							'link'     => '#',
							'button'   => 'btn-theme-primary',
						),

					)
				),
				'sanitize_callback' => 'onepress_sanitize_repeatable_data_field',
				'transport'         => 'refresh', // refresh or postMessage
			) );


		$wp_customize->add_control(
			new Onepress_Customize_Repeatable_Control(
				$wp_customize,
				'onepress_pricing_plans',
				array(
					'label'         => esc_html__( 'Pricing Plans', 'onepress-plus' ),
					'description'   => '',
					'section'       => 'onepress_pricing_content',
					'live_title_id' => 'title', // apply for unput text and textarea only
					'title_format'  => esc_html__( '[live_title]', 'onepress-plus' ), // [live_title]
					'max_item'      => 4, // Maximum item can add

					'fields' => array(
						'title'    => array(
							'title'   => esc_html__( 'Title', 'onepress-plus' ),
							'type'    => 'text',
							'desc'    => '',
							'default' => esc_html__( 'Your service title', 'onepress-plus' ),
						),
						'price'    => array(
							'title'   => esc_html__( 'Price', 'onepress-plus' ),
							'type'    => 'text',
							'default' => esc_html__( '99', 'onepress-plus' ),
						),
						'compare_at_price'    => array(
							'title'   => esc_html__( 'Compare at price', 'onepress-plus' ),
							'type'    => 'text',
							'default' => '',
						),
						'code'     => array(
							'title'   => esc_html__( 'Currency code', 'onepress-plus' ),
							'type'    => 'text',
							'default' => esc_html__( '$', 'onepress-plus' ),
						),
						'subtitle' => array(
							'title'   => esc_html__( 'Subtitle', 'onepress-plus' ),
							'type'    => 'text',
							'desc'    => '',
							'default' => esc_html__( 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit', 'onepress-plus' ),
						),
						'content'  => array(
							'title'   => esc_html__( 'Option list', 'onepress-plus' ),
							'desc'    => esc_html__( 'Each option per line', 'onepress-plus' ),
							'type'    => 'textarea',
							'default' => esc_html__( "Option 1\n Option 2\n Option 3\n Option 4", 'onepress-plus' ),
						),
						'label'    => array(
							'title'   => esc_html__( 'Button label', 'onepress-plus' ),
							'type'    => 'text',
							'desc'    => '',
							'default' => esc_html__( 'Choose Plan', 'onepress-plus' ),
						),
						'link'     => array(
							'title'   => esc_html__( 'Button Link', 'onepress-plus' ),
							'type'    => 'text',
							'desc'    => '',
							'default' => '#',
						),
						'button'   => array(
							'title'   => esc_html__( 'Button style', 'onepress-plus' ),
							'type'    => 'select',
							'options' => array(
								'btn-theme-primary' => esc_html__( 'Theme default', 'onepress-plus' ),
								'btn-default'       => esc_html__( 'Button', 'onepress-plus' ),
								'btn-primary'       => esc_html__( 'Primary', 'onepress-plus' ),
								'btn-success'       => esc_html__( 'Success', 'onepress-plus' ),
								'btn-info'          => esc_html__( 'Info', 'onepress-plus' ),
								'btn-warning'       => esc_html__( 'Warning', 'onepress-plus' ),
								'btn-danger'        => esc_html__( 'Danger', 'onepress-plus' ),
							)
						),
					),

				)
			)
		);
		// end pricing
	}
}

Onepress_Customize::get_instance()->add_section( 'pricing', 'Onepress_Section_Pricing' );