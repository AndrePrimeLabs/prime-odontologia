/**
 * Inspector Review Wizard Module.
 *
 * Provides a step-by-step wizard in the admin for reviewing
 * cookies detected by the frontend inspector, with script
 * blocking rule creation.
 */

/* global wpconsentInspectorReview, ajaxurl, jQuery */

( function () {
	let cookies = [];
	let currentIndex = 0;
	let categories = [];
	let services = [];
	let blockingRules = {};
	let nonce = '';
	let isPro = false;

	// Track rules created during this wizard session.
	const sessionRules = [];

	// Track review actions for completion summary.
	let savedCount = 0;
	let skippedCount = 0;

	// Track last saved cookie for prefix-based pre-fill.
	let lastSaved = { name: '', categoryId: '', serviceId: '' };

	/**
	 * Initialize the wizard if the review data is available.
	 */
	function init() {
		if ( typeof wpconsentInspectorReview === 'undefined' ) {
			return;
		}

		const wizard = document.getElementById( 'wpconsent-inspector-review-wizard' );
		if ( ! wizard ) {
			return;
		}

		cookies = wpconsentInspectorReview.cookies || [];
		categories = wpconsentInspectorReview.categories || [];
		services = wpconsentInspectorReview.services || [];
		blockingRules = wpconsentInspectorReview.blockingRules || {};
		isPro = wpconsentInspectorReview.isPro || false;
		nonce = wpconsentInspectorReview.nonce || '';

		if ( 0 === cookies.length ) {
			return;
		}

		// Sort alphabetically to cluster related cookies by name prefix.
		cookies.sort( ( a, b ) => a.name.localeCompare( b.name ) );

		populateCategorySelect();
		bindEvents();
		showCookie( 0 );
	}

	/**
	 * Find the longest shared prefix between two strings, split on
	 * common cookie-name separators (_, -, .).
	 * Returns the shared prefix or empty string if no meaningful match.
	 *
	 * @param {string} a - First cookie name.
	 * @param {string} b - Second cookie name.
	 * @return {string} Shared prefix (up to last separator), or ''.
	 */
	function sharedPrefix( a, b ) {
		const partsA = a.split( /[_\-.]/ );
		const partsB = b.split( /[_\-.]/ );
		let matched = 0;

		for ( let i = 0; i < Math.min( partsA.length, partsB.length ); i++ ) {
			if ( partsA[ i ].toLowerCase() === partsB[ i ].toLowerCase() ) {
				matched++;
			} else {
				break;
			}
		}

		// Require at least one matching segment.
		return matched > 0 ? partsA.slice( 0, matched ).join( '_' ) : '';
	}

	/**
	 * Populate the category dropdown.
	 */
	function populateCategorySelect() {
		const select = document.getElementById( 'wpconsent-review-category' );
		if ( ! select ) {
			return;
		}

		select.innerHTML = '';

		const placeholder = document.createElement( 'option' );
		placeholder.value = '';
		placeholder.textContent = wpconsentInspectorReview.i18n.chooseCategory;
		placeholder.disabled = true;
		placeholder.selected = true;
		select.appendChild( placeholder );

		categories.forEach( ( cat ) => {
			const option = document.createElement( 'option' );
			option.value = cat.id;
			option.textContent = cat.name;
			select.appendChild( option );
		} );

		updateServiceSelect();
	}

	/**
	 * Update the service dropdown based on selected category.
	 */
	function updateServiceSelect() {
		const categorySelect = document.getElementById( 'wpconsent-review-category' );
		const serviceSelect = document.getElementById( 'wpconsent-review-service' );
		if ( ! categorySelect || ! serviceSelect ) {
			return;
		}

		const hasCategory = '' !== categorySelect.value;
		serviceSelect.disabled = ! hasCategory;

		const categoryId = parseInt( categorySelect.value, 10 );
		const filtered = hasCategory ? services.filter( ( s ) => s.category_id === categoryId ) : [];

		serviceSelect.innerHTML = '';

		const noneOption = document.createElement( 'option' );
		noneOption.value = '0';
		noneOption.textContent = wpconsentInspectorReview.i18n.none;
		serviceSelect.appendChild( noneOption );

		const createOption = document.createElement( 'option' );
		createOption.value = 'new';
		createOption.textContent = wpconsentInspectorReview.i18n.createNewService;
		serviceSelect.appendChild( createOption );

		const libraryOption = document.createElement( 'option' );
		libraryOption.value = 'library';
		libraryOption.textContent = isPro
			? wpconsentInspectorReview.i18n.addFromLibrary
			: wpconsentInspectorReview.i18n.addFromLibraryPro;
		serviceSelect.appendChild( libraryOption );

		filtered.forEach( ( s ) => {
			const option = document.createElement( 'option' );
			option.value = s.id;
			option.textContent = s.name;
			serviceSelect.appendChild( option );
		} );
	}

	/**
	 * Check if a pattern is already covered by existing or session-created blocking rules.
	 * Uses the same strpos logic as the PHP blocking engine.
	 *
	 * @param {string} pattern - The suggested pattern to check.
	 * @param {string} scriptUrl - The full script URL to check.
	 * @return {{ blocked: boolean, label: string, isSession: boolean }}
	 */
	function checkAlreadyBlocked( pattern, scriptUrl ) {
		// Check rules created during this wizard session first.
		for ( const rule of sessionRules ) {
			if ( rule.scriptTag && pattern && pattern.indexOf( rule.scriptTag ) !== -1 ) {
				return { blocked: true, label: rule.serviceName, isSession: true };
			}
			if ( rule.scriptTag && scriptUrl && scriptUrl.indexOf( rule.scriptTag ) !== -1 ) {
				return { blocked: true, label: rule.serviceName, isSession: true };
			}
			if ( rule.keywords ) {
				const keywords = rule.keywords.split( ',' ).map( ( k ) => k.trim() );
				for ( const kw of keywords ) {
					if ( kw && pattern && pattern.indexOf( kw ) !== -1 ) {
						return { blocked: true, label: rule.serviceName, isSession: true };
					}
				}
			}
		}

		// Check existing library + custom rules.
		for ( const category of Object.keys( blockingRules ) ) {
			for ( const serviceKey of Object.keys( blockingRules[ category ] ) ) {
				const service = blockingRules[ category ][ serviceKey ];
				const scripts = service.scripts || [];

				for ( const existingPattern of scripts ) {
					// Same strpos logic: does the existing pattern appear in the traced URL/pattern?
					if ( pattern && existingPattern && pattern.indexOf( existingPattern ) !== -1 ) {
						return { blocked: true, label: service.label || serviceKey, isSession: false };
					}
					if ( scriptUrl && existingPattern && scriptUrl.indexOf( existingPattern ) !== -1 ) {
						return { blocked: true, label: service.label || serviceKey, isSession: false };
					}
				}
			}
		}

		return { blocked: false, label: '', isSession: false };
	}

	/**
	 * Show the Lite upgrade prompt for pre-consent non-essential cookies.
	 *
	 * @param {Object} cookie - The current cookie data.
	 */
	function updateUpgradePrompt( cookie ) {
		const prompt = document.getElementById( 'wpconsent-review-upgrade-prompt' );
		if ( ! prompt ) {
			return;
		}

		const categorySelect = document.getElementById( 'wpconsent-review-category' );
		const categoryName = categorySelect ? categorySelect.options[ categorySelect.selectedIndex ]?.textContent : '';
		const categoryId = categorySelect ? parseInt( categorySelect.value, 10 ) : 0;
		const selectedCategory = categories.find( ( c ) => c.id === categoryId );
		const isEssential = selectedCategory && 'essential' === selectedCategory.slug;
		const isPreConsent = 'pre-consent' === cookie.consentState;
		const hasCategory = categorySelect && '' !== categorySelect.value;

		// Only show for pre-consent non-essential cookies when a category is selected.
		if ( isPreConsent && hasCategory && ! isEssential ) {
			const message = document.getElementById( 'wpconsent-review-upgrade-message' );
			if ( message ) {
				message.textContent = wpconsentInspectorReview.i18n.upgradePrompt;
			}
			prompt.style.display = '';
		} else {
			prompt.style.display = 'none';
		}
	}

	/**
	 * Render inline script content as HTML with every JS identifier wrapped
	 * in a clickable span. Non-identifier content is HTML-escaped as plain text.
	 *
	 * @param {string} content - Raw inline script text.
	 * @return {string} HTML string safe for innerHTML assignment.
	 */
	function tokenizeScript( content ) {
		// Split on identifier boundaries.
		// Odd-indexed parts are identifier captures; even-indexed are everything else.
		const parts = content.split( /(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)/ );

		return parts.map( ( part, i ) => {
			const escaped = part
				.replace( /&/g, '&amp;' )
				.replace( /</g, '&lt;' )
				.replace( />/g, '&gt;' );

			if ( 1 === i % 2 ) {
				return `<span class="wpconsent-script-token" data-token="${ escaped }">${ escaped }</span>`;
			}

			return escaped;
		} ).join( '' );
	}

	/**
	 * Toggle a keyword in the script_keywords input field.
	 * Adds it if absent, removes it if already present.
	 *
	 * @param {string} keyword - The identifier to toggle.
	 */
	function toggleKeywordToken( keyword ) {
		const keywordsField = document.getElementById( 'wpconsent-review-script-keywords' );
		if ( ! keywordsField ) {
			return;
		}

		const current = keywordsField.value
			.split( ',' )
			.map( ( k ) => k.trim() )
			.filter( Boolean );

		const idx = current.indexOf( keyword );
		if ( -1 === idx ) {
			current.push( keyword );
		} else {
			current.splice( idx, 1 );
		}

		keywordsField.value = current.join( ', ' );
	}

	/**
	 * Sync the visual selected state of token spans with the keywords field.
	 *
	 * @param {Element} codeBlock - The <pre> element containing token spans.
	 */
	function syncTokenHighlights( codeBlock ) {
		const keywordsField = document.getElementById( 'wpconsent-review-script-keywords' );
		if ( ! keywordsField ) {
			return;
		}

		const selected = new Set(
			keywordsField.value
				.split( ',' )
				.map( ( k ) => k.trim() )
				.filter( Boolean )
		);

		codeBlock.querySelectorAll( '.wpconsent-script-token' ).forEach( ( span ) => {
			span.classList.toggle( 'wpconsent-script-token--selected', selected.has( span.dataset.token ) );
		} );
	}

	/**
	 * Show the inline script section for the current cookie, or hide it.
	 *
	 * @param {Object} cookie - Cookie data (may have inlineScript).
	 */
	function updateInlineScriptSection( cookie ) {
		const section = document.getElementById( 'wpconsent-review-inline-script-section' );
		const codeBlock = document.getElementById( 'wpconsent-review-inline-script-code' );

		if ( ! section || ! codeBlock ) {
			return;
		}

		if ( ! cookie.inlineScript ) {
			section.style.display = 'none';
			return;
		}

		section.style.display = '';
		codeBlock.innerHTML = tokenizeScript( cookie.inlineScript );
		syncTokenHighlights( codeBlock );

		// Replace click handler to avoid duplicates.
		codeBlock.onclick = ( e ) => {
			const token = e.target.closest( '.wpconsent-script-token' );
			if ( ! token ) {
				return;
			}
			toggleKeywordToken( token.dataset.token );
			syncTokenHighlights( codeBlock );
		};
	}

	/**
	 * Update the blocking section for the current cookie.
	 *
	 * @param {Object} cookie - The current cookie data.
	 */
	function updateBlockingSection( cookie ) {
		// Lite: show upgrade prompt instead of blocking fields.
		if ( ! isPro ) {
			updateUpgradePrompt( cookie );
			return;
		}

		const section = document.getElementById( 'wpconsent-review-blocking-section' );
		const alreadyBlocked = document.getElementById( 'wpconsent-review-already-blocked' );
		const createRule = document.getElementById( 'wpconsent-review-create-rule' );
		const blockedMessage = document.getElementById( 'wpconsent-review-blocked-message' );
		const blockToggle = document.getElementById( 'wpconsent-review-block-toggle' );
		const blockDescription = document.getElementById( 'wpconsent-review-block-description' );
		const scriptTagField = document.getElementById( 'wpconsent-review-script-tag' );
		const keywordsField = document.getElementById( 'wpconsent-review-script-keywords' );
		const blockingFields = document.getElementById( 'wpconsent-review-blocking-fields' );

		if ( ! section ) {
			return;
		}

		// No trace data -- hide the entire section.
		if ( ! cookie.suggestedPattern && ! cookie.scriptUrl ) {
			section.style.display = 'none';
			updateInlineScriptSection( { inlineScript: null } );
			return;
		}

		section.style.display = '';

		const status = checkAlreadyBlocked(
			cookie.suggestedPattern || '',
			cookie.scriptUrl || ''
		);

		if ( status.blocked ) {
			alreadyBlocked.style.display = '';
			createRule.style.display = 'none';

			if ( status.isSession ) {
				blockedMessage.textContent = wpconsentInspectorReview.i18n.willBeBlocked.replace( '%s', status.label );
			} else {
				blockedMessage.textContent = wpconsentInspectorReview.i18n.alreadyBlocked.replace( '%s', status.label );
			}

			updateInlineScriptSection( { inlineScript: null } );
		} else {
			alreadyBlocked.style.display = 'none';
			createRule.style.display = '';

			const categorySelect = document.getElementById( 'wpconsent-review-category' );
			const categoryName = categorySelect ? categorySelect.options[ categorySelect.selectedIndex ]?.textContent : '';

			blockDescription.textContent = wpconsentInspectorReview.i18n.blockDescription.replace( '%s', categoryName );
			blockDescription.style.color = '';

			if ( scriptTagField ) {
				scriptTagField.value = cookie.scriptUrl ? ( cookie.suggestedPattern || '' ) : '';
			}
			if ( keywordsField ) {
				keywordsField.value = ! cookie.scriptUrl && cookie.suggestedPattern ? cookie.suggestedPattern : '';
			}

			if ( blockToggle ) {
				blockToggle.checked = true;
			}
			if ( blockingFields ) {
				blockingFields.style.display = '';
			}

			updateInlineScriptSection( cookie );
		}
	}

	/**
	 * Display a cookie at the given index.
	 *
	 * @param {number} index - Index in the cookies array.
	 */
	function showCookie( index ) {
		if ( index >= cookies.length ) {
			showComplete();
			return;
		}

		// Hide loading, show form.
		const loading = document.getElementById( 'wpconsent-inspector-review-loading' );
		const form = document.getElementById( 'wpconsent-inspector-review-form' );
		if ( loading ) {
			loading.style.display = 'none';
		}
		if ( form ) {
			form.style.display = '';
		}

		currentIndex = index;
		const cookie = cookies[ index ];

		// Update progress.
		const currentEl = document.getElementById( 'wpconsent-review-current' );
		const totalEl = document.getElementById( 'wpconsent-review-total' );
		if ( currentEl ) {
			currentEl.textContent = index + 1;
		}
		if ( totalEl ) {
			totalEl.textContent = cookies.length;
		}

		// Sync the progress badge in the metabox title.
		const badgeCurrent = document.getElementById( 'wpconsent-review-badge-current' );
		if ( badgeCurrent ) {
			badgeCurrent.textContent = index + 1;
		}

		// Update cookie name.
		const nameEl = document.getElementById( 'wpconsent-review-cookie-name' );
		if ( nameEl ) {
			nameEl.textContent = cookie.name;
		}

		// Update consent state badge.
		const consentBadge = document.getElementById( 'wpconsent-review-consent-badge' );
		if ( consentBadge ) {
			if ( 'pre-consent' === cookie.consentState ) {
				consentBadge.textContent = wpconsentInspectorReview.i18n.loadedBeforeConsent;
				consentBadge.style.display = '';
			} else {
				consentBadge.style.display = 'none';
			}
		}

		// Update pages list.
		const pagesEl = document.getElementById( 'wpconsent-review-cookie-pages' );
		if ( pagesEl ) {
			pagesEl.innerHTML = '';
			( cookie.pages || [] ).forEach( ( page ) => {
				const span = document.createElement( 'span' );
				span.className = 'wpconsent-input-area-description';
				span.style.display = 'block';

				try {
					const url = new URL( page );
					span.textContent = url.pathname;
				} catch ( e ) {
					span.textContent = page;
				}

				pagesEl.appendChild( span );
			} );
		}

		// Update source attribution if available.
		const sourceRow = document.getElementById( 'wpconsent-review-source-row' );
		const sourcePattern = document.getElementById( 'wpconsent-review-source-pattern' );
		const sourceUrl = document.getElementById( 'wpconsent-review-source-url' );

		if ( sourceRow && sourcePattern && sourceUrl ) {
			if ( cookie.suggestedPattern ) {
				sourcePattern.textContent = cookie.suggestedPattern;
				sourceUrl.textContent = cookie.scriptUrl || '';
				sourceRow.style.display = '';
			} else {
				sourceRow.style.display = 'none';
			}
		}

		// Reset form fields.
		const descEl = document.getElementById( 'wpconsent-review-description' );
		const durationEl = document.getElementById( 'wpconsent-review-duration' );
		if ( descEl ) {
			descEl.value = '';
		}
		if ( durationEl ) {
			durationEl.value = cookie.duration || '';
		}

		// Pre-fill category/service if this cookie shares a prefix with the last saved one.
		const categorySelect = document.getElementById( 'wpconsent-review-category' );
		const prefixMatch = lastSaved.name && sharedPrefix( cookie.name, lastSaved.name );

		if ( prefixMatch && categorySelect ) {
			categorySelect.value = lastSaved.categoryId;
			updateServiceSelect();
			const serviceSelect = document.getElementById( 'wpconsent-review-service' );
			if ( serviceSelect ) {
				serviceSelect.value = lastSaved.serviceId;
			}
		} else {
			if ( categorySelect ) {
				categorySelect.value = '';
			}
			updateServiceSelect();
		}

		// Update blocking section.
		updateBlockingSection( cookie );
	}

	/**
	 * Build a pluralized summary line.
	 *
	 * @param {number} count - The count value.
	 * @param {string} singularKey - i18n key for singular form.
	 * @param {string} pluralKey - i18n key for plural form.
	 * @return {string} Formatted summary line.
	 */
	function summaryLine( count, singularKey, pluralKey ) {
		const i18n = wpconsentInspectorReview.i18n;
		const template = 1 === count ? i18n[ singularKey ] : i18n[ pluralKey ];
		return template.replace( '%s', count );
	}

	/**
	 * Show the completion state with a summary of actions taken.
	 */
	function showComplete() {
		const wizard = document.getElementById( 'wpconsent-inspector-review-wizard' );
		const complete = document.getElementById( 'wpconsent-inspector-review-complete' );
		const summary = document.getElementById( 'wpconsent-inspector-review-summary' );

		if ( wizard ) {
			wizard.style.display = 'none';
		}
		if ( complete ) {
			complete.style.display = '';
		}

		if ( ! summary ) {
			return;
		}

		const lines = [];

		const pagesInspected = wpconsentInspectorReview.pagesInspected || 0;
		if ( pagesInspected > 0 ) {
			lines.push( summaryLine( pagesInspected, 'summaryPagesOne', 'summaryPagesMany' ) );
		}

		if ( savedCount > 0 ) {
			lines.push( summaryLine( savedCount, 'summarySavedOne', 'summarySavedMany' ) );
		}
		if ( skippedCount > 0 ) {
			lines.push( summaryLine( skippedCount, 'summarySkippedOne', 'summarySkippedMany' ) );
		}
		if ( sessionRules.length > 0 ) {
			lines.push( summaryLine( sessionRules.length, 'summaryRulesOne', 'summaryRulesMany' ) );
		}

		if ( lines.length > 0 ) {
			const ul = document.createElement( 'ul' );
			lines.forEach( ( text ) => {
				const li = document.createElement( 'li' );
				li.textContent = text;
				ul.appendChild( li );
			} );
			summary.appendChild( ul );
		}
	}

	/**
	 * Save the current cookie, optionally create a blocking rule, and advance.
	 */
	function saveCookie() {
		const cookie = cookies[ currentIndex ];
		const categorySelect = document.getElementById( 'wpconsent-review-category' );
		const serviceSelect = document.getElementById( 'wpconsent-review-service' );
		const descEl = document.getElementById( 'wpconsent-review-description' );
		const durationEl = document.getElementById( 'wpconsent-review-duration' );

		const saveBtn = document.getElementById( 'wpconsent-review-save' );
		if ( saveBtn ) {
			saveBtn.disabled = true;
		}

		const categoryId = categorySelect ? categorySelect.value : '';
		const serviceId = serviceSelect ? serviceSelect.value : 0;

		// Validate: a category must be selected.
		if ( ! categoryId ) {
			if ( categorySelect ) {
				categorySelect.focus();
			}
			if ( saveBtn ) {
				saveBtn.disabled = false;
			}
			return;
		}

		// Validate: if blocking is enabled, a service must be selected.
		if ( shouldCreateBlockingRule() && ( ! serviceId || '0' === serviceId ) ) {
			if ( serviceSelect ) {
				serviceSelect.focus();
			}
			const blockDescription = document.getElementById( 'wpconsent-review-block-description' );
			if ( blockDescription ) {
				blockDescription.textContent = wpconsentInspectorReview.i18n.serviceRequiredForBlocking;
				blockDescription.style.color = '#d63638';
			}
			if ( saveBtn ) {
				saveBtn.disabled = false;
			}
			return;
		}

		// Save the cookie first.
		jQuery.post( ajaxurl, {
			action: 'wpconsent_inspector_add_cookie',
			nonce,
			cookie_id: cookie.name,
			cookie_name: cookie.name,
			cookie_description: descEl ? descEl.value : '',
			cookie_category: categoryId,
			cookie_service: serviceId,
			cookie_duration: durationEl ? durationEl.value : '',
			dismiss: 'true',
		} ).done( () => {
			savedCount++;
			lastSaved = { name: cookie.name, categoryId, serviceId };

			// Check if we need to create a blocking rule.
			const shouldBlock = shouldCreateBlockingRule();

			if ( shouldBlock ) {
				createBlockingRule( categoryId, serviceId, () => {
					advanceToNext( saveBtn );
				} );
			} else {
				advanceToNext( saveBtn );
			}
		} ).fail( () => {
			advanceToNext( saveBtn );
		} );
	}

	/**
	 * Check if the user wants to create a blocking rule for the current cookie.
	 *
	 * @return {boolean}
	 */
	function shouldCreateBlockingRule() {
		const section = document.getElementById( 'wpconsent-review-blocking-section' );
		const createRuleDiv = document.getElementById( 'wpconsent-review-create-rule' );
		const toggle = document.getElementById( 'wpconsent-review-block-toggle' );

		// Section not visible or in "already blocked" state.
		if ( ! section || 'none' === section.style.display ) {
			return false;
		}
		if ( ! createRuleDiv || 'none' === createRuleDiv.style.display ) {
			return false;
		}

		return toggle && toggle.checked;
	}

	/**
	 * Create a blocking rule via AJAX.
	 *
	 * @param {string} categoryId - Category term ID.
	 * @param {string} serviceId - Service term ID.
	 * @param {Function} callback - Called when done.
	 */
	function createBlockingRule( categoryId, serviceId, callback ) {
		const scriptTag = document.getElementById( 'wpconsent-review-script-tag' );
		const keywords = document.getElementById( 'wpconsent-review-script-keywords' );
		const serviceSelect = document.getElementById( 'wpconsent-review-service' );
		const serviceName = serviceSelect ? serviceSelect.options[ serviceSelect.selectedIndex ]?.textContent : '';

		const tagValue = scriptTag ? scriptTag.value.trim() : '';
		const keywordsValue = keywords ? keywords.value.trim() : '';

		if ( ! tagValue && ! keywordsValue ) {
			callback();
			return;
		}

		jQuery.post( ajaxurl, {
			action: 'wpconsent_inspector_add_blocking_rule',
			nonce,
			rule_category: categoryId,
			rule_service: serviceId,
			script_tag: tagValue,
			script_keywords: keywordsValue,
		} ).done( ( response ) => {
			if ( response.success ) {
				// Track this rule for subsequent cookies in this session.
				sessionRules.push( {
					scriptTag: tagValue,
					keywords: keywordsValue,
					serviceName: serviceName || 'Custom',
				} );
			}
		} ).always( callback );
	}

	/**
	 * Transition the form out, swap content, then transition back in.
	 *
	 * @param {Function} callback - Called after the out transition to update content.
	 */
	function transitionToNext( callback ) {
		const form = document.getElementById( 'wpconsent-inspector-review-form' );
		if ( ! form ) {
			callback();
			return;
		}

		form.classList.add( 'wpconsent-review-transitioning-out' );

		const onEnd = () => {
			form.removeEventListener( 'transitionend', onEnd );
			callback();
			form.classList.remove( 'wpconsent-review-transitioning-out' );
			form.classList.add( 'wpconsent-review-transitioning-in' );

			requestAnimationFrame( () => {
				requestAnimationFrame( () => {
					form.classList.remove( 'wpconsent-review-transitioning-in' );
				} );
			} );
		};

		form.addEventListener( 'transitionend', onEnd, { once: true } );

		// Fallback in case transitionend doesn't fire.
		setTimeout( () => {
			if ( form.classList.contains( 'wpconsent-review-transitioning-out' ) ) {
				onEnd();
			}
		}, 250 );
	}

	/**
	 * Re-enable the save button and advance to the next cookie.
	 *
	 * @param {HTMLElement} saveBtn - The save button element.
	 */
	function advanceToNext( saveBtn ) {
		if ( saveBtn ) {
			saveBtn.disabled = false;
		}
		currentIndex++;
		transitionToNext( () => showCookie( currentIndex ) );
	}

	/**
	 * Skip the current cookie and advance.
	 */
	function skipCookie() {
		const cookie = cookies[ currentIndex ];
		skippedCount++;
		jQuery.post( ajaxurl, {
			action: 'wpconsent_inspector_dismiss_cookie',
			nonce,
			cookie_name: cookie.name,
		} ).always( () => {
			currentIndex++;
			transitionToNext( () => showCookie( currentIndex ) );
		} );
	}

	/**
	 * Open the new service modal.
	 */
	function openServiceModal() {
		const modal = document.getElementById( 'wpconsent-modal-inspector-service' );
		if ( ! modal ) {
			return;
		}

		const wizardCategory = document.getElementById( 'wpconsent-review-category' );
		const modalCategory = document.getElementById( 'inspector_service_category' );
		const selectedCategory = wizardCategory ? wizardCategory.value : '';

		const form = modal.querySelector( 'form' );
		if ( form ) {
			form.reset();
		}

		if ( modalCategory && selectedCategory ) {
			modalCategory.value = selectedCategory;
		}

		modal.style.display = 'block';
	}

	/**
	 * Open the service library modal with the current category context.
	 */
	function openLibraryModal() {
		if ( typeof window.WPConsentServiceLibrary === 'undefined' ) {
			return;
		}

		const categorySelect = document.getElementById( 'wpconsent-review-category' );
		if ( ! categorySelect || ! categorySelect.value ) {
			return;
		}

		const selectedOption = categorySelect.options[ categorySelect.selectedIndex ];
		const categoryName = selectedOption ? selectedOption.textContent : '';

		window.WPConsentServiceLibrary.open( categorySelect.value, categoryName );
	}

	/**
	 * Close the new service modal.
	 */
	function closeServiceModal() {
		const modal = document.getElementById( 'wpconsent-modal-inspector-service' );
		if ( modal ) {
			modal.style.display = 'none';
		}
	}

	/**
	 * Handle new service form submission.
	 *
	 * @param {Event} e - Submit event.
	 */
	function handleServiceSubmit( e ) {
		e.preventDefault();

		const form = e.target;
		const formData = new FormData( form );
		const data = {};
		for ( const [ key, value ] of formData.entries() ) {
			data[ key ] = value;
		}

		const submitBtn = form.querySelector( '.wpconsent-button-primary' );
		if ( submitBtn ) {
			submitBtn.disabled = true;
		}

		jQuery.post( ajaxurl, data ).done( ( response ) => {
			if ( response.success ) {
				const serviceId = response.data.id;
				services.push( {
					id: serviceId,
					name: data.service_name,
					category_id: parseInt( data.service_category, 10 ),
				} );

				updateServiceSelect();
				const serviceSelect = document.getElementById( 'wpconsent-review-service' );
				if ( serviceSelect ) {
					serviceSelect.value = serviceId;
				}

				closeServiceModal();
			}
		} ).always( () => {
			if ( submitBtn ) {
				submitBtn.disabled = false;
			}
		} );
	}

	/**
	 * Bind all event listeners.
	 */
	function bindEvents() {
		const saveBtn = document.getElementById( 'wpconsent-review-save' );
		if ( saveBtn ) {
			saveBtn.addEventListener( 'click', saveCookie );
		}

		const skipBtn = document.getElementById( 'wpconsent-review-skip' );
		if ( skipBtn ) {
			skipBtn.addEventListener( 'click', skipCookie );
		}

		const categorySelect = document.getElementById( 'wpconsent-review-category' );
		if ( categorySelect ) {
			categorySelect.addEventListener( 'change', () => {
				updateServiceSelect();
				// Refresh blocking description when category changes.
				if ( currentIndex < cookies.length ) {
					updateBlockingSection( cookies[ currentIndex ] );
				}
			} );
		}

		const serviceSelect = document.getElementById( 'wpconsent-review-service' );
		if ( serviceSelect ) {
			serviceSelect.addEventListener( 'change', () => {
				if ( 'new' === serviceSelect.value ) {
					serviceSelect.value = '0';
					openServiceModal();
				} else if ( 'library' === serviceSelect.value ) {
					serviceSelect.value = '0';
					if ( isPro ) {
						openLibraryModal();
					} else if ( window.WPConsentAdminNotices && wpconsent && wpconsent.service_library_upsell ) {
						WPConsentAdminNotices.show_pro_notice(
							wpconsent.service_library_upsell.title,
							wpconsent.service_library_upsell.text,
							wpconsent.service_library_upsell.url
						);
					} else if ( typeof console !== 'undefined' ) {
						// Fallback: upsell notice unavailable.
						console.warn( 'WPConsentAdminNotices not available for service library upsell.' );
					}
				}
			} );
		}

		// Block toggle shows/hides the blocking fields.
		const blockToggle = document.getElementById( 'wpconsent-review-block-toggle' );
		const blockingFields = document.getElementById( 'wpconsent-review-blocking-fields' );
		if ( blockToggle && blockingFields ) {
			blockToggle.addEventListener( 'change', () => {
				blockingFields.style.display = blockToggle.checked ? '' : 'none';
			} );
		}

		// Service modal close triggers.
		const modal = document.getElementById( 'wpconsent-modal-inspector-service' );
		if ( modal ) {
			const form = modal.querySelector( 'form' );
			modal.querySelector( '.wpconsent-modal-close' )?.addEventListener( 'click', closeServiceModal );
			modal.querySelector( '.wpconsent-button-secondary' )?.addEventListener( 'click', closeServiceModal );
			if ( form ) {
				form.addEventListener( 'submit', handleServiceSubmit );
			}
		}

		// When a service is imported from the library, add it to the local list and select it.
		document.addEventListener( 'wpconsent:service-added', function ( e ) {
			const service = e.detail;
			if ( ! service || ! service.id ) {
				return;
			}

			const alreadyExists = services.find( ( s ) => String( s.id ) === String( service.id ) );
			if ( ! alreadyExists ) {
				services.push( {
					id: service.id,
					name: service.name,
					category_id: parseInt( service.category_id, 10 ),
				} );
			}

			updateServiceSelect();

			const serviceSelect = document.getElementById( 'wpconsent-review-service' );
			if ( serviceSelect ) {
				serviceSelect.value = service.id;
			}
		} );
	}

	document.addEventListener( 'DOMContentLoaded', init );
}() );
