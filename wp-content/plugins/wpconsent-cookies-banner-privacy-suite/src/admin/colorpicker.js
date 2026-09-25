jQuery( function ( $ ) {
	// Initialize color picker on elements with class 'wpconsent-colorpicker'
	$( '.wpconsent-colorpicker' ).each( function () {
		// Wrap input in container and add preview element
		$( this ).wrap( '<div class="wpconsent-colorpicker-wrap"></div>' );
		$( this ).before( '<div class="wpconsent-color-preview"></div>' );

		// Set initial preview color
		const initialColor = $( this ).val() || '#ffffff';
		$( this ).siblings( '.wpconsent-color-preview' ).css( 'background-color', initialColor );

		$( this ).iris( {
			defaultColor: false,
			change: function ( event, ui ) {
				// Update input value and preview color when color changes
				$( this ).val( ui.color.toString() );
				$( this ).siblings( '.wpconsent-color-preview' ).css( 'background-color', ui.color.toString() );

				var target = $( this ).data( 'target' );
				var targetProperty = $( this ).data( 'target-property' ) || 'background-color';
				var targetElement = document.getElementById("wpconsent-container").shadowRoot.querySelector( target );
				$( targetElement ).css( targetProperty, ui.color.toString() );
			},
			hide: true,
			border: true,
			palettes: true
		} );
	} );

	// Close color picker when clicking outside
	$( document ).click( function ( e ) {
		if ( !$( e.target ).is( '.wpconsent-colorpicker, .iris-picker, .iris-picker *' ) ) {
			$( '.wpconsent-colorpicker' ).each( function () {
				$( this ).iris( 'hide' );
			} );
		}
	} );

	// Show color picker when clicking input
	$( '.wpconsent-colorpicker' ).click( function ( e ) {
		e.stopPropagation();
		$( '.wpconsent-colorpicker' ).iris( 'hide' );  // Hide all other pickers
		$( this ).iris( 'show' );  // Show this picker
	} );
} );
