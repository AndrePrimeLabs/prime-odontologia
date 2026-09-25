<?php
add_action( 'init', 'onepress_plus_portfolio_init' );
/**
 * Register a portfolio post type.
 *
 * @link http://codex.wordpress.org/Function_Reference/register_post_type
 */
function onepress_plus_portfolio_init() {

	$slug  = get_theme_mod( 'onepress_project_slug', 'portfolio' );
	if ( ! $slug ) {
		$slug = 'portfolio';
	}

	$labels = array(
		'name'               => _x( 'Portfolios', 'post type general name', 'onepress-plus' ),
		'singular_name'      => _x( 'Portfolio', 'post type singular name', 'onepress-plus' ),
		'menu_name'          => _x( 'Portfolios', 'admin menu', 'onepress-plus' ),
		'name_admin_bar'     => _x( 'Portfolio', 'add new on admin bar', 'onepress-plus' ),
		'add_new'            => _x( 'Add New', 'portfolio', 'onepress-plus' ),
		'add_new_item'       => __( 'Add New Portfolio', 'onepress-plus' ),
		'new_item'           => __( 'New Portfolio', 'onepress-plus' ),
		'edit_item'          => __( 'Edit Portfolio', 'onepress-plus' ),
		'view_item'          => __( 'View Portfolio', 'onepress-plus' ),
		'all_items'          => __( 'All Portfolios', 'onepress-plus' ),
		'search_items'       => __( 'Search Portfolios', 'onepress-plus' ),
		'parent_item_colon'  => __( 'Parent Portfolios:', 'onepress-plus' ),
		'not_found'          => __( 'No portfolios found.', 'onepress-plus' ),
		'not_found_in_trash' => __( 'No portfolios found in Trash.', 'onepress-plus' ),
	);

	$args = array(
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => true,
		'rewrite'            => array( 'slug' => $slug ),
		'capability_type'    => 'post',
		'has_archive'        => false,
		'hierarchical'       => false,
		'menu_position'      => null,
        'supports'           => array( 'title', 'editor', 'thumbnail' ),
        'show_in_rest'       => true,
	);

	register_post_type( 'portfolio', $args );

	// Portfolio category
	$labels = array(
		'name'                       => _x( 'Categories', 'taxonomy general name', 'onepress-plus' ),
		'singular_name'              => _x( 'Category', 'taxonomy singular name', 'onepress-plus' ),
		'search_items'               => __( 'Search Categories', 'onepress-plus' ),
		'popular_items'              => __( 'Popular Categories', 'onepress-plus' ),
		'all_items'                  => __( 'All Categories', 'onepress-plus' ),
		'parent_item'                => null,
		'parent_item_colon'          => null,
		'edit_item'                  => __( 'Edit Category', 'onepress-plus' ),
		'update_item'                => __( 'Update Category', 'onepress-plus' ),
		'add_new_item'               => __( 'Add New Category', 'onepress-plus' ),
		'new_item_name'              => __( 'New Category Name', 'onepress-plus' ),
		'separate_items_with_commas' => __( 'Separate categories with commas', 'onepress-plus' ),
		'add_or_remove_items'        => __( 'Add or remove categories', 'onepress-plus' ),
		'choose_from_most_used'      => __( 'Choose from the most used categories', 'onepress-plus' ),
		'not_found'                  => __( 'No categories found.', 'onepress-plus' ),
		'menu_name'                  => __( 'Categories', 'onepress-plus' ),
	);

	$args = array(
		'hierarchical'          => false,
		'labels'                => $labels,
		'show_ui'               => true,
		'show_admin_column'     => true,
		'update_count_callback' => '_update_post_term_count',
		'query_var'             => false,
		'rewrite'               => array( 'slug' => 'portfolio_cat' ),
	);

	register_taxonomy( 'portfolio_cat', 'portfolio', $args );

}


