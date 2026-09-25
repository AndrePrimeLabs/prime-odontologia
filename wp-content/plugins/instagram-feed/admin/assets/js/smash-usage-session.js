/**
 * Smash Usage Tracking: session duration and record-event from JS.
 *
 * @package InstagramFeed
 */
(function ($) {
	'use strict';

	if (typeof window.sbiSmashUsageSession === 'undefined') {
		return;
	}

	var config = window.sbiSmashUsageSession;
	var sessionStart = Date.now();

	function sendSessionDuration() {
		var durationSeconds = Math.round((Date.now() - sessionStart) / 1000);
		if (durationSeconds < 3) {
			return;
		}
		if (navigator.sendBeacon) {
			var data = new FormData();
			data.append('action', 'sbi_smash_usage_record_session');
			data.append('nonce', config.nonce);
			data.append('duration_seconds', durationSeconds);
			navigator.sendBeacon(config.ajax_url, data);
		} else {
			$.post(config.ajax_url, {
				action: 'sbi_smash_usage_record_session',
				nonce: config.nonce,
				duration_seconds: durationSeconds
			});
		}
	}

	function recordEvent(eventName) {
		$.post(config.ajax_url, {
			action: 'sbi_smash_usage_record_event',
			nonce: config.event_nonce,
			event_name: eventName
		});
	}

	$(window).on('beforeunload pagehide', function () {
		sendSessionDuration();
	});

	window.sbiSmashUsageRecordEvent = recordEvent;
})(jQuery);
