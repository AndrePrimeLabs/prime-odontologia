<?php
/**
 * Trait for the language picker in the WPConsent admin area.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait WPConsent_Language_Picker {

	/**
	 * Get the language picker button.
	 *
	 * @return void
	 */
	public function language_picker_button() {
		?>
		<div class="wpconsent-language-picker-container">
			<button
				type="button"
				id="wpconsent-languages-button"
				class="wpconsent-button-just-icon wpconsent-languages-button wpconsent-languages-button-lite">
				<?php wpconsent_icon( 'globe', 16, 16, '0 -960 960 960' ); ?>
			</button>
		</div>
		<?php
	}
}
