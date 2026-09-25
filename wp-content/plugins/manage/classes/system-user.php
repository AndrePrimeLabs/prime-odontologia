<?php
namespace Manage\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class System_User {

	const STATUS_USER_NOT_EXISTS = 'user_not_exists';

	const STATUS_USER_NO_PERMISSIONS = 'user_no_permissions';

	const STATUS_OK = 'ok';

	public static function get_system_user(): ?\WP_User {
		$users = get_users( [
			'meta_key' => '_manage_system_user',
			'meta_value' => 'yes',
		] );

		if ( empty( $users ) || ! is_array( $users ) ) {
			return null;
		}

		return $users[0];
	}

	public static function get_user_status( $system_user = null ): string {
		if ( ! $system_user ) {
			$system_user = self::get_system_user();
		}

		if ( ! $system_user ) {
			return self::STATUS_USER_NOT_EXISTS;
		}

		if ( ! user_can( $system_user, 'manage_options' ) ) {
			return self::STATUS_USER_NO_PERMISSIONS;
		}

		return self::STATUS_OK;
	}

	private static function create_system_user() {
		$username = 'manage-system-user';
		$password = wp_generate_password( 64, true, true );

		$user_id = wp_insert_user( [
			'user_login' => $username,
			'user_pass' => $password,
			'role' => 'administrator',
		] );

		if ( is_wp_error( $user_id ) ) {
			return $user_id;
		}

		$user_metas = [
			'_manage_system_user' => 'yes',
			'_manage_system_user_created_at' => current_time( 'mysql' ),
		];

		foreach ( $user_metas as $meta_key => $meta_value ) {
			update_user_meta( $user_id, $meta_key, $meta_value );
		}

		return get_user_by( 'id', $user_id );
	}

	private static function fix_system_user_permissions() {
		$system_user = self::get_system_user();

		if ( ! $system_user ) {
			return new \WP_Error( 'user_not_exists', esc_html__( 'System user does not exist.', 'manage' ) );
		}

		if ( ! user_can( $system_user, 'manage_options' ) ) {
			$system_user->set_role( 'administrator' );
			return true;
		}

		return new \WP_Error( 'user_already_has_permissions', esc_html__( 'System user already has administrator permissions.', 'manage' ) );
	}

	public static function autofix_system_user() {
		$system_user = static::get_system_user();
		$user_status = static::get_user_status( $system_user );

		if ( static::STATUS_OK === $user_status ) {
			return true;
		}

		if ( static::STATUS_USER_NOT_EXISTS === $user_status ) {
			$system_user = static::create_system_user();

			if ( is_wp_error( $system_user ) ) {
				return $system_user;
			}

			return true;
		}

		if ( static::STATUS_USER_NO_PERMISSIONS === $user_status ) {
			$is_updated = static::fix_system_user_permissions();

			if ( is_wp_error( $is_updated ) ) {
				return $is_updated;
			}
		}

		return true;
	}
}
