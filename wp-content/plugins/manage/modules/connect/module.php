<?php
namespace Manage\Modules\Connect;

use ElementorOne\Connect\Facade;
use Manage\Classes\Manage_Client;
use Manage\Classes\Logger;
use Manage\Classes\Module_Base;
use Manage\Classes\System_User;
use Manage\Modules\Settings\Components\Page;
use Manage\Modules\Connect\Classes\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Module_Base {

	private static bool $sync_scheduled = false;

	public function get_name(): string {
		return 'connect';
	}

	public static function is_connected(): bool {
		$facade = self::get_connect();
		$access_token = $facade->data()->get_access_token();

		return ! ! $access_token && $facade->utils()->is_valid_home_url();
	}

	public function __construct() {
		add_action( 'elementor_one/manage_connected', [ $this, 'on_connect' ] );
		add_action( 'elementor_one/manage_migration_run', [ $this, 'on_migration_run' ] );
		add_action( 'permalink_structure_changed', [ $this, 'on_permalink_structure_changed' ], 10, 0 );
		add_action( 'upgrader_process_complete', [ $this, 'on_upgrader_process_complete' ], 10, 2 );
		add_action( 'activated_plugin', [ $this, 'on_activated_plugin' ] );
		add_action( 'deactivated_plugin', [ $this, 'on_deactivated_plugin' ] );
		add_action( 'switch_theme', [ $this, 'on_switch_theme' ] );

		// Disable license check for Manage (Free version)
		add_filter( 'elementor_one/' . Config::APP_PREFIX . '_license_check_enabled', '__return_false' );

		Facade::make( [
			'app_name' => Config::APP_NAME,
			'app_prefix' => Config::APP_PREFIX,
			'app_rest_namespace' => Config::APP_REST_NAMESPACE,
			'base_url' => Config::BASE_URL,
			'admin_page' => Config::ADMIN_PAGE,
			'app_type' => Config::APP_TYPE,
			'scopes' => Config::SCOPES,
			'state_nonce' => Config::STATE_NONCE,
			'connect_mode' => Config::CONNECT_MODE,
			'plugin_slug' => Config::PLUGIN_SLUG,
		] );
	}

	public static function get_connect(): Facade {
		return Facade::get( Config::PLUGIN_SLUG );
	}

	public function on_connect() {
		$system_user = System_User::autofix_system_user();
		if ( is_wp_error( $system_user ) ) {
			Logger::error( 'Failed to autofix system user on connection: ' . esc_html( $system_user->get_error_message() ) );
		}

		$site_registered = Manage_Client::register_website();
		if ( is_wp_error( $site_registered ) ) {
			Logger::error( 'Failed to register website: ' . esc_html( $site_registered->get_error_message() ) );
		}

		$has_errors = is_wp_error( $system_user ) || is_wp_error( $site_registered );

		if ( ! $has_errors ) {
			$redirect_url = add_query_arg( [ 'ref' => 'connect' ], Page::get_manage_all_sites_url() );
			wp_redirect( $redirect_url ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
			exit;
		}
	}

	public function on_migration_run() {
		$system_user = System_User::autofix_system_user();
		if ( is_wp_error( $system_user ) ) {
			Logger::error( 'Failed to autofix system user on migration run: ' . esc_html( $system_user->get_error_message() ) );
		}

		$site_registered = Manage_Client::register_website();
		if ( is_wp_error( $site_registered ) ) {
			Logger::error( 'Failed to register website on migration run: ' . esc_html( $site_registered->get_error_message() ) );
		}
	}

	public function on_permalink_structure_changed() {
		if ( ! static::is_connected() ) {
			return;
		}

		$site_registered = Manage_Client::register_website();
		if ( is_wp_error( $site_registered ) ) {
			Logger::error( 'Failed to re-register website after permalink change: ' . esc_html( $site_registered->get_error_message() ) );
		}
	}

	/**
	 * `upgrader_process_complete` can fire multiple times within a single
	 * request — not just for manual bulk-selects (WP core coalesces those
	 * into a single firing after the whole batch), but also for WP-Cron
	 * auto-updates, which loop over plugins/themes/core one at a time and
	 * fire the hook after EACH item within the same request.
	 *
	 * Both `update` and `install` actions are synced (plugin, theme, or
	 * core) EXCEPT translation/language-pack updates or installs, which
	 * don't affect the site state we report on.
	 *
	 * The actual sync is deferred to `shutdown` (scheduled at most once,
	 * guarded by the static flag) rather than fired inline here. Since
	 * `shutdown` only runs after every line of PHP for the request has
	 * executed, this guarantees the outbound sync is triggered only after
	 * the ENTIRE batch of updates/installs has finished — not after just
	 * the first item — so the eventual async site-state fetch never races
	 * a still-in-progress update.
	 */
	public function on_upgrader_process_complete( $upgrader, $hook_extra ) {
		if ( ! isset( $hook_extra['action'] ) || ! in_array( $hook_extra['action'], [ 'update', 'install' ], true ) ) {
			return;
		}

		// Translation/language-pack updates or installs don't change site state we report on, so skip syncing for those.
		if ( isset( $hook_extra['type'] ) && 'translation' === $hook_extra['type'] ) {
			return;
		}

		$this->schedule_sync_after_site_change();
	}

	/**
	 * Activating a plugin changes the site state we report on (active
	 * plugin list), so re-sync just like an update/install. Shares the
	 * same dedup flag and shutdown deferral as `on_upgrader_process_complete()`
	 * so a bulk-activate, or an activation happening in the same request
	 * as an update/install, still only triggers a single outbound sync.
	 */
	public function on_activated_plugin() {
		$this->schedule_sync_after_site_change();
	}

	/**
	 * Deactivating a plugin changes the site state we report on (active
	 * plugin list) just as much as activating one does, so it shares the
	 * same sync mechanism for symmetry.
	 */
	public function on_deactivated_plugin() {
		$this->schedule_sync_after_site_change();
	}

	/**
	 * Switching the active theme changes the site state we report on,
	 * so re-sync using the same shared, deduped mechanism.
	 */
	public function on_switch_theme() {
		$this->schedule_sync_after_site_change();
	}

	private function schedule_sync_after_site_change() {
		if ( ! static::is_connected() ) {
			return;
		}

		if ( static::$sync_scheduled ) {
			return;
		}

		static::$sync_scheduled = true;

		add_action( 'shutdown', [ $this, 'sync_website_on_shutdown' ] );
	}

	public function sync_website_on_shutdown() {
		$site_synced = Manage_Client::sync_website();
		if ( is_wp_error( $site_synced ) ) {
			Logger::error( 'Failed to sync website after upgrade: ' . esc_html( $site_synced->get_error_message() ) );
		}
	}

	public static function is_elementor_one(): bool {
		return self::get_connect()->get_config( 'app_type' ) !== Config::APP_TYPE;
	}
}
