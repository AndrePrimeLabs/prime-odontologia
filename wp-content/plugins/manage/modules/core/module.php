<?php

namespace Manage\Modules\Core;

use Manage\Classes\Module_Base;
use Manage\Modules\Connect\Module as Connect;
use Manage\Modules\Settings\Module as Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends Module_Base {

	public function get_name(): string {
		return 'core';
	}

	public function add_plugin_links( $links, $plugin_file_name ): array {
		if ( ! str_ends_with( $plugin_file_name, '/manage.php' ) ) {
			return (array) $links;
		}

		$custom_links = [
			'dashboard' => sprintf(
				'<a href="%s">%s</a>',
				admin_url( 'admin.php?page=' . Settings::SETTING_BASE_SLUG ),
				esc_html__( 'Dashboard', 'manage' )
			),
		];

		if ( ! Connect::is_connected() ) {
			$custom_links['connect'] = sprintf(
				'<a href="%s" style="color: #524CFF; font-weight: 700;">%s</a>',
				admin_url( 'admin.php?page=' . Settings::SETTING_BASE_SLUG ),
				esc_html__( 'Connect', 'manage' )
			);
		}

		return array_merge( $custom_links, $links );
	}

	/**
	 * Module constructor.
	 */
	public function __construct() {
		$this->register_components( [
			'Not_Connected',
			'Pointers',
			'Dashboard_Widget',
		] );

		add_filter( 'plugin_action_links', [ $this, 'add_plugin_links' ], 10, 2 );
	}
}
