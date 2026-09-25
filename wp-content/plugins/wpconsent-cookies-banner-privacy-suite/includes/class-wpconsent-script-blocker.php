<?php
/**
 * Class used to manage script blocking based on cookie categories.
 *
 * @package WPConsent
 */

/**
 * Class WPConsent_Script_Blocker.
 */
class WPConsent_Script_Blocker {

	/**
	 * The URL to fetch the known scripts data from.
	 *
	 * @var string
	 */
	private $api_url = 'https://plugin.wpconsent.com/wp-content/script-blocking-data.json';

	/**
	 * Known scripts categorized by cookie type.
	 *
	 * @var array
	 */
	protected $categorized_scripts = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		// Empty constructor for inheritance.
	}

	/**
	 * Get scripts for a specific category.
	 *
	 * @param string $category The category to get scripts for.
	 *
	 * @return array
	 */
	public function get_scripts_for_category( $category ) {
		return isset( $this->categorized_scripts[ $category ] ) ? $this->categorized_scripts[ $category ] : array();
	}

	/**
	 * Get the data from our server.
	 *
	 * @return array
	 */
	public function get_data_remotely() {
		$request = wp_remote_get( $this->api_url );

		if ( is_wp_error( $request ) ) {
			return array();
		}

		$body = wp_remote_retrieve_body( $request );

		if ( empty( $body ) ) {
			return array();
		}

		$data = json_decode( $body, true );

		if ( empty( $data ) ) {
			return array();
		}

		return $data;
	}

	/**
	 * Load the known scripts data.
	 */
	public function load_data() {
		$script_data_cache = wpconsent()->file_cache->get( 'script-blocking-data', DAY_IN_SECONDS, true );

		if ( ! empty( $script_data_cache['expired'] ) || empty( $script_data_cache['data'] ) ) {
			$script_data = $this->get_data_remotely();
			if ( ! empty( $script_data ) ) {
				wpconsent()->file_cache->set( 'script-blocking-data', $script_data );
			} else {
				$script_data = $script_data_cache['data'];
			}
		} else {
			$script_data = $script_data_cache['data'];
		}

		$this->categorized_scripts = $script_data;
	}

	/**
	 * Get all known scripts.
	 *
	 * @return array
	 */
	public function get_all_scripts() {
		if ( empty( $this->categorized_scripts ) ) {
			$this->load_data();
		}

		return apply_filters( 'wpconsent_blocked_scripts', $this->categorized_scripts );
	}

	/**
	 * Get a list of services for which we can block content. These are all the services that have an "iframes" or
	 * "blocked_elements" key in the categorized scripts.
	 *
	 * @return array
	 */
	public function get_content_blocking_providers() {
		$categorized_scripts = $this->get_all_scripts();

		$providers = array();

		foreach ( $categorized_scripts as $category => $scripts ) {
			foreach ( $scripts as $script_id => $data ) {
				if ( ! empty( $data['iframes'] ) || ! empty( $data['blocked_elements'] ) ) {
					$providers[ $script_id ] = $data['label'];
				}
			}
		}

		return $providers;
	}
}
