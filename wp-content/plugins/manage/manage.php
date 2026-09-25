<?php
/**
 * Plugin Name: Manage
 * Description: Manage multiple WordPress websites from one place using your Elementor account. Safe updates, monitoring, and bulk actions powered by Elementor.
 * Plugin URI: https://elementor.com/
 * Version: 1.0.9
 * Author: Elementor.com
 * Author URI: http://go.elementor.com/author-uri-manage/
 * License: GPL-3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.en.html
 * Text Domain: manage
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

define( 'MANAGE_VERSION', '1.0.9' );
define( 'MANAGE_PLUGIN_BASE', plugin_basename( __FILE__ ) );
define( 'MANAGE_PATH', plugin_dir_path( __FILE__ ) );
define( 'MANAGE_URL', plugins_url( '/', __FILE__ ) );
define( 'MANAGE_ASSETS_PATH', MANAGE_PATH . 'assets/' );
define( 'MANAGE_ASSETS_URL', MANAGE_URL . 'assets/' );
define( 'MANAGE_CLIENT_APP_URL', MANAGE_ASSETS_URL . 'build/manage.js' );

final class Manage {

	public function __construct() {
		// Load Composer autoloader
		require_once MANAGE_PATH . 'vendor/autoload.php';

		add_action( 'plugins_loaded', [ $this, 'init' ] );
	}

	public function init() {
		// Once we get here, We have passed all validation checks, so we can safely include our plugin
		require_once 'plugin.php';
	}
}

new Manage();
