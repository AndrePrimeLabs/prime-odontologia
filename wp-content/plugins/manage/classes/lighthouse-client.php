<?php
namespace Manage\Classes;

use ElementorOne\Connect\Classes\GrantTypes;
use Manage\Modules\Connect\Module as Connect;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Lighthouse_Client extends Platform_Client {
	private static ?Lighthouse_Client $instance = null;

	protected static function get_api_path(): string {
		return apply_filters( 'manage/lighthouse_api_base_url', 'performance-metrics/api/v1/' );
	}

	protected static function get_grant_type(): string {
		return GrantTypes::REFRESH_TOKEN;
	}

	public static function get_instance(): Lighthouse_Client {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function get_site_performance( array $categories = [ 'performance', 'seo', 'accessibility' ], bool $force = false ) {
		$connect_data = Connect::get_connect()->data();
		$site_id = $connect_data->get_client_id();

		return $this->make_request(
			'POST',
			'site-performance',
			[
				'siteId' => $site_id,
				'categories' => $categories,
				'force' => $force,
			],
			[],
			true
		);
	}
}
