<?php

namespace Manage;

use Manage\Classes\Module_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

final class Manager {
	/**
	 * @var Module_Base[]
	 */
	private array $modules = [];

	public static function get_module_list(): array {
		return [
			'Whats_New',
			'Api',
			'Connect',
			'Settings',
			'Core',
		];
	}

	/**
	 * @codeCoverageIgnore
	 */
	public function __construct() {
		$modules = self::get_module_list();

		foreach ( $modules as $module_name ) {
			$class_name = str_replace( '-', ' ', $module_name );
			$class_name = str_replace( ' ', '', ucwords( $class_name ) );
			$class_name = __NAMESPACE__ . '\\Modules\\' . $class_name . '\Module';

			/** @var Module_Base $class_name */
			if ( $class_name::is_active() ) {
				$this->modules[ $module_name ] = $class_name::instance();
			}
		}
	}

	/**
	 * @param string $module_name
	 *
	 * @return null|Module_Base|Module_Base[]
	 */
	public function get_modules( string $module_name = '' ) {
		if ( $module_name ) {
			return $this->modules[ $module_name ] ?? null;
		}

		return $this->modules;
	}
}
