<?php

/**
 * Customizer Builder
 * CheckBox Control
 *
 * @since 4.0
 */

namespace InstagramFeed\Builder\Controls;

if (!defined('ABSPATH')) {
	exit;
}

class SB_Checkbox_Control extends SB_Controls_Base
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
		return 'checkbox';
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
		<button type="button" class="sb-control-checkbox-ctn sbi-fb-fs"
				role="checkbox"
				:aria-checked="((control.custom != undefined && control.custom == 'feedtype') ? <?php echo $controlEditingTypeModel ?>['type'].includes(control.value) : <?php echo $controlEditingTypeModel ?>[control.id] == control.options.enabled) ? 'true' : 'false'"
				:aria-label="control.heading || control.label"
				@click.prevent.default="(control.custom != undefined && control.custom == 'feedtype') ?  changeCheckboxSectionValue('type', control.value, 'feedFlyPreview') : changeSwitcherSettingValue(control.id, control.options.enabled, control.options.disabled, control.ajaxAction != undefined ? control.ajaxAction : false)">
			<span class="sb-control-checkbox" aria-hidden="true"
				  :data-active="(control.custom != undefined && control.custom == 'feedtype') ? <?php echo $controlEditingTypeModel ?>['type'].includes(control.value) : <?php echo $controlEditingTypeModel ?>[control.id] == control.options.enabled"></span>
			<span class="sb-control-label" :data-title="control.labelStrong ? 'true' : false">{{control.label}}</span>
		</button>
		<?php
	}
}