<?php
/**
 * WP Consent onboarding.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_init', 'wpconsent_maybe_redirect_onboarding', 9999 );

/**
 * Redirect to the onboarding page after activation.
 *
 * @return void
 */
function wpconsent_maybe_redirect_onboarding() {
	if ( ! is_admin() ) {
		return;
	}

	if ( ! get_transient( 'wpconsent_onboarding_redirect' ) ) {
		return;
	}

	delete_transient( 'wpconsent_onboarding_redirect' );

	wp_safe_redirect( admin_url( 'admin.php?page=wpconsent-onboarding' ) );
	exit;
}
