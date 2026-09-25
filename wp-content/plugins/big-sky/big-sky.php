<?php

/**
 * Plugin Name: WordPress Agent
 * Plugin URI: https://wordpress.com/support/ai/wordpress-agent/
 * Update URI: https://github.com/Automattic/big-sky-plugin
 * Description: Your WordPress.com AI agent that helps with site setup, content, design, and more.
 * Version: 7.9.10
 * Author: Automattic, Inc.
 * Author URI: https://automattic.com/
 * Text Domain: big-sky
 * Domain Path: /languages
 * License: GPL2
 */

use Automattic\Jetpack\Agents_Manager\Agents_Manager;

/**
 * Absolute path to the plugin's entry file.
 *
 * Classes under lib/ and includes/ cannot use __FILE__ to build plugin URLs,
 * so they resolve asset paths against this instead.
 */
if ( ! defined( 'BIG_SKY__PLUGIN_FILE' ) ) {
	define( 'BIG_SKY__PLUGIN_FILE', __FILE__ );
}

require_once __DIR__ . '/lib/wpcom-rest-api-v2-endpoints.php';

if ( file_exists( __DIR__ . '/vendor/wordpress/abilities-api/abilities-api.php' ) ) {
	require_once __DIR__ . '/vendor/wordpress/abilities-api/abilities-api.php';
}

require_once __DIR__ . '/includes/class-big-sky-chrome.php';
require_once __DIR__ . '/lib/class-big-sky-easy-mode.php';
require_once __DIR__ . '/lib/class-big-sky-easy-mode-preview.php';

if ( ! class_exists( 'Big_Sky' ) ) {

	class Big_Sky {
		public const ENABLE_OPTION_NAME    = 'big_sky_enable';
		public const SUPPORTED_LOCALES     = [
			// Keys are WP.org and WP.com locale slugs.
			// Values are the English name of the language.
			'ar'    => 'Arabic',
			'de'    => 'German',
			'de_DE' => 'German',
			'es'    => 'Spanish (Spain)',
			'es_ES' => 'Spanish (Spain)',
			'fr'    => 'French (France)',
			'fr_FR' => 'French (France)',
			'he'    => 'Hebrew',
			'he_IL' => 'Hebrew',
			'id'    => 'Indonesian',
			'id_ID' => 'Indonesian',
			'it'    => 'Italian',
			'it_IT' => 'Italian',
			'ja'    => 'Japanese',
			'ko'    => 'Korean',
			'ko_KR' => 'Korean',
			'nl'    => 'Dutch',
			'nl_NL' => 'Dutch',
			'pt-br' => 'Portuguese (Brazil)',
			'pt_BR' => 'Portuguese (Brazil)',
			'ru'    => 'Russian',
			'ru_RU' => 'Russian',
			'sv'    => 'Swedish',
			'sv_SE' => 'Swedish',
			'tr'    => 'Turkish',
			'tr_TR' => 'Turkish',
			'zh-cn' => 'Chinese (China)',
			'zh_CN' => 'Chinese (China)',
			'zh-tw' => 'Chinese (Taiwan)',
			'zh_TW' => 'Chinese (Taiwan)',
		];
		public static $enabled             = '1';
		public static $orchestrator_loaded = false;

		public const WP_ADMIN_ORCHESTRATOR_ENABLED_DEFAULT   = false;
		public const CIAB_ADMIN_ORCHESTRATOR_ENABLED_DEFAULT = true;
		public const AGENTS_MANAGER_EDITOR_AGENT_ID          = 'wp-orchestrator';

		// Versioned base URL for the lazy-loaded site-spec bundle (with trailing slash)
		public const SITE_SPEC_BASE_URL = 'https://widgets.wp.com/site-spec/v1.17.1/';

		public static function init() {
			self::$enabled = get_option( self::ENABLE_OPTION_NAME, '1' );

			add_action( 'init', array( 'Big_Sky', 'load_textdomain' ) );

			add_action( 'wp_abilities_api_categories_init', array( 'Big_Sky', 'register_ability_categories' ) );

			// Runs at `init` (like Big Sky's other capability-gated features) so the
			// current user is established before the gate calls current_user_can().
			// Priority 1 keeps it ahead of the package's own `init` callbacks.
			add_action( 'init', array( 'Big_Sky', 'maybe_load_easy_site_editor' ), 1 );

			// Easy mode: the locked-down layer over site-editor.php that replaces
			// the standalone Easy Site Editor. Shares the same gate.
			Big_Sky_Easy_Mode::init();

			// The front-end preview iframe both editors load. Registered here
			// rather than from the package, which Phase 4 deletes; the package
			// stands down while this class exists so the hooks have one owner.
			Big_Sky_Easy_Mode_Preview::init();

			add_action( 'enqueue_block_editor_assets', array( 'Big_Sky', 'enqueue_assets' ) );

			// wp-admin unified orchestrator agent.
			// Shows on all wp-admin pages except the site editor.
			// Enable with: add_filter( 'big_sky_enable_wp_orchestrator_wp_admin_agent', '__return_true' );
			add_action( 'admin_enqueue_scripts', array( 'Big_Sky', 'enqueue_wp_orchestrator_wp_admin_assets' ) );
			add_action( 'admin_init', array( 'Big_Sky', 'maybe_register_wp_admin_chrome_hooks' ) );

			// CIAB Admin (Next Admin) unified orchestrator agent.
			// Disable with: add_filter( 'big_sky_enable_wp_orchestrator_ciab_admin_agent', '__return_false' );
			// Note: When Agents Manager is active and handles the agent via agents_manager_agent_providers,
			// we skip rendering Big Sky's own agent to avoid duplicates.
			add_action( 'next_admin_init', array( 'Big_Sky', 'maybe_enqueue_wp_orchestrator_ciab_admin_assets' ) );

			// Headless orchestrator for CIAB Admin (Next Admin) context.
			// Hook to next_admin_init to provide window.wpOrchestratorAgent for programmatic AI access.
			add_action( 'next_admin_init', array( 'Big_Sky', 'maybe_load_headless_orchestrator' ) );

			add_action( 'admin_init', array( 'Big_Sky', 'register_big_sky_enable' ) );
			add_action( 'admin_init', array( 'Big_Sky', 'register_big_sky_metadata_setting' ) );
			add_action( 'admin_init', array( 'Big_Sky', 'maybe_redirect_legacy_easy_site_editor' ), 0 );
			add_action( 'current_screen', array( 'Big_Sky', 'redirect_to_front_page' ) );
			add_action( 'rest_api_init', array( 'Big_Sky', 'register_big_sky_metadata_setting' ) );
			add_action( 'rest_api_init', array( 'Big_Sky', 'register_big_sky_rest_fields' ) );
			add_action( 'delete_post', array( 'Big_Sky', 'handle_post_deletion' ) );
			add_action( 'wp_trash_post', array( 'Big_Sky', 'handle_post_deletion' ) );
			add_action( 'admin_menu', array( 'Big_Sky', 'add_ai_editor_menu' ) );

			// Register main Orchestrator agent for Next Admin
			// TODO: Wrap this in a feature flag
			add_filter( 'next_admin_agent_providers', array( 'Big_Sky', 'register_wp_orchestrator_agent' ), 10, 1 );

			// Register Big Sky as an agent provider for the Agent's Manager (Jetpack)
			// This allows Big Sky's tools and context to be used by Agent Manager + Agents Manager's UnifiedAIAgent
			add_filter( 'agents_manager_agent_providers', array( 'Big_Sky', 'register_agent_manager_provider' ), 10, 1 );
			add_filter( 'agents_manager_agent_id', array( 'Big_Sky', 'maybe_use_orchestrator_for_agents_manager' ), 10, 1 );

			// Use Agents Manager (with the WP Orchestrator agent) in the editor by
			// default wherever Big Sky is enabled. Registered as filter callbacks
			// rather than evaluated inline so the request-time `?flags=use-big-sky`
			// opt-out is honored when the filters are applied.
			add_filter( 'agents_manager_enabled_in_block_editor', array( 'Big_Sky', 'maybe_enable_agents_manager_in_block_editor' ), 10, 1 );
			add_filter( 'agents_manager_use_unified_experience', array( 'Big_Sky', 'maybe_disable_unified_experience_for_big_sky_opt_out' ), 999, 1 );

			// This will show a notice when in dev mode when requirements for Big Sky are not met.
			add_action( 'admin_notices', array( 'Big_Sky', 'admin_notices' ) );
			add_action( 'plugins_loaded', array( 'Big_Sky', 'maybe_disable_idc_validation' ) );

			// use the filter jetpack_options_whitelist to allow the big_sky_site_metadata option to be synced
			add_filter(
				'jetpack_options_whitelist',
				function ( $whitelist ) {
					$whitelist[] = 'big_sky_site_metadata';
					return $whitelist;
				}
			);

			// When an AI generated logo is edited, mark the new image as an AI generated logo as well.
			add_filter( 'wp_edited_image_metadata', array( 'Big_Sky', 'set_big_sky_generated_logo_for_edited_images' ), 10, 3 );

			// Exclude booking product types from the shop page on CIAB sites.
			if ( self::is_ciab_site() ) {
				add_action( 'pre_get_posts', array( 'Big_Sky', 'exclude_booking_products_from_shop' ) );
			}

			$logger = self::get_logger();

			// Register the endpoints.
			new WPCOM_REST_API_V2_Endpoint_Big_Sky_Plugin( $logger );
			self::init_site_health();
		}

		/**
		 * If true a feedback input will appear when thumbs down is clicked.
		 *
		 * @return bool True if the user is an internal tester, false otherwise.
		 */
		public static function is_internal_tester() {
			if ( apply_filters( 'big_sky_is_internal_tester', false ) ) {
				return true;
			}
			return self::is_dev_mode() || ( function_exists( 'is_automattician' ) && is_automattician() );
		}

		/**
		 * Enables "Development" features that should be accessible only for admins.
		 */
		public static function is_dev_mode() {
			// Known local environments.
			$domain = parse_url( get_site_url(), PHP_URL_HOST );
			if (
				$domain === 'localhost' ||
				'.jurassic.tube' === stristr( $domain, '.jurassic.tube' ) ||
				'.jurassic.ninja' === stristr( $domain, '.jurassic.ninja' )
			) {
				return true;
			}

			// A8C development.
			if ( self::is_wpcom() && is_proxied_automattician() ) {
				return true;
			}
			if ( defined( 'AT_PROXIED_REQUEST' ) && AT_PROXIED_REQUEST && defined( 'ATOMIC_CLIENT_ID' ) ) {
				switch ( ATOMIC_CLIENT_ID ) {
					case 1: // Internal testing pool
					case 2: // WordPress.com on Atomic (WoA)
					case 3: // Pressable
					case 32: // Jurassic.ninja
					case 118: // Commerce garden client (ciab)
						return true;
						break;
				}
			}

			return false;
		}

		public static function is_ciab_site() {
			return defined( 'IS_COMMERCE_GARDEN' ) && IS_COMMERCE_GARDEN;
		}

		/**
		 * Load the bundled Easy Site Editor package.
		 *
		 * @return void
		 */
		public static function maybe_load_easy_site_editor() {
			if ( class_exists( 'Easy_Site_Editor' ) ) {
				return;
			}

			// Only needed on admin screens or inside the front-end preview iframe.
			if ( ! is_admin() && ! self::is_easy_site_editor_preview() ) {
				return;
			}

			if ( ! self::is_easy_site_editor_enabled() ) {
				return;
			}

			$easy_site_editor_file = __DIR__ . '/packages/easy-site-editor/load.php';
			if ( file_exists( $easy_site_editor_file ) ) {
				require_once $easy_site_editor_file;
			}
		}

		/**
		 * Whether the current request is the Easy Site Editor front-end preview iframe.
		 *
		 * Public so Big_Sky_Easy_Mode_Preview can compose it — the preview
		 * endpoint and the package loader must agree on what a preview request
		 * is, so there is one detector rather than two.
		 *
		 * @return bool
		 */
		public static function is_easy_site_editor_preview() {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Preview is a read-only iframe display mode.
			return isset( $_GET['easy-site-editor-preview'] ) && '1' === sanitize_text_field( wp_unslash( $_GET['easy-site-editor-preview'] ) );
		}

		/**
		 * Shared gate for whether the bundled Easy Site Editor is active.
		 *
		 * The Easy Site Editor only ever worked against a static front page, so
		 * it keeps that requirement on top of the easy-mode gate. Relies on the
		 * current user being established, so it must not run earlier than `init`.
		 *
		 * @return bool
		 */
		public static function is_easy_site_editor_enabled() {
			return self::is_easy_mode_enabled() && self::has_static_home_page();
		}

		/**
		 * Shared gate for whether easy mode is available to this user.
		 *
		 * Deliberately says nothing about the front page: with a static one easy
		 * mode opens it, and without one it opens the home template — the post
		 * list — which is equally editable. Relies on the current user being
		 * established, so it must not run earlier than `init`.
		 *
		 * Big Sky only loads on WordPress.com Simple and Atomic sites, and both
		 * are supported here. Atomic sites authenticate the wpcom agent and JWT
		 * requests through their Jetpack connection, which is present by default.
		 *
		 * Public so Big_Sky_Easy_Mode can compose it.
		 *
		 * @return bool
		 */
		public static function is_easy_mode_enabled() {
			return (bool) self::$enabled && current_user_can( 'edit_theme_options' );
		}

		/**
		 * Exclude booking product types from the shop page on CIAB sites.
		 *
		 * @param \WP_Query $query The WP_Query instance.
		 */
		public static function exclude_booking_products_from_shop( $query ) {
			if ( ! is_admin()
				&& $query->is_main_query()
				&& is_shop()
			) {
				$tax_query = $query->get( 'tax_query', array() );

				$tax_query[] = array(
					'taxonomy' => 'product_type',
					'field'    => 'slug',
					'terms'    => array( 'booking', 'bookable-event', 'bookable-service' ),
					'operator' => 'NOT IN',
				);

				$query->set( 'tax_query', $tax_query );
			}
		}

		/**
		 * Whether `?flags=use-big-sky` is in the URL.
		 *
		 * It's an opt-out: when set, we keep the classic Big Sky editor instead of Agents Manager.
		 *
		 * @return bool True if the flag is present.
		 */
		public static function is_use_big_sky_flag_set() {
			if ( isset( $_GET['flags'] ) && is_string( $_GET['flags'] ) ) {
				$flags = array_map( 'trim', explode( ',', sanitize_text_field( wp_unslash( $_GET['flags'] ) ) ) );
				if ( in_array( 'use-big-sky', $flags, true ) ) {
					return true;
				}
			}

			return false;
		}

		/**
		 * Register ability categories for Big Sky
		 */
		public static function register_ability_categories() {
			wp_register_ability_category(
				'big-sky',
				array(
					'label'       => __( 'Big Sky', 'big-sky' ),
					'description' => __( 'AI-powered site building and navigation abilities.', 'big-sky' ),
				)
			);
		}

		private static function get_logger() {
			if ( self::is_wpcom() ) {
				require_once __DIR__ . '/lib/wpcom-big-sky-logger.php';
				return new WPCOM_Big_Sky_Logger();
			} else {
				require_once __DIR__ . '/lib/jetpack-big-sky-logger.php';
				return new Jetpack_Big_Sky_Logger();
			}
		}

		public static function is_wpcom() {
			return defined( 'IS_WPCOM' ) && IS_WPCOM;
		}

		private static function has_static_home_page() {
			return self::get_static_home_page_id() > 0;
		}

		/**
		 * The page acting as the site's front page, if one is.
		 *
		 * Both options matter: `page_on_front` outlives a switch back to "your
		 * latest posts", so a bare id is not evidence of a static front page.
		 *
		 * Public so easy mode can route to it without repeating that rule.
		 *
		 * @return int Page id, or 0 when the front page shows posts.
		 */
		public static function get_static_home_page_id() {
			if ( 'page' !== get_option( 'show_on_front' ) ) {
				return 0;
			}

			return (int) get_option( 'page_on_front' );
		}

		public static function load_textdomain() {
			load_plugin_textdomain( 'big-sky', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
		}

		public static function enable_setting_html() {
			?>
			<label for="<?php echo esc_attr( self::ENABLE_OPTION_NAME ); ?>">
				<input name="<?php echo esc_attr( self::ENABLE_OPTION_NAME ); ?>" id="<?php echo esc_attr( self::ENABLE_OPTION_NAME ); ?>" <?php echo checked( self::$enabled, true, false ); ?> type="checkbox" value="1" />
				<?php esc_html_e( 'Enable AI-powered site building experience', 'big-sky' ); ?>
			</label>
			<?php
		}

		public static function register_big_sky_enable() {
			add_settings_field(
				self::ENABLE_OPTION_NAME,
				'<span>' . __( 'AI Features', 'big-sky' ) . '</span>',
				array( 'Big_Sky', 'enable_setting_html' ),
				'writing'
			);
			register_setting(
				'writing',
				self::ENABLE_OPTION_NAME,
				'intval'
			);
		}

		public static function redirect_to_front_page() {
			// Big Sky is disabled no action needed.
			$checks = self::do_checks();
			if ( 'critical' === $checks['status'] || ! self::$enabled ) {
				return;
			}

			if ( ! static::show_site_spec() ) {
				return; // Don't redirect if we are not showing the site spec.
			}

			$current_screen = get_current_screen();
			if ( 'site-editor' === $current_screen->base ) {
				$page_on_front = get_option( 'page_on_front' );

				// Use page_on_front if it's valid, otherwise fall back to root path (/)
				// This handles cases where reading settings are set to "Latest Posts" (page_on_front = 0)
				$p = $page_on_front && $page_on_front !== '0' ? '/page/' . $page_on_front : '/';
				if (
					( ! isset( $_GET['p'] ) || $_GET['p'] !== $p )
				) {
					$base_url   = admin_url( 'site-editor.php' );
					$query_args = array(
						'p'        => urlencode( $p ),
						'canvas'   => isset( $_GET['canvas'] ) ? sanitize_text_field( wp_unslash( $_GET['canvas'] ) ) : 'edit',
						'ai-step'  => isset( $_GET['ai-step'] ) ? sanitize_text_field( wp_unslash( $_GET['ai-step'] ) ) : '',
						'source'   => isset( $_GET['source'] ) ? sanitize_text_field( wp_unslash( $_GET['source'] ) ) : '',
						'referrer' => isset( $_GET['referrer'] ) ? sanitize_text_field( wp_unslash( $_GET['referrer'] ) ) : '',
					);

					if ( isset( $_GET['spec_id'] ) ) {
						$query_args['spec_id'] = sanitize_text_field( wp_unslash( $_GET['spec_id'] ) );
					} elseif ( isset( $_GET['prompt'] ) ) {
						$query_args['prompt'] = urlencode( sanitize_text_field( wp_unslash( $_GET['prompt'] ) ) );
					}

					wp_redirect( add_query_arg( $query_args, $base_url ) );
					exit;
				}
			}
		}

		public static function register_big_sky_metadata_setting() {
			register_post_meta(
				'attachment',
				'big_sky_generated_logo',
				[
					'type'          => 'integer',
					'description'   => 'If this attachment is a logo generated by Big Sky, the ID of the base/uncolorized generated logo or -1 if the attachment is the base/uncolorized generated logo. 0 if this attachment is not a logo generated by Big Sky.',
					'single'        => true,
					'default'       => 0,
					'show_in_rest'  => current_user_can( 'edit_theme_options' ),
					'auth_callback' => fn () => current_user_can( 'edit_theme_options' ),
				]
			);

			$args = array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'description'       => 'Settings for the Big Sky assembler',
				'show_in_rest'      => [
					'schema' => [
						'title' => __( 'Site Design Settings' ),
					],
				],
			);
			register_setting( 'options', 'big_sky_site_metadata', $args );
			register_post_meta(
				'page',
				'big_sky_generated',
				array(
					'show_in_rest' => true,
					'single'       => true,
					'type'         => 'boolean',
					'description'  => 'Whether the page is generated by Big Sky',
				)
			);
			if ( self::is_dev_mode() ) {
				register_setting(
					'options',
					'big_sky_last_site_design_payload',
					[
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
						'description'       => 'Last site design payload for debugging.',
						'show_in_rest'      => true,
					]
				);
			}
		}

		public static function register_big_sky_rest_fields() {
			add_filter( 'rest_request_after_callbacks', [ 'Big_Sky', 'add_big_sky_meta_to_global_styles' ], 10, 3 );
		}

		public static function add_big_sky_meta_to_global_styles( $response, $handler, WP_REST_Request $request ) {
			if ( ! $response instanceof WP_REST_Response ) {
				return $response;
			}

			if ( ! class_exists( 'WP_Theme_JSON_Resolver_Gutenberg' ) ) {
				return $response;
			}

			$theme_slug = get_option( 'stylesheet' );

			if ( ! str_contains( $request->get_route(), sprintf( 'global-styles/themes/%s/variations', $theme_slug ) ) ) {
				return $response;
			}

			if ( $response->is_error() ) {
				return $response;
			}

			$data     = $response->get_data();
			$raw_data = [];

			// Try reflection first
			try {
				$raw_files = new ReflectionProperty( 'WP_Theme_JSON_Resolver_Gutenberg', 'theme_json_file_cache' );
				$raw_files->setAccessible( true );
				foreach ( $raw_files->getValue() as $file => $file_data ) {
					$title              = $file_data['title'] ?? basename( $file, '.json' );
					$raw_data[ $title ] = $file_data;
				}
			} catch ( Exception $e ) {
				// If reflection fails, try reading theme files directly
				$theme_dir  = get_stylesheet_directory();
				$styles_dir = $theme_dir . '/styles';
				if ( is_dir( $styles_dir ) ) {
					foreach ( glob( $styles_dir . '/*.json' ) as $file ) {
						$file_data = json_decode( file_get_contents( $file ), true );
						if ( isset( $file_data['title'] ) ) {
							$raw_data[ $file_data['title'] ] = $file_data;
						}
					}
				}
			}

			foreach ( $data as &$variation ) {
				if ( isset( $variation['title'] ) ) {
					$variation['x-big-sky-meta'] = [
						'keywords'    => $raw_data[ $variation['title'] ]['keywords'] ?? [],
						'personality' => $raw_data[ $variation['title'] ]['personality'] ?? [],
					];
				}
			}

			$response->set_data( $data );

			return $response;
		}

		public static function init_site_health() {
			add_filter(
				'site_status_tests',
				function ( $tests ) {
					$tests['direct']['big_sky_checks'] = array(
						'name'  => __( 'Big Sky checks', 'big-sky' ),
						'label' => __( 'Big Sky checks', 'big-sky' ),
						'group' => 'direct',
						'test'  => array( __CLASS__, 'do_checks' ),
					);
					return $tests;
				}
			);
		}

		/**
		 * Do site-health page checks
		 *
		 * @access public
		 * @return array
		 */
		public static function do_checks() {
			$failures    = [];
			$passes      = [];
			$critical    = false;
			$is_e2e_test = ! empty( $_SERVER['SERVER_PORT'] ) && $_SERVER['SERVER_PORT'] === '8889'; // e2e run on 8889 port, less checking for that.
			/**
			 * Default, no issues found
			 */
			$result = array(
				'label'       => __( 'Big Sky Checks', 'big-sky' ),
				'status'      => 'good',
				'badge'       => array(
					'label' => __( 'Big Sky', 'big-sky' ),
					'color' => 'blue',
				),
				'description' => sprintf(
					'<p>%s</p>',
					__( 'Big Sky did not find any known issues with your site.', 'big-sky' )
				),
				'actions'     => '',
				'test'        => 'big_sky_checks',
			);

			if ( ! wp_is_block_theme() ) {
				$critical   = true;
				$failures[] = sprintf(
					'<p>%s</p>',
					__( 'The current theme is not a block theme. Big Sky requires a block theme to be active.', 'big-sky' )
				);
			} else {
				$theme_name = wp_get_theme()->get( 'Name' );
				$passes[]   = sprintf(
					'<p>%s</p>',
					// translators: %s is the theme name.
					sprintf( __( 'The current theme (%s) is a block theme.', 'big-sky' ), esc_html( $theme_name ) )
				);
			}

			// check that Jetpack is installed and active
			if ( ! self::is_wpcom() && ! class_exists( 'Jetpack' ) ) {
				$critical   = true;
				$failures[] = sprintf(
					'<p>%s</p>',
					__( 'Jetpack is not installed. Big Sky requires Jetpack to be installed and active.', 'big-sky' )
				);
			} else {
				$passes[] = sprintf(
					'<p>%s</p>',
					__( 'Jetpack is installed.', 'big-sky' )
				);
			}

			$check_jetpack_connection = apply_filters( 'big_sky_check_jetpack_connection', true );

			// check that Jetpack is connected
			if ( $check_jetpack_connection && ! self::is_wpcom() && class_exists( 'Jetpack' ) && ! Jetpack::connection()->is_connected() ) {
				$critical   = $is_e2e_test ? false : true; // not critical for e2e tests
				$failures[] = sprintf(
					'<p>%s</p>',
					__( 'Jetpack is not connected. Big Sky requires Jetpack to be connected.', 'big-sky' )
				);
			} else {
				$passes[] = sprintf(
					'<p>%s</p>',
					__( 'Jetpack is connected.', 'big-sky' )
				);
			}

			// do the same for Jetpack::connection()->has_connected_admin()
			if ( $check_jetpack_connection && ! self::is_wpcom() && class_exists( 'Jetpack' ) && ! Jetpack::connection()->has_connected_admin() ) {
				$critical   = $is_e2e_test ? false : true; // not critical for e2e tests
				$failures[] = sprintf(
					'<p>%s</p>',
					__( 'Jetpack does not have a connected admin. Big Sky requires Jetpack to be connected to an admin.', 'big-sky' )
				);
			} else {
				$passes[] = sprintf(
					'<p>%s</p>',
					__( 'Jetpack is connected to an admin.', 'big-sky' )
				);
			}

			// check that Jetpack_Options::get_option('mapbox_api_key') is set
			if ( ! self::is_wpcom() && class_exists( 'Jetpack_Mapbox_Helper' ) && ! Jetpack_Mapbox_Helper::get_access_token() ) {
				$failures[] = sprintf(
					'<p>%s</p>',
					__( 'Mapbox API key is not set. Big Sky requires a Mapbox API key to be set.', 'big-sky' )
				);
			} else {
				$passes[] = sprintf(
					'<p>%s</p>',
					__( 'Mapbox API key is set.', 'big-sky' )
				);
			}

			/**
			 * If issues found.
			 */
			if ( count( $failures ) > 0 ) {
				$result['status'] = $critical ? 'critical' : 'red';
				/* translators: $d is the number of performance issues found. */
				$result['label']       = sprintf( _n( 'Big Sky is affected by %d issue', 'Big Sky is affected by %d issues', count( $failures ), 'big-sky' ), count( $failures ) );
				$result['description'] = __( 'Big Sky detected the following issues with your site:', 'big-sky' );

				foreach ( $failures as $issue ) {
					$result['description'] .= '<p>';
					$result['description'] .= "<span class='dashicons dashicons-warning' style='color: crimson;'></span> &nbsp;";
					$result['description'] .= wp_kses( $issue, array( 'a' => array( 'href' => array() ) ) ); // Only allow a href HTML tags.
					$result['description'] .= '</p>';
				}
			}

			/**
			 * Add passes
			 */
			if ( count( $passes ) > 0 ) {
				$result['description'] .= __( 'These checks passed:', 'big-sky' );

				foreach ( $passes as $pass ) {
					$result['description'] .= '<p>';
					$result['description'] .= "<span class='dashicons dashicons-yes' style='color: green;'></span> &nbsp;";
					$result['description'] .= wp_kses( $pass, array( 'a' => array( 'href' => array() ) ) ); // Only allow a href HTML tags.
					$result['description'] .= '</p>';
				}
			}

			return $result;
		}

		public static function enqueue_assets() {
			if ( ! self::$enabled ) {
				return;
			}

			$current_screen = get_current_screen();
			if ( ! ( $current_screen instanceof \WP_Screen ) ) {
				return;
			}

			// Site editor or post/page editor.
			$is_supported_screen = 'site-editor' === $current_screen->base ||
				( 'post' === $current_screen->base && in_array( $current_screen->post_type, array( 'page', 'post' ), true ) );

			if ( ! $is_supported_screen ) {
				return;
			}

			$checks = self::do_checks();
			if ( 'critical' === $checks['status'] ) {
				return;
			}

			wp_enqueue_script(
				'big-sky-assembler',
				plugins_url( 'build/index.js', __FILE__ ),
				[ 'wp-edit-site', 'wp-abilities' ],
				filemtime( plugin_dir_path( __FILE__ ) . 'build/index.js' )
			);

			wp_set_script_translations(
				'big-sky-assembler',
				'big-sky',
				plugin_dir_path( __FILE__ ) . 'languages'
			);

			wp_enqueue_style(
				'big-sky-assembler',
				plugins_url( 'build/style-index.css', __FILE__ ),
				[ 'wp-edit-site' ],
				filemtime( plugin_dir_path( __FILE__ ) . 'build/style-index.css' )
			);

			// Enqueue AgentUI styles
			wp_enqueue_style(
				'big-sky-agentui',
				plugins_url( 'build/index.css', __FILE__ ),
				[ 'big-sky-assembler' ],
				filemtime( plugin_dir_path( __FILE__ ) . 'build/index.css' )
			);

			// Expose the versioned site-spec asset URLs. This is lazy-loaded by
			// the SiteSpecLanding component only when site-spec mode is entered
			wp_add_inline_script(
				'big-sky-assembler',
				'window.bigSkySiteSpecAssets = ' . wp_json_encode(
					array(
						'script' => self::SITE_SPEC_BASE_URL . 'index.js',
						'style'  => self::SITE_SPEC_BASE_URL . 'style.css',
					)
				) . ';',
				'before'
			);

			// if user has more than 1 site, redirect to https://wordpress.com/sites on WP logo click
			if ( self::is_free_trial() ) {
				$blog_count = self::site_count();
				if ( $blog_count > 1 ) {
					wp_add_inline_script(
						'wp-edit-site',
						'
						wp.domReady( function () {
							var checkLogo = setInterval( function () {
								var logoLink = document.querySelector( ".edit-site-layout__view-mode-toggle" );
								if ( logoLink ) {
									logoLink.href = "https://wordpress.com/sites";
									clearInterval( checkLogo );
								}
							}, 100 );
						} );
						'
					);
				}
			}

			$user_locale = get_user_locale();
			if ( isset( static::SUPPORTED_LOCALES[ $user_locale ] ) ) {
				$user_language = static::SUPPORTED_LOCALES[ $user_locale ];
			} else {
				$user_locale   = 'en_US';
				$user_language = 'English (United States)';
			}

			wp_localize_script(
				'big-sky-assembler',
				'bigSkyInitialState',
				[
					'isDevMode'            => self::is_dev_mode(),
					'isInternalTester'     => self::is_internal_tester(),
					'isLocalGraph'         => false, // Change this to use local graph
					'launchStatus'         => get_option( 'launch-status' ),
					'userLocale'           => $user_locale,
					'userLanguage'         => $user_language,
					'isComingSoon'         => self::is_coming_soon(),
					'isBlogPrivate'        => self::is_blog_private(),
					'siteMetadata'         => json_decode( get_option( 'big_sky_site_metadata' ), true ),
					'siteIntent'           => get_option( 'site_intent', '' ),
					'siteGoals'            => get_option( 'site_goals', [] ),
					'currentScreen'        => [
						'screen'   => $current_screen->base,
						'postType' => $current_screen->post_type,
					],
					'isFreeTrial'          => self::is_free_trial(),
					'siteCount'            => self::site_count(),
					'maxUploadSize'        => wp_max_upload_size(),
					'bigSkyVersion'        => get_plugin_data( __FILE__ )['Version'] ?? '0',
					'woocommerce'          => self::is_woocommerce_active(),
					'wcAdminUrl'           => admin_url( 'admin.php?page=wc-admin' ),
					'isUnifiedChatEnabled' => self::is_agents_manager_handling_agent(),
					'isCiab'               => self::is_ciab_site(),
				]
			);
		}

		/**
		 * Registers wp-admin chrome hooks based on current context.
		 *
		 * Called on admin_init to conditionally register chrome hooks before admin_head fires.
		 * Only registers hooks if the wp-admin agent is enabled via filter.
		 */
		public static function maybe_register_wp_admin_chrome_hooks() {
			// Check filter before registering chrome hooks.
			// Default is false - must be explicitly enabled via filter.
			if ( false === apply_filters( 'big_sky_enable_wp_orchestrator_wp_admin_agent', self::WP_ADMIN_ORCHESTRATOR_ENABLED_DEFAULT ) ) {
				return;
			}

			// Skip chrome if Agents Manager is handling the agent.
			if ( self::is_agents_manager_handling_agent() ) {
				return;
			}

			if ( self::is_block_editor_context() ) {
				add_action( 'admin_head', array( 'Big_Sky_Chrome', 'inject_block_editor_chrome_css' ), 0 );
				add_action( 'admin_head', array( 'Big_Sky_Chrome', 'inject_block_editor_chrome_script' ), 2 );
			} elseif ( self::is_wp_admin_context() ) {
				add_action( 'admin_head', array( 'Big_Sky_Chrome', 'inject_wp_admin_chrome_css' ), 0 );
				add_action( 'admin_head', array( 'Big_Sky_Chrome', 'inject_wp_admin_chrome_script' ), 2 );
			}
		}

		/**
		 * Check if current context is Site Editor
		 *
		 * @return bool True if in Site Editor context
		 */
		private static function is_site_editor_context() {
			global $pagenow;
			return 'site-editor.php' === $pagenow;
		}

		/**
		 * Check if current context is CIAB Admin (Next Admin)
		 *
		 * @return bool True if in CIAB Admin context
		 */
		private static function is_ciab_admin_context() {
			return isset( $_GET['page'] ) && 'next-admin' === sanitize_text_field( wp_unslash( $_GET['page'] ) );
		}

		/**
		 * Check if current context is Block Editor (post.php or post-new.php)
		 *
		 * @return bool True if in Block Editor context
		 */
		private static function is_block_editor_context() {
			global $pagenow;
			return in_array( $pagenow, array( 'post.php', 'post-new.php' ), true );
		}

		/**
		 * Check if current context is Post Editor (Block Editor with post type 'post')
		 * This excludes Page Editor (BigSky) which has post type 'page'
		 *
		 * @return bool True if in Post Editor context
		 */
		private static function is_post_editor_context() {
			if ( ! self::is_block_editor_context() ) {
				return false;
			}

			$current_screen = get_current_screen();
			if ( ! ( $current_screen instanceof \WP_Screen ) ) {
				return false;
			}

			return 'post' === $current_screen->post_type;
		}

		/**
		 * Check if current context is Page Editor.
		 *
		 * @return bool True if in Page Editor context
		 */
		private static function is_page_editor_context() {
			if ( ! self::is_block_editor_context() ) {
				return false;
			}

			$current_screen = get_current_screen();
			if ( $current_screen instanceof \WP_Screen && 'page' === $current_screen->post_type ) {
				return true;
			}

			$post_id = isset( $_GET['post'] ) ? absint( wp_unslash( $_GET['post'] ) ) : 0;
			if ( $post_id ) {
				return 'page' === get_post_type( $post_id );
			}

			return isset( $_GET['post_type'] ) && 'page' === sanitize_text_field( wp_unslash( $_GET['post_type'] ) );
		}

		/**
		 * Select the WP Orchestrator agent for Agents Manager on the Big Sky editor path.
		 *
		 * The orchestrator now has a wpcom-editor run route that gives it Dolly-grade
		 * editor mechanics, so it is a drop-in for the retired Dolly editor agent.
		 *
		 * @param string|null $agent_id Existing agent ID from earlier filters.
		 * @return string|null Agent ID for Agents Manager.
		 */
		public static function maybe_use_orchestrator_for_agents_manager( $agent_id ) {
			if ( $agent_id || ! self::$enabled ) {
				return $agent_id;
			}

			if ( self::is_agents_manager_enabled_in_editor() && self::is_big_sky_agents_manager_editor_context() ) {
				return self::AGENTS_MANAGER_EDITOR_AGENT_ID;
			}

			return $agent_id;
		}

		/**
		 * Check if Agents Manager is enabled in the editor rollout.
		 *
		 * The Agents Manager editor experience is now released widely: it is on by
		 * default wherever Big Sky is enabled. The `?flags=use-big-sky` opt-out
		 * (handled by the callers below) still routes users back to the classic Big
		 * Sky editor.
		 *
		 * @return bool True if Agents Manager is enabled in the editor rollout.
		 */
		public static function is_agents_manager_enabled_in_editor() {
			return (bool) self::$enabled;
		}

		/**
		 * Enable Agents Manager in the block editor for the editor Dolly rollout.
		 *
		 * Registered as a filter callback (rather than a load-time decision) so the
		 * request-time `?flags=use-big-sky` opt-out is honored when the filter runs.
		 *
		 * @param bool $enabled Whether Agents Manager is enabled in the block editor.
		 * @return bool Whether Agents Manager is enabled in the block editor.
		 */
		public static function maybe_enable_agents_manager_in_block_editor( $enabled ) {
			if ( self::is_agents_manager_enabled_in_editor() && ! self::is_use_big_sky_flag_set() ) {
				return true;
			}

			return $enabled;
		}

		/**
		 * Honor the `?flags=use-big-sky` opt-out by forcing the unified experience off.
		 *
		 * When the rollout is active and the opt-out flag is set, turn the unified
		 * experience off (priority 999, to win over Agents Manager) so its is_enabled()
		 * check returns false and Big Sky's own editor UI loads. Evaluated lazily so the
		 * proxied-Automattician check runs after the current user is loaded.
		 *
		 * @param bool $use_unified_experience Whether Agents Manager should take over.
		 * @return bool Whether Agents Manager should take over.
		 */
		public static function maybe_disable_unified_experience_for_big_sky_opt_out( $use_unified_experience ) {
			if ( self::is_agents_manager_enabled_in_editor() && self::is_use_big_sky_flag_set() ) {
				return false;
			}

			return $use_unified_experience;
		}

		/**
		 * Check whether the current editor should use Agents Manager with Big Sky's orchestrator agent.
		 *
		 * @return bool True when the Big Sky Agents Manager editor rollout is active.
		 */
		private static function is_big_sky_agents_manager_editor_context() {
			return self::$enabled &&
				( self::is_site_editor_context() || self::is_page_editor_context() );
		}

		/**
		 * Check if current context is regular wp-admin (not Site Editor, not Block Editor, not CIAB Admin)
		 *
		 * @return bool True if in regular wp-admin context
		 */
		private static function is_wp_admin_context() {
			return is_admin() && ! self::is_site_editor_context() && ! self::is_block_editor_context() && ! self::is_ciab_admin_context();
		}

		/**
		 * Load headless orchestrator in non-Post Editor contexts.
		 *
		 * Runs at admin_enqueue_scripts time. Loads headless variant for contexts
		 * that need orchestrator functionality (abilities, auth, window.wpOrchestratorAgent)
		 * but not the dock UI.
		 *
		 * @since 6.8.2
		 */
		public static function maybe_load_headless_orchestrator() {
			if ( ! self::$enabled ) {
				return;
			}

			// Only load headless if we're NOT in Post Editor.
			// Post Editor gets full orchestrator via the filter above.
			if ( ! self::is_post_editor_context() ) {
				self::enqueue_wp_orchestrator_headless();
			}
		}

		/**
		 * Enqueue wp-orchestrator headless variant (no UI)
		 *
		 * Full orchestrator functionality (abilities, auth, config) without rendering the dock UI.
		 * Exposes window.wpOrchestratorAgent for programmatic access to the AI agent.
		 * Used by CIAB Admin and other features that need orchestrator capabilities
		 * without the dock interface.
		 */
		public static function enqueue_wp_orchestrator_headless() {
			if ( ! self::$enabled ) {
				return;
			}

			// Skip if full orchestrator with UI is enabled - prefer that over headless
			if ( apply_filters( 'big_sky_enable_wp_orchestrator_wp_admin_agent', false ) ) {
				return;
			}

			// Mark that orchestrator is loaded to prevent other variants from loading
			self::$orchestrator_loaded = true;

			// For non-WPCOM sites, ensure Jetpack connection state is initialized
			// This provides JP_CONNECTION_INITIAL_STATE needed for authentication
			if ( ! self::is_wpcom() && class_exists( 'Automattic\Jetpack\Connection\Initial_State' ) ) {
				\Automattic\Jetpack\Connection\Initial_State::render_script( 'big-sky-wp-orchestrator-headless' );
			}

			$build_path = plugin_dir_path( __FILE__ ) . 'build/wp-orchestrator/headless/';
			$build_url  = plugins_url( 'build/wp-orchestrator/headless/', __FILE__ );
			$asset_file = $build_path . 'index.asset.php';

			if ( ! file_exists( $build_path . 'index.js' ) || ! file_exists( $asset_file ) ) {
				return;
			}

			$asset = require $asset_file;

			wp_enqueue_script(
				'big-sky-wp-orchestrator-headless',
				$build_url . 'index.js',
				$asset['dependencies'] ?? array(),
				$asset['version'] ?? '1.0.0',
				true
			);

			wp_set_script_translations(
				'big-sky-wp-orchestrator-headless',
				'big-sky',
				plugin_dir_path( __FILE__ ) . 'languages'
			);

			// Set up Jetpack authentication data for WordPress.com sites
			// This is required for the orchestrator's authProvider to work
			if ( self::is_wpcom() ) {
				wp_add_inline_script(
					'big-sky-wp-orchestrator-headless',
					sprintf(
						'(function() {
							window.Jetpack_Editor_Initial_State = {
								...( window.Jetpack_Editor_Initial_State || {} ),
								wpcomBlogId: "%d"
							};
						})();',
						get_current_blog_id()
					),
					'before'
				);
			}

			// Extend bigSkyInitialState
			$additional_state = array(
				'isDevMode'        => self::is_dev_mode(),
				'isInternalTester' => self::is_internal_tester(),
				'bigSkyVersion'    => get_plugin_data( __FILE__ )['Version'] ?? '0',
				'pluginUrl'        => plugins_url( '', __FILE__ ),
			);

			wp_add_inline_script(
				'big-sky-wp-orchestrator-headless',
				'window.bigSkyInitialState = { ...( window.bigSkyInitialState || {} ), ...' . wp_json_encode( $additional_state ) . ' };',
				'before'
			);
		}

		/**
		 * Enqueue wp-admin agent assets
		 * Loads the embedded agent UI for classic wp-admin pages
		 */
		public static function enqueue_wp_orchestrator_wp_admin_assets() {
			// Big Sky globally disabled via settings.
			if ( ! self::$enabled ) {
				return;
			}

			// Skip if Agents Manager is handling the agent.
			if ( self::is_agents_manager_handling_agent() ) {
				return;
			}

			// Skip if orchestrator is already loaded.
			if ( self::$orchestrator_loaded ) {
				return;
			}

			// Only load in wp-admin or block editor context.
			// Site editor uses main Big Sky Agent, CIAB Admin uses its own orchestrator.
			if ( ! self::is_wp_admin_context() && ! self::is_block_editor_context() ) {
				return;
			}

			// Allow other plugins to enable/disable the wp-admin agent.
			// Filter is only consulted when we're in appropriate context (checks above passed).
			// Default is false - must be explicitly enabled via filter.
			if ( false === apply_filters( 'big_sky_enable_wp_orchestrator_wp_admin_agent', self::WP_ADMIN_ORCHESTRATOR_ENABLED_DEFAULT ) ) {
				return;
			}

			// Mark that orchestrator is loaded
			self::$orchestrator_loaded = true;

			$build_path = plugin_dir_path( __FILE__ ) . 'build/wp-orchestrator/wp-admin/';
			$build_url  = plugins_url( 'build/wp-orchestrator/wp-admin/', __FILE__ );
			$asset_file = $build_path . 'index.asset.php';

			if ( ! file_exists( $build_path . 'index.js' ) || ! file_exists( $asset_file ) ) {
				return;
			}

			$asset = require $asset_file;

			wp_enqueue_script(
				'big-sky-wp-admin-agent',
				$build_url . 'index.js',
				$asset['dependencies'] ?? array(),
				$asset['version'] ?? '1.0.0',
				true
			);

			wp_enqueue_style(
				'big-sky-wp-admin-agent',
				$build_url . 'main.css',
				array(),
				$asset['version'] ?? '1.0.0'
			);

			wp_enqueue_style(
				'big-sky-wp-admin-agent-style',
				$build_url . 'style-main.css',
				array( 'big-sky-wp-admin-agent' ),
				$asset['version'] ?? '1.0.0'
			);

			wp_set_script_translations(
				'big-sky-wp-admin-agent',
				'big-sky',
				plugin_dir_path( __FILE__ ) . 'languages'
			);

			$current_screen = get_current_screen();
			wp_localize_script(
				'big-sky-wp-admin-agent',
				'bigSkyInitialState',
				[
					'isDevMode'        => self::is_dev_mode(),
					'isInternalTester' => self::is_internal_tester(),
					'currentScreen'    => [
						'screen'   => $current_screen->base,
						'postType' => $current_screen->post_type,
					],
				]
			);

			// Only set wpcomBlogId on WordPress.com sites
			if ( self::is_wpcom() ) {
				wp_add_inline_script(
					'big-sky-wp-admin-agent',
					sprintf(
						'(function() {
							window.bigSkyWpAdmin = { pluginUrl: %s };
							window.Jetpack_Editor_Initial_State = {
								...( window.Jetpack_Editor_Initial_State || {} ),
								wpcomBlogId: "%d"
							};
						})();',
						wp_json_encode( plugins_url( '', __FILE__ ) . '/' ),
						get_current_blog_id()
					),
					'before'
				);
			}
		}

		/**
		 * Check if Agents Manager is handling the agent.
		 *
		 * When Agents Manager is active and has any registered agent providers,
		 * Big Sky defers to Agents Manager to avoid rendering duplicate agent UIs.
		 *
		 * @return bool True if Agents Manager is handling the agent, false otherwise.
		 */
		public static function is_agents_manager_handling_agent() {
			if ( ! class_exists( '\Automattic\Jetpack\Agents_Manager\Agents_Manager' ) || ! method_exists( '\Automattic\Jetpack\Agents_Manager\Agents_Manager', 'is_enabled' ) ) {
				return false;
			}

			return Agents_Manager::is_enabled();

			// Check if we've registered as a provider.
			// If the filter returns any providers, Agents Manager will handle the agent.
			$providers = apply_filters( 'agents_manager_agent_providers', array() );
			return ! empty( $providers );
		}

		/**
		 * Conditionally enqueue CIAB Admin orchestrator assets.
		 *
		 * Skips enqueuing if Agents Manager is handling the agent to avoid duplicate UIs.
		 */
		public static function maybe_enqueue_wp_orchestrator_ciab_admin_assets() {
			if ( self::is_agents_manager_handling_agent() ) {
				return;
			}

			self::enqueue_wp_orchestrator_ciab_admin_assets();
		}

		/**
		 * Enqueue CIAB Admin (Next Admin) orchestrator agent assets.
		 *
		 * Injects the Big Sky dock directly into CIAB Admin pages.
		 * Hooked to next_admin_init, so only runs within Next Admin context.
		 * Early exits ensure we only consult the filter when in appropriate context.
		 */
		public static function enqueue_wp_orchestrator_ciab_admin_assets() {
			// Big Sky globally disabled via settings.
			if ( ! self::$enabled ) {
				return;
			}

			// Exclude site editor - it has its own agent.
			if ( self::is_site_editor_context() ) {
				return;
			}

			// Check for critical issues (e.g., missing dependencies).
			$checks = self::do_checks();
			if ( 'critical' === $checks['status'] ) {
				return;
			}

			// Allow other plugins to disable the CIAB Admin agent.
			// Filter is only consulted when we're in appropriate context (checks above passed).
			// Default is true - enabled unless explicitly disabled via filter.
			if ( false === apply_filters( 'big_sky_enable_wp_orchestrator_ciab_admin_agent', self::CIAB_ADMIN_ORCHESTRATOR_ENABLED_DEFAULT ) ) {
				return;
			}

			// Use the same dock component as Site Editor (has both floating + docked modes)
			$build_path = plugin_dir_path( __FILE__ ) . 'build/wp-orchestrator/ciab-admin/';
			$build_url  = plugins_url( 'build/wp-orchestrator/ciab-admin/', __FILE__ );
			$asset_file = $build_path . 'index.asset.php';

			if ( ! file_exists( $build_path . 'index.js' ) || ! file_exists( $asset_file ) ) {
				return;
			}

			$asset = require $asset_file;

			wp_enqueue_script(
				'big-sky-ciab-admin-agent',
				$build_url . 'index.js',
				$asset['dependencies'] ?? array(),
				$asset['version'] ?? '1.0.0',
				true
			);

			wp_set_script_translations(
				'big-sky-ciab-admin-agent',
				'big-sky',
				plugin_dir_path( __FILE__ ) . 'languages'
			);

			// Set initial state for dev mode and other features
			wp_localize_script(
				'big-sky-ciab-admin-agent',
				'bigSkyInitialState',
				[
					'isDevMode'        => self::is_dev_mode(),
					'isInternalTester' => self::is_internal_tester(),
				]
			);

			// Enqueue styles - both main.css and style-main.css
			if ( file_exists( $build_path . 'main.css' ) ) {
				wp_enqueue_style(
					'big-sky-ciab-admin-agent-main',
					$build_url . 'main.css',
					array(),
					$asset['version'] ?? '1.0.0'
				);
			}

			if ( file_exists( $build_path . 'style-main.css' ) ) {
				wp_enqueue_style(
					'big-sky-ciab-admin-agent-style',
					$build_url . 'style-main.css',
					array( 'big-sky-ciab-admin-agent-main' ),
					$asset['version'] ?? '1.0.0'
				);
			}
		}

		/**
		 * Whether the site is currently unlaunched or not.
		 * On WordPress.com and WoA, sites can be marked as "coming soon", aka unlaunched.
		 *
		 * See Jetpack_Status::is_coming_soon()
		 * https://github.com/Automattic/jetpack/blob/trunk/projects/packages/status/src/class-status.php
		 */
		public static function is_coming_soon() {
			return ( new \Automattic\Jetpack\Status() )->is_coming_soon();
		}

		/**
		 * See Jetpack_Status::is_private_site()
		 * https://github.com/Automattic/jetpack/blob/trunk/projects/packages/status/src/class-status.php
		 */
		public static function is_blog_private() {
			return ( new \Automattic\Jetpack\Status() )->is_private_site();
		}

		public static function is_free_trial() {
			$force_free_trial = false;

			// Check for e2e test conditions
			if ( isset( $_COOKIE['big_sky_force_free_trial'] ) && $_COOKIE['big_sky_force_free_trial'] === 'true' ) {
				$force_free_trial = true;
			}

			return $force_free_trial || ( self::is_wpcom() && big_sky_is_on_free_trial() );
		}

		public static function site_count() {
			return count( get_blogs_of_user( get_current_user_id() ) );
		}

		/**
		 * Displays admin notices.
		 */
		public static function maybe_disable_idc_validation() {
			if ( ! self::is_dev_mode() ) {
				return;
			}

			add_filter( 'jetpack_sync_error_idc_validation', '__return_false' );
		}

		/**
		 * Displays admin notices.
		 */
		public static function admin_notices() {
			if ( ! self::is_dev_mode() ) {
				return;
			}

			$checks = self::do_checks();

			if ( 'good' === $checks['status'] ) {
				return;
			}

			wp_admin_notice(
				$checks['description'],
				array(
					'type'        => 'error',
					'dismissible' => true,
				)
			);
		}

		/**
				 * If the original image was marked as an AI generated image, mark the new one as one as well.
				 */
		public static function set_big_sky_generated_logo_for_edited_images( $new_image_meta, $new_attachment_id, $attachment_id ) {
			$original = get_post_meta( $attachment_id, 'big_sky_generated_logo', true );
			if ( $original ) {
				add_post_meta( $new_attachment_id, 'big_sky_generated_logo', -1, true );
			}
			return $new_image_meta;
		}

		/**
		 * Handle post deletion by removing associated patterns from site metadata
		 *
		 * @param int $post_id The ID of the post being deleted
		 */
		public static function handle_post_deletion( $post_id ) {
			try {
				// Only process pages
				if ( 'page' !== get_post_type( $post_id ) ) {
					return;
				}

				// Get current site metadata
				$site_metadata = json_decode( get_option( 'big_sky_site_metadata' ), true );

				// If no patterns exist or patterns is not an object, return early
				if ( empty( $site_metadata['patterns'] ) || ! is_array( $site_metadata['patterns'] ) ) {
					return;
				}

				if ( ! isset( $site_metadata['patterns'][ $post_id ] ) ) {
					return;
				}

				// Remove patterns for the deleted post
				unset( $site_metadata['patterns'][ $post_id ] );

				// Update the site metadata
				update_option( 'big_sky_site_metadata', json_encode( $site_metadata ) );
			} catch ( Exception $e ) {
				// no big deal
				return;
			}
		}

		/**
		 * Check if the current theme is Assembler.
		 */
		protected static function is_assembler_theme() {
			return 'Assembler' === wp_get_theme()->get( 'Name' );
		}

		/**
		 * Check if WooCommerce plugin is installed and active
		 */
		protected static function is_woocommerce_active() {
			return (
				(
					class_exists( 'WooCommerce' ) && function_exists( 'WC' ) // This should work regardless of the way we load Woo.
				) ||
				(
					class_exists( 'WC_Dependencies' ) && WC_Dependencies::woocommerce_active_check() // Original check from woocommerce-subscriptions
				)
			);
		}

		/**
		 * Register wp-orchestrator agent provider for Next Admin
		 * This provides the unified agent configuration for Next Admin interface
		 *
		 * @param array $providers Existing agent provider module IDs.
		 * @return array Modified array of agent provider module IDs.
		 */
		public static function register_wp_orchestrator_agent( $providers ) {
			if ( ! is_array( $providers ) ) {
				$providers = array( $providers );
			}

			// Skip if Agents Manager is handling the agent to avoid duplicate UIs
			if ( self::is_agents_manager_handling_agent() ) {
				return $providers;
			}

			if ( ! defined( 'NEXT_ADMIN_PLUGIN_DIR' ) && ! function_exists( 'next_admin_url' ) ) {
				return $providers;
			}

			$build_path = plugin_dir_path( __FILE__ ) . 'build/wp-orchestrator/ciab-admin/';
			$build_url  = plugins_url( 'build/wp-orchestrator/ciab-admin/', __FILE__ );
			$asset_file = $build_path . 'index.asset.php';

			if ( ! file_exists( $build_path . 'index.js' ) || ! file_exists( $asset_file ) ) {
				return $providers;
			}

			$asset = require_once $asset_file;

			wp_register_script_module(
				'@big-sky/wp-orchestrator',
				$build_url . 'index.js',
				array(),
				$asset['version'] ?? '1.0.0'
			);

			if ( file_exists( $build_path . 'style-main.css' ) ) {
				wp_enqueue_style(
					'big-sky-wp-orchestrator',
					$build_url . 'style-main.css',
					array(),
					$asset['version'] ?? '1.0.0'
				);
			}

			$providers[] = '@big-sky/wp-orchestrator';

			return $providers;
		}

		/**
		 * Register Big Sky as an agent provider for Agents Manager.
		 *
		 * This allows Big Sky's tools and context to be consumed by
		 * Agents Manager's UnifiedAIAgent instead of rendering a separate agent.
		 *
		 * @param array $providers Existing agent provider URLs.
		 * @return array Modified array of agent provider URLs.
		 */
		public static function register_agent_manager_provider( $providers ) {
			if ( ! is_array( $providers ) ) {
				$providers = array();
			}

			// Only register if Big Sky is enabled
			if ( ! self::$enabled ) {
				return $providers;
			}

			$build_path = plugin_dir_path( __FILE__ ) . 'build/calypso-agent-provider/';
			$build_url  = plugins_url( 'build/calypso-agent-provider/', __FILE__ );
			$asset_file = $build_path . 'index.asset.php';

			// Check if the provider build exists
			if ( ! file_exists( $build_path . 'index.js' ) ) {
				return $providers;
			}

			$asset   = file_exists( $asset_file ) ? require $asset_file : array( 'version' => '1.0.0' );
			$version = $asset['version'] ?? '1.0.0';

			// Enqueue dependencies that the provider module needs
			// These must be loaded before the dynamic import happens
			$dependencies = $asset['dependencies'] ?? array();
			foreach ( $dependencies as $dep ) {
				if ( wp_script_is( $dep, 'registered' ) ) {
					wp_enqueue_script( $dep );
				}
			}

			// Enqueue chrome styles for Calypso agent provider
			if ( file_exists( $build_path . 'main.css' ) ) {
				wp_enqueue_style(
					'big-sky-calypso-agent-provider',
					$build_url . 'main.css',
					array(),
					$version
				);
			}

			// Enqueue component styles (ProductCard, etc.)
			if ( file_exists( $build_path . 'style-main.css' ) ) {
				wp_enqueue_style(
					'big-sky-calypso-agent-provider-components',
					$build_url . 'style-main.css',
					array( 'big-sky-calypso-agent-provider' ),
					$version
				);
			}

			// Return the full URL to the provider module for dynamic import
			// Include version for cache busting
			$providers[] = $build_url . 'index.js?ver=' . $version;

			return $providers;
		}

		/**
		 * Show site spec
		 * This is used to determine whether to show the site spec in the site editor.
		 * If the site is not onboarded and the theme is Assembler, we show the site spec.
		 * If the site is onboarded or the theme is not Assembler, we do not show the site spec.
		 *
		 * @return bool True if the site spec should be shown, false otherwise.
		 */
		protected static function show_site_spec() {
			$ai_step = isset( $_GET['ai-step'] ) ? sanitize_text_field( wp_unslash( $_GET['ai-step'] ) ) : false;
			if ( 'spec' === $ai_step ) {
				return true;
			}
			return false;
		}
		/**
		 * Add AI Editor menu item to WordPress admin
		 *
		 * Sits under Appearance, directly above core's Editor link, and opens the
		 * site editor in easy mode. The Easy Site Editor this used to point at
		 * (`admin.php?page=easy-site-editor`) is deprecated in favour of easy mode.
		 *
		 * @return void
		 */
		public static function add_ai_editor_menu() {
			// Only show if Big Sky is enabled and checks pass
			$checks = self::do_checks();
			if ( 'critical' === $checks['status'] || ! self::$enabled ) {
				return;
			}

			add_submenu_page(
				'themes.php',
				__( 'AI Editor', 'big-sky' ),
				__( 'AI Editor', 'big-sky' ),
				'edit_theme_options',
				// esc_url() because a URL-shaped submenu slug is echoed into the
				// href unescaped by menu-header.php, as core's Customize link is.
				esc_url( self::get_ai_editor_url() ),
				'',
				self::get_appearance_position_before_editor()
			);
		}

		/**
		 * The site editor URL the AI Editor menu opens.
		 *
		 * `easy-mode=true` asks this load to open the agent; the
		 * edit canvas is where easy mode appears at all (it stands down on the
		 * design view). With a static front page the URL names it, so the user
		 * lands on something they can edit. Without one there is no page to name,
		 * and the site editor's default `/` route opens the home template — the
		 * post list — which is the right thing to edit on such a site.
		 *
		 * @return string
		 */
		private static function get_ai_editor_url() {
			$query_args = array( 'canvas' => 'edit' );

			$front_page_id = self::get_static_home_page_id();
			if ( $front_page_id > 0 ) {
				$query_args['p'] = '/page/' . $front_page_id;
			}

			$query_args['easy-mode'] = 'true';
			$query_args['ai-open']   = 'true';

			// http_build_query() rather than add_query_arg(): the latter does not
			// URL-encode, which would emit `p=/page/12` instead of the
			// `p=%2Fpage%2F12` form the site editor's routing contract documents.
			return admin_url( 'site-editor.php' ) . '?' . http_build_query( $query_args, '', '&', PHP_QUERY_RFC3986 );
		}

		/**
		 * Redirect the deprecated standalone Easy Site Editor route to easy mode.
		 *
		 * This remains in the top-level plugin so old bookmarks and external links
		 * keep working after packages/easy-site-editor is no longer loaded.
		 *
		 * @return void
		 */
		public static function maybe_redirect_legacy_easy_site_editor() {
			global $pagenow;

			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- This only identifies an admin navigation request.
			$page = isset( $_GET['page'] ) && is_string( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';

			if ( 'admin.php' !== $pagenow || 'easy-site-editor' !== $page ) {
				return;
			}

			if ( wp_safe_redirect( self::get_ai_editor_url() ) ) {
				exit;
			}
		}

		/**
		 * Where in the Appearance submenu the AI Editor goes.
		 *
		 * Directly above core's Editor link — the AI editor is the one we want
		 * reached first, and core's is the way past it. The position
		 * add_submenu_page() takes is an offset into the submenu array, not one of
		 * the numeric keys `wp-admin/menu.php` registers with — anything
		 * `>= count()` is silently appended to the bottom — so the offset is
		 * looked up rather than guessed. Items at and after it shift down, which
		 * is what puts this one above Editor. Core registers Editor as
		 * `site-editor.php`, or `site-editor.php?p=/pattern` on a classic theme,
		 * hence the prefix match.
		 *
		 * @return int|null Offset to insert at, or null to append.
		 */
		private static function get_appearance_position_before_editor() {
			global $submenu;

			if ( empty( $submenu['themes.php'] ) ) {
				return null;
			}

			foreach ( array_values( $submenu['themes.php'] ) as $index => $item ) {
				if ( isset( $item[2] ) && 0 === strpos( $item[2], 'site-editor.php' ) ) {
					return $index;
				}
			}

			return null;
		}

		/**
		 * Plugin activation handler
		 * Enables Big Sky when the plugin is activated
		 *
		 * @return void
		 */
		public static function activate() {
			update_option( self::ENABLE_OPTION_NAME, '1' );
		}

		/**
		 * Plugin deactivation handler
		 * Disables Big Sky when the plugin is deactivated
		 *
		 * @return void
		 */
		public static function deactivate() {
			update_option( self::ENABLE_OPTION_NAME, '0' );
		}

		/**
		 * Plugin uninstall handler
		 * Cleans up all Big Sky data when the plugin is deleted
		 *
		 * @return void
		 */
		public static function uninstall() {
			// Delete Big Sky options
			delete_option( self::ENABLE_OPTION_NAME );
		}
	}
} // close class_exists check

Big_Sky::init();

// Register plugin lifecycle hooks
register_activation_hook( __FILE__, array( 'Big_Sky', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Big_Sky', 'deactivate' ) );
register_uninstall_hook( __FILE__, array( 'Big_Sky', 'uninstall' ) );
