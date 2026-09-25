<?php
/**
 * Admin paged used to Manage Geolocation.
 *
 * @package WPConsent
 */

/**
 * Class WPConsent_Admin_Page_Geolocation
 */
class WPConsent_Admin_Page_Geolocation extends WPConsent_Admin_Page {
	/**
	 * Page slug.
	 *
	 * @var string
	 */
	public $page_slug = 'wpconsent-geolocation';

	/**
	 * Call this just to set the page title translatable.
	 */
	public function __construct() {
		$this->page_title = __( 'Geolocation', 'wpconsent-cookies-banner-privacy-suite' );
		parent::__construct();
	}

	/**
	 * Override the output method so we can add our form markup for this page.
	 *
	 * @return void
	 */
	public function output() {
		$this->output_header();
		?>
		<div class="wpconsent-content">
			<div class="wpconsent-blur-area">
				<?php
				$this->output_content();
				do_action( "wpconsent_admin_page_content_{$this->page_slug}", $this );
				?>
			</div>
			<?php
			echo WPConsent_Admin_page::get_upsell_box( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				esc_html__( 'Geolocation is a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
				'<p>' . esc_html__( 'Upgrade to WPConsent PRO today and personalize the display of your cookie banner to show only in the specific countries or regions you choose.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>',
				array(
					'text' => esc_html__( 'Upgrade to PRO and Unlock "Geolocation"', 'wpconsent-cookies-banner-privacy-suite' ),
					'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'geolocation-page', 'main' ) ),
				),
				array(
					'text' => esc_html__( 'Learn more about all the features', 'wpconsent-cookies-banner-privacy-suite' ),
					'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'geolocation-page', 'features' ) ),
				)
			);
			?>
		</div>
		<?php
	}

	/**
	 * Output the content
	 */
	public function output_content() {
		?>
		<div class="wpconsent-geolocation-container">
			<?php $this->output_location_groups_management(); ?>
		</div>
		<?php
	}

	/**
	 * Output location groups management interface.
	 *
	 * @return void
	 */
	public function output_location_groups_management() {
		$location_groups = $this->get_location_groups();
		?>
		<div class="wpconsent-location-groups-section">
			<?php $this->output_predefined_rules_metabox(); ?>
			<?php $this->output_location_groups_list( $location_groups ); ?>
		</div>
		<?php
	}

	/**
	 * Output the list of existing location groups.
	 *
	 * @param array $location_groups Array of location groups.
	 *
	 * @return void
	 */
	public function output_location_groups_list( $location_groups ) {
		// Everything in the method is escaped.
		echo $this->get_location_groups_list_content( $location_groups ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Get the content for the location groups list.
	 *
	 * @param array $location_groups Array of location groups.
	 *
	 * @return string
	 */
	public function get_location_groups_list_content( $location_groups ) {
		if ( empty( $location_groups ) ) {
			return '<p class="wpconsent-empty-state">' . __( 'No location groups have been created yet. Choose one of the pre-configured templates or create a custom rule.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>';
		}

		ob_start();
		?>
		<table class="wp-list-table widefat fixed striped wpconsent-location-groups-table">
			<thead>
			<tr>
				<th scope="col" class="manage-column column-checkbox"><input type="checkbox"/></th>
				<th scope="col" class="manage-column column-name"><?php esc_html_e( 'Name', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th scope="col" class="manage-column column-locations"><?php esc_html_e( 'Locations', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th scope="col" class="manage-column column-type"><?php esc_html_e( 'Type of Consent', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th scope="col" class="manage-column column-consent-settings"><?php esc_html_e( 'Consent Settings', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th scope="col" class="manage-column column-mode"><?php esc_html_e( 'Consent Mode', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th scope="col" class="manage-column column-action"><?php esc_html_e( 'Action', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
			</tr>
			</thead>
			<tbody>
			<?php
			foreach ( $location_groups as $group_id => $group ) {
				// If the group is not an array, skip it.
				if ( ! is_array( $group ) ) {
					continue;
				}
				?>
				<tr class="wpconsent-location-group-item" data-group-id="<?php echo esc_attr( $group_id ); ?>">
					<td class="column-checkbox">
						<input type="checkbox"/>
					</td>
					<td class="column-name">
						<strong><?php echo esc_html( $group['name'] ); ?></strong>
					</td>
					<td class="column-locations">
						<?php
						echo wp_kses( $this->format_locations_display( $group['locations'] ), array( 'span' => array( 'class' => array() ) ) );
						?>
					</td>
					<td class="column-type">
						<?php echo esc_html( ucfirst( $group['type_of_consent'] ?? 'Custom' ) ); ?>
					</td>
					<td class="column-consent-settings">
						<?php
						$consent_settings = array(
							'enable_script_blocking'  => __( 'Block Script', 'wpconsent-cookies-banner-privacy-suite' ),
							'enable_content_blocking' => __( 'Content Blocking', 'wpconsent-cookies-banner-privacy-suite' ),
							'show_banner'             => __( 'Show Banner', 'wpconsent-cookies-banner-privacy-suite' ),
							'enable_consent_floating' => __( 'Show Settings Button', 'wpconsent-cookies-banner-privacy-suite' ),
						);

						foreach ( $consent_settings as $key => $label ) {
							$is_enabled      = ! empty( $group[ $key ] );
							$checkmark_class = $is_enabled ? 'consent-setting-checkmark-enabled' : 'consent-setting-checkmark-disabled';
							$checkmark       = $is_enabled ? '✓' : '✗';
							?>
							<div class="consent-setting-item">
								<span class="consent-setting-checkmark <?php echo esc_attr( $checkmark_class ); ?>"><?php echo esc_html( $checkmark ); ?></span>
								<span class="consent-setting-text"><?php echo esc_html( $label ); ?></span>
							</div>
						<?php } ?>
					</td>
					<td class="column-mode">
						<?php echo esc_html( ucfirst( $group['consent_mode'] ?? 'optin' ) ); ?>
					</td>
					<td class="column-action">
						<button type="button" class="wpconsent-button-icon wpconsent-edit-group" title="<?php esc_attr_e( 'Edit', 'wpconsent-cookies-banner-privacy-suite' ); ?>">
							<?php wpconsent_icon( 'edit', 15, 16 ); ?>
						</button>
						<button type="button" class="wpconsent-button-icon wpconsent-delete-group" title="<?php esc_attr_e( 'Delete', 'wpconsent-cookies-banner-privacy-suite' ); ?>">
							<?php wpconsent_icon( 'delete', 14, 16 ); ?>
						</button>
					</td>
				</tr>
			<?php } ?>
			</tbody>
			<tfoot>
			<tr>
				<th scope="col" class="manage-column column-checkbox"><input type="checkbox"/></th>
				<th scope="col" class="manage-column column-name"><?php esc_html_e( 'Name', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th scope="col" class="manage-column column-locations"><?php esc_html_e( 'Locations', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th scope="col" class="manage-column column-type"><?php esc_html_e( 'Type of Consent', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th scope="col" class="manage-column column-consent-settings"><?php esc_html_e( 'Consent Settings', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th scope="col" class="manage-column column-mode"><?php esc_html_e( 'Consent Mode', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th scope="col" class="manage-column column-action"><?php esc_html_e( 'Action', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
			</tr>
			</tfoot>
		</table>
		<?php
		return ob_get_clean();
	}

	/**
	 * Output predefined rules metabox.
	 *
	 * @return void
	 */
	public function output_predefined_rules_metabox() {
		$content = $this->get_predefined_rules_content();
		$this->metabox(
			__( 'Location-based Rules', 'wpconsent-cookies-banner-privacy-suite' ),
			$content,
			__( 'Quickly add predefined rules for common privacy regulations. Each rule will automatically configure the relevant countries and settings for the location.', 'wpconsent-cookies-banner-privacy-suite' )
		);
	}


	/**
	 * Get predefined rules content.
	 *
	 * @return string
	 */
	public function get_predefined_rules_content() {
		ob_start();
		?>
		<div class="">
			<p><?php esc_html_e( 'Start with Pre-Configured template based on major privacy regulations. These rules will override the default behaviour defined in the main plugin settings only for the selected locations.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			<p><?php esc_html_e( 'Please note: if you wish to hide the banner by default, you have to disable it from the main settings and override that on this page for specific locations', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
		</div>
		<div class="wpconsent-predefined-rules">
			<div class="wpconsent-predefined-rule">
				<h3><?php esc_html_e( 'Custom Rule', 'wpconsent-cookies-banner-privacy-suite' ); ?></h3>
				<p><?php esc_html_e( 'Create a custom rule with your own settings.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
				<button type="button" class="wpconsent-button wpconsent-add-location-group">
					<?php esc_html_e( 'Add Custom Rule', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
			</div>

			<div class="wpconsent-predefined-rule">
				<h3><?php esc_html_e( 'GDPR Compliance', 'wpconsent-cookies-banner-privacy-suite' ); ?></h3>
				<p><?php esc_html_e( 'Requires clear opt-in before cookies are set.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
				<button type="button" class="wpconsent-button wpconsent-add-predefined-rule" data-rule="gdpr">
					<?php esc_html_e( 'Add GDPR Location Template', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
			</div>

			<div class="wpconsent-predefined-rule">
				<h3><?php esc_html_e( 'CCPA', 'wpconsent-cookies-banner-privacy-suite' ); ?></h3>
				<p><?php esc_html_e( 'Allows users to opt out of data collection.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
				<button type="button" class="wpconsent-button wpconsent-add-predefined-rule" data-rule="ccpa">
					<?php esc_html_e( 'Add CCPA Location Template', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
			</div>

			<div class="wpconsent-predefined-rule">
				<h3><?php esc_html_e( 'LGPD', 'wpconsent-cookies-banner-privacy-suite' ); ?></h3>
				<p><?php esc_html_e( 'Seeks user consent before processing personal data.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
				<button type="button" class="wpconsent-button wpconsent-add-predefined-rule" data-rule="lgpd">
					<?php esc_html_e( 'Add LGPD Location Template', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}


	/**
	 * Format locations for display.
	 *
	 * @param array $locations Array of location data.
	 *
	 * @return string
	 */
	public function format_locations_display( $locations ) {
		return $locations;
	}

	/**
	 * Get dummy location groups for the initial setup.
	 *
	 * @return array An array of location groups, where each group contains details such as
	 *               name, associated locations, and type of consent.
	 */
	public function get_location_groups() {
		return array(
			array(
				'name'                    => 'GDPR Compliance',
				'locations'               => 'Europe',
				'type_of_consent'         => 'GDPR',
				'enable_script_blocking'  => true,
				'show_banner'             => true,
				'enable_consent_floating' => true,
			),
			array(
				'name'                    => 'CCPA',
				'locations'               => 'California, USA',
				'type_of_consent'         => 'CCPA',
				'enable_script_blocking'  => true,
				'show_banner'             => true,
				'enable_consent_floating' => true,
				'consent_mode'            => 'optout',
			),
		);
	}
}
