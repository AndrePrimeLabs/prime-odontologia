jQuery( function( $) {
	const dynamic_hide = {
		init: function () {
			dynamic_hide.elements = $( '[data-show-if-id]' );
			dynamic_hide.add_listeners();
		},
		add_listeners: function () {
			dynamic_hide.elements.each(
				function () {
					const element = $( this );
					const input_id = element.data( 'show-if-id' );
					if ( '' === input_id ) {
						return;
					}
					let reverse = false;
					let values = String( element.data( 'show-if-value' ) ).split( ',' );
					// Let's check if we have the attribute hide-if-value and reverse the logic.
					if ( element.data( 'hide-if-value' ) ) {
						values = String( element.data( 'hide-if-value' ) ).split( ',' );
						reverse = true;
					}
					const input = $( input_id );
					$( '.wpconsent-admin-page #wpbody-content' ).on(
						'change',
						input_id,
						function () {
							dynamic_hide.maybe_hide( $( this ), element, values, reverse );
						}
					);
					dynamic_hide.maybe_hide( input, element, values, reverse );
				}
			);
		},
		maybe_hide: function ( input, element, values, reverse ) {
			let val = String( input.val() );
			if ( 'checkbox' === input.attr( 'type' ) ) {
				val = input.prop( 'checked' ) ? '1' : '0';
			}
			if ( 'radio' === input.attr( 'type' ) ) {
				// Find the input that is checked.
				const checked = input.closest( 'form' ).find( 'input[name="' + input.attr( 'name' ) + '"]:checked' );
				val = checked.val();
			}

			if ( reverse ) {
				if ( values.indexOf( val ) >= 0 ) {
					element.hide();
					return;
				}
				element.show();
			} else {
				if ( values.indexOf( val ) < 0 ) {
					element.hide();
				} else {
					element.show();
				}
			}
		}
	};

	dynamic_hide.init();
});