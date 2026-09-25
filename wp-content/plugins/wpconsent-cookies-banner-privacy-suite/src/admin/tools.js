/**
 * WPConsent Tools page functionality.
 */
( function ( document, window, $ ) {
	'use strict';

	const WPConsentTools = {
		/**
		 * Initialize the Tools functionality.
		 */
		init() {
			this.findElements();
			this.bindEvents();
		},

		/**
		 * Find and cache DOM elements.
		 */
		findElements() {
			this.$sslVerifyButton = $( '#wpconsent-ssl-verify' );
			this.$sslSettings = $( '#test-ssl-connections' );
		},

		/**
		 * Bind event listeners.
		 */
		bindEvents() {
			this.$sslVerifyButton.on( 'click', ( e ) => {
				e.preventDefault();
				this.verifySSL();
			} );
		},

		/**
		 * Verify SSL connections.
		 */
		verifySSL() {
			const $btn = this.$sslVerifyButton;
			const btnLabel = $btn.text();
			const btnWidth = $btn.outerWidth();
			const data = {
				action: 'wpconsent_verify_ssl',
				nonce: window.wpconsent.nonce,
			};

			// Disable button and show loading state.
			$btn.css( 'width', btnWidth ).prop( 'disabled', true ).text( window.wpconsent.testing || 'Testing...' );

			$.post( window.ajaxurl, data, ( res ) => {
				// Remove any previous alerts.
				this.$sslSettings.find( '.wpconsent-alert, .wpconsent-ssl-error' ).remove();

				if ( res.success ) {
					this.$sslSettings.before( '<div class="wpconsent-alert wpconsent-alert-success">' + res.data.msg + '</div>' );
				}

				if ( ! res.success && res.data.msg ) {
					this.$sslSettings.before( '<div class="wpconsent-alert wpconsent-alert-danger">' + res.data.msg + '</div>' );
				}

				if ( ! res.success && res.data.debug ) {
					this.$sslSettings.before( '<div class="wpconsent-ssl-error pre-error">' + res.data.debug + '</div>' );
				}

				// Restore button state.
				$btn.css( 'width', btnWidth ).prop( 'disabled', false ).text( btnLabel );
			} ).fail( () => {
				// Remove any previous alerts.
				this.$sslSettings.find( '.wpconsent-alert, .wpconsent-ssl-error' ).remove();

				// Show generic error.
				this.$sslSettings.before( '<div class="wpconsent-alert wpconsent-alert-danger">An unexpected error occurred. Please try again.</div>' );

				// Restore button state.
				$btn.css( 'width', btnWidth ).prop( 'disabled', false ).text( btnLabel );
			} );
		},
	};

	// Initialize on document ready.
	$( document ).ready( () => {
		WPConsentTools.init();
	} );
}( document, window, jQuery ) );
