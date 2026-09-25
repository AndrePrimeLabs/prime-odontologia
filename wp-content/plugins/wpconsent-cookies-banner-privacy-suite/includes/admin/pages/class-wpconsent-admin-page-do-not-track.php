<?php
/**
 * Do Not Track admin page.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Admin_Page_Do_Not_Track
 */
class WPConsent_Admin_Page_Do_Not_Track extends WPConsent_Admin_Page {

	/**
	 * Page slug.
	 *
	 * @var string
	 */
	public $page_slug = 'wpconsent-do-not-track';

	/**
	 * Default view.
	 *
	 * @var string
	 */
	public $view = 'requests';

	/**
	 * Call this just to set the page title translatable.
	 */
	public function __construct() {
		$this->page_title = __( 'Do Not Sell', 'wpconsent-cookies-banner-privacy-suite' );
		$this->menu_title = __( 'Do Not Sell', 'wpconsent-cookies-banner-privacy-suite' );
		parent::__construct();
	}

	/**
	 * Page specific Hooks.
	 *
	 * @return void
	 */
	public function page_hooks() {
		$this->views = array(
			'requests'      => __( 'Requests', 'wpconsent-cookies-banner-privacy-suite' ),
			'configuration' => __( 'Configuration', 'wpconsent-cookies-banner-privacy-suite' ),
			'notifications' => __( 'Notifications', 'wpconsent-cookies-banner-privacy-suite' ),
			'export'        => __( 'Export', 'wpconsent-cookies-banner-privacy-suite' ),
		);
	}

	/**
	 * The page output based on the view.
	 *
	 * @return void
	 */
	public function output_content() {
		?>
		<div class="wpconsent-blur-area">
			<?php
			parent::output_content();
			?>
		</div>
		<?php
		echo WPConsent_Admin_page::get_upsell_box( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			esc_html__( 'Do Not Sell Addon is a premium feature', 'wpconsent-cookies-banner-privacy-suite' ),
			'<p>' . esc_html__( 'Upgrade to WPConsent Plus or higher plans today and improve the way you manage "Do Not Sell My Personal Information" requests.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>',
			array(
				'text' => esc_html__( 'Upgrade to PRO and Unlock "Do Not Sell"', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'do-not-track-page', 'main' ) ),
			),
			array(
				'text' => esc_html__( 'Learn more about all the features', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'do-not-track-page', 'features' ) ),
			),
			array(
				esc_html__( 'Customizable requests form', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'Easily export to CSV', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'Mark requests as processed', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'Avoid Spam with an easy configuration', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( '1-click Do Not Sell page creation', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'Self-Hosted records for compliance proof', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}


	/**
	 * Output the requests view.
	 *
	 * @return void
	 */
	protected function output_view_requests() {
		// Output a dummy table that looks exactly like the one in the addon.
		?>
		<div class="wpconsent-admin-content-section">
			<h2><?php esc_html_e( 'Do Not Sell Requests', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
			<p><?php esc_html_e( 'View and manage your Do Not Sell requests.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>

			<?php settings_errors( 'wpconsent_dnt_messages' ); ?>

			<div class="wpconsent-dnt-requests-table">
				<form method="post">
					<input type="hidden" name="page" value="<?php echo esc_attr( $this->page_slug ); ?>"/>
					<input type="hidden" name="view" value="requests"/>

					<div class="tablenav top">
						<div class="alignleft actions bulkactions">
							<label for="bulk-action-selector-top" class="screen-reader-text"><?php esc_html_e( 'Select bulk action', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
							<select name="action" id="bulk-action-selector-top">
								<option value="-1"><?php esc_html_e( 'Bulk Actions', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
								<option value="mark_processed"><?php esc_html_e( 'Mark as Processed', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
							</select>
							<input type="submit" id="doaction" class="button action" value="<?php esc_attr_e( 'Apply', 'wpconsent-cookies-banner-privacy-suite' ); ?>">
						</div>
						<div class="tablenav-pages">
							<span class="displaying-num">
								<?php
								// Translators: 10 is a placeholder number for the total items.
								echo esc_html( sprintf( _n( '%s item', '%s items', 10, 'wpconsent-cookies-banner-privacy-suite' ), number_format_i18n( 10 ) ) );
								?>
							</span>
						</div>
						<br class="clear">
					</div>

					<table class="wp-list-table widefat fixed striped">
						<thead>
						<tr>
							<td id="cb" class="manage-column column-cb check-column">
								<input id="cb-select-all-1" type="checkbox">
							</td>
							<th scope="col" class="manage-column column-request_id"><?php esc_html_e( 'ID', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
							<th scope="col" class="manage-column column-name"><?php esc_html_e( 'Name', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
							<th scope="col" class="manage-column column-email"><?php esc_html_e( 'Email', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
							<th scope="col" class="manage-column column-location"><?php esc_html_e( 'Location', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
							<th scope="col" class="manage-column column-request_status"><?php esc_html_e( 'Status', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
							<th scope="col" class="manage-column column-created_at"><?php esc_html_e( 'Date', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
						</tr>
						</thead>
						<tbody>
						<?php
						// Dummy data for the table.
						$dummy_data = array(
							array(
								'request_id'     => 1,
								'first_name'     => 'John',
								'last_name'      => 'Doe',
								'email'          => 'john.doe@example.com',
								'city'           => 'New York',
								'state'          => 'NY',
								'country'        => 'USA',
								'request_status' => 'received',
								'created_at'     => gmdate( 'Y-m-d H:i:s', strtotime( '-2 days' ) ),
							),
							array(
								'request_id'     => 2,
								'first_name'     => 'Jane',
								'last_name'      => 'Smith',
								'email'          => 'jane.smith@example.com',
								'city'           => 'London',
								'state'          => '',
								'country'        => 'UK',
								'request_status' => 'confirmed',
								'created_at'     => gmdate( 'Y-m-d H:i:s', strtotime( '-5 days' ) ),
							),
							array(
								'request_id'     => 3,
								'first_name'     => 'Robert',
								'last_name'      => 'Johnson',
								'email'          => 'robert.johnson@example.com',
								'city'           => 'Paris',
								'state'          => '',
								'country'        => 'France',
								'request_status' => 'processed',
								'created_at'     => gmdate( 'Y-m-d H:i:s', strtotime( '-10 days' ) ),
								'processed_at'   => gmdate( 'Y-m-d H:i:s', strtotime( '-8 days' ) ),
							),
							array(
								'request_id'     => 4,
								'first_name'     => 'Maria',
								'last_name'      => 'Garcia',
								'email'          => 'maria.garcia@example.com',
								'city'           => 'Madrid',
								'state'          => '',
								'country'        => 'Spain',
								'request_status' => 'received',
								'created_at'     => gmdate( 'Y-m-d H:i:s', strtotime( '-1 day' ) ),
							),
							array(
								'request_id'     => 5,
								'first_name'     => 'Michael',
								'last_name'      => 'Brown',
								'email'          => 'michael.brown@example.com',
								'city'           => 'Sydney',
								'state'          => 'NSW',
								'country'        => 'Australia',
								'request_status' => 'processed',
								'created_at'     => gmdate( 'Y-m-d H:i:s', strtotime( '-15 days' ) ),
								'processed_at'   => gmdate( 'Y-m-d H:i:s', strtotime( '-12 days' ) ),
							),
							array(
								'request_id'     => 6,
								'first_name'     => 'Emma',
								'last_name'      => 'Wilson',
								'email'          => 'emma.wilson@example.com',
								'city'           => 'Toronto',
								'state'          => 'ON',
								'country'        => 'Canada',
								'request_status' => 'received',
								'created_at'     => gmdate( 'Y-m-d H:i:s', strtotime( '-3 days' ) ),
							),
							array(
								'request_id'     => 7,
								'first_name'     => 'David',
								'last_name'      => 'Lee',
								'email'          => 'david.lee@example.com',
								'city'           => 'Tokyo',
								'state'          => '',
								'country'        => 'Japan',
								'request_status' => 'confirmed',
								'created_at'     => gmdate( 'Y-m-d H:i:s', strtotime( '-7 days' ) ),
							),
							array(
								'request_id'     => 8,
								'first_name'     => 'Sophia',
								'last_name'      => 'Martinez',
								'email'          => 'sophia.martinez@example.com',
								'city'           => 'Berlin',
								'state'          => '',
								'country'        => 'Germany',
								'request_status' => 'processed',
								'created_at'     => gmdate( 'Y-m-d H:i:s', strtotime( '-20 days' ) ),
								'processed_at'   => gmdate( 'Y-m-d H:i:s', strtotime( '-18 days' ) ),
							),
							array(
								'request_id'     => 9,
								'first_name'     => 'James',
								'last_name'      => 'Taylor',
								'email'          => 'james.taylor@example.com',
								'city'           => 'Dublin',
								'state'          => '',
								'country'        => 'Ireland',
								'request_status' => 'received',
								'created_at'     => gmdate( 'Y-m-d H:i:s', strtotime( '-1 day' ) ),
							),
							array(
								'request_id'     => 10,
								'first_name'     => 'Olivia',
								'last_name'      => 'Anderson',
								'email'          => 'olivia.anderson@example.com',
								'city'           => 'Stockholm',
								'state'          => '',
								'country'        => 'Sweden',
								'request_status' => 'confirmed',
								'created_at'     => gmdate( 'Y-m-d H:i:s', strtotime( '-4 days' ) ),
							),
						);

						foreach ( $dummy_data as $item ) {
							$status_labels = array(
								'received'  => __( 'Received', 'wpconsent-cookies-banner-privacy-suite' ),
								'confirmed' => __( 'Confirmed', 'wpconsent-cookies-banner-privacy-suite' ),
								'processed' => __( 'Processed', 'wpconsent-cookies-banner-privacy-suite' ),
							);

							$status_text = isset( $status_labels[ $item['request_status'] ] ) ? $status_labels[ $item['request_status'] ] : $item['request_status'];

							// Add processed date if available.
							if ( 'processed' === $item['request_status'] && isset( $item['processed_at'] ) ) {
								$processed_at = date_i18n( get_option( 'date_format' ), strtotime( $item['processed_at'] ) );
								// Translators: %s: date.
								$status_text .= ' <span class="description">' . sprintf( __( 'on %s', 'wpconsent-cookies-banner-privacy-suite' ), $processed_at ) . '</span>';
							}

							// Build location string.
							$location = array();
							if ( ! empty( $item['city'] ) ) {
								$location[] = $item['city'];
							}
							if ( ! empty( $item['state'] ) ) {
								$location[] = $item['state'];
							}
							if ( ! empty( $item['country'] ) ) {
								$location[] = $item['country'];
							}
							$location_text = implode( ', ', $location );

							// Row actions for non-processed items.
							$row_actions = '';
							if ( 'processed' !== $item['request_status'] ) {
								$row_actions = '<div class="row-actions"><span class="mark_processed"><a href="#">' . __( 'Mark as Processed', 'wpconsent-cookies-banner-privacy-suite' ) . '</a></span></div>';
							}
							?>
							<tr>
								<th scope="row" class="check-column">
									<input type="checkbox" name="request_id[]" value="<?php echo esc_attr( $item['request_id'] ); ?>">
								</th>
								<td class="request_id column-request_id"><?php echo esc_html( $item['request_id'] ); ?></td>
								<td class="name column-name">
									<?php echo esc_html( $item['first_name'] . ' ' . $item['last_name'] ); ?>
									<?php echo wp_kses_post( $row_actions ); ?>
								</td>
								<td class="email column-email"><?php echo esc_html( $item['email'] ); ?></td>
								<td class="location column-location"><?php echo esc_html( $location_text ); ?></td>
								<td class="request_status column-request_status"><?php echo wp_kses_post( $status_text ); ?></td>
								<td class="created_at column-created_at"><?php echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( $item['created_at'] ) ) ); ?></td>
							</tr>
						<?php } ?>
						</tbody>
						<tfoot>
						<tr>
							<td class="manage-column column-cb check-column">
								<input id="cb-select-all-2" type="checkbox">
							</td>
							<th scope="col" class="manage-column column-request_id"><?php esc_html_e( 'ID', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
							<th scope="col" class="manage-column column-name"><?php esc_html_e( 'Name', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
							<th scope="col" class="manage-column column-email"><?php esc_html_e( 'Email', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
							<th scope="col" class="manage-column column-location"><?php esc_html_e( 'Location', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
							<th scope="col" class="manage-column column-request_status"><?php esc_html_e( 'Status', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
							<th scope="col" class="manage-column column-created_at"><?php esc_html_e( 'Date', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
						</tr>
						</tfoot>
					</table>

					<div class="tablenav bottom">
						<div class="alignleft actions bulkactions">
							<label for="bulk-action-selector-bottom" class="screen-reader-text"><?php esc_html_e( 'Select bulk action', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
							<select name="action2" id="bulk-action-selector-bottom">
								<option value="-1"><?php esc_html_e( 'Bulk Actions', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
								<option value="mark_processed"><?php esc_html_e( 'Mark as Processed', 'wpconsent-cookies-banner-privacy-suite' ); ?></option>
							</select>
							<input type="submit" id="doaction2" class="button action" value="<?php esc_attr_e( 'Apply', 'wpconsent-cookies-banner-privacy-suite' ); ?>">
						</div>
						<div class="tablenav-pages">
							<span class="displaying-num">
								<?php
								// Translators: 10 is a placeholder number for the total items.
								echo esc_html( sprintf( _n( '%s item', '%s items', 10, 'wpconsent-cookies-banner-privacy-suite' ), number_format_i18n( 10 ) ) );
								?>
							</span>
						</div>
						<br class="clear">
					</div>
				</form>
			</div>
		</div>
		<?php
	}

	/**
	 * Output the configuration view.
	 *
	 * @return void
	 */
	protected function output_view_configuration() {
		?>
		<form action="" method="post">
			<?php
			$this->metabox(
				esc_html__( 'Do Not Sell Page Configuration', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_dnt_page_metabox()
			);

			$this->metabox(
				esc_html__( 'Form Fields', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_configuration_metabox()
			);
			?>
			<div class="wpconsent-submit">
				<button type="submit" name="submit" id="submit" class="wpconsent-button wpconsent-button-primary">
					<?php esc_html_e( 'Save Changes', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
			</div>
		</form>
		<?php
	}

	/**
	 * Get the do not track page metabox.
	 *
	 * @return string
	 */
	protected function get_dnt_page_metabox() {
		ob_start();
		$this->metabox_row(
			esc_html__( 'Do Not Sell Page', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_dnt_page_input(),
			'',
			'',
			'',
			'',
			false,
			'dnt-page-input'
		);
		return ob_get_clean();
	}

	/**
	 * Get the do not track page input.
	 *
	 * @return string
	 */
	protected function get_configuration_metabox() {
		ob_start();
		?>
		<div class="wpconsent-form-fields-section-description">
			<p><?php esc_html_e( 'Configure which fields to display in the form and their labels.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
		</div>
		<?php
		$this->metabox_row(
			esc_html__( 'Submit Button Text', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_input_text(
				'dnt_submit_text',
				wpconsent()->settings->get_option( 'dnt_submit_text', __( 'Submit Request', 'wpconsent-cookies-banner-privacy-suite' ) ),
				'',
				'true'
			),
			'dnt_submit_text',
			'',
			'',
			'The text for the form submit button.'
		);
		$this->metabox_row_separator();

		$this->get_form_fields_content();

		$this->get_spam_protection_content();

		return ob_get_clean();
	}

	/**
	 * Get the do not track page input.
	 *
	 * @return string
	 */
	protected function get_dnt_page_input() {
		ob_start();
		$selected_page_id = wpconsent()->settings->get_option( 'dnt_page_id' );
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
			<select id="dnt-page-id" name="dnt_page_id" class="wpconsent-choices wpconsent-page-search" data-placeholder="<?php esc_attr_e( 'Search for a page...', 'wpconsent-cookies-banner-privacy-suite' ); ?>" data-search="true" data-ajax-action="wpconsent_search_pages" data-ajax="true">
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
		<div data-show-if-id="#dnt-page-id" data-show-if-value="0" class="wpconsent-input-area-description">
			<button class="wpconsent-button wpconsent-button-secondary wpconsent-button-icon" id="wpconsent-create-dnt-page" type="button">
				<?php
				wpconsent_icon( 'generate' );
				esc_html_e( 'Generate Do Not Sell Page', 'wpconsent-cookies-banner-privacy-suite' );
				?>
			</button>
		</div>
		<div class="wpconsent-input-area-description">
			<?php
			printf(
			// Translators: %s is the wpconsent_do_not_sell_form shortcode wrapped in code tags.
				esc_html__( 'Select the page where users can submit Do Not Sell requests. This page should contain the %s shortcode.', 'wpconsent-cookies-banner-privacy-suite' ),
				'<code>[wpconsent_do_not_sell_form]</code>'
			);
			?>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the form fields input.
	 *
	 * @return void
	 */
	protected function get_form_fields_content() {
		// Available fields that would be in the form.
		$available_fields = array(
			'first_name' => __( 'First Name', 'wpconsent-cookies-banner-privacy-suite' ),
			'last_name'  => __( 'Last Name', 'wpconsent-cookies-banner-privacy-suite' ),
			'email'      => __( 'Email', 'wpconsent-cookies-banner-privacy-suite' ),
			'address'    => __( 'Address', 'wpconsent-cookies-banner-privacy-suite' ),
		);

		$required_fields = array( 'first_name', 'last_name', 'email' );

		foreach ( $available_fields as $field_key => $default_label ) {
			$enabled_key  = 'dnt_field_' . $field_key . '_enabled';
			$required_key = 'dnt_field_' . $field_key . '_required';
			$label_key    = 'dnt_field_' . $field_key . '_label';

			$is_enabled  = false;
			$is_required = false;
			$field_label = '';

			$is_core_field = in_array( $field_key, $required_fields, true );

			echo $this->get_form_fields_input( $default_label, $enabled_key, $required_key, $label_key, $is_enabled, $is_required, $field_label, $is_core_field );  // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
	}

	/**
	 * Get the form fields input.
	 *
	 * @param string $default_label The default label for the field.
	 * @param string $enabled_key The key for the enabled field.
	 * @param string $required_key The key for the required field.
	 * @param string $label_key The key for the label field.
	 * @param bool   $is_enabled Whether the field is enabled.
	 * @param bool   $is_required Whether the field is required.
	 * @param string $field_label The label for the field.
	 * @param bool   $is_core_field Whether the field is a core field.
	 *
	 * @return string
	 */
	protected function get_form_fields_input( $default_label, $enabled_key, $required_key, $label_key, $is_enabled = false, $is_required = false, $field_label = '', $is_core_field = false ) {
		ob_start();
		if ( ! $is_core_field ) {
			$this->metabox_row(
				esc_html( $default_label ),
				$this->get_checkbox_toggle(
					$is_enabled,
					$enabled_key,
					esc_html__( 'Enable this field', 'wpconsent-cookies-banner-privacy-suite' )
				)
			);

			$this->metabox_row(
				'',
				$this->get_checkbox_toggle(
					$is_required,
					$required_key,
					esc_html__( 'Make this field required', 'wpconsent-cookies-banner-privacy-suite' )
				)
			);
		} else {
			$this->metabox_row(
				esc_html( $default_label ),
				'<div class="required-field-description">
					<p class="description">' . esc_html__( 'This field is always required and cannot be disabled.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>
				</div>',
				'',
				'',
				''
			);
		}

		$this->metabox_row(
			'',
			$this->get_input_text(
				$label_key,
				$field_label,
				'',
				true
			) . '<p class="wpconsent-input-area-description wpconsent-dnt-field-label">Field Label</p>'
		);
		$this->metabox_row_separator();
		return ob_get_clean();
	}

	/**
	 * Get the spam protection content.
	 *
	 * @return void
	 */
	protected function get_spam_protection_content() {
		?>
		<div class="wpconsent-admin-settings-section">
			<h2 class="wpconsent-preferences-section-title"><?php esc_html_e( 'Spam Protection', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
			<div class="wpconsent-form-fields-section-description">
				<p><?php esc_html_e( 'You can use the CAPTCHA settings in WPForms to automatically protect this form.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			</div>
		</div>
		<?php
	}

	/**
	 * Output the export view.
	 *
	 * @return void
	 */
	public function output_view_export() {
		$this->metabox(
			__( 'Export Do Not Sell Requests', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_export_input()
		);
	}

	/**
	 * Get the export form content.
	 *
	 * @return string
	 */
	public function get_export_input() {
		ob_start();
		?>
		<div class="wpconsent-export-section">
			<p><?php esc_html_e( 'Export your Do Not Sell requests data in CSV format.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			<?php
			$this->metabox_row(
				__( 'From:', 'wpconsent-cookies-banner-privacy-suite' ),
				sprintf(
					'<input type="date" id="export-date-from" name="date_from" placeholder="%s" class="wpconsent-date-input">',
					esc_html__( 'From Date', 'wpconsent-cookies-banner-privacy-suite' )
				)
			);

			$this->metabox_row(
				__( 'To:', 'wpconsent-cookies-banner-privacy-suite' ),
				sprintf(
					'<input type="date" id="export-date-to" name="date_to" placeholder="%s" class="wpconsent-date-input">',
					esc_html__( 'To Date', 'wpconsent-cookies-banner-privacy-suite' )
				)
			);

			$this->metabox_row(
				__( 'Export Options:', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_checkbox_toggle(
					false,
					'export-only-not-processed',
					esc_html__( 'Export only "not processed" entries', 'wpconsent-cookies-banner-privacy-suite' )
				),
				'',
				'',
				'',
				esc_html__( 'If checked, only entries that have not been marked as processed will be exported.', 'wpconsent-cookies-banner-privacy-suite' )
			);

			$this->metabox_row(
				'',
				$this->get_checkbox_toggle(
					false,
					'mark-as-processed',
					esc_html__( 'Mark exported data as processed', 'wpconsent-cookies-banner-privacy-suite' )
				),
				'',
				'',
				'',
				esc_html__( 'If checked, all exported entries will be automatically marked as processed.', 'wpconsent-cookies-banner-privacy-suite' )
			);

			wp_nonce_field( 'wpconsent_dnt_export_start', 'wpconsent_dnt_export_nonce' );
			?>
			<div class="wpconsent-metabox-form-row">
				<button id="wpconsent-dnt-export" class="wpconsent-button wpconsent-button-primary" type="button" data-action="reload">
					<?php esc_html_e( 'Export', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
				<div id="wpconsent-dnt-export-progress" style="display: none;">
					<div class="wpconsent-progress-bar">
						<div class="wpconsent-progress-bar-inner"></div>
					</div>
					<div class="wpconsent-progress-status">
						<?php esc_html_e( 'Processing...', 'wpconsent-cookies-banner-privacy-suite' ); ?>
						<span class="wpconsent-progress-percentage">0%</span>
					</div>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Output the notifications view.
	 *
	 * @return void
	 */
	public function output_view_notifications() {
		?>
		<form method="post" action="">
			<?php
			$this->metabox(
				__( 'Email Notifications', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_notifications_content()
			);
			?>
			<div class="wpconsent-submit">
				<button type="submit" name="submit" id="submit" class="wpconsent-button wpconsent-button-primary">
					<?php esc_html_e( 'Save Changes', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
			</div>
		</form>
		<?php
	}

	/**
	 * Get the notifications form content.
	 *
	 * @return string
	 */
	public function get_notifications_content() {
		ob_start();
		?>
		<div class="wpconsent-export-section">
			<p><?php esc_html_e( 'Receive email notifications when new Do Not Sell requests are submitted.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
		</div>
		<?php
		$this->wp_mail_smtp_notice();

		$this->metabox_row(
			esc_html__( 'Email Notifications', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_checkbox_toggle(
				wpconsent()->settings->get_option( 'dnt_email_notifications', 0 ),
				'dnt_email_notifications',
				esc_html__( 'Send email notifications when new Do Not Sell requests are received.', 'wpconsent-cookies-banner-privacy-suite' )
			),
			'dnt_email_notifications'
		);

		$this->metabox_row(
			esc_html__( 'Send To', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_input_text(
				'dnt_email_addresses',
				wpconsent()->settings->get_option( 'dnt_email_addresses', get_option( 'admin_email' ) ),
				'',
				'true'
			),
			'dnt_email_addresses',
			'',
			'',
			esc_html__( 'Enter a comma separated list of email addresses to receive Do Not Sell request notifications. Defaults to the admin email address.', 'wpconsent-cookies-banner-privacy-suite' )
		);

		$this->metabox_row(
			'',
			$this->get_preview_email_button()
		);

		return ob_get_clean();
	}

	/**
	 * Get the preview email button.
	 *
	 * @return string
	 */
	public function get_preview_email_button() {
		ob_start();
		$preview_url = add_query_arg(
			array(
				'wpconsent_dnt_email_template' => 'dnt',
				'wpconsent_dnt_email_preview'  => '1',
			),
			admin_url()
		);
		?>
		<button class="wpconsent-button wpconsent-button-secondary" id="wpconsent-dnt-preview-email" type="button" onclick="window.open('<?php echo esc_url( $preview_url ); ?>', '_blank')">
			<?php
			esc_html_e( 'Preview Email', 'wpconsent-cookies-banner-privacy-suite' );
			?>
		</button>
		<?php
		return ob_get_clean();
	}

	/**
	 * Display a notice to suggest installing WP Mail SMTP.
	 *
	 * @return void
	 */
	public function wp_mail_smtp_notice() {
		if ( function_exists( 'wp_mail_smtp' ) ) {
			return;
		}
		$dismissed_notices = get_option( 'wpconsent_admin_notices', array() );
		$slug              = 'emailsmtp';
		$smtp_url          = add_query_arg(
			array(
				'type' => 'term',
				's'    => 'wp mail smtp',
				'tab'  => 'search',
			),
			admin_url( 'plugin-install.php' )
		);
		if ( ! isset( $dismissed_notices[ $slug ] ) || empty( $dismissed_notices[ $slug ]['dismissed'] ) ) {
			?>
			<div class="notice wpconsent-notice notice-global is-dismissible" id="wpconsent-notice-global-<?php echo esc_attr( $slug ); ?>">
				<h2 class="wpconsent-notice-title"><?php echo esc_html__( 'Make Sure Important Emails Reach Your Inbox', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
				<p>
					<?php
					printf(
					// Translators: %1$s: opening anchor tag, %2$s: closing anchor tag.
						esc_html__( 'Solve common email deliverability issues for good. %1$sGet WP Mail SMTP%2$s!', 'wpconsent-cookies-banner-privacy-suite' ),
						'<a href="' . esc_url( $smtp_url ) . '">',
						'</a>'
					);
					?>
				</p>
			</div>
			<?php
			wpconsent()->notice->enqueues();
		}
	}
}
