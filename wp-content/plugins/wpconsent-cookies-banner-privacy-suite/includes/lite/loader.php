<?php
/**
 * File used for importing lite-only files.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( is_admin() || defined( 'DOING_CRON' ) && DOING_CRON ) {
	// Lite-specific admin page loader.
	require_once WPCONSENT_PLUGIN_PATH . 'includes/lite/admin/class-wpconsent-admin-page-loader-lite.php';

	// Lite-specific admin notices.
	require_once WPCONSENT_PLUGIN_PATH . 'includes/lite/admin/notices.php';

	// Connect to upgrade.
	require_once WPCONSENT_PLUGIN_PATH . 'includes/lite/admin/class-wpconsent-connect.php';

	// Language picker trait.
	require_once WPCONSENT_PLUGIN_PATH . 'includes/lite/admin/pages/trait-wpconsent-language-picker.php';

	// Review request.
	require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/class-wpconsent-review.php';

	// Usage tracking class abstract.
	require_once WPCONSENT_PLUGIN_PATH . 'includes/admin/class-wpconsent-usage-tracking.php';

	// Usage tracking class lite.
	require_once WPCONSENT_PLUGIN_PATH . 'includes/lite/admin/class-wpconsent-usage-tracking-lite.php';
}
