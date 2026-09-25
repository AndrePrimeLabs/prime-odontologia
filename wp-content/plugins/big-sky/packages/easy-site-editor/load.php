<?php
/**
 * Big Sky-hosted Easy Site Editor loader.
 *
 * @package EasySiteEditor
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'Easy_Site_Editor' ) ) {
	return;
}

if ( ! defined( 'BIG_SKY_HOSTED_EASY_SITE_EDITOR' ) ) {
	define( 'BIG_SKY_HOSTED_EASY_SITE_EDITOR', true );
}

$easy_site_editor_file = __DIR__ . '/easy-site-editor.php';
if ( file_exists( $easy_site_editor_file ) ) {
	require_once $easy_site_editor_file;
}
