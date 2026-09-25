<div class="sbi-fb-fs" v-if="checkSingleFeedType('hashtag')">
    <div class="sbi-fb-slctsrc-content sbi-fb-fs">
        <div class="sbi-fb-sec-heading sbi-fb-fs">
            <h4>{{selectSourceScreen.mainHashtagHeading}}</h4>
            <span class="sb-caption sb-lighter">{{selectSourceScreen.hashtagDescription}}</span>
        </div>
        <div class="sbi-fb-fs">
            <div class="sbi-hashtag-items-list">
                <div class="sbi-hashtag-item" v-for="hashtag in selectedHastags">
                    <span>{{hashtag}}</span>
                    <div class="sbi-hashtag-item-delete" role="button" tabindex="0" :aria-label="genericText.delete + ' ' + hashtag" @click.prevent.default="removeHashtag(hashtag)" @keydown.enter.prevent.default="removeHashtag(hashtag)" @keydown.space.prevent.default="removeHashtag(hashtag)"></div>
                </div>
            </div>
            <div class="sbi-hashtag-fetchby sbi-fb-fs">
                <span class="sbi-feedtype-sec-desc sbi-fb-fs sb-caption sb-lighter">{{selectSourceScreen.hashtagGetBy}}</span>
                <div class="sbi-hashtag-fetchby-chbx sbi-fb-fs">
                    <div class="sbi-fb-stp-src-type sb-small-p sb-dark-text" :data-active="hashtagOrderBy == 'recent'"
                         role="radio" tabindex="0" :aria-checked="hashtagOrderBy == 'recent' ? 'true' : 'false'"
                         @click.prevent.default="hashtagOrderBy = 'recent'" @keydown.enter.prevent.default="hashtagOrderBy = 'recent'" @keydown.space.prevent.default="hashtagOrderBy = 'recent'">
                        <div class="sbi-fb-chbx-round"></div>
                        {{genericText.mostRecent}}
                    </div>
                    <div class="sbi-fb-stp-src-type sb-small-p sb-dark-text" :data-active="hashtagOrderBy == 'top'"
                         role="radio" tabindex="0" :aria-checked="hashtagOrderBy == 'top' ? 'true' : 'false'"
                         @click.prevent.default="hashtagOrderBy = 'top'" @keydown.enter.prevent.default="hashtagOrderBy = 'top'" @keydown.space.prevent.default="hashtagOrderBy = 'top'">
                        <div class="sbi-fb-chbx-round"></div>
                        {{genericText.topRated}}
                    </div>
                </div>
            </div>
            <input type="text" class="sbi-fb-wh-inp sbi-public-hashinp sbi-fb-fs" placeholder="#hashtag1, #hashtag2"
                   v-model="hashtagInputText" @keyup="hashtagWriteDetect"
                   aria-label="<?php esc_attr_e('Enter hashtags', 'instagram-feed'); ?>">
        </div>
    </div>
</div>