<?php
/**
 * Block editor parity for the typography subsystem.
 *
 * Mirrors the front-end typography pipeline into the block editor so the
 * post-editing iframe shows the same fonts / sizes / colors the front
 * end will render with. Without this, the editor falls back to default
 * Gutenberg typography and the author sees no preview of the
 * Customizer's typography settings.
 *
 * Why the `block_editor_settings_all` filter (and not enqueue)
 * -----------------------------------------------------------
 * Modern WP block editors (5.9+) render post content inside an iframe.
 * Styles enqueued via wp_add_inline_style() on a virtual handle DO get
 * printed on the host admin page, but the iframe doesn't always inherit
 * them — propagation behaviour varies across WP minor versions and is
 * unreliable for inline-only handles.
 *
 * The `block_editor_settings_all` filter, by contrast, is the official
 * path. CSS pushed into $settings['styles'] is read by Gutenberg's
 * iframe init JS and injected as a <style> tag inside the iframe's
 * <head>. That guarantees the rules see the same DOM as the user's
 * post content. WP also accepts an `__unstableType` flag we set to
 * 'theme' so the editor treats our payload as theme-grade styling.
 *
 * What this file emits
 * --------------------
 *   1. @import for Google Fonts (when at least one Google font is used).
 *      @import must be the FIRST rule of the stylesheet (CSS spec); any
 *      rule before it invalidates the import.
 *   2. @font-face for local fonts (theme + library), after the same
 *      wp_print_font_faces() dedupe pass used on the front end (see
 *      font-faces.php).
 *   3. The :root rule that overrides the WP / theme.json preset
 *      variables for the body / heading families.
 *   4. Per-selector typography rules, with selectors swapped to the
 *      editor-side strings declared in inc/typography/auto-apply.php
 *      ($settings['editor_selector']). When a setting has no explicit
 *      editor_selector, render_code() falls back to css_selector.
 *
 * Memoization handling
 * --------------------
 * onepress_typography_render_code() memoizes its output in
 * $GLOBALS['onepress_typography_render_code']. The cache key is single,
 * so a stale front-end render could leak into the editor (and vice
 * versa). Front-end render does not run on admin pages, but we still
 * flush the cache before AND after our editor render as defensive
 * bookkeeping.
 *
 * @package OnePress_Plus
 * @since 2.3.14
 */

if (! defined('ABSPATH')) {
	exit;
}

add_filter('block_editor_settings_all', 'onepress_typography_inject_editor_styles', 10, 2);

/**
 * Inject the editor-side typography CSS into the block editor.
 *
 * Hooked to block_editor_settings_all — fires once per editor page load
 * (post-new.php, post.php, site-editor.php, widgets.php). The returned
 * stylesheet payload is loaded inside the editor iframe by Gutenberg.
 *
 * @since 2.3.14
 *
 * @param array                   $editor_settings  Editor settings array.
 * @param WP_Block_Editor_Context $editor_context   Context (post type, etc.).
 * @return array
 */
function onepress_typography_inject_editor_styles($editor_settings, $editor_context)
{
	if (! function_exists('onepress_typography_render_code')) {
		return $editor_settings;
	}

	// Invalidate any prior render so we get a fresh editor-side output.
	onepress_typography_flush_render_cache();

	$r = onepress_typography_render_code(false, true);

	// Restore cache state — any unrelated request later in this PHP
	// process should not see the editor-targeted output.
	onepress_typography_flush_render_cache();

	if (empty($r) || ! is_array($r)) {
		return $editor_settings;
	}

	// Compose the payload in CSS-significant order. Each piece is
	// optional — render_code() returns empty strings when a section has
	// nothing to emit.
	$css = '';
	if (! empty($r['url'])) {
		// @import must be the FIRST rule of the stylesheet (CSS spec).
		$css .= '@import url("' . esc_url_raw($r['url']) . '");' . "\n";
	}
	if (! empty($r['font_faces'])) {
		$css .= $r['font_faces'] . "\n";
	}
	if (! empty($r['code'])) {
		$css .= $r['code'];
	}

	if ('' === $css) {
		return $editor_settings;
	}

	if (! isset($editor_settings['styles']) || ! is_array($editor_settings['styles'])) {
		$editor_settings['styles'] = array();
	}

	// __unstableType: 'theme' tells the block editor to treat this as a
	// theme-level stylesheet (loaded into the iframe alongside the
	// theme's own editor styles). 'isGlobalStyles' is explicitly false
	// so the editor doesn't merge our payload into Gutenberg's global
	// styles UI (where the user could undo it by clicking "reset").
	$editor_settings['styles'][] = array(
		'css'             => $css,
		'__unstableType'  => 'theme',
		'isGlobalStyles'  => false,
	);

	return $editor_settings;
}

/**
 * Reset the render_code() memoization globals.
 *
 * Centralized so the block-editor and any future caller that wants a
 * fresh render don't have to repeat the unset incantation.
 *
 * @since 2.3.14
 */
function onepress_typography_flush_render_cache()
{
	unset(
		$GLOBALS['onepress_typography_render_code'],
		$GLOBALS['onepress_typography_local_used'],
		$GLOBALS['onepress_typography_google_used']
	);
}
