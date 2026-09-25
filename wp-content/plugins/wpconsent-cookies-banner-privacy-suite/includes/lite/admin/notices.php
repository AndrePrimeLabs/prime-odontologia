<?php
/**
 * Lite-specific admin notices.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'wpconsent_admin_page', 'wpconsent_maybe_add_lite_top_bar_notice', 4 );
add_action( 'wpconsent_admin_page_content_wpconsent-cookies', 'wpconsent_upgrade_to_pro_notice', 250 );

/**
 * Add a notice to consider more features with offer.
 *
 * @return void
 */
function wpconsent_maybe_add_lite_top_bar_notice() {
	// Only add this to the WPConsent pages.
	if ( ! isset( $_GET['page'] ) || 0 !== strpos( $_GET['page'], 'wpconsent' ) ) {  // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPress.Security.ValidatedSanitizedInput.MissingUnslash
		return;
	}

	// Don't show on the onboarding page.
	if ( 'wpconsent-onboarding' === $_GET['page'] ) {  // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPress.Security.ValidatedSanitizedInput.MissingUnslash
		return;
	}

	$screen = get_current_screen();
	if ( isset( $screen->id ) && false !== strpos( $screen->id, 'wpconsent_page_wpconsent-' ) ) {
		$screen = str_replace( 'wpconsent_page_wpconsent-', '', $screen->id );
	} elseif ( isset( $screen->id ) && false !== strpos( $screen->id, 'toplevel_page_wpconsent' ) ) {
		$screen = 'dashboard';
	} else {
		$screen = 'dashboard';
	}

	$upgrade_url = wpconsent_utm_url(
		'https://wpconsent.com/lite/',
		'top-notice',
		$screen
	);

	WPConsent_Notice::top(
		sprintf(
		// Translators: %1$s and %2$s add a link to the upgrade page. %3$s and %4$s make the text bold.
			__( '%3$sYou\'re using WPConsent Lite%4$s. To unlock more features consider %1$supgrading to Pro%2$s.', 'wpconsent-cookies-banner-privacy-suite' ),
			'<a href="' . $upgrade_url . '" target="_blank" rel="noopener noreferrer">',
			'</a>',
			'<strong>',
			'</strong>'
		),
		array(
			'dismiss' => WPConsent_Notice::DISMISS_USER,
			'slug'    => 'consider-upgrading',
		)
	);
}

/**
 * Show a notice with more features at the bottom of the main WPConsent page.
 *
 * @return void
 */
function wpconsent_upgrade_to_pro_notice() {
	// Don't show if other notices were already displayed on the page.
	if ( ! empty( wpconsent()->notice->notices ) ) {
		return;
	}

	$html = '<h3>' . esc_html__( 'Get WPConsent Pro and Unlock all the Powerful Features', 'wpconsent-cookies-banner-privacy-suite' ) . '</h3>';
	// Subtitle similar to WPForms: short gratitude + social proof (100k+ installs).
	$html .= '<p>' . esc_html__( 'Thank you for being a loyal WPConsent Lite user. Upgrade to WPConsent Pro to automate more of your compliance checklist and focus on your business.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>';
	// Additional subheading to create more space and mirror the Pro features subheading style.
	$html .= '<h6 class="wpconsent-pro-features-subheading">' . esc_html__( 'Pro Features:', 'wpconsent-cookies-banner-privacy-suite' ) . '</h6>';
	$html .= '<div class="wpconsent-features-list">';
	$html .= '<ul>';
	$html .= '<li>' . esc_html__( 'Respect your users\' native language and increase trust by delivering legal notices they can actually read and understand.', 'wpconsent-cookies-banner-privacy-suite' ) . '</li>';
	$html .= '<li>' . esc_html__( 'Protect your business with records of consent stored on your website server. You have full control over your data', 'wpconsent-cookies-banner-privacy-suite' ) . '</li>';
	$html .= '<li>' . esc_html__( 'Show the banner and block the scripts only where needed using Geolocation rules that are easy to configure.', 'wpconsent-cookies-banner-privacy-suite' ) . '</li>';
	$html .= '</ul>';
	$html .= '<ul>';
	$html .= '<li>' . esc_html__( 'Automatic translations powered by AI make it easier than ever to set up in your local language.', 'wpconsent-cookies-banner-privacy-suite' ) . '</li>';
	$html .= '<li>' . esc_html__( 'Setting up cookie information is faster with our extended cookie library that includes popular plugins.', 'wpconsent-cookies-banner-privacy-suite' ) . '</li>';
	$html .= '<li>' . esc_html__( 'Maximize ad revenue with a IAB Europe TCF v2.3 integrations (CMP ID 482).', 'wpconsent-cookies-banner-privacy-suite' ) . '</li>';
	$html .= '</ul>';
	$html .= '</div>';
	$html .= sprintf(
		'<p><a href="%1$s" target="_blank" rel="noopener noreferrer">%2$s</a></p>',
		wpconsent_utm_url( 'https://wpconsent.com/lite/', 'dashboard', 'notice', 'get-wpconsent-pro' ),
		esc_html__( 'Get WPConsent Pro Today and Unlock all the Powerful Features »', 'wpconsent-cookies-banner-privacy-suite' )
	);
	$html .= '<p>';
	$html .= sprintf(
		// Translators: Placeholders make the text bold.
		esc_html__( '%1$sBonus:%2$s WPConsent Lite users get %3$s50%% off regular price%4$s, automatically applied at checkout', 'wpconsent-cookies-banner-privacy-suite' ),
		'<strong>',
		'</strong>',
		'<strong class="wpconsent-discount-text">',
		'</strong>'
	);
	$html .= '</p>';

	// Add our custom notice for this page.
	WPConsent_Notice::info(
		$html,
		array(
			'slug'    => 'wpconsent-dashboard-pro',
			'dismiss' => WPConsent_Notice::DISMISS_USER,
		)
	);

	// Display notice we just added so that scripts are loaded.
	if ( method_exists( wpconsent()->notice, 'display' ) ) {
		wpconsent()->notice->display();
	}
}
