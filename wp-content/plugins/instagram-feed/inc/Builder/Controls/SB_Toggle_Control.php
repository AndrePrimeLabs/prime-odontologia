<?php

/**
 * Customizer Builder
 * Toggle Control
 *
 * @since 4.0
 */

namespace InstagramFeed\Builder\Controls;

if (!defined('ABSPATH')) {
	exit;
}

class SB_Toggle_Control extends SB_Controls_Base
{
	/**
	 * Get control type.
	 *
	 * Getting the Control Type
	 *
	 * @return string
	 * @since 4.0
	 * @access public
	 */
	public function get_type()
	{
		return 'toggle';
	}

	/**
	 * Output Control
	 *
	 * @return HTML
	 * @since 4.0
	 * @access public
	 */
	public function get_control_output($controlEditingTypeModel)
	{
		?>
		<div class="sb-control-toggle-ctn sbi-fb-fs">
			<div class="sb-control-toggle-elm sbi-fb-fs sb-tr-2" data-active="true">
				<span class="sb-control-toggle-deco sb-tr-1" aria-hidden="true"></span>
				<span class="sb-control-toggle-icon" aria-hidden="true" v-if="control.toggle.icon"
					  v-html="svgIcons[control.toggle.icon]"></span>
				<span class="sb-control-label">{{control.toggle.label}}</span>
			</div>
		</div>
		<?php
	}
}