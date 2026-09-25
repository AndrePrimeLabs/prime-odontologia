<?php
class Onepress_Section_Order_Styling {
	/**
	 * @param $wp_customize WP_Customize_Manager
	 */
	function wp_customize( $wp_customize ) {

		// Order and styling
		$wp_customize->add_section( 'onepress_section_order',
			array(
				'priority'        => 125,
				'title'           => esc_html__( 'Section Order & Styling', 'onepress-plus' ),
				'description'     => '',
				'active_callback' => ( function_exists( 'onepress_showon_frontpage' ) ) ? 'onepress_showon_frontpage' : false
			)
		);
		// remove_theme_mod( 'onepress_section_order_styling' );

		$wp_customize->add_setting(
			'onepress_section_order_styling',
			array(
				//'default' => json_encode( $this->get_default_sections_settings() ),
				'sanitize_callback' => 'onepress_sanitize_repeatable_data_field',
				'transport'         => 'refresh', // refresh or postMessage
			) );

		$pages = OnePress_Plus::get_instance()->get_pages();

		$wp_customize->add_control(
			new Onepress_Customize_Repeatable_Control(
				$wp_customize,
				'onepress_section_order_styling',
				array(
					'label'               => esc_html__( 'Section Order & Styling', 'onepress-plus' ),
					'add_text'            => esc_html__( 'Add Section', 'onepress-plus' ),
					'description'         => '',
					'section'             => 'onepress_section_order',
					'live_title_id'       => 'title',
					// apply for unput text and textarea only
					'title_format'        => esc_html__( '[Custom Section]: [live_title]', 'onepress-plus' ),
					// [live_title]
					'changeable'          => 'no',
					// Can Remove, add new button  default yes
					'defined_values'      => OnePress_Plus::get_instance()->get_default_sections_settings(),
					'id_key'              => 'section_id',
					'default_empty_title' => esc_html__( 'Untitled', 'onepress-plus' ),
					// [live_title]
					'fields'              => array(
						'add_by'       => array(
							'type' => 'add_by',
						),
						'__visibility'        => array(
							'title' => '',
							'type'  => 'hidden',
							'desc'  => ''
						),
						'title'        => array(
							'title' => esc_html__( 'Title', 'onepress-plus' ),
							'type'  => 'hidden',
							'desc'  => ''
						),
						'section_id'   => array(
							// Built-in section rows use the registered section
							// key (`slider`, `hero`, etc.) which the theme also
							// hard-codes in section-parts templates — editing
							// would orphan the markup. Custom rows
							// (`add_by === 'click'`) generate a synthetic id at
							// creation time; surface it so the author can read
							// it for anchor links / navigation menus and tweak
							// if needed.
							'title'    => esc_html__( 'Section ID', 'onepress-plus' ),
							'type'     => 'text',
							'desc'     => esc_html__( 'Unique identifier for this custom section. Used for anchor links and inline navigation.', 'onepress-plus' ),
							'required' => array(
								array( 'add_by', '=', 'click' ),
							),
						),
						'show_section' => array(
							'title'   => esc_html__( 'Show this section', 'onepress-plus' ),
							'type'    => 'checkbox',
							'default' => '1',
						),

						'section_inverse' => array(
							'title' => esc_html__( 'Inverted Style', 'onepress-plus' ),
							'desc'  => esc_html__( 'Make this section darker', 'onepress-plus' ),
							'type'  => 'checkbox',
						),

						'section_page_content' => array(
							'title'    => esc_html__( 'Page Content', 'onepress-plus' ),
							'desc'     => esc_html__( 'Use page as content', 'onepress-plus' ),
							'type'     => 'checkbox',
							'required' => array(
								array( 'add_by', '=', 'click' ),
							),
						),

						'section_page_slug' => array(
							'title'    => esc_html__( 'Page', 'onepress-plus' ),
							'type'     => 'select',
							'options'  => $pages,
							'required' => array(
								array( 'add_by', '=', 'click' ),
								array( 'section_page_content', '=', '1' ),
							),
						),

						'hide_title'      => array(
							'title'    => esc_html__( 'Hide section title', 'onepress-plus' ),
							'type'     => 'checkbox',
							'desc'     => '',
							'required' => array(
								array( 'add_by', '=', 'click' ),
								array( 'section_page_content', '!=', '1' ),
							),
						),
						'subtitle'        => array(
							'title'    => esc_html__( 'Subtitle', 'onepress-plus' ),
							'type'     => 'text',
							'required' => array(
								array( 'add_by', '=', 'click' ),
								array( 'section_page_content', '!=', '1' ),
							),
						),
						'desc'            => array(
							'title'    => esc_html__( 'Section Description', 'onepress-plus' ),
							'type'     => 'editor',
							'required' => array(
								array( 'add_by', '=', 'click' ),
								array( 'section_page_content', '!=', '1' ),
							),
						),
						'content'         => array(
							'title'    => esc_html__( 'Section Content', 'onepress-plus' ),
							'type'     => 'editor',
							'required' => array(
								array( 'add_by', '=', 'click' ),
								array( 'section_page_content', '!=', '1' ),
							),
						),
						'bg_type'         => array(
							'title'    => esc_html__( 'Background Type', 'onepress-plus' ),
							'type'     => 'select',
							'options'  => array(
								'color' => esc_html__( 'Color', 'onepress-plus' ),
								'image' => esc_html__( 'Image', 'onepress-plus' ),
								'video' => esc_html__( 'Video', 'onepress-plus' ),
							),
							'required' => array(//array('section_page_content', '!=', '1'),
							),
						),
						'bg_color'        => array(
							'title'    => esc_html__( 'Background Color', 'onepress-plus' ),
							'type'     => 'coloralpha',
							'required' => array(
								array( 'bg_type', '=', 'color' ),
							),
						),
						'bg_image'        => array(
							'title'    => esc_html__( 'Background Image', 'onepress-plus' ),
							'type'     => 'media',
							'required' => array(
								array( 'bg_type', '!=', 'color' ),
							),
						),
						'enable_parallax' => array(
							'title'    => esc_html__( 'Enable Parallax', 'onepress-plus' ),
							'desc'     => esc_html__( 'Required background image and Inverted Style is checked', 'onepress-plus' ),
							'type'     => 'checkbox',
							'required' => array(
								array( 'bg_type', '=', 'image' ),
							),
						),
						'bg_video'        => array(
							'title'    => esc_html__( 'Background video(.MP4)', 'onepress-plus' ),
							'type'     => 'media',
							'media'    => 'video',
							'required' => array(
								array( 'bg_type', '=', 'video' ),
							),
						),
						'bg_video_webm'   => array(
							'title'    => esc_html__( 'Background video(.WEBM)', 'onepress-plus' ),
							'type'     => 'media',
							'media'    => 'video',
							'required' => array(
								array( 'bg_type', '=', 'video' ),
							),
						),
						'bg_video_ogv'    => array(
							'title'    => esc_html__( 'Background video(.OGV)', 'onepress-plus' ),
							'type'     => 'media',
							'media'    => 'video',
							'required' => array(
								array( 'bg_type', '=', 'video' ),
							),
							//'desc' => esc_html__('Select your video background', 'onepress-plus'),
						),

						'bg_opacity_color' => array(
							'title'    => esc_html__( 'Overlay Color', 'onepress-plus' ),
							'type'     => 'coloralpha',
							'required' => array(
								array( 'bg_type', 'in', array( 'video', 'image' ) ),
							),
						),

						'fullwidth' => array(
							'title'   => esc_html__( 'Full width this section', 'onepress-plus' ),
							'type'    => 'checkbox',
							'default' => '',
						),

						'padding_x'    => array(
							'title'    => esc_html__( 'Section Padding Left & Right', 'onepress-plus' ),
							'type'     => 'text',
							'desc'     => esc_html__( 'Eg. 50px, 30%, leave empty for default value', 'onepress-plus' ),
							'required' => array(),
						),

						'padding_top'    => array(
							'title'    => esc_html__( 'Section Padding Top', 'onepress-plus' ),
							'type'     => 'text',
							'desc'     => esc_html__( 'Eg. 50px, 30%, leave empty for default value', 'onepress-plus' ),
							'required' => array(),
						),
						'padding_bottom' => array(
							'title'    => esc_html__( 'Section Padding Bottom', 'onepress-plus' ),
							'type'     => 'text',
							'desc'     => esc_html__( 'Eg. 50px, 30%, leave empty for default value', 'onepress-plus' ),
							'required' => array(),
						),

					),
				)
			)
		);

	}

}


Onepress_Customize::get_instance()->add_section( 'order_and_styling', 'Onepress_Section_Order_Styling' );