<?php

namespace InstagramFeed\Integrations\Elementor;

use InstagramFeed\Vendor\Smashballoon\Framework\Packages\Blocks\SB_Elementor_Feed_Widget;
use InstagramFeed\Builder\SBI_Db;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( '\Elementor\Widget_Base' ) ) {
	return;
}

class SBI_Modern_Elementor_Widget extends SB_Elementor_Feed_Widget {

	protected function get_widget_name() {
		return 'sb-instagram-feed';
	}

	protected function get_widget_title() {
		return __( 'Instagram Feed', 'instagram-feed' );
	}

	protected function get_widget_icon() {
		return 'sb-elem-icon sb-elem-instagram';
	}

	protected function get_shortcode_tag() {
		return 'instagram-feed';
	}

	protected function get_feeds_options() {
		return SBI_Db::elementor_feeds_query();
	}

	protected function get_text_domain() {
		return 'instagram-feed';
	}

	protected function get_script_deps() {
		return array( 'sbi_scripts', 'sb-elementor-editor' );
	}

	protected function get_style_deps() {
		return array( 'sbi_styles', 'sb-elementor-editor' );
	}

	protected function get_output_filter() {
		return 'sbi_output';
	}
}
