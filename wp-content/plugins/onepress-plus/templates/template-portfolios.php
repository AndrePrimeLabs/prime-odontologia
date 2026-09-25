<?php
/**
 * Template Name: Projects page
 *
 * @package OnePress
 */

get_header();

$layout         = 'no-sidebar';
$project_layout = absint( apply_filters( 'onepress_plus_projects_layout_columns', 3 ) );
$project_layout = min( 4, max( 1, $project_layout ) );
$number_to_show = apply_filters( 'onepress_plus_projects_number', get_theme_mod( 'onepress_template_portfolios_number', 15 ) );
$is_ajax        = get_theme_mod( 'onepress_project_ajax', 1 );
$fix_paging     = apply_filters( 'onepress_plus_projects_fix_paging', false );
$page_link      = get_permalink();

/**
 * @since 2.0.0
 * @see onepress_display_page_title
 */
do_action( 'onepress_page_before_content' );

?>

	<div id="content" class="site-content">
		<?php onepress_breadcrumb(); ?>
		<div id="content-inside" class="container <?php echo esc_attr( $layout ); ?>">
			<div id="primary" class="content-area">
				<main id="main" class="site-main" role="main">

					<div class="section-padding">
						<div class="project-wrapper project-<?php echo esc_attr( $project_layout ); ?>-column">
							<?php
							global $wp_query;
							$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;
							if ( isset( $_GET['page_num'] ) ) {
								$paged = absint( $_GET['page_num'] );
							}

							if ( ! is_tax( 'portfolio_cat' ) ) {
								$args = array(
									'post_type' => 'portfolio',
									'post_status' => 'publish',
									'paged' => $paged,
									'posts_per_page' => $number_to_show,
									'order' => get_theme_mod( 'onepress_projects_order', 'DESC' ),
									'orderby' => get_theme_mod( 'onepress_projects_orderby', 'ID' ),
									'suppress_filters' => 0,
								);
								$wp_query = new WP_Query( $args );
							}

							$portfolios = $wp_query->get_posts();
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

							?>
							<div class="clear"></div>
						</div>
					</div>

					<?php

					if ( ! $fix_paging ) {
						the_posts_navigation(
							array(
								'prev_text'          => __( 'Older projects', 'onepress-plus' ),
								'next_text'          => __( 'Newer projects', 'onepress-plus' ),
								'screen_reader_text' => __( 'Projects navigation', 'onepress-plus' ),
							)
						);
					} else {
						$paging = paginate_links(
							array(
								'base' => $page_link . '%_%',
								'format' => '?page_num=%#%',
								'prev_text'          => __( 'Previous', 'onepress-plus' ),
								'next_text'          => __( 'Next', 'onepress-plus' ),
								'current' => max( 1, $paged ),
								'total' => $wp_query->max_num_pages,
							)
						);

						if ( $paging ) {
							?>
							<nav class="navigation pagination" role="navigation">
								<div class="nav-links">
									<?php echo $paging; // WPCS: XSS ok. ?>
								</div>
							</nav>
							<?php
						}
					}

					wp_reset_postdata();
					?>

				</main>
			</div>

		</div>
	</div>

<?php get_footer(); ?>
