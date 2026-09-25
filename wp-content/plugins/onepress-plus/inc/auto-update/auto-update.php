<?php

// this is the URL our updater / license checker pings. This should be the URL of the site with EDD installed
define('EDD_ONEPRESS_PLUS_STORE_URL', 'https://www.famethemes.com/'); // you should use your own CONSTANT name, and be sure to replace it throughout this file

// the name of your product. This should match the download name in EDD exactly
define('EDD_ONEPRESS_PLUS_ITEM_NAME', 'OnePress Plus'); // you should use your own CONSTANT name, and be sure to replace it throughout this file


if (!class_exists('FT_Base_EDD_SL_Plugin_Updater')) {
	// load our custom updater
	include dirname(__FILE__) . '/EDD_SL_Plugin_Updater.php';
}
if (!class_exists('FT_EDD_SL_Plugin_Updater')) {
	include dirname(__FILE__) . '/plugin-updater.php';
}


class OnePress_Plus_Auto_Update
{

	protected $store_url = 'https://www.famethemes.com/';
	static $download_id = 8537;
	protected $item_name = 'OnePress Plus';
	protected $error = null;

	function __construct()
	{


		add_action('onepress_admin_more_tabs', array($this, 'add_theme_import_tab'));
		add_action('onepress_more_tabs_details', array($this, 'import_tab_content'));
		add_action('init', array($this, 'run_plugin_updater'), 0);
		add_action('admin_notices', array($this, 'site_update_message'), 0);

		add_action('admin_init', array($this, 'admin_init'), 0);

		add_action('wp_ajax_onepress_plus_dismiss_notice', array($this, 'dismiss_notice'), 0);
	}

	function dismiss_notice()
	{
		$expires = 10 * 24 * HOUR_IN_SECONDS;
		$v = sanitize_text_field($_REQUEST['version']);
		set_transient('onepress_plus_dismiss_notice', $v, $expires);
		wp_send_json_success(true);
	}

	function site_update_message()
	{
		global $pagenow;
		if ('plugins.php' == $pagenow || 'update-core.php' == $pagenow) {
			return;
		}

		$update_cache = get_site_transient('update_plugins');
		if (!isset($update_cache->response)) {
			return;
		}
		// var_dump( $update_cache );
		if (!is_array($update_cache->response)) {
			return;
		}
		$current_plugin = 'onepress-plus/onepress-plus.php';
		if (!isset($update_cache->response[$current_plugin])) {
			return;
		}
		$args = $this->notices();

		$version_info = $update_cache->response[$current_plugin];
		$current_plugin_info = get_plugin_data(ONEPRESS_PLUS_PATH . 'onepress-plus.php', false, false);
		if (!$current_plugin_info) {
			return;
		}

		if ($v = get_transient('onepress_plus_dismiss_notice')) {
			if ($version_info->new_version == $v) {
				return;
			}
		}

		if (!version_compare($current_plugin_info['Version'], $version_info->new_version, '<')) {
			return;
		}

		if (!$args['status']) {
			add_thickbox();

?>
			<div id="onepress-plus-update-notice" class="notice notice-warning is-dismissible">
				<p>
					<?php
					$enter_key_url = self_admin_url('themes.php?page=ft_onepress&tab=auto_update');
					$changelog_link = self_admin_url('index.php?edd_sl_action=view_plugin_changelog&plugin=' . $current_plugin . '&slug=' . dirname($current_plugin) . '&TB_iframe=true&width=772&height=911');

					switch ($args['license_status']) {
						case 'expired':
							$license_key = get_option('edd_onepress_plus_license_key');
							$renewal_url = 'https://www.famethemes.com/checkout/?edd_license_key=' . $license_key . '&download_id=' . self::$download_id;
							printf(
								__('There is a new version of %1$s available. %2$s.'),
								$version_info->name,
								'<a target="_blank" class="thickbox" href="' . esc_url($changelog_link) . '">' . sprintf(__('View version %1$s details', 'onepress-plus'), $version_info->new_version) . '</a>'
							);

							echo '<br/>';
							printf(
								__('<strong>Your License Has Expired</strong> — Updates are only available to those with an active license. %2$s or %3$s.'),
								$version_info->name,
								'<strong><a target="_blank" href="' . esc_url($renewal_url) . '">' . __('Click here to Renewal', 'onepress-plus') . '</a></strong>',
								'<a target="_blank"  href="' . esc_url($enter_key_url) . '">' . __('Check my license again ', 'onepress-plus') . '</a>'
							);

							break;
						default:
							printf(
								__('There is a new version of %1$s available. %2$s. Automatic update is unavailable for this plugin. %3$s'),
								$version_info->name,
								'<a target="_blank" class="thickbox" href="' . esc_url($changelog_link) . '">' . sprintf(__('View version %1$s details', 'onepress-plus'), $version_info->new_version) . '</a>',
								'<strong><a target="_blank" href="' . esc_url($enter_key_url) . '">' . __('Enter valid license key for automatic updates', 'onepress-plus') . '</a></strong>'
							);
					}

					?>
				</p>
				<a href="" class="notice-dismiss" style="text-decoration: none;"></a>
			</div>
			<script type="text/javascript">
				jQuery(document).ready(function($) {
					$('#onepress-plus-update-notice').on('click', '.notice-dismiss', function() {
						$.get(ajaxurl, {
							action: 'onepress_plus_dismiss_notice',
							'version': <?php echo json_encode($version_info->new_version); ?>
						});
					});
				});
			</script>
		<?php
		}
	}

	function add_theme_import_tab()
	{
		// Check for current viewing tab
		$tab = null;
		if (isset($_GET['tab'])) {
			$tab = $_GET['tab'];
		} else {
			$tab = null;
		}
		?>
		<a href="?page=ft_onepress&tab=auto_update" class="nav-tab<?php echo $tab == 'auto_update' ? ' nav-tab-active' : null; ?>"><?php esc_html_e('OnePress Plus License', 'onepress-plus'); ?></a>
	<?php
	}

	static function notices($error = null)
	{
		$license = get_option('edd_onepress_plus_license_key');
		$data = get_option('edd_onepress_plus_license_data');
		$status  = $can_action = false;
		$license_status = $license ? false : 'enter_license';
		$license_id = null;
		if (!$license) {
			$message = '<p class="description">' . esc_html__('Please enter your License key.', 'onepress-plus') . '</p>';
		} else {
			if (is_object($data) && property_exists($data, 'license')) {


				if ($data->license == 'valid') {

					if ($data->expires == 'lifetime') {
						$message = '<p class="description" style="color: green;">' . esc_html__('License key is active. Expires: Lifetime', 'onepress-plus') . '</p>';
					} else {

						$expired = strtotime($data->expires);
						$now = current_time('timestamp');

						// License is valid but expired.
						if ($expired < $now) {
							$message = '<p class="description" style="color: red;">' . sprintf(esc_html__('Your License key is expired. Expires %s.', 'onepress-plus'), date_i18n(get_option('date_format'), strtotime($data->expires))) . '</p>';
							$message .= '<p>' . esc_html__('This license must be renewed before it can be upgraded.', 'onepress-plus') . ' <a target="_blank" href="' . esc_url('https://www.famethemes.com/checkout/?edd_license_key=' . $license . '') . '">' . esc_html__('Click here to Renewal', 'onepress-plus') . '</a> </p>';
							$license_status = 'expired';
						} else {
							$status = true;
							$license_status = 'active';
							if ($data->activations_left > 0) {
								$message = '<p class="description" style="color: green;">' . sprintf(esc_html__('License key is active. Expires %s.', 'onepress-plus'), date_i18n(get_option('date_format'), strtotime($data->expires))) . '</p>';
							} else {
								$message = '<p class="description" style="color: green;">' . sprintf(esc_html__('License key is active. Activations: %1$s/%2$s.', 'onepress-plus'), $data->site_count, $data->license_limit) . '</p>';
								$message .= '<p class="description" style="color: green;">' . sprintf(esc_html__('Expires %s.', 'onepress-plus'), date_i18n(get_option('date_format'), strtotime($data->expires))) . '</p>';
							}
						}
					}
				} elseif ($data->license == 'deactivated') {
					$can_action = true;
					$license_status = 'deactivated';
					$message = '<p class="description" style="color: red;">' . esc_html__('Your License is deactivated.', 'onepress-plus') . '</p>';
				} else { // invalid

					if ($data->error == 'expired') {
						$license_status = 'expired';
						$message = '<p class="description" style="color: red;">' . sprintf(esc_html__('Your License key is expired. Expires %s.', 'onepress-plus'), date_i18n(get_option('date_format'), strtotime($data->expires))) . '</p>';
						$message .= '<p>' . esc_html__('This license must be renewed before it can be upgraded.', 'onepress-plus') . ' <a target="_blank" href="' . esc_url('https://www.famethemes.com/checkout/?edd_license_key=' . $license . '') . '">' . esc_html__('Click here to Renewal', 'onepress-plus') . '</a> </p>';
					} elseif ($data->error != 'invalid' && $data->error != 'missing' && ($data->license_limit == 1 || $data->error == 'no_activations_left')) {
						$license_status = 'invalid';
						$message = '<p class="description" style="color: red;">' . sprintf(esc_html__('Your license is limited. Activations: %1$s/%2$s.', 'onepress-plus'), $data->site_count, $data->max_sites) . '</p>';
					} else {
						$license_status = 'invalid';
						$message = '<p class="description" style="color: red;">' . esc_html__('Your License key is invalid.', 'onepress-plus') . '</p>';
					}
				}
			} else {

				if (!empty($error)) {
					$license_status = 'not_connect';
					$message = '<div style="color: red;"><p>' . __('Could not connect to FameThemes server.', 'onepress-plus') . '</p>';
					if (is_array($error)) {
						foreach ($error as $msg) {
							$message .= '<div>' . $msg . '</div>';
						}
					} else {
						$message = '<p class="description" style="color: red;">' . $message . '</p>';
					}
					$message .= '</div>';
				} else {
					$license_status = 'invalid';
					$message = '<p class="description" style="color: red;">' . __('Your License key is invalid.', 'onepress-plus') . '</p>';
				}
			}
		}
		return array(
			'can_action'        => $can_action,
			'status'            => $status,
			'message'           => $message,
			'license'           => $license,
			'license_status'    => $license_status,
		);
	}

	function import_tab_content()
	{

		$tab = null;
		if (isset($_GET['tab'])) {
			$tab = $_GET['tab'];
		} else {
			$tab = null;
		}

		if ($tab != 'auto_update') {
			return;
		}


		$notices = self::notices($this->error);
		extract($notices);

	?>
		<form method="post" action="?page=ft_onepress&tab=auto_update">
			
			<table class="form-table">
				<tbody>
					<tr valign="top">
						<th scope="row" valign="top">
							<?php _e('License Key', 'onepress-plus'); ?>
						</th>
						<td>
							<input id="edd_onepress_plus_license_key" name="edd_onepress_plus_license_key" type="password" placeholder="<?php echo esc_attr_e('Enter your license key...') ?>" class="regular-text" value="<?php esc_attr_e($license); ?>" />
							<div class="license-status-message">
								<?php echo $message; ?>
							</div>
							<p><?php _e('Enter your license key to enable automatic theme updates. Find your license key at your FameThemes Dashboard, under Licenses section.', 'onepress-plus'); ?></p>
						</td>
					</tr>
					<?php if ($can_action) { ?>
						<tr valign="top">
							<th scope="row" valign="top">
								<?php _e('Activate License', 'onepress-plus'); ?>
							</th>
							<td>
								<?php if ($status) { ?>
									<input type="submit" class="button-secondary" name="edd_license_deactivate" value="<?php _e('Deactivate License', 'onepress-plus'); ?>" />
								<?php } else { ?>
									<input type="submit" class="button-secondary" name="edd_license_activate" value="<?php _e('Activate License', 'onepress-plus'); ?>" />
								<?php } ?>
								<?php wp_nonce_field('edd_onepress_plus_nonce', 'edd_onepress_plus_nonce'); ?>
							</td>
						</tr>
					<?php } ?>
				</tbody>
			</table>
			<?php

			if (! $can_action) {
				submit_button('', 'primary', 'edd_license_activate');
			}
			?>

		</form>
<?php

		$ip_res = wp_remote_get(
			'https://api.ipify.org?format=json',
			array(
				'timeout' => 30,
				'sslverify' => false,
			)
		);

		$code = wp_remote_retrieve_response_code( $ip_res );
		if ( $code >= 200 && $code < 300 ) {
			$ip_data = json_decode( wp_remote_retrieve_body( $ip_res ), true );

			?>
			<p><?php esc_html_e('Your server IP is:', 'onepres-plus') ?> <strong><?php echo esc_html( $ip_data['ip'] ); ?></strong></p>
			<?php
		}



	}

	function run_plugin_updater()
	{
		// retrieve our license key from the DB
		$license_key = trim(get_option('edd_onepress_plus_license_key'));

		// setup the updater
		$edd_updater = new FT_EDD_SL_Plugin_Updater(
			$this->store_url,
			ONEPRESS_PLUS_PATH . 'onepress-plus.php',
			array(
				'version'   => ONEPRESS_PLUS_VERSION, // current version number
				'license'   => $license_key,        // license key (used get_option above to retrieve from DB)
				'item_name' => $this->item_name,    // name of this plugin
				'item_id'   => self::$download_id,  // name of this plugin
				'author'    => 'FameThemes',  // author of this plugin
			)
		);
	}

	function admin_init()
	{
		if (isset($_REQUEST['edd_onepress_plus_license_key'])) {
			update_option('edd_onepress_plus_license_key', sanitize_text_field($_REQUEST['edd_onepress_plus_license_key']));
		}

		if (isset($_POST['edd_license_activate'])) {
			$this->error = $this->activate();
		}

		if (isset($_POST['edd_license_deactivate'])) {
			$this->error = $this->deactivate_license();
		}
	}


	function bypass_form($html)
	{
		if (! class_exists('DOMDocument')) {
			return;
		}

		$dom = new DOMDocument;
		$dom->loadHTML($html);
		$form = $dom->getElementById('wsidchk-form');
		$action = $form->getAttribute('action');

		$form->setAttribute('action', admin_url('/themes.php?page=ft_onepress&tab=auto_update'));
		$form->setAttribute('method', 'post');
		$input_1 = $dom->createElement('input', '');
		$input_1->setAttribute('name', 'cl_to');
		$input_1->setAttribute('value', $action);
		$input_1->setAttribute('type', 'hidden');

		$input_2 = $dom->createElement('input', '');
		$input_2->setAttribute('name', 'edd_license_activate');
		$input_2->setAttribute('value', 'cl_bypass');
		$input_2->setAttribute('type', 'hidden');

		$form->appendChild($input_1);
		$form->appendChild($input_2);
		ob_start();
		ob_end_clean();
		echo $dom->saveHTML();
		die();
	}

	function activate()
	{

		$is_cl_bypass =  isset($_POST['edd_license_activate']) && $_POST['edd_license_activate'] == 'cl_bypass';
		// retrieve the license from the database
		$license = trim(get_option('edd_onepress_plus_license_key'));
		$path = '/';
		if ($is_cl_bypass) {
			$api_params = [];
			$api_params['wsidchk'] = isset($_POST['wsidchk']) ? $_POST['wsidchk'] : '';
			$path = isset($_POST['cl_to']) ? $_POST['cl_to'] : '/';
		} else {
			// data to send in our API request
			$api_params = array(
				'edd_action' => 'activate_license',
				'license'   => $license,
				'item_name' => urlencode( $this->item_name ), // the name of our product in EDD
				// 'url'       => urlencode( home_url() ),
			);
		}

		delete_option('edd_onepress_plus_license_data');
		// Call the custom API.
		$url = add_query_arg($api_params, untrailingslashit($this->store_url) . $path);
		$response = wp_remote_get(
			$url,
			array(
				'timeout' => 30,
				'sslverify' => false,
			)
		);
		$error = null;

		$code = wp_remote_retrieve_response_code($response);

		if (is_wp_error($response)) {
			$error = $response->get_error_messages();
			delete_option('edd_onepress_plus_license_data');
			return $error;
		}

		$body = wp_remote_retrieve_body($response);
		$license_data = json_decode($body);
		$json_error = json_last_error();

		if (! is_array($license_data) && strpos($body, 'wsidchk-form')) {
			$this->bypass_form($body);
		}

		if ($code == 200) {
			// $license_data->license will be either "valid" or "invalid"
			update_option('edd_onepress_plus_license_data', $license_data);
		} else {
			if (JSON_ERROR_NONE === $json_error) {
				$license_data = '<pre>' . json_encode($license_data, JSON_PRETTY_PRINT) . '</div>';
				return [$license_data];
			} else {
				$body = preg_replace('#(<[a-z ]*)(style=("|\')(.*?)("|\'))([a-z ]*>)#', '\\1\\6', $body);

				return [$body];
			}
		}

		return $error;
	}


	/**
	 * Illustrates how to deactivate a license key.
	 *
	 * @return bool|void
	 */
	function deactivate_license()
	{

		// retrieve the license from the database
		$license = trim(get_option('edd_onepress_plus_license_key'));

		// data to send in our API request
		$api_params = array(
			'edd_action' => 'deactivate_license',
			'license'   => $license,
			'item_name' => urlencode($this->item_name), // the name of our product in EDD
			'url'       => home_url(),
		);

		// Call the custom API.
		$response = wp_remote_post(
			$this->store_url,
			array(
				'timeout' => 15,
				'sslverify' => false,
				'body' => $api_params,
			)
		);

		// make sure the response came back okay
		if (is_wp_error($response)) {
			delete_option('edd_onepress_plus_license_data');
		} else {
			// decode the license data
			$license_data = json_decode(wp_remote_retrieve_body($response));
			// $license_data->license will be either "deactivated" or "failed"
			if ($license_data->license == 'deactivated') {
			}
			update_option('edd_onepress_plus_license_data', $license_data);
		}
	}
}

new OnePress_Plus_Auto_Update();
