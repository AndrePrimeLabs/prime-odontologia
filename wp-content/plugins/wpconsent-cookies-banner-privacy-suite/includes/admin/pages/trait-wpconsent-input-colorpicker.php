<?php
/**
 * Color Picker input trait.
 *
 * @package WPConsent
 */

/**
 * Trait WPConsent_Input_Colorpicker.
 */
trait WPConsent_Input_Colorpicker {

	/**
	 * Color picker input.
	 *
	 * @param string $id ID.
	 * @param string $value Value.
	 * @param string $target Target for this picker, makes it easy to attach to other elements for live preview.
	 * @param string $default Default value color.
	 * @param string $target_property The CSS property to update on the target (e.g., 'background-color', 'color').
	 * @param string $name Name.
	 *
	 * @return string
	 */
	public function colorpicker( $id, $value = '', $target = '', $default = '', $target_property = 'background-color', $name = '' ) {
		$name            = ! empty( $name ) ? $name : $id;
		$target          = ! empty( $target ) ? 'data-target="' . esc_attr( $target ) . '"' : '';
		$default         = ! empty( $default ) ? 'data-default-color="' . esc_attr( $default ) . '"' : '';
		$target_property = esc_attr( $target_property );
		$html            = '<input type="text" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '" class="wpconsent-colorpicker" ' . $target . ' ' . $default . ' data-target-property="' . $target_property . '" />';

		return $html;
	}
}
