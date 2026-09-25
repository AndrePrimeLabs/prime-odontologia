/**
 * Consent log "Banner Context" modal.
 *
 * Click handler for the context column eye icon. Reads the snapshot id from
 * the button, fetches the snapshot JSON via admin-ajax on demand, and opens
 * a read-only modal. Lazy fetching avoids joining the snapshots table — and
 * pulling 20 LONGTEXT payloads — on every consent logs page render.
 */
(function () {
	'use strict';

	function escapeHtml(str) {
		const div = document.createElement('div');
		div.textContent = String(str);
		return div.innerHTML;
	}

	// Defense-in-depth: only allow http(s) URLs in href. The server already
	// sanitizes via esc_url_raw and clean_url() in the canonicalizer, but
	// never trust stored values in JS.
	function safeUrl(url) {
		const s = String(url);
		return /^https?:\/\//i.test(s) ? s : '#';
	}

	function renderSnapshot(snapshot) {
		const rows = [];
		const labels = window.wpconsentConsentLogDetail || {};

		if (snapshot.banner_message) {
			rows.push(
				'<div class="wpconsent-snapshot-row"><strong>' +
					escapeHtml(labels.banner_message || 'Banner message') +
					'</strong><p>' +
					escapeHtml(snapshot.banner_message) +
					'</p></div>'
			);
		}

		if (snapshot.language) {
			rows.push(
				'<div class="wpconsent-snapshot-row"><strong>' +
					escapeHtml(labels.language || 'Language') +
					'</strong><code>' +
					escapeHtml(snapshot.language) +
					'</code></div>'
			);
		}

		if (snapshot.policy_page_url) {
			rows.push(
				'<div class="wpconsent-snapshot-row"><strong>' +
					escapeHtml(labels.policy_page_url || 'Policy page') +
					'</strong><a href="' +
					escapeHtml(safeUrl(snapshot.policy_page_url)) +
					'" target="_blank" rel="noopener">' +
					escapeHtml(snapshot.policy_page_url) +
					'</a></div>'
			);
		}

		if (snapshot.button_labels) {
			const btns = snapshot.button_labels;
			const items = [];
			if (btns.accept) items.push('<li>' + escapeHtml(labels.accept || 'Accept') + ': ' + escapeHtml(btns.accept) + '</li>');
			if (btns.reject) items.push('<li>' + escapeHtml(labels.reject || 'Reject') + ': ' + escapeHtml(btns.reject) + '</li>');
			if (btns.preferences) items.push('<li>' + escapeHtml(labels.preferences || 'Preferences') + ': ' + escapeHtml(btns.preferences) + '</li>');
			if (items.length) {
				rows.push(
					'<div class="wpconsent-snapshot-row"><strong>' +
						escapeHtml(labels.buttons || 'Buttons') +
						'</strong><ul>' +
						items.join('') +
						'</ul></div>'
				);
			}
		}

		if (Array.isArray(snapshot.categories) && snapshot.categories.length) {
			const catItems = snapshot.categories.map(function (cat) {
				return (
					'<li><strong>' +
					escapeHtml(cat.name || cat.slug) +
					'</strong>' +
					(cat.description ? ' &mdash; ' + escapeHtml(cat.description) : '') +
					'</li>'
				);
			});
			rows.push(
				'<div class="wpconsent-snapshot-row"><strong>' +
					escapeHtml(labels.categories || 'Categories') +
					'</strong><ul>' +
					catItems.join('') +
					'</ul></div>'
			);
		}

		return '<div class="wpconsent-snapshot-modal-body">' + rows.join('') + '</div>';
	}

	// jquery-confirm is imported by the Lite admin bundle (src/admin/common.js)
	// and the Lite bundle is always enqueued on wpconsent admin screens alongside
	// the Pro bundle — both enqueue hooks run on admin_enqueue_scripts for any
	// screen whose id contains "wpconsent". The alert() branch is a paranoia
	// fallback for unexpected load orders.
	function openModal(titleHtml, contentHtml, closeLabel) {
		if (typeof window.jQuery !== 'undefined' && typeof window.jQuery.confirm === 'function') {
			return window.jQuery.confirm({
				title: titleHtml,
				content: contentHtml,
				type: 'blue',
				boxWidth: '560px',
				useBootstrap: false,
				buttons: {
					close: {
						text: closeLabel,
						btnClass: 'btn-blue',
					},
				},
			});
		}
		alert(titleHtml + '\n\n' + contentHtml.replace(/<[^>]+>/g, ''));
		return null;
	}

	function fetchSnapshot(id, labels) {
		const body = new URLSearchParams();
		body.append('action', labels.ajax_action || '');
		body.append('id', String(id));
		body.append('nonce', labels.nonce || '');

		return fetch(labels.ajax_url, {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
			body: body.toString(),
		})
			.then(function (response) {
				return response.json().then(function (json) {
					return { ok: response.ok && json && json.success, json: json };
				});
			});
	}

	// Tracks snapshot ids with an in-flight fetch so a double-click does not
	// fire two requests and race their setContent() calls into the modal.
	const inFlight = Object.create(null);

	document.addEventListener('click', function (event) {
		const trigger = event.target.closest('.wpconsent-consent-context-trigger');
		if (!trigger) {
			return;
		}
		event.preventDefault();

		const labels = window.wpconsentConsentLogDetail || {};
		const title  = labels.title || 'Banner Context';
		const close  = labels.close || 'Close';
		const id     = parseInt(trigger.getAttribute('data-snapshot-id') || '0', 10);

		if (!id || !labels.ajax_url || inFlight[id]) {
			return;
		}
		inFlight[id] = true;

		// Open the modal immediately with a loading state so the click feels
		// responsive even on a slow connection; swap the body in on response.
		const loadingHtml = '<div class="wpconsent-snapshot-modal-body"><p>' +
			escapeHtml(labels.loading || 'Loading…') + '</p></div>';
		const dialog = openModal(title, loadingHtml, close);

		fetchSnapshot(id, labels).then(function (result) {
			let html;
			if (result.ok && result.json && result.json.data) {
				html = renderSnapshot(result.json.data);
			} else {
				const message = (result.json && result.json.data && result.json.data.message) ||
					labels.load_error || 'Could not load banner context.';
				html = '<div class="wpconsent-snapshot-modal-body"><p>' + escapeHtml(message) + '</p></div>';
			}
			if (dialog && typeof dialog.setContent === 'function') {
				dialog.setContent(html);
			}
		}).catch(function () {
			const html = '<div class="wpconsent-snapshot-modal-body"><p>' +
				escapeHtml(labels.load_error || 'Could not load banner context.') + '</p></div>';
			if (dialog && typeof dialog.setContent === 'function') {
				dialog.setContent(html);
			}
		}).finally(function () {
			delete inFlight[id];
		});
	});
})();
