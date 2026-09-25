<?php

class Onepress_Section_Team extends Onepress_Section_Base {

	/**
	 * @param $wp_customize WP_Customize_Manager
	 */
	function wp_customize( $wp_customize ) {
		// Team member settings
		// Remove theme team
		$wp_customize->remove_setting( 'onepress_team_members' );
		$wp_customize->remove_control( 'onepress_team_members' );


		$wp_customize->add_setting(
			'onepress_team_members',
			array(
				'sanitize_callback' => 'onepress_sanitize_repeatable_data_field',
				'transport'         => 'refresh', // refresh or postMessage
			) );


		$wp_customize->add_control(
			new Onepress_Customize_Repeatable_Control(
				$wp_customize,
				'onepress_team_members',
				array(
					'label'        => esc_html__( 'Team members', 'onepress-plus' ),
					'description'  => '',
					'section'      => 'onepress_team_content',
					//'live_title_id' => 'user_id', // apply for unput text and textarea only
					'title_format' => esc_html__( '[live_title]', 'onepress-plus' ), // [live_title]
					'max_item'     => 4, // Maximum item can add
					'fields'       => array(
						'user_id' => array(
							'title' => esc_html__( 'User media', 'onepress-plus' ),
							'type'  => 'media',
							'desc'  => '',
						),
						'link'    => array(
							'title' => esc_html__( 'Custom Link', 'onepress-plus' ),
							'type'  => 'text',
							'desc'  => '',
						),

						'url'         => array(
							'title' => esc_html__( 'Website', 'onepress-plus' ),
							'type'  => 'text',
							'desc'  => '',
						),
						'facebook'    => array(
							'title' => esc_html__( 'Facebook', 'onepress-plus' ),
							'type'  => 'text',
							'desc'  => '',
						),
						'twitter'     => array(
							'title' => esc_html__( 'Twitter', 'onepress-plus' ),
							'type'  => 'text',
							'desc'  => '',
						),
						'linkedin'    => array(
							'title' => esc_html__( 'linkedin', 'onepress-plus' ),
							'type'  => 'text',
							'desc'  => '',
						),
						'email'       => array(
							'title' => esc_html__( 'Email', 'onepress-plus' ),
							'type'  => 'text',
							'desc'  => '',
						),
					),

				)
			)
		);
		// End section team
	}
}

Onepress_Customize::get_instance()->add_section( 'team', 'Onepress_Section_Team' );