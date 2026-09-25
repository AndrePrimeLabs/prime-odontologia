<?php
namespace Manage\Modules\Connect\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Class Config
 */
class Config {
	const APP_NAME = 'manage';
	const APP_PREFIX = 'manage';
	const APP_REST_NAMESPACE = 'manage/v1';
	const PLUGIN_SLUG = 'manage';
	const BASE_URL = 'https://my.elementor.com/connect';
	const ADMIN_PAGE = 'manage-settings';
	const APP_TYPE = 'app_manage';
	const SCOPES = 'openid offline_access share_usage_data';
	const STATE_NONCE = 'manage_auth_nonce';
	const CONNECT_MODE = 'site';
}
