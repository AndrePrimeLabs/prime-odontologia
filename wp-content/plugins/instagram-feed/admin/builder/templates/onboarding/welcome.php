<div class="sb-onboarding-wizard-step-wrapper sb-onboarding-wizard-step-welcome sb-fs">
    <div class="sb-onboarding-wizard-welcome-text sb-fs">
        <h1 tabindex="-1" class="sb-onboarding-wizard-step-heading" v-html="onboardingWizardStepContent['welcome'].heading"></h1>
        <p v-html="onboardingWizardStepContent['welcome'].description"></p>
        <div class="sb-onboarding-wizard-welcome-btns">
            <button class="sb-btn sbi-btn-blue sb-btn-wizard-next"
                    v-html="onboardingWizardStepContent['welcome'].button"
                    @click.prevent.default="nextWizardStep"></button>
            <button type="button" class="sb-btn sbi-btn-grey" v-html="genericText.learnMore" @click.prevent.default="nextWizardStep"></button>
        </div>
    </div>
    <div class="sb-onboarding-wizard-welcome-banner sb-fs">
        <img :src="onboardingWizardStepContent['welcome'].banner" alt="" role="presentation"/>
    </div>
</div>