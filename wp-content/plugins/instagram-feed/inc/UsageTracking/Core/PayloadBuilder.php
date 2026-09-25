<?php
/**
 * Builds the full usage report payload (schema_version, site_token, snapshot, dynamic_metrics).
 *
 * @package InstagramFeed\UsageTracking\Core
 * @since 6.10
 */

namespace InstagramFeed\UsageTracking\Core;

use InstagramFeed\UsageTracking\Config;
use InstagramFeed\UsageTracking\ReporterInterface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PayloadBuilder {

	/**
	 * @var ReporterInterface
	 */
	private $reporter;

	/**
	 * @param ReporterInterface $reporter Plugin-specific reporter.
	 */
	public function __construct( ReporterInterface $reporter ) {
		$this->reporter = $reporter;
	}

	/**
	 * Build the full payload for the usage-report endpoint.
	 *
	 * @param string $site_token   Site token from RegisterSite.
	 * @param string $period_start Period start (e.g. Y-m-d).
	 * @param string $period_end   Period end (e.g. Y-m-d).
	 * @return array
	 */
	public function build( $site_token, $period_start, $period_end ) {
		$payload_id      = $this->generate_payload_id();
		$slug            = $this->reporter->get_plugin_slug();
		$snapshot        = $this->reporter->get_configuration_snapshot();
		$license_tier    = isset( $snapshot['license_tier'] ) ? $snapshot['license_tier'] : 'free';
		$license_status  = isset( $snapshot['license_status'] ) ? $snapshot['license_status'] : null;
		$license_expires = isset( $snapshot['license_expires'] ) ? $snapshot['license_expires'] : null;
		$license_item_id = isset( $snapshot['license_item_id'] ) ? $snapshot['license_item_id'] : null;
		$version         = isset( $snapshot['version'] ) ? $snapshot['version'] : (defined( 'SBIVER' ) ? SBIVER : '');
		unset( $snapshot['license_tier'], $snapshot['license_status'], $snapshot['license_expires'], $snapshot['license_item_id'], $snapshot['version'] );

		$type = (function_exists( 'sbi_is_pro_version' ) && sbi_is_pro_version()) ? 'pro' : 'free';

		$dynamic_metrics = $this->reporter->get_dynamic_metrics( $period_start, $period_end );
		$errors          = isset( $dynamic_metrics['errors'] ) ? $dynamic_metrics['errors'] : array();
		unset( $dynamic_metrics['errors'] );

		return array(
			'schema_version'         => $this->reporter->get_schema_version(),
			'plugin'                 => $slug,
			'type'                   => $type,
			'site_token'             => $site_token,
			'payload_id'             => $payload_id,
			'period_start'           => $period_start,
			'period_end'             => $period_end,
			'plugin_info'            => array(
				'slug'            => 'instagram',
				'version'         => $version,
				'license_tier'    => $license_tier,
				'license_status'  => $license_status,
				'license_expires' => $license_expires,
				'license_item_id' => $license_item_id,
			),
			'configuration_snapshot' => $snapshot,
			'errors'                 => $errors,
			'dynamic_metrics'        => $dynamic_metrics,
			'active_plugins'         => $this->get_active_plugins(),
			'active_theme'           => $this->get_active_theme(),
		);
	}

	/**
	 * Generate a unique payload ID (UUID v4 style).
	 *
	 * @return string
	 */
	private function generate_payload_id() {
		if ( function_exists( 'wp_generate_uuid4' ) ) {
			return wp_generate_uuid4();
		}
		return sprintf(
			'%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
			wp_rand( 0, 0xffff ),
			wp_rand( 0, 0xffff ),
			wp_rand( 0, 0xffff ),
			wp_rand( 0, 0x0fff ) | 0x4000,
			wp_rand( 0, 0x3fff ) | 0x8000,
			wp_rand( 0, 0xffff ),
			wp_rand( 0, 0xffff ),
			wp_rand( 0, 0xffff )
		);
	}

	private function get_active_plugins(): array {
		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$all_plugins      = get_plugins();
		$active_basenames = array_merge(
			(array) get_option( 'active_plugins', array() ),
			array_keys( (array) get_site_option( 'active_sitewide_plugins', array() ) )
		);

		$result = array();
		foreach ( array_unique( $active_basenames ) as $basename ) {
			if ( ! isset( $all_plugins[ $basename ] ) ) {
				continue;
			}
			$data     = $all_plugins[ $basename ];
			$result[] = array(
				'slug'    => $basename,
				'name'    => isset( $data['Name'] ) ? sanitize_text_field( (string) $data['Name'] ) : null,
				'version' => isset( $data['Version'] ) ? sanitize_text_field( (string) $data['Version'] ) : null,
				'author'  => isset( $data['Author'] ) ? wp_strip_all_tags( (string) $data['Author'] ) : null,
			);
		}

		return $result;
	}

	private function get_active_theme(): ?array {
		$theme = wp_get_theme();
		if ( ! $theme->exists() ) {
			return null;
		}
		return array(
			'name'    => sanitize_text_field( (string) $theme->get( 'Name' ) ),
			'version' => sanitize_text_field( (string) $theme->get( 'Version' ) ),
		);
	}
}
