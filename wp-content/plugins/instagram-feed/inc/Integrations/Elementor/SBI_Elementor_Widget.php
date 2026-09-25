<?php

namespace InstagramFeed\Integrations\Elementor;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;
use InstagramFeed\Builder\SBI_Db;
use InstagramFeed\Integrations\SBI_Integration;
use InstagramFeed\Vendor\Smashballoon\Framework\Packages\Blocks\SB_Block_Utils;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Class SBI_Elementor_Widget
 *
 * @since 6.2.9
 */
class SBI_Elementor_Widget extends Widget_Base
{
	/**
	 * Get widget name.
	 *
	 * Retrieve Instagram Feed widget name.
	 *
	 * @return string Widget name.
	 * @since 6.2.9
	 * @access public
	 */
	public function get_name()
	{
		return 'sbi-widget';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve Instagram Feed widget title.
	 *
	 * @return string Widget title.
	 * @since 6.2.9
	 * @access public
	 */
	public function get_title()
	{
		return esc_html__('Instagram Feed', 'instagram-feed');
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve Instagram Feed widget icon.
	 *
	 * @return string Widget icon.
	 * @since 6.2.9
	 * @access public
	 */
	public function get_icon()
	{
		return 'sb-elem-icon sb-elem-instagram';
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the Instagram Feed widget belongs to.
	 *
	 * @return array Widget categories.
	 * @since 6.2.9
	 * @access public
	 */
	public function get_categories()
	{
		return array( SB_Block_Utils::CATEGORY_SLUG );
	}

	/**
	 * Hide this legacy widget from the Elementor panel.
	 *
	 * @return bool
	 */
	public function show_in_panel()
	{
		return false;
	}

	/**
	 * Hide this legacy widget from Elementor search results.
	 *
	 * @return bool
	 */
	public function hide_on_search()
	{
		return true;
	}

	/**
	 * Script dependencies.
	 *
	 * Declares the script handles this legacy widget depends on. The modern
	 * `SBI_Elementor_Base::register_frontend_scripts()` registers `sbi_scripts`
	 * via `sb_instagram_scripts_enqueue()`; the old `sbiscripts` / `elementor-preview`
	 * handles are no longer registered by this plugin.
	 *
	 * @return array Widget scripts dependencies.
	 * @since 6.2.9
	 * @access public
	 */
	public function get_script_depends()
	{
		return array( 'sbi_scripts' );
	}

	/**
	 * Register Instagram Feed widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 6.2.9
	 * @access protected
	 */
	protected function register_controls()
	{
		$this->start_controls_section(
			'section_content',
			array(
				'label' => esc_html__( 'Instagram Feed Settings', 'instagram-feed' ),
			)
		);

		$this->add_control(
			'feed_id',
			array(
				'label'       => esc_html__( 'Select a Feed', 'instagram-feed' ),
				'type'        => Controls_Manager::SELECT,
				'label_block' => true,
				'dynamic'     => array( 'active' => true ),
				'options'     => SBI_Db::elementor_feeds_query( true ),
				'default'     => 0,
				'description' => esc_html__( 'Select a feed to display. If you don\'t have any feeds yet then you can create one in the Instagram Feed settings page.', 'instagram-feed' ),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render Instagram Feed widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 6.2.9
	 * @access protected
	 */
	protected function render()
	{
		$settings = $this->get_settings_for_display();

		if (!empty($settings['feed_id']) && $settings['feed_id'] != 0) {
			$output = do_shortcode(shortcode_unautop('[instagram-feed feed=' . $settings['feed_id'] . ']'));
		} else {
			$output = is_admin() ? SBI_Integration::get_widget_cta() : esc_html__('No feed selected to display.', 'instagram-feed');
		}

		echo apply_filters('sbi_output', $output, $settings);
	}
}
