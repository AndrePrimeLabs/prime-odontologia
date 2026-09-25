/* global ajaxurl, wpconsent */

window.WPConsentInstallPlugin = window.WPConsentInstallPlugin || (
	function ( document, window, $ ) {
		const app = {
			init: function () {
				if ( !app.should_init() ) {
					return;
				}
				app.init_install();
			},
			should_init() {
				app.$install_buttons = $( '.wpconsent-button-install-plugin' );
				return app.$install_buttons.length > 0;
			},
			init_install() {
				app.$install_buttons.on(
					'click',
					function ( e ) {
						e.preventDefault();
						const $button = $( this );
						app.install_plugin( $button );
					}
				);
			},
			install_plugin( $button ) {
				const slug = $button.data( 'slug' );
				if ( !slug ) {
					return;
				}
				const original_text = $button.text();
				$button.prop( 'disabled', true ).text( wpconsent.installing || 'Installing...' );
				$.post(
					ajaxurl,
					{
						action: 'wpconsent_install_plugin',
						slug: slug,
						// Buttons outside the recommended-plugins widget opt out of its
						// bookkeeping via data-source; the handler defaults the rest.
						source: $button.data( 'source' ),
						_wpnonce: wpconsent.nonce,
					},
					function ( response ) {
						if ( response.success ) {
							$button.text( wpconsent.activated || 'Activated!' );
							setTimeout(
								function () {
									// A button inside a form must not reload: the surrounding
									// settings may hold unsaved edits, and reloading discards
									// them silently. Retire whatever hosted the button instead
									// — the install is what stopped it being relevant, so it
									// will not render on the next load either. slideUp() on an
									// empty set is a no-op, so a bare in-form button simply
									// stays put rather than reloading.
									if ( $button.closest( 'form' ).length ) {
										$button.closest( '.wpconsent-notice, .wpconsent-alert' ).slideUp();
										return;
									}
									window.location.reload();
								},
								1500
							);
						} else {
							$button.prop( 'disabled', false ).text( original_text );
							if ( response.data && response.data.message ) {
								let exclamationSign = "<div class='excl-mark'>!</div>";
								$.confirm(
									{
										title: false,
										content: exclamationSign + response.data.message,
										type: 'blue',
										buttons: {
											confirm: {
												text: wpconsent.ok,
												btnClass: 'wpconsent-btn-confirm',
												action: function () {

												}
											}
										}
									}
								);
							}
						}
					}
				);
			},
		};
		return app;
	}( document, window, jQuery )
);

WPConsentInstallPlugin.init();
