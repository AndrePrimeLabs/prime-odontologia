<?php
/**
 * Plugin Name: Easy Site Editor
 * Description: Split-pane AI site editor with chat on the left and a live frontend preview on the right.
 * Version: 0.1.0
 * Author: Automattic
 * Requires at least: 6.6
 * Requires PHP: 7.4
 * Text Domain: easy-site-editor
 * Domain Path: /languages
 *
 * @package EasySiteEditor
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'EASY_SITE_EDITOR_DIR' ) ) {
	define( 'EASY_SITE_EDITOR_DIR', plugin_dir_path( __FILE__ ) );
}

if ( ! defined( 'EASY_SITE_EDITOR_FILE' ) ) {
	define( 'EASY_SITE_EDITOR_FILE', __FILE__ );
}

if ( ! defined( 'EASY_SITE_EDITOR_URL' ) ) {
	define( 'EASY_SITE_EDITOR_URL', plugin_dir_url( __FILE__ ) );
}

if ( ! defined( 'EASY_SITE_EDITOR_VERSION' ) ) {
	define( 'EASY_SITE_EDITOR_VERSION', '0.1.0' );
}

require_once EASY_SITE_EDITOR_DIR . 'includes/class-easy-site-editor.php';

Easy_Site_Editor::get_instance();
