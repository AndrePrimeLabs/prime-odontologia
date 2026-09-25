/**
 * Initialize Choices.js on select elements with a specific class
 */
import Choices from 'choices.js';

jQuery(function($) {
    // Debounce function
    const debounce = (callback, wait) => {
        let timeoutId = null;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                callback.apply(null, args);
            }, wait);
        };
    };

    window.wpconsent_choices = {};

    // Initialize Choices on all select elements with class 'wpconsent-choices'
    const selects = document.querySelectorAll('.wpconsent-choices');

    selects.forEach(select => {
        const choices = new Choices(select, {
            removeItemButton: select.dataset.removeItem !== 'false',
            searchEnabled: select.dataset.search === 'true',
            placeholder: true,
            placeholderValue: select.dataset.placeholder || 'Select an option',
        });

        // Store Choices instance.
        if ( select.id ) {
            window.wpconsent_choices[select.id] = choices;
        }

        // If select has data-ajax="true", add AJAX search functionality
        if (select.dataset.ajax === 'true') {
            const ajaxAction = select.dataset.ajaxAction || 'wpconsent_search_pages';

            choices.passedElement.element.addEventListener(
                'search',
                debounce((event) => {
                    const value = event.detail.value;
                    if (!value || value.length < 3) return;

                    // Perform AJAX search
                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: ajaxAction,
                            nonce: wpconsent.nonce,
                            search: value
                        },
                        success: function(response) {
                            if (response.success && response.data) {
                                const options = response.data.map(item => ({
                                    value: item.value,
                                    label: item.label
                                }));
                                choices.setChoices(options, 'value', 'label', true);
                            }
                        }
                    });
                }, 300)
            );
        }
    });
});