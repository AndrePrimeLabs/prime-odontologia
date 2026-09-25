<?php
/**
 * WPConsent Reminders
 *
 * Checks if essential features have not been configured and displays reminders to the user.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WPConsent_Reminders Class
 */
class WPConsent_Reminders {
	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'wp_dashboard_setup', array( $this, 'add_dashboard_widgets' ), 0 );
		// Admin notice if banner is not displayed on the frontend.
		add_action( 'admin_init', array( $this, 'banner_display_reminder' ) );
	}

	/**
	 * Add dashboard widgets
	 */
	public function add_dashboard_widgets() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Only show widget if onboarding is not completed.
		if ( ! wpconsent()->settings->get_option( 'onboarding_completed' ) ) {
			wp_add_dashboard_widget(
				'wpconsent_onboarding_reminder',
				esc_html__( 'WPConsent Setup', 'wpconsent-cookies-banner-privacy-suite' ),
				array( $this, 'render_onboarding_widget' ),
				null,
				null,
				'normal',
				'high'
			);
		}
	}

	/**
	 * Render the onboarding reminder widget
	 */
	public function render_onboarding_widget() {
		?>
		<p>
			<?php esc_html_e( 'Don\'t forget to finish setting up WPConsent! Our wizard will help you choose a cookie banner style and set up cookies effortlessly.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
		</p>
		<p>
			<a href="<?php echo esc_url( admin_url( 'admin.php?page=wpconsent-onboarding' ) ); ?>" class="button button-primary">
				<?php esc_html_e( 'Complete Setup', 'wpconsent-cookies-banner-privacy-suite' ); ?>
			</a>
		</p>
		<?php
	}

	/**
	 * Admin notice if banner is not displayed on the frontend
	 */
	public function banner_display_reminder() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Only show notice if onboarding is completed.
		if ( ! wpconsent()->settings->get_option( 'onboarding_completed' ) ) {
			return;
		}

		// Don't show on our pages.
		if ( isset( $_GET['page'] ) && 'wpconsent-cookies' === $_GET['page'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}
		$banner_visible = wpconsent()->settings->get_option( 'enable_consent_banner' );

		if ( ! $banner_visible ) {
			WPConsent_Notice::info(
				sprintf(
				// translators: %1$s and %2$s are the opening and closing <a> tags, %3$s is the link to the WPConsent settings page.
					esc_html__( 'Your website is not privacy compliant. We highly recommend that you %1$senable displaying the WPConsent privacy compliance banner%2$s.', 'wpconsent-cookies-banner-privacy-suite' ),
					'<a href="' . esc_url( admin_url( 'admin.php?page=wpconsent-cookies' ) ) . '">',
					'</a>'
				),
				array(
					'dismiss' => WPConsent_Notice::DISMISS_GLOBAL,
					'slug'    => 'banner-not-visible',
				)
			);
		}
	}
}
