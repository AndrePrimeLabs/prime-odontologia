class WPConsentModalForm {
    constructor( id ) {
        this.modal = document.getElementById( id );
        this.form = this.modal.querySelector('form');
        this.closeButton = this.modal.querySelector('.wpconsent-modal-close');
        this.cancelButton = this.modal.querySelector('.wpconsent-button-secondary');
        this.saveButton = this.modal.querySelector('.wpconsent-button-primary');
        this.title = this.modal.querySelector('.wpconsent-modal-header h2');

        this.bindEvents();
    }

    bindEvents() {
        // Close modal handlers
        this.closeButton.addEventListener('click', () => this.close());
        this.cancelButton.addEventListener('click', () => this.close());

        // Only handle form submission, remove the button click handler
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    /**
     * Open the modal with configuration
     * @param {Object} config Modal configuration
     * @param {string} config.title Modal title
     * @param {Object} config.data Data to populate form fields
     */
    open(config = {}) {
        if (config.title) {
            this.title.textContent = config.title;
        }

        if (config.data) {
            this.populateFields(config.data);
        }

        if (config.successCallback) {
            this.successCallback = config.successCallback;
        }

        if (config.errorCallback) {
            this.errorCallback = config.errorCallback;
        }

        this.modal.style.display = 'block';
    }

    close() {
        this.modal.style.display = 'none';
        this.form.reset();
        this.submitCallback = null;
    }

    /**
     * Populate form fields with data
     * @param {Object} data Key-value pairs of field names and values
     */
    populateFields(data) {
        Object.keys(data).forEach(key => {
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'radio') {
                    // For radio buttons, find the one with matching value and check it.
                    const radioButtons = this.form.querySelectorAll(`[name="${key}"]`);
                    radioButtons.forEach(radio => {
                        radio.checked = (radio.value === data[key]);
                    });
                } else if (field.type === 'checkbox') {
                    // For checkboxes, set checked based on truthy value.
                    field.checked = !!data[key];
                } else {
                    // For other field types, set the value.
                    field.value = data[key];
                }
            }
        });
    }

    /**
     * Get all form data as an object
     * @returns {Object} Form data
     */
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    /**
     * Handle form submission
     * @param {Event} e Click event
     */
    handleSubmit(e) {
        e.preventDefault();

        // Prevent duplicate submissions while processing
        if (this.isSubmitting) return;
        this.isSubmitting = true;

        const data = this.getFormData();

        // Make the submit button disabled
        this.saveButton.disabled = true;

        // Submit the form using AJAX as a POST request
        jQuery.post(ajaxurl, {
            ...data
        }).done((response) => {
            if (this.successCallback) {
                this.successCallback(response);
            }
        }).always(() => {
            // Reset submission state and re-enable button
            this.isSubmitting = false;
            this.saveButton.disabled = false;
        }).fail((response) => {
            if (this.errorCallback) {
                this.errorCallback(response);
            }
        });
    }
}

// Make this available to the global scope
window.WPConsentModalForm = WPConsentModalForm;

