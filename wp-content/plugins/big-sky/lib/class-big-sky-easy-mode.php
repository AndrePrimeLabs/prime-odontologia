<?php
/**
 * Easy Mode: a locked-down layer over the Gutenberg site editor.
 *
 * A presentation layer on site-editor.php: forced distraction-free chrome, a
 * simplified topbar, and a true front-end preview. Agent functionality comes
 * from the unified experience (agents-manager dock + calypso-agent-provider),
 * not from here.
 *
 * @package BigSky
 */

if ( ! class_exists( 'Big_Sky_Easy_Mode' ) ) {
	/**
	 * Class Big_Sky_Easy_Mode
	 *
	 * Gates and bootstraps easy mode on site-editor.php.
	 */
	class Big_Sky_Easy_Mode {

		/** Direct-entry hint: open the agent and the requested page. */
		const OPT_IN_PARAM = 'easy-mode';

		/**
		 * Persistent opt-out control, honoured on site-editor.php for users who
		 * can open it; false clears the preference.
		 */
		const OPT_OUT_PARAM = 'disable-easy-mode';

		/**
		 * Browser/site preference, shared by wp-admin and the preview frame.
		 * Separate from the obsolete big_sky_easy_mode positive session cookie,
		 * which is no longer read or written.
		 */
		const OPT_OUT_COOKIE = 'big_sky_disable_easy_mode';

		/**
		 * Per-request memo for is_active(). Null until first asked.
		 *
		 * @var bool|null
		 */
		private static $active = null;

		/**
		 * Register hooks. Called from Big_Sky::init().
		 */
		public static function init() {
			/*
			 * Priority 0 at `init`: the opt-out must be settled before anything
			 * asks is_active() and — because it may write a cookie and redirect —
			 * before any output is sent. The preview endpoint asks at priority 10.
			 */
			add_action( 'init', array( __CLASS__, 'maybe_persist_opt_out' ), 0 );

			add_action( 'load-site-editor.php', array( __CLASS__, 'maybe_redirect_to_edit_canvas' ) );
			add_action( 'admin_enqueue_scripts', array( __CLASS__, 'maybe_enqueue_assets' ) );
			add_filter( 'admin_body_class', array( __CLASS__, 'maybe_add_body_class' ) );

			// Priority 0: the lockdown CSS must land before core's styles paint,
			// so easy-mode users never see a flash of core chrome.
			add_action( 'admin_head-site-editor.php', array( __CLASS__, 'maybe_inject_chrome_css' ), 0 );
		}

		/**
		 * Tag the site editor screen so the lockdown stylesheet — and easy mode's
		 * own styles — can scope to a class this plugin owns rather than a core
		 * class that may drift.
		 *
		 * @param string $classes Space-separated admin body classes.
		 * @return string
		 */
		public static function maybe_add_body_class( $classes ) {
			if ( self::is_site_editor_request() && self::is_active() ) {
				$classes .= ' big-sky-easy-mode';
			}

			return $classes;
		}

		/**
		 * Inject the lockdown stylesheet on the site editor screen.
		 */
		public static function maybe_inject_chrome_css() {
			if ( ! self::is_active() ) {
				return;
			}

			Big_Sky_Chrome::inject_easy_mode_chrome_css();
		}

		/**
		 * Persist disable-easy-mode=true for one year; false deletes the cookie.
		 *
		 * Honoured on site-editor.php only, for a user who can open it. The
		 * control is that screen's; answering it on every request let any link —
		 * or any page a visitor happened to load — write the cookie, and put a
		 * Set-Cookie on anonymous front-end responses.
		 *
		 * The control then comes off the URL. A request carrying it is a write,
		 * so left in the address bar it would repeat on every reload and travel
		 * with every copied link. The rest of the query goes with the redirect,
		 * and the reload passes the same gates as any other site editor load —
		 * the entry-hint redirect included, which then reads the settled
		 * preference.
		 *
		 * $_COOKIE is updated as well, for the request the redirect cannot end:
		 * with headers already sent neither the cookie nor the redirect can go
		 * out, and the current request should still behave as asked.
		 *
		 * Runs before output at init priority 0.
		 */
		public static function maybe_persist_opt_out() {
			$requested = self::get_boolean_param( self::OPT_OUT_PARAM );

			if (
				null === $requested
				|| ! self::is_site_editor_request()
				|| ! current_user_can( 'edit_theme_options' )
			) {
				return;
			}

			$options = array(
				// Survives browser restarts until cleared or expired.
				'expires'  => time() + YEAR_IN_SECONDS,
				// COOKIEPATH covers wp-admin and the front end, so the preview
				// iframe sees the same opt-out preference.
				'path'     => defined( 'COOKIEPATH' ) && COOKIEPATH ? COOKIEPATH : '/',
				'domain'   => defined( 'COOKIE_DOMAIN' ) && COOKIE_DOMAIN ? COOKIE_DOMAIN : '',
				'secure'   => is_ssl(),
				// Nothing in the browser needs to read this: the bundle is
				// served only when this preference allows it.
				'httponly' => true,
				'samesite' => 'Lax',
			);

			/*
			 * $_COOKIE is updated whether or not the header can go out, so this
			 * request behaves correctly either way. Only the REMEMBERING needs a
			 * header.
			 */
			if ( $requested ) {
				if ( ! headers_sent() ) {
					setcookie( self::OPT_OUT_COOKIE, '1', $options );
				}
				$_COOKIE[ self::OPT_OUT_COOKIE ] = '1';
			} else {
				if ( ! headers_sent() ) {
					$options['expires'] = time() - YEAR_IN_SECONDS;
					setcookie( self::OPT_OUT_COOKIE, '', $options );
				}
				unset( $_COOKIE[ self::OPT_OUT_COOKIE ] );
			}

			// The answer just changed; anything that asked earlier in this
			// request asked before it was settled.
			self::reset_request_cache();

			if ( wp_safe_redirect( self::get_opt_out_redirect_url() ) ) {
				exit;
			}
		}

		/**
		 * The current site editor URL without the opt-out control.
		 *
		 * Rebuilt from the query rather than trimmed off REQUEST_URI, the way
		 * get_edit_canvas_redirect_url() builds its target, so the two hops one
		 * load can take spell their parameters the same way.
		 *
		 * @return string
		 */
		public static function get_opt_out_redirect_url() {
			$params = self::get_scalar_query_params();
			unset( $params[ self::OPT_OUT_PARAM ] );

			$url = admin_url( 'site-editor.php' );

			if ( ! $params ) {
				return $url;
			}

			return $url . '?' . http_build_query( $params, '', '&', PHP_QUERY_RFC3986 );
		}

		/**
		 * Whether this request is for the site editor screen.
		 *
		 * Answerable at `init`: $pagenow is set while WordPress loads, well
		 * before the admin screen object exists.
		 *
		 * @return bool
		 */
		private static function is_site_editor_request() {
			global $pagenow;

			return is_admin() && 'site-editor.php' === $pagenow;
		}

		/**
		 * The request's scalar query params, sanitised.
		 *
		 * Array-valued params are dropped rather than fatalling through
		 * sanitize_text_field(): the site editor's routing params are all
		 * scalars.
		 *
		 * @return array<string, string>
		 */
		private static function get_scalar_query_params() {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only screen routing, not form data.
			return array_map( 'sanitize_text_field', array_filter( wp_unslash( $_GET ), 'is_string' ) );
		}

		/**
		 * Preview the requested page. The preview flag and the shared availability
		 * gate select the endpoint; no positive cookie or entry hint is needed.
		 *
		 * @return string
		 */
		public static function get_preview_base_url() {
			$url = add_query_arg( 'easy-site-editor-preview', '1', self::get_requested_page_url() );

			if ( self::is_opt_in_flag_set() ) {
				$url = add_query_arg( self::OPT_IN_PARAM, 'true', $url );
			}

			return esc_url_raw( $url );
		}

		/**
		 * The front end of whatever this request asked the editor to open.
		 *
		 * A `p=/page/4` load names a page, and the preview beside it should be
		 * showing that page rather than the site root — the two panes are one
		 * screen. The route is the site editor's own contract (see
		 * get_edit_canvas_redirect_url), and only `/{post type}/{id}` names
		 * something with a front end: `/` is the home template, `/pattern` and
		 * the rest are not pages at all, and all of them belong at the site root.
		 *
		 * Anything that does not resolve — a route to a record that has been
		 * deleted, a permalink WordPress declines to build — falls back to the
		 * home page rather than guessing.
		 *
		 * @return string Front-end URL.
		 */
		private static function get_requested_page_url() {
			$home = home_url( '/' );

			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only screen routing, not form data.
			$route = isset( $_GET['p'] ) && is_string( $_GET['p'] )
				// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only screen routing, not form data.
				? sanitize_text_field( wp_unslash( $_GET['p'] ) )
				: '';

			if ( ! preg_match( '#^/[a-z_-]+/(\d+)$#', $route, $matches ) ) {
				return $home;
			}

			$permalink = get_permalink( (int) $matches[1] );

			return is_string( $permalink ) ? $permalink : $home;
		}

		/**
		 * Whether easy mode is enabled for this site.
		 *
		 * Composes Big Sky's easy-mode gate (sticker + edit_theme_options).
		 * Relies on the current user being established, so it must not run
		 * earlier than `init`.
		 *
		 * @return bool
		 */
		public static function is_enabled() {
			$enabled = class_exists( 'Big_Sky' ) && Big_Sky::is_easy_mode_enabled();

			/**
			 * Filters whether Big Sky easy mode is enabled.
			 *
			 * Used by E2E to force easy mode on without wpcom authentication.
			 *
			 * @param bool $enabled Whether easy mode is enabled.
			 */
			return (bool) apply_filters( 'big_sky_easy_mode_enabled', $enabled );
		}

		/**
		 * Read a boolean query control, ignoring absent or malformed values.
		 *
		 * @param string $param Query parameter name.
		 * @return bool|null
		 */
		private static function get_boolean_param( $param ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Display preference control; values outside a fixed list are ignored, and the write it can trigger is gated in maybe_persist_opt_out().
			if ( ! isset( $_GET[ $param ] ) || ! is_string( $_GET[ $param ] ) ) {
				return null;
			}

			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Display preference control; values outside a fixed list are ignored, and the write it can trigger is gated in maybe_persist_opt_out().
			$value = strtolower( trim( sanitize_text_field( wp_unslash( $_GET[ $param ] ) ) ) );

			if ( 'true' === $value || '1' === $value ) {
				return true;
			}

			if ( 'false' === $value || '0' === $value ) {
				return false;
			}

			return null;
		}

		/**
		 * Whether this request explicitly asks to enter via `?easy-mode=true`.
		 *
		 * @return bool True if it does.
		 */
		public static function is_opt_in_flag_set() {
			return true === self::get_boolean_param( self::OPT_IN_PARAM );
		}

		/**
		 * Whether the current request opts out via `?disable-easy-mode=true`.
		 *
		 * @return bool True if it does.
		 */
		public static function is_opt_out_flag_set() {
			return true === self::get_boolean_param( self::OPT_OUT_PARAM );
		}

		/**
		 * Explicit disable controls override the saved preference. The independent
		 * easy-mode entry hint never changes or bypasses an opt-out.
		 *
		 * @return bool
		 */
		private static function is_opted_out() {
			$requested = self::get_boolean_param( self::OPT_OUT_PARAM );

			if ( null !== $requested ) {
				return $requested;
			}

			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only display preference.
			return isset( $_COOKIE[ self::OPT_OUT_COOKIE ] )
				&& '1' === $_COOKIE[ self::OPT_OUT_COOKIE ];
		}

		/**
		 * Load easy mode for eligible users unless they opted out. Its UI and
		 * editor locks still follow the docked chat and edit canvas client-side.
		 * Memoised so both preview implementations agree on which owns a request.
		 *
		 * @return bool
		 */
		public static function is_active() {
			if ( null !== self::$active ) {
				return self::$active;
			}

			$active = ! self::is_opted_out() && self::is_enabled();

			/**
			 * Filters whether easy mode applies to the current request.
			 *
			 * The seam E2E and local development use to activate easy mode
			 * without threading `?easy-mode=true` through every navigation.
			 * Applied once per request, so filters must be registered before
			 * the first is_active() call — in practice before `init` priority
			 * 1, where the Easy Site Editor package loader asks first.
			 *
			 * @param bool $active Whether easy mode is active for this request.
			 */
			self::$active = (bool) apply_filters( 'big_sky_easy_mode_active', $active );

			return self::$active;
		}

		/**
		 * Forget the memoised is_active() answer.
		 *
		 * For unit tests, which mutate $_GET and the gate filters between cases.
		 * Production has no use for it: a request's answer does not change.
		 */
		public static function reset_request_cache() {
			self::$active = null;
		}

		/**
		 * Only explicit entry links ask to skip to the edit canvas. Ordinary
		 * Site Editor loads keep their route, even if the agent is already open.
		 *
		 * @return bool
		 */
		public static function should_redirect_to_edit_canvas() {
			return self::is_active() && self::is_opt_in_flag_set();
		}

		/**
		 * Open the front page's edit canvas for a request that named no route,
		 * so opening the site editor lands an easy-mode user where they can work.
		 */
		public static function maybe_redirect_to_edit_canvas() {
			if ( ! self::should_redirect_to_edit_canvas() ) {
				return;
			}

			$url = self::get_edit_canvas_redirect_url();
			if ( null === $url ) {
				return;
			}

			wp_safe_redirect( $url );
			exit;
		}

		/**
		 * Build the canvas=edit redirect target for the current request.
		 *
		 * Only a request that names no route is redirected — no `p`, which is
		 * what arriving at site-editor.php from Calypso or the admin menu looks
		 * like. Without one the site editor opens `p=/`, its home *template*
		 * route, and easy mode edits pages; so it is given the front page, and
		 * the edit canvas to open it on.
		 *
		 * A request that DOES name a route is left exactly as written, canvas
		 * mode included. `?p=/` is someone asking for the design view of the home
		 * template, and `?p=/page/12` for that page's; rewriting either to
		 * `canvas=edit` would put the whole site editor out of reach for the rest
		 * of the session, since easy mode's chrome offers no way back to it.
		 *
		 * That is safe now in a way it was not before: easy mode no longer
		 * appears on the design view at all (see canvas-mode.ts and the lockdown
		 * stylesheet), so leaving someone there leaves them on a working screen.
		 *
		 * Split out from the hook so the URL rules are unit-testable without
		 * fighting the redirect's exit().
		 *
		 * @return string|null Redirect URL, or null when the request names its
		 *                     own route and should be left alone.
		 */
		public static function get_edit_canvas_redirect_url() {
			// Existing args are preserved across the redirect.
			$params = self::get_scalar_query_params();

			$front_page_id = class_exists( 'Big_Sky' ) ? Big_Sky::get_static_home_page_id() : 0;

			// Only when there is actually a static front page to supply —
			// otherwise this would redirect on every load and loop. A site
			// showing posts on the front page has no page to route to, and is
			// left on the site editor's `/` route: the home template, which is
			// the post list and is editable in easy mode just the same.
			$needs_page = empty( $params['p'] ) && $front_page_id > 0;

			if ( ! $needs_page ) {
				return null;
			}

			$params['canvas'] = 'edit';
			$params['p']      = '/page/' . $front_page_id;

			// http_build_query() rather than add_query_arg(): the latter does not
			// URL-encode, which would emit `p=/page/12` instead of the
			// `p=%2Fpage%2F12` form the site editor's routing contract documents.
			return admin_url( 'site-editor.php' ) . '?' . http_build_query( $params, '', '&', PHP_QUERY_RFC3986 );
		}

		/**
		 * Enqueue the easy-mode bundle on the site editor screen.
		 *
		 * @param string $hook_suffix Current admin page hook.
		 */
		public static function maybe_enqueue_assets( $hook_suffix ) {
			if ( 'site-editor.php' !== $hook_suffix || ! self::is_active() ) {
				return;
			}

			$build_path = plugin_dir_path( BIG_SKY__PLUGIN_FILE ) . 'build/easy-mode/';

			if ( ! file_exists( $build_path . 'easy-mode.js' ) ) {
				return;
			}

			$build_url = plugins_url( 'build/easy-mode/', BIG_SKY__PLUGIN_FILE );

			$asset_file = $build_path . 'easy-mode.asset.php';
			$asset      = file_exists( $asset_file ) ? require $asset_file : array();
			$version    = $asset['version'] ?? '1.0.0';

			wp_enqueue_script(
				'big-sky-easy-mode',
				$build_url . 'easy-mode.js',
				$asset['dependencies'] ?? array(),
				$version,
				true
			);

			wp_set_script_translations(
				'big-sky-easy-mode',
				'big-sky',
				plugin_dir_path( BIG_SKY__PLUGIN_FILE ) . 'languages'
			);

			// wp-scripts emits `style-<entry>.css` for a `style.scss` import, not
			// `<entry>.css`.
			if ( file_exists( $build_path . 'style-easy-mode.css' ) ) {
				wp_enqueue_style(
					'big-sky-easy-mode',
					$build_url . 'style-easy-mode.css',
					array(),
					$version
				);
				// Swaps in style-easy-mode-rtl.css for RTL locales.
				wp_style_add_data( 'big-sky-easy-mode', 'rtl', 'replace' );
			}

			// wp_add_inline_script rather than wp_localize_script: the latter casts
			// every scalar to a string, which would hand `frontPageId` to JS as
			// "2" instead of 2.
			wp_add_inline_script(
				'big-sky-easy-mode',
				'var bigSkyEasyMode = ' . wp_json_encode( self::get_script_config() ) . ';',
				'before'
			);
		}

		/**
		 * WordPress.com blog ID: the connection ID on Atomic/Jetpack, local ID on Simple.
		 *
		 * @return int Blog ID, or 0 when unavailable.
		 */
		private static function get_tracks_blog_id() {
			if ( class_exists( 'Jetpack_Options' ) ) {
				$blog_id = (int) \Jetpack_Options::get_option( 'id' );

				if ( $blog_id > 0 ) {
					return $blog_id;
				}
			}

			// Simple sites have no Jetpack connection to ask; there the local
			// blog id already IS the WordPress.com one.
			if ( class_exists( 'Big_Sky' ) && \Big_Sky::is_wpcom() ) {
				return (int) get_current_blog_id();
			}

			return 0;
		}

		/**
		 * Whether an Automattician is acting, including proxied requests.
		 *
		 * @return bool
		 */
		private static function is_a11n_context() {
			if ( function_exists( 'is_automattician' ) && is_automattician() ) {
				return true;
			}

			if ( function_exists( 'is_proxied_automattician' ) && is_proxied_automattician() ) {
				return true;
			}

			return defined( 'AT_PROXIED_REQUEST' ) && AT_PROXIED_REQUEST;
		}

		/**
		 * Whether support staff are acting. Kept separate from is_a11n and is_test.
		 *
		 * @return bool
		 */
		private static function is_support_staff() {
			if ( function_exists( 'is_automattic_happiness_contractor' ) && is_automattic_happiness_contractor() ) {
				return true;
			}

			return function_exists( 'is_automattic_happiness_contractor_wp_forums_staff' )
				&& is_automattic_happiness_contractor_wp_forums_staff();
		}

		/**
		 * Resolve the editor agent through the same filter as Agents Manager.
		 *
		 * @return string Agent ID.
		 */
		private static function get_tracks_agent_name() {
			/** This filter is documented in Agents Manager. */
			$agent_id = apply_filters( 'agents_manager_agent_id', null );

			if ( is_string( $agent_id ) && '' !== $agent_id ) {
				return $agent_id;
			}

			return class_exists( 'Big_Sky' )
				? \Big_Sky::AGENTS_MANAGER_EDITOR_AGENT_ID
				: 'wp-orchestrator';
		}

		/**
		 * Configuration and Tracks context for the easy-mode bundle.
		 * Independent of bigSkyInitialState, whose bundle may not be enqueued.
		 *
		 * @return array
		 */
		private static function get_script_config() {
			return array(
				'previewBaseUrl' => self::get_preview_base_url(),
				/*
				 * The page acting as the front page, and 0 when the front page
				 * is the posts index — which is a template rather than a page,
				 * so there is no id to switch to. The switcher reads the zero
				 * as "offer Home"; see components/page-switcher.tsx.
				 */
				'frontPageId'    => class_exists( 'Big_Sky' ) ? Big_Sky::get_static_home_page_id() : 0,
				// Where that Home entry points the preview.
				'homeUrl'        => home_url( '/' ),
				'siteEditorUrl'  => admin_url( 'site-editor.php' ),
				/*
				 * Whether THIS request asked for easy mode, as opposed to
				 * loading it by default. Asking for easy mode is asking
				 * for the assistant, so the bundle opens the chat on it — see
				 * showChatWhenReady, which will not otherwise reopen a chat the
				 * user closed.
				 *
				 * Answered here rather than read off the URL in JavaScript, so
				 * which spellings count as an answer stays in one place.
				 */
				'isOptInRequest' => self::is_opt_in_flag_set(),
				// Where the topbar's exit goes. Leaving easy mode is leaving
				// the editor: there is no in-place way out any more, so the
				// way back is the one the rest of wp-admin offers.
				'adminUrl'       => admin_url(),
				'blogId'         => self::get_tracks_blog_id(),
				'agentName'      => self::get_tracks_agent_name(),
				'isA11n'         => self::is_a11n_context(),
				'isSupportStaff' => self::is_support_staff(),
				'isTest'         => class_exists( 'Big_Sky' ) && \Big_Sky::is_dev_mode(),
				'agentVersion'   => self::get_plugin_version(),
			);
		}

		/**
		 * This plugin's version, for the Tracks `agent_version` property.
		 *
		 * @return string Version, or '0' when it cannot be read.
		 */
		private static function get_plugin_version() {
			if ( ! function_exists( 'get_plugin_data' ) ) {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
			}

			$data = get_plugin_data( BIG_SKY__PLUGIN_FILE, false, false );

			return $data['Version'] ?? '0';
		}
	}
}
