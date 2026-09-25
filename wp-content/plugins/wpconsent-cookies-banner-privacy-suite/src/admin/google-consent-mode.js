(function ($) {
	'use strict';

	if (!$('body').hasClass('wpconsent_page_wpconsent-cookies')) {
		return;
	}

	const $master = $('#google_consent_mode');
	if (!$master.length) {
		return;
	}

	const subToggleIds = ['#gcm_url_passthrough', '#gcm_ads_data_redaction'];

	function applyState(masterChecked) {
		subToggleIds.forEach(function (id) {
			const $toggle = $(id);
			if (!$toggle.length) {
				return;
			}
			const $row = $toggle.closest('.wpconsent-metabox-form-row-input');
			if (masterChecked) {
				$row.removeClass('disabled');
			} else {
				$row.addClass('disabled');
				$toggle.prop('checked', false);
			}
		});
	}

	$master.on('change', function () {
		applyState(this.checked);
	});

	$(document).ready(function () {
		applyState($master.is(':checked'));
	});
})(jQuery);
