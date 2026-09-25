/* global wpconsent ajaxurl */
/**
 * Connect functionality.
 *
 * @since 2.0.9
 */

'use strict';

var WPConsentConnect = window.WPConsentConnect || (
	function ( document, window, $ ) {

		jconfirm.defaults = {
			closeIcon: false,
			backgroundDismiss: false,
			escapeKey: true,
			animationBounce: 1,
			useBootstrap: false,
			theme: 'modern',
			boxWidth: '560px',
			type: 'blue',
			animateFromElement: false,
			scrollToPreviousElement: false,
		};

		/**
		 * Elements reference.
		 *
		 * @since 2.0.9
		 *
		 * @type {object}
		 */
		var el = {
			$connectBtn: $( '#wpconsent-settings-connect-btn' ), $connectKey: $( '#wpconsent-settings-upgrade-license-key' ),
		};

		var exclamationSign = "<div class='excl-mark'>!</div>";

		/**
		 * Public functions and properties.
		 *
		 * @since 2.0.9
		 *
		 * @type {object}
		 */
		var app = {

			/**
			 * Start the engine.
			 *
			 * @since 2.0.9
			 */
			init: function () {
				console.log( 'WPConsentConnect: init' );

				$( app.ready );
			},

			/**
			 * Document ready.
			 *
			 * @since 2.0.9
			 */
			ready: function () {

				app.events();
			},

			/**
			 * Register JS events.
			 *
			 * @since 2.0.9
			 */
			events: function () {

				app.connectBtnClick();
			},

			/**
			 * Register connect button event.
			 *
			 * @since 2.0.9
			 */
			connectBtnClick: function () {
				el.$connectBtn.on(
					'click',
					function () {
						app.gotoUpgradeUrl();
					}
				);
			},

			/**
			 * Get the alert arguments in case of Pro already installed.
			 *
			 * @since 2.0.9
			 *
			 * @param {object} res Ajax query result object.
			 *
			 * @returns {object} Alert arguments.
			 */
			proAlreadyInstalled: function ( res ) {
				const svgIcon = app.l18n.icons.checkmark;
				$.confirm(
					{
						title: svgIcon + wpconsent.almost_done,
						content: res.data.message,
						type: 'blue',
						buttons: {
							confirm: {
								text: wpconsent.plugin_activate_btn,
								btnClass: 'wpconsent-btn-confirm',
								action: function () {
									window.location.reload();
								}
							}
						}
					}
				);
			},

			/**
			 * Go to upgrade url.
			 *
			 * @since 2.0.9
			 */
			gotoUpgradeUrl: function () {

				var data = {
					action: 'wpconsent_connect_url', key: el.$connectKey.val(), _wpnonce: wpconsent.nonce,
				};

				$.post( ajaxurl, data ).done(
					function ( res ) {
						if ( res.success ) {
							if ( res.data.reload ) {
								app.proAlreadyInstalled( res );
								return;
							}
							window.location.href = res.data.url;
							return;
						}

						$.confirm(
							{
								title: exclamationSign + wpconsent.oops,
								closeIcon: false,
								content: res.data.message,
								type: 'blue',
								buttons: {
									ok: {
										text: wpconsent.ok,
										btnClass: 'wpconsent-btn-confirm',
										action: function () {
										}
									}
								}
							}
						);
					}
				).fail(
					function ( xhr ) {
						app.failAlert( xhr );
					}
				);
			},

			/**
			 * Alert in case of server error.
			 *
			 * @since 2.0.9
			 *
			 * @param {object} xhr XHR object.
			 */
			failAlert: function ( xhr ) {

				$.confirm(
					{
						title: exclamationSign + wpconsent.oops,
						content: wpconsent.server_error + '<br>' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText,
						type: 'blue', // 'orange' is the warning equivalent in jQuery Confirm
						buttons: {
							ok: {
								text: wpconsent.ok,
								btnClass: 'wpconsent-btn-confirm',
								action: function () {
								}
							}
						}
					}
				);
			},
		};

		// Provide access to public functions/properties.
		return app;

	}( document, window, jQuery )
);

// Initialize.
WPConsentConnect.init();
