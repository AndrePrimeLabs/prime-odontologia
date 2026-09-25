<?php
/**
 * Theme Fonts source.
 *
 * Reads fonts declared in the active theme's theme.json
 * (settings.typography.fontFamilies, "theme" origin) and exposes them in
 * the shape used by OnePress Plus's typography picker.
 *
 * Data flow
 *   theme.json
 *     -> WP_Theme_JSON_Resolver::get_theme_data()->get_settings()
 *     -> ['typography']['fontFamilies']['theme']   (theme origin only)
 *     -> self::normalize_family() per entry
 *     -> { font_id => normalized entry } catalogue map
 *
 * Why theme origin only (not the merged settings)?
 *   wp_get_global_settings() returns theme + user activations merged. User
 *   activations belong in the WP Font Library group (see
 *   class-library-fonts.php). Mixing them here would double-list the same
 *   font in two picker groups.
 *
 * @package OnePress_Plus
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OnePress_Plus_Theme_Fonts {

	/**
	 * Per-request memoization. null = not resolved yet.
	 *
	 * Auto CSS calls into this many times during one render — the resolver
	 * must be cheap on the hot path.
	 *
	 * @var array|null
	 */
	protected static $cache = null;

	/**
	 * Normalized theme-declared fonts.
	 *
	 * Returns [] when:
	 *   - WP < 5.9 (no WP_Theme_JSON_Resolver)
	 *   - theme has no theme.json or no typography.fontFamilies
	 *
	 * @return array Map of font_id => entry. Each entry:
	 *   {
	 *     _id:               'inter',
	 *     name:              'Inter',
	 *     slug:              'inter',
	 *     category:          'theme',
	 *     font_type:         'theme',
	 *     font_weights:      [ '400', '400i', '700' ],
	 *     subsets:           [],
	 *     files:             { '400' => 'https://.../inter-400.woff2', ... },
	 *     faces:             [ { weight, style, src, variant, font_family } ],
	 *     font_family_stack: 'Inter, sans-serif',  // raw fontFamily, used by CSS emitter
	 *     url:               '',                   // local fonts; @font-face emitted separately
	 *   }
	 */
	public static function get_fonts() {
		if ( null !== self::$cache ) {
			return self::$cache;
		}

		// WP 5.9+ check.
		if ( ! class_exists( 'WP_Theme_JSON_Resolver' ) ) {
			self::$cache = array();
			return self::$cache;
		}

		$theme_data = WP_Theme_JSON_Resolver::get_theme_data();
		if ( ! is_object( $theme_data ) || ! method_exists( $theme_data, 'get_settings' ) ) {
			self::$cache = array();
			return self::$cache;
		}

		$settings = $theme_data->get_settings();
		if ( empty( $settings['typography']['fontFamilies']['theme'] ) ) {
			self::$cache = array();
			return self::$cache;
		}

		$families = $settings['typography']['fontFamilies']['theme'];
		$out      = array();
		foreach ( $families as $family ) {
			$entry = self::normalize_family( $family );
			if ( $entry ) {
				$out[ $entry['_id'] ] = $entry;
			}
		}

		self::$cache = $out;
		return self::$cache;
	}

	/**
	 * Reset the per-request cache. For tests / admin actions that change
	 * the theme.json source within the same request.
	 */
	public static function flush() {
		self::$cache = null;
	}

	/**
	 * Normalize one theme.json fontFamilies entry.
	 *
	 * @param array $family
	 * @return array|null Normalized entry, or null if unusable.
	 */
	protected static function normalize_family( $family ) {
		// Display name: prefer explicit `name`, else first token of `fontFamily`.
		$name = '';
		if ( ! empty( $family['name'] ) ) {
			$name = (string) $family['name'];
		} elseif ( ! empty( $family['fontFamily'] ) ) {
			$first = trim( explode( ',', (string) $family['fontFamily'] )[0] );
			$name  = trim( $first, "\"' " );
		}
		if ( '' === $name ) {
			return null;
		}

		$stack = isset( $family['fontFamily'] ) ? (string) $family['fontFamily'] : $name;
		$slug  = isset( $family['slug'] ) ? sanitize_title( $family['slug'] ) : sanitize_title( $name );
		$id    = sanitize_title( $name );

		$faces       = array();
		$weights_map = array();
		$files       = array();

		$font_faces = ( isset( $family['fontFace'] ) && is_array( $family['fontFace'] ) ) ? $family['fontFace'] : array();
		foreach ( $font_faces as $face ) {
			$style         = isset( $face['fontStyle'] ) ? strtolower( (string) $face['fontStyle'] ) : 'normal';
			$face_weights  = self::expand_weight( isset( $face['fontWeight'] ) ? (string) $face['fontWeight'] : '400' );
			$src           = self::pick_src( isset( $face['src'] ) ? $face['src'] : '' );
			if ( ! $src ) {
				continue;
			}
			foreach ( $face_weights as $weight ) {
				$token                 = self::variant_token( $weight, $style );
				$weights_map[ $token ] = $token;
				if ( ! isset( $files[ $token ] ) ) {
					$files[ $token ] = $src;
				}
				$faces[] = array(
					'weight'      => (string) $weight,
					'style'       => $style,
					'src'         => $src,
					'variant'     => $token,
					'font_family' => $name,
				);
			}
		}

		if ( empty( $weights_map ) ) {
			// Family declared without fontFace (pure CSS stack like a system
			// font). Surface 400/700 so it appears in the picker; CSS emitter
			// will use $font_family_stack as-is.
			$weights_map = array(
				'400' => '400',
				'700' => '700',
			);
		}

		return array(
			'_id'               => $id,
			'name'              => $name,
			'slug'              => $slug,
			'category'          => 'theme',
			'font_type'         => 'theme',
			'font_weights'      => array_values( $weights_map ),
			'subsets'           => array(),
			'files'             => $files,
			'faces'             => $faces,
			'font_family_stack' => $stack,
			'url'               => '',
		);
	}

	/**
	 * Collapse a (weight, style) pair into Google variant notation.
	 *
	 *   (400, normal)  -> '400'
	 *   (400, italic)  -> '400i'
	 *   (700, italic)  -> '700i'
	 *
	 * Matches the encoding used by Google Fonts catalogue entries elsewhere
	 * in this plugin.
	 *
	 * @param string|int $weight
	 * @param string     $style
	 * @return string
	 */
	protected static function variant_token( $weight, $style ) {
		$w = (string) intval( $weight );
		if ( 'italic' === strtolower( (string) $style ) ) {
			return $w . 'i';
		}
		return $w;
	}

	/**
	 * Expand a fontWeight field to concrete weights.
	 *
	 * theme.json may declare a variable-font range like "300 900". We expose
	 * every 100-step value in the inclusive range so the user can pick a
	 * meaningful weight from the picker (300, 400, 500, ..., 900).
	 *
	 * Trade-off: this lists 7 entries for a single range, but truncating
	 * with intval() would silently drop everything except the lower bound,
	 * which is the worse failure mode.
	 *
	 * @param string $weight
	 * @return int[]
	 */
	protected static function expand_weight( $weight ) {
		$weight = trim( $weight );
		if ( '' === $weight ) {
			return array( 400 );
		}
		if ( preg_match( '/^(\d+)\s+(\d+)$/', $weight, $m ) ) {
			$lo = intval( $m[1] );
			$hi = intval( $m[2] );
			if ( $lo > $hi ) {
				list( $lo, $hi ) = array( $hi, $lo );
			}
			$out   = array();
			$start = max( 100, (int) ( ceil( $lo / 100 ) * 100 ) );
			$end   = min( 900, $hi );
			for ( $w = $start; $w <= $end; $w += 100 ) {
				$out[] = $w;
			}
			if ( empty( $out ) ) {
				$out[] = max( 100, min( 900, $lo ) );
			}
			return $out;
		}
		return array( intval( $weight ) );
	}

	/**
	 * Pick the best src URL for a font face.
	 *
	 * `src` may be a single string or an array of URLs (multiple formats).
	 * Format priority: woff2 > woff > ttf > otf.
	 *
	 * `file:./...` is resolved against the active theme via
	 * get_theme_file_uri().
	 *
	 * @param string|array $src
	 * @return string Absolute URL, or '' if nothing usable.
	 */
	protected static function pick_src( $src ) {
		if ( empty( $src ) ) {
			return '';
		}
		$candidates = (array) $src;
		$by_ext     = array(
			'woff2' => '',
			'woff'  => '',
			'ttf'   => '',
			'otf'   => '',
		);
		foreach ( $candidates as $url ) {
			$url = self::resolve_url( (string) $url );
			if ( ! $url ) {
				continue;
			}
			$path = wp_parse_url( $url, PHP_URL_PATH );
			$ext  = $path ? strtolower( pathinfo( $path, PATHINFO_EXTENSION ) ) : '';
			if ( isset( $by_ext[ $ext ] ) && '' === $by_ext[ $ext ] ) {
				$by_ext[ $ext ] = $url;
			}
		}
		foreach ( $by_ext as $url ) {
			if ( '' !== $url ) {
				return $url;
			}
		}
		// Nothing matched the known extensions; fall back to first candidate.
		return self::resolve_url( (string) reset( $candidates ) );
	}

	/**
	 * Resolve one src URL. Translates `file:./...` to a theme URI.
	 *
	 * @param string $url
	 * @return string
	 */
	protected static function resolve_url( $url ) {
		if ( '' === $url ) {
			return '';
		}
		if ( 0 === strpos( $url, 'file:./' ) ) {
			return get_theme_file_uri( substr( $url, 7 ) );
		}
		if ( 0 === strpos( $url, 'file:' ) ) {
			return get_theme_file_uri( substr( $url, 5 ) );
		}
		return $url;
	}
}
