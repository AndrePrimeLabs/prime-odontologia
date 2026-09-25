<?php
/**
 * Load the banner preview in a trait so we can use it only on pages where it's needed.
 *
 * @package WPConsent
 */

trait WPConsent_Banner_Preview {

	/**
	 * Get the preview version.
	 *
	 * @return string
	 */
	protected function get_preview_version() {
		return class_exists( 'WPConsent_License' ) ? '-pro' : '';
	}

	/**
	 * Add banner preview scripts.
	 *
	 * @param array $data Data to be passed to the banner preview.
	 *
	 * @return array
	 */
	public function banner_preview_scripts( $data ) {

		$banner_file = 'admin-banner-preview' . $this->get_preview_version();

		$preview_asset_file = WPCONSENT_PLUGIN_PATH . 'build/' . $banner_file . '.asset.php';

		if ( ! file_exists( $preview_asset_file ) ) {
			return $data;
		}

		$preview_asset = require $preview_asset_file;

		$data['css_url']     = WPCONSENT_PLUGIN_URL . 'build/' . $banner_file . '.css';
		$data['css_version'] = $preview_asset['version'];

		wp_enqueue_script( 'wpconsent-admin-banner-preview-js', WPCONSENT_PLUGIN_URL . 'build/' . $banner_file . '.js', $preview_asset['dependencies'], $preview_asset['version'], true );

		return $data;
	}
}
