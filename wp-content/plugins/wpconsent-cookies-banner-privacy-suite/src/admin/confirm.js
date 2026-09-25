window.WPConsentConfirm = window.WPConsentConfirm || (
    function (document, window, $) {
        const app = {
            please_wait: null,
            show_please_wait(title = wpconsent.please_wait, showProgress = false) {
                let content = '<div class="wpconsent-loading-ring"></div>';
                if (showProgress) {
                    content += '<div class="wpconsent-progress-container">' +
                        '<div class="wpconsent-progress-bar" style="width: 0%"></div>' +
                        '<div class="wpconsent-progress-text">0 of 0</div>' +
                        '</div>';
                }
                
                this.please_wait = $.confirm({
                    title: title,
                    closeIcon: false,
                    content: content,
                    boxWidth: '600px',
                    theme: 'modern loader-spinner',
                    buttons: {
                        close: {
                            isHidden: true
                        }
                    },
                    onOpenBefore: function () {
                        this.buttons.close.hide();
                        this.$content.parent().addClass('jconfirm-loading');
                    },
                    onClose: function () {
                        this.$content.parent().removeClass('jconfirm-loading');
                    }
                });
                return this.please_wait;
            },
            update_progress(current, total) {
                if (this.please_wait) {
                    const $progressBar = this.please_wait.$content.find('.wpconsent-progress-bar');
                    const $progressText = this.please_wait.$content.find('.wpconsent-progress-text');
                    if ($progressBar.length && $progressText.length) {
                        const percent = Math.round((current / total) * 100);
                        $progressBar.css('width', percent + '%');
                        $progressText.text(current + ' of ' + total);
                    }
                }
            },
            close() {
                if (this.please_wait) {
                    this.please_wait.close();
                }
            }
        };
        return app;
    }(document, window, jQuery)
); 