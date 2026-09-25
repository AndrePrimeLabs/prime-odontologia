<div class="sb-onboarding-wizard-step-wrapper sb-onboarding-wizard-step-configuref sb-fs">

	<div class="sb-onboarding-wizard-step-top sb-fs">
		<strong v-html="onboardingWizardStepContent['configure-features'].smallHeading"></strong>
		<h1 tabindex="-1" class="sb-onboarding-wizard-step-heading" v-html="onboardingWizardStepContent['configure-features'].heading"></h1>
	</div>

	<div class="sb-onboarding-wizard-elements-list sb-fs">

		<div class="sb-onboarding-wizard-elem sb-fs"
			 v-for="(feature, idx) in onboardingWizardStepContent['configure-features']?.featuresList">
			<div class="sb-onboarding-wizard-elem-info">
				<div class="sb-onboarding-wizard-elem-icon" v-if="feature?.icon !== undefined"
					 v-html="feature?.icon"></div>
				<div class="sb-onboarding-wizard-elem-text">
					<strong v-if="feature?.heading !== undefined" v-html="feature?.heading"></strong>
					<span v-if="feature?.description !== undefined" :id="'feature-desc-' + idx" v-html="feature?.description"></span>
					<div v-if="feature?.data?.type === 'install_plugins' && feature?.plugins.length > 0"
						 class="sb-onboarding-wizard-smash-list">
						<div class="sb-onboarding-wizard-smash-inside">
							<div class="sb-control-elem-tltp">
								<div v-html="svgIcons['info']"></div>
								<div class="sb-control-elem-tltp-content">
									<div class="sb-control-elem-tltp-txt" v-html="feature?.tooltip"></div>
								</div>
							</div>
							<div class="sb-onboarding-wizard-smash-elem" v-for="sPlugin in feature?.plugins">
								<img :src="sPlugin.icon" :alt="sPlugin.type">
								<span v-html="sPlugin.type"></span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="sb-onboarding-wizard-elem-toggle">
				<button type="button" role="switch"
						:aria-checked="switcherOnboardingWizardCheckActive(feature) ? 'true' : 'false'"
						:aria-label="feature?.heading"
						:aria-describedby="feature?.description !== undefined ? 'feature-desc-' + idx : null"
						:data-color="feature?.color" :data-active="switcherOnboardingWizardCheckActive(feature)"
						:data-uncheck="feature?.uncheck"
						@click.prevent.default="switcherOnboardingWizardClick(feature)"></button>
			</div>
		</div>

	</div>

	<div class="sb-onboarding-wizard-elements-list sb-fs"
		 v-if="onboardingWizardStepContent['configure-features']?.proFeaturesList !== undefined">
		<div class="sb-onboarding-wizard-elements-list-hd sb-fs">
			<?php echo esc_html__('Pro Features', 'instagram-feed') ?>
		</div>
		<div class="sb-onboarding-wizard-elem sb-fs"
			 v-for="(feature, idx) in onboardingWizardStepContent['configure-features']?.proFeaturesList">
			<div class="sb-onboarding-wizard-elem-info">
				<div class="sb-onboarding-wizard-elem-icon" v-if="feature?.icon !== undefined"
					 v-html="feature?.icon"></div>
				<div class="sb-onboarding-wizard-elem-text">
					<strong v-if="feature?.heading !== undefined" v-html="feature?.heading"></strong>
					<span v-if="feature?.description !== undefined" :id="'profeature-desc-' + idx" v-html="feature?.description"></span>
				</div>

			</div>
			<div class="sb-onboarding-wizard-elem-toggle">
				<button type="button" role="switch"
						:aria-checked="switcherOnboardingWizardCheckActive(feature) ? 'true' : 'false'"
						:aria-label="feature?.heading"
						:aria-describedby="feature?.description !== undefined ? 'profeature-desc-' + idx : null"
						:data-color="feature?.color" :data-active="switcherOnboardingWizardCheckActive(feature)"
						:data-uncheck="feature?.uncheck"
						@click.prevent.default="switcherOnboardingWizardClick(feature)"></button>
			</div>
		</div>

	</div>

</div>

<div class="sb-onboarding-wizard-step-pag-btns sb-fs">
	<button class="sb-btn sbi-btn-grey sb-btn-wizard-back" v-html="'Back'"
			@click.prevent.default="previousWizardStep"></button>
	<button class="sb-btn sbi-btn-blue sb-btn-wizard-next" v-html="'Next'"
			@click.prevent.default="nextWizardStep"></button>
</div>