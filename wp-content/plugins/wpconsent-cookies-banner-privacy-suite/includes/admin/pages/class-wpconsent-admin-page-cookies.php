<?php
/**
 * Admin paged used to configure the cookies loaded in the banner
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Admin_Page_Cookies.
 */
class WPConsent_Admin_Page_Cookies extends WPConsent_Admin_Page {

	/**
	 * Page slug.
	 *
	 * @var string
	 */
	public $page_slug = 'wpconsent-cookies';

	/**
	 * Default view.
	 *
	 * @var string
	 */
	public $view = 'settings';

	use WPConsent_Input_Select;

	/**
	 * Current action.
	 *
	 * @var string
	 */
	protected $action;

	/**
	 * Call this just to set the page title translatable.
	 */
	public function __construct() {
		$this->page_title = __( 'Cookies Configuration', 'wpconsent-cookies-banner-privacy-suite' );
		$this->menu_title = __( 'Settings', 'wpconsent-cookies-banner-privacy-suite' );
		parent::__construct();
	}

	/**
	 * Page specific Hooks.
	 *
	 * @return void
	 */
	public function page_hooks() {
		add_action( 'admin_init', array( $this, 'handle_submit' ) );
		add_filter( 'wpconsent_admin_js_data', array( $this, 'add_connect_strings' ) );

		$this->views = array(
				'settings'  => __( 'Settings', 'wpconsent-cookies-banner-privacy-suite' ),
				'cookies'   => __( 'Cookies', 'wpconsent-cookies-banner-privacy-suite' ),
				'languages' => __( 'Languages', 'wpconsent-cookies-banner-privacy-suite' ),
				'advanced'  => __( 'Advanced', 'wpconsent-cookies-banner-privacy-suite' ),
				'iabtcf'    => __( 'IAB TCF', 'wpconsent-cookies-banner-privacy-suite' ),
		);
	}

	/**
	 * Add the strings for the connect page to the JS object.
	 *
	 * @param array $data The localized data we already have.
	 *
	 * @return array
	 */
	public function add_connect_strings( $data ) {
		$data['oops']                = esc_html__( 'Oops!', 'wpconsent-cookies-banner-privacy-suite' );
		$data['ok']                  = esc_html__( 'OK', 'wpconsent-cookies-banner-privacy-suite' );
		$data['almost_done']         = esc_html__( 'Almost Done', 'wpconsent-cookies-banner-privacy-suite' );
		$data['plugin_activate_btn'] = esc_html__( 'Activate', 'wpconsent-cookies-banner-privacy-suite' );
		$data['server_error']        = esc_html__( 'Unfortunately there was a server connection error.', 'wpconsent-cookies-banner-privacy-suite' );
		$data['icons']               = array(
				'checkmark' => wpconsent_get_icon( 'checkmark', 88, 88, '0 0 130.2 130.2' ),
		);
		$data['records_of_consent']  = array(
				'title' => esc_html__( 'Records of Consent is a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
				'text'  => esc_html__( 'Upgrade to PRO today and start keeping logs for all visitors that give consent. 100% self-hosted on your WordPress site.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'   => wpconsent_utm_url( 'https://wpconsent.com/lite', 'settings', 'consent-logs' ),
		);
		$data['consent_logs_auto_cleanup'] = array(
				'title' => esc_html__( 'Automatic Consent Logs Cleanup is a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
				'text'  => esc_html__( 'Upgrade to PRO today and automatically manage data retention for your consent logs to keep your database lean.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'   => wpconsent_utm_url( 'https://wpconsent.com/lite', 'settings', 'consent-logs-auto-cleanup' ),
		);
		$data['scanner']             = array(
				'title' => esc_html__( 'Automatic Scanning is a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
				'text'  => esc_html__( 'Upgrade to PRO today and schedule automatic website scanning to stay up to date with your website\'s consent needs.', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'   => wpconsent_utm_url( 'https://wpconsent.com/lite', 'settings', 'consent-logs' ),
		);

		return $data;
	}

	/**
	 * Handle the form submission.
	 *
	 * @return void
	 */
	public function handle_submit() {
		// Check the nonce for settings view.
		if ( ! isset( $_POST['wpconsent_save_settings_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['wpconsent_save_settings_nonce'] ), 'wpconsent_save_settings' ) ) {
			return;
		}

		// Save the settings based on current view.
		if ( 'advanced' === $this->view ) {
			$enable_shared_consent = isset( $_POST['enable_shared_consent'] ) ? 1 : 0;

			// Calculate cookie domain if shared consent is enabled.
			$cookie_domain = '';
			$hostname      = '';
			if ( $enable_shared_consent ) {
				$hostname = wp_parse_url( home_url(), PHP_URL_HOST );
				if ( $hostname ) {
					$cookie_domain = wpconsent_get_registrable_domain( $hostname );
				}
			}

			/**
			 * Filter the calculated cookie domain before saving.
			 *
			 * Allows developers to modify the cookie domain for edge cases or custom requirements.
			 *
			 * @param string $cookie_domain The calculated registrable domain (e.g., 'example.com').
			 * @param string $hostname The original hostname from home_url().
			 * @param int    $enable_shared_consent Whether shared consent is enabled (1 or 0).
			 *
			 * @since 1.1.0
			 *
			 */
			$cookie_domain = apply_filters( 'wpconsent_cookie_domain', $cookie_domain, $hostname, $enable_shared_consent );

			$settings = array(
					'clarity_consent_mode'  => isset( $_POST['clarity_consent_mode'] ) ? 1 : 0,
					'uninstall_data'        => isset( $_POST['uninstall_data'] ) ? 1 : 0,
					'enable_shared_consent' => $enable_shared_consent,
					'cookie_domain'         => $cookie_domain,
					'respect_gpc'           => isset( $_POST['respect_gpc'] ) ? 1 : 0,
					'usage_tracking'        => isset( $_POST['usage_tracking'] ) ? 1 : 0,
			);
		} else {
			// Update main settings (for settings view).
			$settings = array(
					'enable_consent_banner'             => isset( $_POST['enable_consent_banner'] ) ? 1 : 0,
					'cookie_policy_page'                => isset( $_POST['cookie_policy_page'] ) ? intval( $_POST['cookie_policy_page'] ) : 0,
					'enable_script_blocking'            => ( isset( $_POST['enable_script_blocking'] ) && isset( $_POST['enable_consent_banner'] ) ) ? 1 : 0,
					'google_consent_mode'               => isset( $_POST['google_consent_mode'] ) ? 1 : 0,
					'gcm_url_passthrough'               => isset( $_POST['gcm_url_passthrough'] ) ? 1 : 0,
					'gcm_ads_data_redaction'            => isset( $_POST['gcm_ads_data_redaction'] ) ? 1 : 0,
					'enable_consent_floating'           => isset( $_POST['enable_consent_floating'] ) ? 1 : 0,
					'default_allow'                     => isset( $_POST['default_allow'] ) ? 1 : 0,
					'manual_toggle_services'            => isset( $_POST['manual_toggle_services'] ) ? 1 : 0,
					'consent_duration'                  => isset( $_POST['consent_duration'] ) ? intval( $_POST['consent_duration'] ) : 30,
					'enable_content_blocking'           => isset( $_POST['enable_content_blocking'] ) ? 1 : 0,
					'content_blocking_services'         => isset( $_POST['content_blocking_services'] ) ? array_map( 'sanitize_text_field', wp_unslash( $_POST['content_blocking_services'] ) ) : array(),
					'content_blocking_placeholder_text' => isset( $_POST['content_blocking_placeholder_text'] ) ? sanitize_text_field( wp_unslash( $_POST['content_blocking_placeholder_text'] ) ) : 'Click here to accept {category} cookies and load this content',
			);
		}

		wpconsent()->settings->bulk_update_options( $settings );

		// Keep the preferences cookie duration label in sync with the consent duration setting.
		if ( isset( $settings['consent_duration'] ) ) {
			wpconsent()->cookies->update_preferences_cookie_duration();

			/**
			 * Fires after the Consent Duration setting is saved so dependent cookie labels can re-sync.
			 *
			 * @since 1.1.7
			 */
			do_action( 'wpconsent_consent_duration_updated' );
		}

		wp_safe_redirect( $this->get_page_action_url() );
		exit;
	}

	/**
	 * Output the settings view.
	 *
	 * @return void
	 */
	public function output_view_settings() {
		?>
		<form action="<?php echo esc_url( $this->get_page_action_url() ); ?>" method="post">
			<?php
			$this->metabox(
					esc_html__( 'License', 'wpconsent-cookies-banner-privacy-suite' ),
					$this->get_license_key_content()
			);
			$this->metabox(
					__( 'Cookies Configuration', 'wpconsent-cookies-banner-privacy-suite' ),
					$this->get_settings_metabox()
			);
			wp_nonce_field(
					'wpconsent_save_settings',
					'wpconsent_save_settings_nonce'
			);
			?>
			<div class="wpconsent-submit">
				<button type="submit" name="save_changes" class="wpconsent-button wpconsent-button-primary">
					<?php esc_html_e( 'Save Changes', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
			</div>
		</form>
		<?php
	}


	/**
	 * Get the license key input.
	 *
	 * @return string
	 */
	public function get_license_key_field() {
		ob_start();
		?>
		<div class="wpconsent-metabox-form wpconsent-license-key-container">
			<p><?php esc_html_e( 'You\'re using WPConsent Lite - no license needed. Enjoy!', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				🙂
			</p>
			<p>
				<?php
				printf(
				// Translators: %1$s - Opening anchor tag, do not translate. %2$s - Closing anchor tag, do not translate.
						esc_html__( 'To unlock more features consider %1$supgrading to PRO%2$s.', 'wpconsent-cookies-banner-privacy-suite' ),
						'<strong><a href="' . esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'settings-license', 'upgrading-to-pro' ) ) . '" target="_blank" rel="noopener noreferrer">',
						'</a></strong>'
				)
				?>
			</p>
			<hr>
			<p><?php esc_html_e( 'Already purchased? Simply enter your license key below to enable WPConsent PRO!', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			<p>
				<input type="password" class="wpconsent-input-text" id="wpconsent-settings-upgrade-license-key" placeholder="<?php esc_attr_e( 'Paste license key here', 'wpconsent-cookies-banner-privacy-suite' ); ?>" value="">
				<button type="button" class="wpconsent-button" id="wpconsent-settings-connect-btn">
					<?php esc_html_e( 'Verify Key', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
			</p>
		</div>
		<?php

		return ob_get_clean();
	}

	/**
	 * Get the license key content.
	 *
	 * @return string
	 */
	public function get_license_key_content() {
		ob_start();

		$this->metabox_row(
				esc_html__( 'License Key', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_license_key_field(),
				'wpconsent-setting-license-key'
		);

		return ob_get_clean();
	}

	/**
	 * Get the TCF notice for the Consent Settings section.
	 *
	 * Returns an empty string by default. Pro classes override this when IAB TCF is enabled.
	 *
	 * @return string
	 */
	protected function get_tcf_consent_settings_notice() {
		return '';
	}

	/**
	 * Get the settings metabox.
	 *
	 * @return string
	 */
	public function get_settings_metabox() {

		ob_start();

		echo $this->get_tcf_consent_settings_notice(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		$this->metabox_row(
				esc_html__( 'Consent Banner', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'enable_consent_banner' ),
						'enable_consent_banner',
						esc_html__( 'Enable displaying the consent banner on your website.', 'wpconsent-cookies-banner-privacy-suite' )
				),
				'enable_consent_banner',
				'',
				'',
				'',
				false,
				'',
				$this->is_tcf_field_locked( 'enable_consent_banner' )
		);

		$this->metabox_row(
				esc_html__( 'Script Blocking', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'enable_script_blocking' ),
						'enable_script_blocking',
						sprintf(
						// translators: %1$s is an opening link tag, %2$s is a closing link tag.
								esc_html__( 'Prevent known scripts from adding cookies before consent is given. %1$sLearn More%2$s', 'wpconsent-cookies-banner-privacy-suite' ),
								'<a target="_blank" rel="noopener noreferrer" href="' . esc_url( wpconsent_utm_url( 'https://wpconsent.com/docs/automatic-script-blocking', 'settings', 'script-blocking' ) ) . '">',
								'</a>'
						)
				) . $this->help_icon( __( 'Script blocking is not available without displaying the banner', 'wpconsent-cookies-banner-privacy-suite' ), false ),
				'enable_script_blocking',
				'',
				'',
				'',
				false,
				'',
				$this->is_tcf_field_locked( 'enable_script_blocking' )
		);

		$this->metabox_row(
				esc_html__( 'Settings Button', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'enable_consent_floating' ),
						'enable_consent_floating',
						esc_html__( 'Show a floating button to manage consent after the banner is dismissed.', 'wpconsent-cookies-banner-privacy-suite' )
				),
				'enable_consent_floating',
				'',
				'',
				'',
				false,
				'',
				$this->is_tcf_field_locked( 'enable_consent_floating' )
		);

		$this->metabox_row(
				esc_html__( 'Default Allow', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'default_allow' ),
						'default_allow',
						sprintf(
						// translators: %1$s is an opening link tag, %2$s is a closing link tag.
								esc_html__( 'Enable this to only block scripts/cookies if the user rejects them. %1$sLearn More%2$s', 'wpconsent-cookies-banner-privacy-suite' ),
								'<a target="_blank" rel="noopener noreferrer" href="' . esc_url( wpconsent_utm_url( 'https://wpconsent.com/docs/default-allow', 'settings', 'default-allow' ) ) . '">',
								'</a>'
						)
				),
				'default_allow',
				'',
				'',
				'',
				false,
				'',
				$this->is_tcf_field_locked( 'default_allow' )
		);

		$this->metabox_row(
				esc_html__( 'Toggle Services', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'manual_toggle_services' ),
						'manual_toggle_services',
						esc_html__( 'Allow site visitors to toggle individual services from the preferences panel.', 'wpconsent-cookies-banner-privacy-suite' )
				),
				'manual_toggle_services',
				'',
				'',
				'',
				false,
				'',
				$this->is_tcf_field_locked( 'manual_toggle_services' )
		);

		$this->metabox_row_separator();
		$this->google_consent_mode_section();
		$this->metabox_row_separator();
		$this->metabox_row(
				esc_html__( 'Cookie Categories', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_cookie_categories_input()
		);
		$this->metabox_row_separator();
		$this->metabox_row(
				esc_html__( 'Cookie Policy', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_cookie_policy_input(),
				'',
				'',
				'',
				'',
				false,
				'cookie-policy-input'
		);
		$this->metabox_row_separator();
		$this->metabox_row(
				esc_html__( 'Content Blocking', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'enable_content_blocking' ),
						'enable_content_blocking',
						esc_html__( 'Block 3rd party services that use iframes from being loaded before consent is given.', 'wpconsent-cookies-banner-privacy-suite' )
				),
				'enable_content_blocking'
		);
		$this->metabox_row(
				esc_html__( 'Content to Block', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_content_blocking_input(),
				'',
				'#enable_content_blocking',
				'1',
				esc_html__( 'Choose which content providers to automatically block.', 'wpconsent-cookies-banner-privacy-suite' ),
				false,
				'content_blocking'
		);
		$this->metabox_row(
				esc_html__( 'Placeholder Button', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_input_text(
						'content_blocking_placeholder_text',
						wpconsent()->settings->get_option( 'content_blocking_placeholder_text', wpconsent()->strings->get_string( 'content_blocking_placeholder_text' ) )
				),
				'content_blocking_placeholder_text',
				'#enable_content_blocking',
				'1',
				sprintf(
				// Translators: %s is the {category} tag wrapped in a code tag.
						esc_html__( 'Customize the text shown on the placeholder button. Use %s to insert the cookie category name.', 'wpconsent-cookies-banner-privacy-suite' ),
						'<code>{category}</code>'
				)
		);
		$this->metabox_row_separator();
		$this->metabox_row(
				esc_html__( 'Consent Duration', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_input_number( 'consent_duration', wpconsent()->settings->get_option( 'consent_duration', 30 ) ),
				'consent_duration',
				'',
				'',
				esc_html__( 'The duration of the consent given by the user (in days).', 'wpconsent-cookies-banner-privacy-suite' )
		);
		$this->metabox_row_separator();
		$this->records_of_consent_input();

		return ob_get_clean();
	}

	/**
	 * Render the Google Consent Mode section.
	 *
	 * @return void
	 */
	public function google_consent_mode_section() {
		?>
		<div class="wpconsent-admin-settings-section">
			<h2 class="wpconsent-preferences-section-title">
				<?php esc_html_e( 'Google Consent Mode', 'wpconsent-cookies-banner-privacy-suite' ); ?>
			</h2>
			<div class="wpconsent-form-fields-section-description">
				<p>
					<?php
					printf(
						// translators: %1$s opening <a>, %2$s closing </a>.
						esc_html__( 'Google Consent Mode reports visitor consent to Google services such as Analytics, Ads, and Tag Manager using the v2 consent signals (ad_storage, analytics_storage, ad_user_data, ad_personalization, and personalization_storage). Each signal\'s default state follows your "Default Allow" setting and is updated when the visitor responds to the banner. %1$sLearn more about Google Consent Mode%2$s.', 'wpconsent-cookies-banner-privacy-suite' ),
						'<a target="_blank" rel="noopener noreferrer" href="' . esc_url( wpconsent_utm_url( 'https://wpconsent.com/docs/google-consent-mode', 'settings', 'google-consent-mode-section' ) ) . '">',
						'</a>'
					);
					?>
				</p>
			</div>
		</div>
		<?php

		$this->metabox_row(
				esc_html__( 'Google Consent Mode', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'google_consent_mode', true ),
						'google_consent_mode'
				) . $this->help_icon( __( 'Google Consent Mode will not be loaded if the banner is disabled.', 'wpconsent-cookies-banner-privacy-suite' ), false ),
				'google_consent_mode',
				'',
				'',
				'',
				false,
				'',
				$this->is_tcf_field_locked( 'google_consent_mode' )
		);

		$this->metabox_row(
				esc_html__( 'URL Passthrough', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'gcm_url_passthrough', 0 ),
						'gcm_url_passthrough',
						esc_html__( 'Pass advertising identifiers (such as gclid) across pages via URL parameters so conversion attribution keeps working when ad cookies are denied.', 'wpconsent-cookies-banner-privacy-suite' )
				),
				'gcm_url_passthrough'
		);

		$this->metabox_row(
				esc_html__( 'Ads Data Redaction', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'gcm_ads_data_redaction', 0 ),
						'gcm_ads_data_redaction',
						esc_html__( 'When ad storage is denied, route Google ad measurement through cookieless domains and strip ad-click identifiers from network requests.', 'wpconsent-cookies-banner-privacy-suite' )
				),
				'gcm_ads_data_redaction'
		);
	}

	/**
	 * Get the input for enabling records of consent.
	 *
	 * @return void
	 */
	public function records_of_consent_input() {
		$this->metabox_row(
				esc_html__( 'Consent Logs', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						false,
						'wpconsent-records-of-consent-lite',
						esc_html__( 'Enable keeping records of consent for all visitors that give consent.', 'wpconsent-cookies-banner-privacy-suite' )
				),
				'wpconsent-records-of-consent-lite',
				'',
				'',
				'',
				true
		);
		$this->metabox_row(
				esc_html__( 'Automatic Cleanup', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						false,
						'wpconsent-consent-logs-auto-delete-lite',
						esc_html__( 'Automatically delete consent logs older than a retention period you choose, on a weekly schedule.', 'wpconsent-cookies-banner-privacy-suite' )
				),
				'wpconsent-consent-logs-auto-delete-lite',
				'',
				'',
				'',
				true
		);
	}

	/**
	 * Manage cookie categories.
	 *
	 * @return string
	 */
	public function get_cookie_categories_input() {
		ob_start();
		$categories = wpconsent()->cookies->get_categories();
		?>
		<div class="wpconsent-buttons-config-input wpconsent-manage-cookie-categories">
			<div class="wpconsent-button-row wpconsent-buttons-list-header">
				<div class="wpconsent-button-label-column wpconsent-button-label-header">
					<?php echo esc_html__( 'Title', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</div>
				<div class="wpconsent-button-text-column wpconsent-button-text-header">
					<?php echo esc_html__( 'Description', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</div>
				<div class="wpconsent-button-enabled-column wpconsent-button-enabled-header">
					<?php echo esc_html__( 'Action', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</div>
			</div>
			<?php
			$default_categories = wpconsent()->cookies->get_default_categories();
			foreach ( $categories as $slug => $category ) {
				?>
				<div class="wpconsent-button-row" data-button-id="<?php echo esc_attr( $category['id'] ); ?>">
					<div class="wpconsent-button-label-column">
						<?php echo esc_html( $category['name'] ); ?>
					</div>
					<div class="wpconsent-button-text-column">
						<?php echo esc_html( $category['description'] ); ?>
					</div>
					<div class="wpconsent-button-enabled-column">
						<textarea class="wpconsent-hidden wpconsent-category-description" readonly><?php echo esc_textarea( $category['description'] ); ?></textarea>
						<?php if ( apply_filters( 'wpconsent_show_category_edit_button', true, $slug, $category ) ) : ?>
							<button class="wpconsent-button wpconsent-button-just-icon wpconsent-edit-category" type="button">
								<?php wpconsent_icon( 'edit', 15, 16 ); ?>
							</button>
						<?php endif; ?>
						<?php if ( apply_filters( 'wpconsent_show_category_delete_button', ! array_key_exists( $slug, $default_categories ), $slug, $category ) ) : ?>
							<button class="wpconsent-button wpconsent-button-just-icon wpconsent-delete-category" data-button-id="<?php echo esc_attr( $category['id'] ); ?>" type="button">
								<?php wpconsent_icon( 'delete', 14, 16 ); ?>
							</button>
						<?php endif; ?>
					</div>
				</div>
				<?php
			}
			?>
			<?php if ( apply_filters( 'wpconsent_show_add_category_button', true ) ) : ?>
				<div class="wpconsent-actions-row">
					<button class="wpconsent-button wpconsent-button-text" type="button" id="wpconsent-add-category">
						<?php echo esc_html__( '+ Add New Category', 'wpconsent-cookies-banner-privacy-suite' ); ?>
					</button>
				</div>
			<?php endif; ?>
		</div>
		<div class="wpconsent-input-area-description">
			<?php esc_html_e( 'Customize the information for cookie categories.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
		</div>
		<script type="text/template" id="wpconsent-new-category-row">
			<div class="wpconsent-button-row" data-button-id="{{id}}">
				<div class="wpconsent-button-label-column">
					{{name}}
				</div>
				<div class="wpconsent-button-text-column">
					{{required}}
				</div>
				<div class="wpconsent-button-enabled-column">
					<textarea class="wpconsent-hidden wpconsent-category-description" readonly>{{description}}</textarea>
					<button class="wpconsent-button wpconsent-button-just-icon wpconsent-edit-category" type="button">
						<?php wpconsent_icon( 'edit', 15, 16 ); ?>
					</button>
					<button class="wpconsent-button wpconsent-button-just-icon wpconsent-delete-category" data-button-id="{{id}}" type="button">
						<?php wpconsent_icon( 'delete', 14, 16 ); ?>
					</button>
				</div>
			</div>
		</script>
		<?php

		return ob_get_clean();
	}

	/**
	 * The cookies input accordion.
	 *
	 * @return string
	 */
	public function get_cookies_input() {
		ob_start();
		$categories = wpconsent()->cookies->get_categories();
		?>
		<div class="wpconsent-cookies-manager wpconsent-accordion">
			<?php
			foreach ( $categories as $category ) {
				$cookies = wpconsent()->cookies->get_cookies_by_category( $category['id'] );
				?>
				<div class="wpconsent-accordion-item">
					<div class="wpconsent-accordion-header">
						<h3><?php printf( '%s (%d)', esc_html( $category['name'] ), count( $cookies ) ); ?></h3>
						<button class="wpconsent-accordion-toggle">
							<span class="dashicons dashicons-arrow-down-alt2"></span>
						</button>
					</div>
					<div class="wpconsent-accordion-content">
						<div class="wpconsent-cookie-category-description">
							<?php echo wp_kses_post( $category['description'] ); ?>
						</div>
						<div class="wpconsent-cookies-list">
							<div class="wpconsent-cookie-header">
								<div class="cookie-name"><?php esc_html_e( 'Cookie Name', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
								<div class="cookie-id"><?php esc_html_e( 'Cookie ID', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
								<div class="cookie-desc"><?php esc_html_e( 'Description', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
								<div class="cookie-duration"><?php esc_html_e( 'Duration', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
								<div class="cookie-actions"><?php esc_html_e( 'Actions', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
							</div>
							<?php
							if ( ! empty( $cookies ) ) {
								foreach ( $cookies as $cookie ) {
									// Let's skip here the cookies that are not associated with this category directly and are associated with a service.
									if ( ! in_array( $category['id'], $cookie['categories'], true ) ) {
										continue;
									}
									?>
									<div class="wpconsent-cookie-item">
										<div class="cookie-name"><?php echo esc_html( $cookie['name'] ); ?></div>
										<div class="cookie-id"><?php echo esc_html( $cookie['cookie_id'] ); ?></div>
										<div class="cookie-desc"><?php echo esc_html( $cookie['description'] ); ?></div>
										<div class="cookie-duration"><?php echo esc_html( $cookie['duration'] ); ?></div>
										<div class="cookie-actions">
											<button class="wpconsent-button-icon wpconsent-edit-cookie" type="button" data-cookie-id="<?php echo esc_attr( $cookie['id'] ); ?>">
												<?php wpconsent_icon( 'edit', 15, 16 ); ?>
											</button>
											<button class="wpconsent-button-icon wpconsent-delete-cookie" type="button" data-cookie-id="<?php echo esc_attr( $cookie['id'] ); ?>">
												<?php wpconsent_icon( 'delete', 14, 16 ); ?>
											</button>
										</div>
										<input type="hidden" class="wpconsent-cookie-id" value="<?php echo esc_attr( $cookie['cookie_id'] ); ?>">
									</div>
									<?php
								}
							}
							$services = wpconsent()->cookies->get_services_by_category( $category['id'] );
							foreach ( $services as $service ) {
								?>
								<div class="wpconsent-service-item" data-service-id="<?php echo absint( $service['id'] ); ?>">
									<div class="wpconsent-service-header">
										<div class="wpconsent-service-text">
											<div class="service-name"><?php echo esc_html( $service['name'] ); ?></div>
											<div class="service-desc"><?php echo esc_html( $service['description'] ); ?></div>
										</div>
										<div class="service-actions">
											<button class="wpconsent-button-icon wpconsent-edit-service" type="button" data-service-id="<?php echo absint( $service['id'] ); ?>">
												<?php wpconsent_icon( 'edit', 15, 16 ); ?>
											</button>
											<button class="wpconsent-button-icon wpconsent-delete-service" type="button" data-service-id="<?php echo absint( $service['id'] ); ?>">
												<?php wpconsent_icon( 'delete', 14, 16 ); ?>
											</button>
											<input type="hidden" class="wpconsent-service-id" value="<?php echo absint( $service['id'] ); ?>">
											<input type="hidden" class="wpconsent-service-url" value="<?php echo esc_url( $service['service_url'] ); ?>">
										</div>
									</div>
									<div class="wpconsent-cookies-list">
										<div class="wpconsent-cookie-header">
											<div class="cookie-name"><?php esc_html_e( 'Cookie Name', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
											<div class="cookie-id"><?php esc_html_e( 'Cookie ID', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
											<div class="cookie-desc"><?php esc_html_e( 'Description', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
											<div class="cookie-duration"><?php esc_html_e( 'Duration', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
											<div class="cookie-actions"><?php esc_html_e( 'Actions', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
										</div>
										<?php
										// We already loaded all the cookies for this category so we need to simply show here just the ones for this service.
										if ( ! empty( $cookies ) ) :
											foreach ( $cookies as $cookie_for_service ) {
												if ( ! in_array( $service['id'], $cookie_for_service['categories'], true ) ) {
													continue;
												}
												?>
												<div class="wpconsent-cookie-item">
													<div class="cookie-name"><?php echo esc_html( $cookie_for_service['name'] ); ?></div>
													<div class="cookie-id"><?php echo esc_html( $cookie_for_service['cookie_id'] ); ?></div>
													<div class="cookie-desc"><?php echo esc_html( $cookie_for_service['description'] ); ?></div>
													<div class="cookie-duration"><?php echo esc_html( $cookie_for_service['duration'] ); ?></div>
													<div class="cookie-actions">
														<button class="wpconsent-button-icon wpconsent-edit-cookie" type="button" data-cookie-id="<?php echo esc_attr( $cookie_for_service['id'] ); ?>">
															<?php wpconsent_icon( 'edit', 15, 16 ); ?>
														</button>
														<button class="wpconsent-button-icon wpconsent-delete-cookie" type="button" data-cookie-id="<?php echo esc_attr( $cookie_for_service['id'] ); ?>">
															<?php wpconsent_icon( 'delete', 14, 16 ); ?>
														</button>
													</div>
													<input type="hidden" class="wpconsent-cookie-id" value="<?php echo esc_attr( $cookie_for_service['cookie_id'] ); ?>">
													<input type="hidden" class="wpconsent-cookie-service" value="<?php echo esc_attr( $service['id'] ); ?>">
												</div>
												<?php
											}
										endif;
										?>
									</div>
								</div>
								<?php
							}
							?>
						</div>
						<div class="wpconsent-actions-row">
							<button class="wpconsent-button wpconsent-button-primary wpconsent-add-cookie wpconsent-button-icon" type="button" data-category-id="<?php echo esc_attr( $category['id'] ); ?>" data-category-name="<?php echo esc_attr( $category['name'] ); ?>">
								<?php wpconsent_icon( 'cookie', 14, 14 ); ?>
								<?php esc_html_e( 'Add A Cookie', 'wpconsent-cookies-banner-privacy-suite' ); ?>
							</button>
							<button class="wpconsent-button wpconsent-button-secondary wpconsent-add-service wpconsent-button-icon" type="button" data-category-id="<?php echo esc_attr( $category['id'] ); ?>" data-category-name="<?php echo esc_attr( $category['name'] ); ?>">
								<?php wpconsent_icon( 'plus', 14, 14, '0 -960 960 960' ); ?>
								<?php esc_html_e( 'Add A Service', 'wpconsent-cookies-banner-privacy-suite' ); ?>
							</button>
							<?php echo $this->get_service_library_button( $category ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</div>
					</div>
				</div>
			<?php } ?>
		</div>
		<script type="text/template" id="wpconsent-new-cookie-row">
			<div class="wpconsent-cookie-item">
				<div class="cookie-name">{{name}}</div>
				<div class="cookie-id">{{cookie_id}}</div>
				<div class="cookie-desc">{{description}}</div>
				<div class="cookie-duration">{{duration}}</div>
				<div class="cookie-actions">
					<button class="wpconsent-button-icon wpconsent-edit-cookie" type="button" data-cookie-id="{{id}}">
						<?php wpconsent_icon( 'edit', 15, 16 ); ?>
					</button>
					<button class="wpconsent-button-icon wpconsent-delete-cookie" type="button" data-cookie-id="{{id}}">
						<?php wpconsent_icon( 'delete', 14, 16 ); ?>
					</button>
				</div>
				<input type="hidden" class="wpconsent-cookie-id" value="{{cookie_id}}">
			</div>
		</script>
		<script type="text/template" id="wpconsent-new-service-row">
			<div class="wpconsent-service-item" data-service-id="{{id}}">
				<div class="wpconsent-service-header">
					<div class="wpconsent-service-text">
						<div class="service-name">{{name}}</div>
						<div class="service-desc">{{description}}</div>
					</div>
					<div class="service-actions">
						<button class="wpconsent-button-icon wpconsent-edit-service" type="button" data-service-id="{{id}}">
							<?php wpconsent_icon( 'edit', 15, 16 ); ?>
						</button>
						<button class="wpconsent-button-icon wpconsent-delete-service" type="button" data-service-id="{{id}}">
							<?php wpconsent_icon( 'delete', 14, 16 ); ?>
						</button>
						<input type="hidden" class="wpconsent-service-id" value="{{service_id}}">
						<input type="hidden" class="wpconsent-service-url" value="{{service_url}}">
					</div>
				</div>
				<div class="wpconsent-cookies-list">
					<div class="wpconsent-cookie-header">
						<div class="cookie-name"><?php esc_html_e( 'Cookie Name', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
						<div class="cookie-id"><?php esc_html_e( 'Cookie ID', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
						<div class="cookie-desc"><?php esc_html_e( 'Description', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
						<div class="cookie-duration"><?php esc_html_e( 'Duration', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
						<div class="cookie-actions"><?php esc_html_e( 'Actions', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
					</div>
				</div>
			</div>
		</script>
		<?php
		return ob_get_clean();
	}


	/**
	 * Get the service library button HTML.
	 *
	 * @param array $category The category data.
	 *
	 * @return string The button HTML.
	 */
	public function get_service_library_button( $category ) {
		ob_start();
		?>
		<button class="wpconsent-button wpconsent-button-secondary wpconsent-add-service-from-library-lite wpconsent-button-icon" type="button" data-category-id="<?php echo esc_attr( $category['id'] ); ?>" data-category-name="<?php echo esc_attr( $category['name'] ); ?>">
			<?php wpconsent_icon( 'library', 14, 14, '0 -960 960 960' ); ?>
			<?php esc_html_e( 'Add Service From Library', 'wpconsent-cookies-banner-privacy-suite' ); ?>
		</button>
		<?php
		return ob_get_clean();
	}

	/**
	 * Output the cookies view.
	 *
	 * @return void
	 */
	public function output_view_cookies() {
		$this->metabox(
				__( 'Cookies Configuration', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_cookies_input()
		);
	}

	/**
	 * Output the footer.
	 *
	 * @return void
	 */
	public function output_footer() {
		parent::output_footer();
		$footer_method = 'output_footer_' . $this->view;
		if ( method_exists( $this, $footer_method ) ) {
			call_user_func( array( $this, $footer_method ) );
		}
	}

	/**
	 * Output the footer for the settings view.
	 *
	 * @return void
	 */
	public function output_footer_settings() {
		?>
		<div class="wpconsent-modal" id="wpconsent-modal-add-category">
			<div class="wpconsent-modal-inner">
				<form action="" id="wpconsent-modal-form">
					<div class="wpconsent-modal-header">
						<h2><?php echo esc_html__( 'Add New Category', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
						<button class="wpconsent-modal-close wpconsent-button wpconsent-button-just-icon" type="button">
							<span class="dashicons dashicons-no-alt"></span>
						</button>
					</div>
					<div class="wpconsent-modal-content">
						<?php
						$this->metabox_row(
								esc_html__( 'Category Name', 'wpconsent-cookies-banner-privacy-suite' ),
								$this->get_input_text( 'category_name' )
						);
						$this->metabox_row(
								esc_html__( 'Description', 'wpconsent-cookies-banner-privacy-suite' ),
								$this->get_input_textarea( 'category_description' )
						);
						?>
						<div class="wpconsent-modal-buttons">
							<button class="wpconsent-button wpconsent-button-primary" type="submit">
								<?php echo esc_html__( 'Save', 'wpconsent-cookies-banner-privacy-suite' ); ?>
							</button>
							<button class="wpconsent-button wpconsent-button-secondary" type="button">
								<?php echo esc_html__( 'Cancel', 'wpconsent-cookies-banner-privacy-suite' ); ?>
							</button>
						</div>
					</div>
					<input type="hidden" name="action" value="wpconsent_add_category">
					<input type="hidden" name="category_id" value="">
					<?php wp_nonce_field( 'wpconsent_add_category', 'wpconsent_add_category_nonce' ); ?>
				</form>
			</div>
		</div>
		<?php
	}

	/**
	 * Output the footer for the cookies view.
	 *
	 * @return void
	 */
	public function output_footer_cookies() {
		?>
		<div class="wpconsent-modal" id="wpconsent-modal-add-cookie">
			<div class="wpconsent-modal-inner">
				<form action="" id="wpconsent-modal-form">
					<div class="wpconsent-modal-header">
						<h2><?php echo esc_html__( 'Add New Cookie', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
						<button class="wpconsent-modal-close wpconsent-button wpconsent-button-just-icon" type="button">
							<span class="dashicons dashicons-no-alt"></span>
						</button>
					</div>
					<div class="wpconsent-modal-content">
						<?php
						$this->metabox_row(
								esc_html__( 'Service', 'wpconsent-cookies-banner-privacy-suite' ),
								$this->select( 'cookie_service', $this->get_services_options() )
						);
						$this->metabox_row(
								esc_html__( 'Cookie Name', 'wpconsent-cookies-banner-privacy-suite' ),
								$this->get_input_text( 'cookie_name' )
						);
						$this->metabox_row(
								esc_html__( 'Cookie ID', 'wpconsent-cookies-banner-privacy-suite' ),
								$this->get_input_text( 'cookie_id' )
						);
						$this->metabox_row(
								esc_html__( 'Description', 'wpconsent-cookies-banner-privacy-suite' ),
								$this->get_input_textarea( 'cookie_description' )
						);
						$this->metabox_row(
								esc_html__( 'Duration', 'wpconsent-cookies-banner-privacy-suite' ),
								$this->get_input_text( 'cookie_duration' )
						);
						?>
						<div class="wpconsent-modal-buttons">
							<button class="wpconsent-button wpconsent-button-primary" type="submit">
								<?php echo esc_html__( 'Save', 'wpconsent-cookies-banner-privacy-suite' ); ?>
							</button>
							<button class="wpconsent-button wpconsent-button-secondary" type="button">
								<?php echo esc_html__( 'Cancel', 'wpconsent-cookies-banner-privacy-suite' ); ?>
							</button>
						</div>
					</div>
					<input type="hidden" name="action" value="wpconsent_manage_cookie">
					<input type="hidden" name="post_id" value="">
					<input type="hidden" id="cookie_category" name="cookie_category" value="">
					<?php wp_nonce_field( 'wpconsent_manage_cookie', 'wpconsent_manage_cookie_nonce' ); ?>
				</form>
			</div>
		</div>
		<div class="wpconsent-modal" id="wpconsent-modal-add-service">
			<div class="wpconsent-modal-inner">
				<form action="">
					<div class="wpconsent-modal-header">
						<h2><?php echo esc_html__( 'Add New Service', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
						<button class="wpconsent-modal-close wpconsent-button wpconsent-button-just-icon" type="button">
							<span class="dashicons dashicons-no-alt"></span>
						</button>
					</div>
					<div class="wpconsent-modal-content">
						<?php
						$categories     = wpconsent()->cookies->get_categories();
						$select_options = array();
						foreach ( $categories as $category ) {
							$select_options[ $category['id'] ] = $category['name'];
						}

						$this->metabox_row(
								esc_html__( 'Category', 'wpconsent-cookies-banner-privacy-suite' ),
								$this->select( 'service_category', $select_options )
						);
						$this->metabox_row(
								esc_html__( 'Service Name', 'wpconsent-cookies-banner-privacy-suite' ),
								$this->get_input_text( 'service_name' )
						);
						$this->metabox_row(
								esc_html__( 'Description', 'wpconsent-cookies-banner-privacy-suite' ),
								$this->get_input_textarea( 'service_description' )
						);
						$this->metabox_row(
								esc_html__( 'Privacy Policy URL', 'wpconsent-cookies-banner-privacy-suite' ),
								$this->get_input_text( 'service_url' )
						);
						?>
						<div class="wpconsent-modal-buttons">
							<button class="wpconsent-button wpconsent-button-primary" type="submit">
								<?php echo esc_html__( 'Save', 'wpconsent-cookies-banner-privacy-suite' ); ?>
							</button>
							<button class="wpconsent-button wpconsent-button-secondary" type="button">
								<?php echo esc_html__( 'Cancel', 'wpconsent-cookies-banner-privacy-suite' ); ?>
							</button>
						</div>
					</div>
					<input type="hidden" name="action" value="wpconsent_manage_service">
					<input type="hidden" name="post_id" value="">
					<?php wp_nonce_field( 'wpconsent_manage_service', 'wpconsent_manage_service_nonce' ); ?>
				</form>
			</div>
		</div>
		<?php
	}

	/**
	 * Grab an array of available services for the cookies.
	 *
	 * @return array
	 */
	public function get_services_options() {
		return array(
				'0' => esc_html__( 'No service', 'wpconsent-cookies-banner-privacy-suite' ),
		);
	}

	/**
	 * Get the cookie policy input.
	 *
	 * @return string
	 */
	public function get_cookie_policy_input() {
		ob_start();
		$selected_page_id = wpconsent()->settings->get_option( 'cookie_policy_page' );
		$selected_page    = $selected_page_id ? get_post( $selected_page_id ) : null;
		$pages_args       = array(
				'number'  => 20,
				'orderby' => 'title',
				'order'   => 'ASC',
		);
		if ( ! empty( $selected_page_id ) ) {
			$pages_args['exclude'] = array( $selected_page_id ); // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude -- Excludes the single selected page from a 20-item admin dropdown.
		}
		// Let's pre-load 20 pages.
		$pages = get_pages( $pages_args );
		?>
		<div class="wpconsent-inline-select-group">
			<select id="cookie-policy-page" name="cookie_policy_page" class="wpconsent-choices wpconsent-page-search" data-placeholder="<?php esc_attr_e( 'Search for a page...', 'wpconsent-cookies-banner-privacy-suite' ); ?>" data-search="true" data-ajax-action="wpconsent_search_pages" data-ajax="true">
				<?php if ( $selected_page ) : ?>
					<option value="<?php echo esc_attr( $selected_page->ID ); ?>" selected>
						<?php echo esc_html( $selected_page->post_title ); ?>
					</option>
				<?php else : ?>
					<option value="0"><?php esc_html_e( 'Choose Page', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
				<?php endif; ?>
				<?php
				foreach ( $pages as $page ) {
					?>
					<option value="<?php echo esc_attr( $page->ID ); ?>">
						<?php echo esc_html( $page->post_title ); ?>
					</option>
					<?php
				}
				?>
			</select>
			<?php if ( $selected_page_id && $selected_page ) : ?>
				<a href="<?php echo esc_url( get_permalink( $selected_page_id ) ); ?>" class="wpconsent-button wpconsent-button-text" target="_blank">
					<?php
					esc_html_e( 'View Page', 'wpconsent-cookies-banner-privacy-suite' );
					?>
				</a>
			<?php endif; ?>
		</div>
		<div data-show-if-id="#cookie-policy-page" data-show-if-value="0" class="wpconsent-input-area-description">
			<button class="wpconsent-button wpconsent-button-secondary wpconsent-button-icon" id="wpconsent-create-cookie-policy-page" type="button">
				<?php
				wpconsent_icon( 'generate' );
				esc_html_e( 'Generate Cookie Policy Page', 'wpconsent-cookies-banner-privacy-suite' );
				?>
			</button>
		</div>
		<div class="wpconsent-input-area-description">
			<?php
			printf(
			// Translators: %s is the wpconsent_cookie_policy shortcode wrapped in code tags.
					esc_html__( 'Please select the page that serves as your cookie policy. Ensure that this page includes the %s shortcode. This shortcode is essential for automatically listing all the cookies configured in WPConsent.', 'wpconsent-cookies-banner-privacy-suite' ),
					'<code>[wpconsent_cookie_policy]</code>'
			);
			?>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Output an interface where users can configure the languages they want to have in the banner.
	 *
	 * @return void
	 */
	public function output_view_languages() {

		?>
		<div class="wpconsent-blur-area">
			<?php
			$this->metabox(
					esc_html__( 'Language Settings', 'wpconsent-cookies-banner-privacy-suite' ),
					$this->get_language_settings_content()
			);
			wp_nonce_field(
					'wpconsent_save_language_settings',
					'wpconsent_save_language_settings_nonce'
			);
			?>
		</div>
		<?php
		echo WPConsent_Admin_page::get_upsell_box( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				esc_html__( 'Multilanguage + Automatic Translations', 'wpconsent-cookies-banner-privacy-suite' ),
				'<p>' . esc_html__( 'Upgrade to WPConsent PRO today and easily manage content in multiple languages. Automatic AI-powered translations get you set up with a new language in minutes.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>',
				array(
						'text' => esc_html__( 'Upgrade to PRO and Unlock Languages', 'wpconsent-cookies-banner-privacy-suite' ),
						'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'languages-page', 'main' ) ),
				),
				array(
						'text' => esc_html__( 'Learn more about all the features', 'wpconsent-cookies-banner-privacy-suite' ),
						'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'languages-page', 'features' ) ),
				)
		);
		?>
		<?php
	}

	/**
	 * Get the display rules content for Lite (blurred preview).
	 *
	 * @return string
	 */
	public function get_display_rules_content_lite() {
		ob_start();
		?>
		<div class="wpconsent-input-area-description">
			<p><?php esc_html_e( 'Control where and to whom the cookie banner is displayed. Hide the banner for specific user roles or on certain pages.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
		</div>

		<div class="wpconsent-metabox-form-row">
			<div class="wpconsent-metabox-form-row-label">
				<label>
					<?php esc_html_e( 'Logged-in', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</label>
			</div>
			<div class="wpconsent-metabox-form-row-input">
				<div class="wpconsent-toggle-switch">
					<input type="checkbox" disabled>
					<label></label>
				</div>
				<p><?php esc_html_e( 'Hide the banner for all logged-in users, regardless of their role.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			</div>
		</div>

		<div class="wpconsent-metabox-form-row wpconsent-metabox-form-row-separator"></div>

		<div class="wpconsent-metabox-form-row">
			<div class="wpconsent-metabox-form-row-label">
				<label>
					<?php esc_html_e( 'User Roles', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</label>
			</div>
			<div class="wpconsent-metabox-form-row-input">
				<select class="wpconsent-choices" disabled multiple style="pointer-events: none;">
					<option><?php esc_html_e( 'Select user roles...', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
				</select>
				<p><?php esc_html_e( 'Select user roles that should not see the banner. Users with multiple roles will hide the banner if any selected role matches.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			</div>
		</div>

		<div class="wpconsent-metabox-form-row wpconsent-metabox-form-row-separator"></div>

		<div class="wpconsent-metabox-form-row">
			<div class="wpconsent-metabox-form-row-label">
				<label>
					<?php esc_html_e( 'Pages', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</label>
			</div>
			<div class="wpconsent-metabox-form-row-input">
				<select class="wpconsent-choices" disabled multiple style="pointer-events: none;">
					<option><?php esc_html_e( 'Start typing to select pages...', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
				</select>
				<p><?php esc_html_e( 'Select specific pages where the banner should be hidden. Useful for login pages, checkout pages, or admin-facing pages.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Output a single language item in the language selector.
	 *
	 * @param string $locale The locale code.
	 * @param array  $language The language data array.
	 * @param bool   $is_default Whether this is the default language.
	 * @param bool   $is_enabled Whether this language is enabled.
	 *
	 * @return void
	 */
	protected function output_language_item( $locale, $language, $is_default, $is_enabled ) {
		$classes = array( 'wpconsent-language-item' );
		if ( $is_default ) {
			$classes[] = 'wpconsent-language-default';
		}
		if ( $is_enabled ) {
			$classes[] = 'wpconsent-language-enabled';
		}
		?>
		<div class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>" data-locale="<?php echo esc_attr( $locale ); ?>" data-search="<?php echo esc_attr( strtolower( $language['english_name'] . ' ' . $language['native_name'] . ' ' . $locale ) ); ?>">
			<label class="wpconsent-checkbox-label">
				<input type="checkbox" name="enabled_languages[]" value="<?php echo esc_attr( $locale ); ?>"
						<?php checked( $is_enabled ); ?>
						<?php disabled( $is_default ); ?>>
				<span class="wpconsent-checkbox-text">
					<?php echo esc_html( $language['english_name'] ); ?>
					<span class="wpconsent-language-locale">(<?php echo esc_html( $locale ); ?>)</span>
					<?php if ( $language['native_name'] !== $language['english_name'] ) : ?>
						<span class="wpconsent-language-native-name">
							(<?php echo esc_html( $language['native_name'] ); ?>)
						</span>
					<?php endif; ?>
					<?php if ( $is_default ) : ?>
						<span class="wpconsent-language-default-badge">
							<?php esc_html_e( 'Default', 'wpconsent-cookies-banner-privacy-suite' ); ?>
						</span>
					<?php endif; ?>
				</span>
			</label>
		</div>
		<?php
	}

	/**
	 * Get the language settings content.
	 *
	 * @return string
	 */
	public function get_language_settings_content() {
		require_once ABSPATH . 'wp-admin/includes/translation-install.php';

		ob_start();
		// Get all available languages.
		$available_languages = wp_get_available_translations();
		if ( ! $available_languages ) {
			$available_languages = array();
		}

		// Add English as it's not in the translations list.
		$available_languages['en_US'] = array(
				'language'     => 'en_US',
				'english_name' => 'English (United States)',
				'native_name'  => 'English (United States)',
		);

		// Get WordPress default language.
		$default_language  = get_locale();
		$enabled_languages = array( $default_language );

		// Sort languages into selected and unselected.
		$selected_languages   = array();
		$unselected_languages = array();

		foreach ( $available_languages as $locale => $language ) {
			if ( in_array( $locale, $enabled_languages, true ) ) {
				$selected_languages[ $locale ] = $language;
			} else {
				$unselected_languages[ $locale ] = $language;
			}
		}

		// Sort both arrays alphabetically by English name.
		uasort( $selected_languages, function ( $a, $b ) {
			return strcmp( $a['english_name'], $b['english_name'] );
		} );
		uasort( $unselected_languages, function ( $a, $b ) {
			return strcmp( $a['english_name'], $b['english_name'] );
		} );
		?>
		<div class="wpconsent-language-settings">
			<div class="wpconsent-input-area-description">
				<p>
					<?php
					printf(
					// Translators: %s is the current WordPress language name.
							esc_html__( 'Select the languages you want to make available for your content. The default language (%s) will be used for the current settings until you configure translations.', 'wpconsent-cookies-banner-privacy-suite' ),
							esc_html( isset( $available_languages[ $default_language ]['english_name'] ) ? $available_languages[ $default_language ]['english_name'] : 'English (United States)' )
					);
					?>
				</p>
				<p>
					<?php
					printf(
					// Translators: %s is the icon for the language switcher.
							esc_html__(
									'Easily switch between languages using the globe icon (%s) in the header of any WPConsent admin page.',
									'wpconsent-cookies-banner-privacy-suite'
							),
							wp_kses(
									wpconsent_get_icon( 'globe', 16, 16, '0 -960 960 960' ),
									wpconsent_get_icon_allowed_tags()
							)
					);
					?>
				</p>
				<p>
					<?php
					esc_html_e( 'The "Translate" button appears for languages that are supported by our translation service. Click the button to start the automatic translation process for your consent banner content. Translation happens asynchronously in the background, and you will be notified when the process is complete.', 'wpconsent-cookies-banner-privacy-suite' );
					?>
				</p>
			</div>
			<div class="wpconsent-language-selector">
				<div class="wpconsent-language-search">
					<input type="text"
					       class="wpconsent-input-text"
					       id="wpconsent-language-search"
					       placeholder="<?php esc_attr_e( 'Search languages...', 'wpconsent-cookies-banner-privacy-suite' ); ?>"
					>
				</div>
				<div class="wpconsent-language-setting-list" id="wpconsent-language-list">
					<?php
					// Output selected languages first.
					if ( ! empty( $selected_languages ) ) :
						?>
						<div class="wpconsent-language-section">
							<div class="wpconsent-language-section-title">
								<?php esc_html_e( 'Selected Languages', 'wpconsent-cookies-banner-privacy-suite' ); ?>
							</div>
							<?php
							foreach ( $selected_languages as $locale => $language ) :
								$is_default = $locale === $default_language;
								$this->output_language_item( $locale, $language, $is_default, true );
							endforeach;
							?>
						</div>
					<?php
					endif;

					// Output unselected languages.
					if ( ! empty( $unselected_languages ) ) :
						?>
						<div class="wpconsent-language-section">
							<div class="wpconsent-language-section-title">
								<?php esc_html_e( 'Available Languages', 'wpconsent-cookies-banner-privacy-suite' ); ?>
							</div>
							<?php
							foreach ( $unselected_languages as $locale => $language ) :
								$is_default = $locale === $default_language;
								$this->output_language_item( $locale, $language, $is_default, false );
							endforeach;
							?>
						</div>
					<?php endif; ?>
				</div>
			</div>
		</div>
		<?php
		$this->metabox_row(
				esc_html__( 'Language Picker', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						true,
						'show_language_picker',
						esc_html__( 'Show a language picker in the consent banner', 'wpconsent-cookies-banner-privacy-suite' )
				),
				'show_language_picker',
				'',
				'',
				esc_html__( 'This will show a globe icon in the header of the consent banner, allowing users to switch between languages just for the banner/preferences panel even if you do not use a translation plugin. If you are using a translation plugin the banner should automatically display the content in the selected language, if available.', 'wpconsent-cookies-banner-privacy-suite' )
		);

		return ob_get_clean();
	}

	/**
	 * The input to choose which content to be blocked.
	 *
	 * @return string
	 */
	public function get_content_blocking_input() {
		$content_blocking_services = wpconsent()->script_blocker->get_content_blocking_providers();
		$currently_blocking        = wpconsent()->settings->get_option( 'content_blocking_services', array() );

		ob_start();
		?>
		<div class="wpconsent-content-blocking-list">
			<?php
			foreach ( $content_blocking_services as $service_id => $service ) {
				$is_enabled = empty( $currently_blocking ) || in_array( $service_id, $currently_blocking, true );
				$this->metabox_row(
						esc_html( $service ),
						$this->get_checkbox_toggle(
								$is_enabled,
								'content_blocking_services[]',
								'',
								$service_id
						),
						'content_blocking_services_' . $service_id
				);
			}
			?>
		</div>
		<?php

		return ob_get_clean();
	}

	/**
	 * Output the advanced settings view.
	 *
	 * @return void
	 */
	public function output_view_advanced() {
		?>
		<form action="<?php echo esc_url( $this->get_page_action_url() ); ?>" method="post">
			<?php
			wp_nonce_field( 'wpconsent_save_settings', 'wpconsent_save_settings_nonce' );
			?>

			<!-- Custom Iframe/Scripts - Individual PRO metabox -->
			<div style="position: relative">
				<div class="wpconsent-blur-area">
					<?php $this->metabox( __( 'Custom Iframe/Scripts', 'wpconsent-cookies-banner-privacy-suite' ), $this->get_custom_scripts_content() ); ?>
				</div>
				<?php
				echo self::get_upsell_box( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					esc_html__( 'Custom Scripts/iFrames is a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
					'<p>' . esc_html__( 'Upgrade to WPConsent PRO today and easily manage custom scripts and iframes. Take full control and block any scripts and iframes from loading until users give consent.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>',
					array(
						'text' => esc_html__( 'Upgrade to PRO and Unlock Custom Scripts', 'wpconsent-cookies-banner-privacy-suite' ),
						'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'advanced-page', 'main' ) ),
					),
					array(
						'text' => esc_html__( 'Learn more about all the features', 'wpconsent-cookies-banner-privacy-suite' ),
						'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'advanced-page', 'features' ) ),
					)
				);
				?>
			</div>

			<!-- Hide Banner Rules - Individual PRO metabox -->
			<div style="position: relative; margin-bottom: 20px;">
				<div class="wpconsent-blur-area">
					<?php $this->metabox( __( 'Hide Banner Rules', 'wpconsent-cookies-banner-privacy-suite' ), $this->get_display_rules_content_lite() ); ?>
				</div>
				<?php
				echo self::get_upsell_box( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					esc_html__( 'Hide Banner Rules is a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
					'<p>' . esc_html__( 'Control where and to whom the cookie banner is displayed. Hide the banner for specific user roles or on certain pages to improve user experience.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>',
					array(
						'text' => esc_html__( 'Upgrade to PRO and Unlock Hide Banner Rules', 'wpconsent-cookies-banner-privacy-suite' ),
						'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'advanced-page', 'hide-banner-rules' ) ),
					),
					array(
						'text' => esc_html__( 'Learn more about all the features', 'wpconsent-cookies-banner-privacy-suite' ),
						'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'advanced-page', 'features' ) ),
					)
				);
				?>
			</div>

			<?php
			// Advanced Settings - Available to Lite users (no blur)
			$this->metabox(
				__( 'Advanced Settings', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_advanced_settings_content()
			);
			?>
			<div class="wpconsent-submit">
				<button type="submit" name="save_changes" class="wpconsent-button wpconsent-button-primary">
					<?php esc_html_e( 'Save Changes', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
			</div>
		</form>
		<?php
	}

	/**
	 * Get the content for the custom scripts meta box.
	 *
	 * @return string
	 */
	public function get_custom_scripts_content() {
		ob_start();
		?>
		<div class="wpconsent-input-area-description">
			<p><?php esc_html_e( 'Add custom iframes or scripts that should be blocked until consent is given.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				<a target="_blank" rel="noopener noreferrer" href="<?php echo esc_url( wpconsent_utm_url( 'https://wpconsent.com/docs', 'advanced', 'learn-more' ) ); ?>">
					<?php esc_html_e( 'Learn more', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</a>
			</p>
		</div>

		<div class="wpconsent-custom-scripts-manager wpconsent-cookies-manager wpconsent-accordion">
			<?php
			$display_scripts = array(
					array(
							'id'               => 'custom_1',
							'service'          => 'Some Service',
							'type'             => 'script',
							'tag'              => '1234',
							'blocked_elements' => 'script[src*="yourservice.com"]',
							'category'         => 'statistics',
					),
					array(
							'id'               => 'custom_2',
							'service'          => 'Other Pixel',
							'type'             => 'script',
							'tag'              => 'abc',
							'blocked_elements' => 'script[src*="otherservice.com"]',
							'category'         => 'statistics',
					),
			);

			// Fetch categories from the database.
			$all_categories = wpconsent()->cookies->get_categories();
			$categories     = array();
			if ( isset( $all_categories['statistics'] ) ) {
				$categories[ $all_categories['statistics']['id'] ] = array(
						'name'        => esc_html( $all_categories['statistics']['name'] ) . ' ' . esc_html__( 'Scripts', 'wpconsent-cookies-banner-privacy-suite' ),
						'description' => esc_html__( 'Add scripts for analytics and statistics tracking.', 'wpconsent-cookies-banner-privacy-suite' ),
				);
			}
			if ( isset( $all_categories['marketing'] ) ) {
				$categories[ $all_categories['marketing']['id'] ] = array(
						'name'        => esc_html( $all_categories['marketing']['name'] ) . ' ' . esc_html__( 'Scripts', 'wpconsent-cookies-banner-privacy-suite' ),
						'description' => esc_html__( 'Add scripts for marketing and advertising purposes.', 'wpconsent-cookies-banner-privacy-suite' ),
				);
			}

			foreach ( $categories as $category_id => $category ) {
				?>
				<div class="wpconsent-accordion-item" data-category="<?php echo esc_attr( $category_id ); ?>">
					<div class="wpconsent-accordion-header">
						<h3><?php echo esc_html( $category['name'] ); ?></h3>
						<button class="wpconsent-accordion-toggle">
							<span class="dashicons dashicons-arrow-down-alt2"></span>
						</button>
					</div>
					<div class="wpconsent-accordion-content">
						<div class="wpconsent-cookie-category-description">
							<?php echo esc_html( $category['description'] ); ?>
						</div>
						<div class="wpconsent-cookies-list">
							<div class="wpconsent-cookie-header">
								<div class="script-service"><?php esc_html_e( 'Service', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
								<div class="script-type"><?php esc_html_e( 'Type', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
								<div class="script-script"><?php esc_html_e( 'Script', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
								<div class="script-blocked-elements"><?php esc_html_e( 'Blocked Elements', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
								<div class="script-actions"><?php esc_html_e( 'Actions', 'wpconsent-cookies-banner-privacy-suite' ); ?></div>
							</div>
							<?php
							$category_scripts = array();
							if ( isset( $all_categories['statistics'] ) && $category_id == $all_categories['statistics']['id'] ) { // phpcs:ignore WordPress.PHP.StrictComparisons.LooseComparison
								$category_scripts = $display_scripts;
							}

							foreach ( $category_scripts as $script ) {
								?>
								<div class="wpconsent-cookie-item">
									<div class="script-service"><?php echo esc_html( $script['service'] ); ?></div>
									<div class="script-type"><?php echo esc_html( 'iframe' === $script['type'] ? 'iFrame' : 'Script' ); ?></div>
									<div class="script-script"><?php echo esc_html( $script['tag'] ); ?></div>
									<div class="script-blocked-elements"><?php echo esc_html( $script['blocked_elements'] ); ?></div>
									<div class="cookie-actions">
										<button class="wpconsent-button-icon wpconsent-edit-script" type="button">
											<?php wpconsent_icon( 'edit', 15, 16 ); ?>
										</button>
										<button class="wpconsent-button-icon wpconsent-delete-script" type="button">
											<?php wpconsent_icon( 'delete', 14, 16 ); ?>
										</button>
									</div>
								</div>
								<?php
							}
							?>
						</div>
					</div>
				</div>
				<?php
			}
			?>
		</div>

		<div class="wpconsent-metabox-form-row">
			<button class="wpconsent-button wpconsent-button-primary wpconsent-add-script wpconsent-button-icon" type="button">
				<?php esc_html_e( 'Add Custom iFrame/Script', 'wpconsent-cookies-banner-privacy-suite' ); ?>
			</button>
		</div>

		<?php
		return ob_get_clean();
	}

	/**
	 * Get the content for the advanced settings meta box.
	 *
	 * @return string
	 */
	public function get_advanced_settings_content() {
		ob_start();

		$this->metabox_row(
				esc_html__( 'Clarity Consent Mode', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'clarity_consent_mode', true ),
						'clarity_consent_mode',
						sprintf(
						// translators: %1$s is an opening link tag, %2$s is a closing link tag.
								esc_html__( 'Use Microsoft Clarity without cookies until consent is given. %1$sLearn More%2$s', 'wpconsent-cookies-banner-privacy-suite' ),
								'<a target="_blank" rel="noopener noreferrer" href="' . esc_url( wpconsent_utm_url( 'https://wpconsent.com/docs/clarity-consent-mode', 'advanced', 'clarity-consent-mode' ) ) . '">',
								'</a>'
						)
				) . $this->help_icon( __( 'Clarity Consent Mode will not be loaded if the banner is disabled.', 'wpconsent-cookies-banner-privacy-suite' ), false ),
				'clarity_consent_mode'
		);

		$this->metabox_row(
				esc_html__( 'Shared Consent', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'enable_shared_consent' ),
						'enable_shared_consent',
						esc_html__( 'Share cookie preferences across all subdomains. MUST be enabled on all subdomain sites using WPConsent.', 'wpconsent-cookies-banner-privacy-suite' )
				) . $this->help_icon( __( 'Preferences set on example.com will automatically apply to blog.example.com, shop.example.com, and any other subdomain. All subdomain sites must have this setting enabled.', 'wpconsent-cookies-banner-privacy-suite' ), false ),
				'enable_shared_consent'
		);

		$this->metabox_row(
				esc_html__( 'Respect Global Privacy Controls', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'respect_gpc', false ),
						'respect_gpc',
						esc_html__( 'Automatically respect Global Privacy Control (GPC) signals from user browsers.', 'wpconsent-cookies-banner-privacy-suite' )
				) . $this->help_icon( __( 'When enabled, users with GPC enabled in their browser will automatically have non-essential cookies declined and will not see the consent banner. This helps comply with privacy regulations by respecting user-set privacy preferences.', 'wpconsent-cookies-banner-privacy-suite' ), false ),
				'respect_gpc'
		);

		$this->usage_tracking_input();

		$this->metabox_row(
				esc_html__( 'Reset to Defaults', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_reset_banner_content_button(),
				'',
				'',
				'',
				'',
				false,
				'reset-banner-content'
		);

		$this->metabox_row(
				esc_html__( 'Remove all data', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'uninstall_data', false ),
						'uninstall_data',
						esc_html__( 'Remove all data when uninstalling the plugin.', 'wpconsent-cookies-banner-privacy-suite' )
				) . $this->help_icon( __( 'All cookie data and configuration will be unrecoverable.', 'wpconsent-cookies-banner-privacy-suite' ), false ),
				'uninstall_data'
		);

		return ob_get_clean();
	}

	/**
	 * Get the reset banner content button.
	 *
	 * @return string
	 */
	public function get_reset_banner_content_button() {
		ob_start();
		?>
		<button class="wpconsent-button wpconsent-button-secondary" id="wpconsent-reset-banner-content" type="button">
			<?php
			esc_html_e( 'Reset Content to Defaults', 'wpconsent-cookies-banner-privacy-suite' );
			?>
		</button>
		<div class="wpconsent-input-area-description">
			<?php esc_html_e( 'This will reset all banner content and default categories/cookies (banner messages, preferences panel, button texts, categories, etc.) to the default English state. This action cannot be undone.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the content for the usage tracking input.
	 *
	 * @return void
	 */
	public function usage_tracking_input() {
		$this->metabox_row(
				esc_html__( 'Allow Usage Tracking', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
						wpconsent()->settings->get_option( 'usage_tracking' ),
						'usage_tracking',
						esc_html__( 'By allowing us to track usage data, we can better help you, as we will know which WordPress configurations, themes, and plugins we should test.', 'wpconsent-cookies-banner-privacy-suite' )
				),
				'usage_tracking'
		);
	}

	/**
	 * Output the IAB TCF view.
	 *
	 * @return void
	 */
	public function output_view_iabtcf() {
		// Get dummy data for preview.
		$dummy_data = $this->get_iab_tcf_dummy_data();

		?>
		<div style="position: relative; max-height: 700px; overflow: hidden;">
			<div class="wpconsent-blur-area">
				<?php $this->output_iab_tcf_preview( $dummy_data ); ?>
			</div>
			<?php
			echo WPConsent_Admin_Page::get_upsell_box( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					esc_html__( 'IAB TCF is a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
					'<p>' . esc_html__( 'Upgrade to WPConsent PRO today to enable IAB Transparency & Consent Framework v2.3 support. Manage vendor consents, publisher restrictions, and ensure compliance with the TCF specification.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>',
					array(
							'text' => esc_html__( 'Upgrade to PRO and Unlock IAB TCF', 'wpconsent-cookies-banner-privacy-suite' ),
							'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'iab-tcf-page', 'main' ) ),
					),
					array(
							'text' => esc_html__( 'Learn more about all the features', 'wpconsent-cookies-banner-privacy-suite' ),
							'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'iab-tcf-page', 'features' ) ),
					)
			);
			?>
		</div>
		<?php
	}

	/**
	 * Get dummy IAB TCF data for lite version preview.
	 *
	 * @return array Dummy data for preview.
	 */
	protected function get_iab_tcf_dummy_data() {
		return array(
				'purposes'         => array(
						1  => array( 'name' => 'Store and/or access information on a device' ),
						2  => array( 'name' => 'Select basic ads' ),
						3  => array( 'name' => 'Create a personalised ads profile' ),
						4  => array( 'name' => 'Select personalised ads' ),
						5  => array( 'name' => 'Create a personalised content profile' ),
						6  => array( 'name' => 'Select personalised content' ),
						7  => array( 'name' => 'Measure ad performance' ),
						8  => array( 'name' => 'Measure content performance' ),
						9  => array( 'name' => 'Apply market research to generate audience insights' ),
						10 => array( 'name' => 'Develop and improve products' ),
				),
				'special_purposes' => array(
						1 => array( 'name' => 'Ensure security, prevent fraud, and debug' ),
						2 => array( 'name' => 'Technically deliver ads or content' ),
				),
		);
	}

	/**
	 * Output IAB TCF preview with dummy data for lite version.
	 *
	 * @param array $dummy_data Dummy data for preview.
	 *
	 * @return void
	 */
	protected function output_iab_tcf_preview( $dummy_data ) {
		$purposes = $dummy_data['purposes'];
		?>
		<form action="<?php echo esc_url( $this->get_page_action_url() ); ?>" method="post">
			<?php wp_nonce_field( 'save_iab_tcf_vendors', 'iab_tcf_vendors_nonce' ); ?>
			<input type="hidden" name="action" value="save_iab_tcf_vendors">

			<?php
			// TCF Activation metabox.
			ob_start();
			$toggle_html = '<label class="wpconsent-toggle">';

			$toggle_html .= '<input type="checkbox" disabled="disabled">';
			$toggle_html .= '<span class="wpconsent-toggle-slider"></span>';
			$toggle_html .= '</label>';

			$this->metabox_row(
				__( 'Enable TCF on Frontend', 'wpconsent-cookies-banner-privacy-suite' ),
				$toggle_html,
				'iab_tcf_frontend_enabled',
				'',
				'',
				__( 'Enable this setting to load the IAB TCF (Transparency and Consent Framework) on the frontend of your website.', 'wpconsent-cookies-banner-privacy-suite' )
			);
			$frontend_content = ob_get_clean();

			$this->metabox( __( 'TCF Activation', 'wpconsent-cookies-banner-privacy-suite' ), $frontend_content );
			?>

			<?php $this->output_global_vendor_restrictions_preview( $purposes ); ?>

			<?php $this->output_publisher_declarations_preview( $purposes ); ?>
		</form>
		<?php
	}

	/**
	 * Output global vendor restrictions section for preview.
	 *
	 * @param array $purposes The purposes array.
	 *
	 * @return void
	 */
	protected function output_global_vendor_restrictions_preview( $purposes ) {
		// Buffer the metabox content.
		ob_start();
		?>
		<?php
		// Legitimate Interest dropdown.
		$li_select = '<select id="global_disallow_li" name="global_disallow_li" class="wpconsent-select" disabled="disabled">';

		$li_select .= '<option value="allow" selected>' . esc_html__( 'Allow Legitimate Interest (Default)', 'wpconsent-cookies-banner-privacy-suite' ) . '</option>';
		$li_select .= '<option value="disallow_all">' . esc_html__( 'Disallow Legitimate Interest for All Purposes', 'wpconsent-cookies-banner-privacy-suite' ) . '</option>';
		$li_select .= '<option value="disallow_specific">' . esc_html__( 'Disallow Legitimate Interest for Specific Purposes', 'wpconsent-cookies-banner-privacy-suite' ) . '</option>';
		$li_select .= '</select>';

		$this->metabox_row(
				__( 'Legitimate Interest', 'wpconsent-cookies-banner-privacy-suite' ),
				$li_select,
				'global_disallow_li',
				'',
				'',
				__( 'Control whether vendors can use legitimate interest as a legal basis for data processing.', 'wpconsent-cookies-banner-privacy-suite' )
		);
		?>
		<div class="wpconsent-metabox-form-row wpconsent-global-li-purposes" style="display: none;">
			<div class="wpconsent-metabox-form-row-label">
				<label for="global_disallow_li_purposes">
					<?php esc_html_e( 'Select Purposes', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</label>
			</div>
			<div class="wpconsent-metabox-form-row-input">
				<div class="wpconsent-checkbox-group">
					<?php foreach ( $purposes as $purpose_id => $purpose ) : ?>
						<label class="wpconsent-checkbox-label">
							<input type="checkbox" name="global_disallow_li_purposes[]" value="<?php echo esc_attr( $purpose_id ); ?>" disabled="disabled">
							<span>
								<?php
								// Translators: 1: Purpose ID, 2: Purpose Name.
								echo esc_html( sprintf( __( 'Purpose %1$d: %2$s', 'wpconsent-cookies-banner-privacy-suite' ), $purpose_id, $purpose['name'] ) );
								?>
							</span>
						</label>
					<?php endforeach; ?>
				</div>
				<div class="wpconsent-metabox-form-row-description">
					<?php esc_html_e( 'Select specific purposes for which legitimate interest should be disallowed globally.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</div>
			</div>
		</div>
		<?php
		$content = ob_get_clean();

		// Output the metabox.
		$this->metabox(
				__( 'Global Vendor Restrictions', 'wpconsent-cookies-banner-privacy-suite' ),
				$content,
				__( 'Apply restrictions to all vendors at once. These settings allow you to enforce stricter data policies across all selected vendors.', 'wpconsent-cookies-banner-privacy-suite' )
		);
	}

	/**
	 * Output publisher data processing declarations section for preview.
	 *
	 * @param array $purposes The purposes array.
	 *
	 * @return void
	 */
	protected function output_publisher_declarations_preview( $purposes ) {
		// Default all purposes to enabled for preview.
		$purposes_consent = array_keys( $purposes );

		// Default legitimate interest purposes to enabled (only 2, 7, 9, 10 are allowed per TCF policy).
		$li_allowed_purposes = array( 2, 7, 9, 10 );
		$purposes_li         = $li_allowed_purposes;

		// Buffer the metabox content.
		ob_start();
		?>

		<p class="wpconsent-field-description">
			<?php esc_html_e( 'Declare which TCF purposes this website (as a first party) uses for its own data processing. These declarations are separate from vendor consents and communicate your website\'s data processing activities to vendors via the TC String.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
		</p>

		<!-- Publisher Purposes (Consent) -->
		<div class="wpconsent-publisher-declarations-section">
			<div class="wpconsent-section-header">
				<button type="button" class="wpconsent-section-toggle" aria-expanded="false" disabled="disabled">
					<span class="dashicons dashicons-arrow-right"></span>
					<strong><?php esc_html_e( 'Purposes (Consent)', 'wpconsent-cookies-banner-privacy-suite' ); ?></strong>
					<span class="wpconsent-section-count">(<?php echo count( $purposes_consent ); ?>/<?php echo count( $purposes ); ?> <?php esc_html_e( 'selected', 'wpconsent-cookies-banner-privacy-suite' ); ?>)</span>
				</button>
			</div>
			<div class="wpconsent-section-content" style="display: none;">
				<p class="wpconsent-field-description">
					<?php esc_html_e( 'Select each purpose this website requests consent for.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</p>
				<div class="wpconsent-checkbox-group">
					<?php
					foreach ( $purposes as $purpose_id => $purpose ) {
						$checked = in_array( $purpose_id, $purposes_consent, true );
						?>
						<label class="wpconsent-checkbox-label">
							<input type="checkbox" name="publisher_purposes_consent[]" value="<?php echo esc_attr( $purpose_id ); ?>" <?php checked( $checked ); ?> disabled="disabled">
							<span>
								<?php
								printf(
										'<strong>%s:</strong> %s',
										// Translators: Purpose ID.
										esc_html( sprintf( __( 'Purpose %d', 'wpconsent-cookies-banner-privacy-suite' ), $purpose_id ) ),
										esc_html( $purpose['name'] )
								);
								?>
							</span>
						</label>
						<?php
					}
					?>
				</div>
			</div>
		</div>

		<!-- Publisher Purposes (Legitimate Interest) -->
		<div class="wpconsent-publisher-declarations-section">
			<div class="wpconsent-section-header">
				<button type="button" class="wpconsent-section-toggle" aria-expanded="false" disabled="disabled">
					<span class="dashicons dashicons-arrow-right"></span>
					<strong><?php esc_html_e( 'Purposes (Legitimate Interest)', 'wpconsent-cookies-banner-privacy-suite' ); ?></strong>
					<?php
					$li_total = count( $li_allowed_purposes );
					?>
					<span class="wpconsent-section-count">
						<?php
						printf(
							/* translators: 1: number of selected purposes, 2: total number of available purposes. */
							esc_html__( '(%1$d/%2$d selected)', 'wpconsent-cookies-banner-privacy-suite' ),
							count( $purposes_li ),
							absint( $li_total )
						);
						?>
					</span>
				</button>
			</div>
			<div class="wpconsent-section-content" style="display: none;">
				<p class="wpconsent-field-description">
					<?php esc_html_e( 'Select each purpose this website claims legitimate interest for. Only certain purposes allow legitimate interest under TCF policy.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</p>
				<div class="wpconsent-checkbox-group">
					<?php
					// Only purposes 2, 7, 9, 10 allow legitimate interest per TCF policy.
					foreach ( $purposes as $purpose_id => $purpose ) {
						if ( ! in_array( $purpose_id, $li_allowed_purposes, true ) ) {
							continue;
						}
						$checked = in_array( $purpose_id, $purposes_li, true );
						printf(
							'<label class="wpconsent-checkbox-label">
								<input type="checkbox" name="publisher_purposes_li[]" value="%1$s" %2$s disabled="disabled">
								<span><strong>%3$s:</strong> %4$s</span>
							</label>',
							esc_attr( $purpose_id ),
							checked( $checked, true, false ),
							// Translators: Purpose ID.
							esc_html( sprintf( __( 'Purpose %d', 'wpconsent-cookies-banner-privacy-suite' ), $purpose_id ) ),
							esc_html( $purpose['name'] )
						);
					}
					?>
				</div>
			</div>
		</div>

		<?php
		$content = ob_get_clean();

		$this->metabox(
				__( 'Publisher Data Processing Declarations', 'wpconsent-cookies-banner-privacy-suite' ),
				$content,
				__( 'Declare which TCF purposes your website uses for its own data processing. These declarations are encoded in the TC String and communicated to vendors.', 'wpconsent-cookies-banner-privacy-suite' )
		);
	}

	/**
	 * Output vendor controls (search, filters, sorting) for preview.
	 *
	 * @param int $total_vendors Total number of vendors.
	 *
	 * @return void
	 */
	protected function output_vendor_controls_preview( $total_vendors ) {
		?>
		<div class="wpconsent-vendor-controls">
			<div class="wpconsent-vendor-controls-row">
				<div class="wpconsent-vendor-search">
					<input type="text"
					       id="vendor-search"
					       placeholder="<?php esc_attr_e( 'Search vendors by name or ID...', 'wpconsent-cookies-banner-privacy-suite' ); ?>"
					       class="wpconsent-input-text"
					       disabled="disabled">
					<button type="button" class="wpconsent-button wpconsent-button-secondary" id="vendor-search-btn" disabled="disabled">
						<?php esc_html_e( 'Search', 'wpconsent-cookies-banner-privacy-suite' ); ?>
					</button>
					<button type="button" class="wpconsent-button wpconsent-button-secondary" id="vendor-clear-search" style="display: none;" disabled="disabled">
						<?php esc_html_e( 'Clear', 'wpconsent-cookies-banner-privacy-suite' ); ?>
					</button>
				</div>
				<div class="wpconsent-vendor-filters">
					<select id="vendor-status-filter" class="wpconsent-select" disabled="disabled">
						<option value=""><?php esc_html_e( 'All Vendors', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
						<option value="selected"><?php esc_html_e( 'Selected', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
						<option value="not_selected"><?php esc_html_e( 'Not Selected', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
					</select>
					<select id="vendor-sort-order" class="wpconsent-select" disabled="disabled">
						<option value="name_asc"><?php esc_html_e( 'Name A-Z', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
						<option value="name_desc"><?php esc_html_e( 'Name Z-A', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
						<option value="id_asc"><?php esc_html_e( 'ID Low-High', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
						<option value="id_desc"><?php esc_html_e( 'ID High-Low', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
					</select>
				</div>
			</div>
			<div class="wpconsent-vendor-results-info">
				<span>
					<?php
						printf(
							// Translators: %d is the total number of vendors.
							esc_html__( 'Showing %d vendors', 'wpconsent-cookies-banner-privacy-suite' ),
							absint( $total_vendors )
						);
					?>
				</span>
			</div>
			<div class="wpconsent-vendor-save-section">
				<button type="submit" class="wpconsent-button wpconsent-button-primary" id="wpconsent-save-vendors" disabled="disabled">
					<?php esc_html_e( 'Save Changes', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
			</div>
		</div>
		<?php
	}

	/**
	 * Output global vendor restrictions section.
	 *
	 * @param array $purposes The purposes array.
	 * @param array $publisher_restrictions The publisher restrictions array.
	 *
	 * @return void
	 */
	protected function output_global_vendor_restrictions( $purposes, $publisher_restrictions ) {
		// Get global restrictions.
		$global_restrictions  = isset( $publisher_restrictions['global'] ) ? $publisher_restrictions['global'] : array();
		$disallow_li_purposes = isset( $global_restrictions['disallow_li_purposes'] ) ? $global_restrictions['disallow_li_purposes'] : array();

		// Buffer the metabox content.
		ob_start();
		?>
		<?php
		// Legitimate Interest dropdown.
		$li_select = '<select id="global_disallow_li" name="global_disallow_li" class="wpconsent-select">';
		$li_select .= '<option value="allow"' . selected( empty( $disallow_li_purposes ), true, false ) . '>' . esc_html__( 'Allow Legitimate Interest (Default)', 'wpconsent-cookies-banner-privacy-suite' ) . '</option>';
		$li_select .= '<option value="disallow_all"' . selected( in_array( 'all', $disallow_li_purposes, true ), true, false ) . '>' . esc_html__( 'Disallow Legitimate Interest for All Purposes', 'wpconsent-cookies-banner-privacy-suite' ) . '</option>';
		$li_select .= '<option value="disallow_specific"' . selected( ! empty( $disallow_li_purposes ) && ! in_array( 'all', $disallow_li_purposes, true ), true, false ) . '>' . esc_html__( 'Disallow Legitimate Interest for Specific Purposes', 'wpconsent-cookies-banner-privacy-suite' ) . '</option>';
		$li_select .= '</select>';

		$this->metabox_row(
				__( 'Legitimate Interest', 'wpconsent-cookies-banner-privacy-suite' ),
				$li_select,
				'global_disallow_li',
				'',
				'',
				__( 'Control whether vendors can use legitimate interest as a legal basis for data processing.', 'wpconsent-cookies-banner-privacy-suite' )
		);

		// Purpose checkboxes (conditional).
		$show_if_style = ( ! empty( $disallow_li_purposes ) && ! in_array( 'all', $disallow_li_purposes, true ) ) ? '' : 'display: none;';
		?>
		<div class="wpconsent-metabox-form-row wpconsent-global-li-purposes" data-show-if-id="#global_disallow_li" data-show-if-value="disallow_specific" style="<?php echo esc_attr( $show_if_style ); ?>">
			<div class="wpconsent-metabox-form-row-label">
				<label for="global_disallow_li_purposes">
					<?php esc_html_e( 'Select Purposes', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</label>
			</div>
			<div class="wpconsent-metabox-form-row-input">
				<div class="wpconsent-checkbox-group">
					<?php foreach ( $purposes as $purpose_id => $purpose ) : ?>
						<label class="wpconsent-checkbox-label">
							<input type="checkbox" name="global_disallow_li_purposes[]" value="<?php echo esc_attr( $purpose_id ); ?>" <?php checked( in_array( $purpose_id, $disallow_li_purposes, true ), true ); ?>>
							<span>
								<?php
								// Translators: 1: Purpose ID, 2: Purpose Name.
								echo esc_html( sprintf( __( 'Purpose %1$d: %2$s', 'wpconsent-cookies-banner-privacy-suite' ), $purpose_id, $purpose['name'] ) );
								?>
							</span>
						</label>
					<?php endforeach; ?>
				</div>
				<div class="wpconsent-metabox-form-row-description">
					<?php esc_html_e( 'Select specific purposes for which legitimate interest should be disallowed globally.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</div>
			</div>
		</div>
		<?php
		$content = ob_get_clean();

		// Output the metabox.
		$this->metabox(
				__( 'Global Vendor Restrictions', 'wpconsent-cookies-banner-privacy-suite' ),
				$content,
				__( 'Apply restrictions to all vendors at once. These settings allow you to enforce stricter data policies across all selected vendors.', 'wpconsent-cookies-banner-privacy-suite' )
		);
	}

	/**
	 * Output publisher data processing declarations section.
	 *
	 * @param array $purposes The purposes array.
	 *
	 * @return void
	 */
	protected function output_publisher_declarations( $purposes ) {
		// Get saved publisher declarations.
		$declarations = wpconsent()->settings->get_option( 'iab_tcf_publisher_declarations', array() );

		// Check if this is the first time (no saved declarations). If so, enable all by default.
		$is_first_time = empty( $declarations );

		if ( $is_first_time ) {
			// Default all purposes to enabled.
			$purposes_consent = array_keys( $purposes );

			// Default legitimate interest purposes to enabled (only 2, 7, 9, 10 are allowed per TCF policy).
			$li_allowed_purposes = array( 2, 7, 9, 10 );
			$purposes_li         = array_intersect( $li_allowed_purposes, array_keys( $purposes ) );
		} else {
			// Load saved values.
			$purposes_consent = isset( $declarations['purposes_consent'] ) ? $declarations['purposes_consent'] : array();
			$purposes_li      = isset( $declarations['purposes_li_transparency'] ) ? $declarations['purposes_li_transparency'] : array();
		}

		// Buffer the metabox content.
		ob_start();
		?>

		<p class="wpconsent-field-description">
			<?php esc_html_e( 'Declare which TCF purposes this website (as a first party) uses for its own data processing. These declarations are separate from vendor consents and communicate your website\'s data processing activities to vendors via the TC String.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
		</p>

		<!-- Publisher Purposes (Consent) -->
		<div class="wpconsent-publisher-declarations-section">
			<div class="wpconsent-section-header">
				<button type="button" class="wpconsent-section-toggle" aria-expanded="false">
					<span class="dashicons dashicons-arrow-right"></span>
					<strong><?php esc_html_e( 'Purposes (Consent)', 'wpconsent-cookies-banner-privacy-suite' ); ?></strong>
					<span class="wpconsent-section-count">(<?php echo count( $purposes_consent ); ?>/<?php echo count( $purposes ); ?> <?php esc_html_e( 'selected', 'wpconsent-cookies-banner-privacy-suite' ); ?>)</span>
				</button>
			</div>
			<div class="wpconsent-section-content" style="display: none;">
				<p class="wpconsent-field-description">
					<?php esc_html_e( 'Select each purpose this website requests consent for.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</p>
				<div class="wpconsent-checkbox-group">
					<?php
					foreach ( $purposes as $purpose_id => $purpose ) {
						$checked = in_array( $purpose_id, $purposes_consent, true );
						printf(
							'<label class="wpconsent-checkbox-label">
								<input type="checkbox" name="publisher_purposes_consent[]" value="%1$s" %2$s>
								<span><strong>%3$s:</strong> %4$s</span>
							</label>',
							esc_attr( $purpose_id ),
							checked( $checked, true, false ),
							// Translators: Purpose ID.
							esc_html( sprintf( __( 'Purpose %d', 'wpconsent-cookies-banner-privacy-suite' ), $purpose_id ) ),
							esc_html( $purpose['name'] )
						);
					}
					?>
				</div>
			</div>
		</div>

		<!-- Publisher Purposes (Legitimate Interest) -->
		<div class="wpconsent-publisher-declarations-section">
			<div class="wpconsent-section-header">
				<button type="button" class="wpconsent-section-toggle" aria-expanded="false">
					<span class="dashicons dashicons-arrow-right"></span>
					<strong><?php esc_html_e( 'Purposes (Legitimate Interest)', 'wpconsent-cookies-banner-privacy-suite' ); ?></strong>
					<?php
					$li_allowed_purposes = array( 2, 7, 9, 10 );
					$li_total            = count( $li_allowed_purposes );
					?>
					<span class="wpconsent-section-count">
						<?php
						printf(
							/* translators: 1: number of selected purposes, 2: total number of available purposes. */
							esc_html__( '(%1$d/%2$d selected)', 'wpconsent-cookies-banner-privacy-suite' ),
							count( $purposes_li ),
							absint( $li_total )
						);
						?>
					</span>
				</button>
			</div>
			<div class="wpconsent-section-content" style="display: none;">
				<p class="wpconsent-field-description">
					<?php esc_html_e( 'Select each purpose this website claims legitimate interest for. Only certain purposes allow legitimate interest under TCF policy.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</p>
				<div class="wpconsent-checkbox-group">
					<?php
					// Only purposes 2, 7, 9, 10 allow legitimate interest per TCF policy.
					foreach ( $purposes as $purpose_id => $purpose ) {
						if ( ! in_array( $purpose_id, $li_allowed_purposes, true ) ) {
							continue;
						}
						$checked = in_array( $purpose_id, $purposes_li, true );
						printf(
							'<label class="wpconsent-checkbox-label">
								<input type="checkbox" name="publisher_purposes_li[]" value="%1$s" %2$s>
								<span><strong>%3$s:</strong> %4$s</span>
							</label>',
							esc_attr( $purpose_id ),
							checked( $checked, true, false ),
							// Translators: Purpose ID.
							esc_html( sprintf( __( 'Purpose %d', 'wpconsent-cookies-banner-privacy-suite' ), $purpose_id ) ),
							esc_html( $purpose['name'] )
						);
					}
					?>
				</div>
			</div>
		</div>

		<?php
		$content = ob_get_clean();

		$this->metabox(
				__( 'Publisher Data Processing Declarations', 'wpconsent-cookies-banner-privacy-suite' ),
				$content,
				__( 'Declare which TCF purposes your website uses for its own data processing. These declarations are encoded in the TC String and communicated to vendors.', 'wpconsent-cookies-banner-privacy-suite' )
		);
	}
}
