<?php
/**
 * Class used to load and output the cookie banner.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Banner.
 */
class WPConsent_Banner {

	/**
	 * Banner settings.
	 *
	 * @var array
	 */
	public $settings = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->hooks();
	}

	/**
	 * Hooks.
	 *
	 * @return void
	 */
	public function hooks() {
		add_action( 'wp_footer', array( $this, 'maybe_output_banner' ) );
	}

	/**
	 * Check if the banner should be hidden.
	 *
	 * @return bool
	 */
	protected function should_hide_banner() {
		return false;
	}

	/**
	 * Output the banner if enabled.
	 *
	 * @return void
	 */
	public function maybe_output_banner() {
		if ( ! $this->is_enabled() ) {
			return;
		}

		// Don't load in legacy widget preview in the block editor.
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return;
		}

		// Don't load in the customizer preview.
		if ( is_customize_preview() ) {
			return;
		}

		// Filter to control whether the banner should be output. Child classes can override should_hide_banner().
		$should_output = ! $this->should_hide_banner();
		if ( ! apply_filters( 'wpconsent_banner_output', $should_output ) ) {
			return;
		}

		$this->output_banner();
	}

	/**
	 * Check if the banner is enabled.
	 *
	 * @return bool
	 */
	public function is_enabled() {
		return wpconsent()->settings->get_option( 'enable_consent_banner' );
	}

	/**
	 * Output the banner with proper escaping.
	 *
	 * @return void
	 */
	public function output_banner() {
		// Allowed tags we start with the ones from wp_kses_post.
		$allowed_tags = wp_kses_allowed_html( 'post' );

		// Add the SVG tags from our icons.
		$allowed_tags = array_merge( $allowed_tags, wpconsent_get_icon_allowed_tags() );
		// Let's allow tabindex attribute.
		$allowed_tags['div']['tabindex']   = true;
		$allowed_tags['div']['part']       = true;
		$allowed_tags['button']['part']    = true;
		$allowed_tags['h2']['part']        = true;
		$allowed_tags['label']['part']     = true;
		$allowed_tags['span']['part']      = true;
		$allowed_tags['input']['part']     = true;
		$allowed_tags['p']['part']         = true;
		$allowed_tags['img']['part']       = true;

		// Get colors and create CSS variables.
		$colors   = $this->get_color_settings();
		$css_vars = $this->get_css_variables( $colors );

		// Create the Shadow DOM container with CSS variables.
		echo '<div id="wpconsent-root" data-nosnippet="true" style="' . esc_attr( $css_vars ) . '">';
		echo '<div id="wpconsent-container" style="display: none;"></div>';


		// Create a template that contains both styles and HTML.
		echo '<template id="wpconsent-template">';

		// Add the banner HTML to the template.
		echo wp_kses( $this->get_banner(), $allowed_tags );

		// Add the preferences modal to the template.
		echo $this->get_preferences_modal(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		// Add the floating button to the template.
		$this->floating_consent_button();

		// Add GPC toast notification to the template.
		$this->add_gpc_toast_notification();

		echo '</template>';
		echo '</div>';
	}


	/**
	 * Get CSS variables string from colors array.
	 *
	 * @param array $colors Color settings.
	 *
	 * @return string
	 */
	public function get_css_variables( $colors ) {
		$vars = array(
			'--wpconsent-z-index: 900000;',
			'--wpconsent-background: ' . $colors['background'] . ';',
			'--wpconsent-text: ' . $colors['text'] . ';',
			'--wpconsent-outline-color: ' . $this->hex_to_rgba( $colors['text'], 0.2 ) . ';',
			'--wpconsent-accept-bg: ' . $colors['accept_bg'] . ';',
			'--wpconsent-cancel-bg: ' . $colors['cancel_bg'] . ';',
			'--wpconsent-preferences-bg: ' . $colors['preferences_bg'] . ';',
			'--wpconsent-accept-color: ' . $colors['accept_color'] . ';',
			'--wpconsent-cancel-color: ' . $colors['cancel_color'] . ';',
			'--wpconsent-preferences-color: ' . $colors['preferences_color'] . ';',
			'--wpconsent-font-size: ' . $colors['font_size'] . ';',
		);

		return implode( ' ', $vars );
	}

	/**
	 * Convert hex color to rgba.
	 *
	 * @param string $hex Hex color code.
	 * @param float  $opacity Opacity value.
	 *
	 * @return string
	 */
	private function hex_to_rgba( $hex, $opacity ) {
		$hex = str_replace( '#', '', $hex );

		// Convert shorthand hex to full hex.
		if ( strlen( $hex ) === 3 ) {
			$hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
		}

		// Convert hex to rgb.
		$r = hexdec( substr( $hex, 0, 2 ) );
		$g = hexdec( substr( $hex, 2, 2 ) );
		$b = hexdec( substr( $hex, 4, 2 ) );

		return "rgba({$r}, {$g}, {$b}, {$opacity})";
	}

	/**
	 * Get the banner markup.
	 *
	 * @return string
	 */
	public function get_banner() {
		$font_size       = wpconsent()->settings->get_option( 'banner_font_size', '16px' );
		$button_size     = wpconsent()->settings->get_option( 'banner_button_size', 'regular' );
		$button_corner   = wpconsent()->settings->get_option( 'banner_button_corner', 'slightly-rounded' );
		$button_type     = wpconsent()->settings->get_option( 'banner_button_type', 'filled' );
		$button_order    = wpconsent()->settings->get_option(
			'button_order',
			array(
				'accept',
				'cancel',
				'preferences',
			)
		);
		$banner_layout   = wpconsent()->settings->get_option( 'banner_layout', 'long' );
		$banner_position = wpconsent()->settings->get_option( 'banner_position', 'top' );
		$position_class  = ! empty( $banner_position ) ? 'wpconsent-banner-' . esc_attr( $banner_layout ) . '-' . esc_attr( $banner_position ) : '';
		$logo            = wpconsent()->settings->get_option( 'banner_logo', '' );
		$banner_classes  = apply_filters(
			'wpconsent_banner_classes',
			array(
				'wpconsent-banner-holder',
				'wpconsent-banner-' . $banner_layout,
				$position_class,
			)
		);

		$html = '<div class="' . esc_attr( implode( ' ', $banner_classes ) ) . '" id="wpconsent-banner-holder" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="wpconsent-banner-title">';

		$html .= '<div class="wpconsent-banner" part="wpconsent-banner">';
		$html .= $this->get_banner_top_buttons();
		if ( ! empty( $logo ) ) {
			$html .= '<div class="wpconsent-banner-header">';

			$site_name = get_bloginfo( 'name' );

			$html .= '<div class="wpconsent-banner-logo"><img part="wpconsent-banner-logo" height="30" src="' . esc_url( $logo ) . '" alt="' . esc_html( $site_name ) . '" /></div>';
			$html .= '</div>';
		}

		$text = wpconsent()->settings->get_option( 'banner_message', wpconsent()->strings->get_string( 'banner_message' ) );

		$html .= '<div class="wpconsent-banner-body" part="wpconsent-banner-body">';
		$html .= '<h2 id="wpconsent-banner-title" class="screen-reader-text">' . esc_html__( 'Cookie Consent', 'wpconsent-cookies-banner-privacy-suite' ) . '</h2>';
		$html .= '<div class="wpconsent-banner-message" tabindex="0">' . wp_kses_post( wpautop( $text ) ) . '</div>';
		$html .= apply_filters( 'wpconsent_after_banner_message', '' );
		$html .= '</div>';

		$html .= '<div class="wpconsent-banner-footer wpconsent-button-size-' . esc_attr( $button_size ) . ' wpconsent-button-corner-' . esc_attr( $button_corner ) . ' wpconsent-button-type-' . esc_attr( $button_type ) . '" part="wpconsent-banner-footer">';

		foreach ( $button_order as $button_id ) {
			$enabled     = wpconsent()->settings->get_option( $button_id . '_button_enabled', true );
			$button_text = wpconsent()->settings->get_option( $button_id . '_button_text', '' );

			// Always render the button but add disabled class and data attribute if not enabled
			$disabled_class = ! $enabled ? ' wpconsent-button-disabled' : '';
			$disabled_attr  = ! $enabled ? ' data-disabled="true"' : '';

			$html .= '<button type="button" id="wpconsent-' . esc_attr( $button_id ) . '-all" class="wpconsent-' . esc_attr( $button_id ) . '-cookies wpconsent-banner-button wpconsent-' . esc_attr( $button_id ) . '-all' . esc_attr( $disabled_class ) . '" part="wpconsent-button-' . esc_attr( $button_id ) . '"' . $disabled_attr . '>' . esc_html( $button_text ) . '</button>';
		}

		$html .= '</div>'; // .wpconsent-banner-footer
		$html .= $this->powered_by();
		$html .= '</div>'; // .wpconsent-banner
		$html .= '</div>';// .wpconsent-banner-holder

		return $html;
	}

	/**
	 * Get the top buttons for the banner.
	 *
	 * @return string
	 */
	public function get_banner_top_buttons() {
		// Check if close button is disabled in settings.
		if ( wpconsent()->settings->get_option( 'disable_close_button' ) ) {
			return '';
		}

		$close_text = esc_attr__( 'Close', 'wpconsent-cookies-banner-privacy-suite' );

		return '<button class="wpconsent-banner-close" id="wpconsent-banner-close" aria-label="' . esc_attr( $close_text ) . '">' . wpconsent_get_icon( 'close', 12, 12 ) . '</button>';
	}

	/**
	 * Get the color settings.
	 *
	 * @return array
	 */
	public function get_color_settings() {
		return array(
			'background'        => wpconsent()->settings->get_option( 'banner_background_color', '#FFFFFF' ),
			'text'              => wpconsent()->settings->get_option( 'banner_text_color', '#000000' ),
			'button_text'       => wpconsent()->settings->get_option( 'banner_button_text_color', '#FFFFFF' ),
			'accept_bg'         => wpconsent()->settings->get_option( 'banner_accept_bg', '#0073AA' ),
			'cancel_bg'         => wpconsent()->settings->get_option( 'banner_cancel_bg', '#0073AA' ),
			'preferences_bg'    => wpconsent()->settings->get_option( 'banner_preferences_bg', '#0073AA' ),
			'accept_color'      => wpconsent()->settings->get_option( 'banner_accept_color', '#FFFFFF' ),
			'cancel_color'      => wpconsent()->settings->get_option( 'banner_cancel_color', '#FFFFFF' ),
			'preferences_color' => wpconsent()->settings->get_option( 'banner_preferences_color', '#FFFFFF' ),
			'font_size'         => wpconsent()->settings->get_option( 'banner_font_size', '16px' ),
		);
	}

	/**
	 * Get the preferences modal.
	 *
	 * @return string
	 */
	public function get_preferences_modal() {
		$categories              = wpconsent()->cookies->get_categories();
		$accept_button_text      = wpconsent()->settings->get_option( 'accept_button_text', wpconsent()->strings->get_string( 'accept_button_text' ) );
		$logo                    = wpconsent()->settings->get_option( 'banner_logo', '' );
		$cookie_policy_title     = wpconsent()->settings->get_option( 'cookie_policy_title', wpconsent()->strings->get_string( 'cookie_policy_title' ) );
		$preferences_panel_title = wpconsent()->settings->get_option( 'preferences_panel_title', wpconsent()->strings->get_string( 'preferences_panel_title' ) );
		$default_allow           = wpconsent()->settings->get_option( 'default_allow', 0 );

		$preferences_classes = apply_filters(
			'wpconsent_preferences_modal_classes',
			array(
				'wpconsent-preferences-modal',
			)
		);

		$html = '<div id="wpconsent-preferences-modal" class="' . esc_attr( implode( ' ', $preferences_classes ) ) . '" style="display:none;" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="wpconsent-preferences-title" part="wpconsent-preferences-modal">';

		$html .= '<div class="wpconsent-preferences-content" part="wpconsent-preferences-content">';

		// Preferences header div.
		$html .= '<div class="wpconsent-preferences-header" part="wpconsent-preferences-header">';
		$html .= '<h2 id="wpconsent-preferences-title" tabindex="0" part="wpconsent-preferences-title">' . esc_html( $preferences_panel_title ) . '</h2>';
		$html .= '<div class="wpconsent-preferences-header-right">';
		if ( ! empty( $logo ) ) {
			$site_name = get_bloginfo( 'name' );

			$html .= '<div class="wpconsent-banner-logo"><img part="wpconsent-banner-logo" height="30" src="' . esc_url( $logo ) . '" alt="' . esc_html( $site_name ) . '" /></div>';
		}
		$html .= '<button class="wpconsent-preferences-header-close" id="wpconsent-preferences-close" aria-label="' . esc_attr__( 'Close', 'wpconsent-cookies-banner-privacy-suite' ) . '" aria-label="' . esc_attr__( 'Close', 'wpconsent-cookies-banner-privacy-suite' ) . '" part="wpconsent-preferences-close">&times;</button>';

		$html .= '</div>'; // .wpconsent-preferences-header-right
		$html .= '</div>'; // .wpconsent-preferences-header

		$html .= '<div class="wpconsent-preferences-body">';

		$html .= apply_filters( 'wpconsent_preferences_before_description', '' );
		$html .= '<div class="wpconsent_preferences_panel_description" part="wpconsent-preferences-description">' . wpautop( wp_kses_post( wpconsent()->settings->get_option( 'preferences_panel_description', wpconsent()->strings->get_string('preferences_panel_description') ) ) ) . '</div>';
		$html .= apply_filters( 'wpconsent_preferences_after_description', '' );

		$html .= '<div class="wpconsent-preference-cookies wpconsent-preferences-accordion" part="wpconsent-preferences-accordion">';

		$all_cookies = $this->get_cookies_from_cache();

		/**
		 * Filter to group categories in the preferences modal.
		 *
		 * Allows plugins to group categories with optional section titles and descriptions.
		 * By default, returns a single group with all categories.
		 *
		 * @param array $groups Array of groups. Each group should have:
		 *                      - 'title' (string, optional): Section title.
		 *                      - 'description' (string, optional): Section description.
		 *                      - 'css_class' (string, optional): CSS class for the section wrapper.
		 *                      - 'categories' (array): Array of categories to render in this group.
		 * @param array $categories All available categories.
		 *
		 * @since 1.0.11
		 */
		$category_groups = apply_filters(
			'wpconsent_preferences_category_groups',
			array(
				array(
					'categories' => $categories,
				),
			),
			$categories
		);

		// Loop through each group and render categories.
		foreach ( $category_groups as $group ) {
			if ( empty( $group['categories'] ) ) {
				continue;
			}

			// Open section wrapper if CSS class is provided.
			if ( ! empty( $group['css_class'] ) ) {
				$html .= '<div class="' . esc_attr( $group['css_class'] ) . '">';
			}

			// Add section title if provided.
			if ( ! empty( $group['title'] ) ) {
				$html .= '<h4 class="wpconsent-category-section-heading">' . esc_html( $group['title'] ) . '</h4>';
			}

			// Add section description if provided.
			if ( ! empty( $group['description'] ) ) {
				$html .= '<p class="wpconsent-category-section-description">' . esc_html( $group['description'] ) . '</p>';
			}

			// Render categories in this group.
			foreach ( $group['categories'] as $category_slug => $category ) {
				// Skip empty categories (no cookies and no services) unless it's the essential category.
				$category_cookies = isset( $all_cookies[ $category['id'] ] ) ? $all_cookies[ $category['id'] ] : array();
				$has_cookies      = ! empty( $category_cookies['cookies'] );
				$has_services     = ! empty( $category_cookies['services'] );

				if ( 'essential' !== $category_slug && ! $has_cookies && ! $has_services ) {
					continue;
				}

				$html .= $this->render_category_item( $category_slug, $category, $all_cookies, $default_allow );
			}

			// Close section wrapper if it was opened.
			if ( ! empty( $group['css_class'] ) ) {
				$html .= '</div>';
			}
		}

		// Cookie policy section, if set.
		$cookie_policy_page_id = wpconsent()->settings->get_option( 'cookie_policy_page', 0 );
		if ( $cookie_policy_page_id ) {
			$cookie_policy_page_url = get_permalink( $cookie_policy_page_id );
			$privacy_policy         = get_privacy_policy_url();

			$html .= '<div class="wpconsent-preferences-accordion-item wpconsent-cookie-category" part="wpconsent-accordion-item wpconsent-cookie-policy-item">';
			$html .= '<div class="wpconsent-preferences-accordion-header" part="wpconsent-accordion-header">';
			$html .= '<div class="wpconsent-cookie-category-text">';
			$html .= '<button class="wpconsent-preferences-accordion-toggle" aria-expanded="false" part="wpconsent-accordion-toggle">';
			$html .= '<span class="wpconsent-preferences-accordion-arrow" aria-hidden="true"></span>';
			$html .= '<span class="screen-reader-text">' . esc_html(
				sprintf(
					/* translators: %s: name of the toggled preferences section (cookie policy section, category or service). */
					__( 'Toggle %s', 'wpconsent-cookies-banner-privacy-suite' ),
					$cookie_policy_title
				)
			) . '</span>';
			$html .= '</button>';  // .wpconsent-preferences-accordion-toggle
			$html .= '<label class="wpconsent-cookie-policy-title">' . esc_html( $cookie_policy_title ) . '</label>';
			$html .= '</div>'; // .wpconsent-cookie-category-text
			$html .= '</div>'; // .wpconsent-preferences-accordion-header

			$html .= '<div class="wpconsent-preferences-accordion-content" part="wpconsent-accordion-content">';
			$html .= '<p tabindex="0" class="wpconsent-cookie-policy-text">';

			if ( $privacy_policy ) {
				$default_cookie_policy_text = sprintf(
				/* translators: 1: Cookie policy URL, 2: Privacy policy URL */
					esc_html__( 'You can find more information about our %1$s and %2$s.', 'wpconsent-cookies-banner-privacy-suite' ),
					'<a href="' . esc_url( $cookie_policy_page_url ) . '">' . esc_html__( 'Cookie Policy', 'wpconsent-cookies-banner-privacy-suite' ) . '</a>',
					'<a href="' . esc_url( $privacy_policy ) . '">' . esc_html__( 'Privacy Policy', 'wpconsent-cookies-banner-privacy-suite' ) . '</a>'
				);
			} else {
				$default_cookie_policy_text = sprintf(
				/* translators: %s: Cookie policy URL */
					esc_html__( 'You can find more information in our %s.', 'wpconsent-cookies-banner-privacy-suite' ),
					'<a href="' . esc_url( $cookie_policy_page_url ) . '">' . esc_html__( 'Cookie Policy', 'wpconsent-cookies-banner-privacy-suite' ) . '</a>'
				);
			}
			$html .= wp_kses_post( $this->maybe_replace_smart_tags( wpconsent()->settings->get_option( 'cookie_policy_text', $default_cookie_policy_text ) ) );
			$html .= '</p>';
			$html .= '</div>'; // .wpconsent-preferences-accordion-content
			$html .= '</div>'; // .wpconsent-cookie-category
		}
		$html .= '</div>'; // .wpconsent-preference-cookies

		$html .= apply_filters( 'wpconsent_preferences_after_cookies', '' );

		// Add GPC override toggle to preference panel.
		$html .= $this->add_gpc_override_toggle();

		$html .= '</div>'; // .wpconsent-preferences-body

		$save_preferences_text = wpconsent()->settings->get_option( 'save_preferences_button_text', wpconsent()->strings->get_string( 'save_preferences_button_text' ) );
		$close_text            = wpconsent()->settings->get_option( 'close_button_text', wpconsent()->strings->get_string( 'close_button_text' ) );
		$button_size           = wpconsent()->settings->get_option( 'banner_button_size', 'regular' );
		$button_corner         = wpconsent()->settings->get_option( 'banner_button_corner', 'slightly-rounded' );
		$button_type           = wpconsent()->settings->get_option( 'banner_button_type', 'filled' );

		$html .= '<div class="wpconsent-preferences-actions" part="wpconsent-preferences-actions">';
		$html .= '<div class="wpconsent-preferences-buttons wpconsent-button-size-' . esc_attr( $button_size ) . ' wpconsent-button-corner-' . esc_attr( $button_corner ) . ' wpconsent-button-type-' . esc_attr( $button_type ) . '" part="wpconsent-preferences-buttons">';
		$html .= '<div class="wpconsent-preferences-buttons-left" part="wpconsent-preferences-buttons-left">';
		$html .= apply_filters( 'wpconsent_preferences_before_accept_button', '' );
		$html .= '<button class="wpconsent-accept-all wpconsent-banner-button" part="wpconsent-preferences-accept-button">' . esc_html( $accept_button_text ) . '</button>';
		$html .= '<button class="wpconsent-close-preferences wpconsent-banner-button" part="wpconsent-preferences-cancel-button">' . esc_html( $close_text ) . '</button>';
		$html .= '</div>'; // .wpconsent-preferences-buttons-left
		$html .= '<button class="wpconsent-save-preferences wpconsent-banner-button" part="wpconsent-preferences-save-button">' . esc_html( $save_preferences_text ) . '</button>';
		$html .= '</div>'; // .wpconsent-preferences-buttons
		$html .= '</div>'; // .wpconsent-preferences-actions
		// div for Powered by WPConsent.
		if ( ! wpconsent()->settings->get_option( 'hide_powered_by' ) ) {
			$html .= '<div class="wpconsent-preferences-powered-by">';
			$html .= $this->powered_by();
			$html .= '</div>'; // .wpconsent-preferences-powered-by
		}
		$html .= '</div>'; // .wpconsent-preferences-content
		$html .= '</div>'; // #wpconsent-preferences-modal

		return $html;
	}

	/**
	 * Add GPC override acknowledgment to preference panel
	 *
	 * @return string HTML for the GPC override toggle.
	 */
	public function add_gpc_override_toggle() {
		// Only add if respect_gpc is enabled.
		if ( ! wpconsent()->settings->get_option( 'respect_gpc', 0 ) ) {
			return;
		}

		$gpc_message = wpconsent()->settings->get_option( 'gpc_override_message', wpconsent()->strings->get_string( 'gpc_override_message' ) );

		$content  = '';
		$content .= '<div id="wpconsent-gpc-override-container" class="wpconsent-gpc-override" style="display: none;">';
		$content .= '<div class="wpconsent-gpc-override-header">';
		$content .= '<div class="wpconsent-gpc-override-text">';
		$content .= '<label for="wpconsent-gpc-override-checkbox">' . esc_html( $gpc_message ) . '</label>';
		$content .= '</div>';  // .wpconsent-gpc-override-text.
		$content .= '<div class="wpconsent-gpc-override-toggle">';
		$content .= '<label class="wpconsent-preferences-checkbox-toggle" id="wpconsent-gpc-override-toggle-label">';
		$content .= '<input type="checkbox" id="wpconsent-gpc-override-checkbox" name="gpc_override" value="1" />';
		$content .= '<span class="wpconsent-preferences-checkbox-toggle-slider"></span>';
		$content .= '</label>';
		$content .= '</div>';  // .wpconsent-gpc-override-toggle.
		$content .= '</div>';  // .wpconsent-gpc-override-header.
		$content .= '</div>';  // .wpconsent-gpc-override-container.

		return $content;
	}

	/**
	 * Add GPC toast notification to preference panel
	 *
	 * @return void.
	 */
	public function add_gpc_toast_notification() {
		// Only add if respect_gpc is enabled.
		if ( ! wpconsent()->settings->get_option( 'respect_gpc', 0 ) ) {
			return;
		}

		$gpc_toast_message = wpconsent()->settings->get_option( 'gpc_toast_message', wpconsent()->strings->get_string( 'gpc_toast_message' ) );

		echo '<div id="wpconsent-gpc-toast" class="wpconsent-toast" style="display: none;">';
		echo '<div class="wpconsent-toast-content">';
		echo '<span class="wpconsent-toast-message">' . esc_html( $gpc_toast_message ) . '</span>';
		echo '<button type="button" class="wpconsent-toast-close" aria-label="' . esc_attr__( 'Close', 'wpconsent-cookies-banner-privacy-suite' ) . '">×</button>';
		echo '</div>';  // .wpconsent-toast-content.
		echo '</div>';  // .wpconsent-gpc-toast.
	}

	/**
	 * Get cookies from cache or database
	 *
	 * @return array
	 */
	private function get_cookies_from_cache() {
		$cache_key = 'wpconsent_preference_cookies';

		// Allow cache key to be filtered (e.g., for multilanguage support).
		$cache_key = apply_filters( 'wpconsent_preference_cookies_cache_key', $cache_key );

		$cookies = get_transient( $cache_key );

		if ( false === $cookies ) {
			$categories = wpconsent()->cookies->get_categories();
			$cookies    = array();

			foreach ( $categories as $category_slug => $category ) {
				$category_id             = $category['id'];
				$cookies[ $category_id ] = array(
					'cookies'  => array(),
					'services' => array(),
				);

				$category_cookies = wpconsent()->cookies->get_cookies_by_category( $category_id );
				$services         = wpconsent()->cookies->get_services_by_category( $category_id );

				if ( ! empty( $category_cookies ) ) {
					foreach ( $category_cookies as $cookie ) {
						// Let's skip here the cookies that are not associated with this category directly and are associated with a service.
						if ( ! in_array( $category_id, $cookie['categories'], true ) ) {
							continue;
						}
						// Add cookie to the category's cookie array.
						$cookies[ $category_id ]['cookies'][] = $cookie;
					}
				}

				// Process services and their cookies.
				if ( ! empty( $services ) ) {
					foreach ( $services as $service ) {
						$service_slug                                         = sanitize_title( $service['name'] );
						$cookies[ $category_id ]['services'][ $service_slug ] = array(
							'name'        => $service['name'],
							'description' => $service['description'],
							'service_url' => $service['service_url'],
							'cookies'     => array(),
						);

						// We already loaded all the cookies for this category so we need to simply add the ones for this service.
						if ( ! empty( $category_cookies ) ) {
							foreach ( $category_cookies as $cookie_for_service ) {
								if ( ! in_array( $service['id'], $cookie_for_service['categories'], true ) ) {
									continue;
								}
								$cookies[ $category_id ]['services'][ $service_slug ]['cookies'][] = $cookie_for_service;
							}
						}
					}
				}
			}
			// Cache for 24 hours.
			set_transient( $cache_key, $cookies, DAY_IN_SECONDS );
		}

		return apply_filters( 'wpconsent_get_cookies_from_cache', $cookies );
	}

	/**
	 * Public accessor for the cached category→cookies→services structure.
	 *
	 * @since 1.1.8
	 *
	 * @return array
	 */
	public function get_cached_cookies() {
		return $this->get_cookies_from_cache();
	}

	/**
	 * Render a single category item in the preferences modal.
	 *
	 * @param string $category_slug The category slug.
	 * @param array  $category The category data.
	 * @param array  $all_cookies All cookies data.
	 * @param bool   $default_allow Default allow setting.
	 *
	 * @return string HTML for the category item.
	 */
	private function render_category_item( $category_slug, $category, $all_cookies, $default_allow ) {
		$cookies = isset( $all_cookies[ $category['id'] ] ) ? $all_cookies[ $category['id'] ] : array();

		$html = '<div class="wpconsent-preferences-accordion-item wpconsent-cookie-category wpconsent-cookie-category-' . esc_attr( $category_slug ) . '" part="wpconsent-accordion-item wpconsent-category-' . esc_attr( $category_slug ) . '">';
		$html .= '<div class="wpconsent-preferences-accordion-header" part="wpconsent-accordion-header">';
		$html .= '<div class="wpconsent-cookie-category-text">';
		$html .= '<button class="wpconsent-preferences-accordion-toggle" aria-expanded="false" part="wpconsent-accordion-toggle">';
		$html .= '<span class="wpconsent-preferences-accordion-arrow" aria-hidden="true"></span>';
		$html .= '<span class="screen-reader-text">' . esc_html(
			sprintf(
				/* translators: %s: name of the toggled preferences section (cookie policy section, category or service). */
				__( 'Toggle %s', 'wpconsent-cookies-banner-privacy-suite' ),
				$category['name']
			)
		) . '</span>';
		$html .= '</button>';

		// Use span for IAB TCF categories, label for non-TCF (for checkbox association).
		if ( ! empty( $category['is_iab_tcf'] ) ) {
			$html .= '<span class="wpconsent-category-name">' . esc_html( $category['name'] ) . '</span>';
		} else {
			$html .= '<label for="cookie-category-' . esc_attr( $category_slug ) . '">' . esc_html( $category['name'] ) . '</label>';
		}

		$html .= '</div>'; // .wpconsent-cookie-category-text
		$html .= '<div class="wpconsent-cookie-category-checkbox">';

		if ( 'essential' === $category_slug ) {
			$html .= '<label class="wpconsent-preferences-checkbox-toggle wpconsent-preferences-checkbox-toggle-disabled" part="wpconsent-checkbox-toggle wpconsent-checkbox-toggle-disabled">';
			$html .= '<input type="checkbox" id="cookie-category-' . esc_attr( $category_slug ) . '" checked disabled>';
			$html .= '<span class="wpconsent-preferences-checkbox-toggle-slider"></span>';
			$html .= '</label>';
		} else {
			// Apply filter to allow customization of default state for this category.
			$default_checked = apply_filters( 'wpconsent_category_default_checked', $default_allow, $category_slug, $category );

			$checked_attr = '';
			if ( $default_checked ) {
				$checked_attr = 'checked';
			}

			$html .= '<label class="wpconsent-preferences-checkbox-toggle" part="wpconsent-checkbox-toggle">';
			$html .= '<input type="checkbox" id="cookie-category-' . esc_attr( $category_slug ) . '" name="wpconsent_cookie[]" value="' . esc_attr( $category_slug ) . '" ' . $checked_attr . '>';
			$html .= '<span class="wpconsent-preferences-checkbox-toggle-slider"></span>';
			$html .= '</label>';
		}

		$html .= '</div>'; // .wpconsent-cookie-category-checkbox
		$html .= '</div>'; // .wpconsent-preferences-accordion-header

		$html .= '<div class="wpconsent-preferences-accordion-content" part="wpconsent-accordion-content">';
		$html .= '<p class="wpconsent-category-description" tabindex="0">' . wp_kses_post( $category['description'] ) . '</p>';

		/**
		 * Filter to add content after category description.
		 *
		 * @param string $content HTML content to add.
		 * @param string $category_slug The category slug.
		 * @param array  $category The category data.
		 *
		 * @since 1.0.11
		 */
		$html .= apply_filters( 'wpconsent_after_category_description', '', $category_slug, $category );

		$html .= $this->get_cookies_content_by_category( $cookies, $category['name'], $category_slug );
		$html .= '</div>'; // .wpconsent-preferences-accordion-content

		$html .= '</div>'; // .wpconsent-cookie-category

		return $html;
	}

	/**
	 * Generate the cookies accordioncontent for a category
	 *
	 * @param array  $cookies The cookies array for each category to display.
	 * @param string $category_name The name of the category.
	 * @param string $category_slug The slug of the category.
	 *
	 * @return string
	 */
	private function get_cookies_content_by_category( $cookies, $category_name = '', $category_slug = '' ) {
		if ( empty( $cookies ) ) {
			return '';
		}

		$html          = '';
		$default_allow = wpconsent()->settings->get_option( 'default_allow', false );

		if ( ! empty( $cookies['cookies'] ) ) {
			$html .= $this->get_cookies_table_by_category( $cookies['cookies'] );
		}

		// First display services and their cookies.
		if ( ! empty( $cookies['services'] ) ) {
			foreach ( $cookies['services'] as $service_slug => $service ) {
				$html .= '<div class="wpconsent-preferences-accordion-item wpconsent-cookie-service" part="wpconsent-accordion-item wpconsent-service-' . esc_attr( $service_slug ) . '">';
				$html .= '<div class="wpconsent-preferences-accordion-header" part="wpconsent-accordion-header">';
				// Apply flexible filter for service data attributes.
				$service_data_attrs = apply_filters(
					'wpconsent_service_attrs',
					array(
						'class' => 'wpconsent-preferences-accordion-item wpconsent-cookie-service',
					),
					$service,
					$service_slug,
					$category_slug
				);

				// Convert attributes array to HTML string.
				$service_data_attrs_string = '';
				if ( ! empty( $service_data_attrs ) ) {
					$attr_strings = array();
					foreach ( $service_data_attrs as $attr_name => $attr_value ) {
						$attr_strings[] = esc_attr( $attr_name ) . '="' . esc_attr( $attr_value ) . '"';
					}
					$service_data_attrs_string = implode( ' ', $attr_strings );
				}

				// Check if this is a vendor link service.
				$is_vendors_link = ! empty( $service['is_vendors_link'] );

				if ( $is_vendors_link ) {
					// Render as a button wrapped in paragraph, matching special purposes pattern.
					$purpose_id = ! empty( $service['purpose_id'] ) ? esc_attr( $service['purpose_id'] ) : '';
					$html .= '<p class="wpconsent-purpose-vendor-link">';
					$html .= '<button type="button" class="wpconsent-view-vendors-link wpconsent-view-vendors-purpose" data-purpose-id="' . $purpose_id . '">' . esc_html( $service['name'] ) . '</button>';
					$html .= '</p>';
					$html .= '</div>'; // .wpconsent-preferences-accordion-header
					$html .= '</div>'; // .wpconsent-cookie-service
				} else {
					// Regular service rendering with accordion and checkbox.
					$html .= '<div class="wpconsent-cookie-category-text">';
				$html .= '<button class="wpconsent-preferences-accordion-toggle" aria-expanded="false" part="wpconsent-accordion-toggle">';
					$html .= '<span class="wpconsent-preferences-accordion-arrow" aria-hidden="true"></span>';
					$html .= '<span class="screen-reader-text">' . esc_html(
						sprintf(
							/* translators: %s: name of the toggled preferences section (cookie policy section, category or service). */
							__( 'Toggle %s', 'wpconsent-cookies-banner-privacy-suite' ),
							$service['name']
						)
					) . '</span>';
					$html .= '</button>';  // .wpconsent-preferences-accordion-toggle
					$html .= '<label>' . esc_html( $service['name'] ) . '</label>';
					$html .= '</div>'; // .wpconsent-cookie-category-text
					$html .= '<div class="wpconsent-cookie-category-checkbox">';

					if ( wpconsent()->settings->get_option( 'manual_toggle_services', false ) ) {
						if ( 'essential' === $category_slug ) {
						$html .= '<label class="wpconsent-preferences-checkbox-toggle wpconsent-preferences-checkbox-toggle-disabled" part="wpconsent-checkbox-toggle wpconsent-checkbox-toggle-disabled">';
							$html .= '<input type="checkbox" id="cookie-service-' . esc_attr( $service_slug ) . '" name="wpconsent_cookie[]" value="' . esc_attr( $service_slug ) . '" checked disabled>';
							$html .= '<span class="wpconsent-preferences-checkbox-toggle-slider"></span>';
							$html .= '</label>';  // .wpconsent-preferences-checkbox-toggle
						} else {
							// Apply filter to allow customization of default state for this service.
							$default_checked = apply_filters( 'wpconsent_service_default_checked', $default_allow, $service_slug, $service, $category_slug );

							$checked_attr = $default_checked ? 'checked' : '';

						$html .= '<label class="wpconsent-preferences-checkbox-toggle" part="wpconsent-checkbox-toggle">';
							$html .= '<input type="checkbox" id="cookie-service-' . esc_attr( $service_slug ) . '" name="wpconsent_cookie[]" value="' . esc_attr( $service_slug ) . '" ' . $checked_attr . '>';
							$html .= '<span class="wpconsent-preferences-checkbox-toggle-slider"></span>';
							$html .= '</label>';  // .wpconsent-preferences-checkbox-toggle
						}
					}

					$html .= '</div>'; // .wpconsent-cookie-category-checkbox
					$html .= '</div>'; // .wpconsent-preferences-accordion-header

					$html .= '<div class="wpconsent-preferences-accordion-content" part="wpconsent-accordion-content">';
					if ( ! empty( $service['description'] ) ) {
						$html .= '<p class="wpconsent-service-description" tabindex="0">' . wp_kses_post( $service['description'] ) . '</p>';
					}
					// Add service URL to description if it exists.
					if ( ! empty( $service['service_url'] ) ) {
						$service_url_label = wpconsent()->settings->get_option( 'cookie_table_header_service_url', wpconsent()->strings->get_string( 'cookie_table_header_service_url' ) );

						$html .= '<p tabindex="0" class="wpconsent-service-url">' . sprintf(
							/* translators: %1$s: Service URL label, %2$s: Service URL */
							esc_html__( '%1$s: %2$s', 'wpconsent-cookies-banner-privacy-suite' ),
							esc_html( $service_url_label ),
							'<a href="' . esc_url( $service['service_url'] ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( wp_parse_url( $service['service_url'], PHP_URL_HOST ) ) . '<span class="screen-reader-text"> ' . esc_html__( '(opens in a new window)', 'wpconsent-cookies-banner-privacy-suite' ) . '</span></a>'
						) . '</p>';
					}
					$html .= $this->get_cookies_table_by_category( $service['cookies'] );
					$html .= '</div>'; // .wpconsent-preferences-accordion-content
					$html .= '</div>'; // .wpconsent-cookie-service
				}
			}
		}

		return $html;
	}

	/**
	 * Generate the cookies table for a category
	 *
	 * @param array $cookies The cookies to display.
	 *
	 * @return string
	 */
	private function get_cookies_table_by_category( $cookies ) {
		if ( empty( $cookies ) ) {
			return '';
		}

		$html = '<div class="wpconsent-preferences-cookies-list" part="wpconsent-cookies-list">';

		$html .= '<div class="wpconsent-preferences-list-header" part="wpconsent-cookies-list-header">';
		$html .= '<div class="cookie-name">' . esc_html( wpconsent()->settings->get_option( 'cookie_table_header_name', wpconsent()->strings->get_string( 'cookie_table_header_name' ) ) ) . '</div>';
		$html .= '<div class="cookie-desc">' . esc_html( wpconsent()->settings->get_option( 'cookie_table_header_description', wpconsent()->strings->get_string( 'cookie_table_header_description' ) ) ) . '</div>';
		$html .= '<div class="cookie-duration">' . esc_html( wpconsent()->settings->get_option( 'cookie_table_header_duration', wpconsent()->strings->get_string( 'cookie_table_header_duration' ) ) ) . '</div>';
		$html .= '</div>'; // .wpconsent-preferences-list-header

		foreach ( $cookies as $cookie ) {
			$html .= '<div class="wpconsent-preferences-list-item" data-cookie-id="' . esc_attr( $cookie['id'] ) . '" part="wpconsent-cookies-list-item">';
			$html .= '<div class="cookie-name">' . esc_html( $cookie['name'] ) . '</div>';
			$html .= '<div class="cookie-desc">' . wp_kses_post( $cookie['description'] ) . '</div>';
			$html .= '<div class="cookie-duration">' . esc_html( ! empty( $cookie['duration'] ) ? $cookie['duration'] : '-' ) . '</div>';
			$html .= '</div>'; // .wpconsent-preferences-list-item
		}

		$html .= '</div>'; // .wpconsent-preferences-cookies-list

		return $html;
	}

	/**
	 * Output the powered by WPConsent logo.
	 *
	 * @return string
	 */
	public function powered_by() {
		if ( wpconsent()->settings->get_option( 'hide_powered_by' ) ) {
			return '';
		}
		$url    = wpconsent_utm_url( 'https://wpconsent.com/powered-by/', 'poweredby' );
		$html   = '<div class="wpconsent-powered-by">';
		$colors = $this->get_color_settings();

		$html .= '<a style="color: ' . esc_attr( $colors['text'] ) . '" href="' . esc_url( $url ) . '" target="_blank" rel="nofollow noopener noreferrer">';
		$html .= sprintf(
		/* translators: %1$s and %2$s add a tag used for hiding the text on small screens and %3$s is the WPConsent logo svg */
			esc_html__( '%1$sPowered by%2$s %3$s', 'wpconsent-cookies-banner-privacy-suite' ),
			'<span class="wpconsent-powered-by-text">',
			'</span>',
			wpconsent_get_icon( 'logo-mono', 80, 12, '0 0 57 9', $colors['text'] )
		);
		$html .= '<span class="screen-reader-text"> ' . esc_html__( '(opens in a new window)', 'wpconsent-cookies-banner-privacy-suite' ) . '</span>';
		$html .= '</a>';
		$html .= '</div>'; // .wpconsent-powered-by

		return $html;
	}

	/**
	 * Output the floating consent button.
	 *
	 * @return void
	 */
	public function floating_consent_button() {
		if ( is_admin() ) {
			return;
		}
		$colors = $this->get_color_settings();
		$style  = 'background-color: ' . esc_attr( $colors['background'] ) . '; color: ' . esc_attr( $colors['text'] ) . ';';
		echo '<button id="wpconsent-consent-floating" class="wpconsent-consent-floating-button" part="wpconsent-settings-button" style="' . esc_attr( $style ) . '" aria-label="' . esc_attr__( 'Cookie Preferences', 'wpconsent-cookies-banner-privacy-suite' ) . '">';

		$icon_value = wpconsent()->settings->get_option( 'consent_floating_icon', 'preferences' );

		if ( filter_var( $icon_value, FILTER_VALIDATE_URL ) ) {
			echo '<img src="' . esc_url( $icon_value ) . '" alt="' . esc_attr__( 'Cookie Settings', 'wpconsent-cookies-banner-privacy-suite' ) . '">';
		} else {
			echo wp_kses(
				apply_filters(
					'wpconsent_preferences_icon',
					wpconsent_get_icon( $icon_value, 24, 24, '0 -960 960 960', $colors['text'] )
				),
				wpconsent_get_icon_allowed_tags()
			);
		}

		echo '</button>';
	}

	/**
	 * Replace smart tags for the cookie policy text.
	 *
	 * @param string $text The text to replace smart tags in.
	 * @param string $locale The locale to use for the replacement.
	 *
	 * @return string
	 */
	public function maybe_replace_smart_tags( $text, $locale = '' ) {
		$cookie_policy_page_id  = apply_filters( 'wpconsent_get_cookie_policy_id', wpconsent()->settings->get_option( 'cookie_policy_page', 0 ), $locale );
		$privacy_policy_page_id = apply_filters( 'wpconsent_get_privacy_policy_id', get_option( 'wp_page_for_privacy_policy' ), $locale );

		// Get the URLs and titles.
		$cookie_policy_page_url    = $cookie_policy_page_id ? get_permalink( $cookie_policy_page_id ) : '';
		$cookie_policy_page_title  = $cookie_policy_page_id ? get_the_title( $cookie_policy_page_id ) : '';
		$privacy_policy_url        = $privacy_policy_page_id ? get_permalink( $privacy_policy_page_id ) : '';
		$privacy_policy_page_title = $privacy_policy_page_id ? get_the_title( $privacy_policy_page_id ) : '';

		// Replace {cookie_policy} with a link to the cookie policy where the text of the link is the page title.
		if ( $cookie_policy_page_url && $cookie_policy_page_title ) {
			$text = str_replace( '{cookie_policy}', '<a href="' . esc_url( $cookie_policy_page_url ) . '">' . esc_html( $cookie_policy_page_title ) . '</a>', $text );
		} else {
			$text = str_replace( '{cookie_policy}', '', $text );
		}

		// Replace {privacy_policy} with a link to the privacy policy where the text of the link is the page title.
		if ( $privacy_policy_url && $privacy_policy_page_title ) {
			$text = str_replace( '{privacy_policy}', '<a href="' . esc_url( $privacy_policy_url ) . '">' . esc_html( $privacy_policy_page_title ) . '</a>', $text );
		} else {
			// If there is no privacy policy page, remove the {privacy_policy} tag.
			$text = str_replace( '{privacy_policy}', '', $text );
		}

		return $text;
	}
}
