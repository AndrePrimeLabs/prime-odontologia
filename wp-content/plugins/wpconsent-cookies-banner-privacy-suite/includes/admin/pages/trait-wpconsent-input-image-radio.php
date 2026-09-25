<?php
/**
 * Image Radio Input Trait
 *
 * @package WPConsent
 */

/**
 * Trait WPConsent_Input_Image_Radio
 */
trait WPConsent_Input_Image_Radio {

	/**
	 * Radio input with images displayed.
	 *
	 * @param string $id The unique id used as name.
	 * @param array  $options Array of options for the radio fields.
	 * @param string $selected The selected option.
	 * @param string $size Large or small, using a css class.
	 * @param string $name Custom name for input if you want a different id.
	 *
	 * @return string
	 */
	public function image_radio( $id, $options, $selected, $size = 'small', $name = '' ) {
		$name       = ! empty( $name ) ? $name : $id;
		$width      = false;
		$size_class = 'wpconsent-image-radio-' . $size;
		$html       = '<div class="wpconsent-image-radio ' . esc_attr( $size_class ) . '">';
		foreach ( $options as $value => $option ) {
			$selected_attr = '';
			if ( $selected === $value ) {
				$selected_attr = 'checked';
			}
			if ( isset( $option['width'] ) ) {
				$width = $option['width'];
			}
			$pro_option = isset( $option['is_pro'] ) && $option['is_pro'];
			$classes    = array(
				'wpconsent-image-radio-label',
			);
			$disabled   = '';
			$data_attr  = array();
			if ( $pro_option ) {
				$classes[]                    = 'wpconsent-image-radio-label-pro wpconsent-pro-notice';
				$data_attr['pro_title']       = $option['pro_title'];
				$data_attr['pro_description'] = $option['pro_description'];
				$data_attr['pro_link']        = $option['pro_link'];
				$disabled                     = 'disabled';
			}

			$width_attr = $width ? 'width="' . absint( $width ) . '"' : '';

			$html .= '<input type="radio" id="' . esc_attr( $id . '-' . $value ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '" ' . $selected_attr . ' ' . $disabled . '>';
			$html .= '<label class="' . esc_attr( implode( ' ', $classes ) ) . '" for="' . esc_attr( $id . '-' . $value ) . '"';
			foreach ( $data_attr as $key => $value ) {
				$html .= ' data-' . esc_attr( $key ) . '="' . esc_attr( $value ) . '"';
			}
			$html .= '>';
			$html .= '<img src="' . esc_url( $option['img'] ) . '" alt="' . esc_attr( $option['label'] ) . '" ' . $width_attr . '>';
			$html .= '<span class="wpconsent-image-radio-label-text">' . esc_html( $option['label'] ) . '</span>';
			$html .= '</label>';
		}
		$html .= '</div>';

		return $html;
	}
}
