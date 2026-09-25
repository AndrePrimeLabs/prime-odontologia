<?php
/**
 * Media input trait.
 *
 * @package WPConsent
 */

/**
 * Trait WPConsent_Input_Media
 */
trait WPConsent_Input_Media {

	/**
	 * File input to choose a file.
	 *
	 * @param string $id ID.
	 * @param string $value Value.
	 * @param string $name Name.
	 * @target string $target CSS selector for element where we should show a preview of the image (aside from in the input area).
	 *
	 * @return string
	 */
	public function media( $id, $value = '', $name = '', $target = '' ) {

		$name    = ! empty( $name ) ? $name : $id;

		ob_start();
		?>
		<div class="wpconsent-media-input">
			<input type="hidden"
				id="<?php echo esc_attr( $id ); ?>"
				name="<?php echo esc_attr( $name ); ?>"
				value="<?php echo esc_attr( $value ); ?>"
			/>
			<div class="wpconsent-image-preview" style="margin-bottom: 10px;">
				<?php if ( ! empty( $value ) ) : ?>
					<img src="<?php echo esc_url( $value ); ?>" alt="" style="max-width: 200px; height: auto;">
				<?php endif; ?>
			</div>
			<div class="wpconsent-buttons">
				<button type="button" class="button wpconsent-upload-button" data-input="<?php echo esc_attr( $id ); ?>">
					<?php esc_html_e( 'Choose File', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
				<button type="button" class="button wpconsent-clear-button" data-input="<?php echo esc_attr( $id ); ?>" <?php echo empty( $value ) ? 'style="display: none;"' : ''; ?>>
					<?php esc_html_e( 'Remove', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
			</div>
		</div>
		<script>
			jQuery(document).ready(function($) {
				$('.wpconsent-upload-button').click(function(e) {
					e.preventDefault();
					var inputId = $(this).data('input');
					var $previewContainer = $(this).closest('.wpconsent-media-input').find('.wpconsent-image-preview');
					var $clearButton = $(this).closest('.wpconsent-media-input').find('.wpconsent-clear-button');

					var mediaUploader = wp.media({
						title: '<?php echo esc_js( __( 'Select File', 'wpconsent-cookies-banner-privacy-suite' ) ); ?>',
							button: {
								text: '<?php echo esc_js( __( 'Select', 'wpconsent-cookies-banner-privacy-suite' ) ); ?>'
							},
							multiple: false
					});

					mediaUploader.on('select', function() {
						var attachment = mediaUploader.state().get('selection').first().toJSON();
						$('#' + inputId).val(attachment.url);
						$previewContainer.html('<img src="' + attachment.url + '" alt="" style="max-width: 200px; height: auto;">');
						<?php if ( ! empty( $target ) ) : ?>
							$('<?php echo esc_js( $target ); ?>').html('<img src="' + attachment.url + '" alt="" />');
						<?php endif; ?>
						$clearButton.show();
					});

					mediaUploader.open();
				});

				$('.wpconsent-clear-button').click(function(e) {
					e.preventDefault();
					var inputId = $(this).data('input');
					var $previewContainer = $(this).closest('.wpconsent-media-input').find('.wpconsent-image-preview');
					$('#' + inputId).val('');
					$previewContainer.empty();
					<?php if ( ! empty( $target ) ) : ?>
						$('<?php echo esc_js( $target ); ?>').html('');
					<?php endif; ?>
					$(this).hide();
				});
			});
		</script>
		<?php

		$html = ob_get_clean();

		return $html;
	}
}
