<?php // phpcs:ignoreFile -- Vue template, no PHP. ?>
<div v-if="selected === 'app-4'" id="sbi-panel-data-sharing" role="tabpanel" aria-labelledby="sbi-settings-tab-data-sharing" tabindex="0">
    <div class="sb-tab-box sb-data-sharing-consent-box sb-reset-box-style clearfix">
        <div class="tab-label">
            <h3>{{debugTab.dataSharingTitle}}</h3>
        </div>

        <div class="sbi-tab-form-field">
            <div class="sb-form-field">
                <label for="sbi-data-sharing-consent" class="sbi-checkbox">
                    <input type="checkbox" name="sbi-data-sharing-consent" id="sbi-data-sharing-consent"
                           v-model="model.debug.sbc_data_sharing_consent">
                    <span class="toggle-track">
                        <div class="toggle-indicator"></div>
                    </span>
                </label>
                <span class="help-text">{{debugTab.dataSharingDesc}}</span>
                <div class="sbi-debug-consent-links">
                    <a :href="debugTab.permissionsUrl" target="_blank" rel="noopener">{{debugTab.permissionsLinkText}}</a>
                    <a :href="debugTab.termsUrl" target="_blank" rel="noopener">{{debugTab.termsLinkText}}</a>
                    <a :href="debugTab.privacyUrl" target="_blank" rel="noopener">{{debugTab.privacyLinkText}}</a>
                </div>
            </div>
        </div>
    </div>

    <div class="sb-tab-box sb-in-plugin-notifications-box sb-reset-box-style clearfix" aria-live="polite">
        <div class="tab-label">
            <h3>{{debugTab.notificationsTitle}}</h3>
        </div>

        <div class="sbi-tab-form-field">
            <div class="sb-form-field">
                <label for="sbi-in-plugin-notifications" class="sbi-checkbox">
                    <input type="checkbox" name="sbi-in-plugin-notifications" id="sbi-in-plugin-notifications"
                           v-model="model.debug.sbc_in_plugin_notifications"
                           :disabled="model.debug.sbc_data_sharing_consent">
                    <span class="toggle-track">
                        <div class="toggle-indicator"></div>
                    </span>
                </label>
                <span class="help-text">{{debugTab.notificationsDesc}}</span>
            </div>
        </div>
    </div>
</div>
