<?php

// Register our customizer panels, sections, settings, and controls.
$GLOBALS['wp_typography_auto_apply'] = array();

add_action('wp_enqueue_scripts', 'onepress_typography_print_styles', 99);
add_action('wp_head', 'onepress_typography_print_custom_styles', 990);
// Resource hints (preconnect + body-font preload) at priority 1 so they
// land BEFORE any stylesheet enqueue. See resource-hints.php.
add_action('wp_head', 'onepress_typography_print_resource_hints', 1);

require_once dirname(__FILE__) . '/font-faces.php';
require_once dirname(__FILE__) . '/resource-hints.php';
require_once dirname(__FILE__) . '/block-editor.php';

function onepress_typography_print_custom_styles()
{
	if (!isset($GLOBALS['onepress_typography_render_code'])) {
		return;
	}
	$return = $GLOBALS['onepress_typography_render_code'];
	$code   = isset($return['code']) ? $return['code'] : '';
	$faces  = isset($return['font_faces']) ? $return['font_faces'] : '';

	$combined = trim($faces) . "\n" . trim($code);
	if (trim($combined) !== '') {
		echo '<style class="wp-typography-print-styles" type="text/css">' . "\n" . $combined . "\n" . '</style>'; // WPCS: XSS ok.
	}
}

/**
 * Reverse-lookup: identify the font_type of a saved typography setting.
 *
 * Storage stores only the family name (e.g. "Inter"). Type is determined
 * at render time by looking up the name against the priority-merged
 * catalogue. Returns null if the name is unknown to any source.
 *
 * @since 2.3.14
 *
 * @param string $font_name   The saved font-family value.
 * @param array  $catalogue   onepress_typography_get_fonts() output, passed in
 *                            to avoid re-resolving on every call.
 * @return array|null { id, type, entry } or null if not found / placeholder.
 */
function onepress_typography_resolve_font($font_name, $catalogue)
{
	if ('' === $font_name || empty($catalogue)) {
		return null;
	}
	$id = sanitize_title($font_name);
	if ('' === $id || '__no_library_fonts__' === $id) {
		return null;
	}
	if (! isset($catalogue[$id])) {
		return null;
	}
	$entry = $catalogue[$id];
	if (! empty($entry['_disabled'])) {
		return null;
	}
	return array(
		'id'    => $id,
		'type'  => isset($entry['font_type']) ? $entry['font_type'] : 'default',
		'entry' => $entry,
	);
}



/**
 * Render typography styles.
 *
 * @since 0.0.1
 * @since 2.5.6
 *
 * @param bool $echo
 * @param bool $for_editor
 * @deprecated 2.3.5
 *
 * @return array
 */
function onepress_typography_render_style($echo = true, $for_editor = false)
{
	return onepress_typography_render_code($echo, $for_editor);
}

/**
 * Render typography CSS + Google Fonts URL + local @font-face block.
 *
 * Pipeline:
 *   1. Walk every registered auto-apply setting, decode saved data.
 *   2. Reverse-lookup font-family name against the priority-merged
 *      catalogue (Theme > Library > Default > Google) to determine
 *      font_type. Storage shape is unchanged — type is NOT persisted.
 *   3. Bucket the resolved entry by type:
 *        - google  -> $google_fonts (composes the Google Fonts URL)
 *        - theme   -> $local_used (emits @font-face, uses raw stack as CSS)
 *        - library -> $local_used (emits @font-face)
 *        - default -> none (system stack, no font assets)
 *   4. Emit per-selector CSS rules. For theme fonts, font-family uses the
 *      raw fontFamily stack (e.g. "Inter, sans-serif") so the browser
 *      falls through to a real fallback when the file can't load.
 *   5. Build @font-face for local fonts, skipping any family that WP
 *      6.5+ will auto-emit via wp_print_font_faces().
 *
 * @since 2.5.6
 * @since 2.3.14 Reverse-lookup, theme + library buckets, @font-face emit.
 *
 * @param bool $enqueue
 * @param bool $for_editor
 *
 * @return array { url, code, font_faces }
 */
function onepress_typography_render_code($enqueue = true, $for_editor = false)
{

	/**
	 * @since 2.3.6
	 */
	if (isset($GLOBALS['onepress_typography_render_code']) && $GLOBALS['onepress_typography_render_code']) {
		return $GLOBALS['onepress_typography_render_code'];
	}

	global $wp_typography_auto_apply;
	$google_fonts  = array();
	$font_variants = array();
	$local_used    = array(); // font_id => array of { entry, variants: [token => token] }
	$css           = array();
	$root_vars     = array(); // var_name => stack value (for the :root rule)
	$scheme        = is_ssl() ? 'https' : 'http';

	$disable_google_fonts = get_theme_mod('onepress_disable_g_font');

	if (!empty($wp_typography_auto_apply)) {

		$save_data = [];
		foreach ($wp_typography_auto_apply as $k => $settings) {

			if (isset($settings['data_type']) && 'option' == $settings['data_type']) {
				$data = get_option($k, false);
			} else {
				$data = get_theme_mod($k, false);
			}
			// Legacy rows can be object/array — coerce to string so json_decode
			// (which requires string in PHP 8+) doesn't fatal.
			if (is_object($data) || is_array($data)) {
				$data = wp_json_encode($data);
			} elseif (!is_string($data)) {
				$data = '';
			}
			$data = json_decode($data, true);
			if ((!$data || empty($data)) && $settings['default']) {
				$data = $settings['default'];
			}

			if (!is_array($data)) {
				continue;
			}

			$data  = array_filter($data);
			if (empty($data) && is_array($settings['default'])) {
				$data = array_merge($settings['default'], $data);
			}

			$data = wp_parse_args(
				$data,
				array(
					'font-family'     => '',
					'color'           => '',
					'font-style'      => '',
					'font-weight'     => '',
					'font-size'       => '',
					'line-height'     => '',
					'letter-spacing'  => '',
					'text-transform'  => '',
					'text-decoration' => '',
				)
			);
			$save_data[$k] = $data;
		}

		if (!function_exists('onepress_typography_get_fonts')) {
			include_once dirname(__FILE__) . '/typography.php';
		}
		// Full priority-merged catalogue (Theme > Library > Default > Google).
		$catalogue = onepress_typography_get_fonts();

		foreach ($wp_typography_auto_apply as $k => $settings) {

			$data = isset($save_data[$k]) ? $save_data[$k] : false;

			// Reverse-lookup the saved font-family name against the catalogue.
			// Storage shape is unchanged; type lives in the catalogue entry.
			$resolved = null;
			if (isset($data) && is_array($data) && !empty($data['font-family'])) {
				$resolved = onepress_typography_resolve_font($data['font-family'], $catalogue);
			}

			// Compute the variant token from font-weight + font-style.
			$variant = '';
			if ($resolved && is_array($data)) {
				if (!empty($data['font-weight'])) {
					$variant .= $data['font-weight'];
				}
				if ('' !== $data['font-style'] && 'normal' !== $data['font-style']) {
					$variant .= $data['font-style'];
				}
			}

			if ($resolved) {
				$entry   = $resolved['entry'];
				$type    = $resolved['type'];
				$font_id = $resolved['id'];

				if ('google' === $type) {
					if (!$disable_google_fonts) {
						$google_fonts[$font_id] = $entry;
						if (!isset($font_variants[$font_id]) || !is_array($font_variants[$font_id])) {
							$font_variants[$font_id] = array();
						}
						if ('' !== $variant && in_array($variant, $entry['font_weights'], true)) {
							$font_variants[$font_id][$variant] = $variant;
						}
					}
				} elseif ('theme' === $type || 'library' === $type) {
					// Theme + Library fonts are local — bucket for @font-face emission.
					if (!isset($local_used[$font_id])) {
						$local_used[$font_id] = array(
							'entry'    => $entry,
							'variants' => array(),
						);
					}
					if ('' !== $variant && in_array($variant, (array) $entry['font_weights'], true)) {
						$local_used[$font_id]['variants'][$variant] = $variant;
					} else {
						// Always include at least 400 so the page has SOMETHING to show
						// when font-weight is left at default.
						$local_used[$font_id]['variants']['400'] = '400';
					}
				}
				// 'default' (system stack): no font assets, no bucket.
			}

			if ($for_editor) {
				// Fall back to the front-end selector when no explicit
				// editor_selector was registered. The intent is: every
				// typography setting emits CSS in BOTH contexts. Front-end-only
				// selectors (e.g. `.hero__content`, `.onepress-menu`) simply
				// won't match anything in the editor iframe — harmless. Body
				// and heading settings already declare editor_selector so they
				// keep their editor-specific targets (e.g.
				// `.editor-styles-wrapper *`) and won't double-apply.
				$selector = ! empty($settings['editor_selector'])
					? $settings['editor_selector']
					: $settings['css_selector'];
			} else {
				$selector = $settings['css_selector'];
			}
			$css_var = isset($settings['css_var']) ? (string) $settings['css_var'] : '';

			// Collect the var declaration for the :root rule. Each setting
			// with css_var contributes one entry; the emitted :root rule at
			// the end of render is the SOLE place these vars are defined,
			// so the override propagates to every element on the page (not
			// just descendants of this setting's selector).
			if ('' !== $css_var && ! empty($data['font-family'])) {
				$stack = '';
				if ($resolved && 'theme' === $resolved['type'] && ! empty($resolved['entry']['font_family_stack'])) {
					// Raw theme.json stack (already CSS-formatted).
					$stack = $resolved['entry']['font_family_stack'];
				} else {
					// Single name — quote for CSS.
					$stack = '"' . $data['font-family'] . '"';
				}
				if ('' !== $stack) {
					// Later writers win — registration order in auto-apply.php
					// determines this, but each setting targets a unique var
					// today so no collision happens in practice.
					$root_vars[$css_var] = $stack;
				}
			}

			if ($selector) {
				$css[] = onepress_typography_css($data, $selector, $resolved, $css_var);
			}
		}
	}

	$_fonts   = array();
	$_subsets = array();
	$return   = array(
		'url'        => '',
		'code'       => '',
		'font_faces' => '',
	);

	/**
	 * Do not load google font.
	 * 
	 * @since 2.3.4
	 */
	if (!$disable_google_fonts) {
		foreach ($google_fonts as $font_id => $font) {
			$name = str_replace(' ', '+', $font['name']);
			$variants = (isset($font_variants[$font_id]) && !empty($font_variants[$font_id])) ? $font_variants[$font_id] : array('regular');
			$s = '';
			$v = array();
			if (!empty($variants)) {
				foreach ($variants as $_v) {
					if ($_v != 'regular') {
						switch ($_v) {
							case 'italic':
								$v[$_v] = '400i';
								break;
							default:
								$v[$_v] = str_replace('italic', 'i', $_v);
						}
					} else {
						$v[$_v] = '400';
					}
				}
			}

			if (!isset($v['regular'])) {
				$v['regular'] = '400';
			}

			if (!isset($v['400'])) {
				$v['400'] = '400';
			}

			/**
			 * Add bold for default 
			 * @since  2.3.6
			 */
			if (isset($v['regular']) || isset($v['400'])) {
				if (isset($font['font_weights']) && in_array('700', $font['font_weights'])) {
					$v['700'] = '700';
				}
			}
			if (isset($v['regular']) || isset($v['400'])) {
				if (isset($font['font_weights']) && in_array('700italic', $font['font_weights'])) {
					$v['700italic'] = '700i';
				}
			}

			$v = array_unique($v);

			if (!empty($v)) {
				$s .= ':' . join(',', $v);
			}
			$_fonts[$font_id] = "{$name}" . $s;

			if (isset($font['subsets'])) {
				$_subsets = array_merge($_subsets, $font['subsets']);
			}
		}

		if (count($_fonts)) {
			$url = $scheme . '://fonts.googleapis.com/css?family=' . join('|', $_fonts);
			if (!empty($_subsets)) {
				$_subsets = array_unique($_subsets);
				$url .= '&subset=' . join(',', $_subsets);
			}
			$return['url'] = $url . '&display=swap';
		}
	}

	// Build the :root rule from collected vars. Prepended to $css so it
	// appears at the top of the output stylesheet — clearer in DevTools
	// and lets later rules read the resolved var without extra hops.
	//
	// Selector: `:root:root`
	//   Same target (the <html> element) as plain `:root`, but the
	//   duplicated pseudo-class boosts specificity from (0,1,0) → (0,2,0).
	//
	//   Why we need the extra specificity:
	//     The block editor loads several other stylesheets that ALSO
	//     declare these preset variables under a plain `:root` selector
	//     (WP global-styles, the parent theme's webpack-compiled
	//     editor.css, etc.). Some of those land AFTER our payload in the
	//     iframe and would otherwise win by cascade order. With (0,2,0)
	//     we beat them on specificity regardless of source order, no
	//     `!important` needed.
	//
	//   Why this is clean:
	//     - Still targets the same single element (<html>).
	//     - Plain CSS, no proprietary syntax, valid since IE9.
	//     - Leaves the door open for downstream overrides — anyone who
	//       wants to override can use `:root:root:root` or any rule with
	//       specificity ≥ (0,3,0). Not as opaque as `!important`.
	//
	// Same selector serves all three contexts (front-end, Customizer
	// preview iframe, block editor iframe) because each iframe has its
	// own <html> root.
	if (! empty($root_vars)) {
		$root_rule = ":root:root { \n";
		foreach ($root_vars as $var => $stack) {
			$root_rule .= "\t{$var}: {$stack};\n";
		}
		$root_rule .= ' }';
		array_unshift($css, $root_rule);
	}

	$return['code'] = join(" \n ", $css);

	// Emit @font-face for local fonts (theme + library), skipping any family
	// that WP 6.5+ will auto-emit via wp_print_font_faces(). See font-faces.php.
	if (!empty($local_used)) {
		$return['font_faces'] = onepress_typography_render_font_faces($local_used);
	}

	// Expose buckets to downstream helpers (resource-hints uses them to
	// decide preconnect + preload).
	$GLOBALS['onepress_typography_local_used']  = $local_used;
	$GLOBALS['onepress_typography_google_used'] = $google_fonts;

	/**
	 * @since 2.3.6 use wp_enqueue_style to load fonts.
	 */
	$return = apply_filters('onepress_typography_render_code', $return);
	$GLOBALS['onepress_typography_render_code'] = $return;
	if ($enqueue) {
		if (isset($return['url']) && $return['url']) {
			wp_enqueue_style('wp-typo-google-font', $return['url']);
		}
		return false;
	} else {
		return $return;
	}
}


/**
 * Automatic add Style to <head>.
 *
 * @since  1.0.0
 * @since 2.1.3
 *
 * @param boolean $echo
 * @param boolean $for_editor
 * @return bool|string
 */
function onepress_typography_print_styles()
{
	onepress_typography_render_code(true, false);
}

/**
 * Create CSS code for one selector group.
 *
 * font-family emission depends on the resolved source:
 *   - theme   : raw `fontFamily` stack from theme.json (e.g. "Inter, sans-serif")
 *               — the stack matters because the browser falls through to a
 *               real fallback when the font file fails to load.
 *   - library : quoted single name (Library entries don't ship a stack)
 *   - google  : quoted single name (Google CSS file declares its own faces)
 *   - default : quoted single name (system stack)
 *   - unresolved: legacy behavior — quoted single name as stored.
 *
 * CSS-variable mode ($css_var):
 *   When the setting declares a `css_var` (e.g. `--wp--preset--font-family--body`
 *   for `onepress_typo_p`), the rule emits BOTH:
 *     <var>: <stack>;
 *     font-family: var(<var>);
 *   so any descendant that references `var(--wp--preset--font-family--body)`
 *   (theme.json `styles.typography.fontFamily`, blocks consuming the preset)
 *   automatically picks up the Customizer-driven family. The selector's
 *   own elements still get a working `font-family` rule.
 *
 * @since 1.0.0
 * @since 2.3.14 $resolved arg for source-aware font-family emission.
 * @since 2.3.14 $css_var arg for theme.json CSS-variable handoff.
 *
 * @param array        $css      Decoded typography settings.
 * @param array|string $selector
 * @param array|null   $resolved Output of onepress_typography_resolve_font(), or null.
 * @param string       $css_var  CSS custom-property name (with leading `--`) to set
 *                               + reference via var(). Empty string disables var mode.
 * @return bool|string
 */
function onepress_typography_css($css, $selector = array(), $resolved = null, $css_var = '')
{
	if (!is_array($css) || !$selector) {
		return false;
	}

	if (isset($css['font-family']) && '' != $css['font-family']) {
		$type  = $resolved && isset($resolved['type']) ? $resolved['type'] : null;
		$entry = $resolved && isset($resolved['entry']) ? $resolved['entry'] : null;

		if ('theme' === $type && $entry && !empty($entry['font_family_stack'])) {
			// Raw stack — already CSS-formatted in theme.json.
			$css['font-family'] = $entry['font_family_stack'];
		} else {
			$css['font-family'] = '"' . $css['font-family'] . '"';
		}
	}

	// CSS variable mode: swap the font-family value to a var() reference.
	// The matching `--<var>: <stack>;` declaration is emitted on `:root`
	// by render_code so the override propagates to every element on the
	// page that consumes `var(--wp--preset--font-family--...)`, not only
	// descendants of this specific selector.
	if ($css_var && isset($css['font-family']) && '' !== $css['font-family']) {
		$css['font-family'] = "var({$css_var})";
	}

	$base_px = apply_filters('root_typography_css_base_px', 16); // 16px;

	$code = '';
	if (is_array($selector)) {
		$selector = array_unique($selector);
		$code .= join("\n", $selector);
	} else {
		$code .= $selector;
	}

	$code .= " { \n";

	foreach ($css as $k => $v) {
		if ($v && !is_array($v)) {
			$code .= "\t{$k}: {$v};\n";
		}
	}

	if (isset($css['font-size']) && '' != $css['font-size']) {
		$rem = intval($css['font-size']) / $base_px;
		$code .= "\tfont-size: {$rem}rem;\n";
	}

	$code .= ' }';
	return $code;
}

/**
 * Register settings for auto apply css to <head>
 *
 * @param $setting_key
 * @param string $css_selector
 * @param string $data_type
 */
/**
 * Register a typography setting to be auto-applied via inline CSS.
 *
 * @param string $setting_key
 * @param string $css_selector
 * @param array  $default array(
 *   'font-family'     => '',
 *   'color'           => '',
 *   'font-style'      => '',
 *   'font-weight'     => '',
 *   'font-size'       => '',
 *   'line-height'     => '',
 *   'letter-spacing'  => '',
 *   'text-transform'  => '',
 *   'text-decoration' => '',
 * ).
 * @param string $data_type        'theme_mod' (default) or 'option'.
 * @param string $editor_selector  Selector inside the block editor iframe.
 * @param string $css_var          Optional CSS custom-property name (with leading
 *                                 `--`) the rule should ALSO assign, with the
 *                                 font-family value swapped to var(<name>). Use
 *                                 for theme.json hand-off — e.g. pass
 *                                 `--wp--preset--font-family--body` for the
 *                                 paragraph setting so blocks consuming the
 *                                 preset inherit the Customizer family pick.
 */
function onepress_typography_helper_auto_apply($setting_key, $css_selector = '', $default = null, $data_type = 'theme_mod', $editor_selector = '', $css_var = '')
{
	global $wp_typography_auto_apply;
	$wp_typography_auto_apply[$setting_key] = array(
		'key'             => $setting_key,
		'css_selector'    => $css_selector,
		'editor_selector' => $editor_selector,
		'data_type'       => ($data_type) ? $data_type : 'theme_mod',
		'default'         => $default,
		'css_var'         => $css_var,
	);
}
