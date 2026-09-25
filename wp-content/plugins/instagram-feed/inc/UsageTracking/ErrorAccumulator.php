<?php

namespace InstagramFeed\UsageTracking;

use InstagramFeed\Token_Health\MetaErrorMap;

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Accumulates API-error counts per day so weekly reports cover the whole
 * period instead of sampling the error option at cron time (SMASH-1809).
 *
 * Categories come from the Token_Health routing table — the taxonomy the
 * plugin actually acts on — not from a second telemetry-only list.
 *
 * @since SMASH-1809
 */
class ErrorAccumulator
{
	public const OPTION_NAME = 'sbi_smash_usage_error_counts';

	/**
	 * Days of per-day buckets kept in the option. Reports sum a 7-day
	 * period, so 30 leaves generous slack for skipped sends without
	 * letting an error storm grow the option unbounded.
	 */
	public const DAYS_KEPT = 30;

	/**
	 * Instagram-platform token-expiry codes recognised by the telemetry
	 * taxonomy. Deliberately NOT rows in MetaErrorMap: they have never been
	 * observed live, so a routing row would imply criticality/reconnect
	 * behaviour there is no evidence for (AgDR-0084's corroborated-rows
	 * principle; placement rationale in AgDR-0085).
	 */
	public const EXPIRY_CODES = array(10900, 10901, 10902);

	/**
	 * Record one Graph API error occurrence, categorised by the routing table.
	 *
	 * @param int|string $code Graph error code.
	 * @param int|string $subcode Graph error_subcode, 0 when absent.
	 * @param string     $message Raw Graph error message, used only where a
	 *                            code alone cannot identify the cause.
	 */
	public static function record_api_error($code, $subcode = 0, $message = '')
	{
		if (!Config::is_enabled()) {
			return;
		}
		$code = (int)$code;
		if ($code <= 0) {
			self::bump('other', false);
			return;
		}
		if (in_array($code, self::EXPIRY_CODES, true)) {
			self::bump('auth', true);
			return;
		}
		$route = MetaErrorMap::route($code, $subcode, is_string($message) ? $message : '');
		self::bump($route['telemetry_category'], 'session_expired' === $route['scenario']);
	}

	/**
	 * Record an occurrence that carries no Graph error code (e.g. a transport
	 * failure) under an explicit category.
	 *
	 * @param string $category Category slug (e.g. network).
	 */
	public static function record_category($category)
	{
		if (!Config::is_enabled()) {
			return;
		}
		$category = sanitize_key((string)$category);
		if ('' === $category) {
			return;
		}
		self::bump($category, false);
	}

	/**
	 * Sum the per-day buckets whose date falls inside the period (inclusive).
	 *
	 * @param int $ts_start Period start timestamp.
	 * @param int $ts_end Period end timestamp.
	 *
	 * @return array {
	 *     @type array $by_type Per-category counts.
	 *     @type int   $expiring_token_errors Token-expiry occurrences.
	 * }
	 */
	public static function totals_for_period($ts_start, $ts_end)
	{
		$data = get_option(self::OPTION_NAME, array());
		$days = isset($data['days']) && is_array($data['days']) ? $data['days'] : array();
		$by_type = array();
		$expiring = 0;

		$start_day = gmdate('Y-m-d', (int)$ts_start);
		$end_day = gmdate('Y-m-d', (int)$ts_end);

		foreach ($days as $day => $bucket) {
			if (!is_string($day) || $day < $start_day || $day > $end_day || !is_array($bucket)) {
				continue;
			}
			$counts = isset($bucket['by_type']) && is_array($bucket['by_type']) ? $bucket['by_type'] : array();
			foreach ($counts as $category => $count) {
				$by_type[ $category ] = (isset($by_type[ $category ]) ? $by_type[ $category ] : 0) + (int)$count;
			}
			$expiring += isset($bucket['expiring']) ? (int)$bucket['expiring'] : 0;
		}

		return array(
			'by_type' => $by_type,
			'expiring_token_errors' => $expiring,
		);
	}

	/**
	 * Increment today's bucket and prune days beyond the retention window.
	 *
	 * @param string $category Category slug.
	 * @param bool   $is_expiry Whether this occurrence is a token-expiry error.
	 */
	private static function bump($category, $is_expiry)
	{
		$data = get_option(self::OPTION_NAME, array());
		if (!is_array($data) || !isset($data['days']) || !is_array($data['days'])) {
			$data = array('days' => array());
		}

		$today = gmdate('Y-m-d');
		if (!isset($data['days'][ $today ]) || !is_array($data['days'][ $today ])) {
			$data['days'][ $today ] = array(
				'by_type' => array(),
				'expiring' => 0,
			);
		}

		// Heal bucket-level corruption too, not just the top-level shape — a
		// scalar by_type would otherwise fatal inside the feed error path.
		if (!isset($data['days'][ $today ]['by_type']) || !is_array($data['days'][ $today ]['by_type'])) {
			$data['days'][ $today ]['by_type'] = array();
		}

		$bucket = $data['days'][ $today ]['by_type'];
		$current = isset($bucket[ $category ]) ? $bucket[ $category ] : 0;

		$data['days'][ $today ]['by_type'][ $category ] = (int)$current + 1;
		if ($is_expiry) {
			$existing = isset($data['days'][ $today ]['expiring']) ? $data['days'][ $today ]['expiring'] : 0;
			$data['days'][ $today ]['expiring'] = (int)$existing + 1;
		}

		if (count($data['days']) > self::DAYS_KEPT) {
			krsort($data['days']);
			$data['days'] = array_slice($data['days'], 0, self::DAYS_KEPT, true);
		}

		update_option(self::OPTION_NAME, $data, false);
	}
}
