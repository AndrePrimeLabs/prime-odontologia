/**
 * Show the banner and handle position changes.
 *
 * @package WPConsent
 */

// Fallback styles injected into the shadow root when the banner stylesheet
// fails to load, so the consent UI stays usable (#192). Colors come from the
// inline --wpconsent-* props on #wpconsent-root, which survive the failure.
const WPCONSENT_FALLBACK_CSS = `
#wpconsent-banner-holder {
	display: none;
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: var(--wpconsent-z-index, 900000);
}
#wpconsent-banner-holder.wpconsent-banner-visible {
	display: block;
}
#wpconsent-banner-holder .wpconsent-banner {
	box-sizing: border-box;
	margin: 10px;
	padding: var(--wpconsent-padding, 15px 20px);
	background: var(--wpconsent-background, #ffffff);
	color: var(--wpconsent-text, #1a1a1a);
	border-radius: 10px;
	box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
	font-size: var(--wpconsent-font-size, 14px);
	line-height: 1.4;
}
#wpconsent-banner-holder .wpconsent-banner-footer {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 12px;
}
#wpconsent-banner-holder button,
#wpconsent-preferences-modal button {
	cursor: pointer;
	padding: 8px 16px;
	border: 1px solid rgba(0, 0, 0, 0.2);
	border-radius: 4px;
	font-size: inherit;
}
#wpconsent-banner-holder .wpconsent-accept-all,
#wpconsent-preferences-modal .wpconsent-accept-all {
	background: var(--wpconsent-accept-bg, #2563eb);
	color: var(--wpconsent-accept-color, #ffffff);
	border-color: transparent;
}
#wpconsent-banner-holder .wpconsent-cancel-cookies,
#wpconsent-preferences-modal .wpconsent-cancel-cookies {
	background: var(--wpconsent-cancel-bg, #f3f4f6);
	color: var(--wpconsent-cancel-color, #1a1a1a);
}
#wpconsent-preferences-modal {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 10202020;
	align-items: center;
	justify-content: center;
}
#wpconsent-preferences-modal .wpconsent-preferences-content {
	box-sizing: border-box;
	width: 800px;
	max-width: 90%;
	max-height: 90vh;
	margin: auto;
	padding: 20px;
	overflow: auto;
	background: var(--wpconsent-background, #ffffff);
	color: var(--wpconsent-text, #1a1a1a);
	border-radius: 10px;
	box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
}
#wpconsent-consent-floating {
	display: none;
	position: fixed;
	bottom: 20px;
	left: 20px;
	z-index: 9999;
	cursor: pointer;
}
#wpconsent-gpc-toast {
	position: fixed;
	bottom: 20px;
	right: 20px;
	max-width: 280px;
	padding: 10px 14px;
	z-index: calc(var(--wpconsent-z-index, 900000) + 1);
	background: var(--wpconsent-background, #ffffff);
	color: var(--wpconsent-text, #1a1a1a);
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
`;

// Define global WPConsent namespace
window.WPConsent = {
	// Hook system for display checks
	displayChecks: [],
	checksPassed: true,

	// Hook system for settings modification
	settingsHooks: [],
	settingsProcessed: false,

	// 1. Add storage for the listener and the last known state
	listeners: [],
	lastPreferences: null,

	// Lazy CSS loading state: the shadow-root stylesheet is fetched on first
	// reveal of any UI element that needs it, then cached so it loads at most once.
	cssPromise: null,

	// 2. The Registration function GTM will call.
	registerListener: function( callback ) {
		this.listeners.push( callback );

		// If we already know the preferences, tell GTM immediately.
		if ( this.lastPreferences ) {
			try {
				callback( this.lastPreferences );
			} catch ( e ) {
				console.error( 'Error in WPConsent listener:', e );
			}
		}
	},

	// Register a display check function that returns a promise
	registerDisplayCheck: function ( checkFunction ) {
		this.displayChecks.push( checkFunction );
		this.checksPassed = false;
	},

	// Register a settings hook function that returns a promise
	// The hook function receives the current settings object and should return a promise
	// that resolves when settings modifications are complete
	registerSettingsHook: function ( hookFunction ) {
		this.settingsHooks.push( hookFunction );
		this.settingsProcessed = false;
	},

	// Run all display checks and return a promise
	runDisplayChecks: function () {
		if ( this.displayChecks.length === 0 ) {
			this.checksPassed = true;
			return Promise.resolve();
		}

		return Promise.all( this.displayChecks.map( check => check() ) )
		              .then( () => {
			              this.checksPassed = true;
			              return Promise.resolve();
		              } )
		              .catch( error => {
			              console.error( 'Error in WPConsent display check:', error );
			              this.checksPassed = true; // Default to showing banner on error
			              return Promise.resolve();
		              } );
	},

	// Run all settings hooks and return a promise
	// This allows other scripts to modify the wpconsent settings before init proceeds
	runSettingsHooks: function () {
		if ( this.settingsHooks.length === 0 ) {
			this.settingsProcessed = true;
			return Promise.resolve();
		}

		// Pass the current wpconsent settings to each hook
		return Promise.all( this.settingsHooks.map( hook => hook( window.wpconsent ) ) )
		              .then( () => {
			              this.settingsProcessed = true;
			              return Promise.resolve();
		              } )
		              .catch( error => {
			              console.error( 'Error in WPConsent settings hook:', error );
			              this.settingsProcessed = true; // Continue with init even if hooks fail
			              return Promise.resolve();
		              } );
	},

	// Generic hook system for extensibility.
	hooks: {
		beforeShowPreferences: [],
		afterShowPreferences: [],
		beforeHideBanner: [],
		afterHideBanner: [],
		beforeShowBanner: [],
		afterShowBanner: [],
		accordionToggled: []
	},

	// Add a hook callback for a specific event.
	addHook: function( hookName, callback ) {
		if ( this.hooks[hookName] ) {
			this.hooks[hookName].push( callback );
		}
	},

	// Run all hooks for a specific event.
	runHooks: function( hookName, ...args ) {
		if ( this.hooks[hookName] && this.hooks[hookName].length > 0 ) {
			this.hooks[hookName].forEach( callback => {
				try {
					callback( ...args );
				} catch ( error ) {
					console.error( `Error in WPConsent hook ${hookName}:`, error );
				}
			} );
		}
	},

	/**
	 * Show toast notification
	 * @param {string} message - Message to display
	 * @param {number} duration - Duration in milliseconds (default 2500)
	 */
	showToast: function( message, duration = 2500 ) {
		// The toast is a shadow-root element; ensure styles are present first.
		this.ensureCSS().then( () => {
			const toast = this.shadowRoot.querySelector( '#wpconsent-gpc-toast' );
			if ( ! toast ) {
				return;
			}

			// Update message
			const messageEl = toast.querySelector( '.wpconsent-toast-message' );
			if ( messageEl && message ) {
				messageEl.textContent = message;
			}

			// Show toast
			toast.style.display = 'block';
			setTimeout( () => {
				toast.classList.add( 'wpconsent-toast-visible' );
			}, 10 );

			// Auto-hide after duration
			const hideToast = () => {
				toast.classList.remove( 'wpconsent-toast-visible' );
				setTimeout( () => {
					toast.style.display = 'none';
				}, 300 ); // Match CSS transition duration
			};

			// Set auto-hide timer
			const timer = setTimeout( hideToast, duration );

			// Close button functionality
			const closeBtn = toast.querySelector( '.wpconsent-toast-close' );
			if ( closeBtn ) {
				closeBtn.onclick = () => {
					clearTimeout( timer );
					hideToast();
				};
			}
		} );
	},

	/**
	 * Highlight GPC override toggle to draw user's attention
	 */
	highlightGPCOverride: function() {
		const gpcToggleLabel = this.shadowRoot.querySelector( '#wpconsent-gpc-override-toggle-label' );
		const gpcCheckbox = this.shadowRoot.querySelector( '#wpconsent-gpc-override-checkbox' );
		const gpcContainer = this.shadowRoot.querySelector( '#wpconsent-gpc-override-container' );

		if ( ! gpcToggleLabel ) {
			return;
		}

		// Add error class for styling
		gpcToggleLabel.classList.add( 'wpconsent-gpc-override-error' );

		// Shake animation to draw attention
		gpcToggleLabel.classList.add( 'wpconsent-shake' );
		setTimeout( () => {
			gpcToggleLabel.classList.remove( 'wpconsent-shake' );
		}, 300 );

		// Focus the checkbox for accessibility
		if ( gpcCheckbox ) {
			gpcCheckbox.focus();
		}

		// Scroll to container
		if ( gpcContainer ) {
			setTimeout( () => {
				gpcContainer.scrollIntoView( { behavior: 'smooth', block: 'center' } );
			}, 100 );
		}

		// Remove error state after user checks the box
		if ( gpcCheckbox ) {
			gpcCheckbox.addEventListener( 'change', function() {
				if ( gpcCheckbox.checked ) {
					gpcToggleLabel.classList.remove( 'wpconsent-gpc-override-error' );
				}
			}, { once: true } );
		}
	},

	// Core functions that need to be globally accessible
	acceptAll: function () {
		const preferences = {};
		if ( Array.isArray( wpconsent.slugs ) ) {
			wpconsent.slugs.forEach( slug => {
				preferences[slug] = true;
			} );
		}
		this.savePreferences( preferences );
		this.closePreferences();
	},

	checkGPC: function () {
		if ( !wpconsent.respect_gpc || navigator.globalPrivacyControl !== true ) {
			return;
		}

		// Check for existing preferences
		const existingPreferences = this.getCookie( 'wpconsent_preferences' );
		let currentPreferences = {};

		if ( existingPreferences ) {
			try {
				currentPreferences = JSON.parse( existingPreferences );
			} catch ( e ) {
				console.error( 'WPConsent: Error parsing existing preferences:', e );
			}
		}

		// If respect_gpc already exists, just return
		if ( currentPreferences.hasOwnProperty( 'respect_gpc' ) ) {
			return;
		}

		// If respect_gpc doesn't exist, create new GPC preferences
		const gpcPreferences = {};
		wpconsent.slugs.forEach( slug => {
			const serviceCheckbox = this.shadowRoot?.querySelector( `#wpconsent-preferences-modal input[type="checkbox"][id="cookie-service-${slug}"]` );
			if ( serviceCheckbox && serviceCheckbox.disabled ) {
				gpcPreferences[slug] = true;
			} else {
				gpcPreferences[slug] = false;
			}
		} );
		gpcPreferences.essential = true; // Essential is always true
		gpcPreferences.respect_gpc = true; // Mark that GPC was acknowledged

		// Apply GPC preferences - savePreferences handles all the comparison logic
		this.savePreferences( gpcPreferences, true ); // This is automatic GPC application

		// Show toast notification that GPC was honored (if enabled).
		if ( wpconsent.gpc_toast_enabled !== false ) {
			const toastMessage = wpconsent.gpc_toast_message || 'GPC Signal Honored';
			const toastDuration = wpconsent.gpc_toast_duration || 10000;
			this.showToast( toastMessage, toastDuration );
		}

		// Disable banner
		this.checksPassed = false;
	},

	savePreferences: function ( preferences, isGPCChange = false ) {
		const existingPreferences = this.getCookie( 'wpconsent_preferences' );
		let reload = false;

		// Parse existing preferences for proper comparison
		let parsedExistingPreferences = null;
		if ( existingPreferences ) {
			try {
				parsedExistingPreferences = JSON.parse( existingPreferences );
			} catch ( e ) {
				console.error( 'WPConsent: Error parsing existing preferences:', e );
			}
		}

		// Check if GPC override acknowledgment is required (only for manual user changes)
		if ( wpconsent.respect_gpc && ! isGPCChange && parsedExistingPreferences ) {
			const hasGPCSignal = navigator.globalPrivacyControl === true;
			const respectGPCInPrefs = parsedExistingPreferences.respect_gpc === true;

			// If user had GPC honored and is now changing preferences, require acknowledgment
			if ( hasGPCSignal && respectGPCInPrefs ) {
				const gpcCheckbox = this.shadowRoot.querySelector( '#wpconsent-gpc-override-checkbox' );
				if ( gpcCheckbox && ! gpcCheckbox.checked ) {
					// Highlight the toggle with validation styling
					this.highlightGPCOverride();
					return; // Don't save preferences
				}

				// User checked the box - mark GPC as overridden
				preferences.respect_gpc = false;
			}
		}

		// Clear cookies if the preferences changed OR if wpconsent.default_allow is true and not all settings are true. (unless it's a GPC change)
		if ( ! isGPCChange ) {
			if ( (
					parsedExistingPreferences && JSON.stringify( parsedExistingPreferences ) !== JSON.stringify( preferences )
				) || (
					wpconsent.default_allow && Object.values( preferences ).some( value => value === false )
				) ) {
				this.clearCookies();
				reload = true;
			}
		}

		// Check if GPC was overridden by user
		if ( wpconsent.respect_gpc && !isGPCChange && parsedExistingPreferences && parsedExistingPreferences.hasOwnProperty( 'respect_gpc' ) ) {
			preferences.respect_gpc = false;  // Mark that GPC was overridden by user
		}

		// Save preferences to a cookie
		this.setCookie( 'wpconsent_preferences', JSON.stringify( preferences ), wpconsent.consent_duration );

		// Hide the banner
		this.hideBanner();

		// Close preferences modal if open
		this.closePreferences();

		// Unlock scripts based on the new preferences
		this.unlockScripts( preferences );

		// Unlock iframes based on the new preferences
		this.unlockIframes( preferences );

		// Show the floating button if enabled in settings
		this.showFloatingButtonIfEnabled();

		this.updateWordPressConsent( preferences );

		// Trigger events.
		window.dispatchEvent( new CustomEvent( 'wpconsent_consent_saved', {detail: preferences} ) );

		if ( existingPreferences ) {
			window.dispatchEvent( new CustomEvent( 'wpconsent_consent_updated', {detail: preferences} ) );
		}

		if ( reload ) {
			// Override document.cookie to prevent new cookies from being set before we reload the page.
			Object.defineProperty( document, 'cookie', {
				get: function () {
					return '';
				},
				set: function ( value ) {
				}
			} );
			// Reload the page if we cleared cookies to ensure the new preferences are applied.
			window.location.reload();
		}
	},

	showPreferences: function () {
		// The preferences modal lives in the shadow root, so ensure its styles are
		// loaded before display. On consented pageviews with the floating button
		// disabled this is the first (and only) time the CSS is fetched.
		// Returns the promise so callers can act after the modal is populated (e.g.
		// the GPC override flow that pre-checks specific boxes after the restore).
		return this.ensureCSS().then( () => {
			const modal = this.shadowRoot?.querySelector( '#wpconsent-preferences-modal' );
			if ( modal ) {
				modal.style.display = 'flex';
				// Set up focus trap for the preferences modal
				this.setupFocusTrap( modal );

				// Run afterShowPreferences hooks for extensions.
				this.runHooks( 'afterShowPreferences' );

				// Focus the preferences title
				const modalTitle = this.shadowRoot?.querySelector( '#wpconsent-preferences-title' );
				if ( modalTitle ) {
					setTimeout( () => {
						modalTitle.focus( {preventScroll: true} );
						// Set this as our tracked element
						this.lastFocusedElement = modalTitle;
					}, 100 );
				}

				// Set checkbox states based on saved preferences
				const preferences = this.getCookie( 'wpconsent_preferences' );
				if ( preferences ) {
					try {
						const savedPreferences = JSON.parse( preferences );
						const checkboxes = this.shadowRoot.querySelectorAll( '#wpconsent-preferences-modal input[type="checkbox"]' );
						checkboxes.forEach( checkbox => {
							let preferenceKey = null;

							// Handle category checkboxes (ID: cookie-category-{slug})
							if ( checkbox.id.startsWith( 'cookie-category-' ) ) {
								preferenceKey = checkbox.id.replace( 'cookie-category-', '' );
							}
							// Handle service checkboxes (ID: cookie-service-{slug})
							else if ( checkbox.id.startsWith( 'cookie-service-' ) ) {
								preferenceKey = checkbox.id.replace( 'cookie-service-', '' );
							}
							// Fallback to using value attribute for other patterns
							else {
								preferenceKey = checkbox.value;
							}

							if ( preferenceKey && preferenceKey in savedPreferences ) {
								checkbox.checked = savedPreferences[preferenceKey];
							}
						} );

						// Handle GPC override toggle visibility
						const gpcOverrideContainer = this.shadowRoot.querySelector( '#wpconsent-gpc-override-container' );
						if ( gpcOverrideContainer ) {
							const hasGPCSignal = navigator.globalPrivacyControl === true;
							const respectGPCInPrefs = savedPreferences && savedPreferences.respect_gpc === true;

							// Show toggle if GPC signal exists and was previously honored
							if ( hasGPCSignal && respectGPCInPrefs ) {
								gpcOverrideContainer.style.display = 'block';
							} else {
								gpcOverrideContainer.style.display = 'none';
							}
						}
					} catch ( e ) {
						console.error( 'Error parsing WPConsent preferences:', e );
					}
				}
			}
		} );
	},

	closePreferences: function () {
		const modal = this.shadowRoot?.querySelector( '#wpconsent-preferences-modal' );
		if ( modal ) {
			modal.style.display = 'none';
			// Remove focus trap when preferences modal is closed
			this.removeFocusTrap();
			// Return focus to the element that had focus before the modal was shown
			if ( this.previouslyFocusedElement ) {
				this.previouslyFocusedElement.focus( {preventScroll: true} );
				this.previouslyFocusedElement = null;
			}
		}
	},

	showBanner: function () {
		if ( !wpconsent.enable_consent_banner ) {
			return;
		}

		const banner = this.shadowRoot?.querySelector( '#wpconsent-banner-holder' );
		if ( !banner ) {
			return;
		}

		// Load the stylesheet before revealing so the banner never flashes unstyled.
		this.ensureCSS().then( () => {
			// Run beforeShowBanner hooks for extensions.
			this.runHooks( 'beforeShowBanner' );

			banner.classList.add( 'wpconsent-banner-visible' );
			// Update button visibility based on current settings
			this.updateButtonVisibility( wpconsent );
			// Set up focus trap for the banner
			this.setupFocusTrap( banner );

			// Run afterShowBanner hooks for extensions.
			this.runHooks( 'afterShowBanner' );
		} );
	},

	hideBanner: function () {
		const banner = this.shadowRoot?.querySelector( '#wpconsent-banner-holder' );
		if ( banner ) {
			// Run beforeHideBanner hooks for extensions.
			this.runHooks( 'beforeHideBanner' );

			banner.classList.remove( 'wpconsent-banner-visible' );
			// Remove focus trap when banner is hidden
			this.removeFocusTrap();
			// Return focus to the element that had focus before the banner was shown
			if ( this.previouslyFocusedElement ) {
				this.previouslyFocusedElement.focus( {preventScroll: true} );
				this.previouslyFocusedElement = null;
			}

			// Run afterHideBanner hooks for extensions.
			this.runHooks( 'afterHideBanner' );
		}
	},

	setCookie: function ( name, value, days ) {
		let expires = '';
		if ( days > 0 ) {
			const date = new Date();
			date.setTime( date.getTime() + (
				days * 24 * 60 * 60 * 1000
			) );
			expires = 'expires=' + date.toUTCString() + ';';
		}

		// Get the domain string for the cookie
		const domain = this.getCookieDomain();
		document.cookie = name + '=' + value + ';' + expires + domain + 'path=/';
	},

	// Get the appropriate domain string for cookie setting
	getCookieDomain: function() {
		// Check if subdomain sharing is enabled
		if (!wpconsent.enable_shared_consent) {
			return '';
		}

		// Use pre-calculated cookie domain from settings
		if (wpconsent.cookie_domain && wpconsent.cookie_domain !== '') {
			// Check if domain already starts with a dot to avoid double-dot issue
			const domain = wpconsent.cookie_domain.startsWith('.')
				? wpconsent.cookie_domain
				: '.' + wpconsent.cookie_domain;
			return 'domain=' + domain + ';';
		}
		// Return empty string for default behavior (current domain only)
		// This ensures the cookie is set for the current domain without any domain attribute
		return '';
	},

	getCookie: function ( name ) {
		const value = `; ${document.cookie}`;
		const parts = value.split( `; ${name}=` );
		if ( parts.length === 2 ) {
			return parts.pop().split( ';' ).shift();
		}
	},

	hasConsent: function ( category ) {
		// Get current preferences from cookie
		const preferencesStr = this.getCookie( 'wpconsent_preferences' );
		if ( !preferencesStr ) {
			return false;
		}

		try {
			const preferences = JSON.parse( preferencesStr );
			// Essential cookies are always allowed
			if ( category === 'essential' ) {
				return true;
			}
			// Return the status for the requested category
			return preferences[category] === true;
		} catch ( e ) {
			console.error( 'Error parsing WPConsent preferences:', e );
			return false;
		}
	},

	shouldUnlockContent: function ( preferences, service, category ) {
		// Essential category is always allowed
		if ( category === 'essential' ) {
			return true;
		}

		// Get manual_toggle_services setting from wpconsent object
		const manualToggleServices = wpconsent.manual_toggle_services;

		// If manual toggle services is enabled
		if ( manualToggleServices ) {
			if ( service && preferences[service] !== undefined ) {
				return preferences[service];
			}
			return preferences[category] === true;
		}

		return preferences[category] === true;
	},

	unlockScripts: function ( preferences ) {
		// 1. SAVE the state so late-comers (like GTM) can see it
		this.lastPreferences = preferences;

		// 2. NOTIFY existing listeners
		if ( this.listeners && this.listeners.length > 0 ) {
			this.listeners.forEach( callback => {
				try {
					callback( preferences );
				} catch ( e ) {
					console.error( 'Error in WPConsent listener:', e );
				}
			});
		}

		const scripts = document.querySelectorAll( 'script[type="text/plain"]' );
		scripts.forEach( script => {
			const category = script.getAttribute( 'data-wpconsent-category' );
			const service = script.getAttribute( 'data-wpconsent-name' );

			if ( this.shouldUnlockContent( preferences, service, category ) ) {
				const newScript = document.createElement( 'script' );

				// Copy all attributes except 'type'
				script.getAttributeNames().forEach( attr => {
					if ( attr !== 'type' ) {
						newScript.setAttribute( attr, script.getAttribute( attr ) );
					}
				} );

				// Handle src attribute
				const src = script.getAttribute( 'data-wpconsent-src' );
				if ( src ) {
					newScript.src = src;
				} else {
					newScript.text = script.text;
				}

				script.parentNode.replaceChild( newScript, script );
			}
		} );

		// Send a custom event on the document when consent is processed.
		document.dispatchEvent( new CustomEvent( 'wpconsent_consent_processed', {detail: preferences} ) );

		// Include our developer id.
		WPConsent.localGtag( 'set', 'developer_id.dMmRkYz', true );

		// Update gtag consent state.
		WPConsent.localGtag(
			'consent',
			'update',
			{
				'ad_storage': preferences.marketing ? 'granted' : 'denied',
				'analytics_storage': preferences.statistics ? 'granted' : 'denied',
				'ad_user_data': preferences.marketing ? 'granted' : 'denied',
				'ad_personalization': preferences.marketing ? 'granted' : 'denied',
				'personalization_storage': preferences.marketing ? 'granted' : 'denied'
			}
		);

		// Push event to GTM dataLayer for tag triggering.
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({
			'event': 'wpconsent_consent_processed',
			'wpconsentPreferences': preferences
		});
	},

	unlockIframes: function ( preferences ) {
		const iframes = document.querySelectorAll( 'iframe[data-wpconsent-src]' );
		iframes.forEach( iframe => {
			const category = iframe.getAttribute( 'data-wpconsent-category' );
			const service = iframe.getAttribute( 'data-wpconsent-name' );

			if ( this.shouldUnlockContent( preferences, service, category ) ) {
				// Get the src from the data attribute
				const src = iframe.getAttribute( 'data-wpconsent-src' );
				if ( src ) {
					iframe.src = src;
				}

				// Remove the data attributes
				iframe.removeAttribute( 'data-wpconsent-src' );
				iframe.removeAttribute( 'data-wpconsent-name' );
				iframe.removeAttribute( 'data-wpconsent-category' );
			}
		} );

		// Let's loop through all .wpconsent-iframe-placeholder and remove thumbnail and overlay based on data-wpconsent-category.
		const placeholders = document.querySelectorAll( '.wpconsent-iframe-placeholder' );
		placeholders.forEach( placeholder => {
			const category = placeholder.getAttribute( 'data-wpconsent-category' );
			const service = placeholder.getAttribute( 'data-wpconsent-name' );

			if ( this.shouldUnlockContent( preferences, service, category ) ) {
				const thumbnail = placeholder.querySelector( '.wpconsent-iframe-thumbnail' );
				const overlay = placeholder.querySelector( '.wpconsent-iframe-overlay-content' );
				if ( thumbnail ) {
					thumbnail.remove();
				}
				if ( overlay ) {
					overlay.remove();
				}
				// Remove wpconsent-iframe-placeholder class.
				placeholder.classList.remove( 'wpconsent-iframe-placeholder' );
			}
		} );
	},

	// Initialize the banner
	init: function () {
		// Run settings hooks first to allow other scripts to modify settings
		this.runSettingsHooks().then( () => {
			this.initWordPress();

			// Update button visibility after settings hooks have potentially modified settings
			this.updateButtonVisibility( wpconsent );

			const container = document.getElementById( 'wpconsent-container' );
			const template = document.getElementById( 'wpconsent-template' );

			// Container and template are absent when wpconsent_banner_output suppresses output_banner() (EDD receipts, builder previews).
			if ( !container || !template ) {
				return;
			}

			// Get existing shadow root or create new one
			this.shadowRoot = container.shadowRoot;
			if ( !this.shadowRoot ) {
				this.shadowRoot = container.attachShadow( {mode: 'open'} );
				const content = template.content.cloneNode( true );
				this.shadowRoot.appendChild( content );
				template.remove();

				// Initialize event listeners and other UI components
				this.initializeEventListeners();
				this.initializeAccordions();
				this.initializeKeyboardHandlers();

				// Run all display checks before proceeding with banner initialization.
				// CSS is no longer pre-loaded here: it is fetched lazily by the reveal
				// methods (showBanner / showPreferences / showToast /
				// showFloatingButtonIfEnabled) only when a shadow-root element is
				// actually shown, so consented visitors who see nothing never fetch it.
				this.runDisplayChecks().then( () => {
					this.processBannerDisplay();
				} );
			} else {
				// If shadow root already exists, run display checks then process banner display
				this.runDisplayChecks().then( () => {
					this.processBannerDisplay();
				} );
			}
		} );
	},

	// Process banner display based on existing preferences
	processBannerDisplay: function () {
		// Check GPC first - it will set preferences if GPC signal exists and should be honored
		this.checkGPC();

		// Check for existing preferences (may have just been set by checkGPC)
		const existingPreferences = this.getCookie( 'wpconsent_preferences' );
		if ( existingPreferences ) {
			let preferences = {};
			try {
				// Check if the preferences are valid JSON.
				preferences = JSON.parse( existingPreferences );

				// Check if preferences keys match current slugs
				if (
					wpconsent.slugs && Array.isArray( wpconsent.slugs ) &&
					!wpconsent.slugs.every( slug => preferences.hasOwnProperty( slug ) )
				) {
					// Preferences are outdated, clear cookie and show banner
					this.setCookie( 'wpconsent_preferences', '', - 1 ); // Expire the cookie
					// Only show banner if all checks have passed
					if ( this.checksPassed ) {
						this.showBanner();
					}
					return;
			}

				this.unlockScripts( preferences );
				this.unlockIframes( preferences );
			} catch ( e ) {
				console.error( 'Error parsing WPConsent preferences:', e );
			}
			// Only show floating button if enabled in settings
			this.showFloatingButtonIfEnabled();
		} else {
			// No existing preferences, show banner if all checks have passed
			if ( this.checksPassed ) {
				this.showBanner();
			}

			// If default_allow is true, let's unlock scripts until the user accepts or declines.
			if ( wpconsent.default_allow || !wpconsent.enable_script_blocking ) {
				const allPreferences = {};
				// Get all slugs and set them to true.
				wpconsent.slugs.forEach( slug => {
					allPreferences[slug] = true;
				} );
				this.unlockScripts( allPreferences );
				this.unlockIframes( allPreferences );
			} else if ( !wpconsent.enable_content_blocking ) {
				// Content blocking is disabled (e.g. by geolocation) but script blocking is still on.
				// Only unlock iframes, not scripts.
				const allPreferences = {};
				wpconsent.slugs.forEach( slug => {
					allPreferences[slug] = true;
				} );
				this.unlockIframes( allPreferences );
			}
		}

		// Reveal overlay buttons on placeholders that are still blocked.
		// They start with the wpconsent-content-hidden class to prevent a flash
		// for content that gets unlocked immediately (opt-out mode, geolocation, etc.).
		document.querySelectorAll( '.wpconsent-iframe-overlay-content.wpconsent-content-hidden' ).forEach( function( el ) {
			el.classList.remove( 'wpconsent-content-hidden' );
		} );

		// Dispatch event to notify that the banner is fully initialized
		window.dispatchEvent( new CustomEvent( 'wpconsent_banner_initialized' ) );
	},

	// Ensure the shadow-root stylesheet is loaded exactly once.
	// Returns a promise that resolves when the CSS is ready (or failed gracefully).
	// Safe to call from every reveal path; subsequent calls reuse the first promise.
	ensureCSS: function () {
		if ( this.cssPromise ) {
			return this.cssPromise;
		}
		const container = document.getElementById( 'wpconsent-container' );
		this.cssPromise = this.loadExternalCSS( container );
		return this.cssPromise;
	},

	// Reveal the shadow host. Safe to call multiple times.
	revealContainer: function ( container ) {
		if ( container ) {
			container.style.display = 'block';
		}
	},

	// Load the stylesheet with a retry + timeout guard; fall back to injected styles on failure (#192).
	loadExternalCSS: function ( container ) {
		return new Promise( ( resolve ) => {
			// Guard against a duplicate <link> if this is ever reached twice.
			if ( this.shadowRoot && this.shadowRoot.querySelector( 'link[data-wpconsent-css]' ) ) {
				this.revealContainer( container );
				resolve();
				return;
			}

			if ( ! this.shadowRoot ) {
				resolve();
				return;
			}

			const baseUrl = `${wpconsent.css_url}?ver=${wpconsent.css_version}`;
			const maxAttempts = 2; // Initial try + one retry.
			const loadTimeout = 5000; // ms before treating a hung request as failed.
			let settled = false;

			const finish = () => {
				if ( settled ) {
					return;
				}
				settled = true;
				resolve();
			};

			const attempt = ( n ) => {
				let timer = null;
				const link = document.createElement( 'link' );
				link.rel = 'stylesheet';
				// Cache-bust the retry so a negatively-cached first failure is bypassed.
				link.href = n === 1 ? baseUrl : `${baseUrl}&wpcretry=${n}`;
				link.setAttribute( 'data-wpconsent-css', '' );

				const cleanup = () => {
					if ( timer ) {
						clearTimeout( timer );
						timer = null;
					}
					link.onload = null;
					link.onerror = null;
				};

				const onFailure = ( fromTimeout ) => {
					cleanup();
					// Drop the dead <link> so the retry's dedupe guard and the DOM stay clean.
					if ( link.parentNode ) {
						link.parentNode.removeChild( link );
					}
					// Retry a hard error once; a timeout means the host is unreachable, so fall back now.
					if ( n < maxAttempts && ! fromTimeout ) {
						attempt( n + 1 );
					} else {
						this.applyCSSFallback( container, baseUrl );
						finish();
					}
				};

				link.onload = () => {
					cleanup();
					this.revealContainer( container );
					finish();
				};
				link.onerror = () => onFailure( false );
				timer = setTimeout( () => onFailure( true ), loadTimeout );

				try {
					this.shadowRoot.appendChild( link );
				} catch ( error ) {
					console.error( 'WPConsent: failed to inject stylesheet link:', error );
					onFailure();
				}
			};

			attempt( 1 );
		} );
	},

	// Inject fallback styles into the shadow root and reveal the host. Idempotent.
	applyCSSFallback: function ( container, cssUrl ) {
		if ( this.shadowRoot && ! this.shadowRoot.querySelector( 'style[data-wpconsent-css-fallback]' ) ) {
			const style = document.createElement( 'style' );
			style.setAttribute( 'data-wpconsent-css-fallback', '' );
			style.textContent = WPCONSENT_FALLBACK_CSS;
			this.shadowRoot.appendChild( style );
		}
		this.revealContainer( container );
		console.error( `WPConsent: failed to load styles from ${cssUrl}; showing the consent UI with fallback styling.` );
		window.dispatchEvent( new CustomEvent( 'wpconsent_css_failed', { detail: { url: cssUrl } } ) );
	},

	// Initialize event listeners
	initializeEventListeners: function () {
		// Accept all button
		this.shadowRoot.querySelectorAll( '.wpconsent-accept-all' ).forEach( button => button.addEventListener( 'click', () => this.acceptAll() ) );

		// Cancel all button (reject all) - works for both initial banner and preferences modal.
		this.shadowRoot.querySelectorAll( '.wpconsent-cancel-cookies' ).forEach( button => button.addEventListener( 'click', () => {
			const preferences = {};
			wpconsent.slugs.forEach( slug => {
				const serviceCheckbox = this.shadowRoot.querySelector( `#wpconsent-preferences-modal input[type="checkbox"][id="cookie-service-${slug}"]` );
				if ( serviceCheckbox && serviceCheckbox.disabled ) {
					preferences[slug] = true;
				} else {
					preferences[slug] = false;
				}
			} );
			preferences.essential = true; // Essential is always true.
			this.savePreferences( preferences );
		} ) );

		// Close button
		this.shadowRoot.querySelector( '#wpconsent-banner-close' )?.addEventListener( 'click', () => this.hideBanner() );

		// Preferences button
		this.shadowRoot.querySelector( '#wpconsent-preferences-all' )?.addEventListener( 'click', () => this.showPreferences() );

		// Floating button
		const floatingButton = this.shadowRoot.querySelector( '#wpconsent-consent-floating' );
		if ( floatingButton ) {
			floatingButton.addEventListener( 'click', () => this.showPreferences() );
		}

		// Add checkbox event listeners
		this.initializeCheckboxListeners();

		// Iframe placeholder buttons
		document.addEventListener( 'click', ( e ) => {
			const iframeButton = e.target.closest( '.wpconsent-iframe-accept-button' );
			if ( iframeButton ) {
				const category = iframeButton.getAttribute( 'data-category' );
				const placeholder = iframeButton.closest( '.wpconsent-iframe-placeholder' );
				const service = placeholder?.getAttribute( 'data-wpconsent-name' );

				if ( category ) {
					// Get current preferences.
					let currentPreferences = {};
					try {
						currentPreferences = JSON.parse( this.getCookie( 'wpconsent_preferences' ) || '{}' );
					} catch ( error ) {
						console.error( 'Failed to parse wpconsent_preferences cookie:', error );
					}

					// Check if GPC is currently being respected
					const hasGPCSignal = navigator.globalPrivacyControl === true;
					const respectGPCInPrefs = currentPreferences.respect_gpc === true;

					// If GPC is active, user needs to see preference panel with GPC override
					if ( wpconsent.respect_gpc && hasGPCSignal && respectGPCInPrefs ) {
						// Open preference panel, then pre-check the relevant boxes.
						// showPreferences is async (it awaits the lazy CSS load and then
						// restores saved checkbox states), so these overrides must run in
						// its resolution callback or the restore would clobber them.
						this.showPreferences().then( () => {
							// Pre-check the category/service checkboxes
							const categoryCheckbox = this.shadowRoot.querySelector( `#cookie-category-${category}` );
							if ( categoryCheckbox ) {
								categoryCheckbox.checked = true;
							}

							if ( service ) {
								const serviceCheckbox = this.shadowRoot.querySelector( `#cookie-service-${service}` );
								if ( serviceCheckbox ) {
									serviceCheckbox.checked = true;
								}
							}

							// Show and highlight the GPC override toggle
							const gpcContainer = this.shadowRoot.querySelector( '#wpconsent-gpc-override-container' );
							if ( gpcContainer ) {
								gpcContainer.style.display = 'block';
							}

							// Highlight the toggle with attention-grabbing styling
							this.highlightGPCOverride();
						} );
					} else {
						// No GPC active, directly save preferences
						const newPreferences = {
							...currentPreferences,
							essential: true, // Essential is always true
							[category]: true
						};

						// If we have a service name, also set its preference
						if ( service ) {
							newPreferences[service] = true;
						}

						// Save preferences and trigger unlock
						this.savePreferences( newPreferences );
					}
				}
			}
		} );

		// Custom button/link to open preferences panel
		document.addEventListener( 'click', ( e ) => {
			const preferencesButton = e.target.closest( '.wpconsent-open-preferences' );
			if ( preferencesButton ) {
				e.preventDefault();
				this.showPreferences();
			}
		} );

		// Preferences modal buttons
		this.shadowRoot.querySelector( '.wpconsent-preferences-header-close' )?.addEventListener( 'click', () => this.closePreferences() );
		this.shadowRoot.querySelector( '.wpconsent-save-preferences' )?.addEventListener( 'click', () => {
			const checkboxes = this.shadowRoot.querySelectorAll( '#wpconsent-preferences-modal input[type="checkbox"]' );
			const selectedCookies = Array.from( checkboxes )
			                             .filter( checkbox => checkbox.checked )
			                             .map( checkbox => checkbox.value );

			const preferences = {};

			wpconsent.slugs.forEach( slug => {
				preferences[slug] = selectedCookies.includes( slug );
			} );

			preferences.essential = true; // Essential is always true

			this.savePreferences( preferences );
		} );
		this.shadowRoot.querySelector( '.wpconsent-close-preferences' )?.addEventListener( 'click', () => this.closePreferences() );

		window.addEventListener( 'wpconsent_consent_saved', function ( event ) {
			// Fire this only if Clarity exists.
			if ( typeof window.clarity !== 'function' ) {
				return;
			}
			// Passed detail is preferences.
			const preferences = event.detail;

			window.clarity( 'consentv2', {
				ad_Storage: preferences.marketing ? 'granted' : 'denied',
				analytics_Storage: preferences.statistics ? 'granted' : 'denied',
			});
		} );
	},

	localGtag: function() {
		window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}
		// pass arguments to gtag function.
		gtag.apply(window, arguments);
	},

	// Initialize checkbox listeners for category and service checkboxes
	initializeCheckboxListeners: function () {
		const categoryCheckboxes = this.shadowRoot.querySelectorAll( '#wpconsent-preferences-modal input[type="checkbox"][id^="cookie-category-"]' );

		categoryCheckboxes.forEach( categoryCheckbox => {
			categoryCheckbox.addEventListener( 'change', ( e ) => {
				this.handleCategoryCheckboxChange( e.target );
			} );
		} );

		const serviceCheckboxes = this.shadowRoot.querySelectorAll( '#wpconsent-preferences-modal input[type="checkbox"][id^="cookie-service-"]' );

		serviceCheckboxes.forEach( serviceCheckbox => {
			serviceCheckbox.addEventListener( 'change', ( e ) => {
				this.handleServiceCheckboxChange( e.target );
			} );
		} );
	},

	handleCategoryCheckboxChange: function ( categoryCheckbox ) {
		const categoryId = categoryCheckbox.id.replace( 'cookie-category-', '' );

		// Find all service checkboxes in this category
		const serviceCheckboxes = this.shadowRoot.querySelectorAll( `#wpconsent-preferences-modal input[type="checkbox"][id^="cookie-service-"]` );

		serviceCheckboxes.forEach( serviceCheckbox => {
			// Only update service checkboxes that belong to this category
			if ( serviceCheckbox.closest( `.wpconsent-cookie-category-${categoryId}` ) ) {
				serviceCheckbox.checked = categoryCheckbox.checked;
			}
		} );
	},

	handleServiceCheckboxChange: function ( serviceCheckbox ) {
		const categoryAccordion = serviceCheckbox.closest( '.wpconsent-cookie-category' );
		if ( !categoryAccordion ) {
			return;
		}

		const categoryCheckbox = categoryAccordion.querySelector( 'input[type="checkbox"][id^="cookie-category-"]' );
		if ( !categoryCheckbox ) {
			return;
		}

		const serviceCheckboxes = categoryAccordion.querySelectorAll( 'input[type="checkbox"][id^="cookie-service-"]' );

		let anyChecked = false;
		serviceCheckboxes.forEach( checkbox => {
			if ( checkbox.checked ) {
				anyChecked = true;
			}
		} );

		categoryCheckbox.checked = anyChecked;
	},

	initializeAccordions() {
		const accordions = this.shadowRoot.querySelectorAll( '.wpconsent-preferences-accordion-item' );
		accordions.forEach( ( accordion ) => {
			const header = accordion.querySelector( '.wpconsent-preferences-accordion-header' );
			const content = accordion.querySelector( '.wpconsent-preferences-accordion-content' );

			if ( header && content ) {
				header.addEventListener( 'click', ( e ) => {
					// Don't toggle if clicking checkbox
					if ( e.target.closest( '.wpconsent-preferences-checkbox-toggle' ) ) {
						return;
					}

					// The category name is a <label for> so the checkbox gets an accessible
					// name, but letting the label activate would flip consent while the
					// accordion opens - and the animation hides that the toggle moved.
					// Keep the association, drop the activation: only the toggle sets consent.
					if ( e.target.closest( 'label[for^="cookie-category-"]' ) ) {
						e.preventDefault();
					}

					this.toggleAccordion( accordion, content );
				} );
			}
		} );

		this.syncAccordionInertState();
	},

	toggleAccordion( accordion, content ) {
		const isActive = accordion.classList.contains( 'active' );
		const parent = accordion.parentElement;
		const isService = accordion.classList.contains( 'wpconsent-cookie-service' );
		const isCategory = accordion.classList.contains( 'wpconsent-cookie-category' );

		// If this is a category accordion
		if ( isCategory ) {
			// Close all other category accordions at the same level
			if ( parent ) {
				parent.querySelectorAll( ':scope > .wpconsent-preferences-accordion-item.wpconsent-cookie-category' ).forEach( ( otherAccordion ) => {
					if ( otherAccordion !== accordion ) {
						otherAccordion.classList.remove( 'active' );
						// Update aria-expanded on the toggle button.
						const toggleButton = otherAccordion.querySelector( '.wpconsent-preferences-accordion-toggle' );
						if ( toggleButton ) {
							toggleButton.setAttribute( 'aria-expanded', 'false' );
						}
						// Also close all service accordions within this category
						otherAccordion.querySelectorAll( '.wpconsent-cookie-service' ).forEach( ( service ) => {
							service.classList.remove( 'active' );
							// Update aria-expanded on service toggle buttons.
							const serviceToggle = service.querySelector( '.wpconsent-preferences-accordion-toggle' );
							if ( serviceToggle ) {
								serviceToggle.setAttribute( 'aria-expanded', 'false' );
							}
							// Fire accordion toggled event for extensions.
							this.runHooks( 'accordionToggled', {
								accordion: service,
								content: service.querySelector( '.wpconsent-preferences-accordion-content' ),
								isActive: false,
								isService: true,
								isCategory: false
							} );
						} );
					}
				} );
			}
		}
		// If this is a service accordion
		else if ( isService ) {
			// Close all other service accordions at the same level
			if ( parent ) {
				parent.querySelectorAll( ':scope > .wpconsent-preferences-accordion-item.wpconsent-cookie-service' ).forEach( ( otherAccordion ) => {
					if ( otherAccordion !== accordion ) {
						otherAccordion.classList.remove( 'active' );
						// Update aria-expanded on the toggle button.
						const toggleButton = otherAccordion.querySelector( '.wpconsent-preferences-accordion-toggle' );
						if ( toggleButton ) {
							toggleButton.setAttribute( 'aria-expanded', 'false' );
						}
						// Fire accordion toggled event for extensions.
						this.runHooks( 'accordionToggled', {
							accordion: otherAccordion,
							content: otherAccordion.querySelector( '.wpconsent-preferences-accordion-content' ),
							isActive: false,
							isService: true,
							isCategory: false
						} );
					}
				} );
			}
		}

		// Toggle current accordion
		accordion.classList.toggle( 'active' );

		// Update aria-expanded on the current accordion's toggle button.
		const currentToggle = accordion.querySelector( '.wpconsent-preferences-accordion-toggle' );
		if ( currentToggle ) {
			const isNowActive = accordion.classList.contains( 'active' );
			currentToggle.setAttribute( 'aria-expanded', isNowActive ? 'true' : 'false' );
		}

		this.syncAccordionInertState();

		// Fire accordion toggled event for extensions.
		const nowActive = accordion.classList.contains( 'active' );
		this.runHooks( 'accordionToggled', {
			accordion: accordion,
			content: content,
			isActive: nowActive,
			isService: isService,
			isCategory: isCategory
		} );
	},


	// Initialize keyboard handlers for accessibility
	initializeKeyboardHandlers: function () {
		// Add event listener for tab key to manage focus
		document.addEventListener( 'keydown', ( e ) => {
			if ( e.key === 'Tab' ) {
				this.handleTabKey( e );
			} else if ( e.key === 'Escape' ) {
				this.handleEscapeKey( e );
			}
		} );
	},

	// Handle escape key press
	handleEscapeKey: function ( e ) {
		const preferencesModal = this.shadowRoot?.querySelector( '#wpconsent-preferences-modal' );
		const bannerHolder = this.shadowRoot?.querySelector( '#wpconsent-banner-holder' );

		// If preferences modal is open, close it
		if ( preferencesModal && preferencesModal.style.display === 'flex' ) {
			this.closePreferences();
		}
		// Otherwise, if banner is visible, close it
		else if ( bannerHolder && bannerHolder.classList.contains( 'wpconsent-banner-visible' ) ) {
			this.hideBanner();
		}
	},

	// Handle tab key press to implement focus trap
	handleTabKey: function ( e ) {
		// Check if banner or preferences modal is visible
		const bannerHolder = this.shadowRoot?.querySelector( '#wpconsent-banner-holder' );
		const preferencesModal = this.shadowRoot?.querySelector( '#wpconsent-preferences-modal' );

		const bannerVisible = bannerHolder && bannerHolder.classList.contains( 'wpconsent-banner-visible' );
		const preferencesVisible = preferencesModal && preferencesModal.style.display === 'flex';

		// If neither is visible, do nothing
		if ( !bannerVisible && !preferencesVisible ) {
			return;
		}

		// Determine which container is active
		const container = preferencesVisible ? preferencesModal : bannerHolder;

		// Get all focusable elements in the container
		const focusableElements = this.getFocusableElements( container );

		if ( focusableElements.length === 0 ) {
			return;
		}

		// Prevent default tab behavior
		e.preventDefault();

		// Set up variables for the first and last focusable elements
		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		// Track current element index
		let currentElement;

		// If we already have a tracked element, use it
		if ( this.lastFocusedElement && focusableElements.includes( this.lastFocusedElement ) ) {
			currentElement = this.lastFocusedElement;
		} else {
			// Otherwise, start with the first element
			currentElement = firstElement;
			this.lastFocusedElement = currentElement;
		}

		// Find the index of the current element
		const currentIndex = focusableElements.indexOf( currentElement );

		// Determine the next element to focus
		let nextElement;

		if ( e.shiftKey ) {
			// Shift+Tab moves backwards
			if ( currentIndex <= 0 ) {
				nextElement = lastElement; // Wrap to last element
			} else {
				nextElement = focusableElements[currentIndex - 1];
			}
		} else {
			// Tab moves forward
			if ( currentIndex >= focusableElements.length - 1 ) {
				nextElement = firstElement; // Wrap to first element
			} else {
				nextElement = focusableElements[currentIndex + 1];
			}
		}

		// Focus the next element and update our tracking
		nextElement.focus( {preventScroll: true} );
		this.lastFocusedElement = nextElement;
	},

	// Set up focus trap for a container
	setupFocusTrap: function ( container ) {
		// Store the element that had focus before opening the container
		this.previouslyFocusedElement = document.activeElement;
		// Reset the tracked focused element
		this.lastFocusedElement = null;
	},

	// Remove focus trap
	removeFocusTrap: function () {
		// Clear the tracked focused element
		this.lastFocusedElement = null;
	},

	// Set initial focus to the first focusable element
	setInitialFocus: function ( container ) {
		const focusableElements = this.getFocusableElements( container );
		if ( focusableElements.length > 0 ) {
			// Focus on the first button for better accessibility
			setTimeout( () => {
				focusableElements[0].focus( {preventScroll: true} );
				// Set this as our tracked element
				this.lastFocusedElement = focusableElements[0];
			}, 100 );
		}
	},

	// Get all focusable elements within a container
	getFocusableElements: function ( container ) {
		// Selectors for focusable elements
		const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

		// Query all focusable elements within the container
		const elements = Array.from( container.querySelectorAll( focusableSelectors ) )
			// Filter out anything that can't actually be reached.
			.filter( el => {
				// Consent toggles are inputs hidden with opacity: 0 on purpose - visually
				// hidden, still focusable - so the element's own opacity must not rule it
				// out, otherwise there is no way to set consent from the keyboard at all.
				// Its ancestors are still checked below, opacity included.
				if ( el.disabled ||
				     el.hasAttribute( 'hidden' ) ||
				     el.getAttribute( 'aria-hidden' ) === 'true' ||
				     el.closest( '[inert]' ) ||
				     this.isInCollapsedAccordion( el ) ) {
					return false;
				}

				const ownStyle = window.getComputedStyle( el );
				if ( ownStyle.display === 'none' || ownStyle.visibility === 'hidden' ) {
					return false;
				}

				// Check if all the ancestors up to the container are visible
				let currentElement = el.parentElement;
				while ( currentElement && currentElement !== container ) {
					const style = window.getComputedStyle( currentElement );
					if ( style.display === 'none' ||
					     style.visibility === 'hidden' ||
					     style.opacity === '0' ||
					     currentElement.disabled ||
					     currentElement.getAttribute( 'aria-hidden' ) === 'true' ) {
						return false;
					}
					currentElement = currentElement.parentElement;
				}
				return true;
			} );

		return elements;
	},

	// Collapsed panels are hidden with max-height: 0 for the animation, not
	// display: none, so everything inside a closed category - service toggles,
	// their checkboxes, the description - would otherwise still take focus.
	isInCollapsedAccordion: function ( el ) {
		let content = el.closest( '.wpconsent-preferences-accordion-content' );

		while ( content ) {
			const item = content.closest( '.wpconsent-preferences-accordion-item' );

			if ( ! item ) {
				return false;
			}

			if ( ! item.classList.contains( 'active' ) ) {
				return true;
			}

			// Services live inside a category panel, so keep walking outwards.
			content = item.parentElement ? item.parentElement.closest( '.wpconsent-preferences-accordion-content' ) : null;
		}

		return false;
	},

	// Mirror the collapsed state onto the inert attribute so browsers and screen
	// readers skip closed panels natively, the same way our focus trap does.
	syncAccordionInertState: function () {
		const items = this.shadowRoot?.querySelectorAll( '.wpconsent-preferences-accordion-item' );

		if ( ! items ) {
			return;
		}

		items.forEach( ( item ) => {
			const content = item.querySelector( ':scope > .wpconsent-preferences-accordion-content' );

			if ( ! content ) {
				return;
			}

			if ( item.classList.contains( 'active' ) ) {
				content.removeAttribute( 'inert' );
			} else {
				content.setAttribute( 'inert', '' );
			}
		} );
	},

	// Check if an element is contained within a container
	isElementInContainer: function ( element, container ) {
		if ( !element || !container ) {
			return false;
		}

		// Check if the element is within the shadow DOM container
		if ( container.shadowRoot ) {
			return container.shadowRoot.contains( element );
		}

		return container.contains( element );
	},

	// Clear all cookies.
	clearCookies: function () {
		// Delete all cookies.
		var cookies = document.cookie.split( '; ' );
		for ( var c = 0; c < cookies.length; c ++ ) {
			var d = window.location.hostname.split( '.' );
			while ( d.length > 0 ) {
				var cookieBase = encodeURIComponent( cookies[c].split( ';' )[0].split( '=' )[0] ) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join( '.' ) + ' ;path=';
				var p = location.pathname.split( '/' );
				document.cookie = cookieBase + '/';
				while ( p.length > 0 ) {
					document.cookie = cookieBase + p.join( '/' );
					p.pop();
				}
				;
				d.shift();
			}
		}
	},

	// Initialize WordPress consent.
	initWordPress: function () {
		window.wp_consent_type = wpconsent.consent_type;

		let event = new CustomEvent( 'wp_consent_type_defined' );
		document.dispatchEvent( event );
	},

	// Show the floating button if enabled in settings.
	showFloatingButtonIfEnabled: function () {
		if ( !wpconsent.enable_consent_floating ) {
			return;
		}
		// The floating button is part of the shadow root, so it needs the
		// stylesheet. Load it before revealing to avoid an unstyled flash.
		this.ensureCSS().then( () => {
			const floatingButton = this.shadowRoot?.querySelector( '#wpconsent-consent-floating' );
			if ( floatingButton ) {
				floatingButton.style.display = 'block';
			}
		} );
	},

	// Show or hide buttons based on settings
	updateButtonVisibility: function( settings ) {
		if ( !this.shadowRoot ) {
			return;
		}

		const buttonTypes = ['accept', 'cancel', 'preferences'];

		buttonTypes.forEach( buttonType => {
			const button = this.shadowRoot.querySelector( `#wpconsent-${buttonType}-all` );
			if ( button ) {
				const isEnabled = settings[`${buttonType}_button_enabled`];
				if ( isEnabled ) {
					button.classList.remove( 'wpconsent-button-disabled' );
					button.removeAttribute( 'data-disabled' );
				} else {
					button.classList.add( 'wpconsent-button-disabled' );
					button.setAttribute( 'data-disabled', 'true' );
				}
			}
		});
	},

	// Update using wp_set_consent if it exists.
	updateWordPressConsent: function ( preferences ) {
		// Check if WP Consent API is available.
		if ( typeof wp_set_consent === 'function' ) {
			// Map our preference categories to WP Consent API categories.

			// Essential/functional cookies are always allowed.
			wp_set_consent( 'functional', 'allow' );

			// Preferences category - map to essential as we don't have a separate category for this
			// These are typically cookies that store user interface preferences.
			wp_set_consent( 'preferences', 'allow' );

			// Statistics categories.
			wp_set_consent( 'statistics', preferences.statistics ? 'allow' : 'deny' );
			// For anonymous statistics, we'll use the same preference as regular statistics.
			wp_set_consent( 'statistics-anonymous', preferences.statistics ? 'allow' : 'deny' );

			// Marketing category.
			wp_set_consent( 'marketing', preferences.marketing ? 'allow' : 'deny' );
		}

		// Record per-service consent when manual service toggles are enabled.
		// Only write services explicitly present in preferences so a partial save never fabricates a deny for an absent (e.g. essential/always-active) service.
		if ( wpconsent.manual_toggle_services && Array.isArray( wpconsent.wpca_services ) && typeof wp_set_service_consent === 'function' ) {
			wpconsent.wpca_services.forEach( service => {
				if ( Object.prototype.hasOwnProperty.call( preferences, service.slug ) ) {
					wp_set_service_consent( service.slug, preferences[ service.slug ] === true );
				}
			} );
		}
	}
};

// Initialize when DOM is ready.
document.addEventListener( 'DOMContentLoaded', () => WPConsent.init() );
