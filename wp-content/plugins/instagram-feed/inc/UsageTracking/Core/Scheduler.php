<?php
/**
 * Schedules the weekly usage tracking cron.
 *
 * @package InstagramFeed\UsageTracking\Core
 * @since 6.10
 */

namespace InstagramFeed\UsageTracking\Core;

use InstagramFeed\UsageTracking\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Scheduler {

	/**
	 * Ensure weekly cron is scheduled when tracking is enabled.
	 * Call on init or when enabling the option.
	 */
	public function schedule() {
		$this->cleanup_legacy();

		if ( ! Config::is_enabled() ) {
			return;
		}

		if ( wp_next_scheduled( Config::CRON_HOOK ) ) {
			return;
		}

		$tracking           = array(
			'day'    => wp_rand( 0, 6 ),
			'hour'   => wp_rand( 0, 23 ),
			'minute' => wp_rand( 0, 59 ),
			'second' => wp_rand( 0, 59 ),
		);
		$tracking['offset'] = ($tracking['day'] * DAY_IN_SECONDS)
			+ ($tracking['hour'] * HOUR_IN_SECONDS)
			+ ($tracking['minute'] * MINUTE_IN_SECONDS)
			+ $tracking['second'];

		$last_sunday = strtotime( 'next sunday' ) - (7 * DAY_IN_SECONDS);
		if ( ($last_sunday + $tracking['offset']) > time() + 6 * HOUR_IN_SECONDS ) {
			$tracking['initsend'] = $last_sunday + $tracking['offset'];
		} else {
			$tracking['initsend'] = strtotime( 'next sunday' ) + $tracking['offset'];
		}

		wp_schedule_event( $tracking['initsend'], 'weekly', Config::CRON_HOOK );
		update_option( Config::OPTION_SCHEDULE, $tracking, false );
	}

	/**
	 * Add weekly schedule if not already present.
	 *
	 * @param array $schedules Existing cron schedules.
	 * @return array
	 */
	public function add_schedules( $schedules ) {
		if ( ! isset( $schedules['weekly'] ) ) {
			$schedules['weekly'] = array(
				'interval' => 604800,
				'display'  => __( 'Once Weekly', 'instagram-feed' ),
			);
		}
		return $schedules;
	}

	/**
	 * Unschedule the cron when tracking is disabled.
	 */
	public function unschedule() {
		wp_clear_scheduled_hook( Config::CRON_HOOK );
	}

	/**
	 * Clear the removed legacy tracking cron and delete its superseded options.
	 * Guarded so steady-state cost is a no-op.
	 */
	private function cleanup_legacy() {
		if ( wp_next_scheduled( 'sbi_usage_tracking_cron' ) ) {
			wp_clear_scheduled_hook( 'sbi_usage_tracking_cron' );
		}
		if ( get_option( 'sbi_smash_usage_tracking', null ) !== null ) {
			delete_option( 'sbi_smash_usage_tracking' );
			delete_option( 'sbi_usage_tracking_config' );
		}
	}
}
