window.WPConsentImportConfirm = window.WPConsentImportConfirm || (
    function (document, window, $) {
        const app = {
            strings: {
                warning_title: wpconsent.import_warning_title || 'Warning: Import Settings',
                warning_message: wpconsent.import_warning_message || 'This action will overwrite all your current settings. This cannot be undone. We recommend exporting your current settings as a backup before proceeding.',
                import_button: wpconsent.import_button || 'Import Settings',
                cancel_button: wpconsent.cancel_button || 'Cancel'
            },

            init() {
                this.bindEvents();
            },

            bindEvents() {
                const $importForm = $('form[action*="wpconsent-cookies"]');
                const $importButton = $importForm.find('button[name="wpconsent_import"]');
                const $importFile = $('#wpconsent-import-file');

                $importButton.on('click', (e) => {
                    e.preventDefault();
                    
                    // Check if a file is selected
                    if (!$importFile[0].files.length) {
                        return;
                    }

                    this.showConfirmDialog($importForm);
                });
            },

            showConfirmDialog($form) {
                $.confirm({
                    title: this.strings.warning_title,
                    content: `
                        <div class="wpconsent-import-warning">
                            <p>${this.strings.warning_message}</p>
                        </div>
                    `,
                    boxWidth: '600px',
                    theme: 'modern',
                    type: 'blue',
                    buttons: {
                        import: {
                            text: this.strings.import_button,
                            btnClass: 'btn-confirm',
                            action: () => {
                                const $importInput = $('<input>').attr({
                                    type: 'hidden',
                                    name: 'wpconsent_import',
                                    value: '1'
                                });
                                $form.append($importInput);
                                $form.submit();
                            }
                        },
                        cancel: {
                            text: this.strings.cancel_button,
                            btnClass: ''
                        }
                    }
                });
            }
        };

        // Initialize when document is ready
        $(document).ready(() => {
            app.init();
        });

        return app;
    }(document, window, jQuery)
); 