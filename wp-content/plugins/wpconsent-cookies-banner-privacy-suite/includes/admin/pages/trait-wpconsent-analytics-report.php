<?php
/**
 * Markup for the banner analytics report.
 *
 * Shared so the Lite upsell screen renders the same widgets as the real Pro
 * page, only with sample numbers behind a blur.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Trait WPConsent_Analytics_Report
 */
trait WPConsent_Analytics_Report {

	/**
	 * Get a labelled counter.
	 *
	 * @param string $label    The counter label.
	 * @param string $value    The value, already formatted.
	 * @param string $modifier Optional value class modifier, e.g. 'green'.
	 *
	 * @return string
	 */
	protected function analytics_stat( $label, $value, $modifier = '' ) {
		$class = 'wpconsent-analytics-stat-value';
		if ( ! empty( $modifier ) ) {
			$class .= ' wpconsent-analytics-stat-value-' . $modifier;
		}

		return sprintf(
			'<div class="wpconsent-analytics-stat"><span class="wpconsent-analytics-stat-label">%1$s</span><span class="%2$s">%3$s</span></div>',
			esc_html( $label ),
			esc_attr( $class ),
			esc_html( $value )
		);
	}

	/**
	 * Wrap counters in a row.
	 *
	 * @param string[] $stats    Counter markup from analytics_stat().
	 * @param string   $modifier Optional row class modifier, e.g. 'empty'.
	 *
	 * @return string
	 */
	protected function analytics_stats_row( $stats, $modifier = '' ) {
		if ( empty( $stats ) ) {
			return '';
		}

		$class = 'wpconsent-analytics-stats';
		if ( ! empty( $modifier ) ) {
			$class .= ' wpconsent-analytics-stats-' . $modifier;
		}

		return '<div class="' . esc_attr( $class ) . '">' . implode( '', $stats ) . '</div>';
	}

	/**
	 * Get the stacked bar showing how banner views split by outcome.
	 *
	 * @param array $totals  Totals from WPConsent_Analytics_Stats::summarize().
	 * @param bool  $compact Whether to render the smaller dashboard variant.
	 *
	 * @return string
	 */
	protected function analytics_funnel_bar( $totals, $compact = false ) {
		$total    = max( 1, (int) $totals['views'] );
		$segments = array(
			array(
				'key'   => 'accept',
				'label' => __( 'Accept All', 'wpconsent-cookies-banner-privacy-suite' ),
				'value' => $totals['accept_all'],
			),
			array(
				'key'   => 'essential',
				'label' => __( 'Essential Only', 'wpconsent-cookies-banner-privacy-suite' ),
				'value' => $totals['essential_only'],
			),
			array(
				'key'   => 'custom',
				'label' => __( 'Custom Preferences', 'wpconsent-cookies-banner-privacy-suite' ),
				'value' => $totals['custom_choice'],
			),
			array(
				'key'   => 'ignored',
				'label' => __( 'Ignored', 'wpconsent-cookies-banner-privacy-suite' ),
				'value' => $totals['ignored'],
			),
		);

		$bar    = '';
		$legend = '';
		foreach ( $segments as $segment ) {
			$share = round( ( $segment['value'] / $total ) * 100, 2 );

			$bar .= sprintf(
				'<span class="wpconsent-funnel-segment wpconsent-funnel-segment-%1$s" style="width:%2$s%%" title="%3$s"></span>',
				esc_attr( $segment['key'] ),
				esc_attr( $share ),
				esc_attr( $segment['label'] . ' — ' . number_format_i18n( $segment['value'] ) )
			);

			$legend .= sprintf(
				'<span class="wpconsent-funnel-legend-item"><span class="wpconsent-funnel-dot wpconsent-funnel-segment-%1$s"></span><span class="wpconsent-funnel-legend-label">%2$s</span><span class="wpconsent-funnel-legend-value">%3$s</span></span>',
				esc_attr( $segment['key'] ),
				esc_html( $segment['label'] ),
				esc_html( $compact ? $this->analytics_percent( $share ) : number_format_i18n( $segment['value'] ) . ' · ' . $this->analytics_percent( $share ) )
			);
		}

		return sprintf(
			'<div class="wpconsent-funnel%1$s"><div class="wpconsent-funnel-bar">%2$s</div><div class="wpconsent-funnel-legend">%3$s</div></div>',
			$compact ? ' wpconsent-funnel-compact' : '',
			$bar, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built with esc_attr() above.
			$legend // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built with esc_html() above.
		);
	}

	/**
	 * Get the consent funnel metabox content.
	 *
	 * @param array $totals    Totals from WPConsent_Analytics_Stats::summarize().
	 * @param bool  $show_state Whether the last counter reports collection state
	 *                          rather than the ignore rate, as on Basic and Plus.
	 *
	 * @return string
	 */
	protected function analytics_funnel_content( $totals, $show_state = false ) {
		$last = $show_state
			? $this->analytics_stat(
				__( 'Tracking', 'wpconsent-cookies-banner-privacy-suite' ),
				__( 'Active', 'wpconsent-cookies-banner-privacy-suite' ),
				'pill'
			)
			: $this->analytics_stat( __( 'Ignored', 'wpconsent-cookies-banner-privacy-suite' ), $this->analytics_percent( $totals['ignore_rate'] ) );

		$stats = $this->analytics_stats_row(
			array(
				$this->analytics_stat( __( 'Banner Views', 'wpconsent-cookies-banner-privacy-suite' ), number_format_i18n( $totals['views'] ) ),
				$this->analytics_stat( __( 'Decisions', 'wpconsent-cookies-banner-privacy-suite' ), number_format_i18n( $totals['decisions'] ) ),
				$this->analytics_stat( __( 'Acceptance Rate', 'wpconsent-cookies-banner-privacy-suite' ), $this->analytics_percent( $totals['acceptance_rate'] ), 'green' ),
				$last,
			)
		);

		return $stats
			. '<div class="wpconsent-analytics-eyebrow">' . esc_html__( 'Share of Banner Views', 'wpconsent-cookies-banner-privacy-suite' ) . '</div>'
			. $this->analytics_funnel_bar( $totals );
	}

	/**
	 * Output the consent funnel metabox.
	 *
	 * Shared by the Lite preview and the Pro report so the card cannot drift
	 * between them.
	 *
	 * @param array  $totals  Totals from WPConsent_Analytics_Stats::summarize().
	 * @param string $actions Markup shown on the right of the title (optional).
	 *
	 * @return void
	 */
	protected function output_funnel_metabox( $totals, $actions = '' ) {
		$this->metabox(
			__( 'Consent Funnel', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->analytics_funnel_content( $totals ),
			__( 'Banner views, split by what the visitor did. Views are counted in the browser, so page caching does not affect the count.', 'wpconsent-cookies-banner-privacy-suite' ),
			'',
			$actions
		);
	}

	/**
	 * Get the acceptance-rate trend chart.
	 *
	 * @param array       $series    Series from WPConsent_Analytics_Stats::get_series().
	 * @param string      $edit_date Date of the last banner edit, or an empty string.
	 * @param float|null  $change    Change in points across the banner edit.
	 * @param float       $average   Acceptance rate for the whole range.
	 *
	 * @return string
	 */
	protected function analytics_trend_content( $series, $edit_date, $change, $average ) {
		// Days with no views have no rate to plot, so the line connects the days
		// that do rather than dropping to zero on quiet days.
		$points = array();
		foreach ( $series as $index => $day ) {
			if ( $day['views'] > 0 ) {
				$points[ $index ] = $day['rate'];
			}
		}

		if ( count( $points ) < 2 ) {
			return '<p>' . esc_html__( 'Not enough days with banner views yet to draw a trend. Come back once the banner has been seen on at least two days.', 'wpconsent-cookies-banner-privacy-suite' ) . '</p>';
		}

		$last = count( $series ) - 1;
		$axis = sprintf(
			'<div class="wpconsent-trend-axis"><span>%1$s</span><span>%2$s</span><span>%3$s</span></div>',
			esc_html( $this->analytics_date( $series[0]['date'] ) ),
			esc_html( $this->analytics_date( $series[ (int) floor( $last / 2 ) ]['date'] ) ),
			esc_html( $this->analytics_date( $series[ $last ]['date'] ) )
		);

		$stats = array(
			$this->analytics_stat( __( 'Range Average', 'wpconsent-cookies-banner-privacy-suite' ), $this->analytics_percent( $average ) ),
		);
		if ( null !== $change ) {
			$stats[] = $this->analytics_stat(
				__( 'Since Banner Edit', 'wpconsent-cookies-banner-privacy-suite' ),
				sprintf( '%1$s%2$s pts', $change >= 0 ? '+' : '-', number_format_i18n( abs( $change ), 1 ) ),
				$change >= 0 ? 'green' : 'red'
			);
		}

		// Where the banner edit falls in the series. An empty edit date matches no
		// day, so it lands on null and the chart draws no marker.
		$edit_index = array_search( $edit_date, array_column( $series, 'date' ), true );

		return $this->analytics_trend_chart( $points, $last, false === $edit_index ? null : $edit_index, $series )
			. $axis
			. $this->analytics_stats_row( $stats );
	}

	/**
	 * Get the trend chart SVG.
	 *
	 * @param array    $points     Acceptance rate keyed by its day's index in the series.
	 * @param int      $last       Index of the last day in the series.
	 * @param int|null $edit_index Index of the banner edit, or null for no marker.
	 * @param array    $series     The full series, for the per-day hover tooltips.
	 *
	 * @return string
	 */
	protected function analytics_trend_chart( $points, $last, $edit_index, $series ) {
		$width  = 600;
		$height = 120;

		// Round the axis out to the nearest ten either side of the data, keeping at
		// least ten points of span so a flat rate still draws mid-height.
		$max = min( 100, max( 10, (int) ceil( max( $points ) / 10 ) * 10 ) );
		$min = max( 0, (int) floor( min( $points ) / 10 ) * 10 );
		if ( $max - $min < 10 ) {
			$min = max( 0, $max - 10 );
		}

		$x = static function ( $index ) use ( $last, $width ) {
			return round( $last > 0 ? ( $index / $last ) * $width : 0, 1 );
		};
		$y = static function ( $rate ) use ( $min, $max, $height ) {
			return $height - ( ( $rate - $min ) / ( $max - $min ) ) * ( $height - 10 ) - 5;
		};

		$path = '';
		foreach ( $points as $index => $rate ) {
			$path .= ( '' === $path ? 'M' : 'L' ) . $x( $index ) . ' ' . round( $y( $rate ), 1 ) . ' ';
		}

		// One hover column per plotted day, with a dot pinned to the line and a
		// tooltip naming the day's value. Days with no views have no column.
		$hotspots = '';
		foreach ( $points as $index => $rate ) {
			$left = $last > 0 ? ( $index / $last ) * 100 : 0;

			// Points on the right half open their tooltip to the left, so a
			// tooltip can never extend past the chart and scroll the page.
			$hotspots .= sprintf(
				'<span class="wpconsent-trend-hotspot%6$s" style="left:%1$s%%"><i style="top:%2$s%%"></i><span class="wpconsent-trend-tooltip"><strong>%3$s</strong> %4$s &middot; %5$s</span></span>',
				esc_attr( round( $left, 2 ) ),
				esc_attr( round( ( $y( $rate ) / $height ) * 100, 2 ) ),
				esc_html( $this->analytics_percent( $rate ) ),
				esc_html( $this->analytics_date( $series[ $index ]['date'] ) ),
				esc_html(
					sprintf(
						/* translators: %s: number of banner views. */
						_n( '%s view', '%s views', $series[ $index ]['views'], 'wpconsent-cookies-banner-privacy-suite' ),
						number_format_i18n( $series[ $index ]['views'] )
					)
				),
				$left > 50 ? ' wpconsent-trend-hotspot-end' : ''
			);
		}

		$marker = '';
		$label  = '';
		if ( null !== $edit_index ) {
			$marker = sprintf(
				'<line x1="%1$s" x2="%1$s" y1="0" y2="%2$s" class="wpconsent-trend-marker" vector-effect="non-scaling-stroke" />',
				esc_attr( $x( $edit_index ) ),
				esc_attr( $height )
			);
			$label  = sprintf(
				'<span class="wpconsent-trend-edit-label" style="left:%1$s%%">%2$s</span>',
				esc_attr( round( $last > 0 ? ( $edit_index / $last ) * 100 : 0, 2 ) ),
				esc_html__( 'Banner edited', 'wpconsent-cookies-banner-privacy-suite' )
			);
		}

		return sprintf(
			'<div class="wpconsent-trend">
				<span class="wpconsent-trend-max">%1$s</span>
				%7$s
				<svg viewBox="0 0 %2$s %3$s" preserveAspectRatio="none" role="img" aria-label="%4$s">
					<path d="%5$s L %2$s %3$s L 0 %3$s Z" class="wpconsent-trend-area" />
					<path d="%5$s" class="wpconsent-trend-line" vector-effect="non-scaling-stroke" />
					%6$s
				</svg>
				<div class="wpconsent-trend-hotspots" style="--wpconsent-trend-column:%8$s%%" aria-hidden="true">%9$s</div>
			</div>',
			esc_html( $this->analytics_percent( $max ) ),
			esc_attr( $width ),
			esc_attr( $height ),
			esc_attr__( 'Acceptance rate per day', 'wpconsent-cookies-banner-privacy-suite' ),
			esc_attr( trim( $path ) ),
			$marker, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built with esc_attr() above.
			$label, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built with esc_attr() above.
			esc_attr( round( 100 / max( 1, $last ), 3 ) ),
			$hotspots // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped while built above.
		);
	}

	/**
	 * Output the report cards: the acceptance-rate trend, measurement coverage
	 * and, when a breakdown is given, the location groups. Shared by the Pro
	 * report and the Lite preview so the preview always matches the real screen.
	 *
	 * @param array      $series    Daily acceptance-rate series.
	 * @param string     $edit_date Date of the last banner edit, or an empty string.
	 * @param float|null $change    Acceptance-rate change since the banner edit.
	 * @param array      $totals    Range totals, including views and acceptance_rate.
	 * @param array      $coverage  Measurement coverage rows.
	 * @param array|null $breakdown Location-group breakdown, or null to leave the card out.
	 *
	 * @return void
	 */
	protected function output_report_cards( $series, $edit_date, $change, $totals, $coverage, $breakdown = null ) {
		$this->metabox(
			__( 'Acceptance Rate Over Time', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->analytics_trend_content( $series, $edit_date, $change, $totals['acceptance_rate'] ),
			__( 'Accept All decisions as a share of banner views, per day. A change here means visitor behaviour or your banner changed, not that traffic changed.', 'wpconsent-cookies-banner-privacy-suite' )
		);

		$this->metabox(
			__( 'Measurement Coverage', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->analytics_coverage_content( $coverage, $totals['views'] ),
			__( 'How many of your visitors each cookie category is allowed to measure. Counted against all banner views, so visitors who ignored the banner count as a blind spot. Category names follow your own Cookie Settings.', 'wpconsent-cookies-banner-privacy-suite' ),
			'',
			sprintf(
				'<a href="%1$s" class="wpconsent-metabox-title-link">%2$s &rarr;</a>',
				esc_url( $this->get_page_url( 'wpconsent-cookies' ) ),
				esc_html__( 'Cookie Settings', 'wpconsent-cookies-banner-privacy-suite' )
			)
		);

		if ( null !== $breakdown ) {
			$this->metabox(
				__( 'By Location Group', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->analytics_groups_content( $breakdown ),
				__( 'Grouped by the geolocation rules set in Cookie Settings.', 'wpconsent-cookies-banner-privacy-suite' )
			);
		}
	}

	/**
	 * Get the measurement coverage rows.
	 *
	 * @param array $coverage Coverage from WPConsent_Analytics_Stats::get_coverage().
	 * @param int   $views    Total banner views in the range.
	 *
	 * @return string
	 */
	protected function analytics_coverage_content( $coverage, $views ) {
		$rows = '';
		foreach ( $coverage as $category ) {
			$share = $views > 0 ? round( ( $category['measured'] / $views ) * 100, 1 ) : 0;

			$rows .= sprintf(
				'<div class="wpconsent-coverage-row">
					<div class="wpconsent-coverage-label">
						<span class="wpconsent-coverage-name">%1$s%2$s</span>
						<span class="wpconsent-coverage-description">%3$s</span>
					</div>
					<div class="wpconsent-coverage-track"><span class="wpconsent-coverage-fill%4$s" style="width:%5$s%%"></span></div>
					<div class="wpconsent-coverage-value">%6$s <span>· %7$s</span></div>
				</div>',
				esc_html( $category['label'] ),
				$category['required'] ? ' <span class="wpconsent-coverage-pill">' . esc_html__( 'Always On', 'wpconsent-cookies-banner-privacy-suite' ) . '</span>' : '',
				esc_html( $category['description'] ),
				$category['required'] ? ' wpconsent-coverage-fill-required' : '',
				esc_attr( $share ),
				esc_html( number_format_i18n( $category['measured'] ) ),
				esc_html( $this->analytics_percent( $share ) )
			);
		}

		$legend = sprintf(
			'<div class="wpconsent-coverage-legend">
				<span><span class="wpconsent-coverage-key wpconsent-coverage-key-measured"></span>%1$s</span>
				<span><span class="wpconsent-coverage-key wpconsent-coverage-key-blind"></span>%2$s</span>
				<span class="wpconsent-coverage-legend-total">%3$s</span>
			</div>',
			esc_html__( 'Visitors your tools may measure', 'wpconsent-cookies-banner-privacy-suite' ),
			esc_html__( 'Blind spot', 'wpconsent-cookies-banner-privacy-suite' ),
			esc_html(
				sprintf(
					/* translators: %s: number of banner views. */
					__( 'Out of %s banner views', 'wpconsent-cookies-banner-privacy-suite' ),
					number_format_i18n( $views )
				)
			)
		);

		return $legend . $rows;
	}

	/**
	 * Get the table of views and acceptance per location group.
	 *
	 * @param array $breakdown Breakdown from WPConsent_Analytics_Stats::get_group_breakdown().
	 *
	 * @return string
	 */
	protected function analytics_groups_content( $breakdown ) {
		$rows = '';
		foreach ( $breakdown as $group ) {
			$rows .= sprintf(
				'<tr><td>%1$s</td><td class="wpconsent-align-right">%2$s</td><td class="wpconsent-align-right">%3$s</td></tr>',
				esc_html( $group['name'] ),
				esc_html( number_format_i18n( $group['views'] ) ),
				esc_html( $this->analytics_percent( $group['acceptance_rate'] ) )
			);
		}

		return sprintf(
			'<table class="wpconsent-analytics-table">
				<thead><tr><th>%1$s</th><th class="wpconsent-align-right">%2$s</th><th class="wpconsent-align-right">%3$s</th></tr></thead>
				<tbody>%4$s</tbody>
			</table>',
			esc_html__( 'Group', 'wpconsent-cookies-banner-privacy-suite' ),
			esc_html__( 'Views', 'wpconsent-cookies-banner-privacy-suite' ),
			esc_html__( 'Accept All', 'wpconsent-cookies-banner-privacy-suite' ),
			$rows // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built with esc_html() above.
		);
	}

	/**
	 * Format a percentage for display.
	 *
	 * @param float $value The percentage value.
	 *
	 * @return string
	 */
	protected function analytics_percent( $value ) {
		return number_format_i18n( (float) $value, 1 ) . '%';
	}

	/**
	 * Format a stored date for display.
	 *
	 * @param string $date Date in Y-m-d format.
	 *
	 * @return string
	 */
	protected function analytics_date( $date ) {
		if ( empty( $date ) ) {
			return '';
		}

		return date_i18n( get_option( 'date_format' ), strtotime( $date ) );
	}
}
