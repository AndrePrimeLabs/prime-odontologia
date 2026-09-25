<?php

/**
 * Customizer Builder
 * CheckBox Section Control
 *
 * @since 4.0
 */

namespace InstagramFeed\Builder\Controls;

if (!defined('ABSPATH')) {
	exit;
}

class SB_Checkboxsection_Control extends SB_Controls_Base
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
		return 'checkboxsection';
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
		<div class="sb-control-checkboxsection-header" v-if="control.header">
			<div class="sb-control-checkboxsection-name">
				<span aria-hidden="true" v-html="svgIcons['preview']"></span>
				<strong class="">{{genericText.name}}</strong>
			</div>
			<strong>{{genericText.edit}}</strong>
		</div>
		<div class="sb-control-checkbox-ctn sbi-fb-fs" role="group" :aria-label="control.heading || control.label">
			<span class="sb-control-checkbox-hover sb-tr-2" aria-hidden="true"></span>
			<button type="button"
					class="sb-control-checkbox"
					role="checkbox"
					:aria-checked="checkboxSectionValueExists(control.id, control.value) ? 'true' : 'false'"
					:aria-label="control.label"
					@click.stop.prevent.default="changeCheckboxSectionValue(control.id, control.value)"
					:data-active="checkboxSectionValueExists(control.id, control.value)"></button>
			<button type="button"
					class="sb-control-checkboxsection-open sbi-fb-fs"
					:aria-controls="control.section && control.section.id ? control.section.id : null"
					:aria-label="control.label"
					@click.prevent.default="switchNestedSection(control.section.id, control.section)"
					:data-active="checkboxSectionValueExists(control.id, control.value)">
				<strong class="sb-control-label">{{control.label}}</strong>
				<span class="sb-control-checkboxsection-btn" aria-hidden="true"></span>
			</button>
		</div>
		<?php
	}
}