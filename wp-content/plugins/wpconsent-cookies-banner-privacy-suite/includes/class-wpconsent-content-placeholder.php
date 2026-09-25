<?php
/**
 * Class used to handle iframe or external content placeholders and thumbnails.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Content_Placeholder.
 */
class WPConsent_Content_Placeholder {

	/**
	 * The uploads directory path.
	 *
	 * @var string
	 */
	private $uploads_dir;

	/**
	 * The uploads directory URL.
	 *
	 * @var string
	 */
	private $uploads_url;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$upload_dir        = wp_upload_dir();
		$this->uploads_dir = $upload_dir['basedir'] . '/wpconsent/thumbnails';
		$this->uploads_url = $upload_dir['baseurl'] . '/wpconsent/thumbnails';

		// Create the thumbnails directory if it doesn't exist.
		if ( ! file_exists( $this->uploads_dir ) ) {
			wp_mkdir_p( $this->uploads_dir );
		}

		add_action( 'wp_enqueue_scripts', array( $this, 'maybe_enqueue' ) );
	}

	public function maybe_enqueue() {
		// If enable_content_blocking is disabled, don't load these.
		if ( 1 !== absint( wpconsent()->settings->get_option( 'enable_content_blocking' ) ) ) {
			return;
		}

		$frontend_asset_file = WPCONSENT_PLUGIN_PATH . 'build/placeholders.css.asset.php';

		if ( ! file_exists( $frontend_asset_file ) ) {
			return;
		}

		$asset = require $frontend_asset_file;

		$colors        = wpconsent()->banner->get_color_settings();
		$css_variables = wpconsent()->banner->get_css_variables( $colors );

		wp_enqueue_style( 'wpconsent-placeholders-css', WPCONSENT_PLUGIN_URL . 'build/placeholders.css.css', null, $asset['version'] );
		wp_style_add_data( 'wpconsent-placeholders-css', 'rtl', 'replace' );
		wp_add_inline_style( 'wpconsent-placeholders-css', ':root{' . $css_variables . '}' );
	}

	/**
	 * Get the placeholder HTML for an iframe.
	 *
	 * @param string $iframe_html The original iframe HTML.
	 * @param string $service_name The name of the service (e.g., youtube, vimeo, recaptcha).
	 * @param string $category The consent category.
	 * @param string $src The iframe source URL.
	 *
	 * @return string The modified HTML with placeholder.
	 */
	public function get_placeholder_html( $iframe_html, $service_name, $category, $src ) {
		$thumbnail_html = $this->get_thumbnail_html( $service_name, $src );

		return sprintf(
			'<div class="wpconsent-iframe-placeholder wpconsent-iframe-placeholder-%1$s" data-wpconsent-name="%1$s" data-wpconsent-category="%2$s">%3$s%4$s%5$s</div>',
			esc_attr( $service_name ),
			esc_attr( $category ),
			$thumbnail_html,
			$this->get_placeholder_button( $category ),
			$iframe_html
		);
	}

	/**
	 * Get the thumbnail HTML based on the service.
	 *
	 * @param string $service_name The name of the service.
	 * @param string $src The iframe source URL.
	 *
	 * @return string The thumbnail HTML.
	 */
	private function get_thumbnail_html( $service_name, $src ) {
		$thumbnail_url = $this->get_local_thumbnail( $service_name, $src );

		return sprintf(
			'<div class="wpconsent-iframe-thumbnail">
				<img src="%s" alt="%s">
			</div>',
			esc_url( $thumbnail_url ),
			// translators: %s: The service name.
			esc_attr( sprintf( __( '%s placeholder image', 'wpconsent-cookies-banner-privacy-suite' ), $service_name ) )
		);
	}

	/**
	 * Get or create a local thumbnail.
	 *
	 * @param string $service The service name.
	 * @param string $url The URL to grab the thumbnail for.
	 *
	 * @return string The local thumbnail URL.
	 */
	private function get_local_thumbnail( $service, $url = '' ) {

		// If the URL is not empty the filename is $service otherwise is the base64 encoded URL.
		$filename = ! empty( $url ) ? $service . '-' . md5( $url ) . '.jpg' : $service . '.jpg';

		$filepath = $this->uploads_dir . '/' . $filename;
		$fileurl  = $this->uploads_url . '/' . $filename;

		// If the thumbnail already exists locally, return its URL.
		if ( file_exists( $filepath ) ) {
			return $fileurl;
		}

		$remote_url = 'https://cookies.wpconsent.com/api/v1/placeholders';
		$remote_url = add_query_arg(
			array(
				'service' => $service,
				'url'     => $url,
			),
			$remote_url
		);

		// Download and save the thumbnail locally.
		$response = wp_remote_get( $remote_url );
		if ( is_wp_error( $response ) ) {
			return $this->get_default_thumbnail_url();
		}

		$image_data = wp_remote_retrieve_body( $response );
		if ( empty( $image_data ) ) {
			return $this->get_default_thumbnail_url();
		}

		// Initialize the WordPress filesystem.
		global $wp_filesystem;
		if ( empty( $wp_filesystem ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			WP_Filesystem();
		}

		// Save the image locally using WP_Filesystem.
		if ( ! $wp_filesystem->put_contents( $filepath, $image_data, FS_CHMOD_FILE ) ) {
			return $this->get_default_thumbnail_url();
		}

		return $fileurl;
	}

	/**
	 * Get the default thumbnail URL.
	 *
	 * @return string The default thumbnail URL.
	 */
	private function get_default_thumbnail_url() {
		return plugins_url( 'assets/images/default-placeholder.png', WPCONSENT_FILE );
	}

	/**
	 * Get the placeholder button HTML.
	 *
	 * @param string $category The consent category.
	 *
	 * @return string The button HTML.
	 */
	private function get_placeholder_button( $category ) {

		$categories    = wpconsent()->cookies->get_categories();
		$category_name = $category;
		if ( isset( $categories[ $category ] ) ) {
			$category_name = $categories[ $category ]['name'];
		}

		$button_text = sprintf(
		/* translators: %s: The category name (e.g., analytics, marketing) */
			esc_html__( 'Click here to accept %s cookies and load this content', 'wpconsent-cookies-banner-privacy-suite' ),
			esc_html( $category_name )
		);

		// Let's use the placeholder text from the settings.
		$button_text = wpconsent()->settings->get_option( 'content_blocking_placeholder_text', $button_text );
		// Let's replace the {category} tag with the actual category name.
		$button_text = str_replace( '{category}', $category_name, $button_text );

		return sprintf(
			'<div class="wpconsent-iframe-overlay-content wpconsent-content-hidden">
				<button class="wpconsent-iframe-accept-button" data-category="%s" type="button">%s</button>
			</div>',
			esc_attr( $category ),
			esc_html( $button_text )
		);
	}
}
