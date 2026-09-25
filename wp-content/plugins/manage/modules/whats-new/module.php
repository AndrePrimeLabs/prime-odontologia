<?php

namespace Manage\Modules\Whats_new;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\WPNotificationsPackage\V120\Notifications;
use Manage\Classes\Module_Base;

/**
 * Module `Example`
 *
 * A module is responsible over a specific part of the app logic,
 * Typically it is constructed by a main Module class (the class in this file) and components (e.g. `A_Component)
 * depending on its role, it may have additional parts such as `database` or `rest` etc'
 *
 * Please describe the role of your module.
 *
 */
class Module extends Module_Base {

	public function get_name(): string {
		return 'whats-new';
	}

	protected function __construct() {
		new Notifications( [
			'app_name' => 'manage',
			'app_version' => MANAGE_VERSION,
			'short_app_name' => 'manage',
			'app_data' => [
				'plugin_basename' => MANAGE_PLUGIN_BASE,
			],
		] );
	}
}
