<?php
/**
 * Load docs data from the server and store it
 * in local file cache in the uploads folder.
 *
 * @package WPConsent
 */

/**
 * The class to load docs data from the server.
 */
class WPConsent_Docs {

	/**
	 * The URL from which to grab docs.
	 *
	 * @var string
	 */
	public $url = 'https://docs.wpconsent.com/wp-content/docs.json';

	/**
	 * The categories.
	 *
	 * @var array
	 */
	private $categories;

	/**
	 * The docs data.
	 *
	 * @var array
	 */
	private $docs;

	/**
	 * Load docs data from cache or from the server.
	 *
	 * @return void
	 */
	public function load_docs_data() {
		$docs_data = wpconsent()->file_cache->get( 'docs', DAY_IN_SECONDS );
		if ( false === $docs_data ) {
			$fetched = $this->load_from_server();
			if ( ! empty( $fetched ) ) {
				wpconsent()->file_cache->set( 'docs', $fetched );
				$docs_data = $fetched;
			} else {
				// Fall back to stale cache on fetch failure so the overlay keeps working.
				$docs_data = wpconsent()->file_cache->get( 'docs', 0 );
			}
		}

		$this->categories = isset( $docs_data['categories'] ) ? $docs_data['categories'] : array();
		$this->docs       = isset( $docs_data['docs'] ) ? $docs_data['docs'] : array();
	}

	/**
	 * Get the docs.
	 *
	 * @return array
	 */
	public function get_docs() {
		if ( ! isset( $this->docs ) ) {
			$this->load_docs_data();
		}

		return $this->docs;
	}

	/**
	 * Get the docs categories.
	 *
	 * @return array
	 */
	public function get_categories() {
		if ( ! isset( $this->categories ) ) {
			$this->load_docs_data();
		}

		return $this->categories;
	}

	/**
	 * Load the docs data from the server.
	 *
	 * @return array
	 */
	public function load_from_server() {
		$request = wp_remote_get( $this->url );

		if ( is_wp_error( $request ) || wp_remote_retrieve_response_code( $request ) > 299 ) {
			return array();
		}

		return json_decode( wp_remote_retrieve_body( $request ), true );
	}

	/**
	 * Go through all the docs and retrieve just those for this category.
	 *
	 * @param string $slug The category slug.
	 *
	 * @return array
	 */
	public function get_docs_for_category( $slug ) {
		$docs = $this->get_docs();

		ksort( $docs );
		$category_docs = array();
		foreach ( $docs as $doc ) {
			if ( ! in_array( $slug, $doc['categories'], true ) ) {
				continue;
			}
			$category_docs[] = $doc;
		}

		return $category_docs;
	}

	/**
	 * Output the docs categories markup.
	 *
	 * @return void
	 */
	public function get_categories_accordion() {
		?>
		<div id="wpconsent-help-categories" style="transition: opacity 300ms ease-in 0s; opacity: 1;">
			<ul class="wpconsent-help-categories-toggle">
				<?php
				$ci         = 0;
				$categories = $this->get_categories();
				foreach ( $categories as $slug => $category_title ) {
					$style = 0 === $ci ? 'display:block' : '';
					$class = 0 === $ci ? 'wpconsent-help-category open' : 'wpconsent-help-category';
					$ci ++;
					$docs = $this->get_docs_for_category( $slug );
					$i    = 0;
					?>
					<li class="<?php echo esc_attr( $class ); ?>">
						<header>
							<?php wpconsent_icon( 'folder', 28, 22 ); ?>
							<span><?php echo esc_html( $category_title ); ?></span>
							<?php wpconsent_icon( 'arrow', 10, 16 ); ?>
						</header>
						<ul class="wpconsent-help-docs" style="<?php echo esc_attr( $style ); ?>">
							<?php
							foreach ( $docs as $doc ) {
								$i ++;
								?>
								<li>
									<?php wpconsent_icon( 'file-text', 16, 16 ); ?>
									<a href="<?php echo esc_url( wpconsent_utm_url( $doc['url'], 'help-overlay', 'view-doc', $doc['title'] ) ); ?>" rel="noopener noreferrer" target="_blank">
										<?php echo esc_html( $doc['title'] ); ?>
									</a>
								</li>
								<?php
								if ( 5 === $i && count( $docs ) > 5 ) {
									echo '<div style="display: none;">';
								}
							}
							if ( count( $docs ) > 5 ) {
								echo '</div>'; // Hidden div for the rest of the elements.
								?>
								<button class="wpconsent-button wpconsent-button-secondary viewall" type="button">
									<?php
									printf(
										// Translators: Placeholder for the category name.
										esc_html__( 'View All %s Docs', 'wpconsent-cookies-banner-privacy-suite' ),
										esc_html( $category_title )
									);
									?>
								</button>
								<?php
							}
							?>
						</ul>
					</li>
				<?php } ?>
			</ul>
		</div>
		<?php
	}
}
