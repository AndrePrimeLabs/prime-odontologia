<?php
/**
 * Records usage events for the current period (stored in sbi_smash_usage_events).
 *
 * @package InstagramFeed\UsageTracking
 * @since 6.10
 */

namespace InstagramFeed\UsageTracking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class EventRecorder {

	const OPTION_NAME = 'sbi_smash_usage_events';

	/**
	 * Record one occurrence of an event (increments count and sets last_date to today).
	 *
	 * @param string $event_name Event name (e.g. plugin_installed, setting_changed).
	 */
	public static function record( $event_name ) {
		if ( ! Config::is_enabled() ) {
			return;
		}
		if ( '' === $event_name || ! is_string( $event_name ) ) {
			return;
		}
		$event_name = sanitize_text_field( $event_name );
		if ( strlen( $event_name ) > 100 ) {
			$event_name = substr( $event_name, 0, 100 );
		}
		$events = get_option( self::OPTION_NAME, array() );
		if ( ! is_array( $events ) ) {
			$events = array();
		}
		$current               = isset( $events[ $event_name ] ) ? $events[ $event_name ] : 0;
		$count                 = is_array( $current ) && isset( $current['count'] ) ? (int) $current['count'] + 1 : (is_numeric( $current ) ? (int) $current + 1 : 1);
		$events[ $event_name ] = array(
			'count'     => $count,
			'last_date' => gmdate( 'Y-m-d' ),
		);
		update_option( self::OPTION_NAME, $events, false );
	}

	/**
	 * Record today as an active day (for days_active metric). Keeps last 90 days.
	 */
	public static function record_active_day() {
		$option_key = \InstagramFeed\UsageTracking\Config::OPTION_ACTIVE_DATES;
		$dates      = get_option( $option_key, array() );
		if ( ! is_array( $dates ) ) {
			$dates = array();
		}
		$today = gmdate( 'Y-m-d' );
		if ( ! in_array( $today, $dates, true ) ) {
			$dates[] = $today;
			rsort( $dates );
			$dates = array_slice( $dates, 0, 90 );
			update_option( $option_key, $dates, false );
		}
	}

	/**
	 * Record a session duration in seconds (for session_duration metric). Keeps last 10.
	 *
	 * @param int $seconds Duration in seconds.
	 */
	public static function record_session_duration( $seconds ) {
		if ( ! Config::is_enabled() ) {
			return;
		}
		$seconds = (int) $seconds;
		if ( $seconds <= 0 || $seconds > 86400 ) {
			return;
		}
		$option_key = \InstagramFeed\UsageTracking\Config::OPTION_SESSION_DURATIONS;
		$durations  = get_option( $option_key, array() );
		if ( ! is_array( $durations ) ) {
			$durations = array();
		}
		$durations[] = $seconds;
		$durations   = array_slice( $durations, -10 );
		update_option( $option_key, $durations, false );
	}
}
