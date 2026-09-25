<?php
/**
 * Select input trait.
 *
 * @package WPConsent
 */

/**
 * Trait WPConsent_Input_Select.
 */
trait WPConsent_Input_Select {

	/**
	 * Select input.
	 *
	 * @param string $id ID.
	 * @param array  $options Options.
	 * @param string $selected Selected.
	 * @param bool   $multiple Multiple.
	 * @param string $name Name.
	 * @param string $target Target.
	 * @param string $target_property Target property.
	 * @param string $prefix Prefix for the CSS class if the target property is set to 'class'.
	 *
	 * @return string
	 */
	public function select( $id, $options, $selected = '', $multiple = false, $name = '', $target = '', $target_property = '', $prefix = '' ) {
		$multiple = $multiple ? 'multiple' : '';
		$name     = ! empty( $name ) ? $name : $id;
		$target   = ! empty( $target ) ? 'data-target="' . esc_attr( $target ) . '"' : '';
		$target_property = ! empty( $target_property ) ? 'data-target-property="' . esc_attr( $target_property ) . '"' : '';
		$prefix         = ! empty( $prefix ) ? 'data-prefix="' . esc_attr( $prefix ) . '"' : '';

		$html = '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" ' . $multiple . ' ' .
				$target . ' ' . $target_property . ' ' . $prefix . ' class="wpconsent-select">';
		foreach ( $options as $value => $label ) {
			$selected_attr = '';
			if ( $selected === $value ) {
				$selected_attr = 'selected';
			}
			$html .= '<option value="' . esc_attr( $value ) . '" ' . $selected_attr . '>' . esc_html( $label ) . '</option>';
		}
		$html .= '</select>';

		return $html;

	}
}
