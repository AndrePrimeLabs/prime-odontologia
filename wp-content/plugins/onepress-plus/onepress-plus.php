<?php
/*
Plugin Name: OnePress Plus
Plugin URI: http://www.famethemes.com/
Description: The OnePress Plus plugin adds powerful premium features to OnePress theme.
Author: famethemes
Author URI:  http://www.famethemes.com/
Version: 2.3.18
Text Domain: onepress-plus
License: GPL version 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
*/

define( 'ONEPRESS_PLUS_URL', trailingslashit( plugins_url( '', __FILE__ ) ) );
define( 'ONEPRESS_PLUS_PATH', trailingslashit( plugin_dir_path( __FILE__ ) ) );


/**
 * Class OnePress_Plus
 */
class OnePress_Plus {


	/**
	 * Cache section settings
	 *
	 * @var array
	 */
	public $section_settings = array();

	/**
	 * Custom CSS code
	 *
	 * @var string
	 */
	public $custom_css = '';

	/**
	 * Whether int_setup() finished this request (avoids running it twice when custom_css is legitimately empty).
	 *
	 * @var bool
	 */
	public $int_setup_has_run = false;

	/**
	 * Onepress version
	 *
	 * @var string Theme version.
	 * @since 2.0.5
	 */
	static $theme_version;
	
	/**
	 * Onepress theme
	 *
	 * @var string Theme version.
	 * @since 2.3.6
	 */
	static $theme;

	/**
	 * @var OnePress_Plus null
	 */
	static $_instance = null;

	function __construct() {
		$this->init();
	}

	/**
	 * Get instance
	 *
	 * @since 2.0.7
	 */
	static function get_instance() {
		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self();
		}
		return self::$_instance;
	}

	/**
	 * Init
	 *
	 * @since 2.0.7
	 */
	private function init() {
		load_plugin_textdomain( 'onepress-plus', false, ONEPRESS_PLUS_PATH . 'languages' );

		$theme = wp_get_theme( 'onepress' );

		if ( ! $theme->errors() && $theme->get_template() == 'onepress' ) {
			self::$theme_version = $theme->get( 'Version' );
			if ( version_compare( self::$theme_version, '2.2.0', '<' ) ) {
				add_action( 'admin_notices', array( $this, 'theme_required_notice' ) );
			}
		}

		if ( ! function_exists( 'get_plugin_data' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}
		$plugin_data = get_plugin_data( __FILE__, false, false );
		define( 'ONEPRESS_PLUS_VERSION', $plugin_data['Version'] );

		add_action( 'onepress_frontpage_section_parts', array( $this, 'load_section_parts' ) );
		add_filter( 'onepress_reepeatable_max_item', array( $this, 'unlimited_repeatable_items' ) );
		add_action( 'onepress_customize_after_register', array( $this, 'plugin_customize' ), 40 );
		// Before core wp_enqueue_scripts (wp @10) so section CSS exists when onepress_custom_inline_style runs.
		add_action( 'wp', array( $this, 'int_setup' ), 5 );

		add_filter( 'onepress_custom_css', array( $this, 'custom_css' ), 150 );
		add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts' ), 60 );
		add_action( 'customize_controls_enqueue_scripts', array( $this, 'customizer_scripts' ), 100 );

		if ( version_compare( PHP_VERSION, '5.3.0', '>=' ) ) {
			// Load elementer.
			require_once ONEPRESS_PLUS_PATH . 'inc/vendors/elementor.php';
		}

		if ( ! class_exists( 'simple_html_dom' ) && ! function_exists( 'file_get_html' ) ) {
			require_once ONEPRESS_PLUS_PATH . 'inc/vendors/simple-html-dom/simple_html_dom.php';
		}
		
		require_once ONEPRESS_PLUS_PATH . 'inc/class-proxy.php';
		require_once ONEPRESS_PLUS_PATH . 'inc/sanitize.php';
		require_once ONEPRESS_PLUS_PATH . 'inc/google-fonts-downloader/downloader.php';
		require_once ONEPRESS_PLUS_PATH . 'inc/post-type.php';
		require_once ONEPRESS_PLUS_PATH . 'inc/template-tags.php';

		// Typography support for theme version 2.3.17 or lower
		
		if ( ! $this->has_theme_support_typeography()) {
			require_once ONEPRESS_PLUS_PATH . 'inc/typography/helper.php';
			require_once ONEPRESS_PLUS_PATH . 'inc/typography/auto-apply.php';
		}
		require_once ONEPRESS_PLUS_PATH . 'inc/auto-update/auto-update.php';

		// Customize Sections.
		add_action( 'init', array( $this, 'load_customize' ) );

		require_once ONEPRESS_PLUS_PATH . 'inc/ajax.php';
		/**
		 * @todo Include custom template file
		 */
		add_filter( 'template_include', array( $this, 'template_include' ) );

		/**
		 * @todo add selective refresh
		 */
		add_filter( 'onepress_customizer_partials_selective_refresh_keys', array( $this, 'selective_refresh' ) );

		// Remove Upsell for section settings.
		add_filter( 'onepress_add_upsell_for_section', '__return_false' );

		// Hook to import data.
		add_action( 'ft_demo_import_current_item', array( $this, 'auto_import_id' ), 45 );

		add_action( 'wp', array( $this, 'wp' ) );

		add_filter( 'theme_page_templates', array( $this, 'plugin_templates' ), 35, 3 );

	
	}

	public function has_theme_support_typeography() {
		// Plugin always owns typography. The legacy theme-version gate
		// (< 2.3.18) is retired — the improved typography subsystem
		// (theme.json source, Font Library source, @font-face dedupe,
		// resource hints) is now the canonical implementation regardless
		// of the parent theme version.
		return false;
	}

	function theme_required_notice() {
		?>
		<div class="notice notice-warning is-dismissible" style="display: block !important;">
			<p><?php printf( __( 'Your are using OnePress Plus version %1$s. This plugin required <a href="%2$s">OnePress theme</a> version 2.2.0 or greater to work properly.', 'onepress-plus' ), ONEPRESS_PLUS_VERSION, admin_url( 'themes.php?theme=onepress' ) ); ?></p>
		</div>
		<?php
	}




	function load_customize() {
		require_once ONEPRESS_PLUS_PATH . 'inc/class-customize.php';
		require_once ONEPRESS_PLUS_PATH . 'inc/class-configs.php';

		include_once ONEPRESS_PLUS_PATH . '/inc/class-section-base.php';

		include_once ONEPRESS_PLUS_PATH . '/inc/customize-configs/section-slider.php';
		include_once ONEPRESS_PLUS_PATH . '/inc/customize-configs/global.php';
		include_once ONEPRESS_PLUS_PATH . '/inc/customize-configs/section-order-styling.php';
		include_once ONEPRESS_PLUS_PATH . '/inc/customize-configs/section-hero.php';
		include_once ONEPRESS_PLUS_PATH . '/inc/customize-configs/section-team.php';
		include_once ONEPRESS_PLUS_PATH . '/inc/customize-configs/section-testimonials.php';
		include_once ONEPRESS_PLUS_PATH . '/inc/customize-configs/section-map.php';
		include_once ONEPRESS_PLUS_PATH . '/inc/customize-configs/section-projects.php';
		include_once ONEPRESS_PLUS_PATH . '/inc/customize-configs/section-pricing.php';
		include_once ONEPRESS_PLUS_PATH . '/inc/customize-configs/section-cta.php';
		include_once ONEPRESS_PLUS_PATH . '/inc/customize-configs/section-clients.php';
		include_once ONEPRESS_PLUS_PATH . '/inc/customize-configs/section-gallery.php';

		do_action( 'onerpess_plus_loaded_customize_configs' );

	}

	/**
	 * Add custom template to edit page template
	 *
	 * @param array    $page_templates
	 * @param WP_Theme $WP_Theme
	 * @param WP_Post  $post
	 * @return mixed
	 */
	function plugin_templates( $page_templates, $WP_Theme, $post ) {
		$page_templates['template-portfolios.php'] = esc_html__( 'Projects page', 'onepress-plus' );
		return $page_templates;
	}

	function wp() {
		$gallery_mod_name = 'onepress_gallery_disable';
		add_filter( 'theme_mod_' . $gallery_mod_name, array( $this, 'filter_gallery_disable' ) );
	}

	function filter_gallery_disable( $val ) {
		$sections = $this->get_sections_settings();
		if ( isset( $sections['gallery'] ) ) {
			if ( isset( $sections['gallery']['show_section'] ) && $sections['gallery']['show_section'] == 1 ) {
				$val = false;
			}
		}
		return $val;
	}

	function auto_import_id() {
		return 'onepress-plus';
	}

	/**
	 * Add selective refresh settings
	 *
	 * @param array $settings
	 */
	function selective_refresh( $settings ) {

		$plus_settings = array(
			// + section clients
			array(
				'id'       => 'clients',
				'selector' => '.section-clients',
				'settings' => array(
					'onepress_clients',
					'onepress_clients_title',
					'onepress_clients_subtitle',
					'onepress_clients_layout',
					'onepress_clients_desc',
					'onepress_clients_target',
					'onepress_clients_show_name',
				),
			),

			// + section cta
			array(
				'id'       => 'cta',
				'selector' => '.section-cta',
				'settings' => array(
					'onepress_cta_title',
					'onepress_cta_btn_label',
					'onepress_cta_btn_link',
					'onepress_cta_btn_link_style',
				),
			),

			// + section pricing
			array(
				'id'       => 'pricing',
				'selector' => '.section-pricing',
				'settings' => array(
					'onepress_pricing_plans',
					'onepress_pricing_title',
					'onepress_pricing_subtitle',
					'onepress_pricing_desc',
				),
			),
			// + section projects
			array(
				'id'       => 'projects',
				'selector' => '.section-projects',
				'settings' => array(
					'onepress_projects_title',
					'onepress_projects_subtitle',
					'onepress_projects_desc',
					'onepress_projects_number',
					'onepress_projects_orderby',
					'onepress_projects_order',
					'onepress_projects_layout',
					'onepress_project_url',
					'onepress_project_more_txt',
				),
			),

			// + section testimonials
			array(
				'id'       => 'testimonials',
				'selector' => '.section-testimonials',
				'settings' => array(
					'onepress_testimonial_boxes',
					'onepress_testimonial_title',
					'onepress_testimonial_subtitle',
					'onepress_testimonial_desc',
				),
			),
		);

		$settings = array_merge( $settings, $plus_settings );
		if ( isset( $settings['gallery'] ) ) {
			$settings['gallery']['settings'] = array(
				'onepress_gallery_source',
				'onepress_gallery_title',
				'onepress_gallery_subtitle',
				'onepress_gallery_desc',

				'onepress_gallery_source_page',
				'onepress_gallery_source_flickr',
				'onepress_gallery_api_flickr',
				'onepress_gallery_source_facebook',
				'onepress_gallery_api_facebook',
				'onepress_gallery_layout',
				'onepress_gallery_display',
				'onepress_g_number',
				'onepress_g_row_height',
				'onepress_g_col',

				'onepress_g_readmore_link',
				'onepress_g_readmore_text',
			);
		}

		return $settings;
	}

	/**
	 * Load plugin template
	 *
	 * @param string $template
	 * @return bool|string
	 */
	function template_include( $template ) {
		global $post;

		if ( is_page() || is_tax( 'portfolio_cat' ) ) {
			if ( is_tax( 'portfolio_cat' ) ) {
				$tpl = 'template-portfolios.php';
			} else {
				$tpl = get_page_template_slug();
			}

			if ( $tpl ) {
				$file = $this->locate_template(
					array(
						$tpl,
						'templates/' . $tpl,
					)
				);

				if ( $file ) {
					$template = $file;
				}
			}
		}

		if ( is_singular( 'portfolio' ) ) {

			$is_child         = STYLESHEETPATH != TEMPLATEPATH;
			$template_names   = array();
			$template_names[] = 'single-portfolio.php';
			$template_names[] = 'portfolio.php';
			$located          = false;

			foreach ( $template_names as $template_name ) {
				if ( ! $template_name ) {
					continue;
				}

				if ( $is_child && file_exists( STYLESHEETPATH . '/' . $template_name ) ) {  // Child theme.
					$located = STYLESHEETPATH . '/' . $template_name;
					break;
				} elseif ( file_exists( ONEPRESS_PLUS_PATH . 'templates/' . $template_name ) ) { // Check part in the plugin.
					$located = ONEPRESS_PLUS_PATH . 'templates/' . $template_name;
					break;
				} elseif ( file_exists( TEMPLATEPATH . '/' . $template_name ) ) { // current theme.
					$located = TEMPLATEPATH . '/' . $template_name;
					break;
				}
			}

			if ( $located ) {
				return $located;
			}
		}
		return $template;
	}


	/**
	 * Remove disable setting section when this plugin active
	 *
	 * @param WP_Customize_Manager $wp_customize
	 */
	function remove_hide_control_sections( $wp_customize ) {

		// $wp_customize->remove_setting( 'onepress_hero_disable' );
		// $wp_customize->remove_control( 'onepress_hero_disable' );
		$wp_customize->remove_setting( 'onepress_features_disable' );
		$wp_customize->remove_control( 'onepress_features_disable' );

		$wp_customize->remove_setting( 'onepress_about_disable' );
		$wp_customize->remove_control( 'onepress_about_disable' );

		$wp_customize->remove_setting( 'onepress_services_disable' );
		$wp_customize->remove_control( 'onepress_services_disable' );

		$wp_customize->remove_setting( 'onepress_counter_disable' );
		$wp_customize->remove_control( 'onepress_counter_disable' );

		$wp_customize->remove_setting( 'onepress_testimonials_disable' );
		$wp_customize->remove_control( 'onepress_testimonials_disable' );

		$wp_customize->remove_setting( 'onepress_team_disable' );
		$wp_customize->remove_control( 'onepress_team_disable' );

		$wp_customize->remove_setting( 'onepress_news_disable' );
		$wp_customize->remove_control( 'onepress_news_disable' );

		$wp_customize->remove_setting( 'onepress_contact_disable' );
		$wp_customize->remove_control( 'onepress_contact_disable' );

		// Remove upsell panel/section
		$wp_customize->remove_setting( 'onepress_order_styling_message' );
		$wp_customize->remove_control( 'onepress_order_styling_message' );

		$wp_customize->remove_setting( 'onepress_videolightbox_image' );
		$wp_customize->remove_control( 'onepress_videolightbox_image' );
		$wp_customize->remove_control( 'onepress_videolightbox_disable' );
		$wp_customize->remove_control( 'onepress_videolightbox_disable' );

		$wp_customize->remove_setting( 'onepress_gallery_disable' );
		$wp_customize->remove_control( 'onepress_gallery_disable' );
		remove_theme_mod( 'onepress_gallery_disable' );

		// Remove hero background media upsell
		$wp_customize->remove_control( 'onepress_hero_videobackground_upsell' );
		$wp_customize->remove_section( 'onepress_order_styling_preview' );
		$wp_customize->remove_section( 'onepress_plus' );
		$wp_customize->remove_section( 'onepress-plus' );

	}

	/**
	 *  Get default sections settings
	 *
	 * @return array
	 */
	function get_default_sections_settings() {
		return apply_filters( 'onepress_get_default_sections_settings', Onepress_Plus_Config::get_instance()->get_order_styling_settings() );
	}

	function get_pages() {
		$_pages   = get_posts(
			array(
				'posts_per_page' => -1,
				'post_type'      => 'page',
				'orderby'        => 'title',
				'order'          => 'asc',
			)
		);
		$pages    = array();
		$new_page = get_option( 'page_for_posts' );
		$home     = get_option( 'page_on_front' );
		foreach ( $_pages as $page ) {
			if ( $new_page != $page->ID && $home != $page->ID ) {
				$pages[ $page->post_name ] = $page->post_title;
			}
		}

		return $pages;
	}


	/**
	 * Add more customize
	 *
	 * @param WP_Customize_Manager $wp_customize
	 */
	function plugin_customize( $wp_customize ) {

		$this->remove_hide_control_sections( $wp_customize );

		include_once ONEPRESS_PLUS_PATH . 'inc/typography/typography.php';

		Onepress_Customize::get_instance()->register_customize_settings( $wp_customize );

	}

	/**
	 * Unlimited repeatable items
	 *
	 * @param int $number
	 * @return int
	 */
	function unlimited_repeatable_items( $number ) {
		return 99999;
	}

	/**
	 * Get section settings data
	 *
	 * @param bool $no_cache
	 * @return array
	 */
	function get_sections_settings( $no_cache = false ) {

		if ( ! $no_cache ) {
			if ( ! empty( $this->section_settings ) ) {
				return $this->section_settings;
			}
		}

		$sections = get_theme_mod( 'onepress_section_order_styling', '' );

		if ( is_string( $sections ) ) {
			$sections = @json_decode( $sections, true );
		}

		if ( ! is_array( $sections ) ) {
			$sections = array();
		}

		if ( empty( $sections ) ) {
			$sections = $this->get_default_sections_settings();
		}

		$this->section_settings = array();

		foreach ( $sections as $k => $v ) {
			if ( ! $v['section_id'] ) {
				$v['section_id'] = sanitize_title( $v['title'] );
			}

			if ( ! $v['section_id'] ) {
				$v['section_id'] = uniqid( 'section-' );
			}

			if ( $v['section_id'] != '' && ( ! isset( $v['add_buy'] ) || $v['add_buy'] != 'click' ) ) {
				$this->section_settings[ $v['section_id'] ] = $v;
			} else {
				$this->section_settings[] = $v;
			}
		}

		$ids = wp_list_pluck( $this->section_settings, 'section_id' );

		$default_sections = $this->get_default_sections_settings();

		foreach ( $default_sections as $s ) {
			if ( isset( $s['section_id'] ) ) {
				if ( ! isset( $ids[ $s['section_id'] ] ) ) {
					$this->section_settings[ $s['section_id'] ] = $s;
				}
			}
		}

		return $this->section_settings;
	}

	/**
	 * Get media from a variable
	 *
	 * @param array $media
	 * @return false|string
	 */
	static function get_media_url( $media = array() ) {
		return onepress_get_media_url( $media );
	}

	/**
	 * Get media ID
	 *
	 * @param array $media
	 * @return int
	 */
	static function get_media_id( $media = array() ) {
		if ( is_numeric( $media ) ) {
			return absint( $media );
		}
		$media = wp_parse_args(
			$media,
			array(
				'url' => '',
				'id'  => '',
			)
		);
		if ( $media['id'] != '' ) {
			return absint( $media['id'] );
		}
		return 0;
	}

	function hex_to_rgb( $colour ) {
		if ( $colour[0] == '#' ) {
			$colour = substr( $colour, 1 );
		}
		if ( strlen( $colour ) == 6 ) {
			list( $r, $g, $b ) = array( $colour[0] . $colour[1], $colour[2] . $colour[3], $colour[4] . $colour[5] );
		} elseif ( strlen( $colour ) == 3 ) {
			list( $r, $g, $b ) = array( $colour[0] . $colour[0], $colour[1] . $colour[1], $colour[2] . $colour[2] );
		} else {
			return false;
		}
		$r = hexdec( $r );
		$g = hexdec( $g );
		$b = hexdec( $b );
		return array(
			'r' => $r,
			'g' => $g,
			'b' => $b,
		);
	}

	function check_hex( $color ) {

		$color = ltrim( $color, '#' );
		if ( '' === $color ) {
			return '';
		}

		// 3 or 6 hex digits, or the empty string.
		if ( preg_match( '|^#([A-Fa-f0-9]{3}){1,2}$|', '#' . $color ) ) {
			return '#' . $color;
		}

		return '';
	}

	function hex_to_rgba( $hex_color, $alpha = 1 ) {
		if ( $this->is_rgb( $hex_color ) ) {
			return $hex_color;
		}
		if ( $hex_color = $this->check_hex( $hex_color ) ) {
			$rgb      = $this->hex_to_rgb( $hex_color );
			$rgb['a'] = $alpha;
			return 'rgba(' . join( ',', $rgb ) . ')';
		} else {
			return '';
		}
	}

	function is_rgb( $color ) {
		return strpos( trim( $color ), 'rgb' ) !== false ? true : false;
	}

	/**
	 * Check to load css, js, and more...
	 */
	function int_setup() {

		remove_action( 'onepress_header_end', 'onepress_load_hero_section' );
		add_action( 'onepress_header_end', array( $this, 'load_hero' ) );

		$this->custom_css = '';

		// Customizer preview must re-read theme mods (e.g. after refresh transport); avoid stale section_settings.
		if ( is_customize_preview() ) {
			$this->get_sections_settings( true );
		} elseif ( empty( $this->section_settings ) ) {
			$this->get_sections_settings();
		}

		$style = array();

		foreach ( $this->section_settings as $section ) {
			$section = wp_parse_args(
				$section,
				array(
					'section_id'       => '',
					'show_section'     => '',
					'bg_color'         => '',
					'bg_type'          => '',
					'bg_opacity'       => '',
					'bg_opacity_color' => '',
					'bg_image'         => '',
					'bg_video'         => '',
					'bg_video_webm'    => '',
					'bg_video_ogv'     => '',
					'enable_parallax'  => '',
					'padding_x'      	 => '',
					'padding_top'      => '',
					'padding_bottom'   => '',
				)
			);

			// Map JS only when section is on in Customizer AND in OnePress Dashboard Section Manager (plus front page where it renders).
			if ( 'map' === $section['section_id'] && $section['show_section'] ) {
				$enqueue_gmap = true;
				if ( class_exists( 'Onepress_Config' ) && ! Onepress_Config::is_section_active( 'map' ) ) {
					$enqueue_gmap = false;
				}
				if ( $enqueue_gmap && ! is_front_page() ) {
					// Still load in Customizer so map preview works when the preview URL is not the front page.
					if ( ! function_exists( 'is_customize_preview' ) || ! is_customize_preview() ) {
						$enqueue_gmap = false;
					}
				}
				// Embed mode uses an iframe only; no Google Maps JavaScript API.
				if ( $enqueue_gmap && 'embed' === get_theme_mod( 'onepress_map_type', 'custom' ) ) {
					$enqueue_gmap = false;
				}
				if ( $enqueue_gmap ) {
					wp_enqueue_script( 'jquery' );
					$key = get_theme_mod( 'onepress_map_api_key' );
					$key = is_string( $key ) ? trim( $key ) : '';
					if ( '' === $key ) {
						$keys = array(
							'AIzaSyASkFdBVeZHxvpMVIOSfk2hGiIzjOzQeFY', // default key
							'AIzaSyAnfok58ud3JBFIFdyHXAybSGP_J17dmSQ',
							'AIzaSyDy6frzySz8BOjvAqBgM7TAH8vooNffUdU',
							'AIzaSyCxdBsZjwOVf45hjUl0xyPy3MB2aC1yx3Q',
							'AIzaSyCNWpkbuCo2hczExjnBbZY69JBZy-uiW_w',
						);
						$key  = $keys[ array_rand( $keys ) ];
					}
					if ( '' !== $key ) {
						$map_api_uri = 'https://maps.googleapis.com/maps/api/js?key=' . rawurlencode( $key );
						wp_enqueue_script( 'gmap', apply_filters( 'google_map_api_url', $map_api_uri ), array( 'jquery' ), '', true );
					}
				}
			}

			if ( $section['padding_top'] != '' ) {
				if ( strpos( $section['padding_top'], '%' ) !== false ) {
					$section['padding_top'] = intval( $section['padding_top'] ) . '%';
				} else {
					$section['padding_top'] = intval( $section['padding_top'] ) . 'px';
				}
				$style[ $section['section_id'] ][] = "padding-top: {$section['padding_top']};";
			}

			if ( $section['padding_bottom'] != '' ) {
				if ( strpos( $section['padding_bottom'], '%' ) !== false ) {
					$section['padding_bottom'] = intval( $section['padding_bottom'] ) . '%';
				} else {
					$section['padding_bottom'] = intval( $section['padding_bottom'] ) . 'px';
				}

				$style[ $section['section_id'] ][] = "padding-bottom: {$section['padding_bottom']};";
			}


			if ( $section['padding_x'] != '' ) {
				if ( strpos( $section['padding_x'], '%' ) !== false ) {
					$section['padding_x'] = intval( $section['padding_x'] ) . '%';
				} else {
					$section['padding_x'] = intval( $section['padding_x'] ) . 'px';
				}
				$style_code = "padding-left: {$section['padding_x']}; padding-right: {$section['padding_x']};";
				$style[ $section['section_id'] . ' .container-fluid' ][] = $style_code;
				$style[ $section['section_id'] . ' .container' ][] = $style_code;
			}

			switch ( $section['bg_type'] ) {

				case 'video':
					// $video_url =  $this->get_media_url( $section['bg_video'] );
					// $video_webm_url =  $this->get_media_url( $section['bg_video_webm'] );
					// $video_ogv_url =  $this->get_media_url( $section['bg_video_ogv'] );
					// $is_video = ( $video_url || $video_webm_url ||  $video_ogv_url ) ;
					if ( $this->is_rgb( $section['bg_opacity_color'] ) ) {
						$bg_opacity_color = $section['bg_opacity_color'];
					} else {
						$bg_opacity_color = $this->hex_to_rgba( $section['bg_opacity_color'], .4 );
					}
					$this->custom_css .= " .section-{$section['section_id']}::before{background-color: {$bg_opacity_color}; } \n ";

					break;

				case 'image':
					if ( $this->is_rgb( $section['bg_opacity_color'] ) ) {
						$bg_opacity_color = $section['bg_opacity_color'];
					} else {
						$bg_opacity_color = $this->hex_to_rgba( $section['bg_opacity_color'], .4 );
					}

					$image = $this->get_media_url( $section['bg_image'] );

					if ( $image && ! $bg_opacity_color ) {
						if ( $bg_opacity_color ) {
							$style[ $section['section_id'] ]['bg'] = "background-color: #{$bg_opacity_color};";
						}
						// check background image and not parallax enable
						if ( $section['enable_parallax'] != 1 && $image ) {
							$style[ $section['section_id'] ][] = "background-image: url(\"{$image}\");";
						}
					} elseif ( $image && $bg_opacity_color ) {
						if ( $image ) {
							$this->custom_css .= ".bgimage-{$section['section_id']} {background-image: url(\"{$image}\");}";
						}

						if ( $bg_opacity_color ) {
							$style[ $section['section_id'] ][] = "background-color: {$bg_opacity_color};";
						}
					}

					if ( $bg_opacity_color ) {
						if ( $section['enable_parallax'] == 1 ) {
							$this->custom_css .= " #parallax-{$section['section_id']} .parallax-bg::before{background-color: {$bg_opacity_color}; } \n ";
						}
					}

					/*
					if ( $image ) {
						if ($section['enable_parallax'] == 1) {
							$this->custom_css .= " #parallax-{$section['section_id']} .parallax-bg::after {background-image: url(\"{$image}\");}";
						}
					}
					*/

					break;

				default:
					if ( $this->is_rgb( $section['bg_color'] ) ) {
						$bg_color = $section['bg_color'];
					} else {
						$bg_color = $this->hex_to_rgba( $section['bg_color'], 1 );
					}
					if ( $bg_color ) {
						$style[ $section['section_id'] ]['bg'] = "background-color: {$bg_color};";
					}
			}
		}

		foreach ( $style as $k => $code ) {
			if ( ! empty( $code ) ) {
				$this->custom_css .= " .section-{$k}{ " . join( ' ', $code ) . " } \n ";
			}
		}

		$this->int_setup_has_run = true;
	}

	/**
	 * Load CSS, JS for frontend.
	 */
	function frontend_scripts() {

		wp_enqueue_style( 'onepress-style' );
		wp_register_style( 'onepress-plus-style', ONEPRESS_PLUS_URL . 'build/css/onepress-plus.css', array( 'onepress-style' ), ONEPRESS_PLUS_VERSION );
		wp_enqueue_style( 'onepress-plus-style' );

		/**
		 * Plugin style.
		 */
		wp_enqueue_script( 'jquery' );

		// For clients.
		wp_enqueue_script( 'onepress-gallery-carousel', get_template_directory_uri() . '/assets/js/owl.carousel.min.js', array(), ONEPRESS_PLUS_VERSION, true );

		$onepress_plus_deps = array( 'jquery', 'onepress-theme' );
		// int_setup() runs on wp @5 (before wp_enqueue_scripts) and enqueues gmap when map section is on.
		if ( wp_script_is( 'gmap', 'enqueued' ) ) {
			$onepress_plus_deps[] = 'gmap';
		}
		// Asset file generated by webpack — provides webpack-tracked deps + content-hash version.
		$onepress_plus_asset = require ONEPRESS_PLUS_PATH . 'build/js/main.asset.php';
		wp_enqueue_script(
			'onepress-plus',
			ONEPRESS_PLUS_URL . 'build/js/main.js',
			array_merge( $onepress_plus_deps, $onepress_plus_asset['dependencies'] ),
			$onepress_plus_asset['version'],
			true
		);
		wp_localize_script(
			'onepress-plus',
			'OnePress_Plus',
			array(
				'ajax_url'        => admin_url( 'admin-ajax.php' ),
				'browser_warning' => esc_html__( ' Your browser does not support the video tag. I suggest you upgrade your browser.', 'onepress-plus' ),
			)
		);
	}

	/**
	 * Load compatibility fixes for controls owned by the parent theme.
	 */
	function customizer_scripts() {
		$asset_file = ONEPRESS_PLUS_PATH . 'build/js/customizer.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset        = require $asset_file;
		$dependencies = array( 'jquery', 'customize-controls' );
		if ( wp_script_is( 'onepress-customizer', 'registered' ) ) {
			$dependencies[] = 'onepress-customizer';
		}

		wp_enqueue_script(
			'onepress-plus-customizer',
			ONEPRESS_PLUS_URL . 'build/js/customizer.js',
			array_unique( array_merge( $dependencies, $asset['dependencies'] ) ),
			$asset['version'],
			true
		);
	}

	/**
	 * Print CSS in header tag.
	 *
	 * @param string $css
	 * @return string
	 */
	function custom_css( $css ) {
		// Selective refresh or unusual hook order may run before wp @5.
		if ( ! $this->int_setup_has_run ) {
			$this->int_setup();
		}

		return $css . $this->custom_css;
	}

	/**
	 * Change onepage section classes
	 *
	 * @param string $class
	 * @param string $section_id
	 * @return array|string
	 */
	function filter_section_class( $class, $section_id ) {

		if ( empty( $this->section_settings ) ) {
			$this->get_sections_settings();
		}

		if ( isset( $this->section_settings[ $section_id ] ) ) {
			$class = explode( ' ', $class );
			if ( isset( $this->section_settings[ $section_id ]['section_inverse'] ) && $this->section_settings[ $section_id ]['section_inverse'] ) {
				if ( ! in_array( 'section-inverse', $class ) ) {
					$class[] = 'section-inverse';
				}
			} else {
				$key = array_search( 'section-inverse', $class );
				if ( false !== $key ) {
					unset( $class[ $key ] );
				}
			}

			$class = join( ' ', $class );
		}

		return $class;
	}

	function load_section_part( $section ) {

		$module_sections = Onepress_Customize::get_instance()->get_sections();

		if ( isset( $module_sections[ $section['section_id'] ] ) ) {

			$object = $module_sections[ $section['section_id'] ];
			if ( method_exists( $object, 'template' ) ) {
				$object->template( $section['section_id'] );
				return;
			}
		}

		$file_name = 'section-parts/section-' . $section['section_id'] . '.php';
		if ( ! $this->locate_template( $file_name, true, false ) ) {
			$section = wp_parse_args(
				$section,
				array(
					'section_id'           => '',
					'subtitle'             => '',
					'title'                => '',
					'content'              => '',
					'hide_title'           => '',
					'fullwidth'            => '',

					'section_page_content' => '',
					'section_page_slug'    => '',
				)
			);

			$class = 'container';
			if ( $section['fullwidth'] ) {
				$class = 'container-fluid';
			}

			$section_classes = 'onepage-section section-meta section-padding';
			if ( $section['section_page_content'] ) {
				$section_classes = 'onepage-section section-page-content';
			}
			?>
			<section id="<?php echo ( '' !== $section['section_id'] ) ? esc_attr( trim( $section['section_id'] ) ) : ''; ?>" <?php do_action( 'onepress_section_atts', $section['section_id'] ); ?> class="<?php echo esc_attr( apply_filters( 'onepress_section_class', 'section-' . $section['section_id'] . ' ' . $section_classes, $section['section_id'] ) ); ?>">
				<?php do_action( 'onepress_section_before_inner', $section['section_id'] ); ?>
				<div class="<?php echo esc_attr( $class ); ?>">
					<?php
					if ( $section['section_page_content'] ) {

						echo do_shortcode( '[onepress_plus_insert_elementor slug="' . esc_attr( $section['section_page_slug'] ) . '"]' );

					} else {
						?>
						<?php if ( $section['subtitle'] || ( ! $section['hide_title'] && $section['title'] ) ) { ?>
							<?php if ( $section['title'] || $section['subtitle'] || $section['desc'] ) { ?>
								<div class="section-title-area">
									<?php
									if ( $section['subtitle'] != '' ) {
										echo '<h5 class="section-subtitle">' . esc_html( $section['subtitle'] ) . '</h5>';}
									?>
									<?php if ( ! $section['hide_title'] ) { ?>
										<?php
										if ( $section['title'] ) {
											echo '<h2 class="section-title">' . esc_html( $section['title'] ) . '</h2>';}
										?>
									<?php } ?>
									<?php
									if ( $section['desc'] ) {
										// echo '<div class="section-desc">' . apply_filters( 'the_content', wp_kses_post( $section['desc'] ) ) . '</div>';
										echo '<div class="section-desc">' . apply_filters( 'the_content', $section['desc'] ) . '</div>';
									}
									?>
								</div>
							<?php } ?>
							<?php
						}
					}
					?>
					<div class="section-content-area custom-section-content"><?php echo apply_filters( 'the_content', wp_kses_post( $section['content'] ) ); ?></div>
				</div>
				<?php do_action( 'onepress_section_after_inner', $section['section_id'] ); ?>
			</section>
			<?php

		}

	}

	function load_hero() {

		// Do nod load section hero if disabled
		if ( class_exists( 'Onepress_Config' ) ) {
			if ( ! Onepress_Config::is_section_active( 'hero' ) ) {
				return;
			}
		}
		/**
		 * Section: Hero
		 */

		/**
		 * Hook before section
		 */
		do_action( 'onepress_before_section_hero' );
		// do_action( 'onepress_before_section_part', 'hero' );
		$this->locate_template( 'section-parts/section-hero.php', true, false );

		/**
		 * Hook after section
		 */
		// do_action('onepress_after_section_part', 'hero' );
		do_action( 'onepress_after_section_hero' );
	}

	/**
	 * Load section parts
	 *
	 * @param $sections
	 */
	function load_section_parts() {

		$sections = $this->get_sections_settings( true );

		if ( is_array( $sections ) ) {
			global $section;
			add_filter( 'onepress_section_class', array( $this, 'filter_section_class' ), 15, 2 );
			foreach ( $sections as $index => $section ) {

				/**
				 * Support OnePres 2.1.1
				 *
				 * Load section of activated only.
				 *
				 * @since 2.0.9
				 */
				$section_activated = true;

				if ( class_exists( 'Onepress_Config' ) ) {
					$section_activated = Onepress_Config::is_section_active( $section['section_id'] );
				}

				if ( $section_activated ) {

					// $GLOBALS['current_section'] = $section;
					$section = wp_parse_args(
						$section,
						array(
							'section_id'      => '',
							'show_section'    => '',
							'fullwidth'       => '',
							'add_buy'         => '',
							'content'         => '',
							'bg_color'        => '',
							'bg_type'         => '',
							'bg_opacity'      => '',
							'bg_image'        => '',
							'bg_video_webm'   => '',
							'bg_video_ogv'    => '',
							'enable_parallax' => '',
						)
					);

					// make sure we not disable from theme template.
					add_filter( 'theme_mod_onepress_' . $section['section_id'] . '_disable', '__return_false', 99 );
					// If disabled section the code this line below will handle this.
					if ( $section['show_section'] ) {
						if ( '' != $section['section_id'] ) {

							$hook_args = array();
							do_action( 'onepress_before_section_' . $section['section_id'] );
							$video_ogv_url = '';
							if ( isset( $section['bg_video_ogv'] ) && ! empty( $section['bg_video_ogv'] ) ) {
								$video_ogv_url = $this->get_media_url( $section['bg_video_ogv'] );
							}

							switch ( $section['bg_type'] ) {

								case 'video':
									$video_url      = $this->get_media_url( $section['bg_video'] );
									$video_webm_url = $this->get_media_url( $section['bg_video_webm'] );
									$image          = $this->get_media_url( $section['bg_image'] );

									/**
									 * Support old version 2.0.4
									 *
									 * @since 2.0.5
									 */
									if ( version_compare( self::$theme_version, '2.0.5', '>=' ) ) {
										$hook_args             = compact( 'video_url', 'video_webm_url', 'video_ogv_url', 'image' );
										$hook_args['_bg_type'] = 'video';
										do_action( 'onepress_before_section_part', $section['section_id'], $hook_args );
										$this->load_section_part( $section );
									} else {
										if ( $video_url || $video_webm_url || $video_ogv_url ) {
											?>
										<div class="video-section"
											 data-mp4="<?php echo esc_url( $video_url ); ?>"
											 data-webm="<?php echo esc_url( $video_webm_url ); ?>"
											 data-ogv="<?php echo esc_url( $video_ogv_url ); ?>"
											 data-bg="<?php echo esc_attr( $image ); ?>">
											<?php
										}
										$this->load_section_part( $section );
										if ( $video_url || $video_webm_url || $video_ogv_url ) {
											echo '</div>'; // End video-section.
										}
									}

									break;
								case 'image':
									$image           = $this->get_media_url( $section['bg_image'] );
									$alpha           = $this->hex_to_rgba( $section['bg_opacity_color'], .3 );
									$enable_parallax = $section['enable_parallax'];

									/**
									 * Support old version 2.0.4
									 *
									 * @since 2.0.5
									 */
									if ( version_compare( self::$theme_version, '2.0.5', '>=' ) ) {
										$hook_args             = compact( 'image', 'alpha', 'video_ogv_url', 'enable_parallax' );
										$hook_args['_bg_type'] = 'image';
										do_action( 'onepress_before_section_part', $section['section_id'], $hook_args );
										$this->load_section_part( $section );
									} else {

										if ( $enable_parallax == 1 ) {
											echo '<div id="parallax-' . esc_attr( $section['section_id'] ) . '" class="section-parallax">';
											echo ' <div class="parallax-bg no-img" data-stellar-ratio="0.1" style="background-image: url(' . esc_url( $image ) . ');"></div>';
										} elseif ( $image && $alpha ) { // image bg.
											echo '<div id="bgimage-' . esc_attr( $section['section_id'] ) . '" class="bgimage-alpha bgimage-' . esc_attr( $section['section_id'] ) . '">';
										}

										$this->load_section_part( $section );

										if ( $enable_parallax == 1 ) {
											echo '</div>'; // End parallax.
										} elseif ( $image && $alpha ) {
											echo '</div>'; // // image bg.
										}
									}

									break;
								default:
									$this->load_section_part( $section );

							}

							do_action( 'onepress_after_section_part', $section['section_id'], $hook_args );
							do_action( 'onepress_after_section_' . $section['section_id'] );
						}
					}
				} // end check if section active
			} // end loop sections

			remove_filter( 'onepress_section_class', array( $this, 'filter_section_class' ), 15, 2 );

			unset( $section );
		} //  End if sections
	}

	/**
	 * Retrieve the name of the highest priority template file that exists.
	 *
	 * Searches in the STYLESHEETPATH before TEMPLATEPATH so that themes which
	 * inherit from a parent theme can just overload one file.
	 *
	 * @since 2.7.0
	 *
	 * @param string|array $template_names Template file(s) to search for, in order.
	 * @param bool         $load           If true the template file will be loaded if it is found.
	 * @param bool         $require_once   Whether to require_once or require. Default true. Has no effect if $load is false.
	 * @return string The template filename if one is located.
	 */
	function locate_template( $template_names, $load = false, $require_once = true ) {
		$located = '';

		$is_child = STYLESHEETPATH != TEMPLATEPATH;

		foreach ( (array) $template_names as $template_name ) {
			if ( ! $template_name ) {
				continue;
			}

			if ( $is_child && file_exists( STYLESHEETPATH . '/' . $template_name ) ) {  // Child them
				$located = STYLESHEETPATH . '/' . $template_name;
				break;

			} elseif ( file_exists( ONEPRESS_PLUS_PATH . $template_name ) ) { // Check part in the plugin
				$located = ONEPRESS_PLUS_PATH . $template_name;
				break;
			} elseif ( file_exists( TEMPLATEPATH . '/' . $template_name ) ) { // current_theme
				$located = TEMPLATEPATH . '/' . $template_name;
				break;
			}
		}

		if ( $load && '' != $located ) {
			load_template( $located, $require_once );
		}
		return $located;
	}


}

/**
 * call plugin
 */
function onepress_plus_setup() {
	 OnePress_Plus::get_instance();
}
add_action( 'plugins_loaded', 'onepress_plus_setup' );


add_action( 'wp_head', 'onepress_plus_customize_live_preview_css', PHP_INT_MAX );
if ( ! function_exists( 'onepress_plus_customize_live_preview_css' ) ) {
	/**
	 * Live css for onepress plus like section paralax.
	 *
	 * @since 2.2.1
	 */
	function onepress_plus_customize_live_preview_css() {
		if ( ! is_customize_preview() ) {
			return;
		}
		$style      = array();
		$custom_css = '';

		$sections = get_theme_mod( 'onepress_section_order_styling', '' );
		if ( is_string( $sections ) ) {
			$sections = json_decode( $sections, true );
		}
		if ( is_array( $sections ) && ! empty( $sections ) ) {
			foreach ( $sections as $section ) {
				if ( 'image' == $section['bg_type'] ) {
					if ( OnePress_Plus::get_instance()->is_rgb( $section['bg_opacity_color'] ) ) {
						$bg_opacity_color = $section['bg_opacity_color'];
					} else {
						$bg_opacity_color = OnePress_Plus::get_instance()->hex_to_rgba( $section['bg_opacity_color'], .4 );
					}

					$image = ( isset( $section['bg_image']['url'] ) && '' != $section['bg_image']['url'] ) ? $section['bg_image']['url'] : '';

					if ( $image && ! $bg_opacity_color ) {
						if ( $bg_opacity_color ) {
							$style[ $section['section_id'] ]['bg'] = "background-color: #{$bg_opacity_color};";
						}
						// check background image and not parallax enable
						if ( $section['enable_parallax'] != 1 && $image ) {
							$style[ $section['section_id'] ][] = "background-image: url(\"{$image}\");";
						}
					} elseif ( $image && $bg_opacity_color ) {
						if ( $image ) {
							$custom_css .= ".bgimage-{$section['section_id']} {background-image: url(\"{$image}\");}";
						}

						if ( $bg_opacity_color ) {
							$style[ $section['section_id'] ][] = "background-color: {$bg_opacity_color};";
						}
					}

					if ( $bg_opacity_color ) {
						if ( 1 == $section['enable_parallax'] ) {
							$custom_css .= " #parallax-{$section['section_id']} .parallax-bg::before{background-color: {$bg_opacity_color}; } \n ";
						}
					}
				} elseif ( 'color' == $section['bg_type'] ) {
					if ( OnePress_Plus::get_instance()->is_rgb( $section['bg_color'] ) ) {
						$bg_color = $section['bg_color'];
					} else {
						$bg_color = OnePress_Plus::get_instance()->hex_to_rgba( $section['bg_color'], 1 );
					}
					if ( $bg_color ) {
						$style[ $section['section_id'] ]['bg'] = "background-color: {$bg_color};";
					}
				}
			}
		}
		if ( ! empty( $style ) ) {
			foreach ( $style as $k => $code ) {
				if ( ! empty( $code ) ) {
					$custom_css .= " .section-{$k}{ " . join( ' ', $code ) . " } \n ";
				}
			}
		}
		if ( '' != $custom_css ) {
			echo wp_sprintf( '<style type="text/css" id="onepress_customize_live_css_%s">%s</style>', uniqid(), $custom_css );
		}
	}
}
