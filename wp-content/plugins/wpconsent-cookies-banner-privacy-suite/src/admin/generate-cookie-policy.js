jQuery( function ( $ ) {
	$( '#wpconsent-create-cookie-policy-page' ).on( 'click', function ( e ) {
		e.preventDefault();
		var $this = $( this );
		WPConsentSpinner.show_button_spinner( $this );

		var data = {
			action: 'wpconsent_generate_cookie_policy',
			nonce: wpconsent.nonce
		};

		$.post( ajaxurl, data ).always( function () {
			WPConsentSpinner.hide_button_spinner( $this );
		} ).success( function ( data ) {
			if ( data.success ) {
				try {
					wpconsent_choices['cookie-policy-page'].setValue( [
						{
							value: data.data.page_id,
							label: data.data.page_title,
							selected: true
						}
					] );
					// Let's trigger a change on the select to update the hidden input.
					$( '#cookie-policy-page' ).trigger( 'change' );
				} catch ( e ) {
					console.error( e );
				}
			}

			let buttons = {
				ok: {
					text: wpconsent.ok,
					btnClass: 'btn-blue',
				},
			};
			if ( data.data.link ) {
				buttons['view_page'] = {
					text: data.data.view_page,
					btnClass: 'btn-blue',
					action: function () {
						window.open( data.data.link, '_blank' );
					}
				};
			}

			$.confirm( {
				title: data.data.title,
				content: data.data.message,
				type: 'blue',
				buttons
			} );
		} );
	} );
} );
