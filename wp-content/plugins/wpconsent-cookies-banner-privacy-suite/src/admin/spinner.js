const WPConsentSpinner = window.WPConsentSpinner || (
	function ( document, window, $ ) {
		const app = {
			init() {
				window.WPConsentSpinner = app;
				app.spinner = $( '#wpconsent-admin-spinner' );
			},
			show_button_spinner( $button, position = 'right' ) {
				$button.prop( 'disabled', true );
				const offset = $button.offset();
				const menu_el = $( '#adminmenuwrap' );
				const admin_bar_el = $( '#wpadminbar' );
				const menu_width = menu_el.is( ':visible' ) ? menu_el.width() : 0;
				const admin_bar = admin_bar_el.is( ':visible' ) ? admin_bar_el.height() : 0;
				let css = {};
				app.spinner.show();
				if ( 'right' === position ) {
					css = {
						left: offset.left - menu_width + $button.outerWidth(),
						top: offset.top - admin_bar + $button.outerHeight() / 2 - app.spinner.height() / 2,
					};
				} else {
					css = {
						left: offset.left - menu_width - app.spinner.outerWidth() - 20,
						top: offset.top - admin_bar + $button.outerHeight() / 2 - app.spinner.height() / 2,
					};
				}

				app.spinner.css( css );
			},
			hide_button_spinner( $button ) {
				$button.prop( 'disabled', false );
				app.spinner.hide();
			},
		};
		return app;
	}( document, window, jQuery )
);

WPConsentSpinner.init();
