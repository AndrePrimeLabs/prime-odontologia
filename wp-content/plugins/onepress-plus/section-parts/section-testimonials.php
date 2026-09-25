<?php
$onepress_testimonial_id       = get_theme_mod( 'onepress_testimonial_id', 'testimonials' );
$onepress_testimonials_disable = get_theme_mod( 'onepress_testimonials_disable' ) == 1 ? true : false;
$onepress_testimonial_title    = get_theme_mod( 'onepress_testimonial_title', esc_html__( 'Testimonials', 'onepress-plus' ) );
$onepress_testimonial_subtitle = get_theme_mod( 'onepress_testimonial_subtitle', esc_html__( 'Section subtitle', 'onepress-plus' ) );
$desc                          = get_theme_mod( 'onepress_testimonial_desc' );
$onepress_testimonial_layout   = get_theme_mod( 'onepress_testimonial_layout', '3' );
?>
<?php if ( ! $onepress_testimonials_disable ) : ?>
	<?php if ( ! onepress_is_selective_refresh() ) { ?>
	<section id="<?php echo ( '' !== $onepress_testimonial_id ) ? esc_attr( trim( $onepress_testimonial_id ) ) : ''; ?>" <?php do_action( 'onepress_section_atts', 'testimonials' ); ?> class="<?php echo esc_attr( apply_filters( 'onepress_section_class', 'section-testimonials onepage-section section-meta section-padding section-padding-lg', 'testimonials' ) ); ?>">
<?php } ?>
		<?php do_action( 'onepress_section_before_inner', 'testimonials' ); ?>
		<div class="<?php echo esc_attr( apply_filters( 'onepress_section_container_class', 'container', 'testimonials' ) ); ?>">
			<?php if ( $onepress_testimonial_title || $onepress_testimonial_subtitle || $desc ) { ?>
				<div class="section-title-area">
					<?php
					if ( $onepress_testimonial_subtitle != '' ) {
						echo '<h5 class="section-subtitle">' . esc_html( $onepress_testimonial_subtitle ) . '</h5>';}
					?>
					<?php
					if ( $onepress_testimonial_title != '' ) {
						echo '<h2 class="section-title">' . esc_html( $onepress_testimonial_title ) . '</h2>';}
					?>
					<?php
					if ( $desc ) {
						echo '<div class="section-desc">' . apply_filters( 'onepress_the_content', wp_kses_post( $desc ) ) . '</div>';
					}
					?>
				</div>
				<?php
			}
			$testimonials = get_theme_mod( 'onepress_testimonial_boxes', '' );

			if ( is_string( $testimonials ) ) {
				$testimonials = json_decode( $testimonials, true );
			}

			if ( ! is_array( $testimonials ) || empty( $testimonials ) ) {
				$testimonials = array(
					array(
						'title'    => esc_html__( 'Praesent placerat', 'onepress-plus' ),
						'name'     => esc_html__( 'Alexander Rios', 'onepress-plus' ),
						'subtitle' => esc_html__( 'Founder & CEO', 'onepress-plus' ),
						'style'    => 'warning',
						'image'    => array(
							'url' => get_template_directory_uri() . '/assets/images/testimonial_1.jpg',
							'id'  => '',
						),
						'content'  => esc_html__( 'Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat.', 'onepress-plus' ),

					),
					array(
						'title'    => esc_html__( 'Cras iaculis', 'onepress-plus' ),
						'name'     => esc_html__( 'Alexander Max', 'onepress-plus' ),
						'subtitle' => esc_html__( 'Founder & CEO', 'onepress-plus' ),
						'style'    => 'success',
						'image'    => array(
							'url' => get_template_directory_uri() . '/assets/images/testimonial_2.jpg',
							'id'  => '',
						),
						'content'  => esc_html__( 'Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue eu vulputate.', 'onepress-plus' ),

					),
					array(
						'title'    => esc_html__( 'Fusce lobortis', 'onepress-plus' ),
						'name'     => esc_html__( 'Peter Mendez', 'onepress-plus' ),
						'subtitle' => esc_html__( 'Example Company', 'onepress-plus' ),
						'style'    => 'theme-primary',
						'image'    => array(
							'url' => get_template_directory_uri() . '/assets/images/testimonial_3.jpg',
							'id'  => '',
						),
						'content'  => esc_html__( 'Sed adipiscing ornare risus. Morbi est est, blandit sit amet, sagittis vel, euismod vel, velit. Pellentesque egestas sem. Suspendisse commodo ullamcorper magna egestas sem.', 'onepress-plus' ),

					),
				);
			}

			$rows = array();
			switch ( $onepress_testimonial_layout ) {
				case '1':
					$col = 1;
					break;
				case '2':
					$col = 2;
					break;
				case '3':
					$col = 3;
					break;
				case '4':
					$col = 4;
					break;
				default:
					$col = 3;
					break;
			}

			?>
			<div class="card-deck-wrapper">
				<?php
				$row_index = 0;
				foreach ( $testimonials as $testimonial ) {
					if ( ! isset( $rows[ $row_index ] ) ) {
						$rows[ $row_index ] = array();
					}

					if ( count( $rows[ $row_index ] ) >= $col ) {
						$row_index ++;
						$rows[ $row_index ] = array();
					}

					// echo '<div class="card-deck">';

					$testimonial = wp_parse_args(
						$testimonial,
						array(
							'title'        => '',
							'name'         => '',
							'subtitle'     => '',
							'style'        => 'theme-primary',
							'custom_color' => '',
							'image'        => array(
								'url' => '',
								'id'  => '',
							),
							'content'      => '',
						)
					);

					$testimonial['image'] = wp_parse_args(
						$testimonial['image'],
						array(
							'url' => '',
							'id'  => '',
						)
					);
					$image                = '';
					if ( $testimonial['image']['id'] != '' ) {
						$image = wp_get_attachment_url( $testimonial['image']['id'] );
					}
					if ( $image == '' && $testimonial['image']['url'] != '' ) {
						$image = $testimonial['image']['url'];
					}

					$classes = array( 'card' );
					if ( 'light' != $testimonial['style'] ) {
						$classes[] = 'card-inverse';
					}
					$classes[] = 'card-' . $testimonial['style'];
					$style     = '';
					if ( $testimonial['style'] == 'custom' ) {
						$c = function_exists( 'onepress_sanitize_color_alpha' )
							? onepress_sanitize_color_alpha( $testimonial['custom_color'] )
							: sanitize_hex_color( $testimonial['custom_color'] );
						if ( '' !== $c ) {
							$style = ' style="background-color: ' . esc_attr( $c ) . '; border-color: ' . esc_attr( $c ) . ';" ';
						}
					}

					$t  = '';
					$t .= '<div class="' . esc_attr( join( ' ', $classes ) ) . '"' . $style . '>';
					$t .= '<div class="card-block">';
					$t .= '<div class="tes_author">';

					if ( $image != '' ) {
						$t .= '<img src="' . esc_url( $image ) . '" alt="" />';
					}
					if ( $image != '' ) {
						$t .= '<cite class="tes__name">' . esc_html( $testimonial['name'] ) . '<span>' . wp_kses_post( $testimonial['subtitle'] ) . '</span></cite>';
					}

					$t .= ' </div>';

					$t .= '<h4 class="card-title">' . esc_html( $testimonial['title'] ) . '</h4>';
					$t .= '<p class="card-text">' . apply_filters( 'onepress_the_content', wp_kses_post( $testimonial['content'] ) ) . '</p>';

					$t .= ' </div>';
					$t .= ' </div>';

					$rows[ $row_index ][] = $t;

				}

				foreach ( $rows as $r ) {
					echo '<div class="card-deck wow slideInUp">';
					echo join( "\n\t", $r );
					echo '</div>';
				}

				?>
			</div>
		</div>
		<?php do_action( 'onepress_section_after_inner', 'testimonials' ); ?>
	<?php if ( ! onepress_is_selective_refresh() ) { ?>
	</section>
	<?php } ?>
<?php endif; ?>
