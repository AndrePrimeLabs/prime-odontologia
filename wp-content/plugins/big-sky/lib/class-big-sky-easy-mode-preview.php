<?php
/**
 * Easy Mode: the front-end preview endpoint.
 *
 * Easy mode's Preview surface is a real front-end page in an iframe, not a
 * rendering of editor state. `?easy-site-editor-preview=1` is what turns an
 * ordinary request into that preview: admin chrome is suppressed, the frame is
 * styled, internal navigation keeps the flag, and a postMessage listener tells
 * the parent editor which entity the frame is showing.
 *
 * Moved verbatim from packages/easy-site-editor/includes/class-easy-site-editor.php
 * so the endpoint outlives that package, which Phase 4 deletes. Both editors are
 * served from here in the meantime: the package skips its own registration while
 * this class exists (see its constructor), so the hooks always have exactly one
 * registrant. Removing this file hands ownership straight back.
 *
 * Nothing here may drift from the wire contract the parent frames rely on — the
 * query arg and the two message types are read by JS that may already be loaded
 * in a browser.
 *
 * @package BigSky
 */

if ( ! class_exists( 'Big_Sky_Easy_Mode_Preview' ) ) {
	/**
	 * Class Big_Sky_Easy_Mode_Preview
	 *
	 * Serves the front-end preview iframe for easy mode and, until cutover, for
	 * the Easy Site Editor package.
	 */
	class Big_Sky_Easy_Mode_Preview {

		/**
		 * Register hooks. Called from Big_Sky::init(), on every request.
		 *
		 * Nothing here can apply outside a front-end preview frame, so requests
		 * that cannot be one — every ordinary page view on the site — register
		 * nothing at all. This runs at plugin load, so the test has to be one
		 * that is answerable that early and costs nothing: `is_admin()` is a
		 * constant check and the flag is a single `isset()`. Mirrors the early
		 * return in Big_Sky::maybe_load_easy_site_editor(), which is what kept
		 * the package off ordinary front-end requests before this moved.
		 *
		 * The full easy-mode gate ends in current_user_can(), which cannot be
		 * answered before `init` — so the rest of the decision is deferred
		 * there, and a request that fails it (any visitor appending the preview
		 * param to a URL) adds nothing to the hook table, exactly as the
		 * package's capability-gated loader kept these hooks off such requests
		 * before the endpoint moved here.
		 */
		public static function init() {
			if ( is_admin() || ! Big_Sky::is_easy_site_editor_preview() ) {
				return;
			}

			if ( did_action( 'init' ) ) {
				self::maybe_register_preview_hooks();
				return;
			}

			// Default priority: after the package loader at priority 1, whose
			// constructor takes the same is_active() reading — memoised by the
			// time this runs, so both owners decide on one answer.
			add_action( 'init', array( __CLASS__, 'maybe_register_preview_hooks' ) );
		}

		/**
		 * Register the preview callbacks once the gate is answerable.
		 *
		 * All five hooks fire well after `init` — enqueue, head, footer, and the
		 * admin-bar decision at template render — so deferring registration to
		 * `init` changes nothing for a real preview frame while keeping every
		 * gate-failing request's hook table untouched.
		 */
		public static function maybe_register_preview_hooks() {
			if ( ! Big_Sky_Easy_Mode::is_active() ) {
				return;
			}

			add_filter( 'show_admin_bar', array( __CLASS__, 'maybe_hide_admin_bar_on_preview' ) );
			add_action( 'wp_enqueue_scripts', array( __CLASS__, 'maybe_enqueue_preview_dependencies' ) );
			add_action( 'wp_head', array( __CLASS__, 'maybe_output_preview_frame_styles' ), 999 );
			add_action( 'wp_footer', array( __CLASS__, 'maybe_output_preview_state_listener' ), 999 );
			add_action( 'wp_footer', array( __CLASS__, 'maybe_output_preview_navigation_script' ), 999 );
		}

		/**
		 * Whether this request is a front-end preview frame easy mode should serve.
		 *
		 * The preview flag and shared availability gate select this endpoint.
		 * No entry hint or positive cookie is required. The legacy package uses
		 * the same gate to stand down, so only one implementation registers.
		 *
		 * @return bool
		 */
		private static function is_preview_request() {
			return ! is_admin()
				&& Big_Sky::is_easy_site_editor_preview()
				&& Big_Sky_Easy_Mode::is_active();
		}

		/**
		 * Hide the admin bar in preview mode.
		 *
		 * @param bool $show_admin_bar Whether the admin bar should be shown.
		 * @return bool
		 */
		public static function maybe_hide_admin_bar_on_preview( $show_admin_bar ) {
			if ( self::is_preview_request() ) {
				return false;
			}

			return $show_admin_bar;
		}

		/**
		 * Enqueue frontend dependencies needed by preview-mode theme scripts.
		 *
		 * @return void
		 */
		public static function maybe_enqueue_preview_dependencies() {
			if ( ! self::is_preview_request() ) {
				return;
			}

			wp_enqueue_script( 'jquery' );
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
		public static function maybe_output_preview_frame_styles() {
			if ( ! self::is_preview_request() ) {
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
		 * The parent editor asks for state once the iframe has loaded. Two things
		 * have to hold before we answer, and the order matters.
		 *
		 * The asker's origin must be our own. This is a front-end page and
		 * WordPress sends no X-Frame-Options for it — that is only done for admin
		 * screens — so any site on the internet may frame it, and
		 * `event.source === window.parent` is just as true of a cross-origin
		 * framer as of the editor. Without this check, a page that framed a
		 * preview could ask what it is showing and be told, and the reply carries
		 * canEditContent — which would tell that page whether the visitor is an
		 * editor on this site. Refusing silently matters too: answering to say no
		 * would leak the same fact, because this listener is only ever printed
		 * for a user who passes the gate.
		 *
		 * The asker must then be the document that framed us. A same-origin
		 * parent can already read everything in here directly, so nothing is
		 * given away that was not already available.
		 *
		 * There is deliberately no token. One used to be minted independently on
		 * both sides under a shared nonce action, which could not hold —
		 * wp_create_nonce rotates on the 12-hour tick while the parent mints once
		 * at editor load and the frame again on every frame load, so a long-lived
		 * tab crossed the boundary and the frame stopped answering for good. The
		 * origin check is what was actually keeping other sites out; the token was
		 * standing in for it and drifting. A parent that gets no answer now says
		 * so rather than assuming (see src/easy-mode/hooks/use-preview-entity.ts).
		 *
		 * @return void
		 */
		public static function maybe_output_preview_state_listener() {
			if ( ! self::is_preview_request() ) {
				return;
			}

			$state = array(
				'type'    => 'easy-site-editor:preview-state',
				'payload' => array(
					'currentEntity' => self::get_current_entity(),
				),
			);

			$script = <<<'JS'
				( function ( state ) {
					window.addEventListener( 'message', function ( event ) {
						if ( ! event.data || event.data.type !== 'easy-site-editor:request-preview-state' ) {
							return;
						}
						// Silently, and before anything else. See the docblock.
						if ( event.origin !== window.location.origin ) {
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
				} )( %s );
				JS;

			wp_print_inline_script_tag(
				sprintf(
					$script,
					wp_json_encode( $state )
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
		private static function get_current_entity() {
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
		public static function maybe_output_preview_navigation_script() {
			if ( ! self::is_preview_request() ) {
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

						/*
						 * Preserve existing entry hints for compatibility. Preview
						 * availability no longer depends on this parameter.
						 */
						const optIn = new URL(window.location.href).searchParams.get('easy-mode');
						if (optIn === 'true') {
							nextUrl.searchParams.set('easy-mode', 'true');
						}

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
	}
}
