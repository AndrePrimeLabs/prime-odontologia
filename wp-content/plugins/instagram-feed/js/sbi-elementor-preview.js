'use strict';

/**
 * Bridges the legacy SBI_Elementor_Widget (registered as `sbi-widget`) to the
 * Elementor frontend element-ready hook so sbi_init() runs inside the
 * preview iframe when the legacy widget mounts.
 *
 * The framework's sb-elementor-editor.js registers the same hook for the
 * modern widget name (sb-instagram-feed). Without this file, a page that
 * has only the legacy widget never triggers sbi_init() in the preview.
 *
 * Loaded only inside Elementor preview by SBI_Elementor_Base::enqueue_preview_feed_assets().
 */
(function () {
	// Cap retries at 40 × 250ms = 10s. Elementor's frontend hooks normally
	// materialize well within a second; bounding the loop prevents a runaway
	// retry chain if a future Elementor version changes its bootstrap sequence.
	var attempts = 0;
	var maxAttempts = 40;
	var bind = function () {
		if (!window.elementorFrontend || !window.elementorFrontend.hooks) {
			if (++attempts >= maxAttempts) {
				return;
			}
			return setTimeout(bind, 250);
		}
		window.elementorFrontend.hooks.addAction(
			'frontend/element_ready/sbi-widget.default',
			function () {
				if (typeof window.sbi_init === 'function') {
					window.sbi_init();
				}
			}
		);
	};
	bind();
})();
