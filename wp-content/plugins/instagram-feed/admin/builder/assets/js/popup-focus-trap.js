/**
 * Admin popup focus trap (SMASH-1378 / F-002).
 *
 * Watches for modal dialogs -- [role="dialog"][aria-modal="true"] -- appearing
 * in the DOM (the IG Free admin popups declared as dialogs via the
 * popup-dialog-roles PR) and:
 *  - saves the element that had focus before the popup opened
 *  - moves focus to the first focusable element inside the popup on open
 *  - traps Tab / Shift+Tab within the popup
 *  - restores focus to the trigger element on close
 *
 * The aria-modal="true" qualifier (SMASH-1915) scopes the trap to genuine
 * modals. Audited across the Free tree there are 16 role="dialog" nodes:
 *  - 13 declare aria-modal="true" -- the real blocking overlays, all trapped
 *  - 2 declare aria-modal="false" -- the onboarding coach-mark tooltips, which
 *    sit beside a dimmer but are non-blocking by design and are v-for'd (every
 *    step mounts at once), so treating them as modals made the trap target an
 *    arbitrary step
 *  - 1 omits aria-modal -- the colour-picker popover, a v-show popover that
 *    must stay Tab-transparent (see DIALOG_SELECTOR below)
 *
 * Pure vanilla JS -- no jQuery dependency. The popups are toggled via Vue's
 * v-if, so we can't hook into a single Vue lifecycle; instead we observe
 * DOM mutations on document.body, which fires whenever Vue adds/removes
 * a popup container.
 */
(function () {
	'use strict';

	// Selector for focusable elements.
	var FOCUSABLE_SELECTOR = [
		'button:not([disabled]):not([tabindex="-1"])',
		'a[href]:not([tabindex="-1"])',
		'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
		'select:not([disabled]):not([tabindex="-1"])',
		'textarea:not([disabled]):not([tabindex="-1"])',
		'[tabindex]:not([tabindex="-1"])'
	].join(', ');

	// SMASH-1915: only REAL modal dialogs get the focus trap. Every Smash
	// Balloon builder popup declares aria-modal="true"; the colour-picker
	// popover (.sb-control-colorpicker-popup) carries role="dialog" +
	// tabindex="-1" but is a NON-modal v-show popover with NO aria-modal.
	// Trapping it broke Tab (couldn't leave an open picker), yanked focus into
	// an open picker from anywhere on the page, and drove spurious focus
	// restores on its mount/unmount. Keying every dialog lookup on
	// [role="dialog"][aria-modal="true"] scopes the trap to genuine modals and
	// excludes the picker from ALL trap behaviours.
	var DIALOG_SELECTOR = '[role="dialog"][aria-modal="true"]';

	// Single-node predicate mirroring DIALOG_SELECTOR, for the
	// MutationObserver paths that inspect one added/removed node at a time.
	function isModalDialog(node) {
		return node.getAttribute
			&& node.getAttribute('role') === 'dialog'
			&& node.getAttribute('aria-modal') === 'true';
	}

	// Map dialog element -> the element that had focus when it opened.
	// Keys are weakly referenced via WeakMap so we don't leak when Vue
	// destroys the popup nodes.
	var triggerMap = new WeakMap();

	// Currently focused dialog (the topmost / most recently opened).
	var activeDialog = null;

	function getVisibleFocusables(container) {
		var nodes = container.querySelectorAll(FOCUSABLE_SELECTOR);
		var visible = [];
		for (var i = 0; i < nodes.length; i++) {
			var el = nodes[i];
			// offsetParent is null for display:none ancestors -- skip those.
			// Edge case: position:fixed elements also have null offsetParent
			// even when visible, so fall back to getClientRects() (mirrors the
			// same check in isDialogVisible). Currently-focused elements are
			// always kept regardless of computed visibility, since blurring
			// the focus mid-trap would break the cycle.
			if (el.offsetParent === null && el !== document.activeElement) {
				if (el.getClientRects().length === 0) continue;
			}
			visible.push(el);
		}
		return visible;
	}

	function isDialogVisible(dialog) {
		if (!dialog || !dialog.isConnected) return false;
		// Vue's v-if removes from DOM entirely, but some popups use v-show
		// (display:none). offsetParent catches both.
		if (dialog.offsetParent === null) {
			// Edge case: position:fixed dialogs have null offsetParent even
			// when visible. Fall back to checking getClientRects.
			return dialog.getClientRects().length > 0;
		}
		return true;
	}

	function onDialogOpen(dialog) {
		// Save trigger (whatever had focus just before this popup mounted).
		// document.activeElement at MutationObserver-time is the most
		// reliable "what was focused before Vue inserted this" we can get.
		var trigger = document.activeElement;
		if (trigger && trigger !== document.body) {
			triggerMap.set(dialog, trigger);
		}
		activeDialog = dialog;

		// Focus the first focusable element inside the dialog. Defer one
		// frame so Vue has finished rendering child nodes -- v-if can mount
		// the wrapper before its descendants in some edge cases.
		requestAnimationFrame(function () {
			var focusables = getVisibleFocusables(dialog);
			if (!focusables.length) return;
			try { focusables[0].focus(); } catch (e) { /* element gone */ }
		});
	}

	function onDialogClose(dialog) {
		if (activeDialog === dialog) activeDialog = null;
		var trigger = triggerMap.get(dialog);
		triggerMap.delete(dialog);
		if (trigger && document.body.contains(trigger)) {
			try { trigger.focus(); } catch (e) { /* trigger gone */ }
		}
	}

	// Resolve the topmost visible modal dialog -- a click in the
	// customizer can open a second-level popup over the first, so Tab/Esc
	// should always target the innermost / most recently opened dialog.
	function getTopmostVisibleDialog() {
		var dialogs = document.querySelectorAll(DIALOG_SELECTOR);
		for (var i = dialogs.length - 1; i >= 0; i--) {
			if (isDialogVisible(dialogs[i])) return dialogs[i];
		}
		return null;
	}

	function trapKeydown(e) {
		var isTab = e.key === 'Tab' || e.keyCode === 9;
		if (!isTab) return;
		var dialog = getTopmostVisibleDialog();
		if (!dialog) return;

		var focusables = getVisibleFocusables(dialog);
		if (!focusables.length) return;
		var first = focusables[0];
		var last = focusables[focusables.length - 1];
		var active = document.activeElement;
		var insideDialog = dialog.contains(active);

		if (e.shiftKey) {
			if (!insideDialog || active === first) {
				e.preventDefault();
				try { last.focus(); } catch (err) {}
			}
		} else {
			if (!insideDialog || active === last) {
				e.preventDefault();
				try { first.focus(); } catch (err) {}
			}
		}
	}

	// Esc-to-close. Every builder popup ships a `.sbi-fb-popup-cls` close
	// button wired to the Vue method that toggles the dialog's v-if off.
	// Synthesizing a click on that button -- rather than emitting a Vue
	// event or mutating reactive state -- keeps this script
	// framework-agnostic and reuses each popup's existing close path
	// (which already handles cleanup like resetting form state, etc.).
	// Focus restoration happens via the MutationObserver-driven
	// onDialogClose when Vue unmounts the dialog node.
	function escKeydown(e) {
		var isEsc = e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
		if (!isEsc) return;
		var dialog = getTopmostVisibleDialog();
		if (!dialog) return;
		// Prefer the canonical X button so we hit each popup's bespoke
		// close handler. Fall back to any [data-sbi-dialog-close] hook
		// for future popups that don't follow the .sbi-fb-popup-cls
		// convention, then to the dialog's own close-button aria-label.
		var closeBtn = dialog.querySelector('.sbi-fb-popup-cls')
			|| dialog.querySelector('[data-sbi-dialog-close]')
			|| dialog.querySelector('button[aria-label*="Close" i]');
		if (!closeBtn) return;
		e.preventDefault();
		e.stopPropagation();
		try { closeBtn.click(); } catch (err) { /* button gone */ }
	}

	// Single document-level keydown listener (capture phase so we run
	// before Vue's internal handlers).
	document.addEventListener('keydown', trapKeydown, true);
	document.addEventListener('keydown', escKeydown, true);

	// Observe popups being inserted / removed by Vue's v-if.
	var observer = new MutationObserver(function (mutations) {
		for (var i = 0; i < mutations.length; i++) {
			var m = mutations[i];
			// Added nodes -- check if any are (or contain) a modal dialog.
			for (var a = 0; a < m.addedNodes.length; a++) {
				var added = m.addedNodes[a];
				if (added.nodeType !== 1) continue;
				if (isModalDialog(added)) {
					onDialogOpen(added);
				} else if (added.querySelectorAll) {
					var nested = added.querySelectorAll(DIALOG_SELECTOR);
					for (var n = 0; n < nested.length; n++) onDialogOpen(nested[n]);
				}
			}
			// Removed nodes -- restore focus if a dialog disappeared.
			for (var r = 0; r < m.removedNodes.length; r++) {
				var removed = m.removedNodes[r];
				if (removed.nodeType !== 1) continue;
				if (isModalDialog(removed)) {
					onDialogClose(removed);
				} else if (removed.querySelectorAll) {
					var nestedR = removed.querySelectorAll(DIALOG_SELECTOR);
					for (var nr = 0; nr < nestedR.length; nr++) onDialogClose(nestedR[nr]);
				}
			}
		}
	});

	function startObserving() {
		observer.observe(document.body, { childList: true, subtree: true });

		// Pick up any dialogs already in the DOM at script-load time
		// (defensive -- unlikely but possible if the builder mounts before
		// this script runs).
		var existing = document.querySelectorAll(DIALOG_SELECTOR);
		for (var i = 0; i < existing.length; i++) {
			if (isDialogVisible(existing[i])) onDialogOpen(existing[i]);
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', startObserving);
	} else {
		startObserving();
	}
})();
