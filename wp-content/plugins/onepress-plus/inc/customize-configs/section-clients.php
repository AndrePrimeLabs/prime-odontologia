<?php

class Onepress_Section_Clients extends Onepress_Section_Base {

	function get_info() {
		return array(
			'label' => __( 'Section: Clients', 'onepress-plus' ),
			'title' => __( 'Our Clients', 'onepress-plus' ),
			'default' => false,
			'inverse' => false,
		);
	}

	/**
	 * Customize settings.
	 *
	 * @param WP_Customize_Manager $wp_customize
	 * @return void
	 */
	function wp_customize( $wp_customize ) {

		$wp_customize->add_panel(
			'onepress_clients_panel',
			array(
				'priority'        => 140,
				'title'           => __( 'Section: Clients', 'onepress-plus' ),
				'description'     => '',
				'active_callback' => 'onepress_showon_frontpage',
			)
		);

		$wp_customize->add_section(
			'onepress_clients_settings',
			array(
				'priority' => 3,
				'title'    => __( 'Section Settings', 'onepress-plus' ),
				'panel'    => 'onepress_clients_panel',
			)
		);

		// Section ID.
		$wp_customize->add_setting(
			'onepress_clients_id',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'clients',
			)
		);
		$wp_customize->add_control(
			'onepress_clients_id',
			array(
				'label'   => __( 'Section ID', 'onepress-plus' ),
				'section' => 'onepress_clients_settings',
			)
		);

		// Title.
		$wp_customize->add_setting(
			'onepress_clients_title',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			'onepress_clients_title',
			array(
				'label'   => __( 'Title', 'onepress-plus' ),
				'section' => 'onepress_clients_settings',
			)
		);

		// Clients subtitle.
		$wp_customize->add_setting(
			'onepress_clients_subtitle',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => __( 'Have been featured on', 'onepress-plus' ),
			)
		);
		$wp_customize->add_control(
			'onepress_clients_subtitle',
			array(
				'label'       => __( 'Some of our works', 'onepress-plus' ),
				'section'     => 'onepress_clients_settings',
				'description' => '',
			)
		);

		// Description.
		$wp_customize->add_setting(
			'onepress_clients_desc',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			new OnePress_Editor_Custom_Control(
				$wp_customize,
				'onepress_clients_desc',
				array(
					'label'       => esc_html__( 'Section Description', 'onepress-plus' ),
					'section'     => 'onepress_clients_settings',
					'description' => '',
				)
			)
		);

		// Section content.
		$wp_customize->add_section(
			'onepress_clients_content',
			array(
				'priority' => 3,
				'title'    => __( 'Section Content', 'onepress-plus' ),
				'panel'    => 'onepress_clients_panel',
			)
		);
		$wp_customize->add_setting(
			'onepress_clients',
			array(
				'default'           => json_encode(
					array(
						array(
							'title' => esc_html__( 'Hostingco', 'onepress-plus' ),
							'image' => array(
								'id'  => '',
								'url' => ONEPRESS_PLUS_URL . 'build/images/client_logo_1.png',
							),
							'link'  => '',
						),
						array(
							'title' => esc_html__( 'Religion', 'onepress-plus' ),
							'image' => array(
								'id'  => '',
								'url' => ONEPRESS_PLUS_URL . 'build/images/client_logo_2.png',
							),
							'link'  => '',
						),
						array(
							'title' => esc_html__( 'Viento', 'onepress-plus' ),
							'image' => array(
								'id'  => '',
								'url' => ONEPRESS_PLUS_URL . 'build/images/client_logo_3.png',
							),
							'link'  => '',
						),
						array(
							'title' => esc_html__( 'Naturefirst', 'onepress-plus' ),
							'image' => array(
								'id'  => '',
								'url' => ONEPRESS_PLUS_URL . 'build/images/client_logo_4.png',
							),
							'link'  => '',
						),
						array(
							'title' => esc_html__( 'Imagine', 'onepress-plus' ),
							'image' => array(
								'id'  => '',
								'url' => ONEPRESS_PLUS_URL . 'build/images/client_logo_5.png',
							),
							'link'  => '',
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
				'onepress_clients',
				array(
					'label'         => esc_html__( 'Clients', 'onepress-plus' ),
					'description'   => '',
					'section'       => 'onepress_clients_content',
					'live_title_id' => 'title', // apply for input text and textarea only.
					'title_format'  => esc_html__( '[live_title]', 'onepress-plus' ), // [live_title]
					'max_item'      => 4, // Maximum item can add.

					'fields' => array(
						'title' => array(
							'title'   => esc_html__( 'Client name', 'onepress-plus' ),
							'type'    => 'text',
							'desc'    => '',
							'default' => esc_html__( 'My Client', 'onepress-plus' ),
						),
						'image' => array(
							'title'   => esc_html__( 'Image', 'onepress-plus' ),
							'type'    => 'media',
							'default' => array(
								'id'  => '',
								'url' => ONEPRESS_PLUS_URL . 'build/images/client_logo_1.png',
							),
						),
						'link'  => array(
							'title'   => esc_html__( 'link', 'onepress-plus' ),
							'type'    => 'text',
							'default' => '',
						),
					),

				)
			)
		);


		// Show client  name
		$wp_customize->add_setting(
			'onepress_clients_show_name',
			array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => null,
			)
		);

		$wp_customize->add_control(
			'onepress_clients_show_name',
			array(
				'label'   => __( 'Show client name', 'onepress-plus' ),
				'section' => 'onepress_clients_content',
				'type'    => 'checkbox',
			)
		);



		// Clients link target.
		$wp_customize->add_setting(
			'onepress_clients_target',
			array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => null,
			)
		);

		$wp_customize->add_control(
			'onepress_clients_target',
			array(
				'label'   => __( 'Open Link In New Window', 'onepress-plus' ),
				'section' => 'onepress_clients_content',
				'type'    => 'checkbox',
			)
		);



		// Clients layout.
		$wp_customize->add_setting(
			'onepress_clients_layout',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 5,
			)
		);

		$wp_customize->add_control(
			'onepress_clients_layout',
			array(
				'label'       => esc_html__( 'Clients Layout Setting', 'onepress-plus' ),
				'section'     => 'onepress_clients_settings',
				'description' => '',
				'type'        => 'select',
				'choices'     => array(
					'2' => esc_html__( '2 Columns', 'onepress-plus' ),
					'3' => esc_html__( '3 Columns', 'onepress-plus' ),
					'4' => esc_html__( '4 Columns', 'onepress-plus' ),
					'5' => esc_html__( '5 Columns', 'onepress-plus' ),
					'6' => esc_html__( '6 Columns', 'onepress-plus' ),
				),
			)
		);

		$wp_customize->add_setting(
			'onepress_clients_carousel_h',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
			)
		);
		$wp_customize->add_control(
			new OnePress_Misc_Control(
				$wp_customize,
				'onepress_clients_carousel_h',
				array(
					'type'        => 'custom_message',
					'section'     => 'onepress_clients_settings',
					'description' => '<div class="onepress-c-heading">' . esc_html__( 'Carousel Settings', 'onepress-plus' ) . '</div>',
				)
			)
		);

		// Carousel Enable.
		$wp_customize->add_setting(
			'onepress_clients_carousel',
			array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => null,
			)
		);
		$wp_customize->add_control(
			'onepress_clients_carousel',
			array(
				'label'   => __( 'Enable Carousel', 'onepress-plus' ),
				'section' => 'onepress_clients_settings',
				'type'    => 'checkbox',
			)
		);

		$wp_customize->add_setting(
			'onepress_clients_carousel_dots',
			array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 1,
			)
		);
		$wp_customize->add_control(
			'onepress_clients_carousel_dots',
			array(
				'label'   => __( 'Show dots navigation.', 'onepress-plus' ),
				'section' => 'onepress_clients_settings',
				'type'    => 'checkbox',
			)
		);

		$wp_customize->add_setting(
			'onepress_clients_carousel_nav',
			array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 1,
			)
		);

		$wp_customize->add_control(
			'onepress_clients_carousel_nav',
			array(
				'label'   => __( 'Show next/previous navigation.', 'onepress-plus' ),
				'section' => 'onepress_clients_settings',
				'type'    => 'checkbox',
			)
		);

		$wp_customize->add_setting(
			'onepress_clients_carousel_desktop',
			array(
				'sanitize_callback' => 'absint',
				'default'           => 5,
			)
		);
		$wp_customize->add_control(
			'onepress_clients_carousel_desktop',
			array(
				'label'   => __( 'Number of items on the desktop', 'onepress-plus' ),
				'section' => 'onepress_clients_settings',
				'type'    => 'text',
			)
		);

		$wp_customize->add_setting(
			'onepress_clients_carousel_tablet',
			array(
				'sanitize_callback' => 'absint',
				'default'           => 4,
			)
		);
		$wp_customize->add_control(
			'onepress_clients_carousel_tablet',
			array(
				'label'   => __( 'Number of items on the tablet', 'onepress-plus' ),
				'section' => 'onepress_clients_settings',
				'type'    => 'text',
			)
		);

		$wp_customize->add_setting(
			'onepress_clients_carousel_mobile',
			array(
				'sanitize_callback' => 'absint',
				'default'           => 2,
			)
		);
		$wp_customize->add_control(
			'onepress_clients_carousel_mobile',
			array(
				'label'   => __( 'Number of items on the mobile', 'onepress-plus' ),
				'section' => 'onepress_clients_settings',
				'type'    => 'text',
			)
		);

	}

}

Onepress_Customize::get_instance()->add_section( 'clients', 'Onepress_Section_Clients' );
