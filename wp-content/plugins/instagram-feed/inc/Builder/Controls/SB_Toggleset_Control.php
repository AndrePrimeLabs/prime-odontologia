<?php

/**
 * Customizer Builder
 * Toggle Set Control
 *
 * @since 4.0
 */

namespace InstagramFeed\Builder\Controls;

if (!defined('ABSPATH')) {
	exit;
}

class SB_Toggleset_Control extends SB_Controls_Base
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
		return 'toggleset';
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
		<div class="sb-control-toggle-set-ctn sbi-fb-fs"
			 role="radiogroup"
			 :aria-label="control.heading || control.label || control.id">
			<div class="sb-control-toggle-elm sbi-fb-fs sb-tr-2" v-for="(toggle, toggleIndex) in control.options"
				 role="radio"
				 :aria-checked="<?php echo $controlEditingTypeModel ?>[control.id] == toggle.value ? 'true' : 'false'"
				 :aria-disabled="toggle.checkExtension != undefined ? !checkExtensionActive(toggle.checkExtension) : false"
				 :tabindex="<?php echo $controlEditingTypeModel ?>[control.id] == toggle.value ? 0 : (toggleIndex === 0 && !control.options.some(function(o){ return o.value == <?php echo $controlEditingTypeModel ?>[control.id]; }) ? 0 : -1)"
				 :data-toggle-value="toggle.value"
				 :data-active="<?php echo $controlEditingTypeModel ?>[control.id] == toggle.value"
				 @click.prevent.default="changeSettingValue(control.id,toggle.value, toggle.checkExtension != undefined ? checkExtensionActive(toggle.checkExtension) : true, control.ajaxAction != undefined ? control.ajaxAction : false)"
				 @keydown.space.prevent="changeSettingValue(control.id,toggle.value, toggle.checkExtension != undefined ? checkExtensionActive(toggle.checkExtension) : true, control.ajaxAction != undefined ? control.ajaxAction : false)"
				 @keydown.enter.prevent="changeSettingValue(control.id,toggle.value, toggle.checkExtension != undefined ? checkExtensionActive(toggle.checkExtension) : true, control.ajaxAction != undefined ? control.ajaxAction : false)"
				 @keydown.left.prevent="onTogglesetArrowKey($event, control, 'prev')"
				 @keydown.up.prevent="onTogglesetArrowKey($event, control, 'prev')"
				 @keydown.right.prevent="onTogglesetArrowKey($event, control, 'next')"
				 @keydown.down.prevent="onTogglesetArrowKey($event, control, 'next')"
				 @keydown.home.prevent="onTogglesetArrowKey($event, control, 'first')"
				 @keydown.end.prevent="onTogglesetArrowKey($event, control, 'last')"
				 v-show="toggle.condition != undefined ? checkControlCondition(toggle.condition) : true"
				 :data-disabled="toggle.checkExtension != undefined ? !checkExtensionActive(toggle.checkExtension) : false">
				<div class="sb-control-toggle-extension-cover" aria-hidden="true"
					 v-show="toggle.checkExtension != undefined && !checkExtensionActive(toggle.checkExtension)"></div>
				<div class="sb-control-toggle-deco sb-tr-1" aria-hidden="true"></div>
				<div class="sb-control-toggle-icon" aria-hidden="true" v-if="toggle.icon" v-html="svgIcons[toggle.icon]"></div>
				<div class="sb-control-label">
					<span v-html="toggle.label"></span>
					<span class="sb-control-label-pro-toggle" v-if="toggle.proLabel">Pro</span>
				</div>
			</div>
		</div>
		<?php
	}
}