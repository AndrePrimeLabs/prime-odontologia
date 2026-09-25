<?php
/**
 * Orchestrates Smash Usage Tracking: schedule, ensure site token, build payload, send.
 *
 * @package InstagramFeed\UsageTracking
 * @since 6.10
 */

namespace InstagramFeed\UsageTracking;

use InstagramFeed\UsageTracking\Core\RegisterSite;
use InstagramFeed\UsageTracking\Core\Sender;
use InstagramFeed\UsageTracking\Core\PayloadBuilder;
use InstagramFeed\UsageTracking\Core\Scheduler;
use InstagramFeed\UsageTracking\Instagram\InstagramFreeReporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SmashUsageTracking {

	/** @var ReporterInterface */
	private $reporter;

	/** @var RegisterSite */
	private $register_site;

	/** @var Sender */
	private $sender;

	/** @var PayloadBuilder */
	private $payload_builder;

	/** @var Scheduler */
	private $scheduler;

	public function __construct() {
		$this->reporter        = new InstagramFreeReporter();
		$this->register_site   = new Core\RegisterSite();
		$this->sender          = new Core\Sender();
		$this->payload_builder = new Core\PayloadBuilder( $this->reporter );
		$this->scheduler       = new Core\Scheduler();

		add_action( 'wp_loaded', array( $this, 'maybe_schedule' ) );
		add_filter( 'cron_schedules', array( $this->scheduler, 'add_schedules' ) );
		add_action( Config::CRON_HOOK, array( $this, 'send_checkin' ) );

		add_action( 'current_screen', array( $this, 'maybe_record_active_day' ) );
		add_action( 'wp_ajax_sbi_smash_usage_record_event', array( $this, 'ajax_record_event' ) );
		add_action( 'wp_ajax_sbi_smash_usage_record_session', array( $this, 'ajax_record_session' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_session_script' ), 20 );
	}

	/**
	 * Schedule cron if enabled and not already scheduled.
	 */
	public function maybe_schedule() {
		$this->scheduler->schedule();
	}

	/**
	 * Cron callback: ensure site token, build payload, send, update last_send.
	 */
	public function send_checkin() {
		if ( ! Config::is_enabled() ) {
			return;
		}

		$host = wp_parse_url( home_url(), PHP_URL_HOST );
		if ( 'smashballoon.com' === $host || '.smashballoon.com' === substr( (string) $host, -17 ) ) {
			return;
		}

		$opt       = get_option( Config::OPTION_TRACKING, array() );
		$last_send = is_array( $opt ) && isset( $opt['last_send'] ) ? (int) $opt['last_send'] : 0;
		if ( $last_send > strtotime( '-1 week' ) ) {
			return;
		}

		$site_token = get_option( Config::OPTION_SITE_TOKEN, '' );
		if ( '' === $site_token || ! is_string( $site_token ) ) {
			$site_token = $this->register_site->register( $this->reporter );
			if ( null === $site_token ) {
				return;
			}
		}

		$period_end   = gmdate( 'Y-m-d', time() - DAY_IN_SECONDS );
		$period_start = gmdate( 'Y-m-d', time() - 7 * DAY_IN_SECONDS );

		$payload = $this->payload_builder->build( $site_token, $period_start, $period_end );
		$success = $this->sender->send( $payload );

		if ( $success ) {
			update_option(
                Config::OPTION_TRACKING,
                array(
					'enabled'   => Config::is_enabled(),
					'last_send' => time(),
                ),
                false
            );
			$sent_events = isset( $payload['dynamic_metrics']['events'] ) && is_array( $payload['dynamic_metrics']['events'] )
				? $payload['dynamic_metrics']['events']
				: array();
			$this->reset_events_after_send( $sent_events );
		}
	}

	/**
	 * Remove only the event keys that were included in the sent payload.
	 * Events recorded by concurrent AJAX requests after the payload was built
	 * are left intact so they roll over into the next reporting period.
	 *
	 * @param array $sent_events Events map from the sent payload.
	 */
	private function reset_events_after_send( array $sent_events ) {
		if ( ! empty( $sent_events ) ) {
			$stored = get_option( EventRecorder::OPTION_NAME, array() );
			if ( is_array( $stored ) ) {
				foreach ( array_keys( $sent_events ) as $key ) {
					unset( $stored[ $key ] );
				}
				update_option( EventRecorder::OPTION_NAME, $stored, false );
			}
		}
		update_option( Config::OPTION_SESSION_DURATIONS, array(), false );
	}

	/**
	 * Unschedule cron (call when disabling tracking).
	 */
	public function unschedule() {
		$this->scheduler->unschedule();
	}

	/**
	 * Record active day and optionally settings_page_viewed when on an SBI admin page.
	 */
	public function maybe_record_active_day( $screen ) {
		if ( ! $screen || strpos( $screen->id, 'sbi' ) === false ) {
			return;
		}
		if ( ! Config::is_enabled() ) {
			return;
		}
		EventRecorder::record_active_day();
		if ( isset( $screen->id ) && strpos( $screen->id, 'sbi-settings' ) !== false ) {
			EventRecorder::record( 'settings_page_viewed' );
		}
	}

	/**
	 * AJAX: record a single event from JS (e.g. setup_wizard_started).
	 */
	public function ajax_record_event() {
		check_ajax_referer( 'sbi_smash_usage_record_event', 'nonce' );
		if ( ! current_user_can( 'manage_instagram_feed_options' ) && ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error();
		}
		$event_name = isset( $_POST['event_name'] ) ? sanitize_text_field( wp_unslash( $_POST['event_name'] ) ) : '';
		$allowed    = array(
			'setup_wizard_started',
			'setup_wizard_step_completed',
			'setup_wizard_completed',
			'setup_wizard_abandoned',
			'upgrade_prompt_shown',
		);
		if ( '' !== $event_name && in_array( $event_name, $allowed, true ) ) {
			EventRecorder::record( $event_name );
		}
		wp_send_json_success();
	}

	/**
	 * AJAX: record session duration from JS (seconds).
	 */
	public function ajax_record_session() {
		check_ajax_referer( 'sbi_smash_usage_record_session', 'nonce' );
		if ( ( ! current_user_can( 'manage_instagram_feed_options' ) && ! current_user_can( 'manage_options' )) || ! Config::is_enabled() ) {
			wp_send_json_error();
		}
		$seconds = isset( $_POST['duration_seconds'] ) ? (int) $_POST['duration_seconds'] : 0;
		EventRecorder::record_session_duration( $seconds );
		wp_send_json_success();
	}

	/**
	 * Enqueue session-duration and record-event script on SBI admin pages.
	 */
	public function enqueue_session_script() {
		if ( ! function_exists( 'get_current_screen' ) ) {
			return;
		}
		$screen = get_current_screen();
		if ( ! $screen || strpos( $screen->id, 'sbi' ) === false ) {
			return;
		}
		$script_path = 'admin/assets/js/smash-usage-session.js';
		$path        = defined( 'SBI_PLUGIN_DIR' ) ? trailingslashit( SBI_PLUGIN_DIR ) . $script_path : '';
		if ( '' === $path || ! file_exists( $path ) ) {
			return;
		}
		wp_enqueue_script(
			'sbi-smash-usage-session',
			defined( 'SBI_PLUGIN_URL' ) ? trailingslashit( SBI_PLUGIN_URL ) . $script_path : '',
			array( 'jquery' ),
			defined( 'SBIVER' ) ? SBIVER : '1.0',
			true
		);
		wp_localize_script(
            'sbi-smash-usage-session',
            'sbiSmashUsageSession',
            array(
				'ajax_url'    => admin_url( 'admin-ajax.php' ),
				'nonce'       => wp_create_nonce( 'sbi_smash_usage_record_session' ),
				'event_nonce' => wp_create_nonce( 'sbi_smash_usage_record_event' ),
            )
        );
	}

	/**
	 * Build the usage report payload without sending (for preview/debugging).
	 *
	 * @return array
	 */
	public function get_payload_preview() {
		$period_end   = gmdate( 'Y-m-d', time() - DAY_IN_SECONDS );
		$period_start = gmdate( 'Y-m-d', time() - 7 * DAY_IN_SECONDS );

		return $this->payload_builder->build( 'preview-no-api', $period_start, $period_end );
	}
}
