<?php
if ( ! class_exists( 'Onepress_Customize' ) ) {
	class Onepress_Customize {
		private static $_instance = null;
		private $sections = array();
		private $customize_settings = array();

		static function get_instance() {
			if ( is_null( self::$_instance ) ) {
				self::$_instance = new self();
			}

			return self::$_instance;
		}

		function add_setting( $id, $args ) {
			$this->customize_settings[ $id ] = $args;
		}

		function get_sections() {
			return $this->sections;
		}

		function get_section_by_id( $id ) {
			return isset( $this->sections[ $id ] ) ? $this->sections[ $id ] : false;
		}

		/**
		 * Register customize settings to WP Customize
		 *
		 * @param WP_Customize_Manager $wp_customize
		 */
		function register_customize_settings( $wp_customize ) {

			// Register single category setting.
			foreach ( $this->customize_settings as $id => $args ) {
				$this->add_customize_settings( $wp_customize, $id, $args );
			}

			if ( class_exists( 'Onepress_Config' ) ) {
				$sections = Onepress_Config::get_sections();
				foreach ( $this->sections as $id => $v ) {
					if ( ! isset( $sections[ $id ] ) ) {
						$sections[ $id ] = $v;
					}
				}
			} else {
				$sections = $this->sections;
			}

			// Register settings by sections
			foreach ( $sections as $sid => $info ) {

				$section_class = '';

				if ( is_string( $info ) ) {
					$section_class = $info;
				} else {
					if ( is_object( $info ) ) {
						$section_class = $info;
					} else {
						$section_class = isset( $info['__class'] ) ? $info['__class'] : false;
					}
				}

				if ( ! $section_class ) {
					$section_class = $this->get_section_by_id( $sid );
				}

				if ( $section_class ) {

					/**
					 *
					 * Load sections if enabled
					 *
					 * @since 2.0.9
					 */
					if ( class_exists( 'Onepress_Config' ) ) {
						if ( Onepress_Config::is_section_active( $sid ) ) {

							if ( is_string( $section_class ) ) {
								$section = new $section_class();
							} else {
								$section = $section_class;
							}

							if ( method_exists( $section, 'wp_customize' ) ) {
								$section->wp_customize( $wp_customize );
							}

							if ( $section instanceof Onepress_Section_Base ) {
								$settings = $section->customize_settings();
								if ( ! empty( $settings ) ) {
									foreach ( $settings as $id => $args ) {
										$new_id = str_replace( '{id}', $sid, $id );
										$this->add_customize_settings( $wp_customize, $new_id, $args, $sid );
									}
								}
							}
						}
					} else { // Fallback to OnePress version under 2.1.1

						if ( is_string( $section_class ) ) {
							$section = new $section_class();
						} else {
							$section = $section_class;
						}

						if ( method_exists( $section, 'wp_customize' ) ) {
							$section->wp_customize( $wp_customize );
						}

						if ( $section instanceof Onepress_Section_Base ) {
							$settings = $section->customize_settings();
							if ( ! empty( $settings ) ) {
								foreach ( $settings as $id => $args ) {
									$new_id = str_replace( '{id}', $sid, $id );
									$this->add_customize_settings( $wp_customize, $new_id, $args, $sid );
								}
							}
						}
					}
				}
			} // end loop section

		}

		private function maybe_replace_id( $args, $new_id ) {
			if ( ! $new_id ) {
				return $args;
			}
			foreach ( $args as $k => $v ) {
				if ( is_string( $v ) ) {
					$args[ $k ] = str_replace( '{id}', $new_id, $v );
				} else {
					if ( is_array( $v ) ) {
						$args[ $k ] = $this->maybe_replace_id( $v, $new_id );
					}
				}
			}

			return $args;
		}

		/**
		 * @param $wp_customize WP_Customize_Manager
		 * @param $id
		 * @param $args
		 */
		private function add_customize_settings( $wp_customize, $id, $args, $_replace_id = false ) {
			$args = wp_parse_args(
				$args,
				array(
					'setting'       => array(
						'sanitize_callback' => 'sanitize_text_field',
						'default'           => '',
					),
					'type' => '', // section, panel or empty
					'control_class' => '', // Custom customize control
					'control'       => array(),
				)
			);

			$args = $this->maybe_replace_id( $args, $_replace_id );

			switch ( $args['type'] ) {
				case 'panel':
					$_args = is_array( $args['control'] ) && ! empty( $args['control'] ) ? $args['control'] : $args;
					unset( $_args['type'] );
					if ( $args['control_class'] ) {
						$wp_customize->add_panel( new $args['control_class']( $wp_customize, $id, $_args ) );
					} else {
						$wp_customize->add_panel( $id, $_args );
					}

					break;
				case 'section':
					$_args = is_array( $args['control'] ) && ! empty( $args['control'] ) ? $args['control'] : $args;
					unset( $_args['type'] );
					if ( $args['control_class'] ) {
						$wp_customize->add_control( new $args['control_class']( $wp_customize, $id, $_args ) );
					} else {
						$wp_customize->add_section( $id, $_args );
					}

					break;
				default:
					$wp_customize->add_setting( $id, $args['setting'] );

					if ( $args['control_class'] ) {
						$wp_customize->add_control( new $args['control_class']( $wp_customize, $id, $args['control'] ) );
					} else {
						$wp_customize->add_control( $id, $args['control'] );
					}
			}

		}

		function add_section( $id, $class_name ) {
			if ( is_object( $class_name ) ) {
				$this->sections[ $id ] = $class_name;
			} else {
				$this->sections[ $id ] = new $class_name();
			}

		}



	}
}
