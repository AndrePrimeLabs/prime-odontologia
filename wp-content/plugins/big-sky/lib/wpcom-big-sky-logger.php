<?php
declare( strict_types = 1 );

require_once __DIR__ . '/big-sky-logger.php';

/**
 * A logger which log natively on WPCOM to the big_sky_sessions and big_sky_actions tables.
 */
class WPCOM_Big_Sky_Logger extends Big_Sky_Logger {

	/**
	 * @var \WPCOM\AI\Langfuse\Langfuse_Client|null
	 */
	private $langfuse_client = null;

	/**
	 * Whitelist of valid user behaviour events for Langfuse tracking
	 * All events currently have score value of 1
	 */
	private const LANGFUSE_USER_BEHAVIOUR_EVENTS = [
		'phase_sitespec_completed' => 1,
		'phase_openconv_engaged'   => 1,
		'like_received'            => 1,
		'dislike_received'         => 1,
	];

	public function __construct() {
		if ( defined( 'BIGSKY_LANGFUSE_A8C_SECRET_KEY' ) && defined( 'BIGSKY_LANGFUSE_A8C_PUBLIC_KEY' ) ) {
			require_once ABSPATH . 'wp-content/lib/ai/langfuse/class.langfuse-client.php';
			$this->langfuse_client = new \WPCOM\AI\Langfuse\Langfuse_Client(
				BIGSKY_LANGFUSE_A8C_PUBLIC_KEY,
				BIGSKY_LANGFUSE_A8C_SECRET_KEY,
				'https://langfuse.a8c.com/api/public'
			);
		}
	}

	private function get_session_id( $session_uuid ) {
		// TODO: memcached
		global $wpdb;

		return $wpdb->get_var(
			$wpdb->prepare(
				'SELECT big_sky_session_id FROM big_sky_sessions WHERE session_uuid = %s',
				$session_uuid
			)
		);
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
		global $wpdb;

		if ( ! $session_uuid ) {
			$this->log_generic_logger_error_to_logstash( 'Error logging session! No session_uuid provided.', $wpdb->last_error );
			return false;
		}

		$_blog_id = get_current_blog_id();
		$_user_id = get_current_user_id();

		// find the session
		$session_id = $this->get_session_id( $session_uuid );

		// if no session found, insert a new one
		if ( ! $session_id ) {
			if ( ! $name || ! $date ) {
				$this->log_generic_logger_error_to_logstash( 'Error logging session! Missing required fields.', $wpdb->last_error );
				return;
			}
			$result = $wpdb->insert(
				'big_sky_sessions',
				[
					'session_uuid'    => $session_uuid,
					'name'            => $name,
					'date'            => $date,
					'user_id'         => $_user_id,
					'blog_id'         => $_blog_id,
					'is_test'         => $is_test,
					'big_sky_version' => $big_sky_version,
				]
			);

			if ( false === $result ) {
				$this->log_generic_logger_error_to_logstash( 'Error logging session! ' . $session_uuid . ' ' . $name, $wpdb->last_error );
			}

			// return the ID of the inserted row for later association
			return $wpdb->insert_id;
		} else {
			$result = $wpdb->update(
				'big_sky_sessions',
				[
					'name'    => $name,
					'is_test' => $is_test,
				],
				[
					'big_sky_session_id' => $session_id,
				]
			);

			if ( false === $result ) {
				$this->log_generic_logger_error_to_logstash( 'Error updating session! ' . $session_uuid . ' ' . $name, $wpdb->last_error );
			}

			return $session_id;
		}
	}

	/**
	 * Log an action to the big_sky_actions table.
	 *
	 * @param string       $session_uuid The session UUID.
	 * @param string       $message_role The message type.
	 * @param string       $message_id The message ID.
	 * @param string|array $payload The content of the message.
	 * @param string       $date The date of the message.
	 * @param string       $parent_message_id The parent message ID.
	 * @param string       $phase The phase the user is in i.e. onboarding, editor. Same as tracks.
	 * @param string       $editor The editor the user is in i.e. site-editor, post.
	 * @param string       $big_sky_version The version of the Big Sky plugin.
	 */
	public function log_action(
		$session_uuid,
		$message_role,
		$message_id,
		$payload,
		$date,
		$parent_message_id,
		$is_test = false,
		$phase = null,
		$editor = null,
		$big_sky_version = '0',
	) {
		global $wpdb;

		if ( ! $session_uuid ) {
			$this->log_generic_logger_error_to_logstash( 'Error logging session! No session_uuid provided.', $wpdb->last_error );
			return new WP_Error( 'big_sky_session_missing', 'Session UUID not provided' );
		}

		$_blog_id = get_current_blog_id();
		$_user_id = get_current_user_id();

		// find the session
		$session_id = $this->get_session_id( $session_uuid );

		if ( ! $session_id ) {
			$session_id = $this->log_session( $session_uuid, 'New Session', current_time( 'mysql' ), $is_test, $big_sky_version );

			if ( ! $session_id ) {
				$this->log_generic_logger_error_to_logstash( 'Error creating session for session_uuid ' . $session_uuid, $wpdb->last_error );
				return new WP_Error( 'big_sky_session_not_found', 'Session not found' );
			}
		}

		$content = is_string( $payload ) ? $payload : json_encode( $payload );

		// Handle special langfuse user behaviour events
		if ( $message_role === 'langfuse_user_behaviour' ) {
			$this->handle_langfuse_user_behaviour( $session_uuid, $content, $message_id );
			return; // Skip database persistence
		}

		// These are app errors, aka errors that users encounter.
		if ( 'error' === $message_role ) {
			$user_agent = $this->parse_user_agent( isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '' );

			$logstash_params = array(
				'feature'         => 'big-sky-action',
				'message'         => $content,
				'browser_name'    => $user_agent->browser,
				'browser_version' => $user_agent->browser_version,
				'properties'      => array(
					'platform'          => $user_agent->platform,
					'session_id'        => $session_uuid,
					'message_id'        => $message_id,
					'message_role'      => $message_role,
					'parent_message_id' => $parent_message_id,
					'phase'             => $phase,
					'editor'            => $editor,
					'big_sky_version'   => $big_sky_version,
				),
				'severity'        => $is_test ? 'warning' : 'error',
				'blog_id'         => $_blog_id,
				'user_id'         => $_user_id,
			);
			$this->log_to_logstash( $logstash_params );
		}

		$parent_action_id = $parent_message_id ?
			$wpdb->get_var(
				$wpdb->prepare(
					'SELECT big_sky_action_id FROM big_sky_actions WHERE message_id = %s',
					$parent_message_id
				)
			) : 0;

		$action_data = [
			'blog_id'            => $_blog_id,
			'user_id'            => $_user_id,
			'big_sky_session_id' => $session_id,
			'parent_id'          => $parent_action_id,
			'date'               => $date,
			'content'            => $content,
			'message_type'       => $message_role,
			'message_id'         => strval( $message_id ),
		];
		$result      = $wpdb->insert(
			'big_sky_actions',
			$action_data
		);

		// Maybe count this action for metered usage.
		$this->maybe_bump_metered_usage(
			[
				'phase'        => $phase,
				'message_role' => $message_role,
				'blog_id'      => $_blog_id,
			]
		);

		if ( false === $result ) {
			$this->log_generic_logger_error_to_logstash( 'Error logging action! ' . $message_id . ' ' . $content, $wpdb->last_error );
		}

		// return the ID of the inserted row for later association
		return $wpdb->insert_id;
	}

	public function log_rating(
		$session_uuid,
		$message_id,
		$rating,
		$big_sky_version = '0', // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable
	) {
		global $wpdb;

		if ( ! $message_id ) {
			$this->log_generic_logger_error_to_logstash( 'Error logging feedback! No message_id provided.', $wpdb->last_error );
			return new WP_Error( 'big_sky_session_missing', 'message_id not provided' );
		}

		$_blog_id = get_current_blog_id();
		$_user_id = get_current_user_id();

		if ( empty( self::RATING_MAP[ $rating ] ) ) {
			$this->log_generic_logger_error_to_logstash( 'Error logging feedback! Invalid rating provided.', $wpdb->last_error );
			return new WP_Error( 'big_sky_invalid_rating', 'Invalid rating provided' );
		}

		$result = $wpdb->update(
			'big_sky_actions',
			[
				'rating' => self::RATING_MAP[ $rating ],
			],
			[
				'blog_id'    => $_blog_id,
				'message_id' => $message_id,
			],
			[
				'%d',
			],
			[
				'%d',
				'%s',
			]
		);
		if ( $result ) {
			// Send rating event to Langfuse
			$event_name = $rating === 'up' ? 'like_received' : 'dislike_received';
			$this->handle_langfuse_user_behaviour( $session_uuid, $event_name, $message_id );
			return $result;
		}

		// Check if action already exists, it might be that the rating didn't change and wpdb::update returns 0.
		$action = $wpdb->get_row(
			$wpdb->prepare(
				'SELECT * FROM big_sky_actions WHERE blog_id = %d AND message_id = %s',
				$_blog_id,
				$message_id
			)
		);
		if ( $action ) {
			return 1; // Rating was already set, nothing to do.
		}

		// find the session
		$session_id = $this->get_session_id( $session_uuid );

		if ( ! $session_id ) {
			// Don't both trying to create a session for a rating with no matching action.
			return new WP_Error( 'big_sky_session_not_found', 'Session not found' );
		}

		// This is a fallback for when the original message id is not found.
		// In this case, it will create a new message with rating.
		$result = $wpdb->insert(
			'big_sky_actions',
			[
				'big_sky_session_id' => $session_id,
				'message_id'         => strval( $message_id ),
				'rating'             => self::RATING_MAP[ $rating ],
				'blog_id'            => $_blog_id,
				'user_id'            => $_user_id,
				'date'               => current_time( 'mysql' ),
				'content'            => 'Feedback received: ' . $rating,
			]
		);

		if ( $result ) {
			// Send rating event to Langfuse
			$event_name = $rating === 'up' ? 'like_received' : 'dislike_received';
			$this->handle_langfuse_user_behaviour( $session_uuid, $event_name, $message_id );
		}

		return $result;
	}

	public function log_feedback( $session_uuid, $message_id, $feedback, $previous_user_message = null, $big_sky_version = '0' ) {
		$session_link = "https://mc.a8c.com/big-sky/session/?session_uuid={$session_uuid}";

		// Build message with optional previous user message
		$message = "👎 Thumbs down feedback received\n";

		if ( ! empty( $previous_user_message ) ) {
			$message .= "\n👤 User message: " . $previous_user_message . "\n";
		}
		$message .= "\n💬 User feedback: " . $feedback . "\n";

		$message .= sprintf(
			"\nSession: %s\nMessage ID: %s\nBig Sky version: %s",
			$session_link,
			$message_id,
			$big_sky_version
		);

		// Send message to #big-sky-feedback channel (for testing use the C0A170HU5TN channel, #big-sky-feedback-test)
		return a8c_slack( 'C091LBVNVS9', $message, 'thumbs-down-feedback-bot' );
	}

	/**
	 * Handle metered usage tracking when an action is logged.
	 *
	 * @param array $args {
	 *     Arguments passed from the action hook.
	 *
	 *     @type string $phase        The current phase (e.g. 'editor').
	 *     @type string $message_role The role of the message (e.g. 'user').
	 *     @type int    $blog_id      The blog ID to track usage for.
	 * }
	 */
	public function maybe_bump_metered_usage( $args ) {
		if ( ! class_exists( 'Big_Sky_Metered_Usage' ) ) {
			return;
		}

		$phase        = $args['phase'] ?? null;
		$message_role = $args['message_role'] ?? null;
		$blog_id      = $args['blog_id'] ?? null;

		if ( 'onboarding' === $phase ) {
			return;
		}

		if ( 'user' !== $message_role && 'user_choice' !== $message_role ) {
			return;
		}

		$metered_usage = new Big_Sky_Metered_Usage();
		if ( ! $metered_usage::has_unlimited_usage( $blog_id ) ) {
			$metered_usage->bump( $blog_id, 0 );
		}
	}

	/**
	 * Copied from https://github.a8c.com/Automattic/wpcom/blob/8d58c99c00d329a70ffc5955096ca4921954ccb3/wp-content/admin-plugins/js-errors/js-errors.php#L85
	 */
	private function parse_user_agent( $agent ) {
		// phpcs:disable
		$meta = new stdClass();
		$meta->browser = null;
		$meta->browser_version = null;
		$meta->platform = null;

		if ( false !== stripos( $agent, 'msie' ) ) {
			$meta->browser = 'IE';
			if ( preg_match( '!msie ([\d\.]+);!i', $agent, $matches ) )
				$meta->browser_version = $matches[1];

		} elseif ( false !== stripos( $agent, 'chrome' ) ) {
			$meta->browser = 'Chrome';
			if ( preg_match( '!chrome/([\d\.]+)!i', $agent, $matches ) )
				$meta->browser_version = $matches[1];

		} elseif ( false !== stripos( $agent, 'safari' ) ) {
			$meta->browser = 'Safari';
			if ( preg_match( '!version([ /])([\d\.]+)!i', $agent, $matches ) || preg_match( '!safari/([\d\.]+)!i', $agent, $matches ) )
				$meta->browser_version = $matches[1];

		} elseif ( false !== stripos( $agent, 'firefox' ) ) {
			$meta->browser = 'Firefox';
			if ( preg_match( '!firefox/([\d\.]+)!i', $agent, $matches ) )
				$meta->browser_version = $matches[1];

		} elseif ( false !== stripos( $agent, 'opera' ) ) {
			$meta->browser = 'Opera';
			if ( preg_match( '!version([ /])([\d\.]+)!i', $agent, $matches ) || preg_match( '!opera([ /])([\d\.]+)!i', $agent, $matches ) )
				$meta->browser_version = $matches[2];
		} else {
			$meta->browser = $agent;
		}

		if ( false !== stripos( $agent, 'windows' ) ) {
			$meta->platform = 'Win';
		} elseif ( false !== stripos( $agent, 'mac' ) ) {
			$meta->platform = 'Mac';
		}
		// phpcs:enable

		return $meta;
	}
	/**
	 * Log metadata to the big_sky_site_metadata table.
	 *
	 * @param string $session_uuid The session UUID.
	 * @param array  $metadata The metadata to log.
	 */
	public function log_metadata( $session_uuid, $metadata ) {
		global $wpdb;

		$big_sky_version = $metadata['big_sky_version'] ?? '0';

		if ( ! $session_uuid ) {
			$this->log_generic_logger_error_to_logstash( 'Error logging metadata! No session_uuid provided.', $wpdb->last_error );
			return new WP_Error( 'big_sky_session_missing', 'Session UUID not provided' );
		}

		$_blog_id = get_current_blog_id();

		// find the session
		$session_id = $this->get_session_id( $session_uuid );

		if ( ! $session_id ) {
			// Create a new session
			$session_id = $this->log_session( $session_uuid, 'New Session', current_time( 'mysql' ), false, $big_sky_version );

			if ( ! $session_id ) {
				$this->log_generic_logger_error_to_logstash( 'Error creating session for session_uuid ' . $session_uuid, $wpdb->last_error );
				return new WP_Error( 'big_sky_session_not_found', 'Session not found' );
			}
		}

		$result = $wpdb->insert(
			'big_sky_site_metadata',
			[
				'big_sky_session_id' => $session_id,
				'blog_id'            => $_blog_id,
				'date'               => current_time( 'mysql' ),
				'content'            => json_encode( $metadata ),
			]
		);

		if ( false === $result ) {
			$this->log_generic_logger_error_to_logstash( 'Error logging metadata!', $wpdb->last_error );
		}

		return $wpdb->insert_id;
	}

	private function log_generic_logger_error_to_logstash( $message = '', $extra = '' ) {
		$params = array(
			'feature'  => 'big-sky-session-logger',
			'message'  => $message,
			'extra'    => $extra,
			'severity' => 'error',
		);
		$this->log_to_logstash( $params );
	}

	private function log_to_logstash( $logstash_params ) {
		if ( defined( 'IS_WPCOM' ) && IS_WPCOM ) { // Shouldn't be needed, but just in case
			require_lib( 'log2logstash' );
			log2logstash( $logstash_params );
		}
	}

	/**
	 * Handle langfuse user behaviour events
	 * Special message type for tracking user behaviour analytics in Langfuse
	 *
	 * @param string $session_id The session UUID
	 * @param string $event_id The event identifier from the content field
	 * @param string|null $message_id Optional message ID for additional context
	 * @return void
	 */
	private function handle_langfuse_user_behaviour( $session_id, $event_id, $message_id = null ) {
		if ( ! $this->langfuse_client ) {
			return;
		}

		// Validate event against whitelist
		if ( ! isset( self::LANGFUSE_USER_BEHAVIOUR_EVENTS[ $event_id ] ) ) {
			return;
		}

		$this->langfuse_client->create_score(
			$session_id,
			'session',
			[
				'name'    => $event_id,
				'value'   => self::LANGFUSE_USER_BEHAVIOUR_EVENTS[ $event_id ],
				'comment' => $message_id ? "Message: {$message_id}" : null,
			]
		);
	}
}
