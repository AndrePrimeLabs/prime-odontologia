<?php

if ( is_string( $slides ) ) {
	$slides = json_decode( $slides, true );
}

$slider_settings = compact( 'loop', 'autoplay', 'autoplayHoverPause', 'dots', 'nav', 'autoHeight', 'mouseDrag', 'touchDrag', 'rewind', 'parallax' );
foreach ( $slider_settings as $k => $v ) {
	$slider_settings[ $k ] = $v ? true : false;
}

$slider_settings['animateOut'] = $animateOut ? $animateOut : false;
$slider_settings['animateIn'] = $animateIn ? $animateIn : false;
$slider_settings['autoplayTimeout'] = $autoplayTimeout ? absint( $autoplayTimeout ) : 5000;
$slider_settings['autoplaySpeed'] = $autoplaySpeed ? absint( $autoplaySpeed ) : 500;
if ( is_rtl() ) {
	$slider_settings['rtl'] = true;
}

$classes = 'section-op-slider owl-carousel owl-theme';
$wrapper_class = 'section-op-slider-wrapper section-op-slider-parallax';
if ( $fullscreen ) {
	$classes .= ' fullscreen';
	$wrapper_class .= ' fullscreen';
}

if ( $nav_show_on_hover ) {
	$classes .= ' nav_show_on_hover';
}

if ( $dots_show_on_hover ) {
	$classes .= ' dots_show_on_hover';
}

?>
<section <?php if ( $id ) {
	?>id="<?php echo esc_attr( $id ); ?>" <?php } ?> class="<?php echo esc_attr( apply_filters( 'onepress_section_class', join( ' ', $section->get_section_classes() ), $section->id ) ); ?>">
	<div class="<?php echo esc_attr( $wrapper_class ); ?>">
		<div class="<?php echo esc_attr( $classes ); ?>" data-settings="<?php echo esc_attr( json_encode( $slider_settings ) ); ?>">
			<?php foreach ( (array) $slides as $index => $slide ) {

				$slide = wp_parse_args(
					$slide,
					array(
						'media' => array(),
						'title' => '',
						'content' => '',
						'alignment' => 'center',

						'btn_1_label' => '',
						'btn_1_link' => '',
						'btn_1_button' => '',

						'btn_2_label' => '',
						'btn_2_link' => '',
						'btn_2_button' => '',

					)
				);

				$image = onepress_get_media_url( $slide['media'] );

				$button_1 = '';
				$button_2 = '';
				if ( $slide['btn_1_label'] ) {
					$button_1 = ' <a href="' . esc_url( $slide['btn_1_link'] ) . '" class="btn ' . esc_attr( $slide['btn_1_button'] ) . ' btn-lg">' . wp_kses_post( $slide['btn_1_label'] ) . '</a>';
				}

				if ( $slide['btn_2_label'] ) {
					$button_2 = ' <a href="' . esc_url( $slide['btn_2_link'] ) . '" class="btn ' . esc_attr( $slide['btn_2_button'] ) . ' btn-lg">' . wp_kses_post( $slide['btn_2_label'] ) . '</a>';
				}

				?>
			<div class="item">
				<?php if ( $image ) { ?>
				<img src="<?php echo esc_url( $image ); ?>" alt="">
				<?php } ?>
				<div class="item--content container text-<?php echo esc_attr( $slide['alignment'] ); ?>">

						<?php if ( $slide['title'] ) { ?>
							<h2 class="item--title"><?php echo wp_kses_post( $slide['title'] ); ?></h2>
						<?php } ?>
						<?php if ( $slide['content'] ) { ?>
							<div class="item--desc"><?php echo apply_filters( 'onepress_the_content', $slide['content'] ); ?></div>
						<?php } ?>
						<?php if ( $button_1 || $button_2 ) { ?>
							<div class="item-actions">
								<?php echo $button_1 . $button_2; ?>
							</div>
						<?php } ?>

				</div>
			</div>
			<?php } ?>

		</div>
	</div>
</section>
