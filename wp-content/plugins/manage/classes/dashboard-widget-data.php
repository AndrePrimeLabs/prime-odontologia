<?php
namespace Manage\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dashboard_Widget_Data {

	private const EMPTY_DEVICE_SCORES = [
		'performance' => null,
		'seo' => null,
		'accessibility' => null,
	];

	public function get_performance_summary(): array {
		$default = [
			'lastScanned' => null,
			'status' => 'unavailable',
			'desktop' => self::EMPTY_DEVICE_SCORES,
			'mobile' => self::EMPTY_DEVICE_SCORES,
			'error' => false,
		];

		$response = Lighthouse_Client::get_instance()->get_site_performance();

		if ( is_wp_error( $response ) ) {
			if ( \WP_Http::UNPROCESSABLE_ENTITY === $response->get_error_code() ) {
				return array_merge( $default, [ 'status' => 'in_progress' ] );
			}

			return array_merge( $default, [ 'error' => true ] );
		}

		$report = $response->report ?? null;

		if ( empty( $report ) ) {
			return array_merge( $default, [ 'status' => 'in_progress' ] );
		}

		return [
			'lastScanned' => $response->timestamp ?? null,
			'status' => 'completed',
			'desktop' => $this->map_device_scores( $report->desktop ?? null ),
			'mobile' => $this->map_device_scores( $report->mobile ?? null ),
			'error' => false,
		];
	}

	public function get_updates_summary(): array {
		return [
			'pluginsCount' => Site_Updates_Data::get_plugins_update_count(),
			'themesCount' => Site_Updates_Data::get_themes_update_count(),
			'coreHasUpdate' => Site_Updates_Data::get_core_has_update(),
			'coreVersion' => Site_Updates_Data::get_core_installed_version_when_outdated(),
		];
	}

	public function get_vulnerabilities_summary(): array {
		$plugins = Site_Updates_Data::get_plugins_for_vulnerability_check();

		if ( empty( $plugins ) ) {
			return [
				'count' => 0,
				'error' => false,
				'items' => [],
			];
		}

		$response = Vulnerability_Client::get_instance()->check_plugins( $plugins );

		if ( is_wp_error( $response ) ) {
			return [
				'count' => 0,
				'error' => true,
				'items' => [],
			];
		}

		$items = $this->collect_vulnerabilities( $response, $plugins );

		return [
			'count' => count( $items ),
			'error' => false,
			'items' => $items,
		];
	}

	public function get_all(): array {
		return [
			'performance' => $this->get_performance_summary(),
			'updates' => $this->get_updates_summary(),
			'vulnerabilities' => $this->get_vulnerabilities_summary(),
		];
	}

	private function map_device_scores( $device_report ): array {
		if ( empty( $device_report ) ) {
			return self::EMPTY_DEVICE_SCORES;
		}

		$scores = (array) $device_report;

		return [
			'performance' => isset( $scores['performanceScore'] ) ? (int) $scores['performanceScore'] : null,
			'seo' => isset( $scores['seoScore'] ) ? (int) $scores['seoScore'] : null,
			'accessibility' => isset( $scores['accessibilityScore'] ) ? (int) $scores['accessibilityScore'] : null,
		];
	}

	private function collect_vulnerabilities( $response, array $plugins ): array {
		$items = [];

		if ( empty( $response->plugins ) || ! is_object( $response->plugins ) ) {
			return $items;
		}

		foreach ( $response->plugins as $slug => $plugin_vulnerabilities ) {
			if ( ! is_array( $plugin_vulnerabilities ) ) {
				continue;
			}

			$installed_versions = $plugins[ $slug ]['versions'] ?? [];

			foreach ( $plugin_vulnerabilities as $vulnerability ) {
				if ( ! $this->vulnerability_matches_installed_versions( $vulnerability, $installed_versions ) ) {
					continue;
				}

				$items[] = $this->map_vulnerability_item( $vulnerability );
			}
		}

		return $items;
	}

	private function vulnerability_matches_installed_versions( $vulnerability, array $installed_versions ): bool {
		if ( empty( $installed_versions ) ) {
			return false;
		}

		$vulnerability_data = (array) $vulnerability;
		$matched_versions = $vulnerability_data['matchedVersions'] ?? [];

		if ( ! is_array( $matched_versions ) ) {
			return false;
		}

		return ! empty( array_intersect( $installed_versions, $matched_versions ) );
	}

	private function map_vulnerability_item( $vulnerability ): array {
		$vulnerability_data = (array) $vulnerability;

		return [
			'id' => $vulnerability_data['id'] ?? '',
			'title' => $vulnerability_data['title'] ?? '',
			'description' => $vulnerability_data['description'] ?? '',
			'patchPriority' => isset( $vulnerability_data['patchPriority'] ) ? (int) $vulnerability_data['patchPriority'] : null,
			'directUrl' => $vulnerability_data['directUrl'] ?? '',
		];
	}
}
