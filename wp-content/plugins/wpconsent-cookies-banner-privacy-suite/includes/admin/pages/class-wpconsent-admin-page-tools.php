<?php
/**
 * Admin page for Tools (Import, Export, Database).
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Admin_Page_Tools.
 */
class WPConsent_Admin_Page_Tools extends WPConsent_Admin_Page {

	/**
	 * Page slug.
	 *
	 * @var string
	 */
	public $page_slug = 'wpconsent-tools';

	/**
	 * Default view.
	 *
	 * @var string
	 */
	public $view = 'import';

	use WPConsent_Input_Select;

	/**
	 * Call this just to set the page title translatable.
	 */
	public function __construct() {
		$this->page_title = __( 'Tools', 'wpconsent-cookies-banner-privacy-suite' );
		$this->menu_title = __( 'Tools', 'wpconsent-cookies-banner-privacy-suite' );
		parent::__construct();
	}

	/**
	 * Page specific Hooks.
	 *
	 * @return void
	 */
	public function page_hooks() {
		$this->views = array(
			'import'   => __( 'Import', 'wpconsent-cookies-banner-privacy-suite' ),
			'export'   => __( 'Export', 'wpconsent-cookies-banner-privacy-suite' ),
			'database' => __( 'Database', 'wpconsent-cookies-banner-privacy-suite' ),
			'info'     => __( 'System Info', 'wpconsent-cookies-banner-privacy-suite' ),
		);
		$this->process_message();
		add_action( 'admin_init', array( $this, 'handle_import_submit' ) );
		add_action( 'admin_init', array( $this, 'handle_export_submit' ) );
		add_action( 'admin_init', array( $this, 'handle_clear_cache_submit' ) );
		add_filter( 'wpconsent_admin_js_data', array( $this, 'add_js_data' ) );
	}

	/**
	 * Add the strings for the js data.
	 *
	 * @param array $data The localized data we already have.
	 *
	 * @return array
	 */
	public function add_js_data( $data ) {
		$data['custom_scripts_export'] = array(
			'title' => esc_html__( 'Custom Scripts Export is a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
			'text'  => esc_html__( 'Upgrade to WPConsent PRO today and easily manage custom scripts and iframes. Take full control and block any scripts and iframes from loading until users give consent.', 'wpconsent-cookies-banner-privacy-suite' ),
			'url'   => wpconsent_utm_url( 'https://wpconsent.com/lite', 'import-export', 'custom-scripts-export' ),
		);
		$data['consent_logs_export']   = array(
			'title' => esc_html__( 'Consent Logs Export is a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
			'text'  => esc_html__( 'Upgrade to WPConsent PRO today and easily export your consent logs. Monitor who accepted your cookie banner and when.', 'wpconsent-cookies-banner-privacy-suite' ),
			'url'   => wpconsent_utm_url( 'https://wpconsent.com/lite', 'export-consent-logs', 'custom-scripts-export' ),
		);
		$data['do_not_track_export']   = array(
			'title' => esc_html__( 'Do Not Sell Export is a premium feature', 'wpconsent-cookies-banner-privacy-suite' ),
			'text'  => esc_html__( 'Upgrade to WPConsent Plus or higher plans today and easily export your Do Not Sell requests. With the Do Not Sell addon you can easily manage "Do Not Sell My Personal Information" directly from your website.', 'wpconsent-cookies-banner-privacy-suite' ),
			'url'   => wpconsent_utm_url( 'https://wpconsent.com/lite', 'export-do-not-track', 'custom-scripts-export' ),
		);
		$data['consent_logs_delete']   = array(
			'title' => esc_html__( 'Consent Logs are a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
			'text'  => esc_html__( 'Upgrade to WPConsent PRO to track consent logs and manage them. Monitor who accepted your cookie banner and when. Delete old records based on age thresholds for data retention compliance.', 'wpconsent-cookies-banner-privacy-suite' ),
			'url'   => wpconsent_utm_url( 'https://wpconsent.com/lite', 'delete-consent-logs', 'database-page' ),
		);
		$data['do_not_track_delete']   = array(
			'title' => esc_html__( 'Do Not Sell Requests are a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
			'text'  => esc_html__( 'Upgrade to WPConsent PRO to track Do Not Sell requests and manage them. Monitor who requested to be excluded from tracking. Delete old records based on age thresholds for data retention compliance.', 'wpconsent-cookies-banner-privacy-suite' ),
			'url'   => wpconsent_utm_url( 'https://wpconsent.com/lite', 'delete-do-not-track', 'database-page' ),
		);

		return $data;
	}

	/**
	 * Handle the import submission.
	 *
	 * @return void
	 */
	public function handle_import_submit() {
		// Check if this is an import request.
		if ( ! isset( $_POST['wpconsent_import'] ) ) {
			return;
		}

		// Verify nonce for import.
		if ( ! isset( $_POST['wpconsent_import_settings_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['wpconsent_import_settings_nonce'] ), 'wpconsent_import_settings' ) ) {
			wp_die( esc_html__( 'Security check failed.', 'wpconsent-cookies-banner-privacy-suite' ) );
		}

		$this->handle_import();
	}

	/**
	 * Handle the export submission.
	 *
	 * @return void
	 */
	public function handle_export_submit() {
		// Check if this is an import request.
		if ( ! isset( $_POST['wpconsent_export'] ) ) {
			return;
		}

		// Verify nonce for import.
		if ( ! isset( $_POST['wpconsent_export_settings_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['wpconsent_export_settings_nonce'] ), 'wpconsent_export_settings' ) ) {
			wp_die( esc_html__( 'Security check failed.', 'wpconsent-cookies-banner-privacy-suite' ) );
		}

		$this->handle_export();
	}

	/**
	 * Handle the clear cache submission.
	 *
	 * @return void
	 */
	public function handle_clear_cache_submit() {
		// Check if this is a clear cache request.
		if ( ! isset( $_POST['wpconsent_clear_cache'] ) ) {
			return;
		}

		// Verify nonce for clear cache.
		if ( ! isset( $_POST['wpconsent_clear_cache_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['wpconsent_clear_cache_nonce'] ), 'wpconsent_clear_cache' ) ) {
			wp_die( esc_html__( 'Security check failed.', 'wpconsent-cookies-banner-privacy-suite' ) );
		}

		$this->handle_clear_cache();
	}

	/**
	 * Output the import view.
	 *
	 * @return void
	 */
	public function output_view_import() {
		?>
		<form action="<?php echo esc_url( $this->get_page_action_url() ); ?>" method="post" enctype="multipart/form-data">
			<?php
			wp_nonce_field( 'wpconsent_import_settings', 'wpconsent_import_settings_nonce' );
			$this->metabox(
				__( 'Import Settings', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_import_settings_content()
			);
			?>
		</form>
		<?php
	}

	/**
	 * Output the export view.
	 *
	 * @return void
	 */
	public function output_view_export() {
		?>
		<form action="<?php echo esc_url( $this->get_page_action_url() ); ?>" method="post" enctype="multipart/form-data">
			<?php
			wp_nonce_field( 'wpconsent_export_settings', 'wpconsent_export_settings_nonce' );
			$this->metabox(
				__( 'Export Settings', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_export_settings_content()
			);
			?>
		</form>
		<?php
		$this->metabox(
			__( 'Export Logs', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_export_logs_content()
		);
	}

	/**
	 * Output the database view.
	 *
	 * @return void
	 */
	public function output_view_database() {
		?>
		<form action="<?php echo esc_url( $this->get_page_action_url() ); ?>" method="post">
			<?php
			wp_nonce_field( 'wpconsent_clear_cache', 'wpconsent_clear_cache_nonce' );
			$this->metabox(
				__( 'Database Settings', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_database_settings_content()
			);
			?>
		</form>
		<?php
		$this->metabox(
			__( 'Clear Consent Logs', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_delete_consent_logs_row()
		);

		$this->metabox(
			__( 'Clear Do Not Sell Logs', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_delete_dnt_logs_row()
		);
	}

	/**
	 * The System Info view.
	 *
	 * @return void
	 */
	public function output_view_info() {
		$this->metabox(
			__( 'System Information', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_system_info_content()
		);

		$this->metabox(
			__( 'Test SSL Connections', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_ssl_test_content()
		);
	}

	/**
	 * Get the import settings content.
	 *
	 * @return string
	 */
	public function get_import_settings_content() {
		ob_start();
		?>
		<div class="wpconsent-input-area-description">
			<p><?php esc_html_e( 'Import your WPConsent settings from a JSON file. This will overwrite your current settings.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
		</div>

		<div class="wpconsent-metabox-form-row">
			<div class="wpconsent-file-upload">
				<input type="file" name="import_file" id="wpconsent-import-file" class="inputfile" data-multiple-caption="{count} files selected" accept=".json">
				<label for="wpconsent-import-file">
					<span class="wpconsent-file-field"><span class="placeholder"><?php esc_html_e( 'No file chosen', 'wpconsent-cookies-banner-privacy-suite' ); ?></span></span>
					<strong class="wpconsent-button wpconsent-button-secondary wpconsent-button-icon">
						<?php esc_html_e( 'Choose a file&hellip;', 'wpconsent-cookies-banner-privacy-suite' ); ?>
					</strong>
				</label>
			</div>
		</div>

		<div class="wpconsent-metabox-form-row">
			<button type="submit" name="wpconsent_import" class="wpconsent-button wpconsent-button-primary">
				<?php esc_html_e( 'Import Settings', 'wpconsent-cookies-banner-privacy-suite' ); ?>
			</button>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the export settings content.
	 *
	 * @return string
	 */
	public function get_export_settings_content() {
		ob_start();
		?>
		<div class="wpconsent-input-area-description">
			<p><?php esc_html_e( 'Export your WPConsent settings to a JSON file. You can use this file to import your settings on another site.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
		</div>

		<div class="wpconsent-export-options">
			<?php
			$this->metabox_row(
				esc_html__( 'All Settings', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
					false,
					'export_all_settings',
					esc_html__( 'Export WPConsent settings including geolocation, multilanguage, and general settings.', 'wpconsent-cookies-banner-privacy-suite' )
				)
			);

			$this->metabox_row(
				esc_html__( 'Banner Design', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
					false,
					'export_banner_design',
					esc_html__( 'Export only the banner design settings including layout, colors, and text.', 'wpconsent-cookies-banner-privacy-suite' )
				)
			);

			$this->metabox_row(
				esc_html__( 'Cookie Data', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
					false,
					'export_cookie_data',
					esc_html__( 'Export cookie categories, services, and individual cookie information.', 'wpconsent-cookies-banner-privacy-suite' )
				)
			);

			$this->export_custom_scripts_input();
			?>
		</div>

		<div class="wpconsent-metabox-form-row">
			<button type="submit" name="wpconsent_export" class="wpconsent-button wpconsent-button-primary">
				<?php esc_html_e( 'Export Settings', 'wpconsent-cookies-banner-privacy-suite' ); ?>
			</button>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the export logs content.
	 *
	 * @return string
	 */
	public function get_export_logs_content() {
		ob_start();

		$this->metabox_row(
			esc_html__( 'Consent Logs', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_export_records_of_consent_button(),
			'',
			'',
			'',
			'',
			true,
			'export-records-of-consent-lite'
		);

		$this->metabox_row(
			esc_html__( 'Do Not Sell Logs', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_export_do_not_track_button(),
			'',
			'',
			'',
			'',
			true,
			'export-do-not-track-lite'
		);

		return ob_get_clean();
	}

	/**
	 * Get the system information content.
	 *
	 * @return string
	 */
	public function get_system_info_content() {
		ob_start();
		?>
		<textarea class="info-area" readonly style="width: 100%; min-height: 500px; font-family: monospace; font-size: 12px; padding: 10px;"><?php echo esc_textarea( $this->get_system_info() ); ?></textarea>
		<hr/>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the SSL test content.
	 *
	 * @return string
	 */
	public function get_ssl_test_content() {
		ob_start();
		$this->metabox_row(
			esc_html__( 'Test SSL Connections', 'wpconsent-cookies-banner-privacy-suite' ),
			'<button type="button" id="wpconsent-ssl-verify" class="wpconsent-button">' . esc_html__( 'Test Connection', 'wpconsent-cookies-banner-privacy-suite' ) . '</button>',
			'',
			'',
			'',
			'',
			false,
			'test-ssl-connections'
		);
		return ob_get_clean();
	}

	/**
	 * Get the database settings content.
	 *
	 * @return string
	 */
	public function get_database_settings_content() {
		ob_start();

		// Get the latest cache creation timestamp.
		$latest_timestamp = $this->get_latest_cache_timestamp();

		?>
		<div class="wpconsent-input-area-description">
			<p>
				<?php esc_html_e( 'Cache Status:', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				<?php
				if ( 0 === $latest_timestamp ) {
					echo esc_html__( 'Already Cleared', 'wpconsent-cookies-banner-privacy-suite' );
				} else {
					/* translators: %s: formatted time string (e.g., "2 hours") */
					printf(
						/* translators: %s: formatted time string (e.g., "2 hours") */
						esc_html__( 'Last created %s ago', 'wpconsent-cookies-banner-privacy-suite' ),
						esc_html( human_time_diff( $latest_timestamp, time() ) )
					);
				}
				?>
			</p>
		</div>
		<?php

		$this->metabox_row(
			esc_html__( 'Clear Cookies Cache', 'wpconsent-cookies-banner-privacy-suite' ),
			'<button type="submit" name="wpconsent_clear_cache" class="wpconsent-button wpconsent-button-secondary">' . esc_html__( 'Clear Cache', 'wpconsent-cookies-banner-privacy-suite' ) . '</button>',
			'',
			'',
			'',
			'',
			false,
			'clear-cookies-cache'
		);

		return ob_get_clean();
	}

	/**
	 * Get the latest cache creation timestamp.
	 *
	 * @return int Unix timestamp of when the most recent cache was created, or 0 if no cache exists.
	 */
	protected function get_latest_cache_timestamp() {
		$transient_keys = array(
			'wpconsent_needs_google_consent',
			'wpconsent_preference_cookies',
			'wpconsent_preference_slugs',
		);

		$latest_timestamp = 0;

		foreach ( $transient_keys as $transient_key ) {
			// Check if transient exists.
			$transient_value = get_transient( $transient_key );

			if ( false !== $transient_value ) {
				// Get the transient timeout to determine when it was created.
				$timeout = get_option( '_transient_timeout_' . $transient_key );

				if ( $timeout ) {
					// Calculate when the transient was created.
					// All transients expire after DAY_IN_SECONDS (86400 seconds).
					$expiration_duration = DAY_IN_SECONDS;

					$created_timestamp = $timeout - $expiration_duration;

					if ( $created_timestamp > $latest_timestamp ) {
						$latest_timestamp = $created_timestamp;
					}
				}
			}
		}

		return $latest_timestamp;
	}

	/**
	 * Get the export Records of Consent button.
	 *
	 * @return string
	 */
	public function get_export_records_of_consent_button() {
		ob_start();
		?>
		<button class="wpconsent-button wpconsent-button-primary" type="button">
			<?php esc_html_e( 'Export Consent Logs', 'wpconsent-cookies-banner-privacy-suite' ); ?>
		</button>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the export Do Not Track button.
	 *
	 * @return string
	 */
	public function get_export_do_not_track_button() {
		ob_start();
		?>
		<button class="wpconsent-button wpconsent-button-primary" type="button">
			<?php esc_html_e( 'Export Do Not Sell Logs', 'wpconsent-cookies-banner-privacy-suite' ); ?>
		</button>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the delete consent logs row.
	 *
	 * @return string
	 */
	public function get_delete_consent_logs_row() {
		ob_start();
		?>
		<div class="wpconsent-input-area-description">
			<p><?php esc_html_e( 'Manage the Consent Logs table by removing old records. This helps reduce database size and maintain data retention compliance.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
		</div>
		<?php
		$this->metabox_row(
			esc_html__( 'Clear logs older than:', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->select(
				'delete_consent_period',
				array(
					'3_months' => esc_html__( '3 months', 'wpconsent-cookies-banner-privacy-suite' ),
					'6_months' => esc_html__( '6 months', 'wpconsent-cookies-banner-privacy-suite' ),
					'1_year'   => esc_html__( '1 year', 'wpconsent-cookies-banner-privacy-suite' ),
					'2_years'  => esc_html__( '2 years', 'wpconsent-cookies-banner-privacy-suite' ),
					'all'      => esc_html__( 'All time', 'wpconsent-cookies-banner-privacy-suite' ),
				),
				'1_year'
			),
			'',
			'',
			'',
			'',
			false
		);

		$this->metabox_row(
			'',
			$this->get_delete_consent_logs_button(),
			'',
			'',
			'',
			'',
			true,
			'delete-consent-logs-lite'
		);

		return ob_get_clean();
	}

	/**
	 * Get the delete consent logs button.
	 *
	 * @return string
	 */
	public function get_delete_consent_logs_button() {
		ob_start();
		?>
		<button class="wpconsent-button wpconsent-button-primary" type="button">
			<?php esc_html_e( 'Delete Logs', 'wpconsent-cookies-banner-privacy-suite' ); ?>
		</button>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the delete Do Not Track logs row.
	 *
	 * @return string
	 */
	public function get_delete_dnt_logs_row() {
		ob_start();
		?>
		<div class="wpconsent-input-area-description">
			<p><?php esc_html_e( 'Manage the Do Not Sell Logs table by removing old records. This helps reduce database size and maintain data retention compliance.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
		</div>
		<?php
		$this->metabox_row(
			esc_html__( 'Clear logs older than:', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->select(
				'delete_dnt_period',
				array(
					'3_months' => esc_html__( '3 months', 'wpconsent-cookies-banner-privacy-suite' ),
					'6_months' => esc_html__( '6 months', 'wpconsent-cookies-banner-privacy-suite' ),
					'1_year'   => esc_html__( '1 year', 'wpconsent-cookies-banner-privacy-suite' ),
					'2_years'  => esc_html__( '2 years', 'wpconsent-cookies-banner-privacy-suite' ),
					'all'      => esc_html__( 'All time', 'wpconsent-cookies-banner-privacy-suite' ),
				),
				'1_year'
			),
			'',
			'',
			'',
			'',
			false
		);

		$this->metabox_row(
			'',
			$this->get_delete_dnt_logs_button(),
			'',
			'',
			'',
			'',
			true,
			'delete-dnt-logs-lite'
		);

		return ob_get_clean();
	}

	/**
	 * Get the delete Do Not Track logs button.
	 *
	 * @return string
	 */
	public function get_delete_dnt_logs_button() {
		ob_start();
		?>
		<button class="wpconsent-button wpconsent-button-primary" type="button">
			<?php esc_html_e( 'Delete Logs', 'wpconsent-cookies-banner-privacy-suite' ); ?>
		</button>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the input for enabling custom scripts export.
	 *
	 * @return void
	 */
	public function export_custom_scripts_input() {
		$this->metabox_row(
			esc_html__( 'Custom Scripts', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_checkbox_toggle(
				false,
				'wpconsent-export-custom-scripts-lite',
				esc_html__( 'Export custom scripts and iframes.', 'wpconsent-cookies-banner-privacy-suite' )
			),
			'wpconsent-export-custom-scripts-lite',
			'',
			'',
			'',
			true
		);
	}

	/**
	 * Process messages for this page (e.g., after import).
	 *
	 * @return void
	 */
	public function process_message() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( isset( $_GET['message'] ) && 'import_success' === $_GET['message'] ) {
			$this->set_success_message(
				__( 'Settings imported successfully.', 'wpconsent-cookies-banner-privacy-suite' )
			);
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( isset( $_GET['message'] ) && 'cache_cleared' === $_GET['message'] ) {
			$this->set_success_message(
				__( 'Cookies cache cleared successfully.', 'wpconsent-cookies-banner-privacy-suite' )
			);
		}
	}

	/**
	 * Handle the import of settings.
	 *
	 * @return void
	 */
	protected function handle_import() {
		// Check if file was uploaded.
		if ( ! isset( $_FILES['import_file'] ) || ! isset( $_FILES['import_file']['tmp_name'] ) ) {  // phpcs:ignore WordPress.Security.NonceVerification
			wp_die(
				esc_html__( 'No file was uploaded.', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'Error', 'wpconsent-cookies-banner-privacy-suite' ),
				array(
					'response' => 400,
				)
			);
		}

		// Validate file extension.
		$ext = '';
		if ( isset( $_FILES['import_file']['name'] ) ) {  // phpcs:ignore WordPress.Security.NonceVerification
			$ext = strtolower( pathinfo( sanitize_text_field( $_FILES['import_file']['name'] ), PATHINFO_EXTENSION ) );  // phpcs:ignore WordPress.Security.NonceVerification
		}

		if ( 'json' !== $ext ) {
			wp_die(
				esc_html__( 'Please upload a valid .json export file.', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'Error', 'wpconsent-cookies-banner-privacy-suite' ),
				array(
					'response' => 400,
				)
			);
		}

		// Validate MIME type.
		$tmp_name  = isset( $_FILES['import_file']['tmp_name'] ) ? sanitize_text_field( $_FILES['import_file']['tmp_name'] ) : ''; //phpcs:ignore WordPress.Security.NonceVerification, WordPress.Security.ValidatedSanitizedInput.MissingUnslash -- wp_unslash() breaks upload on Windows.
		$file_name = isset( $_FILES['import_file']['name'] ) ? sanitize_text_field( $_FILES['import_file']['name'] ) : ''; //phpcs:ignore WordPress.Security.NonceVerification

		// Define valid MIME types for JSON files.
		$valid_mime_types = array(
			'application/json',
			'text/plain', // Some servers may identify JSON files as text/plain.
			'text/json',
		);

		// Check MIME type using WordPress functions first.
		$wp_filetype = wp_check_filetype(
			$file_name,
			array(
				'json' => 'application/json',
				'txt'  => 'text/plain',
			)
		);

		if ( empty( $wp_filetype['type'] ) || ! in_array( $wp_filetype['type'], $valid_mime_types, true ) ) {
			wp_die(
				esc_html__( 'The uploaded file is not a valid JSON file.', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'Error', 'wpconsent-cookies-banner-privacy-suite' ),
				array(
					'response' => 400,
				)
			);
		}

		// Additional check using finfo if available for more security.
		if ( function_exists( 'finfo_open' ) ) {
			$finfo = finfo_open( FILEINFO_MIME_TYPE );
			$mime  = finfo_file( $finfo, $tmp_name );
			finfo_close( $finfo );

			if ( ! in_array( $mime, $valid_mime_types, true ) ) {
				wp_die(
					esc_html__( 'The uploaded file is not a valid JSON file.', 'wpconsent-cookies-banner-privacy-suite' ),
					esc_html__( 'Error', 'wpconsent-cookies-banner-privacy-suite' ),
					array(
						'response' => 400,
					)
				);
			}
		}

		// Initialize WordPress Filesystem.
		global $wp_filesystem;
		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}
		WP_Filesystem();

		// Get file contents.
		$file_contents = $wp_filesystem->get_contents( $tmp_name );

		// Validate JSON syntax.
		$import_data = json_decode( $file_contents, true );
		$json_error  = json_last_error();

		if ( JSON_ERROR_NONE !== $json_error ) {
			wp_die(
				sprintf(
				/* translators: %s: JSON error message */
					esc_html__( 'Invalid JSON syntax: %s', 'wpconsent-cookies-banner-privacy-suite' ),
					esc_html( json_last_error_msg() )
				),
				esc_html__( 'Error', 'wpconsent-cookies-banner-privacy-suite' ),
				array(
					'response' => 400,
				)
			);
		}

		// Validate expected data structure.
		if ( empty( $import_data ) || ! is_array( $import_data ) ) {
			wp_die(
				esc_html__( 'Import data cannot be processed.', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'Error', 'wpconsent-cookies-banner-privacy-suite' ),
				array(
					'response' => 400,
				)
			);
		}

		$this->import_settings( $import_data );
		$this->import_geolocation_groups( $import_data );
		$this->import_banner_design( $import_data );
		$this->import_cookies( $import_data );
		$this->import_custom_scripts( $import_data );

		// Keep the preferences cookie duration label in sync with the imported consent duration setting.
		wpconsent()->cookies->update_preferences_cookie_duration();

		wp_safe_redirect( add_query_arg( 'message', 'import_success', $this->get_page_action_url() ) );
		exit;
	}

	/**
	 * Import settings from import data.
	 *
	 * @param array $import_data The import data.
	 *
	 * @return void
	 */
	protected function import_settings( $import_data ) {
		if ( isset( $import_data['settings'] ) ) {
			$settings = $import_data['settings'];
			// Let's go through the settings and sanitize all the values.
			foreach ( $settings as $key => $value ) {
				if ( is_array( $value ) ) {
					$settings[ $key ] = array_map( 'sanitize_text_field', $value );
				} else {
					$settings[ $key ] = sanitize_text_field( $value );
				}
			}

			// Ensure enabled_languages is always an array if not set or null.
			if ( ! isset( $settings['enabled_languages'] ) || null === $settings['enabled_languages'] || '' === $settings['enabled_languages'] ) {
				$settings['enabled_languages'] = array();
			}

			wpconsent()->settings->bulk_update_options( $settings );

			// Handle cookie policy page after settings are updated.
			if ( isset( $import_data['settings']['cookie_policy_page'] ) && 0 !== $import_data['settings']['cookie_policy_page'] ) {
				// Translators: This is a default text for the cookie policy generated by WPConsent. %1$s is the opening anchor tag, %2$s is the closing anchor tag.
				$default_cookie_policy_text = esc_html__( 'This page provides comprehensive information about how we use cookies on our website to enhance your browsing experience, improve website performance, and deliver personalized content. Cookies are small text files that are stored on your device when you visit our site. They help us understand how visitors interact with our website, allowing us to offer a smoother and more efficient user experience. In the table below, you will find detailed information about each type of cookie we use, their purpose, and how long they remain on your device. We are committed to respecting your privacy and providing transparency about the data we collect through cookies. For more information on how we handle your personal data, please see our %1$sPrivacy Policy.%2$s', 'wpconsent-cookies-banner-privacy-suite' );
				$privacy_policy             = get_privacy_policy_url();
				$default_cookie_policy_text = sprintf( $default_cookie_policy_text, '<a href="' . esc_url( $privacy_policy ) . '">', '</a>' );

				// Add shortcode.
				$shortcode    = '<br>[wpconsent_cookie_policy]';
				$page_content = '<p>' . $default_cookie_policy_text . '</p>';

				// Let's check if the site is using the block editor for pages.
				if ( function_exists( 'use_block_editor_for_post_type' ) && use_block_editor_for_post_type( 'page' ) ) {
					// Let's wrap the page content in a paragraph block.
					$page_content = '<!-- wp:paragraph -->' . $page_content . '<!-- /wp:paragraph -->';
					// Let's add the shortcode block.
					$page_content .= '<!-- wp:shortcode -->' . $shortcode . '<!-- /wp:shortcode -->';
				} else {
					// Let's add the shortcode.
					$page_content .= $shortcode;
				}

				// Create new cookie policy page.
				$page_id = wp_insert_post(
					array(
						'post_title'   => esc_html__( 'Cookie Policy', 'wpconsent-cookies-banner-privacy-suite' ),
						'post_content' => $page_content,
						'post_status'  => 'publish',
						'post_type'    => 'page',
					)
				);

				if ( $page_id ) {
					// Update the cookie policy page ID in settings.
					wpconsent()->settings->bulk_update_options(
						array(
							'cookie_policy_page' => $page_id,
						)
					);
				} else {
					wpconsent()->settings->bulk_update_options(
						array(
							'cookie_policy_page' => 0,
						)
					);
				}
			}
		}
	}

	/**
	 * Import banner design from import data.
	 *
	 * @param array $import_data The import data.
	 *
	 * @return void
	 */
	protected function import_banner_design( $import_data ) {
		if ( isset( $import_data['banner_design'] ) ) {
			// Let's go through the banner design settings and sanitize all the values.
			$banner_design = $import_data['banner_design'];
			foreach ( $banner_design as $key => $value ) {
				if ( is_array( $value ) ) {
					$banner_design[ $key ] = array_map( 'wp_kses_post', $value );
				} else {
					$banner_design[ $key ] = wp_kses_post( $value );
				}
			}

			wpconsent()->settings->bulk_update_options( $banner_design );
		}
	}

	/**
	 * Import cookies from import data.
	 *
	 * @param array $import_data The import data.
	 *
	 * @return void
	 */
	protected function import_cookies( $import_data ) {
		if ( isset( $import_data['cookies'] ) ) {
			foreach ( $import_data['cookies'] as $category_slug => $category_data ) {
				// Check if category exists, if not create it.
				$category = get_term_by( 'slug', $category_slug, wpconsent()->cookies->taxonomy );
				if ( ! $category ) {
					$category_id = wpconsent()->cookies->add_category(
						sanitize_text_field( $category_data['name'] ),
						wp_kses_post( $category_data['description'] )
					);
					if ( is_wp_error( $category_id ) ) {
						continue;
					}
				} else {
					$category_id = $category->term_id;

					// Update category name and description if it already exists.
					wpconsent()->cookies->update_category(
						$category_id,
						sanitize_text_field( $category_data['name'] ),
						wp_kses_post( $category_data['description'] )
					);
				}

				// Update category meta.
				update_term_meta( $category_id, 'wpconsent_required', intval( $category_data['required'] ) );

				// Allow child classes to import additional category data.
				$this->import_category_data( $category_id, $category_data );

				// Import cookies directly attached to category.
				if ( isset( $category_data['cookies'] ) && is_array( $category_data['cookies'] ) ) {
					foreach ( $category_data['cookies'] as $cookie_data ) {
						$post_id = wpconsent()->cookies->add_cookie(
							sanitize_text_field( $cookie_data['cookie_id'] ),
							sanitize_text_field( $cookie_data['name'] ),
							wp_kses_post( $cookie_data['description'] ),
							absint( $category_id ),
							isset( $cookie_data['duration'] ) ? sanitize_text_field( $cookie_data['duration'] ) : ''
						);

						// Allow child classes to import additional cookie data.
						$this->import_cookie_data( $post_id, $cookie_data );
					}
				}

				// Import services and their cookies.
				if ( isset( $category_data['services'] ) && is_array( $category_data['services'] ) ) {
					foreach ( $category_data['services'] as $service_data ) {
						// Add new service under the category.
						$service_id = wpconsent()->cookies->add_service(
							sanitize_text_field( $service_data['name'] ),
							absint( $category_id ),
							isset( $service_data['description'] ) ? wp_kses_post( $service_data['description'] ) : '',
							isset( $service_data['service_url'] ) ? esc_url( $service_data['service_url'] ) : ''
						);

						if ( ! $service_id ) {
							continue;
						}

						// Allow child classes to import additional service data.
						$this->import_service_data( $service_id, $service_data );

						// Import cookies for this service.
						if ( isset( $service_data['cookies'] ) && is_array( $service_data['cookies'] ) ) {
							foreach ( $service_data['cookies'] as $cookie_data ) {
								$post_id = wpconsent()->cookies->add_cookie(
									sanitize_text_field( $cookie_data['cookie_id'] ),
									sanitize_text_field( $cookie_data['name'] ),
									wp_kses_post( $cookie_data['description'] ),
									absint( $service_id ),
									isset( $cookie_data['duration'] ) ? sanitize_text_field( $cookie_data['duration'] ) : ''
								);

								// Allow child classes to import additional cookie data.
								$this->import_cookie_data( $post_id, $cookie_data );
							}
						}
					}
				}
			}
		}
	}

	/**
	 * Import additional category data. This is a hook for child classes to extend.
	 *
	 * @param int   $category_id The category ID.
	 * @param array $category_data The category data.
	 *
	 * @return void
	 */
	protected function import_category_data( $category_id, $category_data ) {
		// This method is meant to be overridden by child classes.
	}

	/**
	 * Import additional cookie data. This is a hook for child classes to extend.
	 *
	 * @param int   $post_id The cookie post ID.
	 * @param array $cookie_data The cookie data.
	 *
	 * @return void
	 */
	protected function import_cookie_data( $post_id, $cookie_data ) {
		// This method is meant to be overridden by child classes.
	}

	/**
	 * Import additional service data. This is a hook for child classes to extend.
	 *
	 * @param int   $service_id The service ID.
	 * @param array $service_data The service data.
	 *
	 * @return void
	 */
	protected function import_service_data( $service_id, $service_data ) {
		// This method is meant to be overridden by child classes.
	}

	/**
	 * Import geolocation groups from import data.
	 *
	 * @param array $import_data The import data.
	 *
	 * @return void
	 */
	protected function import_geolocation_groups( $import_data ) {
		// This method is meant to be overridden by Pro class.
	}

	/**
	 * Import custom scripts from import data.
	 *
	 * @param array $import_data The import data.
	 *
	 * @return void
	 */
	protected function import_custom_scripts( $import_data ) {
		// This method is meant to be overridden by child classes.
	}

	/**
	 * Handle clearing the cookies cache.
	 *
	 * @return void
	 */
	protected function handle_clear_cache() {
		// Clear cookies cache.
		wpconsent()->cookies->clear_cookies_cache();

		// Redirect back to the database view with a success message.
		wp_safe_redirect( add_query_arg( 'message', 'cache_cleared', $this->get_page_action_url() ) );
		exit;
	}

	/**
	 * Handle the export of settings.
	 *
	 * @return void
	 */
	protected function handle_export() {
		$export_all_settings   = isset( $_POST['export_all_settings'] ) ? true : false;  // phpcs:ignore WordPress.Security.NonceVerification
		$export_banner_design  = isset( $_POST['export_banner_design'] ) ? true : false;  // phpcs:ignore WordPress.Security.NonceVerification
		$export_cookie_data    = isset( $_POST['export_cookie_data'] ) ? true : false;  // phpcs:ignore WordPress.Security.NonceVerification
		$export_custom_scripts = isset( $_POST['export_custom_scripts'] ) ? true : false;  // phpcs:ignore WordPress.Security.NonceVerification

		$export_data = array();

		if ( $export_all_settings || $export_banner_design ) {
			$all_options = wpconsent()->settings->get_options();
		}

		if ( $export_all_settings ) {
			$export_data['settings'] = $this->get_settings_for_export( $all_options );
			// Export geolocation groups separately with proper structure.
			$export_data['geolocation_groups'] = $this->get_geolocation_groups_for_export( $all_options );
		}

		if ( $export_banner_design ) {
			$export_data['banner_design'] = $this->get_banner_design_for_export( $all_options );
		}

		if ( $export_cookie_data ) {
			$export_data['cookies'] = $this->get_cookie_data_for_export();
		}

		if ( $export_custom_scripts ) {
			$export_data['custom_scripts'] = $this->get_custom_scripts_for_export();
		}

		$this->output_export_file( $export_data );
	}

	/**
	 * Get settings for export.
	 *
	 * @param array $all_options All plugin options.
	 * @return array
	 */
	protected function get_settings_for_export( $all_options ) {
		$settings = $all_options;

		unset( $settings['manual_scan_pages'] );
		unset( $settings['onboarding_completed'] );
		unset( $settings['has_auto_populated_pages'] );
		unset( $settings['banner_logo'] );

		// Remove banner settings as they are handled separately.
		foreach ( $this->get_banner_settings_keys() as $setting ) {
			unset( $settings[ $setting ] );
		}

		// Ensure enabled_languages is always an empty array if not set or null.
		if ( ! isset( $settings['enabled_languages'] ) || null === $settings['enabled_languages'] ) {
			$settings['enabled_languages'] = array();
		}

		return $settings;
	}

	/**
	 * Get banner design settings for export.
	 *
	 * @param array $all_options All plugin options.
	 * @return array
	 */
	protected function get_banner_design_for_export( $all_options ) {
		$banner_data = array();

		foreach ( $this->get_banner_settings_keys() as $setting ) {
			if ( isset( $all_options[ $setting ] ) ) {
				// If this is the consent_floating_icon setting and it's a URL (custom image).
				if ( 'consent_floating_icon' === $setting && filter_var( $all_options[ $setting ], FILTER_VALIDATE_URL ) ) {
					$banner_data[ $setting ] = 'preferences';
				} else {
					$banner_data[ $setting ] = $all_options[ $setting ];
				}
			}
		}

		return $banner_data;
	}

	/**
	 * Get cookie data for export.
	 *
	 * @return array
	 */
	protected function get_cookie_data_for_export() {
		$export_data = array();

		$categories = wpconsent()->cookies->get_categories();
		foreach ( $categories as $category_slug => $category ) {
			$category_id = $category['id'];

			$cookies  = wpconsent()->cookies->get_cookies_by_category( $category_id );
			$services = wpconsent()->cookies->get_services_by_category( $category_id );

			$category_data = array(
				'name'        => $category['name'],
				'description' => $category['description'],
				'required'    => $category['required'],
				'cookies'     => array(),
				'services'    => array(),
			);

			foreach ( $cookies as $cookie ) {
				if ( count( $cookie['categories'] ) === 1 && $cookie['categories'][0] === $category_id ) {
					$category_data['cookies'][] = $this->get_cookie_export_data( $cookie );
				}
			}

			foreach ( $services as $service ) {
				$service_data = array(
					'id'          => $service['id'],
					'name'        => $service['name'],
					'description' => $service['description'],
					'service_url' => $service['service_url'],
					'cookies'     => array(),
				);

				foreach ( $cookies as $cookie ) {
					if ( in_array( $service['id'], $cookie['categories'], true ) ) {
						$service_data['cookies'][] = $this->get_cookie_export_data( $cookie );
					}
				}

				$category_data['services'][] = $service_data;
			}
			$export_data[ $category_slug ] = $category_data;
		}

		return $export_data;
	}

	/**
	 * Get custom scripts for export.
	 *
	 * @return void
	 */
	protected function get_custom_scripts_for_export() {
		// This method is meant to be overridden by child classes.
	}

	/**
	 * Get geolocation groups for export.
	 *
	 * @param array $all_options All plugin options.
	 *
	 * @return array
	 */
	protected function get_geolocation_groups_for_export( $all_options ) {
		return array();
	}

	/**
	 * Get cookie export data.
	 *
	 * @param array $cookie Cookie data.
	 * @return array
	 */
	protected function get_cookie_export_data( $cookie ) {
		return array(
			'id'          => $cookie['id'],
			'name'        => $cookie['name'],
			'cookie_id'   => $cookie['cookie_id'],
			'description' => $cookie['description'],
			'duration'    => $cookie['duration'],
			'auto_added'  => $cookie['auto_added'],
		);
	}

	/**
	 * Get banner settings keys.
	 *
	 * @return array
	 */
	protected function get_banner_settings_keys() {
		return array(
			'banner_layout',
			'banner_position',
			'banner_background_color',
			'banner_text_color',
			'banner_font_size',
			'banner_button_size',
			'banner_button_corner',
			'banner_button_type',
			'banner_accept_bg',
			'banner_accept_color',
			'banner_cancel_bg',
			'banner_cancel_color',
			'banner_preferences_bg',
			'banner_preferences_color',
			'hide_powered_by',
			'banner_message',
			'accept_button_text',
			'accept_button_enabled',
			'button_order',
			'preferences_button_text',
			'cancel_button_text',
			'cancel_button_enabled',
			'preferences_button_enabled',
			'preferences_panel_title',
			'preferences_panel_description',
			'cookie_policy_title',
			'cookie_policy_text',
			'save_preferences_button_text',
			'close_button_text',
			'disable_close_button',
			'cookie_table_header_name',
			'cookie_table_header_description',
			'cookie_table_header_duration',
			'cookie_table_header_category',
			'consent_floating_icon',
			'gpc_override_message',
			'gpc_toast_message',
		);
	}

	/**
	 * Output export file.
	 *
	 * @param array $export_data Data to export.
	 *
	 * @return void
	 */
	protected function output_export_file( $export_data ) {
		$filename = 'wpconsent-export-' . gmdate( 'Y-m-d-H-i' ) . '.json';

		header( 'Content-Type: application/json; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
		header( 'Expires: 0' );

		echo wp_json_encode( $export_data, JSON_PRETTY_PRINT );
		exit;
	}

	/**
	 * Get system information.
	 *
	 * Based on a function from Easy Digital Downloads by Pippin Williamson.
	 *
	 * @link https://github.com/easydigitaldownloads/easy-digital-downloads/blob/master/includes/admin/tools.php#L470
	 *
	 * @return string
	 */
	public function get_system_info() {

		$data = '### Begin System Info ###' . "\n\n";

		$data .= $this->site_info();
		$data .= $this->wp_info();
		$data .= $this->uploads_info();
		$data .= $this->plugins_info();
		$data .= $this->server_info();

		$data .= "\n" . '### End System Info ###';

		return $data;
	}

	/**
	 * Get Site info.
	 *
	 * @return string
	 */
	private function site_info() {

		$data  = "\n" . '-- Site Info' . "\n\n";
		$data .= 'Site URL:                 ' . site_url() . "\n";
		$data .= 'Home URL:                 ' . home_url() . "\n";
		$data .= 'Multisite:                ' . ( is_multisite() ? 'Yes' : 'No' ) . "\n";

		return $data;
	}

	/**
	 * Get WordPress Configuration info.
	 *
	 * @return string
	 */
	private function wp_info() {

		global $wpdb;

		$theme_data = wp_get_theme();
		$theme      = $theme_data->name . ' ' . $theme_data->version;

		$data  = "\n" . '-- WordPress Configuration' . "\n\n";
		$data .= 'Version:                  ' . get_bloginfo( 'version' ) . "\n";
		$data .= 'Language:                 ' . get_locale() . "\n";
		$data .= 'User Language:            ' . get_user_locale() . "\n";
		$data .= 'Permalink Structure:      ' . ( get_option( 'permalink_structure' ) ? get_option( 'permalink_structure' ) : 'Default' ) . "\n";
		$data .= 'Active Theme:             ' . $theme . "\n";
		$data .= 'Show On Front:            ' . get_option( 'show_on_front' ) . "\n";

		// Only show page specs if front page is set to 'page'.
		if ( get_option( 'show_on_front' ) === 'page' ) {
			$front_page_id = get_option( 'page_on_front' );
			$blog_page_id  = get_option( 'page_for_posts' );

			$data .= 'Page On Front:            ' . ( $front_page_id ? get_the_title( $front_page_id ) . ' (#' . $front_page_id . ')' : 'Unset' ) . "\n";
			$data .= 'Page For Posts:           ' . ( $blog_page_id ? get_the_title( $blog_page_id ) . ' (#' . $blog_page_id . ')' : 'Unset' ) . "\n";
		}
		$data .= 'ABSPATH:                  ' . ABSPATH . "\n";
		$data .= 'Table Prefix:             ' . 'Length: ' . strlen( $wpdb->prefix ) . '   Status: ' . ( strlen( $wpdb->prefix ) > 16 ? 'ERROR: Too long' : 'Acceptable' ) . "\n"; //phpcs:ignore
		$data .= 'WP_DEBUG:                 ' . ( defined( 'WP_DEBUG' ) ? WP_DEBUG ? 'Enabled' : 'Disabled' : 'Not set' ) . "\n";
		$data .= 'Memory Limit:             ' . WP_MEMORY_LIMIT . "\n";
		$data .= 'Registered Post Stati:    ' . implode( ', ', get_post_stati() ) . "\n";
		$data .= 'Revisions:                ' . ( WP_POST_REVISIONS ? WP_POST_REVISIONS > 1 ? 'Limited to ' . WP_POST_REVISIONS : 'Enabled' : 'Disabled' ) . "\n";

		return $data;
	}

	/**
	 * Get Uploads/Constants info.
	 *
	 * @return string
	 */
	private function uploads_info() {

		$data  = "\n" . '-- WordPress Uploads/Constants' . "\n\n";
		$data .= 'WP_CONTENT_DIR:           ' . ( defined( 'WP_CONTENT_DIR' ) ? WP_CONTENT_DIR ? WP_CONTENT_DIR : 'Disabled' : 'Not set' ) . "\n";
		$data .= 'WP_CONTENT_URL:           ' . ( defined( 'WP_CONTENT_URL' ) ? WP_CONTENT_URL ? WP_CONTENT_URL : 'Disabled' : 'Not set' ) . "\n";
		$data .= 'UPLOADS:                  ' . ( defined( 'UPLOADS' ) ? UPLOADS ? UPLOADS : 'Disabled' : 'Not set' ) . "\n";

		$uploads_dir = wp_upload_dir();

		$data .= 'wp_uploads_dir() path:    ' . $uploads_dir['path'] . "\n";
		$data .= 'wp_uploads_dir() url:     ' . $uploads_dir['url'] . "\n";
		$data .= 'wp_uploads_dir() basedir: ' . $uploads_dir['basedir'] . "\n";
		$data .= 'wp_uploads_dir() baseurl: ' . $uploads_dir['baseurl'] . "\n";

		return $data;
	}

	/**
	 * Get Plugins info.
	 *
	 * @return string
	 */
	private function plugins_info() {

		// Get plugins that have an update.
		$data = $this->mu_plugins();

		$data .= $this->installed_plugins();
		$data .= $this->multisite_plugins();

		return $data;
	}

	/**
	 * Get MU Plugins info.
	 *
	 * @return string
	 */
	private function mu_plugins() {

		$data = '';

		// Must-use plugins.
		// NOTE: MU plugins can't show updates!
		$muplugins = get_mu_plugins();

		if ( ! empty( $muplugins ) && count( $muplugins ) > 0 ) {
			$data = "\n" . '-- Must-Use Plugins' . "\n\n";

			foreach ( $muplugins as $plugin => $plugin_data ) {
				$data .= $plugin_data['Name'] . ': ' . $plugin_data['Version'] . "\n";
			}
		}

		return $data;
	}

	/**
	 * Get Installed Plugins info.
	 *
	 * @return string
	 */
	private function installed_plugins() {

		$updates = get_plugin_updates();

		// WordPress active plugins.
		$data = "\n" . '-- WordPress Active Plugins' . "\n\n";

		$plugins        = get_plugins();
		$active_plugins = get_option( 'active_plugins', array() );

		foreach ( $plugins as $plugin_path => $plugin ) {
			if ( ! in_array( $plugin_path, $active_plugins, true ) ) {
				continue;
			}
			$update = ( array_key_exists( $plugin_path, $updates ) ) ? ' (needs update - ' . $updates[ $plugin_path ]->update->new_version . ')' : '';
			$data  .= $plugin['Name'] . ': ' . $plugin['Version'] . $update . "\n";
		}

		// WordPress inactive plugins.
		$data .= "\n" . '-- WordPress Inactive Plugins' . "\n\n";

		foreach ( $plugins as $plugin_path => $plugin ) {
			if ( in_array( $plugin_path, $active_plugins, true ) ) {
				continue;
			}
			$update = ( array_key_exists( $plugin_path, $updates ) ) ? ' (needs update - ' . $updates[ $plugin_path ]->update->new_version . ')' : '';
			$data  .= $plugin['Name'] . ': ' . $plugin['Version'] . $update . "\n";
		}

		return $data;
	}

	/**
	 * Get Multisite Plugins info.
	 *
	 * @return string
	 */
	private function multisite_plugins() {

		$data = '';

		if ( ! is_multisite() ) {
			return $data;
		}

		$updates = get_plugin_updates();

		// WordPress Multisite active plugins.
		$data = "\n" . '-- Network Active Plugins' . "\n\n";

		$plugins        = wp_get_active_network_plugins();
		$active_plugins = get_site_option( 'active_sitewide_plugins', array() );

		foreach ( $plugins as $plugin_path ) {
			$plugin_base = plugin_basename( $plugin_path );

			if ( ! array_key_exists( $plugin_base, $active_plugins ) ) {
				continue;
			}
			$update = ( array_key_exists( $plugin_path, $updates ) ) ? ' (needs update - ' . $updates[ $plugin_path ]->update->new_version . ')' : '';
			$plugin = get_plugin_data( $plugin_path );
			$data  .= $plugin['Name'] . ': ' . $plugin['Version'] . $update . "\n";
		}

		return $data;
	}

	/**
	 * Get Server info.
	 *
	 * @return string
	 */
	private function server_info() {

		global $wpdb;

		// Server configuration (really just versions).
		$data  = "\n" . '-- Webserver Configuration' . "\n\n";
		$data .= 'PHP Version:              ' . PHP_VERSION . "\n";
		$data .= 'MySQL Version:            ' . $wpdb->db_version() . "\n";
		$data .= 'Webserver Info:           ' . ( isset( $_SERVER['SERVER_SOFTWARE'] ) ? sanitize_text_field( wp_unslash( $_SERVER['SERVER_SOFTWARE'] ) ) : '' ) . "\n";

		// PHP configs... now we're getting to the important stuff.
		$data .= "\n" . '-- PHP Configuration' . "\n\n";
		$data .= 'Memory Limit:             ' . ini_get( 'memory_limit' ) . "\n";
		$data .= 'Upload Max Size:          ' . ini_get( 'upload_max_filesize' ) . "\n";
		$data .= 'Post Max Size:            ' . ini_get( 'post_max_size' ) . "\n";
		$data .= 'Upload Max Filesize:      ' . ini_get( 'upload_max_filesize' ) . "\n";
		$data .= 'Time Limit:               ' . ini_get( 'max_execution_time' ) . "\n";
		$data .= 'Max Input Vars:           ' . ini_get( 'max_input_vars' ) . "\n";
		$data .= 'Display Errors:           ' . ( ini_get( 'display_errors' ) ? 'On (' . ini_get( 'display_errors' ) . ')' : 'N/A' ) . "\n";

		// PHP extensions and such.
		$data .= "\n" . '-- PHP Extensions' . "\n\n";
		$data .= 'cURL:                     ' . ( function_exists( 'curl_init' ) ? 'Supported' : 'Not Supported' ) . "\n";
		$data .= 'fsockopen:                ' . ( function_exists( 'fsockopen' ) ? 'Supported' : 'Not Supported' ) . "\n";
		$data .= 'SOAP Client:              ' . ( class_exists( 'SoapClient', false ) ? 'Installed' : 'Not Installed' ) . "\n";
		$data .= 'Suhosin:                  ' . ( extension_loaded( 'suhosin' ) ? 'Installed' : 'Not Installed' ) . "\n";

		// Session stuff.
		$data .= "\n" . '-- Session Configuration' . "\n\n";
		$data .= 'Session:                  ' . ( isset( $_SESSION ) ? 'Enabled' : 'Disabled' ) . "\n";

		// The rest of this is only relevant if session is enabled.
		if ( isset( $_SESSION ) ) {
			$data .= 'Session Name:             ' . esc_html( ini_get( 'session.name' ) ) . "\n";
			$data .= 'Cookie Path:              ' . esc_html( ini_get( 'session.cookie_path' ) ) . "\n";
			$data .= 'Save Path:                ' . esc_html( ini_get( 'session.save_path' ) ) . "\n";
			$data .= 'Use Cookies:              ' . ( ini_get( 'session.use_cookies' ) ? 'On' : 'Off' ) . "\n";
			$data .= 'Use Only Cookies:         ' . ( ini_get( 'session.use_only_cookies' ) ? 'On' : 'Off' ) . "\n";
		}

		return $data;
	}

	/**
	 * Get the input for Records of Consent logs deletion.
	 *
	 * @return string
	 */
	public function get_roc_logs_content() {
		ob_start();
		?>
		<div class="wpconsent-input-area-description">
			<p><?php esc_html_e( 'Manage the Consent Logs table by removing old records. This helps reduce database size and maintain data retention compliance.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
		</div>
		<?php
		$this->metabox_row(
			esc_html__( 'Clear logs older than:', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->select(
				'delete_consent_period',
				array(
					'3_months' => esc_html__( '3 months', 'wpconsent-cookies-banner-privacy-suite' ),
					'6_months' => esc_html__( '6 months', 'wpconsent-cookies-banner-privacy-suite' ),
					'1_year'   => esc_html__( '1 year', 'wpconsent-cookies-banner-privacy-suite' ),
					'2_years'  => esc_html__( '2 years', 'wpconsent-cookies-banner-privacy-suite' ),
					'all'      => esc_html__( 'All time', 'wpconsent-cookies-banner-privacy-suite' ),
				),
				'1_year'
			)
		);
		?>
		<div class="wpconsent-metabox-form-row">
			<button id="wpconsent-delete-consent-logs" class="wpconsent-button wpconsent-button-primary" type="button" data-action="reload">
				<?php esc_html_e( 'Delete Logs', 'wpconsent-cookies-banner-privacy-suite' ); ?>
			</button>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the input for Do Not Track logs deletion.
	 *
	 * @return string
	 */
	public function get_dnt_logs_content() {
		ob_start();
		?>
		<div class="wpconsent-input-area-description">
			<p><?php esc_html_e( 'Manage the Do Not Sell Logs table by removing old records. This helps reduce database size and maintain data retention compliance.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
		</div>
		<?php
		$this->metabox_row(
			esc_html__( 'Clear logs older than:', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->select(
				'delete_dnt_period',
				array(
					'3_months' => esc_html__( '3 months', 'wpconsent-cookies-banner-privacy-suite' ),
					'6_months' => esc_html__( '6 months', 'wpconsent-cookies-banner-privacy-suite' ),
					'1_year'   => esc_html__( '1 year', 'wpconsent-cookies-banner-privacy-suite' ),
					'2_years'  => esc_html__( '2 years', 'wpconsent-cookies-banner-privacy-suite' ),
					'all'      => esc_html__( 'All time', 'wpconsent-cookies-banner-privacy-suite' ),
				),
				'1_year'
			)
		);
		?>
		<div class="wpconsent-metabox-form-row">
			<button id="wpconsent-delete-dnt-logs" class="wpconsent-button wpconsent-button-primary" type="button" data-action="reload">
				<?php esc_html_e( 'Delete Logs', 'wpconsent-cookies-banner-privacy-suite' ); ?>
			</button>
		</div>
		<?php
		return ob_get_clean();
	}
}
