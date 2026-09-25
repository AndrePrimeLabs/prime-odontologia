<?php InstagramFeed\Builder\SB_Builder_Customizer::register_controls(); ?>
	<div class="sb-customizer-sidebar"
		 v-bind:class="{ 'sb-onboarding-highlight' : viewsActive.onboardingStep === 2 || viewsActive.onboardingStep === 3 }">
		<div class="sb-customizer-sidebar-sec1 sbi-fb-fs">
			<div class="sb-customizer-sidebar-tab-ctn sbi-fb-fs" v-if="customizerScreens.activeSection == null"
				 role="tablist" :aria-label="genericText.customizerTabs">
				<button type="button" class="sb-customizer-sidebar-tab" v-for="tab in customizerSidebarBuilder"
					 :key="tab.id"
					 :id="'sb-customizer-tab-' + tab.id"
					 role="tab"
					 :aria-selected="customizerScreens.activeTab == tab.id ? 'true' : 'false'"
					 :aria-controls="'sb-customizer-tabpanel-' + tab.id"
					 :tabindex="customizerScreens.activeTab == tab.id ? 0 : -1"
					 :data-active="customizerScreens.activeTab == tab.id"
					 @click.prevent.default="switchCustomizerTab(tab.id)"
					 @keydown.right.prevent="handleCustomizerTabKeydown($event, 'right')"
					 @keydown.left.prevent="handleCustomizerTabKeydown($event, 'left')"
					 @keydown.home.prevent="handleCustomizerTabKeydown($event, 'home')"
					 @keydown.end.prevent="handleCustomizerTabKeydown($event, 'end')"><span class="sb-standard-p sb-bold">{{tab.heading}}</span>
				</button>
			</div>

			<div class="sb-customizer-sidebar-sec-ctn sbi-fb-fs"
				 :id="'sb-customizer-tabpanel-' + customizerScreens.activeTab"
				 role="tabpanel"
				 :aria-labelledby="'sb-customizer-tab-' + customizerScreens.activeTab"
				 v-if="customizerScreens.activeSection == null">
				<div v-for="(section, sectionId) in customizerSidebarBuilder[customizerScreens.activeTab].sections">
					<button type="button"
						 :class="'sb-customizer-sidebar-sec-el sbi-fb-fs sb-customizer-sidebar-section-' + sectionId"
						 v-if="!section.isHeader"
						 @click.prevent.default="switchCustomizerSection(sectionId, section)">
						<div class="sb-customizer-sidebar-sec-el-icon" v-html="svgIcons[section.icon]"></div>
						<span class="sb-small-p sb-bold sb-dark-text">{{section.heading}}</span>
						<div class="sb-customizer-chevron">
							<svg width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
								<path d="M1.66656 0L0.726562 0.94L3.7799 4L0.726562 7.06L1.66656 8L5.66656 4L1.66656 0Z"
									  fill="#141B38"/>
							</svg>
						</div>
					</button>
					<div class="sb-customizer-sidebar-sec-elhead sbi-fb-fs" v-if="section.isHeader">
						{{section.heading}}
					</div>
				</div>
				<div class="sb-customizer-sidebar-cache-wrapper sbi-fb-fs">
					<button class="sb-control-action-button sb-btn sbi-fb-fs sb-btn-grey"
							v-if="customizerScreens.activeTab == 'settings'"
							@click.prevent.default="clearSingleFeedCache()">
						<div v-html="svgIcons['update']"></div>
						<span>{{genericText.clearFeedCache}}</span>
					</button>
				</div>
			</div>

			<div class="sbi-fb-fs" v-if="customizerScreens.activeSection != null">
				<div class="sb-customizer-sidebar-header sbi-fb-fs"
					 :data-separator="customizerScreens.activeSectionData.separator ? customizerScreens.activeSectionData.separator : ''">
					<div class="sb-customizer-sidebar-breadcrumb sbi-fb-fs">
						<button type="button" class="sb-customizer-sidebar-breadcrumb-link"
								@click.prevent.default="switchCustomizerTab(customizerScreens.activeTab)">
							<svg width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
								<path d="M5.27203 0.94L4.33203 0L0.332031 4L4.33203 8L5.27203 7.06L2.2187 4L5.27203 0.94Z"
									  fill="#434960"/>
							</svg>
							{{customizerScreens.activeTab}}
						</button>
						<button type="button" v-if="customizerScreens.parentActiveSection != null"
						   @click.prevent.default="switchCustomizerSection(customizerScreens.parentActiveSection, customizerScreens.parentActiveSectionData)"
						   class="sb-customizer-sidebar-breadcrumb-link sbi-child-breadcrumb">
							<svg width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
								<path d="M5.27203 0.94L4.33203 0L0.332031 4L4.33203 8L5.27203 7.06L2.2187 4L5.27203 0.94Z"
									  fill="#434960"/>
							</svg>
							{{customizerScreens.parentActiveSectionData.heading}}
						</button>
						<button type="button" v-if="customizerScreens.parentActiveSection == 'customize_posts' && nestedStylingSection.includes(customizerScreens.activeSection)"
						   @click.prevent.default="backToPostElements()" class="sb-customizer-sidebar-breadcrumb-link sbi-child-breadcrumb">
							<svg width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
								<path d="M5.27203 0.94L4.33203 0L0.332031 4L4.33203 8L5.27203 7.06L2.2187 4L5.27203 0.94Z"
									  fill="#434960"/>
							</svg>
							Elements
						</button>
						<button type="button" v-if="viewsActive.moderationMode" @click.prevent.default="activateView('moderationMode')"
						   class="sb-customizer-sidebar-breadcrumb-link sbi-child-breadcrumb">
							<svg width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
								<path d="M5.27203 0.94L4.33203 0L0.332031 4L4.33203 8L5.27203 7.06L2.2187 4L5.27203 0.94Z"
									  fill="#434960"/>
							</svg>
							{{genericText.filtersAndModeration}}
						</button>
					</div>
					<h3>{{customizerScreens.activeSectionData.heading}} <span
								v-if="customizerScreens.activeSectionData.proLabel != undefined && customizerScreens.activeSectionData.proLabel"
								class="sb-breadcrumb-pro-label">PRO</span></h3>
					<span class="sb-customizer-sidebar-intro">
					<span v-html="customizerScreens.activeSectionData.description "></span> <a href="#"
								v-if="customizerScreens.activeSectionData.checkExtensionPopup != undefined"
								@click.prevent.default="viewsActive.extensionsPopupElement = customizerScreens.activeSectionData.checkExtensionPopup">{{genericText.learnMore}}</a>
				</span>
				</div>
				<div class="sb-customizer-sidebar-controls-ctn sbi-fb-fs">

					<button type="button" class="sb-customizer-sidebar-sec-el sbi-fb-fs"
						 v-if="customizerScreens.activeSectionData.nested_sections && ((nesetdSection.condition != undefined ? checkControlCondition(nesetdSection.condition) : false) || (nesetdSection.condition == undefined ))"
						 v-for="(nesetdSection, nesetdSectionId) in customizerScreens.activeSectionData.nested_sections"
						 @click.prevent.default="switchCustomizerSection(nesetdSectionId, nesetdSection, true)">
						<div class="sb-customizer-sidebar-sec-el-icon" v-html="svgIcons[nesetdSection.icon]"></div>
						<strong>{{nesetdSection.heading}}</strong>
						<div class="sb-customizer-chevron">
							<svg width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
								<path d="M1.66656 0L0.726562 0.94L3.7799 4L0.726562 7.06L1.66656 8L5.66656 4L1.66656 0Z"
									  fill="#141B38"/>
							</svg>
						</div>
					</button>
					<div class="sb-control-ctn sbi-fb-fs"
						 v-for="(control, ctlIndex) in customizerScreens.activeSectionData.controls">
						<?php InstagramFeed\Builder\SB_Builder_Customizer::get_controls_templates('settings'); ?>
					</div>
				</div>
			</div>


		</div>

	</div>

<?php

// InstagramFeed\Builder\CFF_Builder_Customizer::get_controls_templates();
