<?php
$id       = get_theme_mod( 'onepress_clients_id', 'clients' );
$title    = get_theme_mod( 'onepress_clients_title' );
$subtitle = get_theme_mod( 'onepress_clients_subtitle', __( 'Have been featured on', 'onepress-plus' ) );
$desc     = get_theme_mod( 'onepress_clients_desc' );
$target   = get_theme_mod( 'onepress_clients_target' );
$show_name   = get_theme_mod( 'onepress_clients_show_name' );
$columns  = get_theme_mod( 'onepress_clients_layout', 5 );
$clients  = get_theme_mod( 'onepress_clients' );
$carousel = get_theme_mod( 'onepress_clients_carousel' );

?>
<?php if ( ! onepress_is_selective_refresh() ) { ?>
<section <?php if ( $id ) {
	?>id="<?php echo esc_attr( $id ); ?>" <?php } ?>class="<?php echo esc_attr( apply_filters( 'onepress_section_class', 'section-padding section-clients onepage-section', 'clients' ) ); ?>">
<?php } ?>
	<div class="<?php echo esc_attr( apply_filters( 'onepress_section_container_class', 'container', 'clients' ) ); ?>">
		<?php
		if ( $title || $subtitle || $desc ) {
			?>
			<div class="section-title-area">
				<?php
				if ( '' != $subtitle ) {
					echo '<h5 class="section-subtitle">' . esc_html( $subtitle ) . '</h5>';}
				if ( '' != $title ) {
					echo '<h2 class="section-title">' . esc_html( $title ) . '</h2>';}
				if ( $desc ) {
					echo '<div class="section-desc">' . apply_filters( 'onepress_the_content', wp_kses_post( $desc ) ) . '</div>';
				}
				?>
			</div>
			<?php
		}

		if ( is_string( $clients ) ) {
			$clients = json_decode( $clients, true );
		}

		if ( 1 == $target ) {
			$target = ' target="_blank" ';
		} else {
			$target  = '';
		}

		if ( empty( $clients ) ) {
			$clients = array(
				array(
					'title' => esc_html__( 'Hostingco', 'onepress-plus' ),
					'image'  => array(
						'id' => '',
						'url' => ONEPRESS_PLUS_URL . 'build/images/client_logo_1.png',
					),
					'link' => '',
				),
				array(
					'title' => esc_html__( 'Religion', 'onepress-plus' ),
					'image'  => array(
						'id' => '',
						'url' => ONEPRESS_PLUS_URL . 'build/images/client_logo_2.png',
					),
					'link' => '',
				),
				array(
					'title' => esc_html__( 'Viento', 'onepress-plus' ),
					'image'  => array(
						'id' => '',
						'url' => ONEPRESS_PLUS_URL . 'build/images/client_logo_3.png',
					),
					'link' => '',
				),
				array(
					'title' => esc_html__( 'Naturefirst', 'onepress-plus' ),
					'image'  => array(
						'id' => '',
						'url' => ONEPRESS_PLUS_URL . 'build/images/client_logo_4.png',
					),
					'link' => '',
				),
				array(
					'title' => esc_html__( 'Imagine', 'onepress-plus' ),
					'image'  => array(
						'id' => '',
						'url' => ONEPRESS_PLUS_URL . 'build/images/client_logo_5.png',
					),
					'link' => '',
				),
			);
		}
		if ( $clients ) {
			if ( ! $carousel ) {
				?>
			<div class="clients-wrapper slideInUp client-<?php echo esc_attr( $columns ); ?>-cols">
					<?php
					$j = 0;
					foreach ( $clients as $client ) {
						$client = wp_parse_args( $client, array(
							'title' => '',
							'link' => false,
						) );
						$url = OnePress_Plus::get_media_url( $client['image'] );
						$classes = '';
						if ( $url ) {
							if ( $j >= $columns ) {
								$j = 1;
								$classes .= ' clearleft';
							} else {
								$j++;
							}

							$image_alt = get_post_meta( $client['image']['id'], '_wp_attachment_image_alt', true );

							?>
							<div class="client-col<?php echo esc_attr( $classes ); ?>">
								<?php if ( isset( $client['link'] ) && $client['link'] != '' ) { ?>
									<?php echo '<a href="' . esc_url( $client['link'] ) . '"' . $target . '>'; ?>
								<?php } ?>
								<img src="<?php echo esc_url( $url ); ?>" alt="<?php echo $image_alt; ?>">
								<?php
								if ( $show_name && $client['title'] ) {
									?>
									<span class="client-name"><?php echo esc_html( $client['title'] ); ?></span>
									<?php
								}
								?>
								
								<?php if ( isset( $client['link'] ) && $client['link'] != '' ) { ?>
									<?php echo '</a>'; ?>
								<?php } ?>
							</div>
							<?php
						}
					}
					?>
			</div>
				<?php
			} else {

				$carousel_settings = array();
				$carousel_settings['dots'] = get_theme_mod( 'onepress_clients_carousel_dots', 1 ) ? true : false;
				$carousel_settings['nav'] = get_theme_mod( 'onepress_clients_carousel_nav', 1 ) ? true : false;
				$carousel_settings['devices'] = array(
					'desktop' => absint( get_theme_mod( 'onepress_clients_carousel_desktop', 5 ) ),
					'tablet' => absint( get_theme_mod( 'onepress_clients_carousel_tablet', 4 ) ),
					'mobile' => absint( get_theme_mod( 'onepress_clients_carousel_mobile', 2 ) ),
				);

				foreach ( $carousel_settings['devices'] as $k => $v ) {
					if ( 0 == $v ) {
						$carousel_settings['devices'][ $k ] = 1;
					}
				}

				?>
				<div class="clients-carousel opp-carousel owl-carousel owl-theme" data-settings="<?php echo esc_attr( wp_json_encode( $carousel_settings ) ); ?>">
						<?php
						$j = 0;
						foreach ( $clients as $client ) {
							$url = OnePress_Plus::get_media_url( $client['image'] );
							$classes = '';
							if ( $url ) {
								if ( $j >= $columns ) {
									$j = 1;
									$classes .= ' clearleft';
								} else {
									$j++;
								}

								$image_alt = get_post_meta( $client['image']['id'], '_wp_attachment_image_alt', true );

								?>
							<div class="client-item <?php echo esc_attr( $classes ); ?>">
								<?php
								if ( isset( $client['link'] ) && '' != $client['link'] ) {
									echo '<a href="' . esc_url( $client['link'] ) . '"' . $target . '>';
								}
								?>
								<img src="<?php echo esc_url( $url ); ?>" alt="<?php echo $image_alt; ?>">
								<?php
								if ( isset( $client['link'] ) && '' != $client['link'] ) {
									echo '</a>';
								}
								?>
							</div>
								<?php
							}
						}
						?>
				</div>
				<?php

			}
		}

		?>

	</div>
<?php if ( ! onepress_is_selective_refresh() ) { ?>
</section>
<?php } ?>
