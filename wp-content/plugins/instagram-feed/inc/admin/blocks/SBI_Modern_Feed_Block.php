<?php

namespace InstagramFeed\Admin\Blocks;

use InstagramFeed\Vendor\Smashballoon\Framework\Packages\Blocks\SB_Feed_Block;
use InstagramFeed\Builder\SBI_Db;

class SBI_Modern_Feed_Block extends SB_Feed_Block {

	protected function get_block_name() {
		return 'smashballoon/instagram-feed';
	}

	protected function get_shortcode_tag() {
		return 'instagram-feed';
	}

	protected function get_script_handle() {
		return 'sb-feed-blocks';
	}

	protected function get_text_domain() {
		return 'instagram-feed';
	}

	protected function get_plugin_dir() {
		return trailingslashit( SBI_PLUGIN_DIR );
	}

	protected function get_enqueue_scripts_action() {
		return 'sbi_enqueue_scripts';
	}

	protected function get_localize_var_name() {
		return 'sbiInstagramFeedBlock';
	}

	protected function get_feed_block_id() {
		return 'instagram';
	}

	protected function get_init_function() {
		return 'sbi_init';
	}

	protected function get_block_dir() {
		return $this->get_plugin_dir() . 'vendor/smashballoon/framework/Packages/Blocks/dist/feed-blocks/instagram';
	}

	protected function get_editor_localize_data() {
		$feeds = SBI_Db::feeds_query();

		return array(
			'feeds'    => ! empty( $feeds ) ? $feeds : array(),
			'feed_url' => admin_url( 'admin.php?page=sbi-feed-builder' ),
			'nonce'    => wp_create_nonce( 'sbi-blocks' ),
		);
	}

	public function register_hooks() {
		add_action( 'sbi_enqueue_scripts', 'sb_instagram_scripts_enqueue' );
		parent::register_hooks();

		// Parent hooks register_block to init@10, but we're called during init@10
		// so that hook may be skipped. Call directly.
		if ( doing_action( 'init' ) || did_action( 'init' ) ) {
			$this->register_block();
		}

		remove_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ), 25 );
	}
}
