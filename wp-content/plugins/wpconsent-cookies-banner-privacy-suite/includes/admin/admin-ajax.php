<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'wp_ajax_wpconsent_add_category', 'wpconsent_ajax_add_category' );
add_action( 'wp_ajax_wpconsent_edit_category', 'wpconsent_ajax_edit_category' );
add_action( 'wp_ajax_wpconsent_delete_category', 'wpconsent_ajax_delete_category' );

add_action( 'wp_ajax_wpconsent_manage_service', 'wpconsent_ajax_manage_service' );
add_action( 'wp_ajax_wpconsent_delete_service', 'wpconsent_ajax_delete_service' );
add_action( 'wp_ajax_wpconsent_get_services', 'wpconsent_ajax_get_services' );

add_action( 'wp_ajax_wpconsent_manage_cookie', 'wpconsent_ajax_manage_cookie' );
add_action( 'wp_ajax_wpconsent_delete_cookie', 'wpconsent_ajax_delete_cookie' );

add_action( 'wp_ajax_wpconsent_search_pages', 'wpconsent_ajax_search_pages' );

add_action( 'wp_ajax_wpconsent_auto_configure', 'wpconsent_ajax_auto_configure' );

add_action( 'wp_ajax_wpconsent_save_banner_layout', 'wpconsent_ajax_save_banner_layout' );

add_action( 'wp_ajax_wpconsent_complete_onboarding', 'wpconsent_ajax_complete_onboarding' );

add_action( 'wp_ajax_wpconsent_generate_cookie_policy', 'wpconsent_ajax_generate_cookie_policy' );

add_action( 'wp_ajax_wpconsent_search_content', 'wpconsent_ajax_search_content' );
add_action( 'wp_ajax_wpconsent_save_scanner_items', 'wpconsent_ajax_save_scanner_items' );

add_action( 'wp_ajax_wpconsent_reset_to_defaults', 'wpconsent_ajax_reset_to_defaults' );

add_action( 'wp_ajax_wpconsent_save_usage_tracking', 'wpconsent_ajax_save_usage_tracking' );

add_action( 'wp_ajax_wpconsent_verify_ssl', 'wpconsent_ajax_verify_ssl' );

/**
 * Add a new category via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_add_category() {
	check_admin_referer( 'wpconsent_add_category', 'wpconsent_add_category_nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$category_name        = isset( $_POST['category_name'] ) ? sanitize_text_field( wp_unslash( $_POST['category_name'] ) ) : '';
	$category_description = isset( $_POST['category_description'] ) ? sanitize_textarea_field( wp_unslash( $_POST['category_description'] ) ) : '';

	$category_id = wpconsent()->cookies->add_category( $category_name, $category_description );

	if ( $category_id ) {
		wp_send_json_success( array(
			'id'          => $category_id,
			'name'        => $category_name,
			'description' => $category_description,
		) );
	} else {
		wp_send_json_error( array(
			'message' => esc_html__( 'There was an error adding the category.', 'wpconsent-cookies-banner-privacy-suite' ),
		) );
	}
}

/**
 * Edit a category via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_edit_category() {
	check_admin_referer( 'wpconsent_add_category', 'wpconsent_add_category_nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$category_id          = isset( $_POST['category_id'] ) ? intval( $_POST['category_id'] ) : 0;
	$category_name        = isset( $_POST['category_name'] ) ? sanitize_text_field( wp_unslash( $_POST['category_name'] ) ) : '';
	$category_description = isset( $_POST['category_description'] ) ? sanitize_textarea_field( wp_unslash( $_POST['category_description'] ) ) : '';

	// Error if category ID is not set.
	if ( empty( $category_id ) ) {
		wp_send_json_error( array(
			'message' => esc_html__( 'Category ID is required.', 'wpconsent-cookies-banner-privacy-suite' ),
		) );
	}

	$updated = wpconsent()->cookies->update_category( $category_id, $category_name, $category_description );

	if ( $updated ) {
		wp_send_json_success( array(
			'id'          => $category_id,
			'name'        => $category_name,
			'description' => $category_description,
		) );
	} else {
		wp_send_json_error( array( 'message' => esc_html__( 'There was an error updating the category.', 'wpconsent-cookies-banner-privacy-suite' ) ) );
	}
}

/**
 * Delete a category via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_delete_category() {
	check_ajax_referer( 'wpconsent_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$category_id = isset( $_POST['category_id'] ) ? intval( $_POST['category_id'] ) : 0;

	// Error if category ID is not set.
	if ( empty( $category_id ) ) {
		wp_send_json_error( array(
			'message' => esc_html__( 'Category ID is required.', 'wpconsent-cookies-banner-privacy-suite' ),
		) );
	}

	$deleted = wpconsent()->cookies->delete_category( $category_id );

	if ( $deleted ) {
		wp_send_json_success();
	} else {
		wp_send_json_error( array(
			'message' => esc_html__( 'There was an error deleting the category.', 'wpconsent-cookies-banner-privacy-suite' ),
		) );
	}
}

/**
 * Add or edit a service via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_manage_service() {
	check_admin_referer( 'wpconsent_manage_service', 'wpconsent_manage_service_nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	// Get and sanitize all input fields.
	$post_id             = isset( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : 0;
	$service_name        = isset( $_POST['service_name'] ) ? sanitize_text_field( wp_unslash( $_POST['service_name'] ) ) : '';
	$service_description = isset( $_POST['service_description'] ) ? sanitize_textarea_field( wp_unslash( $_POST['service_description'] ) ) : '';
	$service_category    = isset( $_POST['service_category'] ) ? intval( $_POST['service_category'] ) : 0;
	$service_url         = isset( $_POST['service_url'] ) ? sanitize_text_field( wp_unslash( $_POST['service_url'] ) ) : '';

	// Validate required fields.
	if ( empty( $service_name ) || empty( $service_category ) ) {
		wp_send_json_error( array(
			'message' => esc_html__( 'Service name and category are required.', 'wpconsent-cookies-banner-privacy-suite' ),
		) );
	}

	$service_url = esc_url( $service_url );

	if ( $post_id ) {
		// Update existing service.
		$post_id         = wpconsent()->cookies->update_service( $post_id, $service_name, $service_description, $service_url, $service_category );
		$success_message = esc_html__( 'Service updated successfully.', 'wpconsent-cookies-banner-privacy-suite' );
		$error_message   = esc_html__( 'Failed to update service.', 'wpconsent-cookies-banner-privacy-suite' );
	} else {
		// Add new service.
		$result          = wpconsent()->cookies->add_service( $service_name, $service_category, $service_description, $service_url );
		$post_id         = $result;
		$success_message = esc_html__( 'Service added successfully.', 'wpconsent-cookies-banner-privacy-suite' );
		$error_message   = esc_html__( 'Failed to add Service.', 'wpconsent-cookies-banner-privacy-suite' );
	}

	if ( $post_id ) {
		wp_send_json_success( array(
			'id'          => $post_id,
			'name'        => $service_name,
			'description' => $service_description,
			'category_id' => $service_category,
			'message'     => $success_message,
			'service_url' => $service_url,
		) );
	} else {
		wp_send_json_error( array(
			'message' => $error_message,
		) );
	}
}

/**
 * Add or edit a cookie via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_manage_cookie() {
	check_admin_referer( 'wpconsent_manage_cookie', 'wpconsent_manage_cookie_nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	// Get and sanitize all input fields
	$post_id            = isset( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : 0;
	$cookie_id          = isset( $_POST['cookie_id'] ) ? sanitize_text_field( wp_unslash( $_POST['cookie_id'] ) ) : 0;
	$cookie_name        = isset( $_POST['cookie_name'] ) ? sanitize_text_field( wp_unslash( $_POST['cookie_name'] ) ) : '';
	$cookie_description = isset( $_POST['cookie_description'] ) ? sanitize_textarea_field( wp_unslash( $_POST['cookie_description'] ) ) : '';
	$cookie_category    = isset( $_POST['cookie_category'] ) ? intval( $_POST['cookie_category'] ) : 0;
	$cookie_duration    = isset( $_POST['cookie_duration'] ) ? sanitize_text_field( wp_unslash( $_POST['cookie_duration'] ) ) : 0;
	$cookie_service     = isset( $_POST['cookie_service'] ) ? intval( $_POST['cookie_service'] ) : '';

	// Validate required fields
	if ( empty( $cookie_name ) || empty( $cookie_category ) ) {
		wp_send_json_error( array(
			'message' => esc_html__( 'Cookie name and category are required.', 'wpconsent-cookies-banner-privacy-suite' ),
		) );
	}
	if ( 0 !== $cookie_service ) {
		$cookie_category = $cookie_service;
	}

	if ( $post_id ) {
		// Update existing cookie
		$post_id         = wpconsent()->cookies->update_cookie( $post_id, $cookie_id, $cookie_name, $cookie_description, $cookie_category, $cookie_duration );
		$success_message = esc_html__( 'Cookie updated successfully.', 'wpconsent-cookies-banner-privacy-suite' );
		$error_message   = esc_html__( 'Failed to update cookie.', 'wpconsent-cookies-banner-privacy-suite' );
	} else {
		// Add new cookie
		$result          = wpconsent()->cookies->add_cookie( $cookie_id, $cookie_name, $cookie_description, $cookie_category, $cookie_duration );
		$post_id         = $result;
		$success_message = esc_html__( 'Cookie added successfully.', 'wpconsent-cookies-banner-privacy-suite' );
		$error_message   = esc_html__( 'Failed to add cookie.', 'wpconsent-cookies-banner-privacy-suite' );
	}

	if ( $post_id ) {
		wp_send_json_success( array(
			'id'          => $post_id,
			'name'        => $cookie_name,
			'description' => $cookie_description,
			'category_id' => $cookie_category,
			'message'     => $success_message,
			'duration'    => $cookie_duration,
			'cookie_id'   => $cookie_id,
		) );
	} else {
		wp_send_json_error( array(
			'message' => $error_message,
		) );
	}
}

/**
 * Delete a cookie via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_delete_cookie() {
	check_ajax_referer( 'wpconsent_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$cookie_id = isset( $_POST['cookie_id'] ) ? intval( $_POST['cookie_id'] ) : 0;

	if ( empty( $cookie_id ) ) {
		wp_send_json_error( array(
			'message' => esc_html__( 'Cookie ID is required.', 'wpconsent-cookies-banner-privacy-suite' ),
		) );
	}

	$deleted = wpconsent()->cookies->delete_cookie( $cookie_id );

	if ( $deleted ) {
		wp_send_json_success( array(
			'message' => esc_html__( 'Cookie deleted successfully.', 'wpconsent-cookies-banner-privacy-suite' ),
		) );
	} else {
		wp_send_json_error( array(
			'message' => esc_html__( 'Failed to delete cookie.', 'wpconsent-cookies-banner-privacy-suite' ),
		) );
	}
}


/**
 * Delete a service via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_delete_service() {
	check_ajax_referer( 'wpconsent_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$service_id = isset( $_POST['service_id'] ) ? intval( $_POST['service_id'] ) : 0;

	if ( empty( $service_id ) ) {
		wp_send_json_error( array(
			'message' => esc_html__( 'Service ID is required.', 'wpconsent-cookies-banner-privacy-suite' ),
		) );
	}

	$deleted = wpconsent()->cookies->delete_service( $service_id );

	if ( $deleted ) {
		wp_send_json_success( array(
			'message' => esc_html__( 'Service deleted successfully.', 'wpconsent-cookies-banner-privacy-suite' ),
		) );
	} else {
		wp_send_json_error( array(
			'message' => esc_html__( 'Failed to delete service.', 'wpconsent-cookies-banner-privacy-suite' ),
		) );
	}
}

/**
 * Search pages via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_search_pages() {
	check_ajax_referer( 'wpconsent_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$search = isset( $_POST['search'] ) ? sanitize_text_field( wp_unslash( $_POST['search'] ) ) : '';

	// Query pages with search term and order by relevance.
	$pages = get_posts( array(
		's'              => $search,
		'post_type'      => 'page',
		'posts_per_page' => 10,
		'orderby'        => 'relevance',
	) );

	// Let's format the pages to match the choices.js format.
	$pages = array_map( function ( $page ) {
		return array(
			'value' => $page->ID,
			'label' => $page->post_title,
		);
	}, $pages );

	wp_send_json_success( $pages );
}

/**
 * Get a list of options for a select item with services based on a category id.
 *
 * @return void
 */
function wpconsent_ajax_get_services() {
	// Nonce check.
	check_ajax_referer( 'wpconsent_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$services_options = array(
		'0' => esc_html__( 'No service', 'wpconsent-cookies-banner-privacy-suite' ),
	);

	$category_id = isset( $_POST['category_id'] ) ? intval( $_POST['category_id'] ) : 0;

	$services_for_category = wpconsent()->cookies->get_services_by_category( $category_id );

	if ( ! empty( $services_for_category ) ) {
		foreach ( $services_for_category as $service ) {
			$services_options[ $service['id'] ] = $service['name'];
		}
	}

	// Let's build options for the select field.
	$options = '';

	foreach ( $services_options as $value => $label ) {
		$options .= '<option value="' . esc_attr( $value ) . '">' . esc_html( $label ) . '</option>';
	}

	wp_send_json_success( $options );

}

/**
 * Ajax handler to automatically configure cookies based on detected services in the scanner.
 *
 * @return void
 */
function wpconsent_ajax_auto_configure() {
	check_ajax_referer( 'wpconsent_scan_website', 'wpconsent_scan_website_nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$services        = isset( $_POST['scanner_service'] ) ? array_map( 'sanitize_text_field', wp_unslash( $_POST['scanner_service'] ) ) : array();
	$script_blocking = isset( $_POST['script_blocking'] ) ? 1 : 0;

	wpconsent()->scanner->auto_configure_services( $services );

	// Let's mark the scan as configured.
	wpconsent()->scanner->mark_scan_as_configured();

	// Clear cached service detection data.
	wpconsent()->cookies->clear_cookies_cache();

	// Let's update script blocking.
	wpconsent()->settings->bulk_update_options(
		array(
			'enable_script_blocking' => $script_blocking,
		)
	);

	wp_send_json_success( array(
		'message' => esc_html__( 'Services and cookies added successfully.', 'wpconsent-cookies-banner-privacy-suite' ),
	) );

}

/**
 * Save the banner layout via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_save_banner_layout() {
	check_ajax_referer( 'wpconsent_banner_layout', 'wpconsent_banner_layout_nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$banner_layout = isset( $_POST['banner_layout'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_layout'] ) ) : false;

	if ( $banner_layout ) {
		$position_input = 'banner_' . $banner_layout . '_position';
		$position       = isset( $_POST[ $position_input ] ) ? sanitize_text_field( wp_unslash( $_POST[ $position_input ] ) ) : false;

		$settings = array(
			'banner_layout'         => $banner_layout,
			'banner_position'       => $position,
			'enable_consent_banner' => 1,
			'onboarding_completed'  => 1,
		);
	}

	if ( ! empty( $settings ) ) {
		wpconsent()->settings->bulk_update_options( $settings );
	}

	wp_send_json_success(
		array(
			'message'  => esc_html__( 'Banner layout saved successfully.', 'wpconsent-cookies-banner-privacy-suite' ),
			'redirect' => admin_url( 'admin.php?page=wpconsent' ),
		)
	);
}

/**
 * Mark the onboarding wizard as completed via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_complete_onboarding() {
	check_ajax_referer( 'wpconsent_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	wpconsent()->settings->bulk_update_options( array( 'onboarding_completed' => 1 ) );

	wp_send_json_success(
		array(
			'message'  => esc_html__( 'Onboarding completed successfully.', 'wpconsent-cookies-banner-privacy-suite' ),
			'redirect' => admin_url( 'admin.php?page=wpconsent-banner' ),
		)
	);
}

/**
 * Generate the cookie policy page via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_generate_cookie_policy() {
	check_ajax_referer( 'wpconsent_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	// Translators: This is a default text for the cookie policy generated by WPConsent. %1$s is the opening anchor tag, %2$s is the closing anchor tag.
	$default_cookie_policy_text = esc_html__( 'This page provides comprehensive information about how we use cookies on our website to enhance your browsing experience, improve website performance, and deliver personalized content. Cookies are small text files that are stored on your device when you visit our site. They help us understand how visitors interact with our website, allowing us to offer a smoother and more efficient user experience. In the table below, you will find detailed information about each type of cookie we use, their purpose, and how long they remain on your device. We are committed to respecting your privacy and providing transparency about the data we collect through cookies. For more information on how we handle your personal data, please see our %1$sPrivacy Policy.%2$s', 'wpconsent-cookies-banner-privacy-suite' );
	$privacy_policy             = get_privacy_policy_url();
	$default_cookie_policy_text = sprintf( $default_cookie_policy_text, '<a href="' . esc_url( $privacy_policy ) . '">', '</a>' );

	// Let's append our shortcode.
	$shortcode    = '<br>[wpconsent_cookie_policy]';
	$page_content = '<p>' . $default_cookie_policy_text . '</p>';

	// Let's check if the site is using the block editor for pages.
	if ( function_exists( 'use_block_editor_for_post_type' ) && use_block_editor_for_post_type( 'page' ) ) {
		// Let's wrap the page content in a paragraph block.
		$page_content = '<!-- wp:paragraph -->' . $page_content . '<!-- /wp:paragraph -->';
		// Let's add the shortcode block.
		$page_content .= '<!-- wp:shortcode -->' . $shortcode . '<!-- /wp:shortcode -->';
	} else {
		// Let's add the shortcode.
		$page_content .= $shortcode;
	}

	// Let's create a new page called Cookie Policy.
	$page_id = wp_insert_post(
		array(
			'post_title'   => esc_html__( 'Cookie Policy', 'wpconsent-cookies-banner-privacy-suite' ),
			'post_content' => $page_content,
			'post_status'  => 'publish',
			'post_type'    => 'page',
		)
	);
	if ( ! $page_id ) {
		wp_send_json_error(
			array(
				'title'   => esc_html__( 'Failed to generate cookie policy page.', 'wpconsent-cookies-banner-privacy-suite' ),
				'message' => esc_html__( 'We encountered an error when generating the cookie policy page, please make sure you can create new pages and try again.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	// Let's update the cookie policy page ID in the settings.
	wpconsent()->settings->bulk_update_options(
		array(
			'cookie_policy_page' => $page_id,
		)
	);

	wp_send_json_success(
		array(
			'page_title' => get_the_title( $page_id ),
			'page_id'    => $page_id,
			'title'      => esc_html__( 'Cookie policy page generated successfully.', 'wpconsent-cookies-banner-privacy-suite' ),
			'message'    => esc_html__( 'Your new cookie policy page has been created and configured. The new page uses a default cookie policy text and the WPConsent shortcode to list out the cookie information as configured in the WPConsent settings. Please review the page.', 'wpconsent-cookies-banner-privacy-suite' ),
			'link'       => get_permalink( $page_id ),
			'view_page'  => esc_html__( 'View Page', 'wpconsent-cookies-banner-privacy-suite' ),
		)
	);
}

/**
 * Search both posts and pages via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_search_content() {
	check_ajax_referer( 'wpconsent_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$search = isset( $_POST['search'] ) ? sanitize_text_field( wp_unslash( $_POST['search'] ) ) : '';

	// Query both posts and pages with search term and order by relevance.
	$posts = get_posts(
		array(
			's'              => $search,
			'post_type'      => array( 'post', 'page' ),
			'posts_per_page' => 10,
			'post_status'    => 'publish',
			'orderby'        => 'relevance',
		)
	);

	// Format the results to match the choices.js format.
	$results = array();
	foreach ( $posts as $post ) {
		$results[] = array(
			'value' => $post->ID,
			'label' => sprintf( '%1$s (#%2$d)', $post->post_title, $post->ID ),
			'url'   => get_permalink( $post->ID ),
		);
	}

	wp_send_json_success( $results );
}

/**
 * Save post IDs from the manual scanner.
 *
 * @return void
 */
function wpconsent_ajax_save_scanner_items() {
	check_ajax_referer( 'wpconsent_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$items = isset( $_POST['items'] ) ? array_map( 'intval', wp_unslash( $_POST['items'] ) ) : array();

	// Remove duplicates and ensure all values are integers.
	$unique_items = array_unique( $items );

	// Save the items using WPConsent settings API.
	wpconsent()->settings->update_option( 'manual_scan_pages', $unique_items );

	wp_send_json_success(
		array(
			'message' => esc_html__( 'Items saved successfully.', 'wpconsent-cookies-banner-privacy-suite' ),
			'items'   => $unique_items,
		)
	);
}

/**
 * Reset banner content to default English state via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_reset_to_defaults() {
	check_ajax_referer( 'wpconsent_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	// Reset default strings.
	$default_strings = wpconsent()->strings->get_strings();
	wpconsent()->settings->bulk_update_options( $default_strings );

	// Reset default categories and cookies.
	wpconsent()->cookies->reset_to_defaults();

	wp_send_json_success();
}

/**
 * Save usage tracking preference via AJAX.
 *
 * @return void
 */
function wpconsent_ajax_save_usage_tracking() {
	check_ajax_referer( 'wpconsent_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$usage_tracking = isset( $_POST['usage_tracking'] ) ? intval( $_POST['usage_tracking'] ) : 0;

	// Save the usage tracking preference.
	wpconsent()->settings->update_option( 'usage_tracking', $usage_tracking );

	wp_send_json_success(
		array(
			'message' => esc_html__( 'Usage tracking preference saved successfully.', 'wpconsent-cookies-banner-privacy-suite' ),
		)
	);
}

/**
 * Ajax handler to verify that the current web host can successfully
 * make outbound SSL connections.
 *
 * @return void
 */
function wpconsent_ajax_verify_ssl() {
	check_ajax_referer( 'wpconsent_admin', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error(
			array(
				'msg' => esc_html__( 'You do not have permission to perform this action.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	$response = wp_remote_post( 'https://wpconsent.com' );

	if ( 200 === wp_remote_retrieve_response_code( $response ) ) {
		wp_send_json_success(
			array(
				'msg' => esc_html__( 'Success! Your server can make SSL connections.', 'wpconsent-cookies-banner-privacy-suite' ),
			)
		);
	}

	wp_send_json_error(
		array(
			'msg'   => esc_html__( 'There was an error and the connection failed. Please contact your web host with the technical details below.', 'wpconsent-cookies-banner-privacy-suite' ),
			'debug' => '<pre>' . print_r( map_deep( $response, 'wp_strip_all_tags' ), true ) . '</pre>', // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
		)
	);
}

