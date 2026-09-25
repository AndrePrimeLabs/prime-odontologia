jQuery(function($) {
    $('.wpconsent-select').on('change', function() {
        const target = $(this).data('target');
        const targetProperty = $(this).data('target-property');

        if (target && targetProperty) {
            const targetElement = document.getElementById('wpconsent-container').shadowRoot.querySelector(target);
            if ( 'class' === targetProperty ) {
                const classPrefix = $(this).data('prefix') || '';
                const cssClass = classPrefix + $(this).val();

                // Remove the classes that start with the prefix.
                if (classPrefix) {
                    $(targetElement).removeClass(function(index, className) {
                        return (className.match(new RegExp('\\b' + classPrefix + '\\S+', 'g')) || []).join(' ');
                    });
                }

                // Add new value class.
                $(targetElement).addClass(cssClass);
            } else {
                $(targetElement).css(targetProperty, $(this).val());
            }
        }
    });
});