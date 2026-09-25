<?php

if (!defined('ABSPATH')) {
	die('-1');
}

/**
 * Class SB_Instagram_Token_Refresher
 *
 * Various methods for efficiently refreshing basic display access
 * tokens which expire every 60 days if not refreshed.
 *
 * @since 2.2/5.3
 */
class SB_Instagram_Token_Refresher
{
	/**
	 * @var array
	 */
	private $connected_account;

	/**
	 * @var array
	 */
	private $report;

	public function __construct($connected_account)
	{
		$this->connected_account = $connected_account;
		$this->report = array();
	}

	public function get_report()
	{
		return $this->report;
	}

	/**
	 * Returns true if the minimum time has passed since the last
	 * successfull access token refresh and the minimum time has passed
	 * since the last attempt.
	 *
	 * @return bool
	 */
	public function should_attempt_refresh()
	{
		if (self::refresh_time_has_passed_threshold($this->connected_account)) {
			if (self::minimum_time_interval_since_last_attempt_has_passed($this->connected_account)) {
				$this->report['should_do_update'] = true;
				$this->report['reason'] = '';
				return true;
			} else {
				$this->report['should_do_update'] = false;
				$this->report['reason'] = 'has not been enough time since last attempt';
			}
		} else {
			$this->report['should_do_update'] = false;
			$this->report['reason'] = 'token expiration date not close enough';
		}

		return false;
	}

	/**
	 * The plugin will attempt to refresh the token well
	 * before it expires. This function determines if the
	 * minimum amount of time has passed before the token
	 * can be refreshed
	 *
	 * @param $connected_account
	 *
	 * @return bool
	 */
	public static function refresh_time_has_passed_threshold($connected_account)
	{
		$expiration_timestamp = isset($connected_account['expires_timestamp']) ? $connected_account['expires_timestamp'] : time();
		$current_time = sbi_get_current_timestamp();

		$refresh_threshold = $expiration_timestamp - SBI_REFRESH_THRESHOLD_OFFSET;

		if ($refresh_threshold < $current_time) {
			return true;
		}
		return false;
	}

	/**
	 * Instagram will automatically reject API calls if
	 * done too frequently. This method returns true if
	 * there has been a minimum amount of time since the last
	 * API connection was attemplted
	 *
	 * @param $connected_account
	 *
	 * @return bool
	 */
	public static function minimum_time_interval_since_last_attempt_has_passed($connected_account)
	{
		$last_attempt = isset($connected_account['last_refresh_attempt']) ? (int)$connected_account['last_refresh_attempt'] : 0;
		$current_time = sbi_get_current_timestamp();
		if ($current_time > $last_attempt + SBI_MINIMUM_INTERVAL) {
			return true;
		}
		return false;
	}

	/**
	 * Attempts to refresh the token by connecting to the
	 * Instagram API. Logs information about the error if unsuccessful.
	 *
	 * @return bool
	 */
	public function attempt_token_refresh()
	{
		$this->update_last_attempt_timestamp();

		$connection = new SB_Instagram_API_Connect($this->connected_account, 'access_token', array());

		$connection->connect();

		if (!$connection->is_wp_error() && !$connection->is_instagram_error()) {
			$access_token_data = $connection->get_data();

			if (!empty($access_token_data) && !empty($access_token_data['expires_in'])) {
				$this->report['did_update'] = true;
				$this->add_renewal_data($access_token_data);

				return true;
			} else {
				$this->report['did_update'] = false;
				$this->report['reason'] = 'successful connection but no data returned';
			}
		} else {
			$this->report['did_update'] = false;
			$this->report['reason'] = 'could not connect to Instagram';
			$this->report['error_log'] = $connection;
		}

		$this->record_refresh_failure();

		return false;
	}

	/**
	 * Records when the refresh attempt was made, before it is made,
	 * so repeated attempts are throttled even when they fail.
	 */
	public function update_last_attempt_timestamp()
	{
		$this->update_refresh_state(array('last_refresh_attempt' => sbi_get_current_timestamp()));
	}

	/**
	 * Updates data related to the renewed access token
	 * for a connected account and saves it in the database.
	 *
	 * The successful-refresh timestamp and the token data are saved
	 * in a single database write so a partial store can't record a
	 * success without the rotated token.
	 *
	 * @param $token_data
	 */
	private function add_renewal_data($token_data)
	{
		$expires_in = $token_data['expires_in'];
		$expires_timestamp = sbi_get_current_timestamp() + $expires_in;

		$to_update = array(
			'access_token' => $token_data['access_token'],
			'expires' => date('Y-m-d H:i:s', $expires_timestamp),
		);
		$this->update_refresh_state(
			array(
				'last_refresh_success' => sbi_get_current_timestamp(),
				'refresh_failure_count' => 0,
				'last_refresh_error' => false,
			),
			$to_update
		);
	}

	/**
	 * Records a failed refresh attempt so repeated failures are
	 * distinguishable from healthy refreshes when inspecting stored state.
	 */
	private function record_refresh_failure()
	{
		$info = $this->get_source_info();
		$failure_count = isset($info['refresh_failure_count']) ? (int)$info['refresh_failure_count'] + 1 : 1;

		$this->update_refresh_state(
			array(
				'refresh_failure_count' => $failure_count,
				'last_refresh_error' => array(
					'time' => sbi_get_current_timestamp(),
					'reason' => isset($this->report['reason']) ? $this->report['reason'] : '',
					'code' => $this->get_last_error_code(),
				),
			)
		);
	}

	/**
	 * Returns the connected account's stored info data as an array,
	 * an empty array when none is stored, false when a non-empty blob
	 * can't be read (an unreadable blob must never be overwritten),
	 * or null when the source is not in the database.
	 *
	 * @return array|false|null
	 */
	private function get_source_info()
	{
		$results = InstagramFeed\Builder\SBI_Db::source_query(array('id' => $this->connected_account['user_id']));

		if (empty($results)) {
			return null;
		}

		if (empty($results[0]['info'])) {
			return array();
		}

		$encryption = new SB_Instagram_Data_Encryption();
		$decrypted = $encryption->decrypt($results[0]['info']);
		// A legacy blob may be stored as plain JSON, which decrypt() rejects.
		$raw = !empty($decrypted) ? $decrypted : $results[0]['info'];
		$info = json_decode($raw, true);

		return is_array($info) ? $info : false;
	}

	/**
	 * Merges refresh-health values into the connected account's stored
	 * info data and saves it, along with any column changes, in a single
	 * database write. Setting a value to false removes the key.
	 *
	 * A no-op when the source is not in the database yet (a refresh
	 * attempted at connect time), matching how updates behaved before
	 * refresh state was tracked. When the stored info blob can't be
	 * read, it is left untouched — column changes (a rotated token and
	 * its expiry) are still saved so a successful refresh is never lost,
	 * and the row's last_updated still advances so the attempt throttle
	 * keeps working.
	 *
	 * @param array $refresh_state Refresh-health keys to merge into the info data.
	 * @param array $columns Source table column values to save in the same write.
	 */
	private function update_refresh_state($refresh_state, $columns = array())
	{
		$info = $this->get_source_info();

		if (is_null($info)) {
			return;
		}

		$to_update = array_merge(
			$columns,
			array(
				'id' => $this->connected_account['user_id'],
			)
		);

		if (false !== $info) {
			foreach ($refresh_state as $key => $value) {
				if (false === $value) {
					unset($info[$key]);
				} else {
					$info[$key] = $value;
				}
			}
			$to_update['info'] = $info;
		}

		InstagramFeed\Builder\SBI_Source::update_or_insert($to_update);
	}

	/**
	 * Helps determine if an access token is from a private
	 * account which can't be refreshed
	 *
	 * @return bool
	 *
	 * @since 2.4.7/5.7.1
	 */
	public function get_last_error_code()
	{
		if (isset($this->report['error_log']) && !is_wp_error($this->report['error_log'])) {
			$error = $this->report['error_log']->get_data();
			return $error['error']['code'];
		}
		return false;
	}
}
