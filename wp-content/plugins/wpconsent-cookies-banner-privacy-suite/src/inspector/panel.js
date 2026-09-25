/**
 * Inspector Panel Module.
 *
 * Renders a floating panel on the frontend showing detected cookies
 * grouped by consent-aware urgency, with guidance prompts to walk
 * the admin through the inspection flow.
 */

/* eslint-disable @wordpress/no-global-event-listener */

import { getVisitedPaths, getVisitedCount } from './visited-pages';

export const HINT_KEY = 'wpconsent_inspector_hint_shown';

/**
 * Create the inspector panel and attach it to the DOM.
 *
 * @param {Object}   deps - Dependencies.
 * @param {Object}   deps.storage - Storage module.
 * @param {Object}   deps.matcher - Matcher module.
 * @param {Object}   deps.config - Localized config (wpconsentInspector).
 * @param {Function} deps.onStop - Callback when stop button is clicked.
 * @param {Function} deps.onReview - Callback when Review Cookies is clicked.
 * @param {Function} deps.isConsentGiven - Returns whether consent has been given.
 * @return {Object} Panel API with mount(), render(), and destroy() methods.
 */
	// WPConsent shield logo as inline SVG for the toggle button and header.
	const LOGO_SVG = '<svg width="20" height="20" viewBox="0 0 145 100" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#c)"><path d="M7.72 43.85l25.03-.03c1.56 0 3-.85 3.77-2.21L56.24 6.63h-.03c.4-.66.65-1.43.65-2.26C56.86 2 54.96.07 52.6.01H27.55c-1.56 0-3 .85-3.77 2.21L3.95 37.39c-1.63 2.9.46 6.47 3.79 6.47h-.02Z" fill="currentColor"/><path d="M144.42 50c0-.81-.23-1.56-.62-2.21L120.34 6.17l-17.51 30.97 6.11 10.84c.34.62.52 1.33.52 2.1 0 .7-.19 1.35-.48 1.94l-23.12 41.04c-.51.71-.82 1.59-.82 2.55 0 2.41 1.94 4.35 4.34 4.39h24.99c1.56 0 3-.85 3.77-2.21l25.86-45.88h-.03c.27-.57.44-1.2.44-1.75Z" fill="currentColor"/><path d="M99.8 30.01L116.87 0H84.68s0 0 0 .01h-.15c-1.72 0-3.21 1.01-3.91 2.47L46.63 62.56a3.44 3.44 0 0 1-3.85 1.8 3.43 3.43 0 0 1-2.08-1.67l-5.77-10.23a3.42 3.42 0 0 0-2.97-1.72H4.34c-3.32 0-5.39 3.58-3.76 6.47l23.25 41.24c.77 1.36 2.21 2.21 3.77 2.21h29.73c.04 0 .07 0 .11 0 1.66 0 3.09-.93 3.83-2.3l21.32-37.44 12.92-22.71 3.8-6.68.49-.86Z" fill="currentColor"/></g></svg>';

export function createPanel( { storage, matcher, config, onStop, onReview, isConsentGiven } ) {
	let panelEl = null;
	let toggleEl = null;
	let badgeEl = null;
	let adminContextCollapsed = true;

	/**
	 * Escape HTML entities in a string.
	 *
	 * @param {string} str - Raw string.
	 * @return {string} Escaped string.
	 */
	function esc( str ) {
		const div = document.createElement( 'div' );
		div.appendChild( document.createTextNode( str ) );
		return div.innerHTML;
	}

	/**
	 * Render suggested next pages, excluding the current page and already-visited pages.
	 *
	 * @return {string} HTML for the suggested pages block, or empty string if none.
	 */
	function renderSuggestedPages() {
		const pages = config.suggestedPages;
		if ( ! pages || 0 === pages.length ) {
			return '';
		}

		const visitedPaths = getVisitedPaths();
		const currentPath = window.location.pathname;
		const suggestions = pages.filter( ( page ) => {
			try {
				const pagePath = new URL( page.url ).pathname;
				return pagePath !== currentPath && ! visitedPaths.includes( pagePath );
			} catch ( e ) {
				return false;
			}
		} );

		if ( 0 === suggestions.length ) {
			return '';
		}

		const links = suggestions.map( ( page ) => {
			return '<a href="' + esc( page.url ) + '" class="wpconsent-inspector-suggested-link">' + esc( page.label ) + '</a>';
		} ).join( '' );

		return '<div class="wpconsent-inspector-suggested-pages">' +
			'<span class="wpconsent-inspector-suggested-label">' + esc( config.i18n.suggestedPagesLabel ) + '</span>' +
			links +
			'</div>';
	}

	/**
	 * Render a single cookie row.
	 *
	 * @param {Object} cookieData - The cookie data object.
	 * @param {string} group - The classification group: 'needsAttention', 'unknown', 'adminContext', or 'ok'.
	 * @return {string} HTML for the cookie row.
	 */
	function renderCookie( cookieData, group ) {
		const pageCount = cookieData.pages ? cookieData.pages.length : 0;
		const metaParts = [];

		if ( cookieData.matchedTo ) {
			metaParts.push( esc( cookieData.matchedTo.category ) );
			if ( cookieData.matchedTo.service ) {
				metaParts.push( esc( cookieData.matchedTo.service ) );
			}
		}

		if ( pageCount > 0 ) {
			metaParts.push( pageCount + ' ' + ( 1 === pageCount ? config.i18n.pageSingular : config.i18n.pagePlural ) );
		}

		let warningHtml = '';
		if ( 'needsAttention' === group ) {
			if ( cookieData.matchedTo ) {
				warningHtml = '<div class="wpconsent-inspector-cookie-warning">' + esc( config.i18n.blockingRuleWarning ) + '</div>';
			} else {
				warningHtml = '<div class="wpconsent-inspector-cookie-warning">' + esc( config.i18n.undocumentedWarning ) + '</div>';
			}
		}

		const badgeHtml = 'adminContext' === group
			? `<span class="wpconsent-inspector-cookie-badge wpconsent-inspector-cookie-badge-admin-context">${ esc( config.i18n.adminOnlyBadge ) }</span>`
			: '';

		return `
			<div class="wpconsent-inspector-cookie" data-cookie-name="${ esc( cookieData.name ) }">
				<div class="wpconsent-inspector-cookie-name">${ esc( cookieData.name ) }${ badgeHtml }</div>
				<div class="wpconsent-inspector-cookie-meta">${ metaParts.join( ' &middot; ' ) }</div>
				${ warningHtml }
			</div>
		`;
	}

	/**
	 * Get the translated label for the current inspector mode.
	 *
	 * @return {string} Mode label.
	 */
	function getModeLabel() {
		const i18n = config.i18n;
		const labels = {
			optin: i18n.modeOptin,
			optout: i18n.modeOptout,
			discovery: i18n.modeDiscovery,
		};
		return labels[ config.inspectorMode ] || labels.optin;
	}

	/**
	 * Get a guidance message based on the current inspector state.
	 *
	 * @param {Object} classified - The classified cookie groups.
	 * @param {number} totalCount - Total cookies detected.
	 * @return {string} HTML for the guidance prompt.
	 */
	function getGuidance( classified, totalCount ) {
		const hasConsent = isConsentGiven();
		const issueCount = classified.needsAttention.length + classified.unknown.length;
		const i18n = config.i18n;

		if ( 0 === totalCount ) {
			return '<div class="wpconsent-inspector-guidance">' + esc( i18n.guidanceNoCookies ) + '</div>';
		}

		if ( ! hasConsent ) {
			if ( issueCount > 0 ) {
				const cookieWord = 1 === issueCount ? i18n.cookieSingular : i18n.cookiePlural;
				const cssClass = config.scriptBlockingEnabled ? 'wpconsent-inspector-guidance-warning' : '';
				return '<div class="wpconsent-inspector-guidance ' + cssClass + '">' +
					issueCount + ' ' + esc( cookieWord ) + ' ' + esc( i18n.guidancePreBoundaryIssues ) + '</div>';
			}
			return '<div class="wpconsent-inspector-guidance">' + esc( i18n.guidancePreBoundaryClean ) + '</div>';
		}

		if ( issueCount > 0 ) {
			const cookieWord = 1 === issueCount ? i18n.cookieSingular : i18n.cookiePlural;
			return '<div class="wpconsent-inspector-guidance wpconsent-inspector-guidance-action">' +
				issueCount + ' ' + esc( cookieWord ) + ' ' + esc( i18n.guidancePostBoundaryIssues ) + '</div>';
		}

		const visitedCount = getVisitedCount();
		const guidanceText = 1 === visitedCount
			? i18n.thisPageLooksGood
			: visitedCount + ' ' + i18n.pagesInspectedGood;
		return '<div class="wpconsent-inspector-guidance wpconsent-inspector-guidance-success">' + esc( guidanceText ) + '</div>';
	}

	let hintEl = null;

	/**
	 * Show a tooltip hint pointing to the minimize button.
	 * Created as a fixed-position element on document.body so it survives
	 * panel re-renders. Dismisses on click or after 6 seconds.
	 * Only shown once per inspection session.
	 */
	function showMinimizeHint() {
		if ( hintEl ) {
			return;
		}

		try {
			if ( sessionStorage.getItem( HINT_KEY ) ) {
				return;
			}
			sessionStorage.setItem( HINT_KEY, '1' );
		} catch ( e ) {
			// SessionStorage unavailable — show anyway.
		}

		hintEl = document.createElement( 'div' );
		hintEl.className = 'wpconsent-inspector-hint';
		hintEl.textContent = config.i18n.minimizeHint;
		document.body.appendChild( hintEl );

		function dismiss() {
			if ( hintEl && hintEl.parentNode ) {
				hintEl.remove();
				hintEl = null;
			}
		}

		hintEl.addEventListener( 'click', dismiss, { once: true } );
		setTimeout( dismiss, 6000 );

		// Position immediately so it's visible right away.
		positionHint();
	}

	/**
	 * Reposition the hint tooltip below the minimize button.
	 * Called after each render so it tracks the button's position.
	 */
	function positionHint() {
		if ( ! hintEl || ! panelEl ) {
			return;
		}

		const minBtn = panelEl.querySelector( '.wpconsent-inspector-btn-minimize' );
		if ( ! minBtn ) {
			return;
		}

		const rect = minBtn.getBoundingClientRect();
		hintEl.style.bottom = ( window.innerHeight - rect.top + 8 ) + 'px';
		hintEl.style.right = ( window.innerWidth - rect.right ) + 'px';
	}

	/**
	 * Render the full panel contents.
	 */
	function render() {
		if ( ! panelEl ) {
			return;
		}

		const allCookies = storage.getAll();
		const classified = matcher.classifyCookies( allCookies, config.documented_cookies, config.inspectorMode, config.adminContextPrefixes );
		const totalCount = classified.needsAttention.length + classified.unknown.length + classified.adminContext.length + classified.ok.length;
		const issueCount = classified.needsAttention.length + classified.unknown.length;

		// Update the issue badge on the minimized toggle button.
		if ( badgeEl ) {
			badgeEl.textContent = issueCount;
			badgeEl.style.display = issueCount > 0 ? 'block' : 'none';
		}

		let bodyHtml = '';

		if ( classified.needsAttention.length > 0 ) {
			bodyHtml += `<div class="wpconsent-inspector-section-title wpconsent-inspector-section-title-attention">${ esc( config.i18n.sectionAttention ) } (${ classified.needsAttention.length })</div>`;
			bodyHtml += classified.needsAttention.map( ( c ) => renderCookie( c, 'needsAttention' ) ).join( '' );
		}

		if ( classified.unknown.length > 0 ) {
			bodyHtml += `<div class="wpconsent-inspector-section-title wpconsent-inspector-section-title-unknown">${ esc( config.i18n.sectionUndocumented ) } (${ classified.unknown.length })</div>`;
			bodyHtml += classified.unknown.map( ( c ) => renderCookie( c, 'unknown' ) ).join( '' );
		}

		if ( classified.ok.length > 0 ) {
			bodyHtml += `<div class="wpconsent-inspector-section-title wpconsent-inspector-section-title-ok">${ esc( config.i18n.sectionOk ) } (${ classified.ok.length })</div>`;
			bodyHtml += classified.ok.map( ( c ) => renderCookie( c, 'ok' ) ).join( '' );
		}

		if ( classified.adminContext.length > 0 ) {
			const collapsedClass = adminContextCollapsed ? ' wpconsent-inspector-section-admin-context-collapsed' : '';
			bodyHtml += `<div class="wpconsent-inspector-section-admin-context${ collapsedClass }">`;
			bodyHtml += `<button type="button" class="wpconsent-inspector-section-title wpconsent-inspector-section-title-admin-context" aria-expanded="${ ! adminContextCollapsed }" aria-controls="wpconsent-inspector-admin-context-body">`;
			bodyHtml += `<span>${ esc( config.i18n.sectionAdminOnly ) } (${ classified.adminContext.length })</span>`;
			bodyHtml += `<span class="wpconsent-inspector-section-admin-context-caret" aria-hidden="true">&#9656;</span>`;
			bodyHtml += `</button>`;
			bodyHtml += `<div id="wpconsent-inspector-admin-context-body" class="wpconsent-inspector-admin-context-body">`;
			bodyHtml += `<div class="wpconsent-inspector-admin-context-explainer">${ esc( config.i18n.adminOnlyExplainer ) }</div>`;
			bodyHtml += classified.adminContext.map( ( c ) => renderCookie( c, 'adminContext' ) ).join( '' );
			bodyHtml += `</div>`;
			bodyHtml += `</div>`;
		}

		if ( 0 === totalCount ) {
			bodyHtml = '';
		}

		const guidance = getGuidance( classified, totalCount );

		let noticeHtml = '';
		if ( config.i18n.blockingDisabledNotice ) {
			noticeHtml = '<div class="wpconsent-inspector-blocking-notice">' + config.i18n.blockingDisabledNotice + '</div>';
		}

		const suggestedPagesHtml = renderSuggestedPages();

		let buttonHtml = '';
		if ( classified.unknown.length > 0 ) {
			buttonHtml = '<button class="wpconsent-inspector-btn-review">' + esc( config.i18n.reviewCookies ) + '</button>';
		} else if ( totalCount > 0 ) {
			buttonHtml = `<button class="wpconsent-inspector-btn-finish">${ esc( config.i18n.finish ) }</button>`;
		}

		const actionsHtml = suggestedPagesHtml || buttonHtml
			? `<div class="wpconsent-inspector-actions">${ suggestedPagesHtml }${ buttonHtml }</div>`
			: '';

		panelEl.innerHTML = `
			<div class="wpconsent-inspector-header">
				<h3><span class="wpconsent-inspector-header-logo">${ LOGO_SVG }</span> WPConsent Cookie Inspector</h3>
				<div class="wpconsent-inspector-header-actions">
					<button type="button" class="wpconsent-inspector-btn-restart" title="${ esc( config.i18n.restartTitle ) }" aria-label="${ esc( config.i18n.restartTitle ) }">&#x21bb;</button>
					<button type="button" class="wpconsent-inspector-btn-minimize" title="${ esc( config.i18n.minimizeTitle ) }" aria-label="${ esc( config.i18n.minimizeTitle ) }">&minus;</button>
					<button type="button" class="wpconsent-inspector-btn-stop">Stop</button>
				</div>
			</div>
			<div class="wpconsent-inspector-mode-label">${ esc( getModeLabel() ) }</div>
			${ noticeHtml }
			${ guidance }
			${ actionsHtml }
			<div class="wpconsent-inspector-body">
				${ bodyHtml }
			</div>
		`;

		attachEvents( classified.unknown );
		positionHint();
	}

	/**
	 * Attach event listeners to panel elements.
	 *
	 * @param {Array} unknownCookies - The current list of reviewable cookies.
	 */
	function attachEvents( unknownCookies ) {
		if ( ! panelEl ) {
			return;
		}

		const stopBtn = panelEl.querySelector( '.wpconsent-inspector-btn-stop' );
		if ( stopBtn ) {
			stopBtn.addEventListener( 'click', onStop );
		}

		const restartBtn = panelEl.querySelector( '.wpconsent-inspector-btn-restart' );
		if ( restartBtn ) {
			restartBtn.addEventListener( 'click', () => {
				storage.clear();
				// Remove the init flag so the session reset triggers again.
				sessionStorage.removeItem( 'wpconsent_inspector_initialized' );
				// Clear cookies and freeze document.cookie before reload so scripts
				// cannot re-set cookies during beforeunload (e.g. Google Analytics).
				var nativeSetter = Object.getOwnPropertyDescriptor( Document.prototype, 'cookie' ).set;
				var cookies = Object.getOwnPropertyDescriptor( Document.prototype, 'cookie' ).get.call( document ).split( '; ' );
				for ( var c = 0; c < cookies.length; c++ ) {
					var d = window.location.hostname.split( '.' );
					while ( d.length > 0 ) {
						var cookieBase = encodeURIComponent( cookies[ c ].split( ';' )[ 0 ].split( '=' )[ 0 ] ) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join( '.' ) + ' ;path=';
						var p = location.pathname.split( '/' );
						nativeSetter.call( document, cookieBase + '/' );
						while ( p.length > 0 ) {
							nativeSetter.call( document, cookieBase + p.join( '/' ) );
							p.pop();
						}
						d.shift();
					}
				}
				Object.defineProperty( document, 'cookie', {
					get: function () { return ''; },
					set: function () {},
				} );
				window.location.reload();
			} );
		}

		const minBtn = panelEl.querySelector( '.wpconsent-inspector-btn-minimize' );
		if ( minBtn ) {
			minBtn.addEventListener( 'click', () => {
				// Dismiss hint when minimizing.
				if ( hintEl && hintEl.parentNode ) {
					hintEl.remove();
					hintEl = null;
				}
				panelEl.style.display = 'none';
				toggleEl.style.display = 'flex';
			} );
		}

		const reviewBtn = panelEl.querySelector( '.wpconsent-inspector-btn-review' );
		if ( reviewBtn ) {
			reviewBtn.addEventListener( 'click', () => {
				onReview( unknownCookies );
			} );
		}

		const finishBtn = panelEl.querySelector( '.wpconsent-inspector-btn-finish' );
		if ( finishBtn ) {
			finishBtn.addEventListener( 'click', onStop );
		}

		const adminContextToggle = panelEl.querySelector( '.wpconsent-inspector-section-title-admin-context' );
		if ( adminContextToggle ) {
			adminContextToggle.addEventListener( 'click', () => {
				adminContextCollapsed = ! adminContextCollapsed;
				const sectionEl = panelEl.querySelector( '.wpconsent-inspector-section-admin-context' );
				if ( sectionEl ) {
					sectionEl.classList.toggle( 'wpconsent-inspector-section-admin-context-collapsed', adminContextCollapsed );
				}
				adminContextToggle.setAttribute( 'aria-expanded', String( ! adminContextCollapsed ) );
			} );
		}
	}

	/**
	 * Determine extra CSS classes for the panel based on the banner position.
	 *
	 * @return {string} Space-separated class names to append, or empty string.
	 */
	function getPositionClasses() {
		const layout = config.bannerLayout || 'long';
		const position = config.bannerPosition || 'top';
		const classes = [];

		// Floating banner in the bottom-right corner collides with the panel.
		if ( 'floating' === layout && 'right-bottom' === position ) {
			classes.push( 'wpconsent-inspector-left' );
		}

		// Long banner at the bottom overlaps the panel.
		if ( 'long' === layout && 'bottom' === position ) {
			classes.push( 'wpconsent-inspector-above-banner' );
		}

		// Banner position hint for mobile responsive layout.
		if ( 'bottom' === position || 'right-bottom' === position || 'left-bottom' === position ) {
			classes.push( 'wpconsent-inspector-banner-bottom' );
		}

		return classes.join( ' ' );
	}

	/**
	 * For long-bottom banners, measure the banner height and set the
	 * bottom offset as an inline CSS variable so the panel clears it.
	 */
	function applyBannerOffset() {
		if ( 'long' !== ( config.bannerLayout || 'long' ) || 'bottom' !== ( config.bannerPosition || 'top' ) ) {
			return;
		}

		const banner = document.querySelector( '.wpconsent-banner-holder .wpconsent-banner' );
		if ( ! banner ) {
			return;
		}

		const bannerHeight = banner.offsetHeight;
		const offset = bannerHeight + 20;

		if ( panelEl ) {
			panelEl.style.setProperty( '--wpconsent-banner-offset', offset + 'px' );
		}
		if ( toggleEl ) {
			toggleEl.style.setProperty( '--wpconsent-banner-offset', offset + 'px' );
		}
	}

	/**
	 * Initialize and mount the panel to the DOM.
	 */
	function mount() {
		const posClasses = getPositionClasses();

		toggleEl = document.createElement( 'button' );
		toggleEl.className = 'wpconsent-inspector-toggle' + ( posClasses ? ' ' + posClasses : '' );
		toggleEl.innerHTML = LOGO_SVG;
		toggleEl.title = config.i18n.panelTitle;
		toggleEl.style.display = 'none';
		toggleEl.addEventListener( 'click', () => {
			panelEl.style.display = 'flex';
			toggleEl.style.display = 'none';
			render();
		} );

		badgeEl = document.createElement( 'span' );
		badgeEl.className = 'wpconsent-inspector-badge';
		toggleEl.appendChild( badgeEl );

		document.body.appendChild( toggleEl );

		panelEl = document.createElement( 'div' );
		panelEl.className = 'wpconsent-inspector-panel' + ( posClasses ? ' ' + posClasses : '' );
		document.body.appendChild( panelEl );

		applyBannerOffset();
		render();

		// Show the minimize hint after initial renders settle.
		setTimeout( showMinimizeHint, 500 );
	}

	/**
	 * Remove the panel from the DOM.
	 */
	function destroy() {
		if ( panelEl ) {
			panelEl.remove();
			panelEl = null;
		}
		if ( toggleEl ) {
			toggleEl.remove();
			toggleEl = null;
		}
		badgeEl = null;
		if ( hintEl ) {
			hintEl.remove();
			hintEl = null;
		}
	}

	return {
		mount,
		render,
		destroy,
	};
}
