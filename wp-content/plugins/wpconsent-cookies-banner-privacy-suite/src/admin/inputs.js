const WPConsentInputs = window.WPConsentInputs || (
	function ( document, window, $ ) {
		const app = {
			init() {
				$( app.ready );
			},
			ready() {
				app.initCheckbox();
				app.initShowHidden();
				app.itemToggle();
				app.initFileUploads();
			},
			initCheckbox() {
				$( document ).on(
					'change',
					'.wpconsent-styled-checkbox input',
					function () {

						var $this = $( this );

						if ( $this.prop( 'checked' ) ) {
							$this.parent().addClass( 'checked' );

						} else {
							$this.parent().removeClass( 'checked' );
						}
					}
				);
			},
			initShowHidden() {
				$( document ).on( 'click', '.wpconsent-show-hidden', function ( e ) {
					e.preventDefault();
					const target = $( this ).data( 'target' );
					const hide_label = $( this ).data( 'hide-label' );
					// Let's find the target element in the parent element.
					$( this ).closest('.wpconsent-show-hidden-container').find( target ).toggleClass( 'wpconsent-visible' );
					if ( hide_label ) {
						// Let's keep track of the original label and toggle between them based on the visible class being present on the target element.
						const original_label = $( this ).text();
						const new_label = $( this ).data( 'hide-label' );
						$( this ).data( 'hide-label', original_label );
						$( this ).text( $( this ).text() === original_label ? new_label : original_label );
					}
				} );
			},
			itemToggle() {
				$( document ).on( 'click', '.wpconsent-onboarding-selectable-item', function ( e ) {
					// Only toggle if the target is not in the .wpconsent-onboarding-service-info element.
					if ( $( e.target ).closest( '.wpconsent-onboarding-service-info' ).length ) {
						return;
					}
					const checkbox = $( this ).find( 'input[type="checkbox"]' );
					checkbox.prop( 'checked', !checkbox.prop( 'checked' ) ).trigger( 'change' );
				} );
			},
			initFileUploads() {
				$( '.wpconsent-file-upload' ).each(
					function () {
						const $input = $( this ).find( 'input[type=file]' ),
							$label   = $( this ).find( 'label' ),
							$placeholder = $label.find( '.placeholder' );

						$input.on(
							'change',
							function ( event ) {
								let fileName = '';
								if ( this.files && this.files.length > 1 ) {
									fileName = (
										this.getAttribute( 'data-multiple-caption' ) || ''
									).replace( '{count}', this.files.length );
								} else if ( event.target.value ) {
									fileName = event.target.value.split( '\\' ).pop();
								}

								if ( fileName ) {
									$placeholder.html( fileName );
								} else {
									$placeholder.html( 'No file chosen' );
								}
							}
						);

						// Firefox bug fix.
						$input.on(
							'focus',
							function () {
								$input.addClass( 'has-focus' );
							}
						).on(
							'blur',
							function () {
								$input.removeClass( 'has-focus' );
							}
						);
					}
				);
			},
		};
		return app;
	}( document, window, jQuery )
);

WPConsentInputs.init();
