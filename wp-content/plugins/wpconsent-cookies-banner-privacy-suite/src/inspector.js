/**
 * WPConsent Cookie Inspector - Entry Point.
 *
 * Wires the collector, storage, matcher, and panel modules together.
 * Exposes window.WPConsentInspector for Pro extensions.
 */

import './inspector/panel.css';
import { captureExistingCookies, installInterceptor, clearNonEssentialCookies, processEarlyQueue } from './inspector/collector';
import * as storage from './inspector/storage';
import * as matcher from './inspector/matcher';
import { createPanel, HINT_KEY } from './inspector/panel';
import { VISITED_PAGES_KEY, getVisitedCount } from './inspector/visited-pages';

/* global wpconsentInspector */

( function () {
	if ( typeof wpconsentInspector === 'undefined' ) {
		return;
	}

	const config = wpconsentInspector;
	const SESSION_INIT_KEY = 'wpconsent_inspector_initialized';

	// Session reset: on first load, clear non-essential cookies and reload.
	try {
		if ( ! sessionStorage.getItem( SESSION_INIT_KEY ) ) {
			sessionStorage.setItem( SESSION_INIT_KEY, '1' );
			clearNonEssentialCookies();
			window.location.reload();
			return;
		}
	} catch ( e ) {
		// SessionStorage unavailable (e.g. Safari private mode) -- skip reset but continue.
	}

	// Record current page in the visited-pages list for this inspection session.
	try {
		const raw = sessionStorage.getItem( VISITED_PAGES_KEY );
		const visited = raw ? JSON.parse( raw ) : [];
		const path = window.location.pathname;
		if ( ! visited.includes( path ) ) {
			visited.push( path );
			sessionStorage.setItem( VISITED_PAGES_KEY, JSON.stringify( visited ) );
		}
	} catch ( e ) {
		// SessionStorage unavailable — skip tracking.
	}

	// Detect consent by watching for the wpconsent_preferences cookie.
	// We can't use the wpconsent_consent_saved event because unlockScripts
	// runs before the event fires, so cookies are set before the event.
	let consentGiven = /(^|;\s*)wpconsent_preferences=/.test( document.cookie );

	// Callbacks that Pro can hook into.
	const hooks = {
		onCookieDetected: [],
	};

	// Debounce panel renders so rapid cookie detections coalesce into one DOM update.
	let renderTimer = null;
	function scheduleRender() {
		if ( ! renderTimer ) {
			renderTimer = requestAnimationFrame( () => {
				renderTimer = null;
				if ( panel ) {
					panel.render();
				}
			} );
		}
	}

	/**
	 * Handle a newly detected cookie (from interception or snapshot).
	 *
	 * @param {Object} cookieData - Cookie data from collector.
	 */
	function handleCookieDetected( cookieData ) {
		// Detect consent boundary: when wpconsent_preferences is set, consent was just given.
		if ( ! consentGiven && 'wpconsent_preferences' === cookieData.name ) {
			consentGiven = true;
		}

		cookieData.consentState = consentGiven ? 'post-consent' : 'pre-consent';

		storage.addCookie( cookieData );

		// Notify registered hooks (used by Pro for tracing).
		hooks.onCookieDetected.forEach( ( callback ) => {
			try {
				callback( cookieData );
			} catch ( e ) {
				// Silently catch hook errors.
			}
		} );

		scheduleRender();
	}

	/**
	 * Handle stop inspector action.
	 */
	function handleStop() {
		const formData = new FormData();
		formData.append( 'action', 'wpconsent_inspector_deactivate' );
		formData.append( 'nonce', config.nonce );
		formData.append( 'pages_count', getVisitedCount() );

		fetch( config.ajaxurl, {
			method: 'POST',
			credentials: 'same-origin',
			body: formData,
		} ).finally( () => {
			cleanup();
			panel.destroy();
			storage.clear();
			sessionStorage.removeItem( SESSION_INIT_KEY );
			sessionStorage.removeItem( VISITED_PAGES_KEY );
			sessionStorage.removeItem( HINT_KEY );
			window.WPConsentInspector = null;
			window.location.href = config.review_url;
		} );
	}

	/**
	 * Handle review cookies action from the panel.
	 * Saves unknown cookies to the database for admin review and redirects.
	 *
	 * @param {Array} unknownCookies - Array of unknown cookie data objects.
	 */
	function handleReview( unknownCookies ) {
		const cookiesToSave = unknownCookies.map( ( c ) => {
			const data = {
				name: c.name,
				value: c.value || '',
				pages: c.pages || [],
				consentState: c.consentState || 'pre-consent',
				duration: c.duration || null,
			};

			// Include trace data if available (Pro tracer enriches this).
			if ( c.traces && Object.keys( c.traces ).length > 0 ) {
				for ( const page of Object.keys( c.traces ) ) {
					const trace = c.traces[ page ];
					if ( trace.suggestedPattern ) {
						data.scriptUrl = trace.scriptUrl || '';
						data.suggestedPattern = trace.suggestedPattern;
						if ( trace.inlineScript ) {
							data.inlineScript = trace.inlineScript;
						}
						break;
					}
				}
			}

			return data;
		} );

		const body = new FormData();
		body.append( 'action', 'wpconsent_inspector_save_for_review' );
		body.append( 'nonce', config.nonce );
		body.append( 'cookies', JSON.stringify( cookiesToSave ) );
		body.append( 'pages_count', getVisitedCount() );

		fetch( config.ajaxurl, {
			method: 'POST',
			credentials: 'same-origin',
			body,
		} )
			.then( ( response ) => response.json() )
			.then( ( response ) => {
				if ( response.success ) {
					cleanup();
					panel.destroy();
					storage.clear();
					sessionStorage.removeItem( SESSION_INIT_KEY );
					sessionStorage.removeItem( VISITED_PAGES_KEY );
					sessionStorage.removeItem( HINT_KEY );
					window.WPConsentInspector = null;
					window.location.href = response.data.review_url;
				}
			} );
	}

	// Create and mount the panel.
	const panel = createPanel( {
		storage,
		matcher,
		config,
		onStop: handleStop,
		onReview: handleReview,
		isConsentGiven: () => consentGiven,
	} );

	panel.mount();

	// Process cookies captured by the early <head> interceptor (includes duration).
	processEarlyQueue( handleCookieDetected );

	// Capture any remaining pre-existing cookies (e.g. server-set via HTTP headers).
	const existingCookies = captureExistingCookies();
	existingCookies.forEach( handleCookieDetected );

	// Install interception for new cookies going forward.
	const cleanup = installInterceptor( handleCookieDetected );

	// Expose API for Pro extensions.
	window.WPConsentInspector = {
		hooks,
		storage,
		matcher,
		panel,
		config,
	};
}() );
