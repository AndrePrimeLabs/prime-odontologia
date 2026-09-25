<?php
/**
 * Color Picker input trait.
 *
 * @package WPConsent
 */

/**
 * Trait WPConsent_Input_Colorpicker.
 */
trait WPConsent_Input_WYSIWYG {

	/**
	 * WYSIWYG input using the WordPress editor.
	 *
	 * @param string $id ID.
	 * @param string $value Value.
	 * @param string $name Name.
	 * @param string $target Target.
	 *
	 * @return string
	 */
	public function wysiwyg( $id, $value = '', $name = '', $target = '' ) {

		$name = ! empty( $name ) ? $name : $id;

		$editor_settings = array(
			'textarea_name' => $name,
			'textarea_rows' => 10,
			'media_buttons' => false,
			'quicktags'     => false,
			'tinymce'       => array(
				'resize' => false,
			),
		);

		if ( ! empty( $target ) ) {
			$editor_settings['tinymce']['setup'] = 'function(editor) {
				editor.on("change", function(e) {
					document.getElementById("wpconsent-container").shadowRoot.querySelector("' . esc_js( $target ) . '").innerHTML = editor.getContent();
				});
			}';
		}

		ob_start();
		wp_editor( $value, $id, $editor_settings );
		$html = ob_get_clean();

		return $html;
	}
}
