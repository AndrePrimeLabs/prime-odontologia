jQuery(document).ready($ => {
    const $previews = $('.wpconsent-floating-button-preview');
    const $input = $('#consent_floating_icon');
    const $floatingButtonGrid = $('.wpconsent-floating-button-grid');
    
    $('#banner_background_color').on('irischange', function(event, ui) {
        $floatingButtonGrid.css('--wpconsent-floating-button-bg', ui.color.toString());
    });

    $('#banner_text_color').on('irischange', function(event, ui) {
        const color = ui.color.toString();
        $floatingButtonGrid.css('--wpconsent-floating-button-color', color);
        $floatingButtonGrid.find('svg path').attr('fill', color);
    });
    
    $previews.on('click', function(e) {
        const $preview = $(this);
        const isCustom = $preview.data('icon') === 'custom';
        
        if (isCustom) {
            e.preventDefault();
            e.stopPropagation();
            
            const mediaUploader = wp.media({
                title: 'Select Icon Image',
                button: {
                    text: 'Select'
                },
                multiple: false
            });

            mediaUploader.on('select', function() {
                const attachment = mediaUploader.state().get('selection').first().toJSON();
                $preview.find('img').remove();
                $preview.append(`<img src="${attachment.url}" alt="">`);
                $previews.removeClass('selected');
                $preview.addClass('selected has-image');
                $input.val(attachment.url);
            });

            mediaUploader.open();
        } else {
            $previews.removeClass('selected');
            $preview.addClass('selected');
            $input.val($preview.data('icon'));
        }
    });

    // Set initial selection
    const savedIcon = $input.val();
    if (savedIcon) {
        // Check if the saved value is a URL (custom image)
        if (savedIcon.startsWith('http://') || savedIcon.startsWith('https://')) {
            $('#floating-icon-custom').addClass('selected has-image');
        } else {
            // It's a predefined icon
            $(`#floating-icon-${savedIcon}`).addClass('selected');
        }
    } else {
        // Default to preferences icon if no value is saved
        $('#floating-icon-preferences').addClass('selected');
        $input.val('preferences');
    }
}); 