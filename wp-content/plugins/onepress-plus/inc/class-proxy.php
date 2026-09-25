<?php

/**
 * OnePress Proxy
 *
 * Handles request with proxy.
 *
 * @package OnePress
 * @since   2.1.9
 */

defined('ABSPATH') || exit;
if (!class_exists('Onepress_Proxy')) {
	/**
	 * Onepress_Proxy class.
	 */
	class Onepress_Proxy
	{
		/**
		 * Instance.
		 *
		 * @var object
		 */
		protected static $_instance = null;
		/**
		 * Get instance of Onepress_Proxy.
		 *
		 * @since 1.2.6
		 * @return object
		 */
		public static function get_instance()
		{
			if (is_null(self::$_instance)) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}
		/**
		 * Get proxy from cache or direct get and store to cache.
		 *
		 * @since 1.2.6
		 * @return void
		 */
		public function get_proxy()
		{
			$cache_result = get_transient('onepress_free_proxies');
			if (false === $cache_result || empty($cache_result)) {
				$cache_result = $this->get_free_proxy();
				if (is_array($cache_result) && !empty($cache_result)) {
					set_transient('onepress_free_proxies', $cache_result, 2 * HOUR_IN_SECONDS);
				}
			}
			return $cache_result;
		}
		/**
		 * Get list valid proxies.
		 *
		 * @since 1.2.6
		 * @return array
		 */
		public function get_valid_proxies()
		{
			$get_proxies = $this->get_proxy();
			$data        = array();
			if (is_array($get_proxies)) {
				$data = $get_proxies;
			} elseif (is_string($get_proxies) && !empty($get_proxies)) {
				$data = explode(' ', $get_proxies);
			}
			if (is_array($data) && !empty($data)) {
				$data = array_filter(array_map('trim', $data));
			}

			$proxies = array();
			if (is_array($data) && !empty($data)) {
				$proxies = array_unique($data);
				shuffle($proxies);
				$proxies = array_values($proxies);
			}
			return $proxies;
		}
		/**
		 * Get list list free proxies.
		 *
		 * @since 1.2.6
		 * @return array
		 */
		public function get_free_proxy()
		{
			$url     = 'https://free-proxy-list.net/';
			$html    = file_get_html($url);
			$proxies = array();
			if (is_object($html) && method_exists($html, 'find')) {
				try {
					$tbody = $html->find('#proxylisttable tbody', 0);
					if (is_object($tbody)) {
						foreach ($tbody->find('tr') as $tr) {
							$proxy = '';
							if (is_object($tr) && $tr->find('td', 0) && $tr->find('td', 0)->plaintext) {
								$proxy .= $tr->find('td', 0)->plaintext;

								if ($tr->find('td', 1) && $tr->find('td', 1)->plaintext) {
									$proxy .= ':' . $tr->find('td', 1)->plaintext;
								}
							}
							if (!empty($proxy)) {
								$proxies[] = $proxy;
							}
						}
					}
				} catch (Exception $e) {
					$proxies = array();
				}
			}
			if (!empty($proxies)) {
				$proxies = array_unique($proxies);
			}
			return $proxies;
		}
		/**
		 * Get proxy from cache or direct get and store to cache.
		 *
		 * @since 1.2.6
		 * @return array
		 */
		public function get_random_useragent()
		{
			$agent = array(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
				'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
				'Mozilla/5.0 (Linux; Android 8.0.0;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.96 Mobile Safari/537.36',
				'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/78.0.3904.84 Mobile/15E148 Safari/605.1',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
				'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
				'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
				'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
				'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
				'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.83 Safari/537.1',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
				'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
				'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
				'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
				'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
				'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
				'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
				'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
				'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
				'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/74.0.3729.157 Safari/537.36',
				'Mozilla/5.0 (Linux; Android 7.1.2; AFTMM Build/NS6264; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/59.0.3071.125 Mobile Safari/537.36',
				'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
			);
			shuffle($agent);
			return $agent[0];
		}
		/**
		 * Get proxy from cache or direct get and store to cache.
		 *
		 * @since 1.2.6
		 * @param string $url target url.
		 * @param string $proxy a proxy string.
		 * @return string
		 */
		public function get_html_content($url, $proxy = '')
		{
			$header     = array(
				'Accept: text/xml,application/xml,application/xhtml+xml, text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5',
				'Cache-Control: max-age=0',
				'Connection: keep-alive',
				'Keep-Alive: 300',
				'Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7',
				'Accept-Language: en-us,en;q=0.5',
			);
			$user_agent = $this->get_random_useragent();
			$options    = array(
				CURLOPT_PROXY           => $proxy,
				CURLOPT_HTTPPROXYTUNNEL => 0,
				CURLOPT_REFERER         => 'https://www.google.com',
				CURLOPT_FOLLOWLOCATION  => true,
				CURLOPT_RETURNTRANSFER  => true,
				CURLOPT_USERAGENT       => $user_agent,
				CURLOPT_CONNECTTIMEOUT  => 20,
				CURLOPT_TIMEOUT         => 20,
				CURLOPT_MAXREDIRS       => 10,
				CURLOPT_HEADER          => true,
				CURLOPT_HTTPHEADER      => $header,
				CURLOPT_ENCODING        => 'gzip,deflate',
			);
			$ch         = curl_init($url);
			curl_setopt_array($ch, $options);
			$html = curl_exec($ch);
			curl_close($ch);
			return $html;
		}

		/**
		 * Get proxy from cache or direct get and store to cache.
		 *
		 * @since 1.2.6
		 * @param string $item_url target url.
		 * @return string
		 */
		public function get_html($item_url = '')
		{
			if (function_exists('set_time_limit')) {
				set_time_limit(0);
			}
			$try_count  = 0;
			$count_fail = 0;
			do {
				$proxies = $this->get_valid_proxies();
				$proxy   = (is_array($proxies) && !empty($proxies)) ? $proxies[0] : false;
				try {
					if ($count_fail > 5) {
						break;
					}
					if (0 === $count_fail) {
						$proxy = false;
					}
					$html = $this->get_html_content($item_url, $proxy);

					if (!empty($html)) {
						$dom = new simple_html_dom();
						$dom->load($html, true, false);
						if (is_object($dom) && method_exists($dom, 'find') && $dom->find('title', 0)) {
							return $html;
						} else {
							$count_fail++;
						}
					}
					$try_count++;
					if ($try_count >= count($proxies) || !isset($proxies[$try_count])) {
						break;
					}
					$proxy = $proxies[$try_count];
				} catch (Exception $e) {
					$try_count++;
					if ($try_count >= count($proxies) || !isset($proxies[$try_count])) {
						break;
					}
					$proxy = $proxies[$try_count];
				}
			} while (true);

			return false;
		}
	}
}
if (!function_exists('onepress_proxy')) {
	/**
	 * Get instagram data via proxy
	 *
	 * @since 1.2.6
	 * @return object
	 */
	function onepress_proxy()
	{
		return Onepress_Proxy::get_instance();
	}
}



class OnePress_Instagram_Data_Encryption
{

	/**
	 * Key to use for encryption.
	 *
	 * @since 2.9.4/5.12.4
	 * @var string
	 */
	private $key;

	/**
	 * Salt to use for encryption.
	 *
	 * @since 2.9.4/5.12.4
	 * @var string
	 */
	private $salt;

	/**
	 * Constructor.
	 *
	 * @since 2.9.4/5.12.4
	 */
	public function __construct($remote = array())
	{
		if (!empty($remote)) {
			$this->key  = $remote['key'];
			$this->salt = $remote['salt'];
		} else {
			$this->key  = $this->get_default_key();
			$this->salt = $this->get_default_salt();
		}
	}


	/**
	 * Decrypts a value.
	 *
	 * If a user-based key is set, that key is used. Otherwise the default key is used.
	 *
	 * @since 2.9.4/5.12.4
	 *
	 * @param string $raw_value Value to decrypt.
	 * @return string|bool Decrypted value, or false on failure.
	 */
	public function decrypt($raw_value)
	{
		if (!extension_loaded('openssl')) {
			return $raw_value;
		}

		$raw_value = base64_decode($raw_value, true);

		$method = 'aes-256-ctr';
		$ivlen  = openssl_cipher_iv_length($method);
		$iv     = substr($raw_value, 0, $ivlen);

		$raw_value = substr($raw_value, $ivlen);

		$value = openssl_decrypt($raw_value, $method, $this->key, 0, $iv);
		if (!$value || substr($value, -strlen($this->salt)) !== $this->salt) {
			return false;
		}

		return substr($value, 0, -strlen($this->salt));
	}


	/**
	 * Gets the default encryption key to use.
	 *
	 * @since 2.9.4/5.12.4
	 *
	 * @return string Default (not user-based) encryption key.
	 */
	private function get_default_key()
	{
		if (defined('SBI_ENCRYPTION_KEY') && '' !== SBI_ENCRYPTION_KEY) {
			return SBI_ENCRYPTION_KEY;
		}

		if (defined('LOGGED_IN_KEY') && '' !== LOGGED_IN_KEY) {
			return LOGGED_IN_KEY;
		}

		// If this is reached, you're either not on a live site or have a serious security issue.
		return 'das-ist-kein-geheimer-schluessel';
	}

	/**
	 * Gets the default encryption salt to use.
	 *
	 * @since 2.9.4/5.12.4
	 *
	 * @return string Encryption salt.
	 */
	private function get_default_salt()
	{
		if (defined('SBI_ENCRYPTION_SALT') && '' !== SBI_ENCRYPTION_SALT) {
			return SBI_ENCRYPTION_SALT;
		}

		if (defined('LOGGED_IN_SALT') && '' !== LOGGED_IN_SALT) {
			return LOGGED_IN_SALT;
		}

		// If this is reached, you're either not on a live site or have a serious security issue.
		return 'das-ist-kein-geheimes-salz';
	}
}



if (!class_exists('Onepress_Plus_Instagram')) {
	class Onepress_Plus_Instagram
	{
		protected static $_instance = null;
		public $instagram_url       = 'https://www.instagram.com';
		public $api_url             = 'https://graph.instagram.com';
		static $nonce_name = 'onepress_instagram_settings';

		public static function get_instance()
		{
			if (is_null(self::$_instance)) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}

		public function __construct()
		{
			add_action('wp_loaded', array($this, 'save_token'), 1);
			add_action('init', array($this, 'remove_connected_user'), PHP_INT_MAX);
			add_action('customize_controls_enqueue_scripts', array($this, 'enqueue'), 99);
			add_action('pm_refresh_instag_token', [$this, 'refresh_token'], 10, 2);
		}


		function refresh_token()
		{
			$gallery_mod  = get_theme_mod('onepress_gallery_source', '');
			if ('instagram' != $gallery_mod) {
				return;
			}

			$token = $this->get_access_token();
			if (!$token) {
				return;
			}
			$url = add_query_arg([
				'grant_type' => 'ig_refresh_token',
				'access_token' => $token,
			], 'https://graph.instagram.com/refresh_access_token');

			$remote = wp_remote_get($url);
			$code = wp_remote_retrieve_response_code($remote);
			$data = '';
			if (200 == $code) {
				$data = json_decode(wp_remote_retrieve_body($remote), true);
				update_option('pm_instagram_access_token', $data['access_token']);
			}

			wp_schedule_single_event(time() + 100 + 5 * DAY_IN_SECONDS, 'pm_refresh_instag_token');
			die();
		}

		static function generateRandomString($length = 10)
		{
			return substr(str_shuffle(str_repeat($x = 'abcdefghijklmnopqrstuvwxyz', ceil($length / strlen($x)))), 1, $length);
		}

		static function get_api_connect_uri()
		{

			$instagram_url = 'https://www.instagram.com';

			$admin_url_state = admin_url('admin.php?page=sbi-settings');
			$email = get_option('pm_instag_fake_email');
			if (!$email) {
				$domain = str_ireplace('www.', '', parse_url(home_url('/'), PHP_URL_HOST));
				$email = self::generateRandomString(6) . '@' . $domain;
				update_option('pm_instag_fake_email', $email);
			}

			$url = add_query_arg([
				'client_id' => '423965861585747',
				'redirect_uri' => "https://connect.smashballoon.com/auth/ig/instagram-basic-display-redirect.php",
				'response_type' => 'code',
				'scope' => 'user_profile,user_media',
				'state' => urlencode("{'{url={'{url={$admin_url_state}}'},user={$email},opt=out}'}"),

			], "{$instagram_url}/oauth/authorize");

			return $url;

			// https://www.instagram.com/oauth/authorize?client_id=423965861585747&redirect_uri=https://connect.smashballoon.com/auth/ig/instagram-basic-display-redirect.php&response_type=code&scope=user_profile,user_media&state=%7B%27%7Burl=%7B%27%7Burl=http://onepress.local/wp-admin/admin.php?page=sbi-feed-builder%7D%27%7D,user=dev-email@flywheel.local,opt=out%7D%27%7D

			/*
			$admin_url = home_url('/');
			$nonce = wp_create_nonce(self::$nonce_name);

			$url = add_query_arg([
				'app_id' => '504270170253170',
				'redirect_uri' => 'https://socialfeed.quadlayers.com/instagram.php',
				'response_type' => 'code',
				'scope' => 'user_profile,user_media',
				'state' => $admin_url,

			], "{$instagram_url}/oauth/authorize");

			return $url;
			*/
		}


		public function enqueue()
		{
			wp_enqueue_style('onepress-plus-customizer', ONEPRESS_PLUS_URL . 'build/css/customizer.css');
		}

		function get_setting_number_items()
		{
			$number_item = absint(get_theme_mod('onepress_g_number', 10));
			if (!$number_item) {
				$number_item = 10;
			}
			return $number_item;
		}

		function remove_connected_user()
		{
			if (isset($_GET['pm_action']) && 'remove_inst_account' == $_GET['pm_action']) {
				$wp_nonce = (isset($_GET['_wp_nonce']) && !empty($_GET['_wp_nonce'])) ? $_GET['_wp_nonce'] : '';
				if (wp_verify_nonce($wp_nonce, 'remove_inst_account')) {
					$current_user_profile = get_option('pm_instagram_current_user_profile', array());
					if (is_array($current_user_profile) && isset($current_user_profile['username'])) {
						$username  = $current_user_profile['username'];
						$username  = strtolower($username);
						$username  = str_replace('@', '', $username);
						$cache_key = 'onepress_plus_itg_' . $username;
						set_theme_mod('onepress_gallery_source_instagram', '');
						$number_item            = $this->get_setting_number_items();
						$gallery_data_cache_key = 'onepress_gallery_instagram_' . $username . $number_item;

						delete_transient($cache_key);
						delete_transient($gallery_data_cache_key);
					}
					delete_option('pm_instagram_current_user_profile');
					delete_option('pm_instagram_access_token');
					$redirect_to_url = admin_url('/customize.php?autofocus[panel]=onepress_gallery&autofocus[section]=onepress_gallery_content');
					wp_redirect($redirect_to_url);
					exit;
				}
			}
		}

		function is_insta_gallery_activated()
		{
			$active_plugins = get_option('active_plugins');
			if (in_array('insta-gallery/insta-gallery.php', $active_plugins)) {
				return true;
			}
			return false;
		}

		function get_access_token()
		{
			if (!$this->is_insta_gallery_activated()) {
				return get_option('pm_instagram_access_token', '');
			} else {
				return get_option('insta_gallery_token', '');
			}
		}

		static function sanitize_alphanumeric_and_equals($value)
		{
			return preg_replace('/[^A-Za-z0-9=]/', '', $value);
		}

		function maybe_decrypt($maybe_dirty)
		{
			$encryption = new OnePress_Instagram_Data_Encryption();

			$decrypted = $encryption->decrypt($maybe_dirty);
			if ($decrypted) {
				$maybe_dirty = $decrypted;
			}
			if (substr_count($maybe_dirty, '.') < 3) {
				return str_replace('634hgdf83hjdj2', '', $maybe_dirty);
			}

			$parts = explode('.', trim($maybe_dirty));
			$last_part = $parts[2] . $parts[3];
			$cleaned = $parts[0] . '.' . base64_decode($parts[1]) . '.' . base64_decode($last_part);

			return $cleaned;
		}

		/**
		 * 
		 *
		 * @return void
		 */
		function save_token()
		{

			if (!current_user_can('customize')) {
				return;
			}

			if (isset($_GET['page']) && 'sbi-settings' == $_GET['page']) {
				$access_token = self::sanitize_alphanumeric_and_equals($_GET['sbi_access_token']);
				$access_token = $this->maybe_decrypt($access_token);
				update_option('pm_instagram_access_token', $access_token);
				$current_user_profile = $this->get_current_user_profile();
				if (is_array($current_user_profile) && isset($current_user_profile['username'])) {
					set_theme_mod('onepress_gallery_source', 'instagram');
					set_theme_mod('onepress_gallery_source_instagram', $current_user_profile['username']);
				}
				update_option('pm_instagram_current_user_profile', $current_user_profile);

				if (!wp_next_scheduled('pm_refresh_instag_token')) {
					wp_schedule_single_event(time() + 100 + 5 * DAY_IN_SECONDS, 'pm_refresh_instag_token');
				}

				$redirect_to_url = admin_url('/customize.php?autofocus[panel]=onepress_gallery&autofocus[section]=onepress_gallery_content');
				wp_redirect($redirect_to_url);
				exit;

				if (!defined('SBI_PLUGIN_NAME')) {
				}
			}



			if (!$this->is_insta_gallery_activated() && isset($_GET['page']) && 'qligg_account' == $_GET['page']) {

				$access_token = '';
				if (isset($_GET['accounts']) && is_array($_GET['accounts']) && !empty($_GET['accounts'])) {
					$accounts = wp_unslash($_GET['accounts']);
					foreach ($accounts as $account) {
						if (isset($account['access_token']) && !empty($account['access_token'])) {
							$access_token = $account['access_token'];
						}
					}
				}

				update_option('pm_instagram_access_token', $access_token);
				$current_user_profile = $this->get_current_user_profile();
				if (is_array($current_user_profile) && isset($current_user_profile['username'])) {
					set_theme_mod('onepress_gallery_source', 'instagram');
					set_theme_mod('onepress_gallery_source_instagram', $current_user_profile['username']);
				}
				update_option('pm_instagram_current_user_profile', $current_user_profile);

				if (!wp_next_scheduled('pm_refresh_instag_token')) {
					wp_schedule_single_event(time() + 100 + 5 * DAY_IN_SECONDS, 'pm_refresh_instag_token');
				}

				$redirect_to_url = admin_url('/customize.php?autofocus[panel]=onepress_gallery&autofocus[section]=onepress_gallery_content');
				wp_redirect($redirect_to_url);
				exit;
			}
		}

		public function get_user_profile($access_token)
		{

			$args = array(
				'timeout'     => 180,
				'httpversion' => '1.1',
			);
			$url  = "{$this->api_url}/me";

			$request_args = array(
				'fields'       => 'id,media_count,username,account_type',
				'access_token' => $access_token,
			);
			$url          = add_query_arg($request_args, trailingslashit($url));
			$response     = wp_remote_get($url, $args);
			if (is_array($response) && !is_wp_error($response)) {
				$body = (isset($response['body']) && !empty($response['body'])) ? json_decode($response['body'], true) : array();
				if (!empty($body)) {
					return $body;
				}
			}
			return false;
		}

		public function get_current_user_profile()
		{
			$access_token = $this->get_access_token();
			$user_data    = array();
			if (!empty($access_token)) {
				$user_profile = $this->get_user_profile($access_token);
				if (!empty($user_profile)) {
					$user_data = $user_profile;
				}
			}
			return $user_data;
		}

		public function get_user_items($access_token, $limit = 100)
		{

			$profile =  get_option('pm_instagram_current_user_profile', []);
			$profile = wp_parse_args($profile, [
				'username' => '',
			]);

			$args = array(
				'timeout'     => 180,
				'httpversion' => '1.1',
			);

			$request_args = array(
				'fields'       => 'media_url,thumbnail_url,caption,id,media_type,timestamp,username,comments_count,like_count,permalink,children{media_url,id,media_type,timestamp,permalink,thumbnail_url}',
				'limit'        => $limit,
				'access_token' => $access_token,
			);

			$url      = "https://graph.instagram.com/{$profile['id']}/media";
			$url      = add_query_arg($request_args, trailingslashit($url));
			$response = wp_remote_get($url, $args);

			if (is_array($response) && !is_wp_error($response)) {
				$body = (isset($response['body']) && !empty($response['body'])) ? json_decode($response['body'], true) : array();
				if (!empty($body) && isset($body['data']) && !empty($body['data'])) {
					return $body['data'];
				}
			}
			return false;
		}

		public function get_current_user_items($limit = 100)
		{
			$access_token = $this->get_access_token();
			$user_items   = array();
			if (!empty($access_token)) {
				$get_user_items = $this->get_user_items($access_token, $limit);
				if (!empty($get_user_items)) {
					$user_items = $get_user_items;
				}
			}
			return $user_items;
		}

		public function get_current_user_items_formatted($limit = 100)
		{
			$instagram  = array();
			$user_items = $this->get_current_user_items($limit);
			if (is_array($user_items) && !empty($user_items)) {
				foreach ($user_items as $item) {
					if (isset($item['media_type']) && 'IMAGE' == $item['media_type'] && isset($item['permalink']) && !empty($item['permalink'])) {
						$instagram[] = array(
							'title'     => (isset($item['caption']) && !empty($item['caption'])) ? trim($item['caption']) : '',
							'link'      => (isset($item['permalink']) && !empty($item['permalink'])) ? $item['permalink'] : '',
							'thumbnail' => (isset($item['media_url']) && !empty($item['media_url'])) ? trim($item['media_url']) : '',
							'small'     => (isset($item['media_url']) && !empty($item['media_url'])) ? trim($item['media_url']) : '',
							'large'     => (isset($item['media_url']) && !empty($item['media_url'])) ? trim($item['media_url']) : '',
							'full'      => (isset($item['media_url']) && !empty($item['media_url'])) ? trim($item['media_url']) : '',
							'type'      => $item['media_type'],
						);
					}
				}
			}
			return $instagram;
		}
	}
}

if (!function_exists('onepress_plus_instagram')) {
	/**
	 *
	 * @return Onepress_Plus_Instagram
	 */
	function onepress_plus_instagram()
	{
		return Onepress_Plus_Instagram::get_instance();
	}
}
onepress_plus_instagram();
