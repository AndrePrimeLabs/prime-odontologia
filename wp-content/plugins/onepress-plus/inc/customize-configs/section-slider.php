<?php
class Onepress_Section_Slider extends Onepress_Section_Base {
	public $id = 'slider';

	function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'add_scripts' ) );
		add_filter( 'body_class', array( $this, 'body_class' ) );
		add_filter( 'onepress_custom_css', array( $this, 'custom_css' ), 155 );

		add_filter( 'onepress_selective_refresh_css_settings', array( $this, 'selective_refresh' ), 200 );

		$this->set_default_state();
	}

	/**
	 * Set Slider disable by default
	 */
	function set_default_state() {
		$key = 'onepress_sections_settings';
		$settings = get_option( $key );
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		if ( ! isset( $settings['slider'] ) ) {
			$settings['slider'] = '';
			update_option( $key, $settings );
		}

	}

	function selective_refresh( $settings ) {
		$settings[] = "onepress_{$this->id}_nav_bg";
		$settings[] = "onepress_{$this->id}_nav_bg_hover";
		$settings[] = "onepress_{$this->id}_nav_color";
		$settings[] = "onepress_{$this->id}_nav_color_hover";
		$settings[] = "onepress_{$this->id}_nav_dots_bg";
		$settings[] = "onepress_{$this->id}_nav_dots_bg_active";
		$settings[] = "onepress_{$this->id}_title_color";
		$settings[] = "onepress_{$this->id}_desc_color";
		$settings[] = "onepress_{$this->id}_overlay_color";

		return $settings;
	}

	function custom_css( $css ) {
		$data = $this->get_settings( 'onepress_' . $this->id . '_' );
		$data['overlay_color'] = onepress_sanitize_color_alpha( $data['overlay_color'] );
		if ( $data['id'] ) {
			$id = '#' . $data['id'];
		}

		if ( $data['overlay_color'] ) {
			$css .= "{$id} .section-op-slider .item:before {background: {$data['overlay_color']};} ";
		}

		if ( $data['slidePdTop'] || $data['slidePdBottom'] ) {
			$padding = "{$id} .section-op-slider .item--content";
			$code = '';
			if ( $data['slidePdTop'] ) {
				$code .= 'padding-top: ' . absint( $data['slidePdTop'] ) . '%;';
			}
			if ( $data['slidePdBottom'] ) {
				$code .= 'padding-bottom: ' . absint( $data['slidePdBottom'] ) . '%;';
			}
			if ( $code ) {
				$css .= " $padding { $code } ";
			}
		}

		$nav_css  = '';
		$nav_hover_css  = '';

		if ( $data['nav_bg'] ) {
			$nav_css .= "background: {$data['nav_bg']}; ";
		}
		if ( $data['nav_color'] ) {
			$nav_css .= "color: {$data['nav_color']}; ";
		}

		if ( $data['nav_bg_hover'] ) {
			$nav_hover_css .= "background: {$data['nav_bg_hover']}; ";
		}
		if ( $data['nav_color_hover'] ) {
			$nav_hover_css .= "color: {$data['nav_color_hover']}; ";
		}

		if ( $nav_css ) {
			 $css .= "{$id} .section-op-slider .owl-nav button { {$nav_css} } ";
		}

		if ( $nav_hover_css ) {
			 $css .= "{$id} .section-op-slider .owl-nav button:hover { {$nav_hover_css} } ";
		}

		if ( $data['nav_dots_bg'] ) {
			$css .= "{$id} .section-op-slider.owl-theme .owl-dots .owl-dot span{ background: {$data['nav_dots_bg']}; } ";
		}

		if ( $data['nav_dots_bg_active'] ) {
			$css .= "{$id} .section-op-slider.owl-theme .owl-dots .owl-dot.active span{ background: {$data['nav_dots_bg_active']}; } ";
		}

		if ( $data['title_color'] ) {
			$css .= "{$id} .section-op-slider .item--content .item--title{ color: {$data['title_color']}; } ";
		}

		if ( $data['desc_color'] ) {
			$css .= "{$id} .section-op-slider .item--content .item--desc p{ color: {$data['desc_color']}; } ";
		}

		return $css;
	}

	function body_class( $classes ) {

		$disable_sticky_header = get_theme_mod( 'onepress_sticky_header_disable' );
		if ( ! $disable_sticky_header ) {
			$classes[] = 'site-header-sticky';
		}

		$transparent = get_theme_mod( 'onepress_header_transparent' );
		if ( $transparent ) {
			$classes[] = 'site-header-transparent';
		}

		return $classes;
	}

	function add_scripts() {
		wp_enqueue_script( 'onepress-gallery-carousel', get_template_directory_uri() . '/assets/js/owl.carousel.min.js', array( 'jquery' ), '', true );

		$slider_asset_file = ONEPRESS_PLUS_PATH . 'build/js/slider.asset.php';
		$slider_dependencies = array();
		$slider_version = ONEPRESS_PLUS_VERSION;

		if ( is_readable( $slider_asset_file ) ) {
			$slider_asset = require $slider_asset_file;

			if ( is_array( $slider_asset ) ) {
				if ( isset( $slider_asset['dependencies'] ) && is_array( $slider_asset['dependencies'] ) ) {
					$slider_dependencies = $slider_asset['dependencies'];
				}

				if ( ! empty( $slider_asset['version'] ) ) {
					$slider_version = $slider_asset['version'];
				}
			}
		}

		wp_enqueue_script(
			'onepress-plus-slider',
			ONEPRESS_PLUS_URL . 'build/js/slider.js',
			array_merge( array( 'jquery', 'onepress-gallery-carousel' ), $slider_dependencies ),
			$slider_version,
			true
		);
	}

	function get_info() {
		return array(
			'label' => __( 'Section: Slider', 'onepress-plus' ),
			'title' => '',
			'default' => false,
			'inverse' => false,
		);
	}

	function template( $id = false ) {
		$this->set_id( $id );
		$data = $this->get_settings( 'onepress_' . $this->id . '_' );
		$this->load_template( 'section-parts/section-slider.php', $data );
	}

	function customize_settings() {
		$settings = array();
		if ( ! class_exists( 'OnePress_Misc_Control' ) && class_exists( 'WP_Customize_Control' ) ) {
			require_once get_template_directory() . '/inc/customize-controls/control-misc.php';
		}

		$settings['section_{id}'] = array(
			'type' => 'panel',
			'priority'        => 130,
			'title'           => __( 'Section: Slider', 'onepress-plus' ),
			'description'     => '',
			'active_callback' => 'onepress_showon_frontpage',
		);

		$settings['section_{id}_settings'] = array(
			'type' => 'section',
			'panel' => 'section_{id}',
			'priority'        => 10,
			'title'           => __( 'Settings', 'onepress-plus' ),
			'description'     => '',
		);

		$settings['onepress_{id}_id'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'slider',
			),
			'control'       => array(
				'label'         => __( 'Section ID', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_h1'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			),
			'control_class' => 'OnePress_Misc_Control',
			'control'       => array(
				'label'         => __( 'General', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'heading',

			),
		);

		$settings['onepress_{id}_fullscreen'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => '',
			),
			'control'       => array(
				'label'         => __( 'Full screen.', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_loop'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 1,
			),
			'control'       => array(
				'label'         => __( 'Infinity loop.', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_autoplay'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 1,
			),
			'control'       => array(
				'label'         => __( 'Auto Play', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_autoplayHoverPause'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 1,
			),
			'control'       => array(
				'label'         => __( 'Pause on mouse hover.', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_autoHeight'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => '',
			),
			'control'       => array(
				'label'         => __( 'Auto Height', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_mouseDrag'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 1,
			),
			'control'       => array(
				'label'         => __( 'Mouse drag enabled.', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_touchDrag'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 1,
			),
			'control'       => array(
				'label'         => __( 'Touch drag enabled.', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_rewind'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 1,
			),
			'control'       => array(
				'label'         => __( 'Go backwards when the boundary has reached.', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_h_nav'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			),
			'control_class' => 'OnePress_Misc_Control',
			'control'       => array(
				'label'         => __( 'Next/Prev Navigation', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'heading',

			),
		);

		$settings['onepress_{id}_nav'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 1,
			),
			'control'       => array(
				'label'         => __( 'Show next/prev buttons.', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_nav_show_on_hover'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 0,
			),
			'control'       => array(
				'label'         => __( 'Show on hover only.', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_nav_bg'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_color_alpha',
				'default'           => '',
			),
			'control_class' => 'OnePress_Alpha_Color_Control',
			'control'       => array(
				'label'         => __( 'Background Color', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_nav_bg_hover'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_color_alpha',
				'default'           => '',
			),
			'control_class' => 'OnePress_Alpha_Color_Control',
			'control'       => array(
				'label'         => __( 'Background Hover Color', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_nav_color'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_color_alpha',
				'default'           => '',
			),
			'control_class' => 'OnePress_Alpha_Color_Control',
			'control'       => array(
				'label'         => __( 'Arrow Color', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_nav_color_hover'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_color_alpha',
				'default'           => '',
			),
			'control_class' => 'OnePress_Alpha_Color_Control',
			'control'       => array(
				'label'         => __( 'Arrow Hover Color', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_h_nav_dots'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			),
			'control_class' => 'OnePress_Misc_Control',
			'control'       => array(
				'label'         => __( 'Dots Navigation', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'heading',

			),
		);

		$settings['onepress_{id}_dots'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 1,
			),
			'control'       => array(
				'label'         => __( 'Show dots navigation.', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_dots_show_on_hover'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 0,
			),
			'control'       => array(
				'label'         => __( 'Show on hover only.', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_nav_dots_bg'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_color_alpha',
				'default'           => '',
			),
			'control_class' => 'OnePress_Alpha_Color_Control',
			'control'       => array(
				'label'         => __( 'Color', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_nav_dots_bg_active'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_color_alpha',
				'default'           => '',
			),
			'control_class' => 'OnePress_Alpha_Color_Control',
			'control'       => array(
				'label'         => __( 'Active Color', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_h_pa'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			),
			'control_class' => 'OnePress_Misc_Control',
			'control'       => array(
				'label'         => __( 'Parallax', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'heading',

			),
		);

		$settings['onepress_{id}_parallax'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_checkbox',
				'default'           => 1,
			),
			'control'       => array(
				'label'         => __( 'Enable Parallax', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'checkbox',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_h_ef'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			),
			'control_class' => 'OnePress_Misc_Control',
			'control'       => array(
				'label'         => __( 'Effect', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'heading',

			),
		);

		$animations_css = 'bounce flash pulse rubberBand shake headShake swing tada wobble jello bounceIn bounceInDown bounceInLeft bounceInRight bounceInUp bounceOut bounceOutDown bounceOutLeft bounceOutRight bounceOutUp fadeIn fadeInDown fadeInDownBig fadeInLeft fadeInLeftBig fadeInRight fadeInRightBig fadeInUp fadeInUpBig fadeOut fadeOutDown fadeOutDownBig fadeOutLeft fadeOutLeftBig fadeOutRight fadeOutRightBig fadeOutUp fadeOutUpBig flipInX flipInY flipOutX flipOutY lightSpeedIn lightSpeedOut rotateIn rotateInDownLeft rotateInDownRight rotateInUpLeft rotateInUpRight rotateOut rotateOutDownLeft rotateOutDownRight rotateOutUpLeft rotateOutUpRight hinge rollIn rollOut zoomIn zoomInDown zoomInLeft zoomInRight zoomInUp zoomOut zoomOutDown zoomOutLeft zoomOutRight zoomOutUp slideInDown slideInLeft slideInRight slideInUp slideOutDown slideOutLeft slideOutRight slideOutUp';

		$animations_css = explode( ' ', $animations_css );
		$animations = array(
			'' => __( 'None', 'onepress-plus' ),
		);
		foreach ( $animations_css as $v ) {
			$v = trim( $v );
			if ( $v ) {
				$animations[ $v ] = $v;
			}
		}

		$settings['onepress_{id}_animateIn'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			),
			'control'       => array(
				'label'         => __( 'Animate In Effect', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'select',
				'choices'   => $animations,
			),
		);

		$settings['onepress_{id}_animateOut'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			),
			'control'       => array(
				'label'         => __( 'Animate Out Effect', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'select',
				'choices'   => $animations,
			),
		);

		$settings['onepress_{id}_autoplayTimeout'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '5000',
			),
			'control'       => array(
				'label'         => __( 'Autoplay Interval Timeout', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => __( 'Autoplay interval timeout in millisecond', 'onepress-plus' ),
			),
		);

		$settings['onepress_{id}_autoplaySpeed'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '300',
			),
			'control'       => array(
				'label'         => __( 'Auto Play Speed', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => __( 'Autoplay speed timeout in millisecond', 'onepress-plus' ),
			),
		);

		$settings['onepress_{id}_h_slide'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			),
			'control_class' => 'OnePress_Misc_Control',
			'control'       => array(
				'label'         => __( 'Slide Settings', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'heading',
			),
		);

		$settings['onepress_{id}_slidePdTop'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			),
			'control'       => array(
				'label'         => __( 'Padding Top(%)', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_slidePdBottom'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			),
			'control'       => array(
				'label'         => __( 'Padding Bottom(%)', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_title_color'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_color_alpha',
				'default'           => '',
			),
			'control_class' => 'OnePress_Alpha_Color_Control',
			'control'       => array(
				'label'         => __( 'Title Color', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_desc_color'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_color_alpha',
				'default'           => '',
			),
			'control_class' => 'OnePress_Alpha_Color_Control',
			'control'       => array(
				'label'         => __( 'Content Color', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_overlay_color'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_color_alpha',
				'default'           => '',
			),
			'control_class' => 'OnePress_Alpha_Color_Control',
			'control'       => array(
				'label'         => __( 'Overlay Color', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'description'   => '',
			),
		);

		$settings['onepress_{id}_h_typo'] = array(
			'setting'       => array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			),
			'control_class' => 'OnePress_Misc_Control',
			'control'       => array(
				'label'         => __( 'Typography Settings', 'onepress-plus' ),
				'section'       => 'section_{id}_settings',
				'type'          => 'heading',
			),
		);

		$settings['onepress_{id}_slide_typo_title'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_typography_field',
				'default'           => '',
				'transport'         => 'postMessage',
			),
			'control_class' => 'OnePress_Customize_Typography_Control',
			'control'       => array(
				'label'        => esc_html__( 'Title Typography', 'onepress-plus' ),
				'description'  => esc_html__( 'Select how you want your paragraphs to appear.', 'onepress-plus' ),
				'section'      => 'section_{id}_settings',
				'css_selector' => '.section-{id} .section-op-slider .item--title', // css selector for live view
				'fields'       => array(
					'font-family'     => '',
					// 'color'           => '',
					'font-style'      => '', // italic
					'font-weight'     => '',
					'font-size'       => '',
					'line-height'     => '',
					'letter-spacing'  => '',
					'text-transform'  => '',
					'text-decoration' => '',
				),
			),
		);

		$settings['onepress_{id}_slide_typo_content'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_typography_field',
				'default'           => '',
				'transport'         => 'postMessage',
			),
			'control_class' => 'OnePress_Customize_Typography_Control',
			'control'       => array(
				'label'        => esc_html__( 'Content Typography', 'onepress-plus' ),
				'description'  => esc_html__( 'Select how you want your paragraphs to appear.', 'onepress-plus' ),
				'section'      => 'section_{id}_settings',
				'css_selector' => '.section-{id} .section-op-slider .item--desc', // CSS selector for live view.
				'fields'       => array(
					'font-family'     => '',
					// 'color'           => '',
					'font-style'      => '', // italic.
					'font-weight'     => '',
					'font-size'       => '',
					'line-height'     => '',
					'letter-spacing'  => '',
					'text-transform'  => '',
					'text-decoration' => '',
				),
			),
		);

		$settings['section_{id}_content'] = array(
			'type' => 'section',
			'panel' => 'section_{id}',
			'priority'        => 10,
			'title'           => __( 'Content', 'onepress-plus' ),
			'description'     => '',
		);

		$settings['onepress_{id}_slides'] = array(
			'setting'       => array(
				'sanitize_callback' => 'onepress_sanitize_repeatable_data_field',
				'default'           => array(
					array(
						'media' => array(
							'url' => ONEPRESS_PLUS_URL . 'build/images/slider-1.jpg',
							'id' => '',
						),
						'title' => __( 'Slider Title #1', 'onepress-plus' ),
						'content' => __( 'Place a short tagline here and large welcome message like above.<br/>Unlimited slides and parallax effect.', 'onepress-plus' ),
						'alignment' => 'center',

						'btn_2_label' => __( 'Button', 'onepress-plus' ),
						'btn_2_link' => '#',
						'btn_2_button' => 'btn-secondary-outline',

					),
					array(
						'media' => array(
							'url' => ONEPRESS_PLUS_URL . 'build/images/slider-2.jpg',
							'id' => '',
						),
						'title' => __( 'Slider Title #2', 'onepress-plus' ),
						'content' => __( 'Morbi tempus porta nunc pharetra quisque ligula imperdiet posuere<br/>vitae felis proin sagittis leo ac tellus blandit sollicitudin quisque vitae placerat.', 'onepress-plus' ),
						'alignment' => 'center',
						'btn_1_label' => __( 'Button', 'onepress-plus' ),
						'btn_1_link' => '#',
						'btn_1_button' => 'btn-theme-primary',
					),
				),
			),
			'control_class' => 'Onepress_Customize_Repeatable_Control',
			'control'       => array(
				'label'        => esc_html__( 'Slides', 'onepress-plus' ),
				'description'  => '',
				'section'      => 'section_{id}_content',
				'live_title_id' => 'title',
				'title_format' => esc_html__( '[live_title]', 'onepress-plus' ), // [live_title]
				'max_item'     => 4, // Maximum item can add
				'fields'       => array(
					'media' => array(
						'title' => esc_html__( 'Background media', 'onepress-plus' ),
						'type'  => 'media',
						'desc'  => '',
					),

					'title'    => array(
						'title' => esc_html__( 'Title', 'onepress-plus' ),
						'type'  => 'text',
						'desc'  => '',
					),

					'content'    => array(
						'title' => esc_html__( 'Content', 'onepress-plus' ),
						'type'  => 'editor',
						'desc'  => '',
					),

					'alignment'    => array(
						'title' => esc_html__( 'Alignment', 'onepress-plus' ),
						'type'    => 'select',
						'default'   => 'center',
						'options' => array(
							'center' => esc_html__( 'Center', 'onepress-plus' ),
							'left' => esc_html__( 'Left', 'onepress-plus' ),
							'right' => esc_html__( 'Right ', 'onepress-plus' ),
						),
					),

					'btn_1_label'    => array(
						'title'   => esc_html__( 'Button #1 label', 'onepress-plus' ),
						'type'    => 'text',
						'desc'    => '',
						'default' => esc_html__( 'Click Me!', 'onepress-plus' ),
					),
					'btn_1_link'     => array(
						'title'   => esc_html__( 'Button #1 Link', 'onepress-plus' ),
						'type'    => 'text',
						'desc'    => '',
						'default' => '#',
					),

					'btn_1_button'   => array(
						'title'   => esc_html__( 'Button #1 style', 'onepress-plus' ),
						'type'    => 'select',
						'options' => array(
							'btn-theme-primary' => esc_html__( 'Theme default', 'onepress-plus' ),
							'btn-default'       => esc_html__( 'Button', 'onepress-plus' ),
							'btn-primary'       => esc_html__( 'Primary', 'onepress-plus' ),
							'btn-success'       => esc_html__( 'Success', 'onepress-plus' ),
							'btn-info'          => esc_html__( 'Info', 'onepress-plus' ),
							'btn-warning'       => esc_html__( 'Warning', 'onepress-plus' ),
							'btn-danger'        => esc_html__( 'Danger', 'onepress-plus' ),
							'btn-secondary-outline'        => esc_html__( 'Outline', 'onepress-plus' ),
						),
					),

					'btn_2_label'    => array(
						'title'   => esc_html__( 'Button #2 label', 'onepress-plus' ),
						'type'    => 'text',
						'desc'    => '',
						'default' => '',
					),
					'btn_2_link'     => array(
						'title'   => esc_html__( 'Button #2 Link', 'onepress-plus' ),
						'type'    => 'text',
						'desc'    => '',
						'default' => '#',
					),

					'btn_2_button'   => array(
						'title'   => esc_html__( 'Button #2 style', 'onepress-plus' ),
						'type'    => 'select',
						'default'    => 'btn-secondary-outline',
						'options' => array(
							'btn-theme-primary' => esc_html__( 'Theme default', 'onepress-plus' ),
							'btn-default'       => esc_html__( 'Button', 'onepress-plus' ),
							'btn-primary'       => esc_html__( 'Primary', 'onepress-plus' ),
							'btn-success'       => esc_html__( 'Success', 'onepress-plus' ),
							'btn-info'          => esc_html__( 'Info', 'onepress-plus' ),
							'btn-warning'       => esc_html__( 'Warning', 'onepress-plus' ),
							'btn-danger'        => esc_html__( 'Danger', 'onepress-plus' ),
							'btn-secondary-outline'        => esc_html__( 'Outline', 'onepress-plus' ),
						),
					),

				),
			),
		);

		return $settings;
	}

}

Onepress_Customize::get_instance()->add_section( 'slider', 'Onepress_Section_Slider' );
