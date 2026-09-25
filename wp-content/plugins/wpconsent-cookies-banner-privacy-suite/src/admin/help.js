/* global wpconsent */
const WPConsentHelp = window.WPConsentHelp || (
	function ( document, window, $ ) {
		const app = {
			init: function () {
				if ( ! app.should_init() ) {
					return;
				}
				app.find_elements();
				app.init_show();
				app.init_close_button();
				app.init_search();
				app.init_accordion();
			},
			should_init() {
				app.$overlay = $( '#wpconsent-docs-overlay' );
				return app.$overlay.length > 0;
			},
			find_elements() {
				app.$close_button   = $( '#wpconsent-help-close' );
				app.$search         = $( '#wpconsent-help-search' );
				app.$no_result      = $( '#wpconsent-help-no-result' );
				app.$search_results = $( '#wpconsent-help-result ul' );
				app.$categories     = $( '#wpconsent-help-categories' );
			},
			init_close_button() {
				app.$close_button.on(
					'click',
					function ( e ) {
						e.preventDefault();
						app.$overlay.fadeOut( 200 );
					}
				);
			},
			init_show() {
				$( document ).on(
					'click',
					'.wpconsent-show-help',
					function ( e ) {
						e.preventDefault();
						app.$overlay.fadeIn( 200 );
					}
				);
			},
			init_accordion() {
				app.$categories.on(
					'click',
					'.wpconsent-help-category header',
					function () {
						const $cat = $( this ).closest( '.wpconsent-help-category' );
						app.toggle_category( $cat );
					}
				);
				app.$categories.on(
					'click',
					'.viewall',
					function ( e ) {
						e.preventDefault();
						$( this ).closest( '.wpconsent-help-docs' ).find( 'div' ).slideDown();
						$( this ).hide();
					}
				);
			},
			toggle_category( $cat ) {
				$cat.toggleClass( 'open' );
				$cat.find( '.wpconsent-help-docs' ).slideToggle();
			},
			init_search() {
				// Input into search field.
				app.$search.on( 'keyup', 'input', app.input_search );

				// Clear search field.
				app.$search.on( 'click', '#wpconsent-help-search-clear', app.clear_search );
			},
			input_search() {
				app.$search_results.html( '' );

				const $input = $( this ),
					term     = $input.val().toLowerCase();

				const $docs = $( '#wpconsent-help-categories .wpconsent-help-docs li' );

				const filtered_items = $docs.filter(
					function () {
						return $( this ).text().toLowerCase().indexOf( '' + term + '' ) > -1;
					}
				);

				if ( term.length > 2 ) {
					filtered_items.clone().appendTo( app.$search_results );
				}

				if ( filtered_items.length === 0 ) {
					app.$no_result.show();
				} else {
					app.$no_result.hide();
				}

				app.$search.toggleClass( 'wpconsent-search-empty', ! term );
			},
			clear_search() {
				app.$search.find( 'input' ).val( '' ).trigger( 'keyup' );
			},
		};
		return app;
	}( document, window, jQuery )
);

WPConsentHelp.init();
