<div class="sb-onboarding-wizard-step-wrapper sb-onboarding-wizard-step-installp sb-fs">

	<div class="sb-onboarding-wizard-step-top sb-fs" data-large="true">
		<h1 tabindex="-1" class="sb-onboarding-wizard-step-heading" v-html="onboardingWizardStepContent['install-plugins'].heading"></h1>
		<span v-html="onboardingWizardStepContent['install-plugins'].description"></span>
	</div>

	<div class="sb-onboarding-wizard-elements-list sb-fs">

		<div class="sb-onboarding-wizard-elem sb-fs"
			 v-for="(plugin, idx) in onboardingWizardStepContent['install-plugins']?.pluginsList">
			<div class="sb-onboarding-wizard-elem-info">
				<div class="sb-onboarding-wizard-elem-icon" v-if="plugin?.icon !== undefined">
					<img :src="plugin?.icon" :alt="plugin?.heading"/>
				</div>
				<div class="sb-onboarding-wizard-elem-text">
					<strong v-if="plugin?.heading !== undefined">
						<span v-html="plugin?.heading"></span>
						<span class="sb-onboarding-wizard-elem-text-installs">
							<img :src="onboardingWizardStepContent['install-plugins']?.star_icons" alt="">
							<e v-html="plugin?.installs_number"></e>
						</span>
					</strong>
					<span v-if="plugin?.description !== undefined" :id="'plugin-desc-' + idx" v-html="plugin?.description"></span>
				</div>

			</div>
			<div class="sb-onboarding-wizard-elem-toggle">
				<button type="button" role="switch"
						:aria-checked="switcherOnboardingWizardCheckActive(plugin) ? 'true' : 'false'"
						:aria-label="plugin?.heading"
						:aria-describedby="plugin?.description !== undefined ? 'plugin-desc-' + idx : null"
						:data-color="plugin?.color" :data-active="switcherOnboardingWizardCheckActive(plugin)"
						:data-uncheck="plugin?.uncheck"
						@click.prevent.default="switcherOnboardingWizardClick(plugin)"></button>
			</div>
			<div class="sb-onboarding-wizard-gdpr-info sb-fs" v-if="onboardingWizardStepContent['install-plugins'].showGDPRInfo">
				<h2>{{onboardingWizardStepContent['install-plugins'].gdprInfo.heading}}</h2>
				<div class="sb-onboarding-wizard-gdpr-columns">
					<div class="sb-gdpr-box" v-for="column in onboardingWizardStepContent['install-plugins'].gdprInfo.columns">
						<div class="sb-gdpr-box-icon"><img :src="column.icon"></div>
						<div class="sb-gdpr-box-text">
							<h5>{{column.title}}</h5>
							<p>{{column.description}}</p>
						</div>

					</div>
				</div>
			</div>
		</div>

	</div>



	<div class="sb-onboarding-wizard-clicking" v-if="hasActiveInstallPlugins()">
		<span v-html="svgIcons['info']"></span>
		<span>
			<?php echo esc_html__('Clicking Next will install ', 'instagram-feed') ?>
			<span v-for="(plugin, ind) in onboardingWizardStepContent['install-plugins']?.pluginsList"
				  v-html="plugin?.data?.pluginName + (ind !== onboardingWizardStepContent['install-plugins']?.pluginsList.length - 1 ? ', ' : '.')"></span>
		</span>
	</div>

</div>

<div class="sb-onboarding-wizard-step-pag-btns sb-fs">
	<button class="sb-btn sbi-btn-grey sb-btn-wizard-back" v-html="'Back'"
			@click.prevent.default="previousWizardStep"></button>
	<button class="sb-btn sbi-btn-blue sb-btn-wizard-next sb-btn-wizard-install"
			v-html="hasActiveInstallPlugins() ? 'Install Selected Plugins' : 'Next'"
			@click.prevent.default="nextWizardStep('submit')"></button>
</div>