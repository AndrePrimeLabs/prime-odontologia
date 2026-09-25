/**
 * Initialize Choices.js for the scanner page selector
 * Handles the manual scanner page selection functionality
 */
import Choices from 'choices.js';

jQuery(function($) {
    // Constants
    const DEBOUNCE_DELAY = 300;
    const MIN_SEARCH_LENGTH = 3;
    const SEARCH_RESULT_LIMIT = 10;

    /**
     * Debounce function to limit the rate of function execution
     * @param {Function} callback - Function to debounce
     * @param {number} wait - Time to wait in milliseconds
     * @returns {Function} - Debounced function
     */
    const debounce = (callback, wait) => {
        let timeoutId = null;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                callback.apply(null, args);
            }, wait);
        };
    };

    /**
     * Save scanner items to the server
     * @param {Array} items - Array of item IDs to save
     */
    const saveScannerItems = (items) => {
        const uniqueItems = [...new Set(items)];

        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'wpconsent_save_scanner_items',
                nonce: wpconsent.nonce,
                items: uniqueItems
            },
            success: function(response) {
                if (!response.success) {
                    console.error('Failed to save scanner items:', response.data);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error saving scanner items:', error);
            }
        });
    };

    /**
     * Create HTML for a selected scanner item
     * @param {string} id - Item ID
     * @param {string} label - Item label
     * @param {string} url - Item URL
     * @returns {string} - HTML string
     */
    const createSelectedItemHTML = (id, label, url) => `
        <div class="wpconsent-scanner-selected-item" id="scanner-item-${id}">
            <div class="wpconsent-scanner-selected-item-info">
                <h3>${label}</h3>
                ${url ? `
                    <a href="${url}" target="_blank" rel="noopener noreferrer">
                        ${new URL(url).pathname}
                    </a>
                ` : ''}
            </div>
            <button type="button" class="wpconsent-remove-item" data-id="${id}">
                <span class="dashicons dashicons-no-alt"></span>
            </button>
            <input type="hidden" name="scanner_items[]" value="${id}">
        </div>
    `;

    /**
     * Handle removal of a scanner item
     * @param {HTMLElement} item - Item element to remove
     * @param {number} itemId - ID of the item to remove
     */
    const handleItemRemoval = (item, itemId) => {
        item.remove();
        const container = document.querySelector('.wpconsent-scanner-selected-items-container');
        const remainingItems = Array.from(container.querySelectorAll('input[name="scanner_items[]"]'))
            .map(input => parseInt(input.value))
            .filter(id => id !== parseInt(itemId));
        saveScannerItems(remainingItems);
    };

    // Initialize Choices.js
    const selectElement = document.querySelector('#manual-scanner-page');
    if (!selectElement) return;

    let choices;

    // Check if Choices instance already exists (from choices-handler.js)
    if (window.wpconsent_choices?.[selectElement.id]) {
        choices = window.wpconsent_choices[selectElement.id];
    } else if (selectElement.classList.contains('choices__input')) {
        // Element has already been processed by Choices.js but not stored globally
        return; // Exit to avoid duplicate initialization
    } else {
        choices = new Choices(selectElement, {
            removeItemButton: true,
            searchEnabled: true,
            placeholder: true,
            placeholderValue: selectElement.dataset.placeholder,
            searchPlaceholderValue: selectElement.dataset.placeholder,
            searchResultLimit: SEARCH_RESULT_LIMIT,
            shouldSort: false,
            classNames: {
                containerOuter: 'choices wpconsent-choices',
            }
        });

        if (selectElement.id) {
            window.wpconsent_choices = window.wpconsent_choices || {};
            window.wpconsent_choices[selectElement.id] = choices;
        }
    }

    // Event Listeners
    choices.passedElement.element.addEventListener('change', function() {
        const selectedValue = choices.getValue(true);
        if (!selectedValue) return;

        const selectedOption = choices.passedElement.element.querySelector(`option[value="${selectedValue}"]`);
        if (!selectedOption) return;

        const selectedLabel = selectedOption.textContent;
        const customProps = JSON.parse(selectedOption.getAttribute('data-custom-properties') || '{}');
        const selectedUrl = selectedOption.getAttribute('data-url') || customProps.url;

        const selectedItemHTML = createSelectedItemHTML(selectedValue, selectedLabel, selectedUrl);
        const container = document.querySelector('.wpconsent-scanner-selected-items-container');

        if (container) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = selectedItemHTML;
            const selectedItem = tempDiv.firstElementChild;
            container.appendChild(selectedItem);

            const removeButton = selectedItem.querySelector('.wpconsent-remove-item');
            removeButton.addEventListener('click', () => handleItemRemoval(selectedItem, selectedValue));

            const allItems = Array.from(container.querySelectorAll('input[name="scanner_items[]"]'))
                .map(input => parseInt(input.value));
            saveScannerItems(allItems);
        }
    });

    // Initialize existing remove buttons
    document.querySelectorAll('.wpconsent-remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            const item = document.getElementById(`scanner-item-${itemId}`);
            if (item) {
                handleItemRemoval(item, itemId);
            }
        });
    });

    // Search functionality - only add if choices-handler.js isn't already handling it
    if (selectElement.dataset.ajax !== 'true') {
        selectElement.addEventListener('search', debounce((event) => {
            const value = event.detail.value;
            if (!value || value.length < MIN_SEARCH_LENGTH) return;

            choices.setChoices([{
                value: '',
                label: wpconsent.searching || 'Searching...',
                disabled: true
            }], 'value', 'label', true);

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: selectElement.dataset.ajaxAction || 'wpconsent_search_content',
                    nonce: wpconsent.nonce,
                    search: value
                },
                success: function(response) {
                    if (response.success && response.data) {
                        const options = response.data.map(item => ({
                            value: item.value,
                            label: item.label,
                            customProperties: {
                                url: item.url || ''
                            }
                        }));
                        choices.setChoices(options, 'value', 'label', true);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error searching content:', error);
                    choices.setChoices([{
                        value: '',
                        label: 'Error searching content',
                        disabled: true
                    }], 'value', 'label', true);
                }
            });
        }, DEBOUNCE_DELAY));
    }
});