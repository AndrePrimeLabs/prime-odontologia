const WPConsentAdminNotices = window.WPConsentAdminNotices || (
	function ( document, window, $ ) {
		const app = {
			l10n: wpconsent,
			init: function () {
				window.WPConsentAdminNotices = app;
				app.notice_holder = $( document.getElementById( 'wpconsent-notice-area' ) );
				app.document = $( document );

				app.addEvents();
			},
			add_notice( text, type = 'updated' ) {
				const notice = app.get_notice( text, type );
				app.notice_holder.append( notice );
				app.document.trigger( 'wp-updates-notice-added' );
				notice.find( 'button' ).focus();
			},
			get_notice( text, type ) {
				const notice = $( '<div />' );
				const textel = $( '<p />' );
				textel.html( text );
				notice.addClass( 'fade notice is-dismissible' );
				notice.addClass( type );
				notice.append( textel );

				return notice;
			},
			addEvents() {
				$( document ).on(
					'click',
					'.wpconsent-pro-notice',
					function ( e ) {
						e.preventDefault();

						app.show_pro_notice( $( this ).data( 'pro_title' ), $( this ).data( 'pro_description' ), $( this ).data( 'pro_link' ) );
					}
				);
			},
			show_pro_notice( title, text, url, button_text ) {
				const lockIcon = app.l10n.lock_icon;
				$.confirm(
					{
						title: lockIcon + title,
						content: text,
						boxWidth: '560px',
						theme: 'modern upsell-box',
						onOpenBefore() {
							this.$btnc.after( '<div class="wpconsent_check"></div>' );
							if ( app.l10n.purchased_text ) {
								this.$btnc.after( '<div class="wpconsent-already-purchased"><a href=" ' + app.l10n.purchased_link + ' ">' + app.l10n.purchased_text + '</a></div>' );
							}
							if ( app.l10n.discount_note ) {
								this.$btnc.after( '<div class="wpconsent-discount-note">' + app.l10n.discount_note + '</div>' );
								this.$body.find( '.jconfirm-content' ).addClass( 'wpconsent-lite-upgrade' );
							}
						},
						buttons: {
							confirm: {
								text: button_text ? button_text : app.l10n.upgrade_button,
								btnClass: 'wpconsent-btn-orange',
								action: function () {
									window.open( url, '_blank', 'noopener noreferrer' );
								}
							}
						},

						closeIcon: true,
						backgroundDismiss: true,
						useBootstrap: false
					}
				);
			}
		};
		return app;
	}( document, window, jQuery )
);

WPConsentAdminNotices.init();
