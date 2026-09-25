<?php
namespace Manage\Modules\Api\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Optimization_Stats {

	public static function get_auto_drafts_count(): int {
		global $wpdb;

		try {
			$auto_drafts = $wpdb->get_var(
				"SELECT COUNT(ID) FROM {$wpdb->posts} WHERE post_status = 'auto-draft'"
			);

			return (int) $auto_drafts;
		} catch ( \Exception $e ) {
			return 0;
		}
	}

	public static function get_spam_comments_count(): int {
		global $wpdb;

		try {
			$spam_comments = $wpdb->get_var(
				"SELECT COUNT(comment_ID) FROM {$wpdb->comments} WHERE comment_approved = 'spam'"
			);

			return (int) $spam_comments;
		} catch ( \Exception $e ) {
			return 0;
		}
	}

	public static function get_trashed_comments_count(): int {
		global $wpdb;

		try {
			$trashed_comments = $wpdb->get_var(
				"SELECT COUNT(comment_ID) FROM {$wpdb->comments} WHERE comment_approved = 'trash'"
			);

			return (int) $trashed_comments;
		} catch ( \Exception $e ) {
			return 0;
		}
	}

	public static function get_revisions_count(): int {
		global $wpdb;

		try {
			$revisions = $wpdb->get_var(
				"SELECT COUNT(ID) FROM {$wpdb->posts} WHERE post_type = 'revision'"
			);

			return (int) $revisions;
		} catch ( \Exception $e ) {
			return 0;
		}
	}

	public static function get_trashed_posts_count(): int {
		global $wpdb;

		try {
			$trashed_posts = $wpdb->get_var(
				"SELECT COUNT(ID) FROM {$wpdb->posts} WHERE post_status = 'trash'"
			);

			return (int) $trashed_posts;
		} catch ( \Exception $e ) {
			return 0;
		}
	}

	public static function get_expired_transients_count(): int {
		global $wpdb;

		try {
			$current_time = time();
			$expired_count = 0;

			// Count regular expired transients
			$timeout_options = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(*) FROM {$wpdb->options} 
					WHERE option_name LIKE %s 
					AND option_value < %d",
					'_transient_timeout_%',
					$current_time,
				)
			);

			$expired_count += (int) $timeout_options;

			// Count site transients if multisite
			if ( is_multisite() ) {
				$site_timeout_options = $wpdb->get_var(
					$wpdb->prepare(
						"SELECT COUNT(*) FROM {$wpdb->options} 
						WHERE option_name LIKE %s 
						AND option_value < %d",
						'_site_transient_timeout_%',
						$current_time,
					)
				);

				$expired_count += (int) $site_timeout_options;
			}

			return $expired_count;
		} catch ( \Exception $e ) {
			return 0;
		}
	}

	public static function get_all_stats(): array {
		return [
			'auto_drafts' => self::get_auto_drafts_count(),
			'spam_comments' => self::get_spam_comments_count(),
			'trashed_comments' => self::get_trashed_comments_count(),
			'revisions' => self::get_revisions_count(),
			'trashed_posts' => self::get_trashed_posts_count(),
			'expired_transients' => self::get_expired_transients_count(),
		];
	}
}
