<?php
/**
 * Main plugin bootstrap file.
 *
 * @package EasySiteEditor
 */

declare( strict_types = 1 );

/**
 * Main plugin bootstrap.
 *
 * @package EasySiteEditor
 */
class Easy_Site_Editor {
	/**
	 * Singleton instance.
	 *
	 * @var Easy_Site_Editor|null
	 */
	private static $instance = null;

	/**
	 * Admin page slug.
	 */
	const PAGE_SLUG = 'easy-site-editor';

	/**
	 * Nonce action for editor-to-preview state requests.
	 */
	const PREVIEW_STATE_NONCE_ACTION = 'easy-site-editor-preview-state';

	/**
	 * Locales supported by the bundled AgentUI translations.
	 *
	 * Keyed by the AgentUI translation slug (matches the bundled
	 * `wpcom-agenttic-*.jed.json` files). Each entry lists the WP locale
	 * aliases that should resolve to that slug, plus the English language
	 * name used when telling the agent which language to respond in.
	 */
	const SUPPORTED_LOCALES = array(
		'ar'    => array(
			'language' => 'Arabic',
			'aliases'  => array( 'ar' ),
		),
		'de'    => array(
			'language' => 'German',
			'aliases'  => array( 'de', 'de_DE' ),
		),
		'es'    => array(
			'language' => 'Spanish (Spain)',
			'aliases'  => array( 'es', 'es_ES' ),
		),
		'fr'    => array(
			'language' => 'French (France)',
			'aliases'  => array( 'fr', 'fr_FR' ),
		),
		'he'    => array(
			'language' => 'Hebrew',
			'aliases'  => array( 'he', 'he_IL' ),
		),
		'id'    => array(
			'language' => 'Indonesian',
			'aliases'  => array( 'id', 'id_ID' ),
		),
		'it'    => array(
			'language' => 'Italian',
			'aliases'  => array( 'it', 'it_IT' ),
		),
		'ja'    => array(
			'language' => 'Japanese',
			'aliases'  => array( 'ja' ),
		),
		'ko'    => array(
			'language' => 'Korean',
			'aliases'  => array( 'ko', 'ko_KR' ),
		),
		'nl'    => array(
			'language' => 'Dutch',
			'aliases'  => array( 'nl', 'nl_NL' ),
		),
		'pt-br' => array(
			'language' => 'Portuguese (Brazil)',
			'aliases'  => array( 'pt-br', 'pt_BR' ),
		),
		'ru'    => array(
			'language' => 'Russian',
			'aliases'  => array( 'ru', 'ru_RU' ),
		),
		'sv'    => array(
			'language' => 'Swedish',
			'aliases'  => array( 'sv', 'sv_SE' ),
		),
		'tr'    => array(
			'language' => 'Turkish',
			'aliases'  => array( 'tr', 'tr_TR' ),
		),
		'zh-cn' => array(
			'language' => 'Chinese (China)',
			'aliases'  => array( 'zh-cn', 'zh_CN' ),
		),
		'zh-tw' => array(
			'language' => 'Chinese (Taiwan)',
			'aliases'  => array( 'zh-tw', 'zh_TW' ),
		),
	);

	/**
	 * Get singleton instance.
	 *
	 * @return Easy_Site_Editor
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'load_textdomain' ) );
		add_action( 'admin_menu', array( $this, 'register_admin_page' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
		add_filter( 'load_script_translation_file', array( $this, 'filter_script_translation_file' ), 10, 3 );

		/*
		 * Two copies of the preview-frame code exist during the migration:
		 * the original below, and a copy in the plugin at
		 * lib/class-big-sky-easy-mode-preview.php. The plugin's copy is the
		 * permanent one — this whole package is deleted at cutover.
		 *
		 * Only one copy may hook up on any given request. If both did, the
		 * preview frame would get everything twice: two postMessage listeners
		 * answering every state request, duplicate click/submit handlers and
		 * MutationObservers, and repeated element ids.
		 *
		 * Which copy serves is decided here, per request, by looking at the
		 * frame's own URL: an easy-mode frame carries `?easy-mode=true`, so
		 * is_active() is true and this package steps aside for the plugin's
		 * copy. Any other preview frame is a classic Easy Site Editor one and
		 * keeps being served by the code below — a user who has not opted
		 * into easy mode sees no change at all.
		 */
		if (
			class_exists( 'Big_Sky_Easy_Mode_Preview' )
			&& class_exists( 'Big_Sky_Easy_Mode' )
			&& Big_Sky_Easy_Mode::is_active()
		) {
			return;
		}

		add_filter( 'show_admin_bar', array( $this, 'maybe_hide_admin_bar_on_preview' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'maybe_enqueue_preview_dependencies' ) );
		add_action( 'wp_head', array( $this, 'maybe_output_preview_frame_styles' ), 999 );
		add_action( 'wp_footer', array( $this, 'maybe_output_preview_state_listener' ), 999 );
		add_action( 'wp_footer', array( $this, 'maybe_output_preview_navigation_script' ), 999 );
	}

	/**
	 * Load plugin translations.
	 *
	 * @return void
	 */
	public function load_textdomain() {
		load_plugin_textdomain(
			'easy-site-editor',
			false,
			dirname( plugin_basename( EASY_SITE_EDITOR_FILE ) ) . '/languages'
		);
	}

	/**
	 * Register the admin page.
	 *
	 * @return void
	 */
	public function register_admin_page() {
		add_menu_page(
			__( 'AI Editor', 'easy-site-editor' ),
			__( 'AI Editor', 'easy-site-editor' ),
			'edit_theme_options',
			self::PAGE_SLUG,
			array( $this, 'render_admin_page' ),
			'dashicons-format-chat',
			3
		);

		if ( defined( 'BIG_SKY_HOSTED_EASY_SITE_EDITOR' ) && BIG_SKY_HOSTED_EASY_SITE_EDITOR ) {
			remove_menu_page( self::PAGE_SLUG );
			return;
		}

		if ( ! $this->is_local_environment() ) {
			remove_menu_page( self::PAGE_SLUG );
		}
	}

	/**
	 * Determine whether this plugin is running in a local development environment.
	 *
	 * @return bool
	 */
	private function is_local_environment() {
		$host = wp_parse_url( get_site_url(), PHP_URL_HOST );
		if ( ! is_string( $host ) ) {
			return false;
		}

		$host = strtolower( $host );

		return in_array( $host, array( 'localhost', '127.0.0.1', '::1' ), true )
			|| '.jurassic.tube' === substr( $host, -14 )
			|| '.jurassic.ninja' === substr( $host, -15 );
	}

	/**
	 * Enqueue assets for the admin page.
	 *
	 * @param string $hook_suffix Current page hook.
	 * @return void
	 */
	public function enqueue_admin_assets( $hook_suffix ) {
		if ( 'toplevel_page_' . self::PAGE_SLUG !== $hook_suffix ) {
			return;
		}

		$this->disable_agents_manager_for_screen();

		$script_rel = 'assets/easy-site-editor.js';
		$script_abs = EASY_SITE_EDITOR_DIR . 'dist/' . $script_rel;
		if ( ! file_exists( $script_abs ) ) {
			return;
		}

		$asset                 = $this->get_script_asset_data( $script_abs );
		$asset['dependencies'] = array_values(
			array_unique(
				array_merge(
					$asset['dependencies'],
					array( 'wp-hooks', 'wp-media-utils' )
				)
			)
		);

		$this->prepare_block_editor_asset_context();

		// Block editor infrastructure for inline editing.
		wp_enqueue_script( 'wp-format-library' );
		wp_enqueue_script( 'wp-media-utils' );
		wp_enqueue_media();

		// Block editor styles — needed in the parent page for toolbars
		// and popovers that render outside the BlockCanvas iframe.
		wp_enqueue_style( 'wp-block-editor' );
		wp_enqueue_style( 'wp-components' );
		wp_enqueue_style( 'wp-format-library' );

		$this->enqueue_block_editor_extension_assets();
		$this->enqueue_registered_block_type_assets();

		$editor_settings  = $this->get_admin_editor_settings();
		$block_categories = $editor_settings['blockCategories'] ?? array();
		$locale_settings  = $this->get_user_locale_settings();

		// Bootstrap server-registered block metadata (title, category, attributes,
		// etc.) to the client, exactly as WordPress' own block editors do. Block
		// editor scripts commonly call `registerBlockType()` with just a name and
		// rely on the server for the rest of the definition; without this bootstrap
		// those blocks silently fail to register ("block must have a title") and
		// render the block-recovery notice instead.
		if ( function_exists( 'get_block_editor_server_block_settings' ) ) {
			wp_add_inline_script(
				'wp-blocks',
				sprintf(
					'wp.blocks.unstable__bootstrapServerSideBlockDefinitions( %s );',
					wp_json_encode( get_block_editor_server_block_settings(), JSON_HEX_TAG | JSON_UNESCAPED_SLASHES )
				),
				'after'
			);
		}

		wp_add_inline_script(
			'wp-blocks',
			'wp.blocks.setCategories(' . wp_json_encode( $block_categories ) . ');',
			'after'
		);

		wp_enqueue_script(
			'easy-site-editor-app',
			EASY_SITE_EDITOR_URL . 'dist/' . $script_rel,
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_set_script_translations(
			'easy-site-editor-app',
			'easy-site-editor',
			EASY_SITE_EDITOR_DIR . 'languages'
		);

		$this->bootstrap_jetpack_auth_state( 'easy-site-editor-app' );

		foreach ( $this->get_css_asset_paths() as $index => $css_abs ) {
			$css_rel = str_replace( EASY_SITE_EDITOR_DIR . 'dist/', '', $css_abs );

			wp_enqueue_style(
				'easy-site-editor-style-' . $index,
				EASY_SITE_EDITOR_URL . 'dist/' . $css_rel,
				array(),
				file_exists( $css_abs ) ? filemtime( $css_abs ) : false
			);
		}

		wp_localize_script(
			'easy-site-editor-app',
			'EasySiteEditorConfig',
			array(
				'siteName'                  => get_bloginfo( 'name' ),
				'siteTagline'               => get_bloginfo( 'description' ),
				'siteHomeUrl'               => esc_url_raw( home_url( '/' ) ),
				'coreSiteEditorUrl'         => esc_url_raw( admin_url( 'site-editor.php' ) ),
				'previewBaseUrl'            => esc_url_raw( add_query_arg( 'easy-site-editor-preview', '1', home_url( '/' ) ) ),
				'previewStateToken'         => wp_create_nonce( self::PREVIEW_STATE_NONCE_ACTION ),
				'sessionStorageKey'         => 'easy_site_editor_session_' . get_current_blog_id(),
				'previewLocationStorageKey' => 'easy_site_editor_preview_location_' . get_current_blog_id(),
				'easySiteEditorVersion'     => EASY_SITE_EDITOR_VERSION,
				'isTest'                    => defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG,
				'isA11n'                    => function_exists( 'is_automattician' ) && is_automattician(),
				'isSiteUnlaunched'          => $this->should_show_launch_site_button(),
				'launchSiteUrl'             => $this->get_launch_site_url(),
				'wpcomAgentUrl'             => 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
				'wpcomAgentId'              => 'wp-orchestrator',
				'errorLogEndpoint'          => '/wpcom/v2/big-sky/v1/session',
				'editorSettings'            => $editor_settings,
				'userLocale'                => $locale_settings['userLocale'],
				'userLanguage'              => $locale_settings['userLanguage'],
				'agentticLocale'            => $locale_settings['agentticLocale'],
			)
		);
	}

	/**
	 * Point core at the JSON translation file that actually ships on disk.
	 *
	 * Core derives the JSON translation filename from an MD5 of the script's URL
	 * path relative to its plugin directory (see `load_script_textdomain()`).
	 * That relative path depends on where this package is mounted: as its own
	 * plugin it is `dist/assets/easy-site-editor.js`, but when loaded through Big
	 * Sky it becomes `packages/easy-site-editor/dist/assets/easy-site-editor.js`,
	 * which hashes differently. The bundled JSON files in `languages/` are always
	 * generated (by `bin/i18n/build.sh`) using the hash of the package-relative
	 * `dist/assets/easy-site-editor.js`, so on the hosted path core looks for a
	 * hash that never ships and `wp_set_script_translations()` silently loads
	 * nothing — every JS string renders in English for non-English users.
	 *
	 * This filter detects that miss for our script and redirects the lookup to
	 * the correctly-named file. Standalone loading is unaffected: there the file
	 * core computes already exists, so we return it untouched.
	 *
	 * @param string|false $file   Path to the translation file core resolved.
	 * @param string       $handle Script handle the translations are for.
	 * @param string       $domain Text domain.
	 * @return string|false Filtered translation file path.
	 */
	public function filter_script_translation_file( $file, $handle, $domain ) {
		if ( 'easy-site-editor-app' !== $handle || 'easy-site-editor' !== $domain ) {
			return $file;
		}

		// Core already resolved an existing file (e.g. the standalone-plugin
		// path); leave it untouched to avoid regressing that scenario.
		if ( is_string( $file ) && file_exists( $file ) ) {
			return $file;
		}

		// The JSON files are named with the hash of the package-relative script
		// path, matching the map used in bin/i18n/build.sh.
		$hash      = md5( 'dist/assets/easy-site-editor.js' );
		$locale    = determine_locale();
		$candidate = EASY_SITE_EDITOR_DIR . 'languages/' . $domain . '-' . $locale . '-' . $hash . '.json';

		return file_exists( $candidate ) ? $candidate : $file;
	}

	/**
	 * Get locale settings for the current user.
	 *
	 * Resolves the user's WP locale to a bundled AgentUI translation. Tries
	 * an exact alias match first, then falls back to the language prefix
	 * (e.g. `de_AT` → `de`). Region-specific translations such as `pt-br`
	 * intentionally don't match bare-language prefixes (`pt_PT` won't be
	 * served Brazilian Portuguese).
	 *
	 * @return array{userLocale:string,userLanguage:string,agentticLocale:string}
	 */
	private function get_user_locale_settings() {
		$user_locale = get_user_locale();

		foreach ( self::SUPPORTED_LOCALES as $agenttic_locale => $info ) {
			if ( in_array( $user_locale, $info['aliases'], true ) ) {
				return array(
					'userLocale'     => $user_locale,
					'userLanguage'   => $info['language'],
					'agentticLocale' => $agenttic_locale,
				);
			}
		}

		$prefix = strstr( $user_locale, '_', true );
		if ( is_string( $prefix ) && isset( self::SUPPORTED_LOCALES[ $prefix ] ) ) {
			return array(
				'userLocale'     => $user_locale,
				'userLanguage'   => self::SUPPORTED_LOCALES[ $prefix ]['language'],
				'agentticLocale' => $prefix,
			);
		}

		return array(
			'userLocale'     => 'en_US',
			'userLanguage'   => 'English (United States)',
			'agentticLocale' => 'en',
		);
	}

	/**
	 * Make the custom ESE admin page look like a block editor to asset hooks.
	 *
	 * WordPress.com and Jetpack register many editor-only block bundles from
	 * block editor asset hooks. Those callbacks commonly check the current screen
	 * before loading, so mark this screen accordingly before the hooks run.
	 *
	 * @return void
	 */
	private function prepare_block_editor_asset_context() {
		if ( ! function_exists( 'get_current_screen' ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( ! $screen ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( '[ESE] prepare_block_editor_asset_context: get_current_screen() returned null; block editor assets may not load correctly.' );
			return;
		}

		// These mutations intentionally persist for the rest of the request: ESE's
		// admin page IS the block editor surface, so downstream hooks (admin
		// notices, footer scripts, etc.) should continue to see block-editor
		// context after this method returns.
		if ( method_exists( $screen, 'is_block_editor' ) ) {
			$screen->is_block_editor( true );
		}

		// Pin to 'page' as a reasonable default. The real entity isn't knowable
		// here: the admin URL carries no post id, get_queried_object() is null on
		// this custom admin screen, and the SPA selects (and switches) the entity
		// client-side after mount with no PHP re-enqueue.
		$screen->post_type = 'page';
	}

	/**
	 * Prevent Jetpack's Agents Manager from activating on the ESE admin screen.
	 *
	 * ESE ships its own AI chat panel and a bespoke full-screen layout. To load
	 * plugin block bundles it presents this custom admin page as a block editor
	 * (see prepare_block_editor_asset_context()) and fires enqueue_block_editor_assets().
	 * Agents Manager hooks that action and, when enabled for the block editor, injects
	 * its docked-sidebar chrome (the `agents-manager-sidebar-container` body classes and
	 * agents-manager stylesheet), which conflicts with ESE's layout. Force both of its
	 * enablement gates off for this request so it stays inert on this screen.
	 *
	 * @return void
	 */
	private function disable_agents_manager_for_screen() {
		add_filter( 'agents_manager_enabled_in_block_editor', '__return_false', 999 );
		add_filter( 'agents_manager_use_unified_experience', '__return_false', 999 );
	}

	/**
	 * Fire the standard block editor asset hooks for plugin block registration.
	 *
	 * The Site Editor gets WPCOM/Jetpack/Woo block bundles from these hooks. ESE
	 * hosts its own editor surface, so it needs to run the same hooks explicitly.
	 *
	 * Output is buffered because some plugin callbacks emit stray markup (or
	 * notices) during these actions, which would corrupt admin page headers.
	 * Non-empty buffered output is forwarded to error_log so genuine
	 * misbehaviour is still visible.
	 *
	 * @return void
	 */
	private function enqueue_block_editor_extension_assets() {
		add_filter( 'should_load_block_editor_scripts_and_styles', '__return_true' );
		ob_start();

		try {
			do_action( 'enqueue_block_assets' );
			do_action( 'enqueue_block_editor_assets' );
		} finally {
			remove_filter( 'should_load_block_editor_scripts_and_styles', '__return_true' );
			$stray_output = ob_get_clean();

			if ( '' !== trim( (string) $stray_output ) ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( '[ESE] Stray output from block editor asset hooks: ' . $stray_output );
			}
		}
	}

	/**
	 * Enqueue script and style handles declared by all registered block types.
	 *
	 * This mirrors WordPress' registered block asset enqueueing, while keeping it
	 * deterministic for ESE's custom admin page.
	 *
	 * @return void
	 */
	private function enqueue_registered_block_type_assets() {
		$block_registry = WP_Block_Type_Registry::get_instance();

		foreach ( $block_registry->get_all_registered() as $block_type ) {
			$this->enqueue_block_type_style_handles( $block_type->style_handles );
			$this->enqueue_block_type_style_handles( $block_type->editor_style_handles );
			$this->enqueue_block_type_script_handles( $block_type->script_handles );
			$this->enqueue_block_type_script_handles( $block_type->editor_script_handles );
		}
	}

	/**
	 * Enqueue a set of block style handles.
	 *
	 * Skips handles that are not registered. Block types may declare style
	 * handles that are conditionally registered (e.g. front-end only); calling
	 * `wp_enqueue_style` on an unknown handle would trigger `_doing_it_wrong`.
	 *
	 * @param array<int, string> $handles Style handles.
	 * @return void
	 */
	private function enqueue_block_type_style_handles( $handles ) {
		$styles = wp_styles();

		foreach ( $handles as $handle ) {
			if ( $styles->query( $handle, 'registered' ) ) {
				wp_enqueue_style( $handle );
			}
		}
	}

	/**
	 * Enqueue a set of block script handles.
	 *
	 * Skips handles that are not registered. Block types may declare script
	 * handles that are conditionally registered (e.g. front-end only); calling
	 * `wp_enqueue_script` on an unknown handle would trigger `_doing_it_wrong`.
	 *
	 * @param array<int, string> $handles Script handles.
	 * @return void
	 */
	private function enqueue_block_type_script_handles( $handles ) {
		$scripts = wp_scripts();

		foreach ( $handles as $handle ) {
			if ( $scripts->query( $handle, 'registered' ) ) {
				wp_enqueue_script( $handle );
			}
		}
	}

	/**
	 * Find built CSS assets for the admin app.
	 *
	 * @return array<int, string>
	 */
	private function get_css_asset_paths() {
		$base_path = EASY_SITE_EDITOR_DIR . 'dist/assets/';
		$css_file  = is_rtl() ? $base_path . 'easy-site-editor-rtl.css' : $base_path . 'easy-site-editor.css';

		if ( file_exists( $css_file ) ) {
			return array( $css_file );
		}

		return array();
	}

	/**
	 * Get script dependency metadata in the same shape used by wp-scripts.
	 *
	 * @param string $script_abs Absolute path to the built entry script.
	 * @return array{dependencies: array<int, string>, version: string|int|false}
	 */
	private function get_script_asset_data( $script_abs ) {
		$asset_file = preg_replace( '/\.js$/', '.asset.php', $script_abs );

		if ( is_string( $asset_file ) && file_exists( $asset_file ) ) {
			$asset = require $asset_file;

			if ( is_array( $asset ) ) {
				return array(
					'dependencies' => isset( $asset['dependencies'] ) && is_array( $asset['dependencies'] ) ? $asset['dependencies'] : array( 'wp-api-fetch' ),
					'version'      => $asset['version'] ?? ( file_exists( $script_abs ) ? filemtime( $script_abs ) : false ),
				);
			}
		}

		return array(
			'dependencies' => array( 'wp-api-fetch' ),
			'version'      => file_exists( $script_abs ) ? filemtime( $script_abs ) : false,
		);
	}

	/**
	 * Determine whether the launch site affordance should be shown in ESE.
	 *
	 * This mirrors the WordPress.com admin-bar launch button gate, where
	 * `launch-status=unlaunched` is the flag that marks a site as not launched.
	 *
	 * @return bool
	 */
	private function should_show_launch_site_button() {
		$current_blog_id = get_current_blog_id();

		if ( function_exists( 'is_graylisted' ) && is_graylisted( $current_blog_id ) ) {
			return false;
		}

		if ( ! is_user_logged_in() ) {
			return false;
		}

		if (
			function_exists( 'is_user_member_of_blog' )
			&& ! is_user_member_of_blog( get_current_user_id(), $current_blog_id )
		) {
			return false;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		if ( function_exists( 'has_blog_sticker' ) && has_blog_sticker( 'difm-lite-in-progress' ) ) {
			return false;
		}

		if ( ! empty( get_option( 'is_fully_managed_agency_site' ) ) ) {
			return false;
		}

		if ( 'unlaunched' !== get_option( 'launch-status' ) ) {
			return false;
		}

		if ( 1 === $current_blog_id && defined( 'IS_WPCOM' ) && IS_WPCOM ) {
			return false;
		}

		return true;
	}

	/**
	 * Get the WordPress.com launch flow URL for the current site.
	 *
	 * @return string
	 */
	private function get_launch_site_url() {
		if ( ! $this->should_show_launch_site_button() ) {
			return '';
		}

		$site_slug = wp_parse_url( home_url(), PHP_URL_HOST );

		if ( ! is_string( $site_slug ) || '' === $site_slug ) {
			return '';
		}

		$launch_site_url = function_exists( 'localized_wpcom_url' )
			? localized_wpcom_url( 'https://wordpress.com/start/launch-site' )
			// phpcs:ignore WPCOM.I18nRules.LocalizedUrl.UnlocalizedUrl -- Fallback for non-WPCOM environments.
			: 'https://wordpress.com/start/launch-site';

		return esc_url_raw(
			add_query_arg(
				array(
					'siteSlug' => $site_slug,
					'ref'      => 'wp-admin',
				),
				$launch_site_url
			)
		);
	}

	/**
	 * Bootstrap the Jetpack auth state required for wpcom agent requests.
	 *
	 * @param string $script_handle Script handle.
	 * @return void
	 */
	private function bootstrap_jetpack_auth_state( $script_handle ) {
		if ( class_exists( 'Automattic\Jetpack\Connection\Initial_State' ) ) {
			Automattic\Jetpack\Connection\Initial_State::render_script( $script_handle );
		}

		$wpcom_blog_id = $this->get_wpcom_blog_id();
		if ( null === $wpcom_blog_id ) {
			return;
		}

		wp_add_inline_script(
			$script_handle,
			sprintf(
				'(function() {
					window.Jetpack_Editor_Initial_State = {
						...( window.Jetpack_Editor_Initial_State || {} ),
						wpcomBlogId: %s
					};
				})();',
				wp_json_encode( (string) $wpcom_blog_id )
			),
			'before'
		);
	}

	/**
	 * Get the connected WordPress.com blog ID when available.
	 *
	 * @return int|null
	 */
	private function get_wpcom_blog_id() {
		if ( class_exists( 'Jetpack_Options' ) ) {
			$wpcom_blog_id = Jetpack_Options::get_option( 'id' );

			if ( is_numeric( $wpcom_blog_id ) ) {
				return (int) $wpcom_blog_id;
			}
		}

		if ( function_exists( 'wpcom_is_proxied_request' ) && wpcom_is_proxied_request() ) {
			return get_current_blog_id();
		}

		return null;
	}

	/**
	 * Hide the admin bar in preview mode.
	 *
	 * @param bool $show_admin_bar Whether the admin bar should be shown.
	 * @return bool
	 */
	public function maybe_hide_admin_bar_on_preview( $show_admin_bar ) {
		if ( is_admin() ) {
			return $show_admin_bar;
		}

		if ( $this->is_preview_mode() ) {
			return false;
		}

		return $show_admin_bar;
	}

	/**
	 * Enqueue frontend dependencies needed by preview-mode theme scripts.
	 *
	 * @return void
	 */
	public function maybe_enqueue_preview_dependencies() {
		if ( is_admin() || ! $this->is_preview_mode() ) {
			return;
		}

		wp_enqueue_script( 'jquery' );
	}

	/**
	 * Get block editor settings for the admin page.
	 *
	 * Uses a generic context (no specific post) so settings can be
	 * computed at page load before a post is selected for editing.
	 *
	 * @return array<string, mixed>
	 */
	private function get_admin_editor_settings() {
		$context = new WP_Block_Editor_Context( array( 'name' => 'easy-site-editor' ) );

		$settings                   = get_block_editor_settings( array(), $context );
		$settings['canUploadMedia'] = current_user_can( 'upload_files' );

		return $settings;
	}

	/**
	 * Force-hide admin chrome in preview mode.
	 *
	 * Some environments still render the frontend admin bar markup even when
	 * `show_admin_bar` is filtered off, so we also hide it with CSS. Also opts the
	 * preview document into cross-document view transitions so same-origin
	 * navigations inside the iframe cross-fade natively instead of flashing.
	 *
	 * @return void
	 */
	public function maybe_output_preview_frame_styles() {
		if ( is_admin() || ! $this->is_preview_mode() ) {
			return;
		}
		?>
		<style id="easy-site-editor-preview-frame-styles">
			@view-transition {
				navigation: auto;
			}

			html {
				margin-top: 0 !important;
			}

			html #wpadminbar {
				display: none !important;
			}
		</style>
		<?php
	}

	/**
	 * Install a postMessage listener that replies to parent requests for preview state.
	 *
	 * The parent editor asks for state once the iframe has loaded; we require the
	 * editor nonce before replying so arbitrary embedders cannot request state.
	 *
	 * @return void
	 */
	public function maybe_output_preview_state_listener() {
		if ( is_admin() || ! $this->is_preview_mode() ) {
			return;
		}

		$state               = array(
			'type'    => 'easy-site-editor:preview-state',
			'payload' => array(
				'currentEntity' => $this->get_current_entity(),
			),
		);
		$preview_state_token = wp_create_nonce( self::PREVIEW_STATE_NONCE_ACTION );

		$script = <<<'JS'
			( function ( state, expectedToken ) {
				window.addEventListener( 'message', function ( event ) {
					if ( ! event.data || event.data.type !== 'easy-site-editor:request-preview-state' ) {
						return;
					}
					/*
					 * This is a front-end page and WordPress sends no
					 * X-Frame-Options for it, so any site may frame it — and
					 * event.source === window.parent is just as true of a
					 * cross-origin framer as of the editor. The reply carries
					 * canEditContent, which would tell that site whether the
					 * visitor is an editor here. The token below already made
					 * that impractical; this makes it impossible.
					 */
					if ( event.origin !== window.location.origin ) {
						return;
					}
					if ( event.data.token !== expectedToken ) {
						return;
					}
					if ( event.source !== window.parent ) {
						return;
					}
					try {
						event.source.postMessage( state, event.origin );
					} catch ( error ) {
						// Parent window may have closed between request and reply.
					}
				} );
			} )( %s, %s );
			JS;

		wp_print_inline_script_tag(
			sprintf(
				$script,
				wp_json_encode( $state ),
				wp_json_encode( $preview_state_token )
			),
			array( 'id' => 'easy-site-editor-preview-state-listener' )
		);
	}

	/**
	 * Describe the currently-viewed entity for the preview initial state.
	 *
	 * Only single WP_Post objects are returned. Terms, archives, 404s, and the
	 * homepage (when not a static front page) produce null — the agent has no
	 * established context shape for those.
	 *
	 * @return array{entityType: string, entityId: string, canEditContent: bool}|null
	 */
	private function get_current_entity() {
		$queried = get_queried_object();

		if ( $queried instanceof WP_Post ) {
			return array(
				'entityType'     => $queried->post_type,
				'entityId'       => (string) $queried->ID,
				'canEditContent' => in_array( $queried->post_type, array( 'post', 'page' ), true ) && current_user_can( 'edit_post', $queried->ID ),
			);
		}

		return null;
	}

	/**
	 * Preserve preview mode during iframe navigation.
	 *
	 * Internal links inside the preview should continue to carry the preview
	 * query arg so subsequent pages also hide WordPress admin chrome.
	 *
	 * @return void
	 */
	public function maybe_output_preview_navigation_script() {
		if ( is_admin() || ! $this->is_preview_mode() ) {
			return;
		}
		?>
		<script id="easy-site-editor-preview-navigation">
			(function() {
				const previewParam = 'easy-site-editor-preview';
				const previewValue = '1';
				const externalLinkOriginalAttributes = new WeakMap();

				function getUrl(value) {
					if (!value || value.charAt(0) === '#') {
						return null;
					}

					try {
						return new URL(value, window.location.href);
					} catch (error) {
						return null;
					}
				}

				function isHttpUrl(url) {
					return /^https?:$/.test(url.protocol);
				}

				function getPreviewUrl(value) {
					const nextUrl = getUrl(value);

					if (!nextUrl || !isHttpUrl(nextUrl)) {
						return null;
					}

					if (nextUrl.origin !== window.location.origin) {
						return null;
					}

					nextUrl.searchParams.set(previewParam, previewValue);

					return nextUrl.toString();
				}

				function setExternalLinkRel(link) {
					const relTokens = new Set(
						(link.getAttribute('rel') || '')
							.split(/\s+/)
							.filter(Boolean)
					);

					relTokens.delete('opener');
					relTokens.add('noopener');
					relTokens.add('noreferrer');
					link.setAttribute('rel', Array.from(relTokens).join(' '));
				}

				function rewriteExternalLink(link) {
					const nextUrl = getUrl(link.getAttribute('href'));

					if (
						!nextUrl ||
						!isHttpUrl(nextUrl) ||
						nextUrl.origin === window.location.origin
					) {
						return false;
					}

					if (!externalLinkOriginalAttributes.has(link)) {
						externalLinkOriginalAttributes.set(link, {
							target: link.getAttribute('target'),
							rel: link.getAttribute('rel'),
						});
					}

					// External pages often block framing, so keep the preview
					// iframe on-site and open those links outside the pane.
					link.setAttribute('target', '_blank');
					setExternalLinkRel(link);

					return true;
				}

				function restoreLinkAttributes(link) {
					const originalAttributes = externalLinkOriginalAttributes.get(link);

					if (!originalAttributes) {
						return;
					}

					if (originalAttributes.target === null) {
						link.removeAttribute('target');
					} else {
						link.setAttribute('target', originalAttributes.target);
					}

					if (originalAttributes.rel === null) {
						link.removeAttribute('rel');
					} else {
						link.setAttribute('rel', originalAttributes.rel);
					}

					externalLinkOriginalAttributes.delete(link);
				}

				function rewriteLink(link) {
					if (rewriteExternalLink(link)) {
						return;
					}

					restoreLinkAttributes(link);

					const href = link.getAttribute('href');
					const previewUrl = getPreviewUrl(href);

					if (previewUrl) {
						link.setAttribute('href', previewUrl);
					}
				}

				function rewriteForm(form) {
					const action = form.getAttribute('action') || window.location.href;
					const previewUrl = getPreviewUrl(action);

					if (previewUrl) {
						form.setAttribute('action', previewUrl);
					}
				}

				function processNode(root) {
					if (!(root instanceof Element || root instanceof Document)) {
						return;
					}

					if (root instanceof Element) {
						if (root.matches('a[href]')) {
							rewriteLink(root);
						}

						if (root.matches('form')) {
							rewriteForm(root);
						}
					}

					root.querySelectorAll('a[href]').forEach(rewriteLink);
					root.querySelectorAll('form').forEach(rewriteForm);
				}

				processNode(document);

				document.addEventListener('click', function(event) {
					const link = event.target.closest('a[href]');

					if (link) {
						rewriteLink(link);
					}
				}, true);

				document.addEventListener('submit', function(event) {
					if (event.target instanceof HTMLFormElement) {
						rewriteForm(event.target);
					}
				}, true);

				const observer = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
						mutation.addedNodes.forEach(processNode);
					});
				});

				observer.observe(document.documentElement, {
					childList: true,
					subtree: true,
				});
			})();
		</script>
		<?php
	}

	/**
	 * Determine whether the current request is for the iframe preview.
	 *
	 * @return bool
	 */
	private function is_preview_mode() {
		$preview_mode = filter_input( INPUT_GET, 'easy-site-editor-preview', FILTER_SANITIZE_FULL_SPECIAL_CHARS );

		return '1' === $preview_mode;
	}

	/**
	 * Render the admin page.
	 *
	 * @return void
	 */
	public function render_admin_page() {
		$has_assets = file_exists( EASY_SITE_EDITOR_DIR . 'dist/assets/easy-site-editor.js' );
		?>
		<?php if ( ! $has_assets ) : ?>
			<div class="notice notice-warning inline">
				<p><?php esc_html_e( 'Assets have not been built yet. Run pnpm build in the plugin directory, then reload this page.', 'easy-site-editor' ); ?></p>
			</div>
		<?php endif; ?>

		<div id="easy-site-editor-root"></div>
		<?php
	}
}
