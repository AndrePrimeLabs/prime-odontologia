(function($) {
    'use strict';

    // Only run on the wpconsent cookies page
    if ($('body').hasClass('wpconsent_page_wpconsent-cookies')) {
        // Handle banner toggle changes
        $('#enable_consent_banner').on('change', function() {
            const $scriptBlockingRow = $('#enable_script_blocking').closest('.wpconsent-metabox-form-row-input');
            const $scriptBlockingToggle = $('#enable_script_blocking');

            if (this.checked) {
                // Enable script blocking toggle
                $scriptBlockingRow.removeClass('disabled');
            } else {
                // Disable script blocking toggle
                $scriptBlockingRow.addClass('disabled');
                $scriptBlockingToggle.prop('checked', false);
            }
        });

        // Initial state check on page load
        $(document).ready(function() {
            const $consentBanner = $('#enable_consent_banner');
            if (!$consentBanner.is(':checked')) {
                const $scriptBlockingRow = $('#enable_script_blocking').closest('.wpconsent-metabox-form-row-input');
                const $scriptBlockingToggle = $('#enable_script_blocking');

                $scriptBlockingRow.addClass('disabled');
                $scriptBlockingToggle.prop('checked', false);
            }
        });
    }
})(jQuery);
