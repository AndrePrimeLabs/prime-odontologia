<?php
namespace Manage\Modules\Api;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Manage\Classes\Module_Base;

class Module extends Module_Base {

	public function get_name(): string {
		return 'api';
	}

	protected function __construct() {
		$components = [
			'Site_State',
			'Core',
			'Plugins',
			'Themes',
			'Optimizations',
			'Login',
			'Site_Health',
			'Wporg',
		];

		$this->register_components( $components );
	}
}
