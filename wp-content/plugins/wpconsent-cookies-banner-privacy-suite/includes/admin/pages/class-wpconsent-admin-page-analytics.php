<?php
/**
 * Banner analytics admin page.
 *
 * In Lite this renders the real report behind a blur with sample numbers, so
 * the upsell shows exactly what the feature does.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Admin_Page_Analytics
 */
class WPConsent_Admin_Page_Analytics extends WPConsent_Admin_Page {

	use WPConsent_Analytics_Report;

	/**
	 * Page slug.
	 *
	 * @var string
	 */
	public $page_slug = 'wpconsent-analytics';

	/**
	 * The current view. Lite declares no views, so this screen is all there is;
	 * Pro adds a Settings tab beside it.
	 *
	 * @var string
	 */
	public $view = 'overview';

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->page_title = __( 'Analytics', 'wpconsent-cookies-banner-privacy-suite' );
		parent::__construct();
	}

	/**
	 * Output the overview screen: the report behind a blur, then the upsell.
	 *
	 * @return void
	 */
	public function output_view_overview() {
		?>
		<div class="wpconsent-analytics-upsell-area wpconsent-analytics-upsell-area-lite">
		<div class="wpconsent-blur-area">
			<?php
			$totals = $this->get_sample_totals();

			$this->output_funnel_metabox( $totals );
			$this->output_sample_report_cards( $totals );
			?>
		</div>
		<?php
		echo WPConsent_Admin_Page::get_upsell_box( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			esc_html__( 'See How Your Consent Banner Performs', 'wpconsent-cookies-banner-privacy-suite' ),
			'<p>' . esc_html__( 'Banner Analytics shows how many visitors see your banner, what they choose, and how much of your traffic your analytics and ad tools are allowed to measure. Upgrade to start collecting, on your own server, with no new cookies and no third-party requests.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>',
			array(
				'text' => esc_html__( 'Upgrade to WPConsent Pro', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'analytics-page', 'main' ) ),
			),
			array(
				'text' => esc_html__( 'Learn more about Banner Analytics', 'wpconsent-cookies-banner-privacy-suite' ),
				'url'  => esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', 'analytics-page', 'features' ) ),
			),
			array(
				esc_html__( 'Banner views, interactions and decisions', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'Acceptance rate day by day, with banner-edit markers', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'How many visitors your analytics and ad tools may measure', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'Breakdowns by location group', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'Date ranges and trends over time', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html__( 'All data stored on your own server', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
		?>
		</div>
		<?php
	}

	/**
	 * Output the report cards filled with sample data, for the blurred
	 * previews. Used whenever the license does not include the full report,
	 * so no Pro-gated numbers ever reach the page markup.
	 *
	 * @param array|null $totals Sample totals, when the caller already built them.
	 *
	 * @return void
	 */
	protected function output_sample_report_cards( $totals = null ) {
		if ( null === $totals ) {
			$totals = $this->get_sample_totals();
		}
		$series = $this->get_sample_series();

		$this->output_report_cards( $series, $series[14]['date'], 8.4, $totals, $this->get_sample_coverage( $totals['views'] ) );
	}

	/**
	 * Sample funnel numbers for the blurred preview.
	 *
	 * @return array
	 */
	protected function get_sample_totals() {
		$totals = array(
			'views'          => 42318,
			'accept_all'     => 24106,
			'essential_only' => 5318,
			'custom_choice'  => 1780,
		);

		// Derived rather than written out, so the four counts above stay the only
		// numbers to keep consistent.
		$totals['decisions']       = $totals['accept_all'] + $totals['essential_only'] + $totals['custom_choice'];
		$totals['ignored']         = $totals['views'] - $totals['decisions'];
		$totals['acceptance_rate'] = round( ( $totals['accept_all'] / $totals['views'] ) * 100, 1 );
		$totals['ignore_rate']     = round( ( $totals['ignored'] / $totals['views'] ) * 100, 1 );

		return $totals;
	}

	/**
	 * Sample 30-day acceptance-rate series for the blurred preview, stepping up
	 * mid-range so the banner-edit marker has something to explain.
	 *
	 * @return array
	 */
	protected function get_sample_series() {
		$series = array();
		$now    = wpconsent_site_time();

		for ( $day = 29; $day >= 0; $day-- ) {
			$views = 1400;
			$rate  = ( $day > 15 ? 51.5 : 59.5 ) + ( $day % 4 );

			$series[] = array(
				'date'       => gmdate( 'Y-m-d', $now - $day * DAY_IN_SECONDS ),
				'views'      => $views,
				'accept_all' => (int) round( $views * $rate / 100 ),
				'rate'       => $rate,
			);
		}

		return $series;
	}

	/**
	 * Sample coverage rows for the blurred preview, using the site's own
	 * category names so the preview matches the reader's setup.
	 *
	 * @param int $views Sample banner views.
	 *
	 * @return array
	 */
	protected function get_sample_coverage( $views ) {
		$coverage = array();
		$shares   = array( 0.6, 0.58, 0.55 );

		foreach ( array_values( wpconsent()->cookies->get_categories() ) as $index => $category ) {
			$required   = ! empty( $category['required'] );
			$share      = isset( $shares[ $index ] ) ? $shares[ $index ] : 0.5;
			$coverage[] = array(
				'label'       => $category['name'],
				'description' => $category['description'],
				'required'    => $required,
				'measured'    => $required ? $views : (int) round( $views * $share ),
			);
		}

		return $coverage;
	}
}
