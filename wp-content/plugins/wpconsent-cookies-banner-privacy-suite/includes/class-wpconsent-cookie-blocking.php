<?php
/**
 * Class used to handle cookie blocking functionality.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Cookie_Blocking.
 */
class WPConsent_Cookie_Blocking {

	/**
	 * Script blocker instance.
	 *
	 * @var WPConsent_Script_Blocker
	 */
	public $script_blocker;

	/**
	 * Iframe placeholder instance.
	 *
	 * @var WPConsent_Content_Placeholder
	 */
	public $content_placeholder;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->script_blocker      = wpconsent()->script_blocker;
		$this->content_placeholder = new WPConsent_Content_Placeholder();
		$this->hooks();
	}

	/**
	 * Register hooks.
	 */
	public function hooks() {
		add_action( 'template_redirect', array( $this, 'maybe_buffer_start' ) );
		add_action( 'shutdown', array( $this, 'buffer_end' ) );
		add_filter( 'wpconsent_skip_script_blocking', array( $this, 'maybe_skip_own_scripts' ), 1, 5 );
		add_filter( 'wpconsent_skip_script_blocking', array( $this, 'maybe_skip_for_google_consent' ), 10, 5 );
		add_filter( 'wpconsent_skip_script_blocking', array( $this, 'maybe_skip_for_clarity_consent' ), 10, 5 );
		add_filter( 'wpconsent_skip_script_blocking', array( $this, 'maybe_skip_for_wp_consent_api' ), 10, 5 );
	}

	/**
	 * Start output buffering.
	 */
	public function maybe_buffer_start() {
		if ( ! $this->should_process() ) {
			return;
		}
		ob_start( array( $this, 'process_output' ) );
	}

	/**
	 * End output buffering and flush.
	 */
	public function buffer_end() {
		if ( ob_get_length() ) {
			ob_end_flush();
		}
	}

	/**
	 * Process the page output and modify script tags.
	 *
	 * @param string $buffer The page output.
	 *
	 * @return string Modified page output.
	 */
	public function process_output( $buffer ) {
		// Check content type at output time since headers may have changed after buffer started.
		if ( ! $this->is_html_response( $buffer ) ) {
			return $buffer;
		}

		$scripts_by_category = $this->find_scripts_by_category( $buffer );

		foreach ( $scripts_by_category['scripts'] as $category => $scripts ) {
			foreach ( $scripts as $script_data ) {
				$this->modify_script_tag( $script_data['script'], $script_data['name'], $category );

				// Add placeholders for blocked elements.
				if ( ! empty( $script_data['blocked_elements'] ) ) {
					foreach ( $script_data['blocked_elements'] as $selector ) {
						$this->add_blocked_element_placeholder( $scripts_by_category['html'], $selector, $script_data['name'], $category );
					}
				}
			}
		}
		foreach ( $scripts_by_category['iframes'] as $category => $iframes ) {
			foreach ( $iframes as $iframe ) {
				$this->modify_iframe_tag( $iframe['iframe'], $iframe['name'], $category );
			}
		}
		if ( empty( $scripts_by_category['html'] ) ) {
			return $buffer;
		}

		return $scripts_by_category['html']->save();
	}

	/**
	 * Find scripts by category.
	 *
	 * @param string $html The HTML content.
	 *
	 * @return array
	 */
	public function find_scripts_by_category( $html ) {
		$html = wpconsent_get_simplehtmldom( $html );

		if ( ! $html ) {
			return array(
				'html'     => '',
				'scripts'  => array(),
				'services' => array(),
				'iframes'  => array(),
			);
		}
		$services_used       = array();
		$scripts             = $html->find( 'script' );
		$scripts_by_category = array();
		$all_known_scripts   = $this->script_blocker->get_all_scripts();
		$block_content       = wpconsent()->settings->get_option( 'enable_content_blocking' );
		$content_to_block    = wpconsent()->settings->get_option( 'content_blocking_services', array() );

		foreach ( $scripts as $script ) {
			$src     = $script->src;
			$content = $script->innertext;

			foreach ( $all_known_scripts as $category => $services ) {
				foreach ( $services as $service_key => $service ) {
					if ( empty( $service['scripts'] ) ) {
						continue;
					}
					// Run this check only for scripts that have blocked_elements.
					if ( ! empty( $service['blocked_elements'] ) && 1 !== absint( $block_content ) ) {
						continue;
					}
					// Ignore this service if it shouldn't be blocked according to settings.
					if ( ! empty( $service['blocked_elements'] ) && ! empty( $content_to_block ) && ! in_array( $service_key, $content_to_block, true ) ) {
						continue;
					}

					foreach ( $service['scripts'] as $pattern ) {
						if ( ( ! empty( $src ) && strpos( $src, $pattern ) !== false ) || ( ! empty( $content ) && strpos( $content, $pattern ) !== false ) ) {
							$scripts_by_category[ $category ][] = array(
								'script'           => $script,
								'name'             => $service_key,
								'blocked_elements' => ! empty( $service['blocked_elements'] ) ? $service['blocked_elements'] : array(),
							);

							$services_used[] = $service_key;

							break;
						}
					}
				}
			}
		}

		$iframes             = $html->find( 'iframe' );
		$iframes_by_category = array();
		if ( 1 === absint( $block_content ) ) {
			foreach ( $iframes as $iframe ) {
				$src = $iframe->src;
				foreach ( $all_known_scripts as $category => $services ) {
					foreach ( $services as $service_key => $service ) {
						if ( empty( $service['iframes'] ) ) {
							continue;
						}
						if ( ! empty( $content_to_block ) && ! in_array( $service_key, $content_to_block, true ) ) {
							continue;
						}
						foreach ( $service['iframes'] as $pattern ) {
							if ( strpos( $src, $pattern ) !== false ) {
								$iframes_by_category[ $category ][] = array(
									'iframe' => $iframe,
									'name'   => $service_key,
								);
								break;
							}
						}
					}
				}
			}
		}

		return array(
			'html'     => $html,
			'scripts'  => $scripts_by_category,
			'services' => $services_used,
			'iframes'  => $iframes_by_category,
		);
	}

	/**
	 * Check if we should process the output.
	 *
	 * @return bool
	 */
	private function should_process() {
		if ( is_admin() || is_feed() ) {
			return false;
		}
		if ( wp_doing_ajax() ) {
			return false;
		}
		// Don't load this for REST API requests.
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return false;
		}
		// Don't load if our debug parameter is set.
		if ( isset( $_GET['wpconsent_debug'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return false;
		}

		// Check the current header content type.
		$headers_list = headers_list();
		if ( ! empty( $headers_list ) ) {
			foreach ( $headers_list as $header ) {
				if ( 0 === strpos( $header, 'Content-Type:' ) ) {
					$content_type = $header;
					break;
				}
			}
			if ( ! empty( $content_type ) ) {
				// If the content type is JSON, let's skip it.
				if ( false !== strpos( $content_type, 'application/json' ) ) {
					return false;
				}
				if ( false === strpos( $content_type, 'text/html' ) ) {
					// Don't run if the content type is not HTML.
					return false;
				}
			}
		}

		// Finally, don't load if the setting is disabled.
		$setting = absint( wpconsent()->settings->get_option( 'enable_script_blocking', 0 ) ) === 1;

		// Filter to easily prevent script blocking.
		return apply_filters( 'wpconsent_should_block_scripts', $setting );
	}

	/**
	 * Check if the response is HTML content that should be processed.
	 *
	 * This method performs runtime checks on the buffer content and headers
	 * to determine if we should process it. This is needed because the initial
	 * should_process() check happens when the buffer starts, but the content
	 * type may change during the request (e.g., AJAX responses).
	 *
	 * @param string $buffer The output buffer content.
	 *
	 * @return bool Whether this appears to be HTML content.
	 */
	private function is_html_response( $buffer ) {
		// Check content type header at output time.
		$headers_list = headers_list();
		foreach ( $headers_list as $header ) {
			if ( 0 === stripos( $header, 'Content-Type:' ) ) {
				// If JSON content type, skip processing.
				if ( false !== stripos( $header, 'application/json' ) ) {
					return false;
				}
				// If explicitly HTML, we're good.
				if ( false !== stripos( $header, 'text/html' ) ) {
					return true;
				}
			}
		}

		// If no content type header, check the buffer content itself.
		$trimmed = ltrim( $buffer );

		// Skip if buffer looks like JSON (starts with { or [).
		if ( '' !== $trimmed && ( '{' === $trimmed[0] || '[' === $trimmed[0] ) ) {
			return false;
		}

		// Skip if buffer doesn't look like HTML (should start with <).
		if ( '' !== $trimmed && '<' !== $trimmed[0] ) {
			return false;
		}

		return true;
	}

	/**
	 * Get the Google Consent Mode.
	 *
	 * @return bool
	 */
	public function get_google_consent_mode() {
		return absint( wpconsent()->settings->get_option( 'google_consent_mode', true ) ) === 1;
	}

	/**
	 * Get the Clarity Consent Mode.
	 *
	 * @return bool
	 */
	public function get_clarity_consent_mode() {
		return absint( wpconsent()->settings->get_option( 'clarity_consent_mode', true ) ) === 1;
	}

	/**
	 * Skip script blocking for our own plugin scripts.
	 *
	 * Prevents the blocker from disabling WPConsent's own inline localization
	 * data when its content happens to match a known blocking pattern.
	 *
	 * @param bool   $skip     Whether to skip the script blocking.
	 * @param string $src      The script source.
	 * @param string $name     The name of the known script.
	 * @param string $category The category of the known script.
	 * @param object $script   The script DOM element.
	 *
	 * @return bool
	 */
	public function maybe_skip_own_scripts( $skip, $src, $name, $category, $script ) {
		$script_id = $script->getAttribute( 'id' );
		if ( $script_id && 0 === strpos( $script_id, 'wpconsent-' ) ) {
			return true;
		}

		return $skip;
	}

	/**
	 * Maybe skip script blocking for Google Analytics when using Google Consent Mode.
	 *
	 * @param bool   $skip Whether to skip the script blocking.
	 * @param string $src The script source.
	 * @param string $name The name of the known script.
	 * @param string $category The category of the known script.
	 * @param string $script The script element.
	 *
	 * @return bool
	 */
	public function maybe_skip_for_google_consent( $skip, $src, $name, $category, $script ) {
		$scripts_to_skip = array(
			'google-analytics',
			'google-tag-manager',
			'google-ads',
		);
		if ( in_array( $name, $scripts_to_skip, true ) && $this->get_google_consent_mode() ) {
			return true;
		}

		return $skip;
	}

	/**
	 * Maybe skip script blocking for Microsoft Clarity when using Clarity Consent Mode.
	 *
	 * @param bool   $skip Whether to skip the script blocking.
	 * @param string $src The script source.
	 * @param string $name The name of the known script.
	 * @param string $category The category of the known script.
	 * @param string $script The script element.
	 *
	 * @return bool
	 */
	public function maybe_skip_for_clarity_consent( $skip, $src, $name, $category, $script ) {
		$scripts_to_skip = array(
			'clarity',
		);
		if ( in_array( $name, $scripts_to_skip, true ) && $this->get_clarity_consent_mode() ) {
			return true;
		}

		return $skip;
	}
	/**
	 * Maybe skip script blocking for WooCommerce Sourcebuster when WP Consent API is loaded.
	 *
	 * @param bool   $skip Whether to skip the script blocking.
	 * @param string $src The script source.
	 * @param string $name The name of the known script.
	 * @param string $category The category of the known script.
	 * @param string $script The script element.
	 *
	 * @return bool
	 */
	public function maybe_skip_for_wp_consent_api( $skip, $src, $name, $category, $script ) {
		// Check if WP Consent API is loaded.
		if ( function_exists( 'wp_has_consent' ) && 'woocommerce-sourcebuster' === $name ) {
			return true;
		}

		return $skip;
	}

	/**
	 * Modify the script tag for delayed execution.
	 *
	 * @param DOMElement $script The script element.
	 * @param string     $name The name of the known script.
	 * @param string     $category The category of the known script.
	 */
	private function modify_script_tag( $script, $name, $category ) {
		$src = $script->getAttribute( 'src' );
		if ( 'essential' === $category || apply_filters( 'wpconsent_skip_script_blocking', false, $src, $name, $category, $script ) ) {
			return;
		}
		$script->setAttribute( 'type', 'text/plain' );
		$script->setAttribute( 'data-wpconsent-src', $src );
		$script->setAttribute( 'data-wpconsent-name', $name );
		$script->setAttribute( 'data-wpconsent-category', $category );
		$script->removeAttribute( 'src' );
	}

	/**
	 * Modify the iframe tag.
	 *
	 * @param DOMElement $iframe The iframe element.
	 * @param string     $name The name of the known script.
	 * @param string     $category The category of the iframe.
	 */
	private function modify_iframe_tag( $iframe, $name, $category ) {
		$src = $iframe->getAttribute( 'src' );
		if ( 'essential' === $category || apply_filters( 'wpconsent_skip_iframe_blocking', false, $src, $name, $category, $iframe ) ) {
			return;
		}
		$iframe->setAttribute( 'data-wpconsent-src', $src );
		$iframe->setAttribute( 'data-wpconsent-name', $name );
		$iframe->setAttribute( 'data-wpconsent-category', $category );
		$iframe->removeAttribute( 'src' );

		// Get the placeholder HTML from our new class.
		$placeholder_html = $this->content_placeholder->get_placeholder_html(
			$iframe->outertext,
			$name,
			$category,
			$src
		);

		// Replace the iframe with the placeholder.
		$iframe->outertext = $placeholder_html;
	}

	/**
	 * Get the placeholder button HTML for iframe consent.
	 *
	 * @param string $category The category of the iframe.
	 *
	 * @return string The HTML for the placeholder button.
	 */
	private function get_placeholder_button( $category ) {
		$button_text = sprintf(
		/* translators: %s: The category name (e.g., analytics, marketing) */
			esc_html__( 'Click here to accept %s cookies and load this content', 'wpconsent-cookies-banner-privacy-suite' ),
			esc_html( $category )
		);

		return sprintf(
			'<div class="wpconsent-iframe-overlay">
				<div class="wpconsent-iframe-overlay-content">
					<button class="wpconsent-iframe-accept-button" data-category="%s">%s</button>
				</div>
			</div>',
			esc_attr( $category ),
			$button_text
		);
	}

	/**
	 * Add placeholder for blocked elements.
	 *
	 * @param object $html The HTML document.
	 * @param string $selector The CSS selector for the blocked element.
	 * @param string $name The name of the known script.
	 * @param string $category The category of the known script.
	 */
	private function add_blocked_element_placeholder( $html, $selector, $name, $category ) {
		$elements = $html->find( $selector );

		foreach ( $elements as $element ) {
			// Get the placeholder HTML from our iframe placeholder class.
			$placeholder_html = $this->content_placeholder->get_placeholder_html(
				'',
				$name,
				$category,
				''
			);

			// Prepend the placeholder.
			$element->outertext = $placeholder_html . $element->outertext;
		}
	}
}
