<?php

/**
 * Customizer Builder
 * Toggle Buttons
 *
 * @since 4.0
 */

namespace InstagramFeed\Builder\Controls;

if (!defined('ABSPATH')) {
	exit;
}

class SB_Togglebutton_Control extends SB_Controls_Base
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
		return 'togglebutton';
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
		<div class="sb-control-togglebutton-ctn sbi-fb-fs"
			 role="radiogroup"
			 :aria-label="control.heading || control.label || control.id">
			<div class="sb-control-togglebutton-elm sbi-fb-fs sb-tr-1" v-for="(toggle, toggleIndex) in control.options"
				 role="radio"
				 :aria-checked="<?php echo $controlEditingTypeModel ?>[control.id] == toggle.value ? 'true' : 'false'"
				 :tabindex="<?php echo $controlEditingTypeModel ?>[control.id] == toggle.value ? 0 : (toggleIndex === 0 && !control.options.some(function(o){ return o.value == <?php echo $controlEditingTypeModel ?>[control.id]; }) ? 0 : -1)"
				 :data-toggle-value="toggle.value"
				 :data-active="<?php echo $controlEditingTypeModel ?>[control.id] == toggle.value"
				 v-show="toggle.condition != undefined ? checkControlCondition(toggle.condition) : true"
				 @click.prevent.default="changeSettingValue(control.id,toggle.value, true)"
				 @keydown.space.prevent="changeSettingValue(control.id,toggle.value, true)"
				 @keydown.enter.prevent="changeSettingValue(control.id,toggle.value, true)"
				 @keydown.left.prevent="onTogglesetArrowKey($event, control, 'prev')"
				 @keydown.up.prevent="onTogglesetArrowKey($event, control, 'prev')"
				 @keydown.right.prevent="onTogglesetArrowKey($event, control, 'next')"
				 @keydown.down.prevent="onTogglesetArrowKey($event, control, 'next')"
				 @keydown.home.prevent="onTogglesetArrowKey($event, control, 'first')"
				 @keydown.end.prevent="onTogglesetArrowKey($event, control, 'last')">
				{{toggle.label}}
			</div>
		</div>

		<?php
	}
}