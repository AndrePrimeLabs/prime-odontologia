<div class="sbi-fb-extensions-pp-ctn sb-fs-boss sbi-fb-center-boss"
     role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Smash Balloon extensions', 'instagram-feed' ); ?>"
     v-if="viewsActive.extensionsPopupElement != null && viewsActive.extensionsPopupElement != false"
     @click.self="activateView('extensionsPopupElement')">
    <div class="sbi-fb-extensions-popup sbi-fb-popup-inside"
         v-if="viewsActive.extensionsPopupElement != null && viewsActive.extensionsPopupElement != false"
         :data-getext-view="viewsActive.extensionsPopupElement">

        <button class="sbi-fb-popup-cls" @click.prevent.default="activateView('extensionsPopupElement')" aria-label="Close">
            <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M1 1L13 13M1 13L13 1" stroke="#696D80" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </button>

        <div class="sbi-fb-extpp-illustration">
            <img :src="extensionsPopup[viewsActive.extensionsPopupElement].imgUrl"
                 :alt="extensionsPopup[viewsActive.extensionsPopupElement].featureName">
        </div>

        <div class="sbi-fb-extpp-content">
            <div class="sbi-fb-extpp-title">
                <span class="sbi-fb-extpp-title-text">{{extensionsPopup[viewsActive.extensionsPopupElement].featureName}} {{genericText.isA}}</span>
                <div class="sbi-fb-extpp-pro-badge"><span>{{genericText.pro}}</span></div>
                <span class="sbi-fb-extpp-title-text">{{genericText.proFeature}}</span>
            </div>
            <p class="sbi-fb-extpp-description">{{extensionsPopup[viewsActive.extensionsPopupElement].description}}</p>
        </div>

        <div class="sbi-fb-extpp-buttons">
            <a class="sbi-fb-extpp-upgrade-btn"
               :href="extensionsPopup[viewsActive.extensionsPopupElement].buyUrl" target="_blank">
                <span>{{genericText.upgradeToPro}}</span>
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                    <path d="M7.5 5L12.5 10L7.5 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
            <a class="sbi-fb-extpp-demo-btn"
               :href="extensionsPopup[viewsActive.extensionsPopupElement].demoUrl" target="_blank">{{genericText.tryDemo}}</a>
        </div>

        <div class="sbi-fb-extpp-footer">
            <svg class="sbi-fb-extpp-check-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M6.8075 25.1925C5.6575 24.0425 6.42 21.6263 5.835 20.2113C5.2275 18.75 3 17.5625 3 16C3 14.4375 5.2275 13.25 5.835 11.7887C6.42 10.375 5.6575 7.9575 6.8075 6.8075C7.9575 5.6575 10.375 6.42 11.7887 5.835C13.2562 5.2275 14.4375 3 16 3C17.5625 3 18.75 5.2275 20.2113 5.835C21.6263 6.42 24.0425 5.6575 25.1925 6.8075C26.3425 7.9575 25.58 10.3737 26.165 11.7887C26.7725 13.2562 29 14.4375 29 16C29 17.5625 26.7725 18.75 26.165 20.2113C25.58 21.6263 26.3425 24.0425 25.1925 25.1925C24.0425 26.3425 21.6263 25.58 20.2113 26.165C18.75 26.7725 17.5625 29 16 29C14.4375 29 13.25 26.7725 11.7887 26.165C10.375 25.58 7.9575 26.3425 6.8075 25.1925Z" stroke="#663D00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M11 17L14 20L21 13" stroke="#663D00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="sbi-fb-extpp-footer-text">
                <span class="sbi-fb-extpp-footer-bold">{{genericText.liteFeedUsersGet50Off}} <span class="sbi-fb-extpp-highlight-pill">{{genericText.fiftyPercentOff}}</span> {{genericText.appliedAutomatically}}</span>
                <span class="sbi-fb-extpp-footer-regular">{{genericText.moneyBackGuarantee}}</span>
            </div>
        </div>
    </div>
</div>
