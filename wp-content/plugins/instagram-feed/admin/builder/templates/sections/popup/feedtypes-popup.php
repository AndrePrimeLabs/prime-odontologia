<div class="sbi-fb-feedtypes-pp-ctn sb-fs-boss sbi-fb-center-boss" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Select feed type', 'instagram-feed' ); ?>" v-if="viewsActive.feedtypesPopup">
    <div class="sbi-fb-feedtypes-popup sbi-fb-popup-inside">
        <div class="sb-button-no-border" role="button" tabindex="0" :aria-label="genericText.back" @click.prevent.default="toggleFeedTypesChooserPopup()" @keydown.enter.prevent.default="toggleFeedTypesChooserPopup()" @keydown.space.prevent.default="toggleFeedTypesChooserPopup()">
            <svg width="7" height="11" viewBox="0 0 7 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M6.3415 1.18184L5.1665 0.00683594L0.166504 5.00684L5.1665 10.0068L6.3415 8.83184L2.52484 5.00684L6.3415 1.18184Z"
                      fill="#141B38"/>
            </svg>
            <span>{{genericText.back}}</span>
        </div>
        <button type="button" class="sbi-fb-popup-cls" aria-label="<?php esc_attr_e( 'Close', 'instagram-feed' ); ?>" @click.prevent.default="cancelFeedTypeAndSourcesCustomizer()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                      fill="#141B38"/>
            </svg>
        </button>
        <div class="sbi-fb-types sbi-fb-fs">
            <h4>{{selectFeedTypeScreen.anotherFeedTypeHeading}}</h4>
            <div class="sbi-fb-types-list">
                <div class="sbi-fb-type-el" v-for="(feedTypeEl, feedTypeIn) in feedTypes"
                     role="button"
                     tabindex="0"
                     :aria-label="feedTypeEl.title"
                     :aria-pressed="selectedFeedPopup.includes(feedTypeEl.type) && feedTypeEl.type != 'socialwall' ? 'true' : 'false'"
                     :data-active="selectedFeedPopup.includes(feedTypeEl.type) && feedTypeEl.type != 'socialwall'"
                     :data-checked="selectedFeed.includes(feedTypeEl.type) && feedTypeEl.type != 'socialwall'"
                     :data-type="feedTypeEl.type" @click.prevent.default="selectFeedTypePopup(feedTypeEl)"
                     @keydown.enter.prevent.default="selectFeedTypePopup(feedTypeEl)"
                     @keydown.space.prevent.default="selectFeedTypePopup(feedTypeEl)">
                    <div class="sbi-fb-type-el-img sbi-fb-fs" v-html="svgIcons[feedTypeEl.icon]"></div>
                    <div class="sbi-fb-type-el-info sbi-fb-fs">
                        <p class="sb-small-p sb-bold sb-dark-text" v-html="feedTypeEl.title"></p>
                        <a href="" v-if="feedTypeEl.businessRequired != undefined && feedTypeEl.businessRequired"
                           v-html="genericText.businessRequired"></a>
                        <span class="sb-caption sb-lightest sb-small-text">{{feedTypeEl.description}}</span>
                    </div>
                </div>
                <div class="sbi-fb-type-el" v-for="(feedTypeEl, feedTypeIn) in advancedFeedTypes" data-active="false"
                     role="button"
                     tabindex="0"
                     :aria-label="feedTypeEl.title"
                     data-checked="false" :data-type="feedTypeEl.type"
                     @click.prevent.default="chooseFeedType(feedTypeEl)"
                     @keydown.enter.prevent.default="chooseFeedType(feedTypeEl)"
                     @keydown.space.prevent.default="chooseFeedType(feedTypeEl)">
                    <div class="sbi-fb-type-el-img sbi-fb-fs" v-html="svgIcons[feedTypeEl.icon]"></div>
                    <div class="sbi-fb-type-el-info sbi-fb-fs">
                        <p class="sb-small-p sb-bold sb-dark-text" v-html="feedTypeEl.title"></p>
                        <a href="" v-if="feedTypeEl.businessRequired != undefined && feedTypeEl.businessRequired"
                           v-html="genericText.businessRequired"></a>
                        <span class="sb-caption sb-lightest sb-small-text">{{feedTypeEl.description}}</span>
                    </div>
                </div>


            </div>
        </div>
        <div class="sbi-fb-addsourtype-ctn sbi-fb-fs">
            <button class="sbi-fb-source-btn sbi-fb-fs sb-btn-blue" @click.prevent.default="addFeedTypePopup()">
                <div class="sbi-fb-icon-success"></div>
                {{genericText.add}}
            </button>
        </div>


    </div>
</div>
