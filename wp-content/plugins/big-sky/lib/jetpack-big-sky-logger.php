<?php
declare( strict_types = 1 );

require_once __DIR__ . '/big-sky-logger.php';

class Jetpack_Big_Sky_Logger extends Big_Sky_Logger {
	public function log_rating( $session_uuid, $message_id, $rating, $big_sky_version = '0' ) {
		// check class exists
		if ( ! class_exists( 'Automattic\Jetpack\Connection\Client' ) ) {
			throw new Exception( 'Jetpack not loaded' );
		}

		$blog_id = \Jetpack_Options::get_option( 'id' );
		$this->register_shutdown_function_with_request_data(
			[
				'message_id'      => $message_id,
				'rating'          => $rating,
				'big_sky_version' => $big_sky_version,
			],
			sprintf( '/sites/%d/big-sky/v1/session/%s/rate', $blog_id, urlencode( $session_uuid ) ),
			'wpcom',
			'POST'
		);

		return true;
	}
	/**
	 * Log a session to the big_sky_sessions table. If run twice, it updates the name.
	 *
	 * @param string $session_uuid The session UUID.
	 * @param string $name The session name.
	 * @param string $date The session date.
	 * @param bool   $is_test Whether the session is a test session.
	 * @param string $big_sky_version The version of the Big Sky plugin.
	 */
	public function log_session( $session_uuid, $name, $date, $is_test = false, $big_sky_version = '0' ) {
		// check class exists
		if ( ! class_exists( 'Automattic\Jetpack\Connection\Client' ) ) {
			throw new Exception( 'Jetpack not loaded' );
		}

		$blog_id = \Jetpack_Options::get_option( 'id' );

		$request_data = [
			'name'            => $name,
			'date'            => $date,
			'is_test'         => $is_test,
			'big_sky_version' => $big_sky_version,
		];

		$this->register_shutdown_function_with_request_data(
			$request_data,
			sprintf( '/sites/%d/big-sky/v1/session/%s', $blog_id, urlencode( $session_uuid ) ),
			'wpcom',
			'POST'
		);

		return true;
	}

	/**
	 * Log an action to the big_sky_actions table.
	 *
	 * @param string $session_uuid The session UUID.
	 * @param string $message_role The message type.
	 * @param string $message_id The message ID.
	 * @param string $content The content of the message.
	 * @param string $date The date of the message.
	 * @param string $parent_message_id The parent message ID.
	 * @param string $phase The phase of the message.
	 * @param string $editor The editor of the message.
	 * @param string $big_sky_version The version of the Big Sky plugin.
	 */
	public function log_action(
		$session_uuid,
		$message_role,
		$message_id,
		$content,
		$date,
		$parent_message_id,
		$is_test = false,
		$phase = null,
		$editor = null,
		$big_sky_version = '0'
	) {
		// check class exists
		if ( ! class_exists( 'Automattic\Jetpack\Connection\Client' ) ) {
			throw new Exception( 'Jetpack not loaded' );
		}

		$blog_id = \Jetpack_Options::get_option( 'id' );

		$request_data = [
			'message_type'      => $message_role,
			'message_id'        => $message_id,
			'content'           => $content,
			'date'              => $date,
			'parent_message_id' => $parent_message_id,
			'is_test'           => $is_test,
			'phase'             => $phase,
			'editor'            => $editor,
			'big_sky_version'   => $big_sky_version,
		];

		$this->register_shutdown_function_with_request_data(
			$request_data,
			sprintf( '/sites/%d/big-sky/v1/session/%s/action', $blog_id, urlencode( $session_uuid ) ),
			'wpcom',
			'POST'
		);

		return true;
	}

	public function log_feedback( $session_uuid, $message_id, $feedback, $previous_user_message = null, $big_sky_version = '0' ) {
		// check class exists
		if ( ! class_exists( 'Automattic\Jetpack\Connection\Client' ) ) {
			throw new Exception( 'Jetpack not loaded' );
		}

		$blog_id = \Jetpack_Options::get_option( 'id' );

		$request_data = [
			'message_id'            => $message_id,
			'feedback'              => $feedback,
			'previous_user_message' => $previous_user_message,
			'big_sky_version'       => $big_sky_version,
		];

		$this->register_shutdown_function_with_request_data(
			$request_data,
			sprintf( '/sites/%d/big-sky/v1/session/%s/feedback', $blog_id, urlencode( $session_uuid ) ),
			'wpcom',
			'POST'
		);

		return true;
	}

	/**
	 * Log metadata to the big_sky_site_metadata table.
	 *
	 * @param string $session_uuid The session UUID.
	 * @param array  $metadata The metadata to log.
	 */
	public function log_metadata( $session_uuid, $metadata ) {
		// check class exists
		if ( ! class_exists( 'Automattic\Jetpack\Connection\Client' ) ) {
			throw new Exception( 'Jetpack not loaded' );
		}

		$blog_id = \Jetpack_Options::get_option( 'id' );

		$this->register_shutdown_function_with_request_data(
			$metadata,
			sprintf( '/sites/%d/big-sky/v1/session/%s/metadata', $blog_id, urlencode( $session_uuid ) ),
			'wpcom',
			'POST'
		);

		return true;
	}

	/**
	 * Register a shutdown function with request data.
	 *
	 * @param array  $request_data The request data.
	 * @param string $endpoint The API endpoint.
	 * @param string $context The request context.
	 * @param string $method The request method.
	 */
	private function register_shutdown_function_with_request_data( $request_data, $endpoint, $context, $method ) {
		register_shutdown_function(
			function () use ( $request_data, $endpoint, $context, $method ) {
				Automattic\Jetpack\Connection\Client::wpcom_json_api_request_as_user(
					$endpoint,
					'2',
					[
						'method'  => $method,
						// 'headers' => $headers,
						'timeout' => 120,
					],
					$request_data,
					$context
				);
			}
		);
	}
}
