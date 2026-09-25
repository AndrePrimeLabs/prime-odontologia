<?php

namespace InstagramFeed;

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Tracks how long feeds have been served from the backup cache and escalates
 * an admin notice when the cached content goes stale (SMASH-1808).
 *
 * The backup cache keeps a broken feed looking normal to visitors
 * indefinitely; support data attributes roughly 8.5% of connection-failure
 * tickets to feeds that were dead for weeks before anyone noticed — almost
 * always reported by someone other than the site owner. This class closes
 * that detection gap.
 *
 * State is recorded only at the moment a feed is actually served from
 * backup, so healthy sites never accumulate entries and never see a notice.
 * A successful fresh fetch clears the feed's entry immediately.
 *
 * @since SMASH-1808
 */
class BackupCacheMonitor
{
	public const OPTION_NAME = 'sbi_backup_cache_status';

	/**
	 * The sbi_feed_caches row whose last_updated is the age of the content
	 * visitors are seeing: it is rewritten only when a fetch succeeds.
	 */
	public const BACKUP_CACHE_KEY = 'posts_backup';

	/**
	 * Notice ids. The escalated id rotates weekly so a dismissal cannot
	 * outlive a still-worsening problem (dismissals are stored per notice id).
	 */
	public const NOTICE_ID = 'backup_cache_stale';
	public const NOTICE_ID_URGENT_PREFIX = 'backup_cache_stale_urgent_';

	/**
	 * Seconds between recorded serves per feed — one write per hour is
	 * plenty for a signal measured in days.
	 */
	public const SERVE_RECORD_THROTTLE = 3600;

	/**
	 * Entries not served from backup for this long are pruned; the feed was
	 * deleted or recovered without a recorded fresh fetch.
	 */
	public const ENTRY_RETENTION = 30 * DAY_IN_SECONDS;

	/**
	 * Record that a feed was just served from the backup cache.
	 *
	 * Called from the backup-serve path, so it must stay cheap: one option
	 * read, and at most one indexed cache-row query + option write per
	 * feed per hour.
	 *
	 * @param string $feed_id Feed id as stored in the caches table.
	 */
	public static function record_backup_serve($feed_id)
	{
		$feed_id = (string)$feed_id;
		if ('' === $feed_id || false !== strpos($feed_id, '_CUSTOMIZER') || 0 === strpos($feed_id, '*')) {
			return;
		}

		$status = self::get_status();
		$now = time();

		$known = isset($status['feeds'][ $feed_id ]) && is_array($status['feeds'][ $feed_id ]);
		$entry = $known ? $status['feeds'][ $feed_id ] : array();

		if (!empty($entry['last_serve']) && ($now - (int)$entry['last_serve']) < self::SERVE_RECORD_THROTTLE) {
			return;
		}

		$content_ts = self::content_last_updated($feed_id);

		$status['feeds'][ $feed_id ] = array(
			'first_serve' => isset($entry['first_serve']) ? (int)$entry['first_serve'] : $now,
			'last_serve' => $now,
			// Fall back to the first recorded serve when the row date is
			// unavailable — a lower bound on the real content age.
			'content_last_updated' => $content_ts > 0 ? $content_ts : (int)($entry['first_serve'] ?? $now),
		);

		update_option(self::OPTION_NAME, $status, false);
	}

	/**
	 * Record that a feed committed fresh content — it is healthy again.
	 *
	 * @param string $feed_id Feed id as stored in the caches table.
	 */
	public static function record_fresh_content($feed_id)
	{
		$feed_id = (string)$feed_id;
		$status = self::get_status();

		if (!isset($status['feeds'][ $feed_id ])) {
			return;
		}

		unset($status['feeds'][ $feed_id ]);
		update_option(self::OPTION_NAME, $status, false);
	}

	/**
	 * Days of staleness before the first notice. Filterable (AC 2).
	 *
	 * @return int
	 */
	public static function stale_threshold_days()
	{
		return max(1, (int)apply_filters('sbi_backup_cache_stale_threshold_days', 7));
	}

	/**
	 * Days of staleness before the notice escalates.
	 *
	 * @return int
	 */
	public static function urgent_threshold_days()
	{
		return max(self::stale_threshold_days() + 1, (int)apply_filters('sbi_backup_cache_urgent_threshold_days', 21));
	}

	/**
	 * Evaluate the current staleness state across all tracked feeds.
	 *
	 * Prunes entries that have not been served from backup recently — a feed
	 * that no longer renders should not nag forever.
	 *
	 * @return array {
	 *     @type int $tier 0 healthy, 1 stale, 2 urgent.
	 *     @type int $worst_days Age in days of the stalest feed.
	 *     @type int $feed_count Number of feeds currently stale past the threshold.
	 * }
	 */
	public static function evaluate()
	{
		$status = self::get_status();
		$now = time();
		$changed = false;

		$worst_days = 0;
		$stale_count = 0;

		foreach ($status['feeds'] as $feed_id => $entry) {
			$served_recently = is_array($entry) && !empty($entry['last_serve'])
				&& ($now - (int)$entry['last_serve']) <= self::ENTRY_RETENTION;
			if (!$served_recently) {
				unset($status['feeds'][ $feed_id ]);
				$changed = true;
				continue;
			}

			$content_ts = isset($entry['content_last_updated']) ? (int)$entry['content_last_updated'] : 0;
			if ($content_ts <= 0) {
				continue;
			}

			$age_days = (int)floor(($now - $content_ts) / DAY_IN_SECONDS);
			if ($age_days >= self::stale_threshold_days()) {
				$stale_count++;
			}
			if ($age_days > $worst_days) {
				$worst_days = $age_days;
			}
		}

		if ($changed) {
			update_option(self::OPTION_NAME, $status, false);
		}

		$tier = 0;
		if ($stale_count > 0) {
			$tier = $worst_days >= self::urgent_threshold_days() ? 2 : 1;
		}

		return array(
			'tier' => $tier,
			'worst_days' => $worst_days,
			'feed_count' => $stale_count,
		);
	}

	/**
	 * The notice id for a tier. Tier 2 rotates weekly: dismissing it hides
	 * it for at most a week while the feed stays dead (AC 5), and the tier 1
	 * to tier 2 jump mints a fresh id so a tier 1 dismissal never suppresses
	 * the escalation.
	 *
	 * @param int $tier Tier 1 or 2.
	 *
	 * @return string
	 */
	public static function notice_id($tier)
	{
		if ($tier >= 2) {
			return self::NOTICE_ID_URGENT_PREFIX . gmdate('oW');
		}

		return self::NOTICE_ID;
	}

	/**
	 * The stored status option, shape-healed.
	 *
	 * @return array
	 */
	public static function get_status()
	{
		$status = get_option(self::OPTION_NAME, array());
		if (!is_array($status) || !isset($status['feeds']) || !is_array($status['feeds'])) {
			$status = array('feeds' => array());
		}

		return $status;
	}

	/**
	 * Remember what was last rendered — id, day count and feed count — so a
	 * tier change or recovery can remove the right notice, and a changed day
	 * count can refresh the copy (SBNotices ignores add_notice for an
	 * existing id, so stale copy must be removed before re-adding).
	 *
	 * @param string $notice_id Currently registered id, empty when none.
	 * @param int    $worst_days Day count rendered into the copy.
	 * @param int    $feed_count Feed count rendered into the copy.
	 */
	public static function set_registered_notice($notice_id, $worst_days = 0, $feed_count = 0)
	{
		$status = self::get_status();
		$notice = array(
			'id' => (string)$notice_id,
			'days' => (int)$worst_days,
			'feeds' => (int)$feed_count,
		);

		if (isset($status['notice']) && $status['notice'] === $notice) {
			return;
		}

		$status['notice'] = $notice;
		update_option(self::OPTION_NAME, $status, false);
	}

	/**
	 * The last rendered notice state.
	 *
	 * @return array { @type string $id @type int $days @type int $feeds }
	 */
	public static function get_registered_notice()
	{
		$status = self::get_status();
		$notice = isset($status['notice']) && is_array($status['notice']) ? $status['notice'] : array();

		return array(
			'id' => isset($notice['id']) ? (string)$notice['id'] : '',
			'days' => isset($notice['days']) ? (int)$notice['days'] : 0,
			'feeds' => isset($notice['feeds']) ? (int)$notice['feeds'] : 0,
		);
	}

	/**
	 * When the backup content was last refreshed from live data.
	 *
	 * @param string $feed_id Feed id as stored in the caches table.
	 *
	 * @return int Unix timestamp, 0 when unavailable.
	 */
	private static function content_last_updated($feed_id)
	{
		global $wpdb;
		$cache_table_name = $wpdb->prefix . 'sbi_feed_caches';

		// CAST makes the comparison exact-string: against a bigint feed_id
		// column a non-numeric key would coerce to 0 and match a stray row.
		$last_updated = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT last_updated FROM $cache_table_name WHERE CAST(feed_id AS CHAR) = %s AND cache_key = %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name derived from $wpdb->prefix, not user input.
				$feed_id,
				self::BACKUP_CACHE_KEY
			)
		);

		if (empty($last_updated)) {
			return 0;
		}

		$ts = strtotime($last_updated . ' UTC');

		return false !== $ts ? $ts : 0;
	}
}
