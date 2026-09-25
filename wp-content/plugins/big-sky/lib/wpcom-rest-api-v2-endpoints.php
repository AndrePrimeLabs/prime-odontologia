<?php
declare( strict_types = 1 );

require_once __DIR__ . '/wpcom-big-sky-logger.php';
require_once __DIR__ . '/wpcom-wp-orchestrator-logger.php';

/**
 * These endpoints also get registered on WordPress.com simple.
 */
class WPCOM_REST_API_V2_Endpoint_Big_Sky_Plugin extends WP_REST_Controller {

	private $logger;
	private $wp_orchestrator_logger;
	private $anthropic_api_key;

	public function __construct( $logger = null, $wp_orchestrator_logger = null ) {
		$this->wpcom_is_wpcom_only_endpoint = true;
		$this->logger                       = $logger ?? new WPCOM_Big_Sky_Logger();
		$this->wp_orchestrator_logger       = $wp_orchestrator_logger ?? new WPCOM_WP_Orchestrator_Logger();
		$this->anthropic_api_key            = $this->load_anthropic_api_key();
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	private function load_anthropic_api_key() {
		$env_file = dirname( __DIR__ ) . '/.env-anthropic';
		if ( file_exists( $env_file ) ) {
			$key = trim( file_get_contents( $env_file ) );
			if ( ! empty( $key ) ) {
				return $key;
			}
		}
		return null;
	}

	public function register_routes() {
		// register POST big-sky/v1/log/session
		register_rest_route(
			'wpcom/v2',
			'big-sky/v1/session/(?P<session_uuid>[^\/]+)',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'show_in_index'       => false,
				'permission_callback' => function () {
					return current_user_can( 'edit_theme_options' );
				},
				'callback'            => [ $this, 'log_session' ],
				'args'                => [
					'name'    => [
						'required' => true,
					],
					'date'    => [
						'required' => false,
					],
					'is_test' => [
						'default' => false,
					],
					'phase'   => [
						'required' => false,
					],
				],
			)
		);

		// register POST big-sky/v1/sessions/(?P<session_uuid>[^\/]+)/metadata
		register_rest_route(
			'wpcom/v2',
			'big-sky/v1/session/(?P<session_uuid>[^\/]+)/metadata',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'show_in_index'       => false,
				'permission_callback' => function () {
					return current_user_can( 'edit_theme_options' );
				},
				'callback'            => [ $this, 'log_metadata' ],
			)
		);

		// register POST big-sky/v1/log/action
		register_rest_route(
			'wpcom/v2',
			'big-sky/v1/session/(?P<session_uuid>[^\/]+)/action',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'show_in_index'       => false,
				'permission_callback' => function () {
					return current_user_can( 'edit_theme_options' );
				},
				'callback'            => [ $this, 'log_action' ],
				'args'                => [
					'message_type'      => [
						'required' => true,
					],
					'message_id'        => [
						'required' => true,
					],
					'parent_message_id' => [
						'default' => null,
					],
					'content'           => [
						'required' => true,
					],
					'date'              => [
						'required' => false,
					],
					'is_test'           => [
						'required' => false,
						'default'  => false,
					],
					'phase'             => [
						'required' => false,
					],
					'editor'            => [
						'required' => false,
					],
				],
			)
		);

		register_rest_route(
			'wpcom/v2',
			'big-sky/v1/session/(?P<session_uuid>[^\/]+)/rate',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'show_in_index'       => false,
				'permission_callback' => function () {
					return current_user_can( 'edit_theme_options' );
				},
				'callback'            => [ $this, 'log_rating' ],
				'args'                => [
					'message_id' => [
						'required' => false,
					],
					'rating'     => [
						'required' => true,
					],
				],
			)
		);

		register_rest_route(
			'wpcom/v2',
			'big-sky/v1/session/(?P<session_uuid>[^\/]+)/feedback',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'show_in_index'       => false,
				'permission_callback' => function () {
					$is_internal_tester = class_exists( 'Big_Sky' ) && Big_Sky::is_internal_tester();
					return $is_internal_tester && current_user_can( 'edit_theme_options' );
				},
				'callback'            => [ $this, 'log_feedback' ],
				'args'                => [
					'message_id' => [
						'required' => false,
					],
					'feedback'     => [
						'required' => true,
					],
					'previous_user_message' => [
						'required' => false,
					],
				],
			)
		);

		// register GET big-sky/v1/geo-coordinates
		register_rest_route(
			'wpcom/v2',
			'big-sky/v1/geo-coordinates',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'show_in_index'       => false,
				'permission_callback' => function () {
					return current_user_can( 'edit_theme_options' );
				},
				'callback'            => [ $this, 'get_mapbox_geo_coordinates' ],
			)
		);

		// register GET big-sky/v1/variation-templates/colors
		register_rest_route(
			'wpcom/v2',
			'big-sky/v1/variation-templates/colors',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'show_in_index'       => false,
				'permission_callback' => function () {
					return current_user_can( 'edit_theme_options' );
				},
				'callback'            => [ $this, 'get_variation_templates_colors' ],
			)
		);

		// register POST big-sky/v1/anthropic/messages
		register_rest_route(
			'wpcom/v2',
			'big-sky/v1/anthropic/messages',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'show_in_index'       => false,
				'permission_callback' => function () {
					return current_user_can( 'edit_theme_options' );
				},
				'callback'            => [ $this, 'proxy_anthropic_request' ],
			)
		);

		// register GET big-sky/v1/google-fonts
		register_rest_route(
			'wpcom/v2',
			'big-sky/v1/google-fonts',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'show_in_index'       => false,
				'permission_callback' => function () {
					return current_user_can( 'edit_theme_options' );
				},
				'callback'            => [ $this, 'get_custom_google_fonts_collection' ],
			)
		);

		// register POST big-sky/v1/wp-orchestrator/{session_uuid}/rate
		register_rest_route(
			'wpcom/v2',
			'big-sky/v1/wp-orchestrator/(?P<session_uuid>[^\/]+)/rate',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'show_in_index'       => false,
				'permission_callback' => function () {
					return current_user_can( 'publish_posts' );
				},
				'callback'            => [ $this, 'log_wp_orchestrator_rating' ],
				'args'                => [
					'message_id' => [
						'required'          => true,
						'type'              => 'string',
					],
					'rating'     => [
						'required' => true,
					],
					'metadata'   => [
						'required'          => false,
						'type'              => 'object',
					],
				],
			)
		);
	}

	public function log_session( WP_REST_Request $request ) {
		$session_uuid    = $request->get_param( 'session_uuid' );
		$name            = $request->get_param( 'name' );
		$date            = $request->get_param( 'date' );
		$is_test         = $request->get_param( 'is_test' );
		$big_sky_version = $request->get_param( 'big_sky_version' ) ?? '0';

		if ( ! $date ) {
			$date = current_time( 'mysql', true );
		}

		return $this->logger->log_session( $session_uuid, $name, $date, $is_test, $big_sky_version );
	}

	public function log_action( WP_REST_Request $request ) {
		$session_uuid      = $request->get_param( 'session_uuid' );
		$message_role      = $request->get_param( 'message_type' );
		$message_id        = $request->get_param( 'message_id' );
		$content           = $request->get_param( 'content' );
		$date              = $request->get_param( 'date' );
		$parent_message_id = $request->get_param( 'parent_message_id' );
		$is_test           = $request->get_param( 'is_test' );
		$phase             = $request->get_param( 'phase' );
		$editor            = $request->get_param( 'editor' );
		$big_sky_version   = $request->get_param( 'big_sky_version' ) ?? '0';

		// default date to current GMT datetime
		if ( ! $date ) {
			$date = current_time( 'mysql', true );
		}

		return $this->logger->log_action(
			$session_uuid,
			$message_role,
			$message_id,
			$content,
			$date,
			$parent_message_id,
			$is_test,
			$phase,
			$editor,
			$big_sky_version
		);
	}

	public function log_metadata( WP_REST_Request $request ) {
		$session_uuid = $request->get_param( 'session_uuid' );
		$metadata     = $request->get_json_params();

		return $this->logger->log_metadata( $session_uuid, $metadata );
	}

	public function log_rating( WP_REST_Request $request ) {
		$session_uuid    = $request->get_param( 'session_uuid' );
		$message_id      = $request->get_param( 'message_id' );
		$rating          = $request->get_param( 'rating' );
		$big_sky_version = $request->get_param( 'big_sky_version' ) ?? '0';

		return $this->logger->log_rating( $session_uuid, $message_id, $rating, $big_sky_version );
	}

	public function log_feedback( WP_REST_Request $request ) {
		$session_uuid          = $request->get_param( 'session_uuid' );
		$message_id            = $request->get_param( 'message_id' ) ?? null;
		$feedback              = $request->get_param( 'feedback' );
		$previous_user_message = $request->get_param( 'previous_user_message' ) ?? null;
		$big_sky_version       = $request->get_param( 'big_sky_version' ) ?? '0';

		return $this->logger->log_feedback( $session_uuid, $message_id, $feedback, $previous_user_message, $big_sky_version );
	}

	public function log_wp_orchestrator_rating( WP_REST_Request $request ) {
		$session_uuid    = $request->get_param( 'session_uuid' );
		$message_id      = $request->get_param( 'message_id' );
		$rating          = $request->get_param( 'rating' );
		$metadata        = $request->get_param( 'metadata' ) ?? [];
		$big_sky_version = $request->get_param( 'big_sky_version' ) ?? '0';

		return $this->wp_orchestrator_logger->log_rating( $session_uuid, $message_id, $rating, $metadata, $big_sky_version );
	}

	public function get_mapbox_geo_coordinates( WP_REST_Request $request ) {
		$address = $request->get_param( 'address' );

		if ( ! $address ) {
			return new WP_Error( 'missing_address', 'Address is required', array( 'status' => 400 ) );
		}
		$api_key = apply_filters( 'big_sky_mapbox_token', false );
		if ( ! $api_key ) {
			$api_key = Jetpack_Mapbox_Helper::get_access_token()['key'];
		}

		if ( ! $api_key ) {
			return new WP_Error( 'missing_api_key', 'Mapbox API key is required', array( 'status' => 400 ) );
		}
		$api_response = wp_remote_get(
			'https://api.mapbox.com/search/geocode/v6/forward?access_token=' . $api_key . '&q=' . urlencode( $address )
		);

		return new WP_REST_Response( json_decode( wp_remote_retrieve_body( $api_response ), true ) );
	}

	/**
	 * Whether the Gutenberg plugin APIs this endpoint depends on are loaded.
	 *
	 * Both symbols are provided by the Gutenberg plugin rather than core, and they
	 * can be absent independently across Gutenberg versions, so check each one.
	 *
	 * @return bool
	 */
	protected function has_gutenberg_style_variation_support() {
		return class_exists( 'WP_Theme_JSON_Resolver_Gutenberg' )
			&& function_exists( 'gutenberg_register_block_style_variations_from_theme_json_partials' );
	}

	public function get_variation_templates_colors() {
		if ( ! $this->has_gutenberg_style_variation_support() ) {
			return new WP_Error(
				'gutenberg_not_available',
				'The Gutenberg plugin is required for this endpoint',
				array( 'status' => 501 )
			);
		}

		$partials = WP_Theme_JSON_Resolver_Gutenberg::get_style_variations( 'block' );
		gutenberg_register_block_style_variations_from_theme_json_partials( $partials );
		$variations = WP_Theme_JSON_Resolver_Gutenberg::get_style_variations_from_directory( plugin_dir_path( __FILE__ ) . '/theme-variation-templates' );
		return new WP_REST_Response( $variations );
	}

	public function proxy_anthropic_request( WP_REST_Request $request ) {
		if ( ! $this->anthropic_api_key ) {
			return new WP_Error(
				'missing_api_key',
				'Anthropic API key not configured',
				array( 'status' => 500 )
			);
		}

		$body   = $request->get_json_params();
		$stream = isset( $body['stream'] ) && $body['stream'];

		if ( $stream ) {
			// Set headers for streaming response
			header( 'Content-Type: text/event-stream' );
			header( 'Cache-Control: no-cache' );
			header( 'Connection: keep-alive' );
			header( 'X-Accel-Buffering: no' ); // Disable nginx buffering

			// Make streaming request to Anthropic
			$curl = curl_init();
			curl_setopt_array(
				$curl,
				array(
					CURLOPT_URL            => 'https://api.anthropic.com/v1/messages',
					CURLOPT_RETURNTRANSFER => true,
					CURLOPT_WRITEFUNCTION  => function ( $curl, $data ) {
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SSE data must be passed through unmodified
						echo $data;
						flush();
						ob_flush();
						return strlen( $data );
					},
					CURLOPT_HTTPHEADER     => array(
						'Content-Type: application/json',
						'Accept: text/event-stream',
						'x-api-key: ' . $this->anthropic_api_key,
						'anthropic-version: 2023-06-01',
					),
					CURLOPT_POST           => true,
					CURLOPT_POSTFIELDS     => wp_json_encode( array_merge( $body, array( 'stream' => true ) ) ),
					CURLOPT_TIMEOUT        => 0, // No timeout for streaming
				)
			);

			curl_exec( $curl );
			$error = curl_error( $curl );
			curl_close( $curl );

			if ( $error ) {
				error_log( 'Anthropic streaming error: ' . $error );
			}
			exit;
		}

		// Non-streaming request
		$response = wp_remote_post(
			'https://api.anthropic.com/v1/messages',
			array(
				'headers' => array(
					'content-type'      => 'application/json',
					'x-api-key'         => $this->anthropic_api_key,
					'anthropic-version' => '2023-06-01',
				),
				'body'    => wp_json_encode( $body ),
				'timeout' => 60,
			)
		);

		if ( is_wp_error( $response ) ) {
			return new WP_Error(
				'anthropic_error',
				'Error calling Anthropic API: ' . $response->get_error_message(),
				array( 'status' => 500 )
			);
		}

		$response_body = json_decode( wp_remote_retrieve_body( $response ), true );
		return new WP_REST_Response( $response_body );
	}

	public function get_custom_google_fonts_collection() {
		$fonts_file = dirname( __DIR__ ) . '/assets/google-fonts.json';

		if ( ! file_exists( $fonts_file ) ) {
			return new WP_Error(
				'missing_fonts_file',
				'Google fonts collection file not found',
				array( 'status' => 404 )
			);
		}

		$fonts_data       = file_get_contents( $fonts_file );
		$fonts_collection = json_decode( $fonts_data, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new WP_Error(
				'invalid_json',
				'Error parsing Google fonts collection: ' . json_last_error_msg(),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response( $fonts_collection );
	}
}
