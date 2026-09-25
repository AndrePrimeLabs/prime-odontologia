function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("sbi-support-tool-tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("sbi-support-tool-tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
        tablinks[i].setAttribute('aria-selected', 'false');
        tablinks[i].setAttribute('tabindex', '-1');
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    evt.currentTarget.setAttribute('aria-selected', 'true');
    evt.currentTarget.setAttribute('tabindex', '0');
}

// Keyboard arrow navigation for the support-tools tablist (WCAG ARIA Authoring
// Practices: Left/Right arrows move between tabs, Home/End jump to first/last).
// Scope the listener to each tablist container so unrelated tablists on the
// same page can't interfere with each other and the query stays cheap.
(function () {
    var tablists = document.querySelectorAll('.sbi-support-tool-tab[role="tablist"]');
    for (var t = 0; t < tablists.length; t++) {
        tablists[t].addEventListener('keydown', function (e) {
            var target = e.target;
            if (!target || !target.classList || !target.classList.contains('sbi-support-tool-tablinks')) return;
            var tabs = Array.prototype.slice.call(this.querySelectorAll('.sbi-support-tool-tablinks'));
            if (!tabs.length) return;
            var idx = tabs.indexOf(target);
            if (idx < 0) return;
            var next = null;
            if (e.key === 'ArrowRight' || e.keyCode === 39) next = tabs[(idx + 1) % tabs.length];
            else if (e.key === 'ArrowLeft' || e.keyCode === 37) next = tabs[(idx - 1 + tabs.length) % tabs.length];
            else if (e.key === 'Home' || e.keyCode === 36) next = tabs[0];
            else if (e.key === 'End' || e.keyCode === 35) next = tabs[tabs.length - 1];
            if (!next) return;
            e.preventDefault();
            next.focus();
            next.click();
        });
    }
})();

jQuery(document).ready(function ($) {
    function handleAjaxRequest(nonce, data, successCallback) {
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'sbi_get_api_calls_handler',
                nonce: nonce,
                ...data,
            },
            success: successCallback,
        });
    }

    function handleResponse(response, responseDiv) {
        let responseDivMessage = responseDiv.find('.sbi-response-message');

        if (response.success) {
            let api_response = response['data']['api_response'];

            if (api_response['data'] && api_response['data'][0]) {
                let post = api_response['data'][0];
                let id = post['id'];
                let media_type = post['media_type'] ? post['media_type'] : post['media_product_type'];
                let media_url = post['media_url'] ? post['media_url'] : post['thumbnail_url'];
                let caption = post['caption'] ? post['caption'] : '';
                let permalink = post['permalink'];

                responseDivMessage.html('<div class="sbi-response-success-preview"><div class="sbi-post"><a href="' + permalink + '" target="_blank"><img height=250 src="' + media_url + '" alt="Instagram Post"></a></div><div class="sbi-post-details"><p><strong>ID:</strong> ' + id + '</p><p><strong>Media Type:</strong> ' + media_type + '</p><p><strong>Caption:</strong> ' + caption + '</p><p><strong>Permalink:</strong> <a href="' + permalink + '" target="_blank">' + permalink + '</a></p></div></div>');

                responseDivMessage.append('<div class="sbi-response-success"><pre>' + JSON.stringify(api_response, null, 2) + '</pre></div>');
            } else {
                responseDivMessage.html('<div class="sbi-response-success"><pre>' + JSON.stringify(api_response, null, 2) + '</pre></div>');
            }
        } else {
            responseDivMessage.html('<div class="sbi-response-error"><pre>' + JSON.stringify(response['data'], null, 2) + '</pre></div>');
        }
    }

    $('.sbi-get-account-info').on('click', function (e) {
        e.preventDefault();
        $('.sbi-response-message').html('');
        $('.sbi-checkboxes').hide();
        $('.sbi-hashtags-inner').hide();

        let user_id = $(this).data('user-id');
        let account_type = $(this).data('account-type');
        let connect_type = $(this).data('connect-type');
        let nonce = sbi_support_tool.nonce;
        let ajax_action = 'user_info';

        let responseDiv = $('.sbi-response[data-id="' + user_id + '"]');
        responseDiv.html('<div class="sbi-response-message"><p>Loading...</p></div>');

        handleAjaxRequest(nonce, {user_id, account_type, connect_type, ajax_action}, function (response) {
            handleResponse(response, responseDiv);
        });
    });

    $('.sbi-get-media').on('click', function (e) {
        e.preventDefault();
        $('.sbi-response-message').html('');
        $('.sbi-hashtags-inner').hide();

        // reset to default, do not change the checkbox with disabled and checked, only change the checkbox without disabled and checked.
        $('.sbi-checkboxes input[type="checkbox"]').prop('checked', false);
        $('.sbi-checkboxes input[type="checkbox"]').prop('disabled', false);
        $('.sbi-checkboxes input[type="checkbox"]').each(function () {
            if ($(this).val() === 'id' || $(this).val() === 'username' || $(this).val() === 'media_type' || $(this).val() === 'media_product_type' || $(this).val() === 'timestamp' || $(this).val() === 'permalink' || $(this).val() === 'caption' || $(this).val() === 'media_url') {
                $(this).prop('checked', true);
                $(this).prop('disabled', true);
            }
        });
        $('.sbi-checkboxes').hide();

        let checkboxes = $(this).siblings('.sbi-checkboxes');
        checkboxes.show();
    });

    $('.sbi-confirm').on('click', function (e) {
        e.preventDefault();
        $('.sbi-response-message').html('');
        $('.sbi-checkboxes').hide();

        let user_id = $(this).data('user-id');
        let account_type = $(this).data('account-type');
        let nonce = sbi_support_tool.nonce;
        let post_limit = $(this).parents('.sbi-checkboxes').find('input[name="sbi_post_limit"]').val();
        let ajax_action = 'media';
        let media_fields = '';

        let checkboxes = $(this).parents('.sbi-checkboxes');
        checkboxes.find('input[type="checkbox"]:checked').each(function () {
            media_fields += $(this).val() + ',';
        });

        media_fields = media_fields.slice(0, -1); // Remove the trailing comma

        let responseDiv = $('.sbi-response[data-id="' + user_id + '"]');
        responseDiv.html('<div class="sbi-response-message"><p>Loading...</p></div>');

        handleAjaxRequest(nonce, {user_id, account_type, media_fields, post_limit, ajax_action}, function (response) {
            handleResponse(response, responseDiv);
        });
    });

    $('.sbi-cancel').on('click', function (e) {
        e.preventDefault();
        $('.sbi-checkboxes').hide();
    });
});