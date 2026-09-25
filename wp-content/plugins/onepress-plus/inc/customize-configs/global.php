<?php
class Onepress_Plus_Customize_Global
{
	/**
	 * @param WP_Customize_Manager $wp_customize 
	 */
	function wp_customize($wp_customize)
	{
		// Theme Global
		// Copyright text option.
		$wp_customize->add_setting(
			'onepress_footer_copyright_text',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'default'           => sprintf(esc_html__('Copyright %1$s %2$s %3$s', 'onepress-plus'), '&copy;', esc_attr(date('Y')), esc_attr(get_bloginfo())),
			)
		);

		$wp_customize->add_control(
			new OnePress_Editor_Custom_Control(
				$wp_customize,
				'onepress_footer_copyright_text',
				array(
					'label'       => esc_html__('Footer Copyright', 'onepress-plus'),
					'section'     => 'onepress_footer_copyright',
					'description' => esc_html__('Arbitrary text or HTML.', 'onepress-plus'),
				)
			)
		);

		// Disable theme author link.
		$wp_customize->add_setting(
			'onepress_hide_author_link',
			array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			'onepress_hide_author_link',
			array(
				'type'        => 'checkbox',
				'label'       => esc_html__('Hide theme author link?', 'onepress-plus'),
				'section'     => 'onepress_footer_copyright',
				'description' => esc_html__('Check this box to hide theme author link.', 'onepress-plus'),
			)
		);

		if (! OnePress_Plus::get_instance()->has_theme_support_typeography()) {
			// Typography
			// Register typography control JS template.
			$wp_customize->register_control_type('OnePress_Customize_Typography_Control');

			$wp_customize->add_panel(
				'onepress_typo',
				array(
					'priority' => 25,
					'title'    => esc_html__('Typography', 'onepress-plus'),
				)
			);

			// For P tag.
			$wp_customize->add_section(
				'onepress_typography_section',
				array(
					'panel'    => 'onepress_typo',
					'title'    => esc_html__('Paragraphs', 'onepress-plus'),
					'priority' => 5,
				)
			);

			// Add the `<p>` typography settings.
			// @todo Better sanitize_callback functions.
			$wp_customize->add_setting(
				'onepress_typo_p',
				array(
					'sanitize_callback' => 'onepress_sanitize_typography_field',
					'transport'         => 'postMessage',
				)
			);

			$wp_customize->add_control(
				new OnePress_Customize_Typography_Control(
					$wp_customize,
					'onepress_typo_p',
					array(
						'label'        => esc_html__('Paragraph Typography', 'onepress-plus'),
						'description'  => esc_html__('Select how you want your paragraphs to appear.', 'onepress-plus'),
						'section'      => 'onepress_typography_section',
						'css_selector' => 'body p, body', // css selector for live view.
						'fields'       => array(
							'font-family'     => '',
							'color'           => '',
							'font-style'      => '', // italic.
							'font-weight'     => '',
							'font-size'       => '',
							'line-height'     => '',
							'letter-spacing'  => '',
							'text-transform'  => '',
							'text-decoration' => '',
						),
					)
				)
			);

			// For Menu.
			$wp_customize->add_section(
				'onepress_typo_menu_section',
				array(
					'panel'    => 'onepress_typo',
					'title'    => esc_html__('Menu', 'onepress-plus'),
					'priority' => 5,
				)
			);

			// Add the menu typography settings.
			// Site title font.
			$wp_customize->add_setting(
				'onepress_typo_site_title',
				array(
					'sanitize_callback' => 'onepress_sanitize_typography_field',
					'transport'         => 'postMessage',
					'priority'          => 100,
				)
			);

			$wp_customize->add_control(
				new OnePress_Customize_Typography_Control(
					$wp_customize,
					'onepress_typo_site_title',
					array(
						'label'        => esc_html__('Site title Typography', 'onepress-plus'),
						'description'  => esc_html__('Select how you want your site to appear.', 'onepress-plus'),
						'section'      => 'title_tagline',
						'css_selector' => '#page .site-branding .site-title, #page .site-branding .site-text-logo',
						// css selector for live view.
						'fields'       => array(
							'font-family' => '',
							'font-style'  => '', // italic.
							'font-weight' => '',
						),
					)
				)
			);

			// Site tagline font.
			$wp_customize->add_setting(
				'onepress_typo_site_tagline',
				array(
					'sanitize_callback' => 'onepress_sanitize_typography_field',
					'transport'         => 'postMessage',
					'priority'          => 120,
				)
			);

			$wp_customize->add_control(
				new OnePress_Customize_Typography_Control(
					$wp_customize,
					'onepress_typo_site_tagline',
					array(
						'label'        => esc_html__('Site Tagline Typography', 'onepress-plus'),
						'description'  => esc_html__('Select how you want your site to appear.', 'onepress-plus'),
						'section'      => 'title_tagline',
						'css_selector' => '#page .site-branding .site-description', // css selector for live view.
						'fields'       => array(
							'font-family' => '',
							'font-style'  => '', // italic.
							'font-weight' => '',
							'font-size'   => '',
						),
					)
				)
			);

			// @todo Better sanitize_callback functions.
			$wp_customize->add_setting(
				'onepress_typo_menu',
				array(
					'sanitize_callback' => 'onepress_sanitize_typography_field',
					'transport'         => 'postMessage',
				)
			);

			$wp_customize->add_control(
				new OnePress_Customize_Typography_Control(
					$wp_customize,
					'onepress_typo_menu',
					array(
						'label'        => esc_html__('Menu Typography', 'onepress-plus'),
						'description'  => esc_html__('Select how you want your Menu to appear.', 'onepress-plus'),
						'section'      => 'onepress_typo_menu_section',
						'css_selector' => '.onepress-menu a', // css selector for live view.
						'fields'       => array(
							'font-family'     => '',
							// 'color'           => '',
							'font-style'      => '', // italic.
							'font-weight'     => '',
							'font-size'       => '',
							// 'line-height'     => '',
							'letter-spacing'  => '',
							'text-transform'  => '',
							'text-decoration' => '',
						),
					)
				)
			);

			// For Heading
			$wp_customize->add_section(
				'onepress_typo_heading_section',
				array(
					'panel'    => 'onepress_typo',
					'title'    => esc_html__('Heading', 'onepress-plus'),
					'priority' => 5,
				)
			);

			// Add the menu typography settings.
			// @todo Better sanitize_callback functions.
			$wp_customize->add_setting(
				'onepress_typo_heading',
				array(
					'sanitize_callback' => 'onepress_sanitize_typography_field',
					'transport'         => 'postMessage',
				)
			);

			$wp_customize->add_control(
				new OnePress_Customize_Typography_Control(
					$wp_customize,
					'onepress_typo_heading',
					array(
						'label'        => esc_html__('Heading Typography', 'onepress-plus'),
						'description'  => esc_html__('Select how you want your Heading to appear.', 'onepress-plus'),
						'section'      => 'onepress_typo_heading_section',
						'css_selector' => 'body h1, body h2, body h3, body h4, body h5, body h6',
						// css selector for live view.
						'fields'       => array(
							'font-family'     => '',
							// 'color'           => '',
							// 'font-size'       => false, // italic
							'font-style'      => '', // italic.
							'font-weight'     => '',
							'line-height'     => '',
							'letter-spacing'  => '',
							'text-transform'  => '',
							'text-decoration' => '',
						),
					)
				)
			);
			// end typo.
		}


		/**
		 * @since 2.3.6 Option to download google fonts.
		 */




		$wp_customize->register_control_type('OnePress\GoogleFonts\Downloader\Customize_Control');
		// OnePress_Misc_Control
		$wp_customize->add_setting(
			'onepress_gfd_settings',
			array(
				'sanitize_callback' => 'onepress_sanitize_text',
				'transport'         => 'postMessage',
			)
		);
		$wp_customize->add_control(
			new OnePress\GoogleFonts\Downloader\Customize_Control(
				$wp_customize,
				'onepress_gfd_settings',
				array(
					'label'        => esc_html__('Download Google Fonts', 'onepress-plus'),
					'section'      => 'onepress_typo_section',
					'priority'    => 800,
				)
			)
		);
	}
}

Onepress_Customize::get_instance()->add_section('customize_global', 'Onepress_Plus_Customize_Global');
