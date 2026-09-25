<?php
namespace Manage\Modules\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Manage\Classes\Module_Base;

class Module extends Module_Base {

	const SETTING_BASE_SLUG = 'manage-settings';

	public function get_name(): string {
		return 'settings';
	}

	protected function __construct() {
		$this->register_components( [
			'Page',
			'Routes',
			'Pointer',
		] );
	}
}
