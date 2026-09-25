<?php

/**
 * Load auxiliary font sources (theme.json + WP Font Library).
 *
 * These classes are read-only normalizers. They contribute the "Theme" and
 * "WP Font Library" groups that appear at the top of the picker.
 * See class-theme-fonts.php and class-library-fonts.php for data flow.
 */
require_once dirname(__FILE__) . '/class-theme-fonts.php';
require_once dirname(__FILE__) . '/class-library-fonts.php';

/**
 * Sanitize typography fields
 *
 * @param $value
 * @return bool|mixed|string|void
 */
function onepress_sanitize_typography_field($value)
{

	if (is_string($value)) {
		$value = json_decode($value, true);
	}

	if (!is_array($value)) {
		return false;
	}

	foreach ($value as $k => $v) {
		$value[strtolower($k)] = sanitize_text_field($v);
	}

	$value = array_filter($value);
	return json_encode($value);
}



function onepress_typography_get_default_fonts()
{

	// Declare default font list
	$font_list = array(
		'Arial'               => array('weights' => array('400', '400italic', '700', '700italic')),
		'Century Gothic'      => array('weights' => array('400', '400italic', '700', '700italic')),
		'Courier New'         => array('weights' => array('400', '400italic', '700', '700italic')),
		'Georgia'             => array('weights' => array('400', '400italic', '700', '700italic')),
		'Helvetica'           => array('weights' => array('400', '400italic', '700', '700italic')),
		'Impact'              => array('weights' => array('400', '400italic', '700', '700italic')),
		'Lucida Console'      => array('weights' => array('400', '400italic', '700', '700italic')),
		'Lucida Sans Unicode' => array('weights' => array('400', '400italic', '700', '700italic')),
		'Palatino Linotype'   => array('weights' => array('400', '400italic', '700', '700italic')),
		'sans-serif'          => array('weights' => array('400', '400italic', '700', '700italic')),
		'serif'               => array('weights' => array('400', '400italic', '700', '700italic')),
		'Tahoma'              => array('weights' => array('400', '400italic', '700', '700italic')),
		'Trebuchet MS'        => array('weights' => array('400', '400italic', '700', '700italic')),
		'Verdana'             => array('weights' => array('400', '400italic', '700', '700italic')),
	);

	// Build font list to return
	$fonts = array();
	foreach ($font_list as $font => $attributes) {

		// Create a font array containing it's properties and add it to the $fonts array
		$atts = array(
			'name'         => $font,
			'font_type'    => 'default',
			'font_weights' => $attributes['weights'],
			'subsets'      => array(),
			'url'          => '',
		);

		// Add this font to all of the fonts
		$id           = sanitize_title($font);
		$fonts[$id] = $atts;
	}

	// Filter to allow us to modify the fonts array before saving the transient

	return apply_filters('onepress_typography_get_default_fonts', $fonts);
}


function onepress_typography_get_google_fonts()
{

	$fonts = apply_filters('onepress_typography_before_get_google_fonts', null);
	if (is_array($fonts)) {
		return $fonts;
	}
	/**
	 * Pull in raw file from the WordPress subversion
	 * repository as a last resort.
	 */
	$font_output = include dirname(__FILE__) . '/google-fonts.php';

	$fonts = array();

	$scheme = is_ssl() ? 'https' : 'http';
	if (is_array($font_output)) {
		foreach ($font_output['items'] as $item) {

			$name = str_replace(' ', '+', $item['family']);

			$url = $scheme . "://fonts.googleapis.com/css?family={$name}:" . join(',', $item['variants']);
			if (isset($item['subsets'])) {
				$url .= '&subset=' . join(',', $item['subsets']);
			}
			$url .= '&display=swap';

			$atts = array(
				'name'         => $item['family'],
				'category'     => $item['category'],
				'font_type'    => 'google',
				'font_weights' => $item['variants'],
				'subsets'      => $item['subsets'],
				'files'      => $item['files'],
				'url'          => $url,
			);

			// Add this font to the fonts array
			$id           = sanitize_title($item['family']);
			$fonts[$id] = $atts;
		}
	}

	return apply_filters('onepress_typography_get_google_fonts', $fonts);
}

/**
 * Get the combined font catalogue for the picker.
 *
 * Source priority (earlier wins on family-name collision):
 *   1. Theme         — fonts declared in active theme's theme.json
 *   2. WP Font Library — user-activated fonts (WP 6.5+)
 *   3. Default       — system stack (Arial, Georgia, ...)
 *   4. Google        — bundled catalogue snapshot
 *
 * Why earlier wins: a font that is explicitly declared by the theme or
 * activated by the user represents intent — the same name in the Google
 * catalogue would be a generic fallback we should hide.
 *
 * Why Google is NOT in the transient anymore: Library activations and
 * theme.json edits can change between requests. We still cache the Google
 * portion (which is a static file) but recompute the rest each call.
 * Theme/Library resolvers are memoized per request in their own classes.
 *
 * Empty Library handling: returns a single placeholder entry keyed
 * '__no_library_fonts__' with `_disabled = true` so the picker can show
 * the group label and disabled option. This is intentional — users need
 * to discover the integration even when no fonts are activated.
 *
 * @since 1.0.0
 * @since 2.3.4
 * @since 2.3.14 Added Theme + WP Font Library sources.
 *
 * @return array Map: font_id => entry. Library group may contain the
 *               '__no_library_fonts__' placeholder when empty.
 */
function onepress_typography_get_fonts()
{
	$theme   = OnePress_Plus_Theme_Fonts::get_fonts();
	$library = OnePress_Plus_Library_Fonts::get_fonts();
	$default = onepress_typography_get_default_fonts();

	$disable_google = (bool) get_theme_mod('onepress_disable_g_font');
	if ($disable_google) {
		$google = array();
	} else {
		if (false === ($google = get_transient('wp_typography_fonts_google'))) {
			$google = onepress_typography_get_google_fonts();
			set_transient('wp_typography_fonts_google', $google, 24 * HOUR_IN_SECONDS);
		}
	}

	// Collision rule: earlier group wins. array_diff_key keeps later entries
	// only when their key is not already present in $taken.
	$taken   = $theme;
	$library = array_diff_key($library, $taken);
	$taken   = $taken + $library;
	$default = array_diff_key($default, $taken);
	$taken   = $taken + $default;
	$google  = array_diff_key($google, $taken);

	// Library group placeholder when empty — always show the label so users
	// can discover the integration. Picker JS renders entries with
	// _disabled=true as <option disabled>.
	if (empty($library)) {
		$library = array(
			'__no_library_fonts__' => array(
				'name'         => __('No fonts activated — manage via Appearance → Fonts', 'onepress-plus'),
				'font_type'    => 'library',
				'category'     => 'library',
				'font_weights' => array(),
				'subsets'      => array(),
				'files'        => array(),
				'url'          => '',
				'_disabled'    => true,
			),
		);
	}

	// Order in catalogue determines group order in the picker (selectFontOptions
	// iterates in insertion order, grouping by font_type).
	$out = array();
	foreach ($theme as $id => $f) {
		$out[$id] = $f;
	}
	foreach ($library as $id => $f) {
		$out[$id] = $f;
	}
	foreach ($default as $id => $f) {
		$out[$id] = $f;
	}
	foreach ($google as $id => $f) {
		$out[$id] = $f;
	}

	return apply_filters('onepress_typography_get_fonts', $out);
}

/**
 * Group labels shown in the picker.
 *
 * Keyed by the entry's `font_type`. Pass to JS via wp_localize_script so
 * the picker can show localized labels instead of raw slugs.
 *
 * @since 2.3.14
 *
 * @return array
 */
function onepress_typography_get_group_labels()
{
	return apply_filters(
		'onepress_typography_group_labels',
		array(
			'theme'   => __('Theme', 'onepress-plus'),
			'library' => __('WP Font Library', 'onepress-plus'),
			'default' => __('Default Web Fonts', 'onepress-plus'),
			'google'  => __('Google Web Fonts', 'onepress-plus'),
		)
	);
}



if (class_exists('WP_Customize_Control')) {

	/**
	 * Typography control class.
	 *
	 * @since  1.0.0
	 * @access public
	 */
	class OnePress_Customize_Typography_Control extends WP_Customize_Control
	{

		/**
		 * The type of customize control being rendered.
		 *
		 * @since  1.0.0
		 * @access public
		 * @var    string
		 */
		public $type = 'typography';

		/**
		 * Array
		 *
		 * @since  1.0.0
		 * @access public
		 * @var    string
		 */
		public $l10n = array();

		/**
		 * CSS selector
		 *
		 * @var string
		 */
		public $css_selector = '';

		/**
		 * Settings fields
		 *
		 * @var array
		 */
		public $fields = array();

		/**
		 * Set up our control.
		 *
		 * @since  1.0.0
		 * @access public
		 * @param  object $manager
		 * @param  string $id
		 * @param  array  $args
		 * @return void
		 */
		public function __construct($manager, $id, $args = array())
		{

			// Let the parent class do its thing.
			parent::__construct($manager, $id, $args);

			// Make sure we have labels.
			$this->l10n = wp_parse_args(
				$this->l10n,
				array(
					'family'          => esc_html__('Font Family', 'onepress-plus'),
					'option_default'  => esc_html__('Default', 'onepress-plus'),
					'size'            => esc_html__('Font Size (px)', 'onepress-plus'),
					'style'           => esc_html__('Font Weight/Style', 'onepress-plus'),
					'line_height'     => esc_html__('Line Height (px)', 'onepress-plus'),
					'text_decoration' => esc_html__('Text Decoration', 'onepress-plus'),
					'letter_spacing'  => esc_html__('Letter Spacing (px)', 'onepress-plus'),
					'text_transform'  => esc_html__('Text Transform', 'onepress-plus'),
					'color'           => esc_html__('Color', 'onepress-plus'),
				)
			);

			$this->css_selector = isset($args['css_selector']) ? $args['css_selector'] : '';
			if (!isset($args['fields'])) {
				$args['fields'] = array();
			}

			$this->fields = $args['fields'];
		}

		/**
		 * Add custom parameters to pass to the JS via JSON.
		 *
		 * @since  1.0.0
		 * @access public
		 * @return void
		 */
		public function to_json()
		{
			parent::to_json();

			// Coerce to string — legacy theme_mod rows can be object/array.
			$value = $this->value();
			if (is_object($value) || is_array($value)) {
				$value = wp_json_encode($value);
			} elseif (!is_string($value)) {
				$value = '';
			}
			$value  = json_decode($value, true);
			$fields = array();
			foreach ($this->fields as $k => $v) {
				$fields[str_replace('-', '_', $k)] = true;
			}
			// Default value
			if (!is_array($value)) {
				$value = $this->fields;
			}

			$fields = wp_parse_args(
				$fields,
				array(
					'font_family'     => false,
					'color'           => false,
					'font_style'      => false,
					'font_size'       => false,
					'line_height'     => false,
					'letter_spacing'  => false,
					'text_transform'  => false,
					'text_decoration' => false,
				)
			);

			// CSS variable hand-off: look up the var name registered for
			// this setting via onepress_typography_helper_auto_apply (see
			// inc/typography/auto-apply.php). When set, the live-preview
			// JS will emit `:root { <var>: <stack> }` plus a per-selector
			// `font-family: var(<var>)` rule instead of writing the font
			// directly to element-level inline styles (which would beat
			// the cascade with specificity 1,0,0,0).
			global $wp_typography_auto_apply;
			$css_var = '';
			if (isset($wp_typography_auto_apply[$this->id]['css_var'])) {
				$css_var = (string) $wp_typography_auto_apply[$this->id]['css_var'];
			}

			// Loop through each of the settings and set up the data for it.
			// $this->json['value']         = is_array( $this->value() ) ?  json_encode( $this->value() ) :  $this->value() ;
			$this->json['value']        = json_encode($value);
			$this->json['labels']       = $this->l10n;
			$this->json['css_selector'] = $this->css_selector;
			$this->json['css_var']      = $css_var;
			$this->json['fields']       = $fields;
		}


		/**
		 * Get url of any dir
		 *
		 * @param string $file full path of current file in that dir
		 * @return string
		 */
		public static function get_url()
		{
			return ONEPRESS_PLUS_URL . 'inc/typography/';
		}

		public static function get_default_fonts()
		{
			return onepress_typography_get_default_fonts();
		}

		/**
		 * Returns the available fonts.  Fonts should have available weights, styles, and subsets.
		 *
		 * @todo Integrate with Google fonts.
		 *
		 * @since  1.0.0
		 * @access public
		 * @return array
		 */
		static function get_google_fonts()
		{
			return onepress_typography_get_google_fonts();
		}

		public static function get_fonts()
		{
			return onepress_typography_get_fonts();
		}

		public static function get_font_by_id($id)
		{
			$id = sanitize_title($id);
			if (!$id) {
				return false;
			}
			$fonts = self::get_fonts();
			if (isset($fonts[$id])) {
				return $fonts[$id];
			}
			return false;
		}


		/**
		 * Enqueue scripts/styles.
		 *
		 * @since  1.0.0
		 * @access public
		 * @return void
		 */
		public function enqueue()
		{
			wp_enqueue_script('wp-color-picker');
			wp_enqueue_style('wp-color-picker');

			// Asset file from webpack — provides webpack-tracked deps + content-hash version.
			$asset = require ONEPRESS_PLUS_PATH . 'build/js/typography-control.asset.php';
			wp_register_script(
				'typography-customize-controls',
				ONEPRESS_PLUS_URL . 'build/js/typography-control.js',
				array_merge(array('customize-controls'), $asset['dependencies']),
				$asset['version'],
				true
			);
			// Tom Select stylesheet — extracted by webpack from the JS entry's
			// `import 'tom-select/dist/css/tom-select.min.css'`. Registered as
			// a dependency of the picker UI CSS below so load order is correct
			// (vendor first, then custom overrides).
			wp_register_style(
				'typography-control-vendor',
				ONEPRESS_PLUS_URL . 'build/js/typography-control.css',
				array(),
				$asset['version']
			);
			wp_register_style(
				'typography-customize-controls',
				ONEPRESS_PLUS_URL . 'build/css/typography-controls.css',
				array('typography-control-vendor'),
				ONEPRESS_PLUS_VERSION
			);
			wp_enqueue_script('typography-customize-controls');
			wp_enqueue_style('typography-customize-controls');

			wp_localize_script('typography-customize-controls', 'typographyWebfonts', $this->get_fonts());
			wp_localize_script(
				'typography-customize-controls',
				'typographyGroupLabels',
				onepress_typography_get_group_labels()
			);
			wp_localize_script(
				'typography-customize-controls',
				'typographyAjax',
				array(
					'url'   => admin_url('admin-ajax.php'),
					'nonce' => wp_create_nonce('onepress_typography_get_fonts'),
					'action' => 'onepress_typography_get_fonts',
				)
			);
			wp_localize_script(
				'typography-customize-controls',
				'fontStyleLabels',
				array(
					'100'       => __('Thin 100', 'onepress-plus'),
					'100italic' => __('Thin 100 Italic', 'onepress-plus'),
					'200'       => __('Extra-Light 200'),
					'200italic' => __('Extra-Light 200 Italic', 'onepress-plus'),
					'300'       => __('Light 300'),
					'300italic' => __('Light 300 Italic', 'onepress-plus'),
					'400'       => __('Normal 400'),
					'400italic' => __('Normal 400 Italic', 'onepress-plus'),
					'regular'   => __('Normal'),
					'italic'    => __('Normal Italic', 'onepress-plus'),
					'500'       => __('Medium 500'),
					'500italic' => __('Medium 500 Italic', 'onepress-plus'),
					'600'       => __('Semi-Bold 600'),
					'600italic' => __('Semi-Bold 600 Italic', 'onepress-plus'),
					'700'       => __('Bold 700', 'onepress-plus'),
					'700italic' => __('Bold 700 Italic', 'onepress-plus'),
					'800'       => __(' Extra-Bold 800'),
					'800italic' => __(' Extra-Bold 800 Italic', 'onepress-plus'),
					'900'       => __('Ultra-Bold 900', 'onepress-plus'),
					'900italic' => __('Ultra-Bold 900 Italic', 'onepress-plus'),
				)
			);
		}


		/**
		 * No-op — UI is rendered by {@see content_template()} (Backbone JS).
		 * Skipping the base render_content() avoids its `default:` switch arm
		 * calling `esc_attr( $this->value() )`, which fatals when the stored
		 * theme_mod is an object.
		 *
		 * @since 2.3.15
		 */
		protected function render_content() {}

		/**
		 * Underscore JS template to handle the control's output.
		 *
		 * @since  1.0.0
		 * @access public
		 * @return void
		 */
		public function content_template()
		{

?>
			<div class="typography-wrap">

				<div class="typography-header">
					<# if ( data.label ) { #>
						<span class="customize-control-title">{{ data.label }}</span>
						<# } #>

							<# if ( data.description ) { #>
								<span class="description customize-control-description">{{{ data.description }}}</span>
								<# } #>
				</div>

				<div class="typography-settings">

					<ul>
						<# if ( data.fields.font_family ) { #>
							<li class="typography-font-family">
								<span class="customize-control-title">{{ data.labels.family }}</span>
								<select class="font-family select-typo-font-families"></select>
							</li>
							<# } #>

								<# if ( data.fields.font_family && data.fields.font_style ) { #>
									<li class="typography-font-style typography-half">
										<span class="customize-control-title">{{ data.labels.style }}</span>
										<select class="font-style"></select>
									</li>
									<# } #>

										<# if ( data.fields.font_size ) { #>
											<li class="typography-font-size typography-half right">
												<span class="customize-control-title">{{ data.labels.size  }}</span>
												<input class="unit-value font-size" placeholder="<?php esc_attr_e('Default', 'onepress-plus'); ?>" type="number" min="1" />
											</li>
											<# } #>

												<# if ( data.fields.line_height ) { #>
													<li class="typography-line-height first typography-half">
														<span class="customize-control-title">{{ data.labels.line_height }}</span>
														<input class="unit-value line-height" placeholder="<?php esc_attr_e('Default', 'onepress-plus'); ?>" type="number" min="1" />
													</li>
													<# } #>

														<# if ( data.fields.letter_spacing ) { #>
															<li class="typography-letter-spacing typography-half right">
																<span class="customize-control-title">{{ data.labels.letter_spacing }}</span>
																<input class="unit-value letter-spacing" placeholder="<?php esc_attr_e('Default', 'onepress-plus'); ?>" type="number" />
															</li>
															<# } #>

																<# if ( data.fields.text_decoration ) { #>
																	<li class="typography-text-decoration clr">
																		<span class="customize-control-title">{{ data.labels.text_decoration }}</span>
																		<select class="text-decoration">
																			<option value=""><?php esc_attr_e('Default', 'onepress-plus'); ?></option>
																			<option value="none"><?php esc_attr_e('None', 'onepress-plus'); ?></option>
																			<option value="overline"><?php esc_attr_e('Overline', 'onepress-plus'); ?></option>
																			<option value="underline"><?php esc_attr_e('Underline', 'onepress-plus'); ?></option>
																			<option value="line-through"><?php esc_attr_e('Line through', 'onepress-plus'); ?></option>
																		</select>
																	</li>
																	<# } #>

																		<# if ( data.fields.text_transform ) { #>
																			<li class="typography-text-transform clr">
																				<span class="customize-control-title">{{ data.labels.text_transform }}</span>
																				<select class="text-transform">
																					<option value=""><?php esc_attr_e('Default', 'onepress-plus'); ?></option>
																					<option value="none"><?php esc_attr_e('None', 'onepress-plus'); ?></option>
																					<option value="uppercase"><?php esc_attr_e('Uppercase', 'onepress-plus'); ?></option>
																					<option value="lowercase"><?php esc_attr_e('Lowercase', 'onepress-plus'); ?></option>
																					<option value="capitalize"><?php esc_attr_e('Capitalize', 'onepress-plus'); ?></option>
																				</select>
																			</li>
																			<# } #>

																				<# if ( data.fields.color ) { #>
																					<li class="typography-text-transform clr">
																						<span class="customize-control-title">{{ data.labels.color }}</span>
																						<input type="text" class="text-color" />
																					</li>
																					<# } #>

					</ul>
				</div>
			</div>
<?php
		}
	}
}

/**
 * AJAX endpoint: return the current font catalogue.
 *
 * Phase 5 — refresh on control expand. The catalogue ships once at page
 * load via wp_localize_script(); this endpoint lets the picker re-fetch
 * fresh state when the user expands a typography control. Catches:
 *   - Library fonts activated/deactivated in another tab
 *   - theme.json swapped during a session
 *
 * Nonce-guarded and admin-only (Customizer is `edit_theme_options`).
 *
 * @since 2.3.14
 */
function onepress_typography_ajax_get_fonts()
{
	check_ajax_referer('onepress_typography_get_fonts', 'nonce');

	if (! current_user_can('edit_theme_options')) {
		wp_send_json_error(array('message' => 'forbidden'), 403);
	}

	// Flush per-request resolver caches so we read the latest theme.json
	// and Library activation state on this fetch.
	if (class_exists('OnePress_Plus_Theme_Fonts')) {
		OnePress_Plus_Theme_Fonts::flush();
	}
	if (class_exists('OnePress_Plus_Library_Fonts')) {
		OnePress_Plus_Library_Fonts::flush();
	}

	wp_send_json_success(
		array(
			'fonts'        => onepress_typography_get_fonts(),
			'group_labels' => onepress_typography_get_group_labels(),
		)
	);
}
add_action('wp_ajax_onepress_typography_get_fonts', 'onepress_typography_ajax_get_fonts');
