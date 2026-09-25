/**
 * Dashboard-specific JavaScript.
 *
 * Handles alert bar dismiss and auto-showing the banner preview.
 */

( function() {
	'use strict';

	/**
	 * Alert bar dismiss.
	 */
	const alertBar = document.querySelector( '.wpconsent-alert-bar' );
	if ( alertBar ) {
		alertBar.addEventListener( 'click', function( e ) {
			const dismiss = e.target.closest( '.wpconsent-alert-bar-dismiss' );
			if ( ! dismiss ) {
				return;
			}

			const item = dismiss.closest( '.wpconsent-alert-bar-item' );
			if ( item ) {
				item.style.transition = 'opacity 0.2s ease';
				item.style.opacity = '0';
				setTimeout( function() {
					item.remove();

					if ( ! alertBar.querySelector( '.wpconsent-alert-bar-item' ) ) {
						alertBar.remove();
					}
				}, 200 );
			}
		} );
	}

	/**
	 * Compliance score earned items toggle.
	 */
	const toggleBtn = document.querySelector( '.wpconsent-score-toggle-btn' );
	if ( toggleBtn ) {
		const detailsContent = document.querySelector( '.wpconsent-score-details-content' );
		const showText = toggleBtn.dataset.showText || '';
		const hideText = toggleBtn.dataset.hideText || '';
		if ( detailsContent ) {
			toggleBtn.addEventListener( 'click', function() {
				const isHidden = detailsContent.style.display === 'none';
				detailsContent.style.display = isHidden ? '' : 'none';
				toggleBtn.classList.toggle( 'wpconsent-score-toggle-open', isHidden );
				toggleBtn.querySelector( '.wpconsent-score-toggle-text' ).textContent = isHidden ? hideText : showText;
			} );
		}
	}

	/**
	 * Inline AJAX toggle for settings.
	 */
	const scoreWidget = document.querySelector( '.wpconsent-compliance-score' );
	if ( scoreWidget ) {
		scoreWidget.addEventListener( 'click', function( e ) {
			const btn = e.target.closest( '.wpconsent-score-action-toggle' );
			if ( ! btn ) {
				return;
			}

			const setting = btn.dataset.setting;
			if ( ! setting ) {
				return;
			}

			const originalText = btn.textContent;
			btn.disabled = true;
			btn.textContent = wpconsent.please_wait || 'Please wait...';

			const formData = new FormData();
			formData.append( 'action', 'wpconsent_toggle_setting' );
			formData.append( 'nonce', wpconsent.nonce );
			formData.append( 'setting', setting );

			fetch( ajaxurl, { method: 'POST', body: formData } )
				.then( function( response ) { return response.json(); } )
				.then( function( data ) {
					if ( data.success ) {
						window.location.reload();
					} else {
						btn.disabled = false;
						btn.textContent = wpconsent.error || 'Error';
						setTimeout( function() {
							btn.textContent = originalText;
						}, 2000 );
					}
				} )
				.catch( function() {
					btn.disabled = false;
					btn.textContent = originalText;
				} );
		} );

		/**
		 * Generate cookie policy page.
		 */
		scoreWidget.addEventListener( 'click', function( e ) {
			const btn = e.target.closest( '.wpconsent-score-action-generate-policy' );
			if ( ! btn ) {
				return;
			}

			const originalBtnText = btn.textContent;
			btn.disabled = true;
			btn.textContent = wpconsent.please_wait || 'Please wait...';

			const formData = new FormData();
			formData.append( 'action', 'wpconsent_generate_cookie_policy' );
			formData.append( 'nonce', wpconsent.nonce );

			fetch( ajaxurl, { method: 'POST', body: formData } )
				.then( function( response ) { return response.json(); } )
				.then( function( data ) {
					if ( data.success ) {
						window.location.reload();
					} else {
						btn.disabled = false;
						btn.textContent = data.data && data.data.message ? data.data.message : ( wpconsent.error || 'Error' );
						setTimeout( function() {
							btn.textContent = originalBtnText;
						}, 3000 );
					}
				} )
				.catch( function() {
					btn.disabled = false;
					btn.textContent = originalBtnText;
				} );
		} );
	}

	/**
	 * Dismiss suggestion.
	 */
	const suggestionsSection = document.querySelector( '.wpconsent-suggestions' );
	if ( suggestionsSection ) {
		suggestionsSection.addEventListener( 'click', function( e ) {
			const dismissBtn = e.target.closest( '.wpconsent-suggestion-dismiss' );
			if ( ! dismissBtn ) {
				return;
			}

			const item = dismissBtn.closest( '.wpconsent-suggestion-item' );
			const key = dismissBtn.dataset.suggestion;
			if ( ! item || ! key ) {
				return;
			}

			const formData = new FormData();
			formData.append( 'action', 'wpconsent_dismiss_suggestion' );
			formData.append( 'nonce', wpconsent.nonce );
			formData.append( 'suggestion', key );

			fetch( ajaxurl, { method: 'POST', body: formData } )
				.then( function( response ) { return response.json(); } )
				.then( function( data ) {
					if ( data.success ) {
						// Remove the dismiss button from the item.
						dismissBtn.remove();

						// Add dismissed class for styling.
						item.classList.add( 'wpconsent-suggestion-item-dismissed' );

						// Move the item to the dismissed area inside the details toggle.
						const dismissedArea = document.querySelector( '.wpconsent-dismissed-suggestions-area' );
						if ( dismissedArea ) {
							const dismissedList = dismissedArea.querySelector( '.wpconsent-suggestion-list-dismissed' );
							if ( dismissedList ) {
								item.style.transition = 'opacity 0.3s ease';
								item.style.opacity = '0';
								setTimeout( function() {
									dismissedList.appendChild( item );
									item.style.opacity = '1';

									// Show the dismissed area if it was hidden.
									dismissedArea.style.display = '';

									// Hide the active suggestions section if empty.
									if ( ! suggestionsSection.querySelector( '.wpconsent-suggestion-item:not(.wpconsent-suggestion-item-dismissed)' ) ) {
										suggestionsSection.style.display = 'none';
									}
								}, 300 );
							}
						}
					}
				} );
		} );
	}

	/**
	 * Auto-show banner preview on dashboard.
	 */
	const previewWidget = document.querySelector( '.wpconsent-banner-preview-widget' );
	if ( ! previewWidget ) {
		return;
	}

	const container = document.getElementById( 'wpconsent-container' );
	if ( ! container ) {
		return;
	}

	// Wait for the shadow root to be attached by banner-preview.js.
	let previewRetries = 0;
	function showBannerPreview() {
		const shadowRoot = container.shadowRoot;
		if ( ! shadowRoot ) {
			if ( previewRetries < 50 ) {
				previewRetries++;
				setTimeout( showBannerPreview, 100 );
			}
			return;
		}

		const bannerHolder = shadowRoot.querySelector( '#wpconsent-banner-holder' );
		if ( bannerHolder ) {
			bannerHolder.classList.add( 'wpconsent-banner-preview-visible' );
		}
	}

	showBannerPreview();
} )();
