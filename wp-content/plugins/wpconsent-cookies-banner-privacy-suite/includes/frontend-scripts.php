<?php
/**
 * Load scripts for the frontend.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'wp_enqueue_scripts', 'wpconsent_frontend_scripts' );
add_action( 'wp_head', 'wpconsent_google_consent_script', 5 );

/**
 * Load frontend scripts here.
 *
 * @return void
 */
function wpconsent_frontend_scripts() {

	$frontend_asset_file = WPCONSENT_PLUGIN_PATH . 'build/frontend.asset.php';

	if ( ! file_exists( $frontend_asset_file ) ) {
		return;
	}

	$asset = require $frontend_asset_file;

	// Let's not load anything on the frontend if the banner is disabled.
	if ( ! wpconsent()->banner->is_enabled() ) {
		return;
	}

	// Respect the same filter that gates banner HTML output, so compat shims
	// (EDD receipt page, Avada/Bricks/Divi builder previews) suppress the script too.
	if ( ! apply_filters( 'wpconsent_banner_output', true ) ) {
		return;
	}

	$default_allow          = boolval( wpconsent()->settings->get_option( 'default_allow', 0 ) );
	$manual_toggle_services = boolval( wpconsent()->settings->get_option( 'manual_toggle_services', 0 ) );
	$slugs                  = $manual_toggle_services ? wpconsent()->cookies->get_preference_slugs() : array(
		'essential',
		'statistics',
		'marketing',
	);

	wp_enqueue_script( 'wpconsent-frontend-js', WPCONSENT_PLUGIN_URL . 'build/frontend.js', $asset['dependencies'], $asset['version'], true );

	// Determine the correct CSS file based on RTL.
	$css_file = is_rtl() ? 'frontend-rtl.css' : 'frontend.css';

	wp_localize_script(
		'wpconsent-frontend-js',
		'wpconsent',
		apply_filters(
			'wpconsent_frontend_js_data',
			array(
				'consent_duration'           => wpconsent()->settings->get_option( 'consent_duration', 30 ),
				'css_url'                    => WPCONSENT_PLUGIN_URL . 'build/' . $css_file,
				'css_version'                => $asset['version'],
				'default_allow'              => $default_allow,
				'consent_type'               => $default_allow ? 'optout' : 'optin',
				'manual_toggle_services'     => $manual_toggle_services,
				'slugs'                      => $slugs,
				'enable_consent_banner'      => wpconsent()->settings->get_option( 'enable_consent_banner', 1 ),
				'enable_script_blocking'     => wpconsent()->settings->get_option( 'enable_script_blocking', 1 ),
				'enable_content_blocking'    => wpconsent()->settings->get_option( 'enable_content_blocking', 0 ),
				'enable_consent_floating'    => boolval( wpconsent()->settings->get_option( 'enable_consent_floating', 0 ) ),
				'enable_shared_consent'      => boolval( wpconsent()->settings->get_option( 'enable_shared_consent', 0 ) ),
				'cookie_domain'              => wpconsent()->settings->get_option( 'cookie_domain', '' ),
				'accept_button_enabled'      => boolval( wpconsent()->settings->get_option( 'accept_button_enabled', 1 ) ),
				'cancel_button_enabled'      => boolval( wpconsent()->settings->get_option( 'cancel_button_enabled', 1 ) ),
				'preferences_button_enabled' => boolval( wpconsent()->settings->get_option( 'preferences_button_enabled', 1 ) ),
				'respect_gpc'                => boolval( wpconsent()->settings->get_option( 'respect_gpc', 0 ) ),
				'gpc_toast_message'          => wpconsent()->settings->get_option( 'gpc_toast_message', wpconsent()->strings->get_string( 'gpc_toast_message' ) ),
				'gpc_toast_duration'         => apply_filters( 'wpconsent_gpc_toast_duration', 10000 ),
				'gpc_toast_enabled'          => apply_filters( 'wpconsent_gpc_toast_enabled', true ),
			)
		)
	);
}

/**
 * Outputs the Google consent script for managing user preferences on Google-related services.
 *
 * This function does not execute if the banner display is disabled or if no Google services are enabled
 * in the cookie data. It ensures the Google consent script is loaded early enough for it to take effect correctly.
 *
 * @return void
 */
function wpconsent_google_consent_script() {
	// If the banner display is disabled don't load this.
	if ( ! wpconsent()->banner->is_enabled() ) {
		return;
	}

	// Let's load this only if they are using one of the Google services in the cookie data.
	if ( ! wpconsent()->cookies->needs_google_consent() ) {
		return;
	}

	$default_allow      = intval( wpconsent()->settings->get_option( 'default_allow', 0 ) );
	$default_state      = $default_allow ? 'granted' : 'denied';
	$url_passthrough    = (bool) wpconsent()->settings->get_option( 'gcm_url_passthrough', 0 );
	$ads_data_redaction = (bool) wpconsent()->settings->get_option( 'gcm_ads_data_redaction', 0 );

	$extra_gtag = '';
	if ( $url_passthrough ) {
		$extra_gtag .= "\n\t\t\tgtag('set', 'url_passthrough', true);\n";
	}
	if ( $ads_data_redaction ) {
		$extra_gtag .= "\n\t\t\tgtag('set', 'ads_data_redaction', true);\n";
	}

	// We need to load the Google consent script earlier than other tracking scripts for it to take effect correctly.
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	echo "<script data-cfasync=\"false\" data-wpfc-render=\"false\">
		(function () {
			window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}

			// Set the developer ID.
			gtag('set', 'developer_id.dMmRkYz', true);{$extra_gtag}
			// Set default consent state based on plugin settings.
			gtag('consent', 'default', {
				'ad_storage': '{$default_state}',
				'analytics_storage': '{$default_state}',
				'ad_user_data': '{$default_state}',
				'ad_personalization': '{$default_state}',
				'personalization_storage': '{$default_state}',
				'security_storage': 'granted',
				'functionality_storage': 'granted',
				'wait_for_update': 500,
			});
		})();
	</script>"; // phpcs:ignore
}
