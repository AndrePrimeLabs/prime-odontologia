<?php
/**
 * @font-face emission for local fonts (Theme + WP Font Library).
 *
 * Why this exists:
 *   Local fonts have no Google-style stylesheet URL. The browser only sees
 *   the file once we declare an @font-face rule that maps a family name +
 *   weight + style to a URL.
 *
 * Dedupe rule — critical:
 *   WordPress 6.5+ already emits @font-face for every entry in
 *   wp_get_global_settings()['typography']['fontFamilies'] (both 'theme'
 *   and 'custom' origins) via the wp_print_font_faces() action on wp_head
 *   priority 50. If we also emit those families, the browser receives
 *   duplicate CSS (~1-3KB wasted per font and a redundant network request
 *   on cold cache).
 *
 *   So: we ONLY emit @font-face for families that WP will NOT auto-emit.
 *   On WP < 6.5 (no wp_print_font_faces) we emit everything ourselves.
 *
 * @package OnePress_Plus
 */

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Render @font-face block for the buckets collected by render_code().
 *
 * Skips any family WordPress core will auto-emit. Filters down to only
 * the variants actually used in saved typography settings to keep CSS
 * size minimal.
 *
 * @since 2.3.14
 *
 * @param array $local_used Map: font_id => { entry, variants: [token => token] }
 * @return string CSS block. Empty when nothing to emit.
 */
function onepress_typography_render_font_faces($local_used)
{
	if (empty($local_used)) {
		return '';
	}

	$handled = onepress_typography_wp_handled_families();
	$out     = '';

	foreach ($local_used as $font_id => $info) {
		$entry = isset($info['entry']) ? $info['entry'] : null;
		if (! $entry || empty($entry['faces']) || empty($entry['name'])) {
			continue;
		}
		// Skip families WP core will auto-emit (avoid duplicate @font-face).
		$family_key = strtolower($entry['name']);
		if (isset($handled[$family_key])) {
			continue;
		}

		$used_variants = isset($info['variants']) ? $info['variants'] : array();

		foreach ($entry['faces'] as $face) {
			$variant = isset($face['variant']) ? $face['variant'] : '';
			// Only emit the variants actually referenced by saved settings.
			if (! empty($used_variants) && ! isset($used_variants[$variant])) {
				continue;
			}
			$weight = isset($face['weight']) ? $face['weight'] : '400';
			$style  = isset($face['style']) ? $face['style'] : 'normal';
			$src    = isset($face['src']) ? $face['src'] : '';
			if ('' === $src) {
				continue;
			}
			$format = onepress_typography_format_from_url($src);
			$src_decl = "url('" . esc_url_raw($src) . "')";
			if ($format) {
				$src_decl .= " format('" . esc_attr($format) . "')";
			}
			$out .= "@font-face{";
			$out .= "font-family:'" . esc_attr($entry['name']) . "';";
			$out .= "font-style:" . esc_attr($style) . ";";
			$out .= "font-weight:" . esc_attr($weight) . ";";
			$out .= "font-display:swap;";
			$out .= "src:" . $src_decl . ";";
			$out .= "}\n";
		}
	}

	return $out;
}

/**
 * Names of font families WordPress core will auto-emit @font-face for.
 *
 * Reads wp_get_global_settings()['typography']['fontFamilies'] and collects
 * every family name (across all origins WP knows about — theme + custom).
 *
 * Walks both shapes WP may return:
 *   - Nested by origin: [ theme => [...], custom => [...], default => [...] ]
 *   - Flat list:        [ {...}, {...}, ... ]
 *
 * Returns [] on WP < 6.5 (no wp_print_font_faces). Caller treats empty as
 * "nothing handled, emit everything".
 *
 * Lowercased keys for O(1) case-insensitive lookup.
 *
 * @since 2.3.14
 *
 * @return array Map: lowercase_family_name => true
 */
function onepress_typography_wp_handled_families()
{
	static $cache = null;
	if (null !== $cache) {
		return $cache;
	}

	if (! function_exists('wp_print_font_faces') || ! function_exists('wp_get_global_settings')) {
		$cache = array();
		return $cache;
	}

	$settings = wp_get_global_settings();
	$families = isset($settings['typography']['fontFamilies']) ? $settings['typography']['fontFamilies'] : array();
	$out      = array();

	$walk = function ($node) use (&$walk, &$out) {
		if (! is_array($node)) {
			return;
		}
		// Leaf: a single family entry has either `name` or `fontFamily`.
		if (isset($node['name']) || isset($node['fontFamily'])) {
			$name = isset($node['name']) ? $node['name'] : '';
			if ('' === $name && isset($node['fontFamily'])) {
				$first = trim(explode(',', (string) $node['fontFamily'])[0]);
				$name  = trim($first, "\"' ");
			}
			if ('' !== $name) {
				$out[strtolower($name)] = true;
			}
			return;
		}
		// Container: recurse into children (origin buckets or flat list).
		foreach ($node as $child) {
			$walk($child);
		}
	};

	$walk($families);
	$cache = $out;
	return $cache;
}

/**
 * Map a font file URL to a CSS @font-face format() token.
 *
 * @param string $url
 * @return string Format string for the format() declaration, or '' if unknown.
 */
function onepress_typography_format_from_url($url)
{
	$path = wp_parse_url($url, PHP_URL_PATH);
	if (! $path) {
		return '';
	}
	$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
	$map = array(
		'woff2' => 'woff2',
		'woff'  => 'woff',
		'ttf'   => 'truetype',
		'otf'   => 'opentype',
		'eot'   => 'embedded-opentype',
		'svg'   => 'svg',
	);
	return isset($map[$ext]) ? $map[$ext] : '';
}
