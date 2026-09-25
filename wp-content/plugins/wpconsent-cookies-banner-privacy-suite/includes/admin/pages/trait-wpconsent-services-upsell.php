<?php
/**
 * Services Upsell Box Trait
 *
 * @package WPConsent
 */

/**
 * Trait for displaying services upsell box.
 */
trait WPConsent_Services_Upsell {

	/**
	 * Services upsell box.
	 *
	 * @return void
	 */
	public function services_upsell_box( $slug = 'onboarding' ) {
		?>
		<div class="wpconsent-services-upsell">
			<div class="wpconsent-services-upsell-text">
				<h2>
					<?php
					printf(
					// translators: %s is a lightbulb emoji.
						esc_html__( '%s Missing something?', 'wpconsent-cookies-banner-privacy-suite' ),
						'💡'
					);
					?>
				</h2>
				<p>
					<?php
					printf(
					// translators: placeholders make the text bold.
						esc_html__( 'Our free scanner detects common 3rd party scripts and core features. %1$sUpgrade to Pro%2$s and get automatic configuration of cookie data for plugins like WooCommerce, WPForms & many more.', 'wpconsent-cookies-banner-privacy-suite' ),
						'<strong>',
						'</strong>'
					)
					?>
				</p>
				<p>
					<?php
					printf(
					// translators: %1$s is an opening link tag, %2$s is a closing link tag.
						esc_html__( '%1$sPro Tip:%2$s You can manually configure cookie data for any plugin using our free library: %3$s CookieLibrary.org %4$s', 'wpconsent-cookies-banner-privacy-suite' ),
						'<strong>',
						'</strong>',
						'<a href="' . esc_url( wpconsent_utm_url( 'https://cookielibrary.org/', $slug, 'manual-config' ) ) . '" target="_blank" rel="noopener noreferrer">',
						'</a>'
					);
					?>
				</p>
			</div>
			<div class="wpconsent-services-upsell-buttons">
				<a href="<?php echo esc_url( wpconsent_utm_url( 'https://wpconsent.com/lite/', $slug, 'manual-config' ) ); ?>" class="wpconsent-button" target="_blank">
					<?php esc_html_e( 'Upgrade to Pro', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</a>
			</div>
		</div>
		<?php
	}
}
