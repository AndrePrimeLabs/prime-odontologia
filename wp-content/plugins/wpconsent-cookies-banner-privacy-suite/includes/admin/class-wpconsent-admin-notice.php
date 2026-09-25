<?php
/**
 * Class used to handle admin notices.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Notice.
 */
class WPConsent_Notice {

	/**
	 * Not dismissible.
	 *
	 * Constant attended to use as the value of the $args['dismiss'] argument.
	 * DISMISS_NONE means that the notice is not dismissible.
	 */
	const DISMISS_NONE = 0;

	/**
	 * Dismissible global.
	 *
	 * Constant attended to use as the value of the $args['dismiss'] argument.
	 * DISMISS_GLOBAL means that the notice will have the dismiss button, and after clicking this button, the notice will be dismissed for all users.
	 */
	const DISMISS_GLOBAL = 1;

	/**
	 * Dismissible per user.
	 *
	 * Constant attended to use as the value of the $args['dismiss'] argument.
	 * DISMISS_USER means that the notice will have the dismiss button, and after clicking this button, the notice will be dismissed only for the current user..
	 */
	const DISMISS_USER = 2;

	/**
	 * Added notices.
	 *
	 * @var array
	 */
	public $notices = array();

	/**
	 * Top notices, displayed separately.
	 *
	 * @var array
	 */
	public $notices_top = array();

	/**
	 * Init.
	 */
	public function __construct() {

		$this->hooks();
	}

	/**
	 * Hooks.
	 */
	public function hooks() {
		add_action( 'admin_notices', array( $this, 'display' ), 999000 );
		// Hook for our specific pages where we hide all other admin notices.
		add_action( 'wpconsent_admin_notices', array( $this, 'display' ), 10 );
		add_action( 'wp_ajax_wpconsent_notice_dismiss', array( $this, 'dismiss_ajax' ) );

		// Display notices above the header.
		add_action( 'wpconsent_admin_page', array( $this, 'display_top' ), 5 );

		// Load registered notices from the database.
		add_action( 'admin_init', array( $this, 'load_registered_notices' ), 5 );
	}

	/**
	 * Enqueue assets.
	 */
	public function enqueues() {

		wp_enqueue_script(
			'wpconsent-admin-notices',
			WPCONSENT_PLUGIN_URL . 'build/notices.js',
			array( 'jquery' ),
			WPCONSENT_VERSION,
			true
		);

		wp_localize_script(
			'wpconsent-admin-notices',
			'wpconsent_admin_notices',
			array(
				'ajax_url' => admin_url( 'admin-ajax.php' ),
				'nonce'    => wp_create_nonce( 'wpconsent-admin' ),
			)
		);
	}

	/**
	 * Display the notices.
	 */
	public function display() {

		$dismissed_notices = get_user_meta( get_current_user_id(), 'wpconsent_admin_notices', true );
		$dismissed_notices = is_array( $dismissed_notices ) ? $dismissed_notices : array();
		$dismissed_notices = array_merge( $dismissed_notices, (array) get_option( 'wpconsent_admin_notices', array() ) );

		foreach ( $this->notices as $slug => $notice ) {
			if ( isset( $dismissed_notices[ $slug ] ) && ! empty( $dismissed_notices[ $slug ]['dismissed'] ) ) {
				unset( $this->notices[ $slug ] );
			}
		}

		$output = implode( '', $this->notices );

		echo $output; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		// Enqueue script only when it's needed.
		if ( strpos( $output, 'is-dismissible' ) !== false ) {
			$this->enqueues();
		}
	}

	/**
	 * Display the notices at the top of the WPC pages.
	 */
	public function display_top() {
		$dismissed_notices = get_user_meta( get_current_user_id(), 'wpconsent_admin_notices', true );
		$dismissed_notices = is_array( $dismissed_notices ) ? $dismissed_notices : array();
		$dismissed_notices = array_merge( $dismissed_notices, (array) get_option( 'wpconsent_admin_notices', array() ) );

		foreach ( $this->notices_top as $slug => $notice ) {
			if ( isset( $dismissed_notices[ $slug ] ) && ! empty( $dismissed_notices[ $slug ]['dismissed'] ) ) {
				unset( $this->notices_top[ $slug ] );
			}
		}

		$output = implode( '', $this->notices_top );

		if ( ! empty( $output ) ) {
			echo '<div class="wpconsent-notice-top-area">';
			echo $output; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo '</div>';
		}

		// Enqueue script only when it's needed.
		if ( strpos( $output, 'is-dismissible' ) !== false ) {
			$this->enqueues();
		}
	}

	/**
	 * Add notice to the registry.
	 *
	 * @param string $message Message to display.
	 * @param string $type Type of the notice. Can be [ '' (default) | 'info' | 'error' | 'success' | 'warning' ].
	 * @param array  $args The array of additional arguments. Please see the $defaults array below.
	 *
	 * @return void
	 */
	public static function add( $message, $type = '', $args = [] ) {

		static $uniq_id = 0;

		$defaults = array(
			'dismiss' => self::DISMISS_NONE,
			// Dismissible level: one of the self::DISMISS_* const. By default notice is not dismissible.
			'slug'    => '',
			// Slug. Should be unique if dismissible is not equal self::DISMISS_NONE.
			'autop'   => true,
			// `false` if not needed to pass message through wpautop().
			'class'   => '',
			// Additional CSS class.
		);

		$args = wp_parse_args( $args, $defaults );

		$dismissible = (int) $args['dismiss'];
		$dismissible = $dismissible > self::DISMISS_USER ? self::DISMISS_USER : $dismissible;

		$class  = $dismissible > self::DISMISS_NONE ? ' is-dismissible' : '';
		$global = ( $dismissible === self::DISMISS_GLOBAL ) ? 'global-' : '';
		$slug   = sanitize_key( $args['slug'] );

		++ $uniq_id;

		$uniq_id += ( $uniq_id === (int) $slug ) ? 1 : 0;

		$id = 'wpconsent-notice-' . $global;

		$id .= empty( $slug ) ? $uniq_id : $slug;

		$type_class = ! empty( $type ) ? 'notice-' . esc_attr( sanitize_key( $type ) ) : '';
		$class      = empty( $args['class'] ) ? $class : $class . ' ' . esc_attr( sanitize_key( $args['class'] ) );
		$message    = $args['autop'] ? wpautop( $message ) : $message;
		$notice     = sprintf(
			'<div class="notice wpconsent-notice %s%s" id="%s">%s</div>',
			esc_attr( $type_class ),
			esc_attr( $class ),
			esc_attr( $id ),
			$message
		);

		if ( 'top' === $type ) {
			if ( empty( $slug ) ) {
				wpconsent()->notice->notices_top[] = $notice;
			} else {
				wpconsent()->notice->notices_top[ $slug ] = $notice;
			}

			return; // Don't mix top notices.
		}

		if ( empty( $slug ) ) {
			wpconsent()->notice->notices[] = $notice;
		} else {
			wpconsent()->notice->notices[ $slug ] = $notice;
		}
	}

	/**
	 * Add info notice.
	 *
	 * @param string $message Message to display.
	 * @param array  $args Array of additional arguments. Details in the self::add() method.
	 */
	public static function info( $message, $args = [] ) {

		self::add( $message, 'info', $args );
	}

	/**
	 * Add top notice (displayed before the header on wpconsent pages only).
	 *
	 * @param string $message Message to display.
	 * @param array  $args Array of additional arguments. Details in the self::add() method.
	 */
	public static function top( $message, $args = [] ) {

		self::add( $message, 'top', $args );
	}

	/**
	 * Add error notice.
	 *
	 * @param string $message Message to display.
	 * @param array  $args Array of additional arguments. Details in the self::add() method.
	 */
	public static function error( $message, $args = [] ) {

		self::add( $message, 'error', $args );
	}

	/**
	 * Add success notice.
	 *
	 * @param string $message Message to display.
	 * @param array  $args Array of additional arguments. Details in the self::add() method.
	 */
	public static function success( $message, $args = [] ) {

		self::add( $message, 'success', $args );
	}

	/**
	 * Add warning notice.
	 *
	 * @param string $message Message to display.
	 * @param array  $args Array of additional arguments. Details in the self::add() method.
	 */
	public static function warning( $message, $args = [] ) {

		self::add( $message, 'warning', $args );
	}

	/**
	 * AJAX routine that updates dismissed notices meta data.
	 */
	public function dismiss_ajax() {

		// Run a security check.
		check_ajax_referer( 'wpconsent-admin' );

		// Sanitize POST data.
		$post = array_map( 'sanitize_key', wp_unslash( $_POST ) );

		// Update notices meta data.
		if ( strpos( $post['id'], 'global-' ) !== false ) {

			// Check for permissions.
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error();
			}

			$notices = $this->dismiss_global( $post['id'] );
			$level   = self::DISMISS_GLOBAL;

		} else {

			$notices = $this->dismiss_user( $post['id'] );
			$level   = self::DISMISS_USER;
		}

		/**
		 * Allows developers to apply additional logic to the dismissing notice process.
		 * Executes after updating option or user meta (according to the notice level).
		 *
		 *
		 * @param string  $notice_id Notice ID (slug).
		 * @param integer $level Notice level.
		 * @param array   $notices Dismissed notices.
		 */
		do_action( 'wpconsent_admin_notice_dismiss_ajax', $post['id'], $level, $notices );

		wp_send_json_success();
	}

	/**
	 * AJAX sub-routine that updates dismissed notices option.
	 *
	 * @param string $id Notice Id.
	 *
	 * @return array Notices.
	 */
	private function dismiss_global( $id ) {

		$id             = str_replace( 'global-', '', $id );
		$notices        = get_option( 'wpconsent_admin_notices', array() );
		$notices[ $id ] = array(
			'time'      => time(),
			'dismissed' => true,
		);

		update_option( 'wpconsent_admin_notices', $notices, true );

		// If this is a multisite, and they dismissed the review-request let's keep a note in the user's meta.
		if ( is_multisite() && is_super_admin() && 'review_request' === $id ) {
			update_user_meta( get_current_user_id(), 'wpconsent_dismissed_review_request', true );
		}

		return $notices;
	}

	/**
	 *  AJAX sub-routine that updates dismissed notices user meta.
	 *
	 * @param string $id Notice Id.
	 *
	 * @return array Notices.
	 */
	private function dismiss_user( $id ) {

		$user_id        = get_current_user_id();
		$notices        = get_user_meta( $user_id, 'wpconsent_admin_notices', true );
		$notices        = ! is_array( $notices ) ? array() : $notices;
		$notices[ $id ] = array(
			'time'      => time(),
			'dismissed' => true,
		);

		update_user_meta( $user_id, 'wpconsent_admin_notices', $notices );

		return $notices;
	}

	/**
	 * Load registered notices from the database and add them to the notices array.
	 */
	public function load_registered_notices() {
		// Get all notices from the database.
		$notices = get_option( 'wpconsent_admin_notices', array() );

		// Get user dismissed notices.
		$user_dismissed = get_user_meta( get_current_user_id(), 'wpconsent_admin_notices', true );
		$user_dismissed = is_array( $user_dismissed ) ? $user_dismissed : array();

		foreach ( $notices as $slug => $notice ) {
			// Skip if notice is dismissed globally.
			if ( ! empty( $notice['dismissed'] ) ) {
				continue;
			}

			// Special handling for translation notices: check if content changed since dismissal.
			if ( strpos( $slug, 'translation_' ) === 0 && isset( $user_dismissed[ $slug ] ) ) {
				$dismissal_time = isset( $user_dismissed[ $slug ]['time'] ) ? $user_dismissed[ $slug ]['time'] : 0;
				$notice_time    = isset( $notice['time'] ) ? $notice['time'] : 0;

				// If notice is newer than dismissal, allow it to show (new translation).
				if ( $notice_time > $dismissal_time ) {
					// Remove old dismissal to allow new translation notice.
					unset( $user_dismissed[ $slug ] );
					update_user_meta( get_current_user_id(), 'wpconsent_admin_notices', $user_dismissed );
				}
			}

			// Skip if notice is dismissed by the current user (after potential cleanup above).
			if ( isset( $user_dismissed[ $slug ] ) && ! empty( $user_dismissed[ $slug ]['dismissed'] ) ) {
				continue;
			}

			// Skip if no message is set.
			if ( empty( $notice['message'] ) ) {
				continue;
			}

			// Add the notice to be displayed.
			$args         = isset( $notice['args'] ) ? $notice['args'] : array();
			$args['slug'] = $slug; // Ensure the slug is set.

			self::add( $notice['message'], $notice['type'], $args );
		}
	}

	/**
	 * Register a notice to be displayed.
	 *
	 * @param string $message Message to display.
	 * @param string $type Type of the notice. Can be [ '' (default) | 'info' | 'error' | 'success' | 'warning' | 'top' ].
	 * @param array  $args The array of additional arguments. Please see the $defaults array in the add() method.
	 *
	 * @return string The ID of the registered notice.
	 */
	public static function register_notice( $message, $type = '', $args = [] ) {
		// Generate a unique ID if not provided.
		if ( empty( $args['slug'] ) ) {
			$args['slug'] = 'notice_' . md5( $message . time() . wp_rand() );
		}

		// Store the notice in the database.
		$notices = get_option( 'wpconsent_admin_notices', array() );

		// Only store if it doesn't exist or isn't dismissed.
		if ( ! isset( $notices[ $args['slug'] ] ) || empty( $notices[ $args['slug'] ]['dismissed'] ) ) {
			$notices[ $args['slug'] ] = array(
				'time'      => time(),
				'dismissed' => false,
				'message'   => $message,
				'type'      => $type,
				'args'      => $args,
			);

			update_option( 'wpconsent_admin_notices', $notices, true );
		}

		// Add the notice to be displayed.
		self::add( $message, $type, $args );

		return $args['slug'];
	}

	/**
	 * Register a translation notice with simple per-language cleanup.
	 * Expects normalized lowercase locale input to prevent case issues.
	 *
	 * @param string $message The notice message.
	 * @param string $type The notice type (success, error).
	 * @param string $locale The target locale (should be lowercase).
	 * @return string The notice slug.
	 */
	public static function register_translation_notice( $message, $type, $locale ) {
		$slug = 'translation_' . $locale;

		// Simple cleanup - remove existing notice for this locale.
		self::cleanup_specific_translation_notice( $locale );

		// Force register notice (always create new).
		$notices          = get_option( 'wpconsent_admin_notices', array() );
		$notices[ $slug ] = array(
			'time'      => time(),
			'dismissed' => false,
			'message'   => $message,
			'type'      => $type,
			'args'      => array(
				'slug'    => $slug,
				'dismiss' => self::DISMISS_USER,
				'class'   => 'wpconsent-translation-notice',
			),
		);

		update_option( 'wpconsent_admin_notices', $notices, true );

		// Also add to immediate display.
		self::add(
			$message,
			$type,
			array(
				'slug'    => $slug,
				'dismiss' => self::DISMISS_USER,
				'class'   => 'wpconsent-translation-notice',
			)
		);

		return $slug;
	}

	/**
	 * Clean up a specific translation notice for a given locale.
	 * Removes both the option entry and user dismissal for that language only.
	 *
	 * @param string $locale The locale to clean up.
	 * @return void
	 */
	public static function cleanup_specific_translation_notice( $locale ) {
		$slug = 'translation_' . $locale;

		// Clean from global option.
		$notices = get_option( 'wpconsent_admin_notices', array() );
		if ( isset( $notices[ $slug ] ) ) {
			unset( $notices[ $slug ] );
			update_option( 'wpconsent_admin_notices', $notices, true );
		}

		// Clean from user meta.
		$user_id = get_current_user_id();
		if ( $user_id ) {
			$user_notices = get_user_meta( $user_id, 'wpconsent_admin_notices', true );
			if ( is_array( $user_notices ) && isset( $user_notices[ $slug ] ) ) {
				unset( $user_notices[ $slug ] );
				update_user_meta( $user_id, 'wpconsent_admin_notices', $user_notices );
			}
		}
	}
}
