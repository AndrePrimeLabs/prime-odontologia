<?php
namespace Manage\Modules\Api\Components;

use Manage\Modules\Api\Classes\Route;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Site_Health extends Route {

	public function register_routes() {
		register_rest_route( static::NAMESPACE, '/site-health', [
			'methods'  => 'GET',
			'permission_callback' => [ $this, 'token_authentication' ],
			'callback' => [ $this, 'get_site_health_details' ],
		] );
	}

	public function get_site_health_details() {
		if ( ! class_exists( 'WP_Site_Health' ) ) {
			require_once ABSPATH . 'wp-admin/includes/admin.php';
			require_once ABSPATH . 'wp-admin/includes/class-wp-site-health.php';
		}

		if ( ! function_exists( 'get_core_updates' ) ) {
			require_once ABSPATH . 'wp-admin/includes/update.php';
		}

		if ( ! function_exists( 'wp_check_php_version' ) ) {
			require_once ABSPATH . 'wp-admin/includes/misc.php';
		}

		$site_health = \WP_Site_Health::get_instance();
		$tests = \WP_Site_Health::get_tests();
		$results = [];

		foreach ( $tests['direct'] as $test_key => $test ) {
			if ( ! empty( $test['skip_cron'] ) ) {
				continue;
			}

			$test_result = null;

			if ( is_string( $test['test'] ) ) {
				$test_function = sprintf( 'get_test_%s', $test['test'] );

				if ( method_exists( $site_health, $test_function ) && is_callable( [ $site_health, $test_function ] ) ) {
					$test_result = $this->execute_test_with_error_handling( [ $site_health, $test_function ], $test );
				}
			} elseif ( is_callable( $test['test'] ) ) {
				$test_result = $this->execute_test_with_error_handling( $test['test'], $test );
			}

			if ( $test_result ) {
				$test_result['test_key'] = $test_key;
				$test_result['test_label'] = $test['label'];
				$results[] = $test_result;
			}
		}

		foreach ( $tests['async'] as $test_key => $test ) {
			if ( ! empty( $test['skip_cron'] ) ) {
				continue;
			}

			$test_result = null;

			if ( ! empty( $test['async_direct_test'] ) && is_callable( $test['async_direct_test'] ) ) {
				$test_result = $this->execute_test_with_error_handling( $test['async_direct_test'], $test );
			}

			if ( $test_result ) {
				$test_result['test_key'] = $test_key;
				$test_result['test_label'] = $test['label'];
				$results[] = $test_result;
			}
		}

		$summary_counts = [
			'total' => 0,
			'good' => 0,
			'recommended' => 0,
			'critical' => 0,
		];

		foreach ( $results as $result ) {
			$summary_counts['total']++;

			if ( isset( $result['status'] ) && is_string( $result['status'] ) ) {
				$status = $result['status'];
				if ( array_key_exists( $status, $summary_counts ) ) {
					$summary_counts[ $status ]++;
				}
			}
		}

		return rest_ensure_response( [
			'status' => 'success',
			'data' => [
				'tests' => $results,
				'summary' => $summary_counts,
			],
		] );
	}

	private function execute_test_with_error_handling( $test_function, $test ) {
		try {
			return call_user_func( $test_function );
		} catch ( \Exception $e ) {
			return [
				'status' => 'recommended',
				'label' => $test['label'],
				'description' => 'Test could not be completed',
			];
		}
	}
}
