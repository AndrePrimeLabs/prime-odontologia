<?php

namespace Manage\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Utils {

	public static function user_is_admin(): bool {
		return current_user_can( 'manage_options' );
	}

	public static function is_wp_dashboard_page(): bool {
		$current_screen = get_current_screen();

		return str_contains( $current_screen->id, 'dashboard' );
	}

	public static function is_wp_settings_page(): bool {
		$current_screen = get_current_screen();

		return str_contains( $current_screen->id, 'options-' );
	}
}
