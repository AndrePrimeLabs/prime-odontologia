<?php
/**
 * Register-site API client. Fetches site_token from the API and stores it.
 *
 * @package InstagramFeed\UsageTracking\Core
 * @since 6.10
 */

namespace InstagramFeed\UsageTracking\Core;

use InstagramFeed\UsageTracking\Config;
use InstagramFeed\UsageTracking\ReporterInterface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RegisterSite {

	/**
	 * Register the site with the API and store the returned site_token.
	 *
	 * @param ReporterInterface $reporter Plugin reporter (for slug/version).
	 * @return string|null Site token on success, null on failure.
	 */
	public function register( ReporterInterface $reporter ) {
		$existing = get_option( Config::OPTION_SITE_TOKEN, '' );
		if ( '' !== $existing && is_string( $existing ) ) {
			return $existing;
		}

		$url  = Config::get_register_site_url();
		$body = array(
			'site_url'       => home_url(),
			'plugin_slug'    => $reporter->get_plugin_slug(),
			'plugin_version' => defined( 'SBIVER' ) ? SBIVER : '',
		);

		$response = wp_remote_post(
            $url,
            array(
				'method'      => 'POST',
				'timeout'     => 15,
				'redirection' => 5,
				'headers'     => array(
					'Content-Type' => 'application/json',
				),
				'body'        => wp_json_encode( $body ),
            )
        );

		if ( is_wp_error( $response ) ) {
			return null;
		}

		$code = wp_remote_retrieve_response_code( $response );
		if ( $code < 200 || $code >= 300 ) {
			return null;
		}

		$body_raw = wp_remote_retrieve_body( $response );
		$data     = json_decode( $body_raw, true );
		if ( ! is_array( $data ) ) {
			return null;
		}

		$token = isset( $data['site_token'] ) ? $data['site_token'] : (isset( $data['token'] ) ? $data['token'] : null);
		if ( null === $token || '' === $token || ! is_string( $token ) ) {
			return null;
		}

		$token = sanitize_text_field( $token );
		update_option( Config::OPTION_SITE_TOKEN, $token, false );
		return $token;
	}
}
