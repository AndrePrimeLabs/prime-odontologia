<?php
/**
 * Dashboard data and AJAX handlers.
 *
 * Manages dashboard-specific AJAX endpoints and blog feed fetching.
 * Pro extends this class to add Pro-only toggleable settings.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Dashboard.
 */
class WPConsent_Dashboard {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'wp_ajax_wpconsent_toggle_setting', array( $this, 'ajax_toggle_setting' ) );
		add_action( 'wp_ajax_wpconsent_dismiss_suggestion', array( $this, 'ajax_dismiss_suggestion' ) );
	}

	/**
	 * Get the list of settings that can be toggled from the dashboard.
	 *
	 * Pro overrides this to add Pro-only settings.
	 *
	 * @return array
	 */
	protected function get_toggleable_settings() {
		return array(
			'enable_consent_banner',
			'enable_script_blocking',
			'enable_content_blocking',
			'google_consent_mode',
		);
	}

	/**
	 * Toggle a boolean setting on via AJAX from the dashboard.
	 *
	 * @return void
	 */
	public function ajax_toggle_setting() {
		check_ajax_referer( 'wpconsent_admin', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			) );
		}

		$setting = isset( $_POST['setting'] ) ? sanitize_text_field( wp_unslash( $_POST['setting'] ) ) : '';

		if ( ! in_array( $setting, $this->get_toggleable_settings(), true ) ) {
			wp_send_json_error( array(
				'message' => esc_html__( 'Invalid setting.', 'wpconsent-cookies-banner-privacy-suite' ),
			) );
		}

		wpconsent()->settings->update_option( $setting, true );

		wp_send_json_success( array(
			'setting' => $setting,
			'value'   => true,
		) );
	}

	/**
	 * Dismiss a dashboard suggestion via AJAX.
	 *
	 * @return void
	 */
	public function ajax_dismiss_suggestion() {
		check_ajax_referer( 'wpconsent_admin', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			) );
		}

		$suggestion = isset( $_POST['suggestion'] ) ? sanitize_text_field( wp_unslash( $_POST['suggestion'] ) ) : '';

		$allowed = array( 'geolocation', 'iab_tcf', 'do_not_sell' );

		if ( ! in_array( $suggestion, $allowed, true ) ) {
			wp_send_json_error( array(
				'message' => esc_html__( 'Invalid suggestion.', 'wpconsent-cookies-banner-privacy-suite' ),
			) );
		}

		$user_id   = get_current_user_id();
		$dismissed = get_user_meta( $user_id, 'wpconsent_dismissed_suggestions', true );
		if ( ! is_array( $dismissed ) ) {
			$dismissed = array();
		}

		if ( ! in_array( $suggestion, $dismissed, true ) ) {
			$dismissed[] = $suggestion;
			update_user_meta( $user_id, 'wpconsent_dismissed_suggestions', $dismissed );
		}

		wp_send_json_success();
	}

	/**
	 * Get blog articles from the WPConsent blog RSS feed.
	 *
	 * Uses the file cache system with a 24-hour TTL.
	 * Returns stale cache if the fetch fails.
	 *
	 * @return array
	 */
	public function get_blog_articles() {
		$cached = wpconsent()->file_cache->get( 'blog_announcements', DAY_IN_SECONDS, true );

		// If we have cached data (even expired), use it.
		if ( false !== $cached && ! empty( $cached['data'] ) ) {
			// If not expired, return directly.
			if ( empty( $cached['expired'] ) ) {
				return $cached['data'];
			}

			// Expired — try to refresh, fall back to stale data.
			$fresh = $this->fetch_blog_feed();
			return ! empty( $fresh ) ? $fresh : $cached['data'];
		}

		// No cache at all — fetch fresh.
		return $this->fetch_blog_feed();
	}

	/**
	 * Fetch fresh blog articles from the WPConsent RSS feed.
	 *
	 * Parses raw XML instead of using fetch_feed() because WordPress's
	 * SimplePie sanitizer strips img tags from feed content.
	 *
	 * @return array
	 */
	private function fetch_blog_feed() {
		$response = wp_remote_get( 'https://wpconsent.com/category/announcement/feed/', array( 'timeout' => 5 ) );

		if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) > 299 ) {
			return array();
		}

		$body = wp_remote_retrieve_body( $response );
		if ( empty( $body ) ) {
			return array();
		}

		$use_errors = libxml_use_internal_errors( true );
		$xml        = simplexml_load_string( $body, 'SimpleXMLElement', LIBXML_NONET | LIBXML_NOCDATA );
		libxml_use_internal_errors( $use_errors );

		if ( false === $xml || ! isset( $xml->channel->item ) ) {
			return array();
		}

		$articles = array();
		$count    = 0;

		foreach ( $xml->channel->item as $item ) {
			if ( $count >= 3 ) {
				break;
			}

			$articles[] = array(
				'title' => wp_strip_all_tags( (string) $item->title ),
				'link'  => (string) $item->link,
			);

			$count++;
		}

		wpconsent()->file_cache->set( 'blog_announcements', $articles );

		return $articles;
	}
}
