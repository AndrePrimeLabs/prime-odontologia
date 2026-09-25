<?php
namespace Manage\Modules\Api\Components;

use Manage\Modules\Api\Classes\Route;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Optimizations extends Route {

	public function register_routes() {
		register_rest_route( static::NAMESPACE, '/optimizations/database', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'optimize_database' ],
		] );

		register_rest_route( static::NAMESPACE, '/optimizations/cache', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'clear_cache' ],
		] );

		register_rest_route( static::NAMESPACE, '/optimizations/transients', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'cleanup_expired_transients' ],
		] );

		register_rest_route( static::NAMESPACE, '/optimizations/spam-comments', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'cleanup_spam_comments' ],
		] );

		register_rest_route( static::NAMESPACE, '/optimizations/trashed-comments', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'cleanup_trashed_comments' ],
		] );

		register_rest_route( static::NAMESPACE, '/optimizations/auto-drafts', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'cleanup_auto_drafts' ],
		] );

		register_rest_route( static::NAMESPACE, '/optimizations/revisions', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'cleanup_revisions' ],
		] );

		register_rest_route( static::NAMESPACE, '/optimizations/trashed-posts', [
			'methods'  => 'POST',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'cleanup_trashed_posts' ],
		] );
	}

	public function optimize_database() {
		global $wpdb;

		try {
			$tables = $wpdb->get_results( 'SHOW TABLES', ARRAY_N );
			$optimized_tables = [];

			foreach ( $tables as $table ) {
				$table_name = $table[0];
				$result = $wpdb->query(
					$wpdb->prepare( 'OPTIMIZE TABLE `%s`', $table_name )
				);

				if ( false !== $result ) {
					$optimized_tables[] = $table_name;
				}
			}

			return rest_ensure_response( [
				'status' => 'success',
				'message' => 'Database optimization completed successfully.',
				'optimized_tables' => count( $optimized_tables ),
				'tables' => $optimized_tables,
			] );

		} catch ( \Exception $e ) {
			return new \WP_Error(
				'database_optimization_failed',
				'Database optimization failed: ' . $e->getMessage(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}
	}

	public function clear_cache() {
		try {
			// Clear WordPress object cache
			if ( function_exists( 'wp_cache_flush' ) ) {
				wp_cache_flush();
			}

			// Clear opcache if available
			if ( function_exists( 'opcache_reset' ) ) {
				opcache_reset();
			}

			// Clear common caching plugins
			$cache_plugins_cleared = [];

			// WP Rocket
			if ( function_exists( 'rocket_clean_domain' ) ) {
				rocket_clean_domain();
				$cache_plugins_cleared[] = 'WP Rocket';
			}

			// W3 Total Cache
			if ( function_exists( 'w3tc_flush_all' ) ) {
				w3tc_flush_all();
				$cache_plugins_cleared[] = 'W3 Total Cache';
			}

			// WP Super Cache
			if ( function_exists( 'wp_cache_clear_cache' ) ) {
				wp_cache_clear_cache();
				$cache_plugins_cleared[] = 'WP Super Cache';
			}

			// LiteSpeed Cache
			if ( class_exists( 'LiteSpeed\Purge' ) ) {
				\LiteSpeed\Purge::purge_all();
				$cache_plugins_cleared[] = 'LiteSpeed Cache';
			}

			// Elementor Cache
			if ( class_exists( '\Elementor\Plugin' ) ) {
				if ( method_exists( '\Elementor\Plugin', 'instance' ) ) {
					$elementor = \Elementor\Plugin::instance();

					if ( isset( $elementor->files_manager ) && method_exists( $elementor->files_manager, 'clear_cache' ) ) {
						$elementor->files_manager->clear_cache();
					}
				}

				$cache_plugins_cleared[] = 'Elementor';
			}

			return rest_ensure_response( [
				'status' => 'success',
				'message' => 'Cache cleared successfully.',
				'cache_plugins_cleared' => $cache_plugins_cleared,
			] );

		} catch ( \Exception $e ) {
			return new \WP_Error(
				'cache_clear_failed',
				'Cache clearing failed: ' . $e->getMessage(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}
	}

	public function cleanup_expired_transients() {
		global $wpdb;

		try {
			$current_time = time();
			$deleted_transients = 0;

			$timeout_options = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT option_name, option_value FROM {$wpdb->options} 
						WHERE option_name LIKE %s 
						AND option_value < %d",
					'_transient_timeout_%',
					$current_time
				)
			);

			foreach ( $timeout_options as $timeout_option ) {
				$transient_name = str_replace( '_transient_timeout_', '', $timeout_option->option_name );

				$deleted_timeout = $wpdb->delete(
					$wpdb->options,
					[ 'option_name' => $timeout_option->option_name ],
					[ '%s' ]
				);

				$deleted_transient = $wpdb->delete(
					$wpdb->options,
					[ 'option_name' => '_transient_' . $transient_name ],
					[ '%s' ]
				);

				if ( $deleted_timeout || $deleted_transient ) {
					$deleted_transients++;
				}
			}

			if ( is_multisite() ) {
				$site_timeout_options = $wpdb->get_results(
					$wpdb->prepare(
						"SELECT option_name, option_value FROM {$wpdb->options} 
							WHERE option_name LIKE %s 
							AND option_value < %d",
						'_site_transient_timeout_%',
						$current_time
					)
				);

				foreach ( $site_timeout_options as $timeout_option ) {
					$transient_name = str_replace( '_site_transient_timeout_', '', $timeout_option->option_name );

					$deleted_timeout = $wpdb->delete(
						$wpdb->options,
						[ 'option_name' => $timeout_option->option_name ],
						[ '%s' ]
					);

					$deleted_transient = $wpdb->delete(
						$wpdb->options,
						[ 'option_name' => '_site_transient_' . $transient_name ],
						[ '%s' ]
					);

					if ( $deleted_timeout || $deleted_transient ) {
						$deleted_transients++;
					}
				}
			}

			return rest_ensure_response( [
				'status' => 'success',
				'message' => 'Expired transients cleanup completed successfully.',
				'deleted_transients' => $deleted_transients,
			] );

		} catch ( \Exception $e ) {
			return new \WP_Error(
				'transients_cleanup_failed',
				'Transients cleanup failed: ' . $e->getMessage(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}
	}

	public function cleanup_spam_comments() {
		global $wpdb;

		try {
			$spam_comments = $wpdb->get_results(
				"SELECT comment_ID FROM {$wpdb->comments} WHERE comment_approved = 'spam'"
			);

			$spam_count = count( $spam_comments );

			if ( 0 === $spam_count ) {
				return rest_ensure_response( [
					'status' => 'success',
					'message' => 'No spam comments found to cleanup.',
					'deleted_comments' => 0,
				] );
			}

			$deleted_comments = 0;
			foreach ( $spam_comments as $comment ) {
				if ( wp_delete_comment( $comment->comment_ID, true ) ) {
					$deleted_comments++;
				}
			}

			return rest_ensure_response( [
				'status' => 'success',
				'message' => 'Spam comments cleanup completed successfully.',
				'deleted_comments' => $deleted_comments,
				'spam_comments_found' => $spam_count,
			] );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'spam_comments_cleanup_failed',
				'Spam comments cleanup failed: ' . $e->getMessage(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}
	}

	public function cleanup_trashed_comments() {
		global $wpdb;

		try {
			$trashed_comments = $wpdb->get_results(
				"SELECT comment_ID FROM {$wpdb->comments} WHERE comment_approved = 'trash'"
			);

			$trashed_count = count( $trashed_comments );

			if ( 0 === $trashed_count ) {
				return rest_ensure_response( [
					'status' => 'success',
					'message' => 'No trashed comments found to cleanup.',
					'deleted_comments' => 0,
				] );
			}

			$deleted_comments = 0;
			foreach ( $trashed_comments as $comment ) {
				if ( wp_delete_comment( $comment->comment_ID, true ) ) {
					$deleted_comments++;
				}
			}

			return rest_ensure_response( [
				'status' => 'success',
				'message' => 'Trashed comments cleanup completed successfully.',
				'deleted_comments' => $deleted_comments,
				'trashed_comments_found' => $trashed_count,
			] );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'trashed_comments_cleanup_failed',
				'Trashed comments cleanup failed: ' . $e->getMessage(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}
	}

	public function cleanup_auto_drafts() {
		global $wpdb;

		try {
			$auto_drafts = $wpdb->get_results(
				"SELECT ID FROM {$wpdb->posts} WHERE post_status = 'auto-draft'"
			);

			$auto_drafts_count = count( $auto_drafts );

			if ( 0 === $auto_drafts_count ) {
				return rest_ensure_response( [
					'status' => 'success',
					'message' => 'No auto drafts found to cleanup.',
					'deleted_posts' => 0,
				] );
			}

			$deleted_posts = 0;
			foreach ( $auto_drafts as $post ) {
				if ( wp_delete_post( $post->ID, true ) ) {
					$deleted_posts++;
				}
			}

			return rest_ensure_response( [
				'status' => 'success',
				'message' => 'Auto drafts cleanup completed successfully.',
				'deleted_posts' => $deleted_posts,
				'auto_drafts_found' => $auto_drafts_count,
			] );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'auto_drafts_cleanup_failed',
				'Auto drafts cleanup failed: ' . $e->getMessage(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}
	}

	public function cleanup_revisions() {
		global $wpdb;

		try {
			$revisions = $wpdb->get_results(
				"SELECT ID FROM {$wpdb->posts} WHERE post_type = 'revision'"
			);

			$revisions_count = count( $revisions );

			if ( 0 === $revisions_count ) {
				return rest_ensure_response( [
					'status' => 'success',
					'message' => 'No revisions found to cleanup.',
					'deleted_posts' => 0,
				] );
			}

			$deleted_posts = 0;
			foreach ( $revisions as $post ) {
				if ( wp_delete_post( $post->ID, true ) ) {
					$deleted_posts++;
				}
			}

			return rest_ensure_response( [
				'status' => 'success',
				'message' => 'Revisions cleanup completed successfully.',
				'deleted_posts' => $deleted_posts,
				'revisions_found' => $revisions_count,
			] );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'revisions_cleanup_failed',
				'Revisions cleanup failed: ' . $e->getMessage(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}
	}

	public function cleanup_trashed_posts() {
		global $wpdb;

		try {
			$trashed_posts = $wpdb->get_results(
				"SELECT ID FROM {$wpdb->posts} WHERE post_status = 'trash'"
			);

			$trashed_posts_count = count( $trashed_posts );

			if ( 0 === $trashed_posts_count ) {
				return rest_ensure_response( [
					'status' => 'success',
					'message' => 'No trashed posts found to cleanup.',
					'deleted_posts' => 0,
				] );
			}

			$deleted_posts = 0;
			foreach ( $trashed_posts as $post ) {
				if ( wp_delete_post( $post->ID, true ) ) {
					$deleted_posts++;
				}
			}

			return rest_ensure_response( [
				'status' => 'success',
				'message' => 'Trashed posts cleanup completed successfully.',
				'deleted_posts' => $deleted_posts,
				'trashed_posts_found' => $trashed_posts_count,
			] );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'trashed_posts_cleanup_failed',
				'Trashed posts cleanup failed: ' . $e->getMessage(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}
	}
}
