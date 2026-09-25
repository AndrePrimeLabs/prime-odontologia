<?php
$id             = get_theme_mod( 'onepress_projects_id', 'projects' );
$title          = get_theme_mod( 'onepress_projects_title', __( 'Highlight Projects', 'onepress-plus' ) );
$subtitle       = get_theme_mod( 'onepress_projects_subtitle', __( 'Some of our works', 'onepress-plus' ) );
$is_ajax        = get_theme_mod( 'onepress_project_ajax', 1 );
$desc           = get_theme_mod( 'onepress_projects_desc' );
$project_layout = absint( get_theme_mod( 'onepress_projects_layout', 3 ) );
$project_layout = min( 4, max( 1, $project_layout ) );

?>
<?php if ( ! onepress_is_selective_refresh() ) { ?>
<section <?php if ( $id ) {
	?>id="<?php echo esc_attr( $id ); ?>" <?php } ?> class="<?php echo esc_attr( apply_filters( 'onepress_section_class', 'section-padding section-projects onepage-section', 'projects' ) ); ?>">
<?php } ?>
	<div class="<?php echo esc_attr( apply_filters( 'onepress_section_container_class', 'container', 'projects' ) ); ?>">
		<?php if ( $title || $subtitle || $desc ) { ?>
		<div class="section-title-area">
			<?php
			if ( '' != $subtitle ) {
				echo '<h5 class="section-subtitle">' . esc_html( $subtitle ) . '</h5>';
			}
			if ( '' != $title ) {
				echo '<h2 class="section-title">' . esc_html( $title ) . '</h2>';
			}
			if ( $desc ) {
				echo '<div class="section-desc">' . apply_filters( 'onepress_the_content', wp_kses_post( $desc ) ) . '</div>';
			}
			?>
		</div>
		<?php } ?>
		<div class="project-wrapper project-<?php echo esc_attr( $project_layout ); ?>-column wow slideInUp">
			<?php
			$args = array(
				'post_type' => 'portfolio',
				'post_status' => 'publish',
				'posts_per_page' => get_theme_mod( 'onepress_projects_number', 6 ),
				'order' => get_theme_mod( 'onepress_projects_order', 'DESC' ),
				'orderby' => get_theme_mod( 'onepress_projects_orderby', 'ID' ),
				'suppress_filters' => 0,
			);

			$the_query = new WP_Query( $args );

			$portfolios = $the_query->get_posts();
			global $post;

			if ( ! empty( $portfolios ) ) {
				foreach ( $portfolios as $k => $post ) {
					setup_postdata( $post );
					?>
					<div class="project-item <?php echo ( $is_ajax ) ? 'is-ajax' : 'no-ajax'; ?>" data-id="<?php echo get_the_ID(); ?>" >
						<div class="project-content project-contents " data-id="<?php echo get_the_ID(); ?>">
							<div class="project-thumb project-trigger">
								<?php
								if ( ! $is_ajax ) {
									echo '<a href="' . get_permalink( $post->ID ) . '">';
								}
								if ( has_post_thumbnail() ) {
									the_post_thumbnail( 'onepress-medium' );
								}
								if ( ! $is_ajax ) {
									echo '</a>';
								}
								?>
							</div>
							<div class="project-header project-trigger">
								<h5 class="project-small-title"><?php
								if ( ! $is_ajax ) {
									echo '<a href="' . get_permalink( $post->ID ) . '">';
								}

								the_title();

								if ( ! $is_ajax ) {
									echo '</a>';
								}
								?></h5>
								<div class="project-meta"><?php
									$terms = get_the_terms( $post->ID, 'portfolio_cat' );
								if ( $terms ) {
									$names = wp_list_pluck( $terms, 'name' );
									echo esc_html( join( ' / ', $names ) );
								}
								?></div>
							</div>
						</div>
					</div>
					<?php
				}
			}

			wp_reset_postdata();
			?>
			<div class="clear"></div>
		</div>
		<?php
		$more_url = get_theme_mod( 'onepress_project_url' );
		$more_text = sanitize_text_field( get_theme_mod( 'onepress_project_more_txt', __( 'View All', 'onepress-plus' ) ) );
		if ( $more_url && $more_text ) {
			?>
		<div class="all-news">
			<a class="btn btn-theme-primary-outline" href="<?php echo esc_url( $more_url ); ?>"><?php echo esc_html( $more_text ); ?></a>
		</div>
		<?php } ?>

	</div>
<?php if ( ! onepress_is_selective_refresh() ) { ?>
</section>
<?php } ?>
