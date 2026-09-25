/* global ajaxurl, wpconsent */
const WPConsentAdminNotifications = window.WPConsentAdminNotifications || (
	function ( document, window, $ ) {
		const app = {
			init() {
				if ( ! app.should_init() ) {
					return;
				}
				app.find_elements();
				app.init_open();
				app.init_close();
				app.init_dismiss();
				app.init_view_switch();

				app.update_count( app.active_count );
			},
			should_init() {
				app.$drawer = $( '#wpconsent-notifications-drawer' );
				return app.$drawer.length > 0;
			},
			find_elements() {
				app.$open_button      = $( '#wpconsent-notifications-button' );
				app.$count            = app.$drawer.find( '#wpconsent-notifications-count' );
				app.$dismissed_count  = app.$drawer.find( '#wpconsent-notifications-dismissed-count' );
				app.active_count      = app.$open_button.data( 'count' ) ? app.$open_button.data( 'count' ) : 0;
				app.dismissed_count   = app.$open_button.data( 'dismissed' );
				app.$body             = $( 'body' );
				app.$dismissed_button = $( '#wpconsent-notifications-show-dismissed' );
				app.$active_button    = $( '#wpconsent-notifications-show-active' );
				app.$active_list      = $( '.wpconsent-notifications-list .wpconsent-notifications-active' );
				app.$dismissed_list   = $( '.wpconsent-notifications-list .wpconsent-notifications-dismissed' );
				app.$dismiss_all      = $( '#wpconsent-dismiss-all' );
			},
			update_count( count ) {
				app.$open_button.data( 'count', count ).attr( 'data-count', count );
				if ( 0 === count ) {
					app.$open_button.removeAttr( 'data-count' );
				}
				app.$count.text( count );
				app.dismissed_count += Math.abs( count - app.active_count );
				app.active_count     = count;

				app.$dismissed_count.text( app.dismissed_count );

				if ( 0 === app.active_count ) {
					app.$dismiss_all.hide();
				}
			},
			init_open() {
				app.$open_button.on(
					'click',
					function ( e ) {
						e.preventDefault();
						app.$body.addClass( 'wpconsent-notifications-open' );
					}
				);
			},
			init_close() {
				app.$body.on(
					'click',
					'.wpconsent-notifications-close, .wpconsent-notifications-overlay',
					function ( e ) {
						e.preventDefault();
						app.$body.removeClass( 'wpconsent-notifications-open' );
					}
				);
			},
			init_dismiss() {
				app.$drawer.on(
					'click',
					'.wpconsent-notification-dismiss',
					function ( e ) {
						e.preventDefault();
						const id = $( this ).data( 'id' );
						app.dismiss_notification( id );
						if ( 'all' === id ) {
							app.move_to_dismissed( app.$active_list.find( 'li' ) );
							app.update_count( 0 );
							return;
						}
						app.move_to_dismissed( $( this ).closest( 'li' ) );
						app.update_count( app.active_count - 1 );
					}
				);
			},
			move_to_dismissed( element ) {
				element.slideUp(
					function () {
						$( this ).prependTo( app.$dismissed_list ).show();
					}
				);
			},
			dismiss_notification( id ) {
				return $.post(
					ajaxurl,
					{
						action: 'wpconsent_notification_dismiss',
						nonce: wpconsent.nonce,
						id: id,
					}
				);
			},
			init_view_switch() {
				app.$dismissed_button.on(
					'click',
					function ( e ) {
						e.preventDefault();
						app.$drawer.addClass( 'show-dismissed' );
					}
				);
				app.$active_button.on(
					'click',
					function ( e ) {
						e.preventDefault();
						app.$drawer.removeClass( 'show-dismissed' );
					}
				);
			}
		};
		return app;
	}( document, window, jQuery )
);

WPConsentAdminNotifications.init();
