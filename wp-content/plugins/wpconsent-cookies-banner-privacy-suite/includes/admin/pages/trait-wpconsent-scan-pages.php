<?php
/**
 * Trait WPConsent_Scan_Pages
 *
 * This trait is responsible for automatically populating important pages for scanning.
 *
 * @package WPConsent
 */

/**
 * Trait WPConsent_Scan_Pages
 */
trait WPConsent_Scan_Pages {


	/**
	 * Automatically populate important pages for scanning.
	 *
	 * @return void
	 */
	protected function auto_populate_important_pages() {
		// Check if we've already done auto-population before.
		if ( wpconsent()->settings->get_option( 'has_auto_populated_pages', false ) ) {
			return;
		}

		// Define important page titles to look for.
		$important_pages = array(
			'checkout',
			'cart',
			'contact',
			'videos',
		);

		// Search for pages with these titles.
		$pages = get_pages(
			array(
				'post_status'    => 'publish',
				'number'         => 20, // Reasonable limit for important pages.
				'search'         => implode( ' ', $important_pages ), // Search for any of our important terms.
				'search_columns' => array( 'post_title', 'post_name' ),
			)
		);

		$selected_content_ids = array();
		foreach ( $pages as $page ) {
			$page_title = strtolower( $page->post_title );
			$page_slug  = $page->post_name;

			// Check if this is an important page.
			foreach ( $important_pages as $important ) {
				if ( strpos( $page_title, $important ) !== false || strpos( $page_slug, $important ) !== false ) {
					$selected_content_ids[] = $page->ID;
					break;
				}
			}
		}

		// Save the pages we found (if any).
		wpconsent()->settings->update_option( 'manual_scan_pages', $selected_content_ids );

		// Mark that we've done auto-population, regardless of whether we found pages or not.
		wpconsent()->settings->update_option( 'has_auto_populated_pages', true );
	}
}
