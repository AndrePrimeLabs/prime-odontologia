<?php
/**
 * Recommended Plugins Widget.
 *
 * Renders a 2x2 grid of recommended free plugins on the dashboard, always
 * showing 4 items. Installed plugins render as a disabled "Installed" button.
 * The visible set is persisted and only rotates 14 days after the user's last
 * widget-driven install, at which point installed slots are swapped for
 * non-installed reserves that haven't been shown yet.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Recommended_Plugins
 */
class WPConsent_Recommended_Plugins {

	/**
	 * All plugin definitions, keyed by short slug (= wordpress.org directory slug).
	 *
	 * @var array
	 */
	private $all_plugins = array();

	/**
	 * Constructor — registers AJAX hook.
	 */
	public function __construct() {
		add_action( 'wp_ajax_wpconsent_install_plugin', array( $this, 'ajax_install_plugin' ) );
	}

	/**
	 * Get all plugin definitions, lazy-loading on first call.
	 *
	 * Deferred so that __() is not called before the text domain loads.
	 *
	 * @return array
	 */
	private function get_all_plugins() {
		if ( empty( $this->all_plugins ) ) {
			$this->all_plugins = $this->define_plugins();
		}

		return $this->all_plugins;
	}

	/**
	 * Define the recommended plugins in display order.
	 *
	 * The first 4 are shown initially. The rest serve as a reserve
	 * to fill gaps as the user installs plugins from the list.
	 *
	 * @return array
	 */
	private function define_plugins() {
		return array(
			// Initial 4.
			'all-in-one-seo-pack'            => array(
				'name'        => __( 'AIOSEO', 'wpconsent-cookies-banner-privacy-suite' ),
				'description' => __( 'Powerful SEO plugin to optimize your site, boost your rankings, and increase organic traffic.', 'wpconsent-cookies-banner-privacy-suite' ),
				'slug'        => 'all-in-one-seo-pack/all_in_one_seo_pack.php',
				'pro_slug'    => 'all-in-one-seo-pack-pro/all_in_one_seo_pack.php',
				'icon'        => 'icon-all-in-one-seo-pack.png',
			),
			'duplicator'                     => array(
				'name'        => __( 'Duplicator', 'wpconsent-cookies-banner-privacy-suite' ),
				'description' => __( 'Simple way to move WordPress sites, create reliable backups, or clone a site for staging.', 'wpconsent-cookies-banner-privacy-suite' ),
				'slug'        => 'duplicator/duplicator.php',
				'pro_slug'    => 'duplicator-pro/duplicator-pro.php',
				'icon'        => 'icon-duplicator.png',
			),
			'search-replace-wpcode'          => array(
				'name'        => __( 'Search & Replace Everything', 'wpconsent-cookies-banner-privacy-suite' ),
				'description' => __( 'Search and replace text, media, and URLs across your entire WordPress database with ease.', 'wpconsent-cookies-banner-privacy-suite' ),
				'slug'        => 'search-replace-wpcode/wsrw.php',
				'pro_slug'    => 'search-replace-wpcode-pro/wsrw-premium.php',
				'icon'        => 'icon-search-replace-wpcode.png',
			),
			'insert-headers-and-footers'     => array(
				'name'        => __( 'WPCode', 'wpconsent-cookies-banner-privacy-suite' ),
				'description' => __( 'The most popular code snippets plugin for WordPress, used by over 3 million websites.', 'wpconsent-cookies-banner-privacy-suite' ),
				'slug'        => 'insert-headers-and-footers/ihaf.php',
				'pro_slug'    => 'wpcode-premium/wpcode.php',
				'icon'        => 'icon-wpcode.svg',
			),
			// Reserve.
			'uncanny-automator'              => array(
				'name'        => __( 'Uncanny Automator', 'wpconsent-cookies-banner-privacy-suite' ),
				'description' => __( 'The easiest and most powerful way to automate your WordPress site with no code.', 'wpconsent-cookies-banner-privacy-suite' ),
				'slug'        => 'uncanny-automator/uncanny-automator.php',
				'pro_slug'    => 'uncanny-automator-pro/uncanny-automator-pro.php',
				'icon'        => 'icon-uncanny-automator.png',
			),
			'wp-mail-smtp'                   => array(
				'name'        => __( 'WP Mail SMTP', 'wpconsent-cookies-banner-privacy-suite' ),
				'description' => __( 'Fix email deliverability issues by reconfiguring WordPress to use a proper mailer.', 'wpconsent-cookies-banner-privacy-suite' ),
				'slug'        => 'wp-mail-smtp/wp_mail_smtp.php',
				'pro_slug'    => 'wp-mail-smtp-pro/wp_mail_smtp.php',
				'icon'        => 'icon-wp-mail-smtp.png',
			),
			'coming-soon'                    => array(
				'name'        => __( 'SeedProd', 'wpconsent-cookies-banner-privacy-suite' ),
				'description' => __( 'Drag-and-drop WordPress builder for landing pages, coming soon, and maintenance mode pages.', 'wpconsent-cookies-banner-privacy-suite' ),
				'slug'        => 'coming-soon/coming-soon.php',
				'pro_slug'    => 'seedprod-coming-soon-pro-5/seedprod-coming-soon-pro-5.php',
				'icon'        => 'icon-seedprod.png',
			),
			'reviews-feed'                   => array(
				'name'        => __( 'Reviews Feed', 'wpconsent-cookies-banner-privacy-suite' ),
				'description' => __( 'Display Google, Yelp, and Facebook reviews on your site to build trust and drive more sales.', 'wpconsent-cookies-banner-privacy-suite' ),
				'slug'        => 'reviews-feed/sb-reviews.php',
				'pro_slug'    => 'reviews-feed-pro/sb-reviews-pro.php',
				'icon'        => 'icon-reviews-feed.png',
			),
			// Cross-promo only: allowlisted so it can be installed, filtered out of the widget
			// by get_recommended(). Carries no name/description/icon because the widget render
			// loop is the only thing that reads those, and this entry never reaches it — the
			// display copy lives with the promo in WPConsent_Cross_Promo::define_promos().
			'universally-language-translation-multilingual-tool' => array(
				'slug'       => 'universally-language-translation-multilingual-tool/universally.php',
				'promo_only' => true,
			),
		);
	}

	/**
	 * Get the list of recommended plugins to display, each tagged with `is_installed`.
	 *
	 * @return array
	 */
	public function get_recommended() {
		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$installed_map = array_flip( array_keys( get_plugins() ) );
		$all_plugins   = $this->get_all_plugins();

		foreach ( $all_plugins as $key => $plugin ) {
			// Cross-promo entries are allowlisted for install but never shown in the widget.
			if ( ! empty( $plugin['promo_only'] ) ) {
				unset( $all_plugins[ $key ] );
				continue;
			}

			// Same "either edition present" question as is_installed(), answered from the
			// get_plugins() map because this loop needs it for every entry anyway. Keep the two
			// in step if the definition of "installed" changes.
			$pro_slug = isset( $plugin['pro_slug'] ) ? $plugin['pro_slug'] : '';

			$all_plugins[ $key ]['is_installed'] = isset( $installed_map[ $plugin['slug'] ] ) || ( $pro_slug && isset( $installed_map[ $pro_slug ] ) );
		}

		// The visible set is persisted, so it can name a key that no longer exists here.
		$result = array();
		foreach ( $this->get_or_rotate_visible_set( $all_plugins ) as $key ) {
			if ( ! isset( $all_plugins[ $key ] ) ) {
				continue;
			}

			$result[ $key ] = $all_plugins[ $key ];
		}

		return $result;
	}

	/**
	 * Get a single plugin definition by its allowlist key.
	 *
	 * Reads the unfiltered list on purpose, so `promo_only` entries resolve here even though
	 * the widget never shows them.
	 *
	 * @param string $key The plugin key, which is also the wordpress.org directory slug.
	 *
	 * @return array The definition, or an empty array when the key is unknown.
	 */
	private function get_plugin( $key ) {
		$all_plugins = $this->get_all_plugins();

		return isset( $all_plugins[ $key ] ) ? $all_plugins[ $key ] : array();
	}

	/**
	 * Whether either edition of an allowlisted plugin is present on disk, active or not.
	 *
	 * Lives here so "either edition counts as installed" is stated next to the allowlist that
	 * defines the two basenames, rather than restated by each caller.
	 *
	 * Checks the file directly instead of get_plugins(), which walks the whole plugin
	 * directory and parses headers for every plugin found — far more work than a single
	 * basename lookup needs. Basenames come from the hardcoded allowlist, never user input.
	 *
	 * get_recommended() answers the same "either edition present" question from the
	 * get_plugins() map, since it already needs that map for every entry. Keep the two in step
	 * if the definition of "installed" changes.
	 *
	 * @param string $key The plugin key.
	 *
	 * @return bool
	 */
	public function is_installed( $key ) {
		$plugin = $this->get_plugin( $key );

		if ( empty( $plugin['slug'] ) ) {
			return false;
		}

		$pro_slug  = isset( $plugin['pro_slug'] ) ? $plugin['pro_slug'] : '';
		$basenames = array_unique( array_filter( array( $plugin['slug'], $pro_slug ) ) );

		foreach ( $basenames as $basename ) {
			if ( file_exists( WP_PLUGIN_DIR . '/' . $basename ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Return the stored visible set, computing the initial pick or rotating when due.
	 *
	 * @param array $all_plugins Plugin definitions with `is_installed` flags.
	 *
	 * @return string[] Ordered list of plugin keys.
	 */
	private function get_or_rotate_visible_set( $all_plugins ) {
		$activated = get_option( 'wpconsent_activated', array() );
		$visible   = isset( $activated['recommended_visible'] ) ? $activated['recommended_visible'] : array();

		if ( empty( $visible ) ) {
			$visible                          = $this->compute_initial_set( $all_plugins );
			$activated['recommended_visible'] = $visible;
			update_option( 'wpconsent_activated', $activated );

			return $visible;
		}

		// A stored key can name a definition that no longer exists — dropped from
		// define_plugins(), or flipped to promo_only, which get_recommended() filters out
		// before calling this. Repair the set here rather than leaving it to the rotation
		// path, so the widget refills on the next load instead of rendering short for up to
		// 14 days. This also means rotate_visible_set() below never sees a stale key.
		$repaired = $this->refill_stale_keys( $visible, $all_plugins );

		if ( $repaired !== $visible ) {
			$visible                          = $repaired;
			$activated['recommended_visible'] = $visible;
			update_option( 'wpconsent_activated', $activated );
		}

		$last_install = isset( $activated['recommended_last_widget_install'] ) ? (int) $activated['recommended_last_widget_install'] : 0;

		if ( ! $last_install || ( time() - $last_install ) < 14 * DAY_IN_SECONDS ) {
			return $visible;
		}

		$rotated = $this->rotate_visible_set( $visible, $all_plugins );

		$activated['recommended_visible'] = $rotated;
		unset( $activated['recommended_last_widget_install'] );
		update_option( 'wpconsent_activated', $activated );

		return $rotated;
	}

	/**
	 * Drop visible-set keys that no longer have a definition and refill to the same size.
	 *
	 * Replacements prefer non-installed plugins, matching compute_initial_set(), so a
	 * reclaimed slot shows something the user can act on where possible.
	 *
	 * @param string[] $visible     Current visible plugin keys.
	 * @param array    $all_plugins Plugin definitions with `is_installed` flags.
	 *
	 * @return string[] The repaired set, or $visible unchanged when no key was stale.
	 */
	private function refill_stale_keys( $visible, $all_plugins ) {
		$kept = array();
		foreach ( $visible as $key ) {
			if ( isset( $all_plugins[ $key ] ) ) {
				$kept[] = $key;
			}
		}

		if ( count( $kept ) === count( $visible ) ) {
			return $visible;
		}

		$non_installed = array();
		$installed     = array();

		foreach ( $all_plugins as $key => $plugin ) {
			if ( in_array( $key, $kept, true ) ) {
				continue;
			}

			if ( empty( $plugin['is_installed'] ) ) {
				$non_installed[] = $key;
			} else {
				$installed[] = $key;
			}
		}

		$target = count( $visible );

		foreach ( array_merge( $non_installed, $installed ) as $key ) {
			if ( count( $kept ) >= $target ) {
				break;
			}

			$kept[] = $key;
		}

		return $kept;
	}

	/**
	 * Compute the initial visible set: 4 non-installed first, installed fill the rest.
	 *
	 * @param array $all_plugins Plugin definitions with `is_installed` flags.
	 *
	 * @return string[] Ordered list of plugin keys.
	 */
	private function compute_initial_set( $all_plugins ) {
		$display_count     = 4;
		$non_installed     = array();
		$already_installed = array();

		foreach ( $all_plugins as $key => $plugin ) {
			if ( ! empty( $plugin['is_installed'] ) ) {
				$already_installed[] = $key;
			} else {
				$non_installed[] = $key;
			}
		}

		$keys = array_slice( $non_installed, 0, $display_count );

		if ( count( $keys ) < $display_count ) {
			$keys = array_merge( $keys, array_slice( $already_installed, 0, $display_count - count( $keys ) ) );
		}

		return $keys;
	}

	/**
	 * Swap installed slots in the visible set for non-installed reserves not yet shown.
	 *
	 * @param string[] $visible     Current visible plugin keys.
	 * @param array    $all_plugins Plugin definitions with `is_installed` flags.
	 *
	 * @return string[] Rotated visible set (unchanged if no reserves exist).
	 */
	private function rotate_visible_set( $visible, $all_plugins ) {
		$reserve = array();
		foreach ( $all_plugins as $key => $plugin ) {
			if ( empty( $plugin['is_installed'] ) && ! in_array( $key, $visible, true ) ) {
				$reserve[] = $key;
			}
		}

		if ( empty( $reserve ) ) {
			return $visible;
		}

		$rotated = array();
		foreach ( $visible as $key ) {
			if ( ! empty( $all_plugins[ $key ]['is_installed'] ) && ! empty( $reserve ) ) {
				$rotated[] = array_shift( $reserve );
			} else {
				$rotated[] = $key;
			}
		}

		return $rotated;
	}

	/**
	 * Stamp the current time to (re)start the 14-day rotation timer.
	 *
	 * The timer only governs the recommended-plugins widget's own rotation, so an install
	 * started somewhere else must not reshuffle it. Guarded here rather than at each call
	 * site so every success path in ajax_install_plugin() is covered by one check.
	 *
	 * @param bool $is_widget_install Whether the request came from the widget's own buttons.
	 *
	 * @return void
	 */
	private function maybe_track_widget_install( $is_widget_install ) {
		if ( ! $is_widget_install ) {
			return;
		}

		$activated = get_option( 'wpconsent_activated', array() );
		$activated['recommended_last_widget_install'] = time();
		update_option( 'wpconsent_activated', $activated );
	}

	/**
	 * Get the icon URL for a plugin image.
	 *
	 * @param string $icon_filename The icon filename.
	 *
	 * @return string
	 */
	private function get_icon_url( $icon_filename ) {
		return WPCONSENT_PLUGIN_URL . 'admin/images/' . $icon_filename;
	}

	/**
	 * Render the recommended plugins dashboard widget.
	 *
	 * Outputs nothing if there are no plugins to recommend.
	 *
	 * @return void
	 */
	public function recommended_plugins_widget() {
		$plugins = $this->get_recommended();

		if ( empty( $plugins ) ) {
			return;
		}

		?>
		<div class="wpconsent-dashboard-box wpconsent-recommended-plugins-widget">
			<div class="wpconsent-dashboard-box-title">
				<h2><?php esc_html_e( 'Recommended Plugins', 'wpconsent-cookies-banner-privacy-suite' ); ?></h2>
			</div>
			<div class="wpconsent-dashboard-box-content">
				<div class="wpconsent-recommended-plugins-grid">
					<?php foreach ( $plugins as $key => $plugin ) : ?>
						<div class="wpconsent-recommended-plugin-item">
							<div class="wpconsent-recommended-plugin-header">
								<img
									src="<?php echo esc_url( $this->get_icon_url( $plugin['icon'] ) ); ?>"
									alt="<?php echo esc_attr( $plugin['name'] ); ?>"
									class="wpconsent-recommended-plugin-icon"
									width="24"
									height="24"
								/>
								<span class="wpconsent-recommended-plugin-name"><?php echo esc_html( $plugin['name'] ); ?></span>
							</div>
							<span class="wpconsent-recommended-plugin-description"><?php echo esc_html( $plugin['description'] ); ?></span>
							<?php if ( ! empty( $plugin['is_installed'] ) ) : ?>
								<button
									type="button"
									class="wpconsent-button wpconsent-button-secondary wpconsent-button-small"
									disabled
								>
									<?php esc_html_e( 'Installed', 'wpconsent-cookies-banner-privacy-suite' ); ?>
								</button>
							<?php else : ?>
								<button
									type="button"
									class="wpconsent-button wpconsent-button-secondary wpconsent-button-small wpconsent-button-install-plugin"
									data-slug="<?php echo esc_attr( $key ); ?>"
									data-source="widget"
								>
									<?php esc_html_e( 'Install', 'wpconsent-cookies-banner-privacy-suite' ); ?>
								</button>
							<?php endif; ?>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Activate a plugin and send a JSON success/error response.
	 *
	 * @param string $plugin_basename   The plugin basename to activate.
	 * @param bool   $is_widget_install Whether the request came from the widget's own buttons.
	 *
	 * @return void Sends JSON and terminates.
	 */
	private function activate_and_respond( $plugin_basename, $is_widget_install ) {
		$activated = activate_plugin( $plugin_basename );
		if ( is_wp_error( $activated ) ) {
			wp_send_json_error( array( 'message' => $activated->get_error_message() ) );
		}
		$this->maybe_track_widget_install( $is_widget_install );
		wp_send_json_success(
			array(
				'message' => esc_html__( 'Plugin activated.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	/**
	 * AJAX handler: install and activate a recommended plugin.
	 *
	 * Validates the slug against the allowlist, then tries (in order):
	 * 1. Already active — return success immediately.
	 * 2. Pro version installed but inactive — activate it.
	 * 3. Lite version installed but inactive — activate it.
	 * 4. Not installed — download from wordpress.org and activate.
	 *
	 * @return void
	 */
	public function ajax_install_plugin() {
		check_ajax_referer( 'wpconsent_admin' );

		if ( ! current_user_can( 'install_plugins' ) || ! current_user_can( 'activate_plugins' ) ) {
			wp_send_json_error(
				array(
					'message' => esc_html__( 'You do not have permission to install plugins. Please ask your site administrator to install it for you.', 'wpconsent-cookies-banner-privacy-suite' ),
				)
			);
		}

		if ( ! wp_is_file_mod_allowed( 'install_plugins' ) ) {
			wp_send_json_error(
				array(
					'message' => esc_html__( 'Plugin installation is not allowed on this site. Please ask your site administrator to install it for you.', 'wpconsent-cookies-banner-privacy-suite' ),
				)
			);
		}

		$slug = isset( $_POST['slug'] ) ? sanitize_key( wp_unslash( $_POST['slug'] ) ) : '';

		// Widget identity is opt-in: only the widget's own buttons send source=widget. Anything
		// missing or unrecognised is treated as an install from elsewhere, so a new install
		// button added anywhere in the admin cannot silently reshuffle the widget rotation.
		$source            = isset( $_POST['source'] ) ? sanitize_key( wp_unslash( $_POST['source'] ) ) : '';
		$is_widget_install = 'widget' === $source;

		if ( ! array_key_exists( $slug, $this->get_all_plugins() ) ) {
			wp_send_json_error(
				array(
					'message' => esc_html__( 'Invalid plugin.', 'wpconsent-cookies-banner-privacy-suite' ),
				)
			);
		}

		$plugin_info = $this->get_all_plugins()[ $slug ];

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/template.php';
		require_once ABSPATH . 'wp-admin/includes/class-wp-screen.php';
		require_once ABSPATH . 'wp-admin/includes/screen.php';
		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		// Set the current screen to avoid undefined notices.
		set_current_screen( 'toplevel_page_wpconsent' );

		// Do not allow WordPress to search/download translations, as this will break JS output.
		remove_action( 'upgrader_process_complete', array( 'Language_Pack_Upgrader', 'async_upgrade' ), 20 );

		// pro_slug is optional throughout: entries for plugins with no separate pro build omit it.
		$pro_slug = isset( $plugin_info['pro_slug'] ) ? $plugin_info['pro_slug'] : '';

		// Already active (either version).
		if ( is_plugin_active( $plugin_info['slug'] ) || ( $pro_slug && is_plugin_active( $pro_slug ) ) ) {
			$this->maybe_track_widget_install( $is_widget_install );
			wp_send_json_success(
				array(
					'message' => esc_html__( 'Plugin already active.', 'wpconsent-cookies-banner-privacy-suite' ),
				)
			);
		}

		$installed_plugins = array_keys( get_plugins() );

		// Pro version installed but not active — activate it.
		if ( $pro_slug && in_array( $pro_slug, $installed_plugins, true ) ) {
			$this->activate_and_respond( $pro_slug, $is_widget_install );
		}

		// Lite version installed but not active — activate it.
		if ( in_array( $plugin_info['slug'], $installed_plugins, true ) ) {
			$this->activate_and_respond( $plugin_info['slug'], $is_widget_install );
		}

		// Not installed — download from wordpress.org and activate.
		wpconsent_require_upgrader();

		$installer = new Plugin_Upgrader( new WPConsent_Skin() );
		$installer->install( 'https://downloads.wordpress.org/plugin/' . $slug . '.zip' );

		wp_cache_delete( 'plugins', 'plugins' );

		$plugin_basename = $installer->plugin_info();
		if ( ! $plugin_basename ) {
			wp_send_json_error(
				array(
					'message' => esc_html__( 'Plugin installation failed. Please try again.', 'wpconsent-cookies-banner-privacy-suite' ),
				)
			);
		}

		$activated = activate_plugin( $plugin_basename );
		if ( is_wp_error( $activated ) ) {
			wp_send_json_error(
				array(
					'message' => esc_html__( 'Plugin installed but could not be activated.', 'wpconsent-cookies-banner-privacy-suite' ),
				)
			);
		}

		$this->maybe_track_widget_install( $is_widget_install );
		wp_send_json_success(
			array(
				'message' => esc_html__( 'Plugin installed and activated.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}
}
