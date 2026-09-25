<?php
/**
 * Admin page for displaying consent logs.
 *
 * @package WPConsent
 */

/**
 * Consent logs page class.
 */
class WPConsent_Admin_Page_Consent_Logs extends WPConsent_Admin_Page {

	/**
	 * Page slug.
	 *
	 * @var string
	 */
	public $page_slug = 'wpconsent-consent-logs';

	/**
	 * Default view.
	 *
	 *  @var string
	 */
	public $view = 'logs';

	/**
	 * The list table object.
	 *
	 * @var WPConsent_Consent_Logs_List_Table
	 */
	protected $list_table;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->page_title = __( 'Consent Logs', 'wpconsent-cookies-banner-privacy-suite' );
		parent::__construct();
	}

	/**
	 * Page specific Hooks.
	 *
	 * @return void
	 */
	public function page_hooks() {
		$this->views = array(
			'logs'   => __( 'Consent Logs', 'wpconsent-cookies-banner-privacy-suite' ),
			'export' => __( 'Export', 'wpconsent-cookies-banner-privacy-suite' ),
		);
	}


	/**
	 * Output the page content.
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
		echo WPConsent_Admin_Page::get_upsell_box( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			esc_html__( 'Consent Logs is a PRO feature', 'wpconsent-cookies-banner-privacy-suite' ),
			'<p>' . esc_html__( 'Upgrade to WPConsent PRO today and start tracking consent activities on your website. Monitor who accepted your cookie banner and when.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>',
			array(
				'text' => esc_html__( 'Upgrade to PRO and Unlock "Consent Logs"', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'consent-logs-page', 'main' ) ),
			),
			array(
				'text' => esc_html__( 'Learn more about all the features', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'consent-logs-page', 'features' ) ),
			)
		);
	}

	/**
	 * Output the logs view.
	 *
	 * @return void
	 */
	public function output_view_logs() {
		?>
		<div class="alignright">
			<p class="search-box">
				<label class="screen-reader-text" for="wpconsent-search-input">
					<?php esc_html_e( 'Search Logs', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</label>
				<input type="search" 
					disabled="disabled"
					id="wpconsent-search-input" 
					name="s" 
					placeholder="<?php esc_attr_e( 'IP Search', 'wpconsent-cookies-banner-privacy-suite' ); ?>" />
				<?php
				submit_button(
					__( 'Search Logs', 'wpconsent-cookies-banner-privacy-suite' ),
					'',
					'search_submit',
					false,
					array(
						'disabled' => 'disabled',
						'id'       => 'search-submit',
					)
				);
				?>
			</p>
		</div>
		<div class="tablenav top">
			<div class="actions alignleft">
				<label for="filter-by-date-range" class="screen-reader-text">
					<?php esc_html_e( 'Filter by date range', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</label>
				<input type="text" 
					disabled="disabled"
					id="filter-by-date-range" 
					name="date_range" 
					class="wpconsent-date-range"
					placeholder="<?php esc_attr_e( 'Filter by date range', 'wpconsent-cookies-banner-privacy-suite' ); ?>" 
					value="" />
				<?php
				submit_button(
					__( 'Filter', 'wpconsent-cookies-banner-privacy-suite' ),
					'',
					'filter_action',
					false,
					array(
						'disabled' => 'disabled',
						'id'       => 'wpconsent-filter-submit',
					)
				);
				?>
			</div>
			
			<div class="tablenav-pages">
				<span class="displaying-num">5 items</span>
				<span class="pagination-links">
						<span class="tablenav-pages-navspan button disabled">«</span>
						<span class="tablenav-pages-navspan button disabled">‹</span>
						<span class="paging-input">1 of 1</span>
						<span class="tablenav-pages-navspan button disabled">›</span>
						<span class="tablenav-pages-navspan button disabled">»</span>
					</span>
			</div>
		</div>
		<table class="wp-list-table widefat fixed striped">
			<thead>
			<tr>
				<th><?php esc_html_e( 'User', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th><?php esc_html_e( 'IP Address', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th><?php esc_html_e( 'Consent Details', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
				<th><?php esc_html_e( 'Date', 'wpconsent-cookies-banner-privacy-suite' ); ?></th>
			</tr>
			</thead>
			<tbody>
			<?php for ( $i = 0; $i < 5; $i++ ) : ?>
				<tr>
					<td>user<?php echo absint( $i ) + 1; ?></td>
					<td>192.168.1...</td>
					<td>
						<ul class="wpconsent-consent-data">
							<li><strong>Necessary:</strong> Accepted</li>
							<li><strong>Analytics:</strong> Accepted</li>
							<li><strong>Marketing:</strong> Declined</li>
						</ul>
					</td>
					<td><?php echo esc_html( gmdate( 'Y-m-d H:i:s', 1738000125 + $i * DAY_IN_SECONDS ) ); ?></td>
				</tr>
			<?php endfor; ?>
			</tbody>
		</table>
		<?php
	}

	/**
	 * Output the export view.
	 *
	 * @return void
	 */
	public function output_view_export() {
		$this->metabox(
			__( 'Export Consent Logs', 'wpconsent-cookies-banner-privacy-suite' ),
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
			<p><?php esc_html_e( 'Export your consent logs data in CSV format.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
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

			wp_nonce_field( 'wpconsent_export_start', 'wpconsent_export_nonce' );
			?>
			<div class="wpconsent-metabox-form-row">
				<button id="wpconsent-export" class="wpconsent-button wpconsent-button-primary" type="button" data-action="reload">
					<?php esc_html_e( 'Export', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
				<div id="wpconsent-export-progress" style="display: none;">
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
}
