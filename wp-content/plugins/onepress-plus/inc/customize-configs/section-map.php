<?php
class Onepress_Section_Map extends Onepress_Section_Base {

	function get_info() {
		return array(
			'label'   => __( 'Section: Map', 'onepress-plus' ),
			'title'   => __( 'Map', 'onepress-plus' ),
			'default' => false,
			'inverse' => false,
		);
	}

	/**
	 * Show Customizer controls only for Google Maps (JS) layout, not embed.
	 *
	 * @param WP_Customize_Control $control Control instance.
	 * @return bool
	 */
	public function map_type_not_embed( $control ) {
		$setting = $control->manager->get_setting( 'onepress_map_type' );
		if ( ! $setting ) {
			return true;
		}
		return 'embed' !== $setting->value();
	}

	/**
	 * Show embed-code control only when map type is embed.
	 *
	 * @param WP_Customize_Control $control Control instance.
	 * @return bool
	 */
	public function map_type_is_embed( $control ) {
		$setting = $control->manager->get_setting( 'onepress_map_type' );
		if ( ! $setting ) {
			return false;
		}
		return 'embed' === $setting->value();
	}

	/**
	 * @param $wp_customize WP_Customize_Manager
	 */
	function wp_customize( $wp_customize ) {

		/*
		------------------------------------------------------------------------*/
		/*
		  Section: Map
		/*------------------------------------------------------------------------*/
		$wp_customize->add_panel(
			'onepress_map',
			array(
				'priority'        => 280,
				'title'           => __( 'Section: Map', 'onepress-plus' ),
				'description'     => '',
				'active_callback' => 'onepress_showon_frontpage',
			)
		);

		$wp_customize->add_section(
			'onepress_map_settings',
			array(
				'priority' => 3,
				'title'    => __( 'Section Settings', 'onepress-plus' ),
				'panel'    => 'onepress_map',
			)
		);

		// Section ID
		$wp_customize->add_setting(
			'onepress_map_id',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'map',
			)
		);

		$wp_customize->add_control(
			'onepress_map_id',
			array(
				'label'       => __( 'Section ID', 'onepress-plus' ),
				'section'     => 'onepress_map_settings',
				'description' => '',
			)
		);


		// Map Type.
		$wp_customize->add_setting(
			'onepress_map_type',
			array(
				'sanitize_callback' => 'onepress_sanitize_select',
				'default'           => 'custom',
			)
		);

		$wp_customize->add_control(
			'onepress_map_type',
			array(
				'label'   => esc_html__( 'Map Type', 'onepress-plus' ),
				'section' => 'onepress_map_settings',
				'type'    => 'select',
				'choices' => array(
					'custom' => __( 'Custom map layout', 'onepress-plus' ),
					'embed' => __( 'Embed map', 'onepress-plus' ),
				),
			)
		);

		$wp_customize->add_setting(
			'onepress_map_embed',
			array(
				'sanitize_callback' => 'onepress_sanitize_map_embed',
				'default'           => '',
			)
		);

		$wp_customize->add_control(
			'onepress_map_embed',
			array(
				'label'           => esc_html__( 'Map embed code', 'onepress-plus' ),
				'section'         => 'onepress_map_settings',
				'type'            => 'textarea',
				/* translators: %s: example iframe attributes */
				'description'     => sprintf( __( 'Paste the full embed code from Google Maps (Share → Embed a map), e.g. an %s tag pointing to google.com/maps/embed.', 'onepress-plus' ), '<code>iframe</code>' ),
				'input_attrs'     => array(
					'class' => 'widefat code',
					'rows'  => 6,
				),
				'active_callback' => array( $this, 'map_type_is_embed' ),
			)
		);



		// Map api key code
		$wp_customize->add_setting(
			'onepress_map_api_key',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			'onepress_map_api_key',
			array(
				'label'             => __( 'Google map api key', 'onepress-plus' ),
				'section'           => 'onepress_map_settings',
				'description'       => __( 'In order to show the Google Maps section, you must enter a validate Google Maps API key, you can get one <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank">here</a>.', 'onepress-plus' ),
				'active_callback'   => array( $this, 'map_type_not_embed' ),
			)
		);

		// Latitude
		$wp_customize->add_setting(
			'onepress_map_lat',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '37.3317115',
			)
		);

		$wp_customize->add_control(
			'onepress_map_lat',
			array(
				'label'             => __( 'Latitude', 'onepress-plus' ),
				'section'           => 'onepress_map_settings',
				'description'       => '',
				'active_callback'   => array( $this, 'map_type_not_embed' ),
			)
		);

		// Longitude
		$wp_customize->add_setting(
			'onepress_map_long',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '-122.0301835',
			)
		);
		$wp_customize->add_control(
			'onepress_map_long',
			array(
				'label'             => __( 'Longitude', 'onepress-plus' ),
				'section'           => 'onepress_map_settings',
				'active_callback'   => array( $this, 'map_type_not_embed' ),
			)
		);

		// OnePress_Misc_Control

		$wp_customize->add_setting(
			'onepress_map_message',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			new OnePress_Misc_Control(
				$wp_customize,
				'onepress_map_message',
				array(
					'label'             => __( 'Longitude', 'onepress-plus' ),
					'type'              => 'custom_message',
					'section'           => 'onepress_map_settings',
					'description'       => sprintf( __( 'Find your Latitude, Longitude <a target="_blank" href="%1$s">Here</a>', 'onepress-plus' ), 'http://www.mapcoordinates.net/en' ),
					'active_callback'   => array( $this, 'map_type_not_embed' ),
				)
			)
		);

		// Address
		$wp_customize->add_setting(
			'onepress_map_address',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => __( '<strong>1 Infinite Loop Cupertino <br/> CA 95014  United States</strong>', 'onepress-plus' ),
			)
		);

		$wp_customize->add_control(
			new OnePress_Editor_Custom_Control(
				$wp_customize,
				'onepress_map_address',
				array(
					'label'             => __( 'Address', 'onepress-plus' ),
					'section'           => 'onepress_map_settings',
					'active_callback'   => array( $this, 'map_type_not_embed' ),
				)
			)
		);

		// Extra Info
		$wp_customize->add_setting(
			'onepress_map_html',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => __( '<p>Your address description goes here.</p>', 'onepress-plus' ),
			)
		);
		$wp_customize->add_control(
			new OnePress_Editor_Custom_Control(
				$wp_customize,
				'onepress_map_html',
				array(
					'label'             => __( 'Extra Info', 'onepress-plus' ),
					'section'           => 'onepress_map_settings',
					'description'       => __( 'The HTML code that display on info window when you click to marker', 'onepress-plus' ),
					'active_callback'   => array( $this, 'map_type_not_embed' ),
				)
			)
		);

		$wp_customize->add_setting(
			'onepress_map_items_address',
			array(
				'default'           => '',
				'sanitize_callback' => 'onepress_sanitize_repeatable_data_field',
				'transport'         => 'refresh', // refresh or postMessage
			)
		);

		$wp_customize->add_control(
			new Onepress_Customize_Repeatable_Control(
				$wp_customize,
				'onepress_map_items_address',
				array(
					'label'             => esc_html__( 'Multiple Address', 'onepress-plus' ),
					'description'       => '',
					'section'           => 'onepress_map_settings',
					'live_title_id'     => 'address', // apply for unput text and textarea only
					'title_format'      => esc_html__( '[live_title]', 'onepress-plus' ), // [live_title]
					'max_item'          => 4, // Maximum item can add
					'active_callback'   => array( $this, 'map_type_not_embed' ),

					'fields'            => array(
						'address' => array(
							'title' => esc_html__( 'Address', 'onepress-plus' ),
							'type'  => 'text',
							'desc'  => '',
						),
						'lat'     => array(
							'title'   => esc_html__( 'Latitude', 'onepress-plus' ),
							'type'    => 'text',
							'default' => '',
						),
						'long'    => array(
							'title'   => esc_html__( 'Longitude', 'onepress-plus' ),
							'type'    => 'text',
							'default' => '',
						),
						'desc'    => array(
							'title'   => esc_html__( 'Extra info', 'onepress-plus' ),
							'type'    => 'textarea',
							'default' => '',
						),

						'maker'   => array(
							'title'   => esc_html__( 'Marker', 'onepress-plus' ),
							'type'    => 'media',
							'default' => '',
						),

					),

				)
			)
		);

		// -------------------------

		// Color
		$wp_customize->add_setting(
			'onepress_map_color',
			array(
				'sanitize_callback' => function_exists( 'onepress_sanitize_color_alpha' ) ? 'onepress_sanitize_color_alpha' : 'sanitize_hex_color',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			new WP_Customize_Color_Control(
				$wp_customize,
				'onepress_map_color',
				array(
					'label'             => __( 'Map Color', 'onepress-plus' ),
					'section'           => 'onepress_map_settings',
					'description'       => '',
					'active_callback'   => array( $this, 'map_type_not_embed' ),
				)
			)
		);

		// Maker
		$wp_customize->add_setting(
			'onepress_map_maker',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => ONEPRESS_PLUS_URL . 'build/images/map-marker.png',
			)
		);
		$wp_customize->add_control(
			new WP_Customize_Image_Control(
				$wp_customize,
				'onepress_map_maker',
				array(
					'label'             => __( 'Map Marker', 'onepress-plus' ),
					'section'           => 'onepress_map_settings',
					'description'       => __( 'Size no larger than 80x80px', 'onepress-plus' ),
					'active_callback'   => array( $this, 'map_type_not_embed' ),
				)
			)
		);

		// Height
		$wp_customize->add_setting(
			'onepress_map_zoom',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '10',
			)
		);

		$wp_customize->add_control(
			'onepress_map_zoom',
			array(
				'label'             => __( 'Map Zoom', 'onepress-plus' ),
				'section'           => 'onepress_map_settings',
				'description'       => __( 'Map Zoom, default 10', 'onepress-plus' ),
				'active_callback'   => array( $this, 'map_type_not_embed' ),
			)
		);

		// Height
		$wp_customize->add_setting(
			'onepress_map_height',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);

		$wp_customize->add_control(
			'onepress_map_height',
			array(
				'label'             => __( 'Map Height', 'onepress-plus' ),
				'section'           => 'onepress_map_settings',
				'description'       => '',
				'active_callback'   => array( $this, 'map_type_not_embed' ),
			)
		);

		// Scroll wheel
		$wp_customize->add_setting(
			'onepress_map_scrollwheel',
			array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			'onepress_map_scrollwheel',
			array(
				'type'              => 'checkbox',
				'label'             => __( 'Enable Scrollwheel', 'onepress-plus' ),
				'section'           => 'onepress_map_settings',
				'description'       => esc_html__( 'Check this box to enable mouse scroll wheel.', 'onepress-plus' ),
				'active_callback'   => array( $this, 'map_type_not_embed' ),
			)
		);

		// Default open map info.
		$wp_customize->add_setting(
			'onepress_map_info_default_open',
			array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			'onepress_map_info_default_open',
			array(
				'type'              => 'checkbox',
				'label'             => __( 'Enable Default Open Box Info', 'onepress-plus' ),
				'section'           => 'onepress_map_settings',
				'description'       => esc_html__( 'Check this box to enable default open box info instead of click to map maker.', 'onepress-plus' ),
				'active_callback'   => array( $this, 'map_type_not_embed' ),
			)
		);

		// EN Add map
	}
}

Onepress_Customize::get_instance()->add_section( 'map', 'Onepress_Section_Map' );
