<?php
$onepress_map_id   = get_theme_mod( 'onepress_map_id', 'map' );
$onepress_map_type = get_theme_mod( 'onepress_map_type', 'custom' );
if ( ! in_array( $onepress_map_type, array( 'custom', 'embed' ), true ) ) {
	$onepress_map_type = 'custom';
}

$height = get_theme_mod( 'onepress_map_height', 400 );
if ( absint( $height ) <= 0 ) {
	$height = 400;
}

if ( 'embed' === $onepress_map_type ) {
	$embed_html = '';
	if ( function_exists( 'onepress_sanitize_map_embed' ) ) {
		$embed_html = onepress_sanitize_map_embed( (string) get_theme_mod( 'onepress_map_embed', '' ) );
	}
	$api_class = $embed_html ? 'has-map-embed ' : 'no-map-embed ';
	?>
<section <?php if ( $onepress_map_id ) { ?>id="<?php echo esc_attr( $onepress_map_id ); ?>" <?php } ?> <?php do_action( 'onepress_section_atts', 'map' ); ?> class="<?php echo esc_attr( $api_class . apply_filters( 'onepress_section_class', 'section-map  onepage-section', 'map' ) ); ?>">
	<?php do_action( 'onepress_section_before_inner', 'map' ); ?>
	<?php if ( $embed_html ) { ?>
	<div class="onepress-map-embed" style="min-height: <?php echo absint( $height ); ?>px;">
		<?php echo $embed_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized with onepress_sanitize_map_embed ?>
	</div>
	<?php } elseif ( current_user_can( 'customize' ) ) { ?>
		<div class="google-map-notice">
		<?php
		printf(
			/* translators: %s: Customizer link */
			esc_html__( '%1$s Paste your map embed code (Google Maps: Share → Embed a map) in %2$s.', 'onepress-plus' ),
			'<strong>' . esc_html__( 'Admin only notice', 'onepress-plus' ) . '</strong>: ',
			'<a target="_blank" href="' . esc_url( admin_url( 'customize.php?autofocus[panel]=onepress_map&autofocus[section]=onepress_map_settings' ) ) . '">' . esc_html__( 'Customizer → Map embed code', 'onepress-plus' ) . '</a>'
		);
		?>
		</div>
	<?php } ?>
	<?php do_action( 'onepress_section_after_inner', 'map' ); ?>
</section>
	<?php
	return;
}

$map_data                = array();
$map_data['lat']         = floatval( get_theme_mod( 'onepress_map_lat', '37.3317115' ) );
$map_data['long']        = floatval( get_theme_mod( 'onepress_map_long', '-122.0301835' ) );
$map_data['address']     = get_theme_mod( 'onepress_map_address', '<strong>1 Infinite Loop Cupertino <br/> CA 95014  United States</strong>' );
$map_data['html']        = get_theme_mod( 'onepress_map_html', do_shortcode( '<p>Your address description goes here.</p>' ) );
$map_data['color']       = get_theme_mod( 'onepress_map_color', '' );

$map_data['maker']       = get_theme_mod( 'onepress_map_maker', ONEPRESS_PLUS_URL . 'build/images/map-marker.png' );
$maker_id = attachment_url_to_postid( $map_data['maker'] );
if ( $maker_id ) {
	$meta_data = wp_get_attachment_metadata( OnePress_Plus::get_media_id( $maker_id ), true );
	if ( $meta_data ) {
		$map_data['maker_w'] = $meta_data['width'];
		$map_data['maker_h'] = $meta_data['height'];
	}
} else {
	$map_data['maker_w'] = 64;
	$map_data['maker_h'] = 64;
}

$map_data['zoom']        = floatval( get_theme_mod( 'onepress_map_zoom', 10 ) );
$map_data['scrollwheel'] = intval( get_theme_mod( 'onepress_map_scrollwheel' ) ) == 1 ? true : false;
$map_data['map_info_default_open'] = intval( get_theme_mod( 'onepress_map_info_default_open' ) ) == 1 ? true : false;
$map_data['items_address'] = array();
$address = get_theme_mod( 'onepress_map_items_address' );
if ( is_string( $address ) ) {
	$map_data['items_address'] = json_decode( $address, true );
}
if ( ! is_array( $address ) ) {
	$address = array();
}

foreach ( $address as $k => $a ) {
	$map_data['items_address'][ $k ]['maker']   = OnePress_Plus::get_media_url( $a['maker'] );
	$map_data['items_address'][ $k ]['lat']     = floatval( $a['lat'] );
	$map_data['items_address'][ $k ]['long']    = floatval( $a['long'] );
	$map_data['items_address'][ $k ]['address'] = $a['address'];
	$map_data['items_address'][ $k ]['desc']    = $a['desc'];

	$meta_data = wp_get_attachment_metadata( OnePress_Plus::get_media_id( $a['maker'] ), true );
	if ( $meta_data ) {
		$map_data['items_address'][ $k ]['w'] = $meta_data['width'];
		$map_data['items_address'][ $k ]['h'] = $meta_data['height'];
	}
}

$has_api = get_theme_mod( 'onepress_map_api_key' );
?>
<section <?php if ( $onepress_map_id ) { ?>id="<?php echo esc_attr( $onepress_map_id ); ?>" <?php } ?> <?php do_action( 'onepress_section_atts', 'map' ); ?>  class="<?php echo ( $has_api ) ? 'has-map-api ' : 'no-map-api '; echo esc_attr( apply_filters( 'onepress_section_class', 'section-map  onepage-section', 'map' ) ); ?>">
	<?php do_action( 'onepress_section_before_inner', 'map' ); ?>
	<?php if ( current_user_can( 'customize' ) && ! $has_api ) { ?>
		<div class="google-map-notice">
		<?php
		printf( esc_html__( '%1$s In order to show the Google Maps section, you must enter a validate Google Maps API key, follow %2$s to create your key and then put it %3$s.' ),
			'<strong>' . esc_html__( 'Admin only notice' ) . '</strong>: ',
			'<a target="_blank" href="https://developers.google.com/maps/documentation/javascript/get-api-key">' . esc_html__( 'these steps', 'onepress-plus' ) . '</a>',
			'<a target="_blank" href="' . esc_attr( admin_url( 'customize.php?autofocus[panel]=onepress_map&autofocus[section]=onepress_map_settings' ) ) . '">' . esc_html__( 'here', 'onepress-plus' ) . '</a>'
		);
		?>
		</div>
	<?php } ?>
	<div class="onepress-map" data-map="<?php echo esc_attr( wp_json_encode( $map_data ) ); ?>" style="height: <?php echo absint( $height ); ?>px;"></div>
	<?php do_action( 'onepress_section_after_inner', 'map' ); ?>
</section>
