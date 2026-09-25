<?php
/**
 * Resource hints for the typography subsystem.
 *
 * Two hints are injected into <head> at priority 1 (before any stylesheet
 * enqueue) when applicable:
 *
 * 1. preconnect to Google Fonts hosts
 *    Saves ~100-300ms on cold visits by starting DNS + TLS to Google's
 *    hosts before the CSS is parsed. Only when at least one Google font
 *    is actually used.
 *
 * 2. preload the body font's woff2 (local fonts only)
 *    The body font drives the largest contentful paint on most pages, so
 *    preloading its variant cuts text-render delay. We preload ONLY ONE
 *    font (the body's chosen variant) — preloading more steals bandwidth
 *    from above-the-fold critical resources. Google fonts are NOT
 *    preloaded: their file URLs are UA-dynamic and would mismatch.
 *
 * Body typography setting key: 'onepress_typo_p' (selector `body, body p`).
 * Lookup priority for the preload variant:
 *   1. Variant exactly matching saved font-weight + font-style.
 *   2. Variant '400'.
 *   3. First face in the entry.
 *
 * Both hints emit nothing when not applicable, so pages without typography
 * customization pay zero cost.
 *
 * @package OnePress_Plus
 */

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Hooked to wp_head priority 1.
 *
 * Calls onepress_typography_render_code() (which is idempotent and cached
 * on $GLOBALS['onepress_typography_render_code']) so the buckets are
 * populated before we look them up.
 *
 * @since 2.3.14
 */
function onepress_typography_print_resource_hints()
{
	// Ensure render_code has run (and the buckets exist). Safe to call
	// repeatedly — the first call memoizes the result.
	if (! isset($GLOBALS['onepress_typography_render_code'])) {
		if (function_exists('onepress_typography_render_code')) {
			onepress_typography_render_code(true, false);
		}
	}

	$has_google = ! empty($GLOBALS['onepress_typography_google_used']);
	$local_used = isset($GLOBALS['onepress_typography_local_used']) ? $GLOBALS['onepress_typography_local_used'] : array();

	if ($has_google) {
		echo "<link rel='preconnect' href='https://fonts.googleapis.com'>\n";
		echo "<link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>\n";
	}

	$preload = onepress_typography_pick_body_preload($local_used);
	if ($preload) {
		printf(
			"<link rel='preload' href='%s' as='font' type='%s' crossorigin>\n",
			esc_url($preload['url']),
			esc_attr($preload['mime'])
		);
	}
}

/**
 * Pick the body font variant to preload.
 *
 * Reads the 'onepress_typo_p' saved setting and tries to match it against
 * the local_used bucket. Returns null if the body font is a Google font,
 * a system font, or unconfigured.
 *
 * @since 2.3.14
 *
 * @param array $local_used Buckets emitted by render_code().
 * @return array|null { url, mime, variant } or null.
 */
function onepress_typography_pick_body_preload($local_used)
{
	if (empty($local_used)) {
		return null;
	}

	$body_key = apply_filters('onepress_typography_body_setting_key', 'onepress_typo_p');
	$raw      = get_theme_mod($body_key, false);
	// Legacy rows can be object/array — coerce to string before json_decode.
	if (is_object($raw) || is_array($raw)) {
		$raw = wp_json_encode($raw);
	} elseif (!is_string($raw)) {
		$raw = '';
	}
	$data = json_decode($raw, true);
	if (! is_array($data) || empty($data['font-family'])) {
		return null;
	}

	$font_id = sanitize_title($data['font-family']);
	if (! isset($local_used[$font_id])) {
		// Body font is not in the local bucket — either Google, default,
		// or unresolved. No preload.
		return null;
	}

	$entry = $local_used[$font_id]['entry'];
	if (empty($entry['faces'])) {
		return null;
	}

	// Desired variant token from saved settings.
	$wanted = '';
	if (! empty($data['font-weight'])) {
		$wanted .= $data['font-weight'];
	}
	if (isset($data['font-style']) && '' !== $data['font-style'] && 'normal' !== $data['font-style']) {
		$wanted .= $data['font-style'];
	}

	$match  = null;
	$fallback_400 = null;
	$first  = null;

	foreach ($entry['faces'] as $face) {
		if ($first === null) {
			$first = $face;
		}
		$variant = isset($face['variant']) ? $face['variant'] : '';
		if ($wanted !== '' && $variant === $wanted) {
			$match = $face;
			break;
		}
		if ($variant === '400' && $fallback_400 === null) {
			$fallback_400 = $face;
		}
	}

	$pick = $match ? $match : ($fallback_400 ? $fallback_400 : $first);
	if (! $pick || empty($pick['src'])) {
		return null;
	}

	// Preload only woff2 — preloading a format the browser can't use is
	// wasted bandwidth, and woff2 is universal in all browsers that
	// implement <link rel=preload as=font>.
	$path = wp_parse_url($pick['src'], PHP_URL_PATH);
	$ext  = $path ? strtolower(pathinfo($path, PATHINFO_EXTENSION)) : '';
	if ('woff2' !== $ext) {
		// If the variant's chosen src isn't woff2, scan the entry for a
		// woff2 alternative at the same variant.
		$alt = onepress_typography_find_woff2_for_variant($entry, isset($pick['variant']) ? $pick['variant'] : '');
		if (! $alt) {
			return null;
		}
		$pick['src'] = $alt;
	}

	return array(
		'url'     => $pick['src'],
		'mime'    => 'font/woff2',
		'variant' => isset($pick['variant']) ? $pick['variant'] : '',
	);
}

/**
 * Scan a font entry's `files` map for a woff2 alternative at a given variant.
 *
 * pick_src() in the resolvers already prefers woff2, so this is a defensive
 * lookup for entries where only a non-woff2 src was usable.
 *
 * @param array  $entry
 * @param string $variant
 * @return string|null URL or null.
 */
function onepress_typography_find_woff2_for_variant($entry, $variant)
{
	if (empty($entry['files']) || ! isset($entry['files'][$variant])) {
		return null;
	}
	$src  = $entry['files'][$variant];
	$path = wp_parse_url($src, PHP_URL_PATH);
	$ext  = $path ? strtolower(pathinfo($path, PATHINFO_EXTENSION)) : '';
	return ('woff2' === $ext) ? $src : null;
}
