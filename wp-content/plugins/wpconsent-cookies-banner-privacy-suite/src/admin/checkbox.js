jQuery(document).ready(function($) {
    // Handle checkbox toggle changes
    $('.wpconsent-checkbox-toggle input[type="checkbox"]').on('change', function() {
        const target = $(this).data('target');
        if (!target) {
            return;
        }

        const targetElement = document.getElementById("wpconsent-container").shadowRoot.querySelector( target );

        if ($(this).is(':checked')) {
            // Show targetElement.
            $(targetElement).show();
        } else {
            $(targetElement).hide();
        }
    });

    // Initialize visibility on page load
    $('.wpconsent-checkbox-toggle input[type="checkbox"]').each(function() {
        const target = $(this).data('target');
        if (!target) {
            return;
        }

        const targetElement = document.getElementById("wpconsent-container").shadowRoot.querySelector( target );

        if ($(this).is(':checked')) {
            // Show targetElement.
            $(targetElement).show();
        } else {
            $(targetElement).hide();
        }
    });
});
