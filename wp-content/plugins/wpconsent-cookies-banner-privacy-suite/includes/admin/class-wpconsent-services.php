<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class used to load data on cookie services.
 *
 * @package WPConsent
 */
class WPConsent_Services {

	/**
	 * The base URL used for remote requests.
	 *
	 * @var string
	 */
	protected $baseurl = 'https://cookies.wpconsent.com/api/v1/';

	/**
	 * The services.
	 *
	 * @var array
	 */
	protected $services = array();

	/**
	 * The instance of the class.
	 *
	 * @var WPConsent_Services
	 */
	private static $instance;

	/**
	 * Returns the instance of the class.
	 *
	 * @return WPConsent_Services
	 */
	public static function get_instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new WPConsent_Services();
		}

		return self::$instance;
	}

	/**
	 * Loads the services.
	 *
	 * @param array $services_needed The services needed.
	 *
	 * @return void
	 */
	protected function load_services( $services_needed = array() ) {
		if ( empty( $services_needed ) ) {
			$this->services = array();
		}

		// Let's load the services we have in the local storage first.
		$services = wpconsent()->file_cache->get( 'services', DAY_IN_SECONDS );

		// Let's check if we are missing any services from the services needed.
		if ( ! $services || array_diff( $services_needed, array_keys( $services ) ) ) {
			$services = $this->fetch_services( $services_needed );

			if ( ! empty( $services ) ) {
				wpconsent()->file_cache->set( 'services', $services );
			}
		}

		$this->services = $services;
	}

	/**
	 * Fetches the services.
	 *
	 * @param array $services_needed The services needed.
	 *
	 * @return array
	 */
	protected function fetch_services( $services_needed ) {
		$response = wp_remote_post(
			$this->get_api_url(),
			array(
				'body'    => wp_json_encode( array( 'services' => $services_needed ) ),
				'headers' => array(
					'Content-Type'        => 'application/json',
					'X-WPConsent-Version' => wpconsent()->version,
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return array();
		}

		$body = wp_remote_retrieve_body( $response );

		if ( empty( $body ) ) {
			return array();
		}

		$services = json_decode( $body, true );

		if ( empty( $services ) ) {
			return array();
		}

		return $services;
	}

	/**
	 * Returns the API URL.
	 *
	 * @param string $path The path to append to the base URL.
	 *
	 * @return string
	 */
	public function get_api_url( $path = 'services' ) {
		return $this->baseurl . $path;
	}

	/**
	 * Returns the services.
	 *
	 * @param array $services_needed The services needed.
	 *
	 * @return array
	 */
	public function get_services( $services_needed = array() ) {
		if ( empty( $this->services ) ) {
			$this->load_services( $services_needed );
		}

		return $this->services;
	}
}
