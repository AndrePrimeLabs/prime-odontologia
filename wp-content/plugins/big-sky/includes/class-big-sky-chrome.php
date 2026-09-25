<?php
/**
 * Big Sky Chrome Management
 *
 * Handles the injection of chrome (layout modifications around the main admin area) CSS and scripts for:
 * - WP Admin context (classic WordPress admin pages)
 * - Block Editor context (post.php, post-new.php)
 *
 * Chrome CSS is injected inline by PHP for instant rendering, then reused
 * by JavaScript for toggle operations without flicker.
 *
 * @package BigSky
 */

if ( ! class_exists( 'Big_Sky_Chrome' ) ) {
	/**
	 * Class Big_Sky_Chrome
	 *
	 * Manages chrome for the AI agent sidebar across
	 * different WordPress admin contexts.
	 */
	class Big_Sky_Chrome {

		/**
		 * Generate chrome removal script
		 * Shared logic for checking localStorage and conditionally removing chrome
		 *
		 * @param string $chrome_style_id The ID of the chrome style element.
		 * @param string $global_var_name The name of the global variable to store CSS.
		 */
		private static function get_chrome_script( $chrome_style_id, $global_var_name ) {
			?>
			(function() {
				// Store chrome CSS for later use
				var chromeStyle = document.getElementById('<?php echo esc_js( $chrome_style_id ); ?>');
				if (chromeStyle) {
					window.<?php echo esc_js( $global_var_name ); ?> = chromeStyle.textContent;
				}

				// Check if desktop size (matches useDockState.ts breakpoint)
				var isDesktop = window.matchMedia('(min-width: 1200px)').matches;

				// On mobile, always undock (ignore localStorage)
				if (!isDesktop) {
					if (chromeStyle) {
						chromeStyle.remove();
					}
					return;
				}

				// On desktop, check localStorage preferences
				var isDocked = true;
				try {
					var stored = localStorage.getItem('wp-orchestrator-docked');
					if (stored !== null) {
						isDocked = stored === 'true';
					}
				} catch (e) {}

				var isCollapsed = false;
				try {
					var chatState = localStorage.getItem('big-sky-orchestrator-chat-state');
					isCollapsed = chatState === 'collapsed';
				} catch (e) {}

				if (!isDocked || isCollapsed) {
					if (chromeStyle) {
						chromeStyle.remove();
					}
				}
			})();
			<?php
		}

		/**
		 * Inject wp-admin chrome CSS inline
		 * CSS applies to elements directly with for instant rendering
		 * Only applies to regular wp-admin pages (not CIAB Admin or Site Editor)
		 *
		 * @see src/constants/chrome-config.js::applyWpAdminChrome() - Captures and reuses this CSS
		 */
		public static function inject_wp_admin_chrome_css() {
			?>
			<style id="big-sky-wp-admin-chrome">
			body {
				background-color: #1e1e1e;
			}

			#wpadminbar {
				position: fixed;
				top: 16px;
				left: 16px;
				right: calc(350px + 8px);
				width: auto;
				border-radius: 8px 8px 0 0;
				border: 1px solid #545454;
				border-bottom: none;
			}

			#wpwrap {
				position: fixed;
				top: 48px;
				left: 16px;
				right: calc(350px + 8px);
				bottom: 16px;
				width: calc(100% - 350px - 24px);
				min-height: 0;
				box-sizing: border-box;
				border-radius: 0 0 8px 8px;
				border: 1px solid #545454;
				border-top: none;
				overflow-y: auto;
				overflow-x: hidden;
				background-color: #f0f0f1;
				margin: 0;
			}

			#wpwrap #adminmenuwrap {
				height: calc(100vh - 65px);
				width: 160px;
				border-bottom-left-radius: 8px;
			}

			#wpwrap #adminmenuback {
				bottom: inherit;
			}

			#wpwrap #wpadminbar #wp-admin-bar-notes #wpnt-notes-panel2 {
				top: 49px;
				bottom: 17px;
				right: 359px;
				border-bottom-right-radius: 8px;
				overflow: hidden;
			}

			#wpwrap #wpfooter {
				position: static;
			}

			#wpwrap #wpcontent {
				background-color: #f0f0f1;
				position: relative;
				margin-left: 160px;
				box-sizing: border-box;
			}

			#wpwrap #wpbody,
			#wpwrap #wpbody-content {
				background-color: #f0f0f1;
			}

			#wpwrap #wpbody-content {
				padding-bottom: 0;
			}
			</style>
			<?php
		}

		/**
		 * Script to remove chrome if undocked/collapsed
		 * This runs synchronously to check localStorage and remove chrome CSS if needed
		 * Only applies to regular wp-admin pages (not CIAB Admin or Site Editor)
		 */
		public static function inject_wp_admin_chrome_script() {
			?>
			<script id="big-sky-wp-admin-chrome-script">
			<?php self::get_chrome_script( 'big-sky-wp-admin-chrome', '__bigSkyWpAdminChromeCSS' ); ?>
			</script>
			<?php
		}

		/**
		 * Inject block editor chrome CSS inline
		 * CSS applies to block editor elements for the docked sidebar experience
		 * Similar to site editor but optimized for the block editor UI
		 *
		 * @see src/constants/chrome-config.js::applyBlockEditorChrome()
		 */
		public static function inject_block_editor_chrome_css() {
			?>
			<style id="big-sky-block-editor-chrome">
			.block-editor #editor {
				background-color: #1e1e1e;
			}

			.block-editor #editor .edit-post-layout {
				will-change: width, margin, border-radius;
				transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1),
							margin 0.2s cubic-bezier(0.4, 0, 0.2, 1),
							border-radius 0.2s cubic-bezier(0.4, 0, 0.2, 1);
				width: 100%;
			}

			.block-editor #editor.big-sky-sidebar-container--sidebar-open .edit-post-layout {
				width: calc(100% - 350px - 16px - 8px);
				margin: 16px 8px 16px 16px;
				border-radius: 8px;
				overflow: hidden;
			}
			</style>
			<?php
		}

		/**
		 * Inject inline script to remove block editor chrome if undocked/collapsed
		 * This runs synchronously to check localStorage and remove chrome CSS if needed
		 * Also stores CSS in a global variable so JS can capture it even after removal
		 */
		public static function inject_block_editor_chrome_script() {
			?>
			<script id="big-sky-block-editor-chrome-script">
			<?php self::get_chrome_script( 'big-sky-block-editor-chrome', '__bigSkyBlockEditorChromeCSS' ); ?>
			</script>
			<?php
		}

		/**
		 * Easy-mode lockdown: hide the core site-editor chrome that the easy-mode
		 * topbar replaces, and reserve the top strip for it.
		 *
		 * DRIFT CANARY. Every selector below targets core Gutenberg markup. If the
		 * easy-mode E2E spec starts failing on "core chrome visible", a selector
		 * here has drifted against Gutenberg trunk — .wp-env runs Gutenberg
		 * nightly, so that spec is the early-warning system.
		 *
		 * The WordPress admin bar is deliberately KEPT — easy mode locks down the
		 * editor's chrome, not the surrounding admin. The easy-mode topbar sits
		 * directly beneath it.
		 *
		 * Targeted core selectors:
		 * - html.wp-toolbar                        admin-bar spacing (literal 32px in core)
		 * - .interface-interface-skeleton          the editor's outer frame, offset below
		 * - .interface-interface-skeleton__header  header region (removes its 64px)
		 * - .interface-interface-skeleton__sidebar settings sidebar (complementary area)
		 * - .is-distraction-free                   set on the skeleton; changes how core
		 *                                          positions it, so the offset branches
		 * - .editor-header                         top bar, incl. distraction-free hover reveal
		 * - .edit-site-save-hub                    save flow (rendered conditionally)
		 * - .editor-save-publish-panels            save flow (rendered conditionally)
		 * - .edit-site-layout.is-full-canvas       canvas mode: edit rather than design view
		 *
		 * TWO SCOPES.
		 *
		 * `body.big-sky-easy-mode` marks the browser as being in the experiment.
		 * The plugin adds it, so nothing here can leak onto a screen easy mode
		 * does not own.
		 *
		 * The rules that REPLACE core's chrome are nested inside a scope that
		 * says easy mode is actually on screen, which is two facts:
		 *
		 * - `agents-manager-sidebar-container--sidebar-open`, which Agents
		 *   Manager owns and which is present exactly while the AI chat is
		 *   docked and open;
		 * - `:has(.edit-site-layout.is-full-canvas)`, core's own marker for the
		 *   canvas being in edit mode rather than design view.
		 *
		 * That makes the swap between the easy experience and the plain site
		 * editor pure CSS, with nothing to run before the first paint: Jetpack's
		 * Sidebar_Open_Preservation emits the chat class server-side from the
		 * user's persisted chat state, Agents Manager adds and removes it live,
		 * and core renders the layout class in the same commit as the chrome
		 * these rules hide.
		 *
		 * The canvas half matters as much as the chat half. Easy mode replaces
		 * the EDITING experience; on design view — where core shows a scaled
		 * site preview you click to start editing — hiding that screen's chrome
		 * only breaks it. The `?canvas=edit` redirect cannot cover this on its
		 * own, because canvas mode moves client-side after the document loads
		 * (see Big_Sky_Easy_Mode::get_edit_canvas_redirect_url).
		 *
		 * The admin-bar and fullscreen rules deliberately do NOT take that
		 * scope. Keeping the admin bar reachable in the editor is Big Sky's
		 * standing choice, not part of the simplified experience, and gating it
		 * would move the whole editor 32px on every chat toggle.
		 *
		 * @see Big_Sky_Easy_Mode::is_active()          the experiment gate
		 * @see src/easy-mode/lib/chat-visibility.ts    the JS half, same chat class
		 * @see src/easy-mode/lib/canvas-mode.ts        the JS half, same canvas class
		 */
		public static function inject_easy_mode_chrome_css() {
			?>
			<style id="big-sky-easy-mode-chrome">
			/*
			 * Easy mode's two fixed heights. Declared on <html> so they are in
			 * scope for its own padding as well as for everything inside <body>.
			 * The admin-bar value mirrors the literal core uses for
			 * html.wp-toolbar's padding, including at the 782px breakpoint.
			 */
			html.wp-toolbar:has(body.big-sky-easy-mode) {
				--big-sky-easy-mode-admin-bar-height: 32px;
				/*
				 * Matches the site editor's own header, measured on
				 * .interface-interface-skeleton__header. Easy mode replaces that
				 * header's contents but keeps its box, so the two editors have to
				 * agree on the height or the canvas starts at a different line in
				 * each.
				 */
				--big-sky-easy-mode-topbar-height: 64px;
			}

			/* Core switches the admin bar to 46px below this breakpoint. */
			@media screen and (max-width: 782px) {
				html.wp-toolbar:has(body.big-sky-easy-mode) {
					--big-sky-easy-mode-admin-bar-height: 46px;
				}
			}

			/*
			 * Easy mode keeps the admin bar, but core's fullscreen mode hides it
			 * and takes the editor to the top of the viewport. Put both back: show
			 * the bar, and start the editor below it.
			 *
			 * Only the admin bar is offset here. The easy-mode topbar is NOT
			 * offset against the viewport — it renders inside the editor's own
			 * header region, which is already sized and positioned correctly
			 * (notably, inset for the docked chat).
			 */
			body.big-sky-easy-mode.is-fullscreen-mode #wpadminbar {
				display: block !important;
			}

			/*
			 * The offset has to branch, because the two states measure `top`
			 * against different things.
			 *
			 * Ordinarily the skeleton is in normal flow, and html.wp-toolbar's
			 * padding has already cleared the admin bar — so any `top` here is
			 * added to that and shows as a strip of canvas above the topbar.
			 *
			 * Distraction-free instead pins the skeleton past that padding, so
			 * there the admin bar has to be cleared explicitly. Easy mode does not
			 * turn distraction-free on (see src/easy-mode/preferences.ts), but the
			 * user may have it on from their own use of the editor, so both states
			 * have to land in the same place.
			 */
			body.big-sky-easy-mode.is-fullscreen-mode .interface-interface-skeleton {
				top: 0 !important;
				height: calc(
					100vh - var(--big-sky-easy-mode-admin-bar-height)
				) !important;
				min-height: 0 !important;
				max-height: none !important;
			}

			body.big-sky-easy-mode.is-fullscreen-mode
				.interface-interface-skeleton.is-distraction-free {
				top: var(--big-sky-easy-mode-admin-bar-height) !important;
			}

				/*
				 * The on-screen scope — chat docked open, canvas in edit mode —
				 * entered once rather than repeated on every rule, so indentation
				 * alone says which rules are gated.
				 *
				 * `&` resolves to :is(<parent>), so with a single parent selector
				 * each nested rule has the specificity it would have had flat.
				 */
			body.big-sky-easy-mode.agents-manager-sidebar-container--sidebar-open:has(
					.edit-site-layout.is-full-canvas
				) {
				/*
				 * Hide core's header CONTENT but keep the header region, which
				 * is where the easy-mode topbar mounts.
				 *
				 * Hidden, never removed: core's header stays mounted and fully
				 * functional underneath, so closing the chat reveals a working
				 * site editor rather than rebuilding one.
				 */
				& .editor-header {
					display: none !important;
				}

				/*
				 * :has(.editor-header) is load-bearing. The site editor nests
				 * interface skeletons, so the bare class matches two elements
				 * and sizing both stacks an empty second header above the
				 * canvas.
				 */
				& .interface-interface-skeleton__header:has(.editor-header) {
					border-bottom: 0 !important;
					height: var(--big-sky-easy-mode-topbar-height) !important;
					/*
					 * Distraction-free sets opacity:0 on this region and reveals
					 * it on hover/:focus-within. Easy mode does not turn
					 * distraction-free on, but a user may already have it on —
					 * and the topbar is permanent chrome either way, so pin it
					 * visible.
					 */
					opacity: 1 !important;
				}

				/* Same reason: distraction-free slides the region's children in. */
				& .big-sky-easy-mode__topbar-host {
					transform: none !important;
				}

				& .edit-site-save-hub,
				& .editor-save-publish-panels {
					display: none !important;
				}

				/*
				 * The settings sidebar (Page / Block inspector). Easy mode offers
				 * no way to open one — the header holding the toggle is hidden
				 * above — so it is hidden outright rather than closed.
				 *
				 * Hidden here rather than closed through the interface store,
				 * because both disableComplementaryArea and
				 * enableComplementaryArea write
				 * `core`/`isComplementaryAreaVisible`, and that scope persists to
				 * user meta and localStorage (see src/easy-mode/preferences.ts) —
				 * so it would follow the user into the full site editor, the post
				 * editor, and any tab already open on either. A rule scoped to the
				 * body class retires with the class instead.
				 *
				 * Every complementary area goes, not just core's inspector: Big Sky
				 * registers one of its own (big-sky/pages-sidebar), and easy mode
				 * replaces page switching with a topbar control.
				 *
				 * Core sizes the region with `width: auto`, so hiding it hands the
				 * space back to the canvas without leaving a gap.
				 */
				& .interface-interface-skeleton__sidebar {
					display: none !important;
				}
			}
			</style>
			<?php
		}
	}
}
