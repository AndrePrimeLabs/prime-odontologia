<?php
/**
 * WPConsent compatibility with WP Consent API.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'wp_get_consent_type', 'wpconsent_wp_consent_api_consent_type' );

/**
 * Report WPConsent's consent type to WP Consent API's server-side check.
 *
 * Ensures WP Consent API's `wp_get_consent_type()` returns the same value the
 * banner computes from the `default_allow` setting, so server-side consent
 * checks agree with the banner.
 *
 * @param string $consent_type The incoming consent type.
 *
 * @return string
 */
function wpconsent_wp_consent_api_consent_type( $consent_type = '' ) {
	// Components are null until `plugins_loaded` priority 10; the loader includes this file at priority 3 and WP Consent API defines the functions at priority 9, so an early caller would otherwise fatal with "Call to a member function on null".
	if ( ! isset( wpconsent()->banner ) || ! isset( wpconsent()->settings ) ) {
		return $consent_type;
	}

	// WPConsent does not claim consent management when the banner is off.
	if ( ! wpconsent()->banner->is_enabled() ) {
		return $consent_type;
	}

	// Read via `get_option()` so the `wpconsent_get_option_default_allow` filter (Pro geolocation / IAB TCF overrides) is applied.
	$default_allow = boolval( wpconsent()->settings->get_option( 'default_allow', 0 ) );

	// Only `optin` and `optout` are valid WP Consent API values.
	return $default_allow ? 'optout' : 'optin';
}

add_action( 'wp_enqueue_scripts', 'wpconsent_wp_consent_api_register_cookies' );
add_filter( 'wpconsent_frontend_js_data', 'wpconsent_wp_consent_api_add_frontend_data' );

/**
 * Map a WPConsent category slug to a WP Consent API consent category.
 *
 * WP Consent API's own validator defaults unknown categories to `functional`,
 * which is the least privacy-protective bucket. WPConsent instead maps unknown
 * or custom categories to `marketing` (the most privacy-protective) so that
 * consent is required before those services run.
 *
 * @param string $wpconsent_category_slug The WPConsent category slug.
 *
 * @return string The WP Consent API category.
 */
function wpconsent_wp_consent_api_map_category( $wpconsent_category_slug ) {
	if ( 'essential' === $wpconsent_category_slug ) {
		return 'functional';
	}

	if ( 'statistics' === $wpconsent_category_slug ) {
		return 'statistics';
	}

	if ( 'marketing' === $wpconsent_category_slug ) {
		return 'marketing';
	}

	// Any custom or unknown category maps to the most privacy-protective bucket.
	return 'marketing';
}

/**
 * Build the list of WPConsent services that have cookies for WP Consent API.
 *
 * Derives its data from the banner's cached category→cookies→services structure
 * (`WPConsent_Banner::get_cached_cookies()`) so the service slugs and cookie
 * membership match the preferences modal exactly, and the expensive category
 * walk is not re-run uncached on every call. Services without any cookies are
 * skipped entirely; WP Consent API only needs services that actually set
 * cookies. The result is memoized for the duration of the request because both
 * the registration hook and the frontend-data filter call this function.
 *
 * Each category's category-direct cookies (those attached to the category term
 * itself rather than to a service) are also surfaced as a single plugin-level
 * entry with the `wpconsent` slug and `'is_service' => false`, so they are
 * registered for disclosure without being exposed as toggleable services.
 *
 * @return array List of entries as `array( 'slug', 'category', 'cookies', 'is_service' )`.
 */
function wpconsent_wp_consent_api_get_services() {
	static $services = null;

	// Return the memoized result once computed within this request.
	if ( null !== $services ) {
		return $services;
	}

	// Components are null until `plugins_loaded` priority 10; guard against early callers. Return uncached so a later call (once components exist) can still compute.
	if ( ! isset( wpconsent()->banner ) || ! isset( wpconsent()->settings ) ) {
		return array();
	}

	// WPConsent does not register cookies when the banner is off.
	if ( ! wpconsent()->banner->is_enabled() ) {
		return array();
	}

	$services = array();

	// The cache is keyed by category term id; build an id→slug map so we can map each category to a WP Consent API category.
	$categories     = wpconsent()->cookies->get_categories();
	$category_slugs = array();
	foreach ( $categories as $category_slug => $category ) {
		$category_slugs[ $category['id'] ] = $category_slug;
	}

	$cached_cookies = wpconsent()->banner->get_cached_cookies();

	foreach ( $cached_cookies as $category_id => $category_data ) {
		if ( empty( $category_data['services'] ) && empty( $category_data['cookies'] ) ) {
			continue;
		}

		// Fall back to an empty slug (mapped to `marketing`) if the category id is somehow absent from the map.
		$category_slug   = isset( $category_slugs[ $category_id ] ) ? $category_slugs[ $category_id ] : '';
		$mapped_category = wpconsent_wp_consent_api_map_category( $category_slug );

		if ( ! empty( $category_data['services'] ) ) {
			foreach ( $category_data['services'] as $service_slug => $service_data ) {
				// Skip services that have no cookies; there is nothing to register.
				if ( empty( $service_data['cookies'] ) ) {
					continue;
				}

				$service_cookies = array();
				foreach ( $service_data['cookies'] as $cookie ) {
					$service_cookies[] = array(
						'name'     => $cookie['name'],
						'duration' => $cookie['duration'],
					);
				}

				$services[] = array(
					'slug'       => $service_slug,
					'category'   => $mapped_category,
					'cookies'    => $service_cookies,
					'is_service' => true,
				);
			}
		}

		// Surface the category-direct cookies (attached to the category term, not a service) as a single plugin-level entry so they are registered for disclosure. These are governed by category-level consent, so they are not a toggleable service (`'is_service' => false`).
		if ( ! empty( $category_data['cookies'] ) ) {
			$category_cookies = array();
			foreach ( $category_data['cookies'] as $cookie ) {
				$category_cookies[] = array(
					'name'     => $cookie['name'],
					'duration' => $cookie['duration'],
				);
			}

			$services[] = array(
				'slug'       => 'wpconsent',
				'category'   => $mapped_category,
				'cookies'    => $category_cookies,
				'is_service' => false,
			);
		}
	}

	return $services;
}

/**
 * Register WPConsent services and their cookies with WP Consent API.
 *
 * Hooked on `wp_enqueue_scripts` at the default priority (10) so it runs before
 * WP Consent API's own enqueue at `PHP_INT_MAX - 100`, ensuring the service
 * info is available when WP Consent API localizes its script.
 *
 * @return void
 */
function wpconsent_wp_consent_api_register_cookies() {
	if ( ! function_exists( 'wp_add_cookie_info' ) ) {
		return;
	}

	$services = wpconsent_wp_consent_api_get_services();

	foreach ( $services as $service ) {
		foreach ( $service['cookies'] as $cookie ) {
			// The 2nd argument must be the service slug (not the display name) so it matches `wp_set_service_consent()` / `wp_has_service_consent()`.
			wp_add_cookie_info( $cookie['name'], $service['slug'], $service['category'], $cookie['duration'], '' );
		}
	}
}

/**
 * Add the WP Consent API service list to the frontend JS data.
 *
 * The banner script uses this list to record per-service consent via
 * `wp_set_service_consent()` when manual service toggles are enabled. Only the
 * slug and mapped category are exposed to keep the payload small. The
 * plugin-level category-direct entry is excluded because those cookies are
 * governed by category-level consent, not a per-service toggle.
 *
 * @param array $data The localized frontend data.
 *
 * @return array
 */
function wpconsent_wp_consent_api_add_frontend_data( $data ) {
	// WP Consent API is inactive; nothing consumes the wpca_services payload.
	if ( ! function_exists( 'wp_set_service_consent' ) ) {
		return $data;
	}

	$services      = wpconsent_wp_consent_api_get_services();
	$wpca_services = array();

	foreach ( $services as $service ) {
		// Only real, toggleable services drive `wp_set_service_consent()`; skip the plugin-level category-direct entry.
		if ( empty( $service['is_service'] ) ) {
			continue;
		}

		$wpca_services[] = array(
			'slug'     => $service['slug'],
			'category' => $service['category'],
		);
	}

	$data['wpca_services'] = $wpca_services;

	return $data;
}
