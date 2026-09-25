<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ask for some love.
 *
 *
 */
class WPConsent_Review {

	/**
	 * Primary class constructor.
	 *
	 *
	 */
	public function __construct() {

		// Admin notice requesting review.
		add_action( 'admin_init', array( $this, 'review_request' ) );

		// Admin footer text.
		add_filter( 'admin_footer_text', array( $this, 'admin_footer' ), 1, 2 );
	}

	/**
	 * Add admin notices as needed for reviews.
	 */
	public function review_request() {

		// Only consider showing the review request to admin users.
		if ( ! is_super_admin() ) {
			return;
		}

		// Verify that we can do a check for reviews.
		$notices = get_option( 'wpconsent_admin_notices', array() );
		$time    = time();
		$load    = false;

		if ( empty( $notices['review_request'] ) ) {
			$notices['review_request'] = array(
				'time'      => $time,
				'dismissed' => false,
			);

			update_option( 'wpconsent_admin_notices', $notices );

			return;
		}

		// Check if it has been dismissed or not.
		if (
			( isset( $notices['review_request']['dismissed'] ) &&
			  ! $notices['review_request']['dismissed'] ) &&
			(
				isset( $notices['review_request']['time'] ) &&
				( ( $notices['review_request']['time'] + DAY_IN_SECONDS ) <= $time )
			)
		) {
			$load = true;
		}

		// If we cannot load, return early.
		if ( ! $load ) {
			return;
		}

		$this->review();
	}

	/**
	 * Maybe show Lite review request.
	 */
	public function review() {

		// Fetch when plugin was initially installed.
		$activated = get_option( 'wpconsent_activated', array() );

		if ( ! empty( $activated['wpconsent'] ) ) {
			// Only continue if plugin has been installed for at least 14 days.
			if ( ( $activated['wpconsent'] + ( DAY_IN_SECONDS * 14 ) ) > time() ) {
				return;
			}
		} else {
			$activated['wpconsent'] = time();

			update_option( 'wpconsent_activated', $activated );

			return;
		}

		// Only proceed with displaying if the user completed onboarding.
		if ( ! wpconsent()->settings->get_option( 'onboarding_completed' ) ) {
			return;
		}

		$feedback_url = add_query_arg( array(
			'siteurl' => untrailingslashit( home_url() ),
			'plugin'  => class_exists( 'WPConsent_Premium' ) ? 'pro' : 'lite',
			'version' => WPCONSENT_VERSION,
		), 'https://www.wpconsent.com/plugin-feedback/' );
		$feedback_url = wpconsent_utm_url( $feedback_url, 'review-notice', 'feedback' );

		ob_start();

		// We have a candidate! Output a review message.
		?>
		<div class="wpconsent-review-step wpconsent-review-step-1">
			<p><?php esc_html_e( 'Hey, there! Are you enjoying using WPConsent?', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			<p>
				<a href="#" class="wpconsent-review-switch-step" data-step="3"><?php esc_html_e( 'Yes', 'wpconsent-cookies-banner-privacy-suite' ); ?></a>&nbsp;&bull;&nbsp;<a href="#" class="wpconsent-review-switch-step" data-step="2"><?php esc_html_e( 'Not Really', 'wpconsent-cookies-banner-privacy-suite' ); ?></a>
			</p>
		</div>
		<div class="wpconsent-review-step wpconsent-review-step-2" style="display: none">
			<p><?php esc_html_e( 'We\'re sorry to hear WPConsent has not been a good fit. We would love a chance to improve. Could you take a minute and let us know what we can do better?', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			<p>
				<a href="<?php echo esc_url( $feedback_url ); ?>" class="wpconsent-notice-dismiss" target="_blank"><?php esc_html_e( 'Give Feedback', 'wpconsent-cookies-banner-privacy-suite' ); ?></a>&nbsp;&bull;&nbsp;<a href="#" class="wpconsent-notice-dismiss" rel="noopener noreferrer"><?php esc_html_e( 'No thanks', 'wpconsent-cookies-banner-privacy-suite' ); ?></a>
			</p>
		</div>
		<div class="wpconsent-review-step wpconsent-review-step-3" style="display: none">
			<p><?php esc_html_e( 'That\'s awesome! Could you please do us a BIG favor and give it a 5-star rating on WordPress to help us spread the word and boost our motivation?', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
			<p>
				<a href="https://wordpress.org/support/plugin/wpconsent-cookies-banner-privacy-suite/reviews/#new-post" class="wpconsent-notice-dismiss wpconsent-review-out" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Give Feedback', 'wpconsent-cookies-banner-privacy-suite' ); ?></a>&nbsp;&bull;&nbsp;<a href="#" class="wpconsent-notice-dismiss" rel="noopener noreferrer"><?php esc_html_e( 'No thanks', 'wpconsent-cookies-banner-privacy-suite' ); ?></a><br>
			</p>
		</div>
		<script type="text/javascript">
			jQuery( document ).ready( function ( $ ) {
				$( document ).on( 'click', '.wpconsent-review-switch-step', function ( e ) {
					e.preventDefault();
					var target = $( this ).attr( 'data-step' );
					if ( target ) {
						var notice = $( this ).closest( '.wpconsent-review-notice' );
						var review_step = notice.find( '.wpconsent-review-step-' + target );
						if ( review_step.length > 0 ) {
							notice.find( '.wpconsent-review-step:visible' ).fadeOut( function () {
								review_step.fadeIn();
							} );
						}
					}
				} );
			} );
		</script>
		<?php

		WPConsent_Notice::info(
			ob_get_clean(),
			array(
				'dismiss' => WPConsent_Notice::DISMISS_GLOBAL,
				'slug'    => 'review_request',
				'autop'   => false,
				'class'   => 'wpconsent-review-notice',
			)
		);
	}

	/**
	 * When user is on a WPConsent related admin page, display footer text
	 * that graciously asks them to rate us.
	 *
	 * @param string $text Footer text.
	 *
	 * @return string
	 *
	 *
	 */
	public function admin_footer( $text ) {

		global $current_screen;

		if ( ! empty( $current_screen->id ) && strpos( $current_screen->id, 'wpconsent' ) !== false ) {
			$url  = 'https://wordpress.org/support/plugin/wpconsent-cookies-banner-privacy-suite/reviews/#new-post';
			$text = sprintf(
				wp_kses( /* translators: $1$s - WPConsent plugin name; $2$s - WP.org review link; $3$s - WP.org review link. */
					__( 'Please rate %1$s <a href="%2$s" target="_blank" rel="noopener noreferrer">&#9733;&#9733;&#9733;&#9733;&#9733;</a> on <a href="%3$s" target="_blank" rel="noopener">WordPress.org</a> to help us spread the word. Thank you from the WPConsent team!', 'wpconsent-cookies-banner-privacy-suite' ),
					array(
						'a' => array(
							'href'   => array(),
							'target' => array(),
							'rel'    => array(),
						),
					)
				),
				'<strong>WPConsent</strong>',
				$url,
				$url
			);
		}

		return $text;
	}
}

new WPConsent_Review();
