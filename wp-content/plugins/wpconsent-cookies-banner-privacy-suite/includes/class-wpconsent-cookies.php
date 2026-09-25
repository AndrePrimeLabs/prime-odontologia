<?php
/**
 * Class used to handle the cookies we use in the plugin.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Cookies.
 */
class WPConsent_Cookies {

	/**
	 * Post type slug.
	 *
	 * @var string
	 */
	public $post_type = 'wpconsent_cookie';

	/**
	 * Taxonomy slug.
	 *
	 * @var string
	 */
	public $taxonomy = 'wpconsent_category';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'init', array( $this, 'register_taxonomy' ) );
	}

	/**
	 * Register post type that we'll use to store the cookies.
	 *
	 * @return void
	 */
	public function register_post_type() {
		$args = array(
			'public'             => false,
			'publicly_queryable' => false,
			'capability_type'    => 'post',
			'has_archive'        => false,
			'hierarchical'       => false,
			'menu_position'      => null,
			'supports'           => array( 'title', 'editor' ),
		);

		register_post_type( $this->post_type, $args );
	}

	/**
	 * Register the taxonomy that we'll use to categorize the cookies.
	 *
	 * @return void
	 */
	public function register_taxonomy() {
		$args = array(
			'hierarchical' => true,
			'public'       => false,
		);

		register_taxonomy( $this->taxonomy, $this->post_type, $args );
	}

	/**
	 * Update a cookie in the database.
	 *
	 * @param int    $post_id The id of the post with the cookie data.
	 * @param string $cookie_id The cookie ID.
	 * @param string $cookie_name The cookie name.
	 * @param string $cookie_description The cookie description.
	 * @param string $cookie_category The cookie category.
	 * @param string $duration The cookie duration.
	 *
	 * @return int|WP_Error
	 */
	public function update_cookie( $post_id, $cookie_id, $cookie_name, $cookie_description, $cookie_category, $duration = '' ) {
		return $this->add_cookie( $cookie_id, $cookie_name, $cookie_description, $cookie_category, $duration, $post_id );
	}

	/**
	 * Add a new cookie to the database. If the post_id is provided, it will update the existing cookie.
	 *
	 * @param string $cookie_id The cookie ID.
	 * @param string $cookie_name The cookie name.
	 * @param string $cookie_description The cookie description.
	 * @param string $cookie_category The cookie category.
	 * @param int    $post_id The id of the post with the cookie data.
	 *
	 * @return int|WP_Error
	 */
	public function add_cookie( $cookie_id, $cookie_name, $cookie_description, $cookie_category, $duration = '', $post_id = null ) {

		// Insert a new post with our cookie name as title, cookie description as content and the cookie id as a meta.
		// Then assign the cookie category taxonomy.
		if ( $post_id ) {
			$updated = apply_filters( 'wpconsent_update_cookie_post', false, $post_id, $cookie_name, $cookie_description, $cookie_category, $duration );

			if ( false === $updated ) {
				$post_id = wp_update_post(
					array(
						'ID'           => $post_id,
						'post_title'   => $cookie_name,
						'post_content' => $cookie_description,
						'post_type'    => $this->post_type,
						'post_status'  => 'publish',
					)
				);
				update_post_meta( $post_id, 'wpconsent_cookie_duration', $duration );
			}
		} else {
			$post_id = wp_insert_post(
				array(
					'post_title'   => $cookie_name,
					'post_content' => $cookie_description,
					'post_type'    => $this->post_type,
					'post_status'  => 'publish',
				)
			);
			update_post_meta( $post_id, 'wpconsent_cookie_duration', $duration );
		}

		if ( ! is_wp_error( $post_id ) ) {
			wp_set_object_terms( $post_id, $cookie_category, $this->taxonomy );
			update_post_meta( $post_id, 'wpconsent_cookie_id', $cookie_id );
		}

		$this->clear_cookies_cache();

		// Return the new id.
		return $post_id;
	}

	/**
	 * Get the categories we use for the cookies.
	 *
	 * @return array
	 */
	public function get_categories() {
		$categories     = get_terms(
			array(
				'taxonomy'   => $this->taxonomy,
				'hide_empty' => false,
				'number'     => 0,
				'parent'     => 0,
			)
		);
		$category_array = $this->get_default_categories();

		// Taxonomy may not be registered yet (e.g. EDD's init@10 receipt render); return defaults so the DB-write loop below doesn't also fail.
		if ( ! is_array( $categories ) ) {
			return apply_filters( 'wpconsent_get_categories', $category_array );
		}

		foreach ( $categories as $category ) {
			$category_data = array(
				'name'        => $category->name,
				'description' => $category->description,
				'required'    => get_term_meta( $category->term_id, 'wpconsent_required', true ),
				'id'          => $category->term_id,
			);
			if ( 'essential' === $category->slug ) {
				$category_data['required'] = 1;
			}

			$category_array[ $category->slug ] = apply_filters( 'wpconsent_category_data', $category_data, $category->term_id );
		}

		// Maybe create default categories in the db if they don't exist.
		foreach ( $category_array as $slug => $category ) {
			if ( 0 === $category['id'] ) {
				$category_array[ $slug ]['id'] = $this->add_category( $category['name'], $category['description'] );
			}
		}

		return apply_filters( 'wpconsent_get_categories', $category_array );
	}

	/**
	 * Get the default categories. Categories like essential, statistics, marketing should always be present.
	 * Users can edit the labels and descriptions, but we need them for automatic script blocking.
	 *
	 * @return array
	 */
	public function get_default_categories() {
		return array(
			'essential'  => array(
				'name'        => __( 'Essential', 'wpconsent-cookies-banner-privacy-suite' ),
				'description' => __( 'Essential cookies enable basic functions and are necessary for the proper function of the website.', 'wpconsent-cookies-banner-privacy-suite' ),
				'required'    => 1,
				'id'          => 0,
			),
			'statistics' => array(
				'name'        => __( 'Statistics', 'wpconsent-cookies-banner-privacy-suite' ),
				'description' => __( 'Statistics cookies collect information anonymously. This information helps us understand how visitors use our website.', 'wpconsent-cookies-banner-privacy-suite' ),
				'required'    => 0,
				'id'          => 0,
			),
			'marketing'  => array(
				'name'        => __( 'Marketing', 'wpconsent-cookies-banner-privacy-suite' ),
				'description' => __( 'Marketing cookies are used to follow visitors to websites. The intention is to show ads that are relevant and engaging to the individual user.', 'wpconsent-cookies-banner-privacy-suite' ),
				'required'    => 0,
				'id'          => 0,
			),
		);
	}

	/**
	 * Get the cookie details by the cookie id.
	 *
	 * @param int $cookie_id The id of the post with the cookie data.
	 *
	 * @return array
	 */
	public function get_cookie( $cookie_id ) {
		$cookie = get_post( $cookie_id );

		$cookie_id       = get_post_meta( $cookie->ID, 'wpconsent_cookie_id', true );
		$cookie_category = wp_get_post_terms( $cookie->ID, $this->taxonomy, array( 'fields' => 'names' ) );

		return array(
			'id'          => $cookie->ID,
			'name'        => $cookie->post_title,
			'cookie_id'   => $cookie_id,
			'description' => $cookie->post_content,
			'categories'  => $cookie_category,
		);
	}

	/**
	 * Add a new category to the database.
	 *
	 * @param string $name The category name.
	 * @param string $description The category description.
	 *
	 * @return int|bool
	 */
	public function add_category( $name, $description ) {
		$term = wp_insert_term(
			$name,
			$this->taxonomy,
			array(
				'description' => $description,
			)
		);

		if ( is_wp_error( $term ) ) {
			return false;
		}

		return $term['term_id'];
	}

	/**
	 * Update a category in the database.
	 *
	 * @param int    $category_id The category ID.
	 * @param string $name The category name.
	 * @param string $description The category description.
	 *
	 * @return bool
	 */
	public function update_category( $category_id, $name, $description ) {

		// Filter to allow short-circuiting the category update.
		$updated = apply_filters( 'wpconsent_update_category', false, $category_id, $name, $description );

		if ( false !== $updated ) {
			return $updated;
		}
		$term = wp_update_term(
			$category_id,
			$this->taxonomy,
			array(
				'name'        => $name,
				'description' => $description,
			)
		);

		$this->clear_cookies_cache();

		if ( is_wp_error( $term ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Delete a category from the database.
	 *
	 * @param int $category_id The category ID to delete.
	 *
	 * @return bool True if successful, false otherwise.
	 */
	public function delete_category( $category_id ) {
		// Let's remove all cookies associated with this term.
		$cookies = get_posts(
			array(
				'post_type'      => $this->post_type,
				'posts_per_page' => - 1,
				'tax_query'      => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query -- Required to find posts in a term; runs only on the rare delete-category admin action.
					array(
						'taxonomy' => $this->taxonomy,
						'terms'    => $category_id,
					),
				),
			)
		);

		foreach ( $cookies as $cookie ) {
			wp_delete_post( $cookie->ID, true );
		}

		$result = wp_delete_term( $category_id, $this->taxonomy );

		$this->clear_cookies_cache();

		return ! is_wp_error( $result );
	}

	/**
	 * Get the cookies by category.
	 *
	 * @param int $category The category id.
	 *
	 * @return array
	 */
	public function get_cookies_by_category( $category ) {
		$cookies = get_posts(
			array(
				'post_type'      => $this->post_type,
				'posts_per_page' => - 1,
				'tax_query'      => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query -- Querying posts by taxonomy term is intrinsic to fetching cookies in a category.
					array(
						'taxonomy' => $this->taxonomy,
						'terms'    => $category,
					),
				),
			)
		);

		$cookie_array              = array();
		$categories                = $this->get_categories();
		$preferences_cookie_exists = false;

		foreach ( $cookies as $cookie ) {
			$cookie_id       = get_post_meta( $cookie->ID, 'wpconsent_cookie_id', true );
			$auto_added      = get_post_meta( $cookie->ID, '_wpconsent_auto_added', true );
			$cookie_category = wp_get_post_terms( $cookie->ID, $this->taxonomy, array( 'fields' => 'ids' ) );

			if ( $category === $categories['essential']['id'] && 'wpconsent_preferences' === $cookie_id ) {
				$preferences_cookie_exists = true;
			}

			$cookie_data = array(
				'id'          => $cookie->ID,
				'name'        => $cookie->post_title,
				'cookie_id'   => $cookie_id,
				'description' => $cookie->post_content,
				'categories'  => $cookie_category,
				'auto_added'  => ! empty( $auto_added ),
				'duration'    => get_post_meta( $cookie->ID, 'wpconsent_cookie_duration', true ),
			);

			$cookie_array[] = apply_filters( 'wpconsent_cookie_data', $cookie_data, $cookie->ID );
		}

		// Create preferences cookie if it doesn't exist and we're in essential category
		if ( $category === $categories['essential']['id'] && ! $preferences_cookie_exists ) {
			$post_id = $this->add_cookie(
				'wpconsent_preferences',
				__( 'Cookie Preferences', 'wpconsent-cookies-banner-privacy-suite' ),
				__( 'This cookie is used to store the user\'s cookie consent preferences.', 'wpconsent-cookies-banner-privacy-suite' ),
				'essential',
				$this->get_consent_duration_label()
			);

			if ( ! is_wp_error( $post_id ) ) {
				$cookie      = get_post( $post_id );
				$cookie_data = array(
					'id'          => $cookie->ID,
					'name'        => $cookie->post_title,
					'cookie_id'   => get_post_meta( $cookie->ID, 'wpconsent_cookie_id', true ),
					'description' => $cookie->post_content,
					'categories'  => wp_get_post_terms( $cookie->ID, $this->taxonomy, array( 'fields' => 'ids' ) ),
					'auto_added'  => false,
					'duration'    => get_post_meta( $cookie->ID, 'wpconsent_cookie_duration', true ),
				);
				array_unshift( $cookie_array, apply_filters( 'wpconsent_cookie_data', $cookie_data, $cookie->ID ) );
			}
		}

		return apply_filters( 'wpconsent_get_cookies_by_category', $cookie_array, $category );
	}

	/**
	 * Get an array of cookies for a specific service.
	 *
	 * @param int $service The service id.
	 *
	 * @return array
	 */
	public function get_cookies_by_service( $service ) {
		return $this->get_cookies_by_category( $service );
	}

	/**
	 * Delete a cookie from the database.
	 *
	 * @param int $cookie_id The cookie ID to delete.
	 *
	 * @return bool True if successful, false otherwise.
	 */
	public function delete_cookie( $cookie_id ) {

		// Let's make sure that the id is for our post type.
		$post = get_post( $cookie_id );
		if ( ! $post || $post->post_type !== $this->post_type ) {
			return false;
		}
		// Let's make sure the user is allowed to delete this post type.
		if ( ! current_user_can( 'delete_post', $cookie_id ) ) {
			return false;
		}

		$result = wp_delete_post( $cookie_id, true );

		$this->clear_cookies_cache();

		return ! is_wp_error( $result );
	}

	/**
	 * Services are stored as child terms of categories and they can have cookies attached to them.
	 * Cookies can also be attached directly to categories if the service is not external.
	 *
	 * @param string       $service_id The service ID.
	 * @param string       $service_name The service name.
	 * @param string       $service_description The service description.
	 * @param string|false $service_url The service URL (optional) - this is usually the privacy policy URL for this specific service.
	 * @param int|false    $service_category The service category ID (optional) - if not provided, the service will be added to the root category.
	 *
	 * @return int|false
	 */
	public function update_service( $service_id, $service_name, $service_description = '', $service_url = false, $service_category = false ) {

		$updated = apply_filters( 'wpconsent_update_service', false, $service_id, $service_name, $service_description, $service_url );

		if ( ! $updated ) {
			// if the $service_category is not false, we need to change the parent term.
			$service_data = array(
				'name'        => $service_name,
				'description' => $service_description,
			);

			if ( false !== $service_category ) {
				$service_data['parent'] = $service_category;
			}

			$term = wp_update_term(
				$service_id,
				$this->taxonomy,
				$service_data
			);
		} else {
			$term = $updated;
		}

		$this->clear_cookies_cache();

		if ( ! is_wp_error( $term ) ) {
			if ( false !== $service_url ) {
				update_term_meta( $service_id, 'wpconsent_service_url', $service_url );
			}

			return $service_id;
		}

		return false;
	}

	/**
	 * Add a new service to the database.
	 *
	 * @param string $service_name The service name.
	 * @param int    $category_id The category ID.
	 * @param string $service_description The service description.
	 * @param string $service_url The service URL (optional) - this is usually the privacy policy URL for this specific service.
	 *
	 * @return  int|false
	 */
	public function add_service( $service_name, $category_id, $service_description = '', $service_url = '' ) {
		$term = wp_insert_term(
			$service_name,
			$this->taxonomy,
			array(
				'parent'      => $category_id,
				'description' => $service_description,
			)
		);

		if ( ! is_wp_error( $term ) ) {
			update_term_meta( $term['term_id'], 'wpconsent_service_url', $service_url );

			$this->clear_cookies_cache();

			return $term['term_id'];
		}

		return false;
	}

	/**
	 * Delete a service from the database.
	 *
	 * @param int $service_id The service ID to delete.
	 *
	 * @return bool True if successful, false otherwise.
	 */
	public function delete_service( $service_id ) {
		$result = wp_delete_term( $service_id, $this->taxonomy );

		$this->clear_cookies_cache();

		return ! is_wp_error( $result );
	}

	/**
	 * Get the services by category.
	 *
	 * @param int $category_id The category id.
	 *
	 * @return array
	 */
	public function get_services_by_category( $category_id ) {
		$services = get_terms(
			array(
				'taxonomy'   => $this->taxonomy,
				'hide_empty' => false,
				'number'     => 0,
				'parent'     => $category_id,
			)
		);

		$service_array = array();

		foreach ( $services as $service ) {
			$service_url     = get_term_meta( $service->term_id, 'wpconsent_service_url', true );
			$service_data    = array(
				'id'          => $service->term_id,
				'name'        => $service->name,
				'service_url' => $service_url,
				'description' => $service->description,
			);
			$service_array[] = apply_filters( 'wpconsent_service_data', $service_data, $service->term_id );
		}

		return apply_filters( 'wpconsent_get_services_by_category', $service_array, $category_id );
	}

	/**
	 * Get the service by the service slug.
	 *
	 * @param string $slug The service slug.
	 *
	 * @return array|false
	 */
	public function get_service_by_slug( $slug ) {
		$service = get_term_by( 'slug', $slug, $this->taxonomy );
		if ( ! $service ) {
			return false;
		}
		$service_url = get_term_meta( $service->term_id, 'wpconsent_service_url', true );

		return array(
			'id'          => $service->term_id,
			'name'        => $service->name,
			'service_url' => $service_url,
			'description' => $service->description,
		);
	}

	/**
	 * Get a category by its ID.
	 *
	 * @param int $category_id The category ID.
	 *
	 * @return array|false
	 */
	public function get_category_by_id( $category_id ) {
		$category = get_term( $category_id, $this->taxonomy );
		if ( ! $category || is_wp_error( $category ) ) {
			return false;
		}

		$category_data = array(
			'id'          => $category->term_id,
			'name'        => $category->name,
			'description' => $category->description,
			'required'    => ( 'essential' === $category->slug ) ? 1 : get_term_meta( $category->term_id, 'wpconsent_required', true ),
			'slug'        => $category->slug,
		);

		return $category_data;
	}

	/**
	 * Get a service by its ID.
	 *
	 * @param int $service_id The service ID.
	 *
	 * @return array|false
	 */
	public function get_service_by_id( $service_id ) {
		return $this->get_category_by_id( $service_id );
	}

	/**
	 * Checks if the passed service has been automatically added by our scanner configuration.
	 *
	 * @param int|array $service
	 *
	 * @return bool
	 */
	public function is_service_auto_added( $service ) {
		if ( is_array( $service ) ) {
			$service = $service['id'];
		}

		// Check if the term has the meta _wpconsent_auto_added.
		return ! empty( get_term_meta( $service, '_wpconsent_auto_added', true ) );
	}

	/**
	 * Whether this site is using Google services that require Google Consent.
	 *
	 * @return bool
	 */
	public function needs_google_consent() {
		if ( ! wpconsent()->cookie_blocking->get_google_consent_mode() ) {
			return false;
		}

		// If SiteKit plugin has the consent mode enabled we don't need to add the default state script.
		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- Hook defined by Google Site Kit plugin.
		if ( 'enabled' === apply_filters( 'googlesitekit_consent_mode_status', 'disabled' ) ) {
			return false;
		}

		// Check if we have a cached result.
		$cached_result = get_transient( 'wpconsent_needs_google_consent' );
		if ( false !== $cached_result ) {
			return 'yes' === $cached_result;
		}

		// Now let's look at all the services to check if any of them are Google services.
		$services = get_terms(
			array(
				'taxonomy'   => $this->taxonomy,
				'hide_empty' => false,
				'number'     => 0,
			)
		);

		// Let's see if any of the service slugs contain "google".
		foreach ( $services as $service ) {
			if ( false !== strpos( $service->slug, 'google' ) ) {
				set_transient( 'wpconsent_needs_google_consent', 'yes', DAY_IN_SECONDS );

				return true;
			}
		}

		set_transient( 'wpconsent_needs_google_consent', 'no', DAY_IN_SECONDS );

		return false;
	}

	/**
	 * Whether this site is using Microsoft Clarity services that require Clarity Consent.
	 *
	 * @return bool
	 */
	public function needs_clarity_consent() {
		if ( ! wpconsent()->cookie_blocking->get_clarity_consent_mode() ) {
			return false;
		}

		// Check if we have a cached result.
		$cached_result = get_transient( 'wpconsent_needs_clarity_consent' );
		if ( false !== $cached_result ) {
			return 'yes' === $cached_result;
		}

		// Now let's look at all the services to check if any of them are Clarity services.
		$services = get_terms(
			array(
				'taxonomy'   => $this->taxonomy,
				'hide_empty' => false,
				'number'     => 0,
			)
		);

		// Let's see if any of the service slugs contain "google".
		foreach ( $services as $service ) {
			if ( false !== strpos( $service->slug, 'clarity' ) ) {
				set_transient( 'wpconsent_needs_clarity_consent', 'yes', DAY_IN_SECONDS );

				return true;
			}
		}

		set_transient( 'wpconsent_needs_clarity_consent', 'no', DAY_IN_SECONDS );

		return false;
	}

	/**
	 * Clear cookies cache for a category for prefernces modal.
	 *
	 * @return void
	 */
	public function clear_cookies_cache() {
		// Delete service detection transients.
		delete_transient( 'wpconsent_needs_google_consent' );
		delete_transient( 'wpconsent_has_google_services' );
		delete_transient( 'wpconsent_has_embeddable_services' );
		// Delete transient wpconsent_cookies.
		delete_transient( 'wpconsent_preference_cookies' );
		// Delete transient wpconsent_preference_slugs.
		delete_transient( 'wpconsent_preference_slugs' );

		// Allow extensions to clear additional caches (e.g., locale-specific caches).
		do_action( 'wpconsent_clear_preference_cookies_cache' );
	}

	/**
	 * Get all default categories and their services slugs in a flattened array.
	 *
	 * @return array
	 */
	public function get_preference_slugs() {
		$slugs = array();

		// Try to get from cache first.
		$cached_slugs = get_transient( 'wpconsent_preference_slugs' );
		if ( false !== $cached_slugs ) {
			return $cached_slugs;
		}

		$categories    = $this->get_categories();
		$manual_toggle = wpconsent()->settings->get_option( 'manual_toggle_services', 0 );

		foreach ( $categories as $category_slug => $category ) {
			$slugs[] = $category_slug;

			if ( ! $manual_toggle ) {
				continue;
			}
			$services = $this->get_services_by_category( $category['id'] );
			if ( ! empty( $services ) ) {
				foreach ( $services as $service ) {
					$service_slug = sanitize_title( $service['name'] );
					$slugs[]      = $service_slug;
				}
			}
		}

		set_transient( 'wpconsent_preference_slugs', $slugs, DAY_IN_SECONDS );

		return $slugs;
	}

	/**
	 * Reset categories and cookies to their default state.
	 *
	 * @return void
	 */
	public function reset_to_defaults() {
		// Reset default categories.
		$default_categories = $this->get_default_categories();
		foreach ( $default_categories as $slug => $category_data ) {
			$category = get_term_by( 'slug', $slug, $this->taxonomy );
			if ( $category ) {
				$this->update_category( $category->term_id, $category_data['name'], $category_data['description'] );
			}
		}

		// Reset default preferences cookie - find it by cookie_id meta.
		$preferences_cookie = $this->get_preferences_cookie_post();

		if ( $preferences_cookie ) {
			$this->update_cookie(
				$preferences_cookie->ID,
				'wpconsent_preferences',
				__( 'Cookie Preferences', 'wpconsent-cookies-banner-privacy-suite' ),
				__( 'This cookie is used to store the user\'s cookie consent preferences.', 'wpconsent-cookies-banner-privacy-suite' ),
				'essential',
				$this->get_consent_duration_label()
			);
		}

		$this->clear_cookies_cache();
	}

	/**
	 * Get the human-readable duration label for the consent cookie based on the consent_duration setting.
	 *
	 * @return string E.g. "30 days" or "1 day".
	 */
	public function get_consent_duration_label() {
		$days = absint( wpconsent()->settings->get_option( 'consent_duration', 30 ) );

		if ( empty( $days ) ) {
			$days = 30;
		}

		/* translators: %d: number of days the consent cookie is stored. */
		return sprintf( _n( '%d day', '%d days', $days, 'wpconsent-cookies-banner-privacy-suite' ), $days );
	}

	/**
	 * Get the post storing the wpconsent_preferences cookie data, if it exists.
	 *
	 * @return WP_Post|null
	 */
	public function get_preferences_cookie_post() {
		$preferences_cookies = get_posts(
			array(
				'post_type'      => $this->post_type,
				'posts_per_page' => 1,
				'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Locating the preferences cookie by its meta key; bounded to a single result.
					array(
						'key'   => 'wpconsent_cookie_id',
						'value' => 'wpconsent_preferences',
					),
				),
			)
		);

		return empty( $preferences_cookies ) ? null : $preferences_cookies[0];
	}

	/**
	 * Update the duration label of the wpconsent_preferences cookie to match the consent_duration setting.
	 *
	 * @return void
	 */
	public function update_preferences_cookie_duration() {
		$preferences_cookie = $this->get_preferences_cookie_post();

		if ( ! $preferences_cookie ) {
			return;
		}

		update_post_meta( $preferences_cookie->ID, 'wpconsent_cookie_duration', $this->get_consent_duration_label() );

		$this->clear_cookies_cache();
	}
}
