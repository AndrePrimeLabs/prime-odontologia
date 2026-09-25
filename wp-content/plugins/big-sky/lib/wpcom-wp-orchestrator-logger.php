<?php
declare( strict_types = 1 );

/**
 * A minimal logger for WP Orchestrator feedback ratings and Slack notifications.
 */
class WPCOM_WP_Orchestrator_Logger {

	/**
	 * @var \WPCOM\AI\Langfuse\Langfuse_Client|null
	 */
	private $langfuse_client = null;

	/**
	 * Valid rating values.
	 */
	private const VALID_RATINGS = [ 'up', 'down' ];

	/**
	 * Langfuse score events for rating feedback.
	 * All events have score value of 1.
	 */
	private const LANGFUSE_RATING_EVENTS = [
		'up'   => 'wp_orchestrator_like_received',
		'down' => 'wp_orchestrator_dislike_received',
	];

	/**
	 * Constructor - initializes Langfuse client if credentials are available.
	 */
	public function __construct() {
		if ( defined( 'WP_ORCHESTRATOR_LANGFUSE_A8C_PUBLIC_KEY' ) && defined( 'WP_ORCHESTRATOR_LANGFUSE_A8C_SECRET_KEY' ) ) {
			$langfuse_client_path = ABSPATH . 'wp-content/lib/ai/langfuse/class.langfuse-client.php';
			if ( file_exists( $langfuse_client_path ) ) {
				require_once $langfuse_client_path;
				$this->langfuse_client = new \WPCOM\AI\Langfuse\Langfuse_Client(
					WP_ORCHESTRATOR_LANGFUSE_A8C_PUBLIC_KEY,
					WP_ORCHESTRATOR_LANGFUSE_A8C_SECRET_KEY,
					'https://langfuse.a8c.com/api/public'
				);
			}
		}
	}

	/**
	 * Log a WP Orchestrator rating and send Slack notification on thumbs down.
	 *
	 * @param string $session_uuid     The session UUID.
	 * @param string $message_id       The agent message ID.
	 * @param string $rating           The rating ('up' or 'down').
	 * @param array  $metadata         Optional metadata (e.g., image_url, mode).
	 * @param string $big_sky_version  The version of the Big Sky plugin.
	 * @return bool|WP_Error True on success, WP_Error on failure.
	 */
	public function log_rating(
		$session_uuid,
		$message_id,
		$rating,
		$metadata = [],
		$big_sky_version = '0'
	) {
		if ( ! $session_uuid ) {
			return new WP_Error( 'wp_orchestrator_session_missing', 'Session UUID not provided' );
		}

		if ( ! $message_id ) {
			return new WP_Error( 'wp_orchestrator_message_id_missing', 'Message ID not provided' );
		}

		if ( ! in_array( $rating, self::VALID_RATINGS, true ) ) {
			return new WP_Error( 'wp_orchestrator_invalid_rating', 'Invalid rating provided' );
		}

		// Send rating to Langfuse for scoring
		$this->send_langfuse_score( $session_uuid, $rating, $message_id, $metadata );

		// Send Slack notification on thumbs down
		if ( 'down' === $rating ) {
			$this->send_slack_notification( $session_uuid, $message_id, $metadata, $big_sky_version );
		}

		return true;
	}

	/**
	 * Send rating score to Langfuse.
	 *
	 * @param string $session_uuid The session UUID.
	 * @param string $rating       The rating ('up' or 'down').
	 * @param string $message_id   The agent message ID.
	 * @param array  $metadata     Optional metadata (e.g., image_url, mode).
	 * @return void
	 */
	private function send_langfuse_score( $session_uuid, $rating, $message_id, $metadata = [] ) {
		if ( ! $this->langfuse_client ) {
			return;
		}

		$event_name = self::LANGFUSE_RATING_EVENTS[ $rating ] ?? null;
		if ( ! $event_name ) {
			return;
		}

		$comment = 'Message: ' . sanitize_text_field( $message_id );
		foreach ( $metadata as $key => $value ) {
			if ( ! empty( $value ) && is_scalar( $value ) ) {
				$sanitized_key   = sanitize_text_field( (string) $key );
				$sanitized_value = sanitize_text_field( (string) $value );
				// Limit value length to prevent excessively long comments
				if ( strlen( $sanitized_value ) > 500 ) {
					$sanitized_value = substr( $sanitized_value, 0, 500 ) . '...';
				}
				$comment .= ", {$sanitized_key}: {$sanitized_value}";
			}
		}

		$this->langfuse_client->create_score(
			$session_uuid,
			'session',
			[
				'name'    => $event_name,
				'value'   => 1,
				'comment' => $comment,
			]
		);
	}

	/**
	 * Send a Slack notification for thumbs down feedback.
	 *
	 * @param string $session_uuid    The session UUID.
	 * @param string $message_id      The agent message ID.
	 * @param array  $metadata        Optional metadata (e.g., image_url, mode).
	 * @param string $big_sky_version The version of the Big Sky plugin.
	 * @return bool|null Result of the Slack notification or null if function not available.
	 */
	private function send_slack_notification( $session_uuid, $message_id, $metadata, $big_sky_version ) {
		if ( ! function_exists( 'a8c_slack' ) ) {
			return null;
		}

		$session_link = "https://langfuse.a8c.com/project/cmixsnvhp000uyh07idn9hukm/sessions/{$session_uuid}";

		$message  = "👎 WP Orchestrator thumbs down received\n";
		$info     = $this->get_user_site_info();
		$message .= "\n*User:* {$info['username']}";
		$message .= "\n*Site:* <{$info['site_url']}|{$info['site_name']}>";

		foreach ( $metadata as $key => $value ) {
			if ( ! empty( $value ) && is_scalar( $value ) ) {
				$sanitized_key   = sanitize_text_field( (string) $key );
				$sanitized_value = sanitize_text_field( (string) $value );
				// Limit value length to prevent excessively long messages
				if ( strlen( $sanitized_value ) > 500 ) {
					$sanitized_value = substr( $sanitized_value, 0, 500 ) . '...';
				}
				$message .= "\n*{$sanitized_key}*: {$sanitized_value}";
			}
		}

		$message .= sprintf(
			"\n\n*Session:* %s\n*Message ID:* %s\n*Big Sky version:* %s",
			$session_link,
			$message_id,
			$big_sky_version
		);

		// Send message to #big-sky-feedback channel (same as Big Sky feedback)
		return a8c_slack( 'C091LBVNVS9', $message, 'wp-orchestrator-feedback-bot' );
	}

	/**
	 * Get current user and site info for Slack messages.
	 *
	 * @return array{username: string, site_name: string, site_url: string}
	 */
	private function get_user_site_info(): array {
		$current_user = wp_get_current_user();
		$site_name    = get_bloginfo( 'name' );
		return array(
			'username'  => $current_user->user_login ? $current_user->user_login : 'unknown',
			'site_name' => $site_name ? $site_name : 'Unknown site',
			'site_url'  => home_url(),
		);
	}
}
