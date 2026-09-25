<?php

class Onepress_Section_Projects extends Onepress_Section_Base {
	function get_info() {
		return array(
			'label' => __( 'Section: Projects', 'onepress-plus' ),
			'title' => __( 'Highlight Projects', 'onepress-plus' ),
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
		  Section: Project
		/*------------------------------------------------------------------------*/
		$wp_customize->add_panel(
			'onepress_projects',
			array(
				'priority'        => 200,
				'title'           => __( 'Section: Projects', 'onepress-plus' ),
				'description'     => '',
				'active_callback' => 'onepress_showon_frontpage',
			)
		);

		$wp_customize->add_section(
			'onepress_projects_settings',
			array(
				'priority' => 3,
				'title'    => __( 'Section Settings', 'onepress-plus' ),
				'panel'    => 'onepress_projects',
			)
		);

		// Project ID
		$wp_customize->add_setting(
			'onepress_projects_id',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'projects',
			)
		);
		$wp_customize->add_control(
			'onepress_projects_id',
			array(
				'label'       => esc_html__( 'Section ID', 'onepress-plus' ),
				'section'     => 'onepress_projects_settings',
				'description' => '',
			)
		);

		// Project title
		$wp_customize->add_setting(
			'onepress_projects_title',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => esc_html__( 'Highlight Projects', 'onepress-plus' ),
			)
		);
		$wp_customize->add_control(
			'onepress_projects_title',
			array(
				'label'       => esc_html__( 'Section Title', 'onepress-plus' ),
				'section'     => 'onepress_projects_settings',
				'description' => '',
			)
		);

		// Project subtitle
		$wp_customize->add_setting(
			'onepress_projects_subtitle',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => esc_html__( 'Some of our works', 'onepress-plus' ),
			)
		);
		$wp_customize->add_control(
			'onepress_projects_subtitle',
			array(
				'label'       => esc_html__( 'Section subtitle', 'onepress-plus' ),
				'section'     => 'onepress_projects_settings',
				'description' => '',
			)
		);

		// Description
		$wp_customize->add_setting(
			'onepress_projects_desc',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			new OnePress_Editor_Custom_Control(
				$wp_customize,
				'onepress_projects_desc',
				array(
					'label'       => esc_html__( 'Section Description', 'onepress-plus' ),
					'section'     => 'onepress_projects_settings',
					'description' => '',
				)
			)
		);

		// Number projects to show
		$wp_customize->add_setting(
			'onepress_projects_number',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '6',
			)
		);
		$wp_customize->add_control(
			'onepress_projects_number',
			array(
				'label'       => esc_html__( 'Number projects to show', 'onepress-plus' ),
				'section'     => 'onepress_projects_settings',
				'description' => '',
			)
		);

		// Project Layout
		$wp_customize->add_setting(
			'onepress_projects_layout',
			array(
				'sanitize_callback' => 'onepress_sanitize_select',
				'default'           => '3',
			)
		);

		$wp_customize->add_control(
			'onepress_projects_layout',
			array(
				'label'   => esc_html__( 'Layout', 'onepress-plus' ),
				'section' => 'onepress_projects_settings',
				'type'    => 'select',
				'choices' => array(
					'4' => __( '4 Columns', 'onepress-plus' ),
					'3' => __( '3 Columns', 'onepress-plus' ),
					'2' => __( '2 Columns', 'onepress-plus' ),
					'1' => __( '1 Column', 'onepress-plus' ),
				),
			)
		);

		// Project order by
		$wp_customize->add_setting(
			'onepress_projects_orderby',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'ID',
			)
		);

		$wp_customize->add_control(
			'onepress_projects_orderby',
			array(
				'label'       => esc_html__( 'Order By', 'onepress-plus' ),
				'section'     => 'onepress_projects_settings',
				'description' => '',
				'type'        => 'select',
				'choices'     => array(
					'ID'    => __( 'ID', 'onepress-plus' ),
					'title' => __( 'Title', 'onepress-plus' ),
					'date'  => __( 'Date', 'onepress-plus' ),
					'rand'  => __( 'Random', 'onepress-plus' ),
				),
			)
		);

		// Project order
		$wp_customize->add_setting(
			'onepress_projects_order',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'DESC',
			)
		);

		$wp_customize->add_control(
			'onepress_projects_order',
			array(
				'label'       => esc_html__( 'Order', 'onepress-plus' ),
				'section'     => 'onepress_projects_settings',
				'description' => '',
				'type'        => 'select',
				'choices'     => array(
					'DESC' => __( 'Descending', 'onepress-plus' ),
					'ASC'  => __( 'Ascending', 'onepress-plus' ),
				),
			)
		);

		// Project slug
		$wp_customize->add_setting(
			'onepress_project_slug',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'portfolio',
			)
		);
		$wp_customize->add_control(
			'onepress_project_slug',
			array(
				'label'       => __( 'Project slug', 'onepress-plus' ),
				'section'     => 'onepress_projects_settings',
				'description' => __( 'If you change this option please go to Settings > Permalinks and refresh your permalink structure before your custom post type will show the correct structure.', 'onepress-plus' ),
			)
		);

		// Ajax view projects
		$wp_customize->add_setting(
			'onepress_project_ajax',
			array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 0,
			)
		);
		$wp_customize->add_control(
			'onepress_project_ajax',
			array(
				'type'    => 'checkbox',
				'label'   => esc_html__( 'Use ajax for load project details', 'onepress-plus' ),
				'section' => 'onepress_projects_settings',
			)
		);

		// Projects more URL
		$wp_customize->add_setting(
			'onepress_project_url',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			'onepress_project_url',
			array(
				'label'   => __( 'More Projects URL', 'onepress-plus' ),
				'section' => 'onepress_projects_settings',
			)
		);

		// Projects more text
		$wp_customize->add_setting(
			'onepress_project_more_txt',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => __( 'View All', 'onepress-plus' ),
			)
		);
		$wp_customize->add_control(
			'onepress_project_more_txt',
			array(
				'label'   => __( 'More Projects Text', 'onepress-plus' ),
				'section' => 'onepress_projects_settings',
			)
		);

		// Add settings number portfolios on template-portfolios.
		$wp_customize->add_setting(
			'onepress_template_portfolios_number',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '15',
			)
		);
		$wp_customize->add_control(
			'onepress_template_portfolios_number',
			array(
				'label'       => esc_html__( 'Number projects to show in projects page template', 'onepress-plus' ),
				'section'     => 'onepress_projects_settings',
				'description' => '',
			)
		);
	}
}

Onepress_Customize::get_instance()->add_section( 'projects', 'Onepress_Section_Projects' );

