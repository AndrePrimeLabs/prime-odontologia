<?php
/**
 * WP Font Library source.
 *
 * Reads user-activated fonts from the WordPress Font Library (WP 6.5+) and
 * exposes them in the shape used by OnePress Plus's typography picker.
 *
 * Data flow
 *   wp_get_global_settings()
 *     -> ['typography']['fontFamilies']['custom']   (user origin only)
 *     -> self::normalize_family() per entry
 *     -> { font_id => normalized entry } catalogue map
 *
 * CRITICAL: do NOT query the wp_font_family / wp_font_face post types.
 *   The Font Library UI's "deactivate variant" toggle does NOT delete the
 *   wp_font_face post — it only removes that face from the user-origin
 *   entry in theme.json. Querying the CPTs directly returns deactivated
 *   faces, producing variants the user explicitly turned off.
 *
 *   wp_get_global_settings()[...]['custom'] is the authoritative activation
 *   set — the same source wp_print_font_faces() reads from. Toggling a
 *   variant off in the Font Library UI removes it here automatically.
 *
 * @package OnePress_Plus
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OnePress_Plus_Library_Fonts {

	/**
	 * Per-request memoization. null = not resolved yet.
	 *
	 * @var array|null
	 */
	protected static $cache = null;

	/**
	 * Normalized library-activated fonts.
	 *
	 * Returns [] when:
	 *   - WP < 5.9 (no wp_get_global_settings)
	 *   - site never used the Font Library (no 'custom' origin in settings)
	 *
	 * Shape matches OnePress_Plus_Theme_Fonts::get_fonts() — see that class
	 * for the entry layout. font_type is 'library'; category is 'library'.
	 *
	 * @return array
	 */
	public static function get_fonts() {
		if ( null !== self::$cache ) {
			return self::$cache;
		}

		if ( ! function_exists( 'wp_get_global_settings' ) ) {
			self::$cache = array();
			return self::$cache;
		}

		$settings = wp_get_global_settings();
		if ( empty( $settings['typography']['fontFamilies']['custom'] ) ) {
			self::$cache = array();
			return self::$cache;
		}

		$families = $settings['typography']['fontFamilies']['custom'];
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
	 * Reset the per-request cache.
	 */
	public static function flush() {
		self::$cache = null;
	}

	/**
	 * Normalize one fontFamilies['custom'] entry.
	 *
	 * URLs in the 'custom' origin are typically already absolute, but we
	 * still run them through pick_src() so:
	 *   - the multi-format priority (woff2 > woff > ttf > otf) is applied;
	 *   - any defensive `file:./...` handling kicks in if a future WP
	 *     release changes the storage shape.
	 *
	 * @param array $family
	 * @return array|null
	 */
	protected static function normalize_family( $family ) {
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
			$style        = isset( $face['fontStyle'] ) ? strtolower( (string) $face['fontStyle'] ) : 'normal';
			$face_weights = self::expand_weight( isset( $face['fontWeight'] ) ? (string) $face['fontWeight'] : '400' );
			$src          = self::pick_src( isset( $face['src'] ) ? $face['src'] : '' );
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
			// Library entry with no usable faces — skip rather than fake one;
			// such an entry can't render anything anyway.
			return null;
		}

		return array(
			'_id'               => $id,
			'name'              => $name,
			'slug'              => $slug,
			'category'          => 'library',
			'font_type'         => 'library',
			'font_weights'      => array_values( $weights_map ),
			'subsets'           => array(),
			'files'             => $files,
			'faces'             => $faces,
			'font_family_stack' => $stack,
			'url'               => '',
		);
	}

	/**
	 * @see OnePress_Plus_Theme_Fonts::variant_token()
	 */
	protected static function variant_token( $weight, $style ) {
		$w = (string) intval( $weight );
		if ( 'italic' === strtolower( (string) $style ) ) {
			return $w . 'i';
		}
		return $w;
	}

	/**
	 * @see OnePress_Plus_Theme_Fonts::expand_weight()
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
	 * @see OnePress_Plus_Theme_Fonts::pick_src()
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
		return self::resolve_url( (string) reset( $candidates ) );
	}

	/**
	 * Resolve one src URL. Translates `file:./...` to a theme URI as a
	 * defensive fallback if the Font Library ever stores theme-bundled
	 * paths in this shape.
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
