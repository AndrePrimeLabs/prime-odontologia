<?php
if ( ! class_exists( 'Onepress_Section_Base' ) ) {
	class Onepress_Section_Base {

		public $id = 'base';

		function customize_settings() {
			$settings = array();
			return $settings;
		}

		function set_id( $id ) {
			if ( $id ) {
				$this->id = $id;
			}
		}

		function get_settings( $remove_prefix = '' ) {
			$data = array();
			$settings = $this->customize_settings();
			foreach ( $settings as $id => $args ) {
				$get  = true;
				if ( isset( $args['type'] ) ) {
					if ( $args['type'] == 'panel' || $args['type'] == 'section' ) {
						$get = false;
					}
				}

				if ( $get ) {
					$_key = str_replace( '{id}', $this->id, $id );
					// type
					$type = '';
					$default = '';
					if ( isset( $args['setting'] ) && is_array( $args['setting'] ) ) {
						if ( isset( $args['setting']['type'] ) && $args['setting']['type'] == 'option' ) {
							$type = 'option';
						}
						if ( isset( $args['setting']['default'] ) ) {
							$default = $args['setting']['default'];
						}
					}

					if ( $type == 'option' ) {
						$value = get_option( $_key, $default );
					} else {
						$value = get_theme_mod( $_key, $default );
					}

					if ( $remove_prefix ) {
						$data[ str_replace( $remove_prefix, '', $_key ) ] = $value;
					} else {
						$data[ $_key ] = $value;
					}
				}
			}
			return $data;
		}

		function get_section_classes() {
			return array( 'section-' . $this->id, 'onepage-section' );
		}

		/**
		 * Retrieve the name of the highest priority template file that exists.
		 *
		 * Searches in the STYLESHEETPATH before TEMPLATEPATH so that themes which
		 * inherit from a parent theme can just overload one file.
		 *
		 * @param string|array $template_names Template file(s) to search for, in order.
		 * @param bool         $load           If true the template file will be loaded if it is found.
		 * @param bool         $require_once   Whether to require_once or require. Default true. Has no effect if $load is false.
		 * @return string The template filename if one is located.
		 */
		function load_template( $template_names, $data = array() ) {
			$_located = '';

			$_is_child = STYLESHEETPATH != TEMPLATEPATH;

			foreach ( (array) $template_names as $template_name ) {
				if ( ! $template_name ) {
					continue;
				}

				if ( $_is_child && file_exists( STYLESHEETPATH . '/' . $template_name ) ) {  // Child them
					$_located = STYLESHEETPATH . '/' . $template_name;
					break;

				} elseif ( file_exists( ONEPRESS_PLUS_PATH . $template_name ) ) { // Check part in the plugin
					$_located = ONEPRESS_PLUS_PATH . $template_name;
					break;
				} elseif ( file_exists( TEMPLATEPATH . '/' . $template_name ) ) { // current_theme
					$_located = TEMPLATEPATH . '/' . $template_name;
					break;
				}
			}

			$section = $this;

			extract( $data, EXTR_SKIP );

			if ( $_located ) {
				include $_located;
			}

		}


	}
}
