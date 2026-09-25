<?php

/**
 * Customizer Builder
 * CheckBox List Control
 *
 * @since 4.0
 */

namespace InstagramFeed\Builder\Controls;

if (!defined('ABSPATH')) {
	exit;
}

class SB_Checkboxlist_Control extends SB_Controls_Base
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
		return 'checkboxlist';
	}

	/**
	 * Output Control
	 *
	 * @return void
	 * @since 4.0
	 * @access public
	 */
	public function get_control_output($controlEditingTypeModel)
	{
		?>
		<div role="group" :aria-label="control.heading || control.label">
			<button type="button" class="sb-control-checkbox-ctn sbi-fb-fs" v-for="option in control.options"
					role="checkbox"
					:aria-checked="<?php echo $controlEditingTypeModel ?>[control.id].includes(option.value) ? 'true' : 'false'"
					:aria-label="option.label"
					@click.prevent="changeCheckboxListValue(control.id, option.value)">
				<span class="sb-control-checkbox" aria-hidden="true"
					  :data-active="<?php echo $controlEditingTypeModel ?>[control.id].includes(option.value)"></span>
				<span class="sb-control-label sb-small-p sb-dark-text" aria-hidden="true" v-html="option.label"></span>
			</button>
		</div>
		<?php
	}
}