<?php

namespace InstagramFeed\Token_Health;

/**
 * Canonical routing table for Meta (Graph) API errors.
 *
 * Built from behaviour observed against live tokens during the SBR-113
 * token-lifecycle audit, not from Meta's published error guide — the two
 * disagree in three places that matter, and the observed column wins:
 *
 * - Page-role loss ships 190 with NO subcode (the documented 190/492 never
 *   fires) and its message also covers the 2FA-required case, so the two
 *   causes share one signal and can only be told apart by asking the user.
 * - Code 10 does not mean the token is broken; a scope is missing. Prompting
 *   a reconnect sends the user through OAuth to fix something OAuth won't fix.
 * - Rate limits (4/17/32/613/368) are transient and must never surface as a
 *   broken connection. 32, 613 and 368 were unhandled before this table.
 *
 * This class is deliberately free of user-facing strings: it decides what a
 * failure MEANS, each plugin decides how to say it, keyed by copy_key. That
 * split is what lets all four Meta plugins carry a byte-identical copy of
 * this file (only the namespace line differs) so a later move into shared
 * code is mechanical.
 *
 * @since SMASH-1806
 */
class MetaErrorMap
{
	/**
	 * Verdicts, in order of severity.
	 */
	public const VERDICT_DEAD = 'dead_invalid';
	public const VERDICT_DEGRADED = 'degraded';
	public const VERDICT_RATE_LIMITED = 'rate_limited';
	public const VERDICT_TRANSIENT = 'transient';
	public const VERDICT_UNKNOWN = 'unknown';

	/**
	 * Message fragment that identifies page-role loss OR a page requiring 2FA.
	 * Meta sends both with a bare 190, so this is the only way to tell them
	 * apart from an ordinary invalid token. Best-effort by nature: if Meta
	 * rewords the message, routing falls back to the generic 190 row.
	 */
	public const ROLE_LOSS_FRAGMENT = 'in order to impersonate';

	/**
	 * Fragment identifying a revoked app grant. Kept here so every plugin
	 * matches the same string; the data-deletion clock each plugin runs is
	 * deliberately NOT driven from this class.
	 */
	public const APP_UNAUTHORIZED_FRAGMENT = 'user has not authorized application';

	/**
	 * Routes a Graph API error to a verdict and the behaviour flags that
	 * every surface (notice, Site Health, email, source list, backoff) reads.
	 *
	 * @param int|string  $code Graph error code.
	 * @param int|string  $subcode Graph error_subcode, 0 when absent.
	 * @param string      $message Raw Graph error message, used only where a
	 *                             code alone cannot identify the cause.
	 * @param string|null $token_family Optional token family hint ('ig_login'
	 *                             for Instagram-Login tokens), used for the
	 *                             observed code-2 boundary trap.
	 *
	 * @return array {
	 *     @type string $scenario Stable slug for this failure.
	 *     @type string $verdict One of the VERDICT_* constants.
	 *     @type bool   $is_critical Whether the connection is actually broken.
	 *     @type bool   $show_reconnect Whether reconnecting can fix it.
	 *     @type bool   $invalidates_source Whether the stored source is unusable.
	 *     @type string $copy_key Key each plugin renders its own copy from.
	 *     @type int    $retry_after Seconds to wait before retrying, 0 if n/a.
	 *     @type string $telemetry_category Bucket for usage-tracking reports.
	 * }
	 */
	public static function route($code, $subcode = 0, $message = '', $token_family = null)
	{
		$code = (int)$code;
		$subcode = (int)$subcode;
		$message = is_string($message) ? $message : '';

		// Token decryption failures are reported as 104 by some paths and as
		// the plugins' synthesised 999 by others; they are one scenario.
		if (104 === $code) {
			$code = 999;
		}

		if (190 === $code) {
			return self::route190($subcode, $message);
		}

		// Observed boundary trap: an Instagram-Login token probed against a
		// Facebook-family endpoint returns a PERSISTENT "service temporarily
		// unavailable". Routing it as transient retries forever, so a family
		// mismatch is a misconfiguration alarm instead.
		if (2 === $code && 'ig_login' === $token_family) {
			return self::row('token_family_mismatch', self::VERDICT_DEGRADED, array(
				'is_critical' => true,
				'copy_key' => 'token_family_mismatch',
				'telemetry_category' => 'misconfiguration',
			));
		}

		$rows = self::rows();

		if (isset($rows[ $code ])) {
			return $rows[ $code ];
		}

		// Permission-specific errors share code 10's shape: the token is fine,
		// a scope is missing, and OAuth is not the fix.
		if ($code >= 200 && $code <= 299) {
			return self::row('permission_specific', self::VERDICT_DEGRADED, array(
				'is_critical' => true,
				'copy_key' => 'permission_regrant',
				'telemetry_category' => 'permission',
			));
		}

		// An unrecognised code stays NON-critical, matching the closed code
		// lists this table replaced. Failing loud here was tried and is wrong:
		// Meta has many throttle codes beyond the five this table enumerates
		// (9, 341 and 130429 are handled above; others will appear), and
		// sweeping them into the unknown bucket would raise a broken-connection
		// alarm and a reconnect prompt for a working token — precisely the
		// symptom this ticket exists to remove. Unexplained failures still
		// reach the admin through the in-feed error report and telemetry.
		return self::row('unknown', self::VERDICT_UNKNOWN, array(
			'copy_key' => 'generic',
			'telemetry_category' => 'other',
		));
	}

	/**
	 * Routes the 190 family, where the subcode carries the cause — except for
	 * page-role loss, which ships no subcode at all.
	 *
	 * @param int    $subcode Graph error_subcode, 0 when absent.
	 * @param string $message Raw Graph error message.
	 *
	 * @return array
	 */
	private static function route190($subcode, $message)
	{
		$dead = array(
			'is_critical' => true,
			'show_reconnect' => true,
			'invalidates_source' => true,
			'telemetry_category' => 'auth',
		);

		$subcodes = array(
			458 => 'app_removed',
			459 => 'user_checkpointed',
			460 => 'password_changed',
			463 => 'session_expired',
			464 => 'unconfirmed_user',
			467 => 'token_invalid',
		);

		if (isset($subcodes[ $subcode ])) {
			$scenario = $subcodes[ $subcode ];
			return self::row($scenario, self::VERDICT_DEAD, array_merge($dead, array(
				'copy_key' => $scenario,
			)));
		}

		// No subcode: the message is the only discriminator. Reconnecting does
		// not restore a lost page role or enable 2FA, so no reconnect CTA —
		// this routes to guidance that asks which of the two causes applies.
		if ('' !== $message && false !== strpos($message, self::ROLE_LOSS_FRAGMENT)) {
			return self::row('page_role_lost_or_2fa', self::VERDICT_DEAD, array(
				'is_critical' => true,
				'show_reconnect' => false,
				'invalidates_source' => true,
				'copy_key' => 'page_role_lost_or_2fa',
				'telemetry_category' => 'auth',
			));
		}

		return self::row('token_invalid', self::VERDICT_DEAD, array_merge($dead, array(
			'copy_key' => 'token_invalid',
		)));
	}

	/**
	 * The code-keyed rows. Kept in one place so the four plugin copies of this
	 * file stay comparable line for line.
	 *
	 * @return array
	 */
	private static function rows()
	{
		$rate_limited = array(
			'is_critical' => false,
			'show_reconnect' => false,
			'invalidates_source' => false,
			'copy_key' => 'rate_limited',
			'retry_after' => 900,
			'telemetry_category' => 'rate_limit',
		);

		return array(
			// Rate limits. Never a broken connection, never a reconnect prompt.
			4 => self::row('app_rate_limit', self::VERDICT_RATE_LIMITED, $rate_limited),
			17 => self::row('user_rate_limit', self::VERDICT_RATE_LIMITED, $rate_limited),
			32 => self::row('page_rate_limit', self::VERDICT_RATE_LIMITED, $rate_limited),
			613 => self::row('calls_per_second_limit', self::VERDICT_RATE_LIMITED, $rate_limited),
			// Throttles beyond the five the ticket enumerates. 341 already sits
			// in every plugin's telemetry rate-limit bucket, so the codebase
			// already treats it as one; 9 and 130429 are documented throttles.
			// Listing them keeps them out of the unknown bucket. Deliberately
			// NOT listed: 2207050/2207051, which appear in that same telemetry
			// bucket but are Content Publishing API values a feed reader never
			// calls, and are subcodes rather than top-level codes — so the rows
			// would be inert while implying a claim we cannot support.
			9 => self::row('post_limit', self::VERDICT_RATE_LIMITED, $rate_limited),
			341 => self::row('app_limit_reached', self::VERDICT_RATE_LIMITED, $rate_limited),
			130429 => self::row('rate_limit_reached', self::VERDICT_RATE_LIMITED, $rate_limited),
			368 => self::row('temporarily_blocked', self::VERDICT_RATE_LIMITED, array_merge(
				$rate_limited,
				array(
					// A policy block is longer-lived than a throughput limit and
					// needs its own message, so it does not read as a hiccup.
					'copy_key' => 'temporarily_blocked',
					'retry_after' => 3600,
				)
			)),

			// Platform hiccups. Retry quietly; do not alarm anyone.
			1 => self::row('api_unknown', self::VERDICT_TRANSIENT, array(
				'copy_key' => 'transient',
				'retry_after' => 180,
				'telemetry_category' => 'server',
			)),
			2 => self::row('api_unavailable', self::VERDICT_TRANSIENT, array(
				'copy_key' => 'transient',
				'retry_after' => 180,
				'telemetry_category' => 'server',
			)),

			// Throughput limits scoped to a feature rather than the app.
			18 => self::row('hashtag_limit', self::VERDICT_RATE_LIMITED, array(
				'copy_key' => 'hashtag_limit',
				'retry_after' => 900,
				'telemetry_category' => 'rate_limit',
			)),
			24 => self::row('hashtag_not_found', self::VERDICT_DEGRADED, array(
				'copy_key' => 'hashtag_not_found',
				'retry_after' => 300,
				'telemetry_category' => 'not_found',
			)),

			// The token is valid; a scope is missing. Re-grant, never reconnect.
			10 => self::row('permission_missing', self::VERDICT_DEGRADED, array(
				'is_critical' => true,
				'copy_key' => 'permission_regrant',
				'telemetry_category' => 'permission',
			)),

			// The source itself no longer resolves.
			100 => self::row('invalid_parameter', self::VERDICT_DEAD, array(
				'is_critical' => true,
				'show_reconnect' => true,
				'invalidates_source' => true,
				'copy_key' => 'source_unresolvable',
				'telemetry_category' => 'not_found',
			)),
			803 => self::row('object_not_queryable', self::VERDICT_DEAD, array(
				'is_critical' => true,
				'show_reconnect' => true,
				'invalidates_source' => true,
				// Deliberately not source_unresolvable: that key's copy talks
				// about an invalid or expired token, which is wrong here — the
				// token is fine and the object cannot be queried by that id.
				'copy_key' => 'object_unavailable',
				'telemetry_category' => 'not_found',
			)),

			// Session-level invalidation.
			102 => self::row('session_invalid', self::VERDICT_DEAD, array(
				'is_critical' => true,
				'show_reconnect' => true,
				'invalidates_source' => true,
				'copy_key' => 'token_invalid',
				'telemetry_category' => 'auth',
			)),

			// Locally stored token could not be decrypted (synthesised, plus 104).
			999 => self::row('decryption_failed', self::VERDICT_DEAD, array(
				'is_critical' => true,
				'show_reconnect' => true,
				'invalidates_source' => true,
				'copy_key' => 'decryption_failed',
				'telemetry_category' => 'auth',
			)),
		);
	}

	/**
	 * Builds a row, defaulting every flag to its least-alarming value so a new
	 * row only has to state what makes it different.
	 *
	 * @param string $scenario Stable slug for this failure.
	 * @param string $verdict One of the VERDICT_* constants.
	 * @param array  $overrides Flags this row sets.
	 *
	 * @return array
	 */
	private static function row($scenario, $verdict, $overrides = array())
	{
		return array_merge(
			array(
				'scenario' => $scenario,
				'verdict' => $verdict,
				'is_critical' => false,
				'show_reconnect' => false,
				'invalidates_source' => false,
				'copy_key' => 'generic',
				'retry_after' => 0,
				'telemetry_category' => 'other',
			),
			$overrides,
			array(
				'scenario' => $scenario,
				'verdict' => $verdict,
			)
		);
	}

	/**
	 * Whether a failure should reach the critical-error surfaces: the admin
	 * banner, Site Health, the menu badge, the issue email and the logged-in
	 * front-end notice.
	 *
	 * @param int|string $code Graph error code.
	 * @param int|string $subcode Graph error_subcode, 0 when absent.
	 * @param string     $message Raw Graph error message.
	 *
	 * @return bool
	 */
	public static function isCritical($code, $subcode = 0, $message = '')
	{
		$route = self::route($code, $subcode, $message);

		return (bool)$route['is_critical'];
	}

	/**
	 * Whether reconnecting the account can actually fix this failure.
	 *
	 * @param int|string $code Graph error code.
	 * @param int|string $subcode Graph error_subcode, 0 when absent.
	 * @param string     $message Raw Graph error message.
	 *
	 * @return bool
	 */
	public static function showsReconnect($code, $subcode = 0, $message = '')
	{
		$route = self::route($code, $subcode, $message);

		return (bool)$route['show_reconnect'];
	}

	/**
	 * Whether the stored source should be presented as unusable.
	 *
	 * @param int|string $code Graph error code.
	 * @param int|string $subcode Graph error_subcode, 0 when absent.
	 * @param string     $message Raw Graph error message.
	 *
	 * @return bool
	 */
	public static function invalidatesSource($code, $subcode = 0, $message = '')
	{
		$route = self::route($code, $subcode, $message);

		return (bool)$route['invalidates_source'];
	}

	/**
	 * Reads the code, subcode and message out of a Graph error response in any
	 * of the shapes the plugins pass around.
	 *
	 * Both subcode spellings are accepted: feed-fetch errors carry
	 * `error_subcode`, while a `debug_token` response nests the same value as
	 * `subcode`. Reading only one of them silently loses the subcode on the
	 * other path, which is what makes 190 routing collapse to its generic row.
	 *
	 * @param mixed $response Decoded Graph response, or its error member.
	 *
	 * @return array {
	 *     @type int    $code
	 *     @type int    $subcode
	 *     @type string $message
	 * }
	 */
	public static function extract($response)
	{
		$error = self::errorMember($response);

		$subcode = 0;
		if (isset($error['error_subcode'])) {
			$subcode = (int)$error['error_subcode'];
		} elseif (isset($error['subcode'])) {
			$subcode = (int)$error['subcode'];
		}

		return array(
			'code' => isset($error['code']) ? (int)$error['code'] : 0,
			'subcode' => $subcode,
			'message' => isset($error['message']) && is_string($error['message']) ? $error['message'] : '',
		);
	}

	/**
	 * Narrows any of the response shapes the plugins pass around down to the
	 * error member itself, as an array.
	 *
	 * @param mixed $response Decoded Graph response, or its error member.
	 *
	 * @return array
	 */
	private static function errorMember($response)
	{
		$response = is_object($response) ? (array)$response : $response;

		if (!is_array($response)) {
			return array();
		}

		// A debug_token payload wraps its error one level deeper, under `data`.
		if (!isset($response['error']) && isset($response['data'])) {
			$data = is_object($response['data']) ? (array)$response['data'] : $response['data'];
			if (is_array($data) && isset($data['error'])) {
				$response = $data;
			}
		}

		$error = isset($response['error']) ? $response['error'] : $response;
		$error = is_object($error) ? (array)$error : $error;

		return is_array($error) ? $error : array();
	}
}
