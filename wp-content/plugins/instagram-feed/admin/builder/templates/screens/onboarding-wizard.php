<div class="sb-onboarding-wizard-ctn" :data-step="currentOnboardingWizardStep"
	 role="dialog" aria-modal="true" aria-label="Instagram Feed setup wizard">
	<div class="sb-sr-only" aria-live="polite" aria-atomic="true" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">{{stepAnnouncement}}</div>
	<button type="button" class="sb-onboarding-wizard-close" v-if="currentOnboardingWizardStep !== 0"
		 aria-label="Close setup wizard"
		 @click.prevent.default="dismissOnboardingWizard">
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
			<g opacity="0.6" clip-path="url(#clip0_4219_56788)">
				<path d="M9.99935 18.3337C14.6017 18.3337 18.3327 14.6027 18.3327 10.0003C18.3327 5.39795 14.6017 1.66699 9.99935 1.66699C5.39698 1.66699 1.66602 5.39795 1.66602 10.0003C1.66602 14.6027 5.39698 18.3337 9.99935 18.3337Z"
					  stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M12.5 7.5L7.5 12.5" stroke="white" stroke-width="2" stroke-linecap="round"
					  stroke-linejoin="round"/>
				<path d="M7.5 7.5L12.5 12.5" stroke="white" stroke-width="2" stroke-linecap="round"
					  stroke-linejoin="round"/>
			</g>
			<defs>
				<clipPath id="clip0_4219_56788">
					<rect width="20" height="20" fill="white"/>
				</clipPath>
			</defs>
		</svg>
		<span v-html="genericText.exitSetup"></span>
	</button>
	<div class="sb-onboarding-wizard-wrapper" :data-step="currentOnboardingWizardStep">

		<div class="sb-onboarding-wizard-top" v-if="currentOnboardingWizardStep !== 0">
			<div class="sb-onboarding-wizard-logo1-ctn">
				<img :src="onboardingWizardContent.balloon1" class="sb-onboarding-wizard-logo-balloon1" alt="Balloon"/>
				<!--<img :src="onboardingWizardContent.logo" class="sb-onboarding-wizard-logo-img" alt="Logo" />-->
			</div>
			<div class="sb-onboarding-wizard-plugin-name">
				<span v-html="onboardingWizardContent.subheading"></span>
				<span class="sb-onboarding-wizard-plugin-name-heading" v-html="onboardingWizardContent.heading"></span>
			</div>

		</div>

		<div class="sb-onboarding-wizard-steps" v-if="currentOnboardingWizardStep !== 0"
			 role="progressbar"
			 :aria-valuenow="currentOnboardingWizardStep"
			 aria-valuemin="1"
			 :aria-valuemax="onboardingWizardContent.steps.length - 1"
			 :aria-label="'Setup step ' + currentOnboardingWizardStep + ' of ' + (onboardingWizardContent.steps.length - 1)">
			<div class="sb-onboarding-wizard-step-icon" v-for="(step, stepIndex) in onboardingWizardContent.steps"
				 :data-active="stepIndex < currentOnboardingWizardStep ? 'done' : (stepIndex === currentOnboardingWizardStep).toString()"></div>
		</div>

		<?php
		$steps_list = InstagramFeed\admin\SBI_Onboarding_wizard::get_onboarding_wizard_content();
		foreach ($steps_list['steps'] as $key => $step) {
			?>
			<div class="sb-onboarding-wizard-step-ctn" v-if="currentOnboardingWizardStep === <?php echo $key; ?>">
				<?php include_once($step['template']); ?>
			</div>
			<?php
		}
		?>
	</div>
</div>