window.WPConsentScanner = window.WPConsentScanner || (
	function ( document, window, $ ) {
		const app = {
			init: function () {
				if ( !app.should_init() ) {
					return;
				}
				app.find_elements();
				app.add_events();
			},
			should_init: function () {
				app.start_button = $( '#wpconsent-start-scanner' );
				return app.start_button.length > 0;
			},
			find_elements: function () {
				app.results = $( '#wpconsent-scanner-scripts' );
				app.service_template = $( '#wpconsent-scanner-service' ).html();
				app.message = $( '#wpconsent-scanner-message' );
				app.essential = $( '#wpconsent-scanner-essential' );
				app.form = $( '#wpconsent-scanner-form' );
				app.after_scan = $( '#wpconsent-after-scan' );
			},
			add_events: function () {
				app.start_button.on( 'click', app.start_scanner );
				app.form.on( 'submit', app.configure_cookies );
			},
			start_scanner: function ( e ) {
				e.preventDefault();
				app.start_button.prop( 'disabled', true );
				app.after_scan_action = app.start_button.data( 'action' );
				app.results.empty();

				// Check if we have manual scan pages selected
				const scannerItems = $( 'input[name="scanner_items[]"]' );
				const hasManualPages = scannerItems.length > 0;
				
				if ( hasManualPages ) {
					// Initialize scan state for multi-page scanning
					app.page_ids = ['0']; // Always start with homepage
					app.current_scan_index = 0;
					app.scan_results = {
						scripts: {},
						services_needed: [],
						total_pages: 0,
						scanned_pages: 0,
						request_id: ''
					};

					// Get all page IDs to scan
					scannerItems.each(function() {
						app.page_ids.push($(this).val());
					});

					app.scan_results.total_pages = app.page_ids.length;
					app.scan_results.request_id = Date.now().toString(); // Generate a unique request ID
					
					WPConsentConfirm.show_please_wait( wpconsent.scanning_title, true );
					app.scan_next_page();
				} else {
					// Use legacy single-page scanning
					WPConsentConfirm.show_please_wait( wpconsent.scanning_title );
					const email = $( '#scanner-email' ).val();
					const data = {
						action: 'wpconsent_scan_website',
						nonce: wpconsent.nonce
					};
					
					if ( email !== '' ) {
						data.email = email;
					}

					$.post(
						ajaxurl,
						data
					).always(
						function () {
							app.start_button.prop( 'disabled', false );
						}
					).done( app.handle_response );
				}
			},
			scan_next_page: function() {
				if ( app.current_scan_index >= app.page_ids.length ) {
					// All scans complete - perform final scan with is_final flag
					const last_page_id = app.page_ids[app.page_ids.length - 1];
					
					// Update progress to 100% for final scan
					WPConsentConfirm.update_progress(app.scan_results.scanned_pages, app.page_ids.length);
					
					// Perform final scan with is_final flag
					$.post(
						ajaxurl,
						{
							action: 'wpconsent_scan_page',
							nonce: wpconsent.nonce,
							page_id: last_page_id,
							request_id: app.scan_results.request_id,
							email: $( '#scanner-email' ).val(),
							is_final: true,
							total_pages: app.scan_results.total_pages,
							scanned_pages: app.scan_results.scanned_pages
						}
					).always(
						function () {
							app.start_button.prop( 'disabled', false );
						}
					).done( app.handle_response );
					return;
				}

				const current_page_id = app.page_ids[ app.current_scan_index ];
			
				// Perform scan for current page ID
				$.post(
					ajaxurl,
					{
						action: 'wpconsent_scan_page',
						nonce: wpconsent.nonce,
						page_id: current_page_id,
						request_id: app.scan_results.request_id,
						email: $( '#scanner-email' ).val()
					}
				).done( function( response ) {
					// Update progress with current and total pages
					WPConsentConfirm.update_progress(app.scan_results.scanned_pages, app.page_ids.length);
					if ( response.success ) {
						app.current_scan_index++;
						if ( !response.data.error ) {
							app.scan_results.scanned_pages++;
						}
						app.scan_next_page();
					} else {
						app.handle_scan_error( response.data.message || wpconsent.scan_error );
					}
				} ).fail( function( jqXHR, textStatus, errorThrown ) {
					app.handle_scan_error( wpconsent.scan_error );
				} );
			},
			handle_scan_error: function( message ) {
				WPConsentConfirm.close();
				app.start_button.prop( 'disabled', false );
				
				$.alert( {
					title: wpconsent.scan_error,
					content: message,
					type: 'red',
					icon: 'fa fa-exclamation-circle',
					animateFromElement: false,
					buttons: {
						confirm: {
							text: wpconsent.ok,
							btnClass: 'btn-confirm',
							keys: ['enter'],
						},
					}
				} );
			},
			handle_response: function ( response ) {
				WPConsentConfirm.close();
				if ( response.success ) {
					// Determine if this was an error response from the scanner
					const hasError = response.data.error && response.data.error === true;
					const isComplete = app.scan_results ? app.scan_results.scanned_pages === app.scan_results.total_pages : true; // Legacy scan is always complete
					const messageType = hasError || !isComplete ? 'red' : 'blue';
					const icon = hasError ? 'fa fa-exclamation-circle' : 'fa fa-check-circle';
					const title = hasError ? wpconsent.scan_error : wpconsent.scan_complete;

					// Add page count information to the message if it's a multi-page scan
					let message = response.data.message;

					$.confirm(
						{
							title: title,
							content: message,
							type: messageType,
							icon: icon,
							animateFromElement: false,
							buttons: {
								confirm: {
									text: wpconsent.ok,
									btnClass: 'btn-confirm',
									keys: ['enter'],
								},
							},
							onAction: function ( action ) {
								if ( action === 'confirm' ) {
									// Only proceed with after scan action if there was no error
									if ( !hasError ) {
										app.do_after_scan_action( response );
									}
								}
							}
						},
					);
				}
			},
			do_after_scan_action: function ( response ) {
				// Default action is reload so if the scan action is not set or empty we should reload.
				if ( app.after_scan_action === '' || 'reload' === app.after_scan_action ) {
					location.reload();
					return;
				}
				// Trigger a custom event we can hook into from another file and pass the response.
				$( document ).trigger( 'wpconsent_after_scan', response );
			},
			configure_cookies: function ( e ) {
				e.preventDefault();
				$.confirm( {
					title: wpconsent.configure_cookies_title,
					content: wpconsent.configure_cookies_content,
					type: 'blue',
					icon: 'fa fa-exclamation-circle',
					animateFromElement: false,
					buttons: {
						confirm: {
							text: wpconsent.yes,
							btnClass: 'btn-confirm',
							keys: ['enter'],
						},
						cancel: {
							text: wpconsent.no,
							btnClass: 'btn-cancel',
							keys: ['esc'],
						},
					},
					onAction: function ( action ) {
						if ( action === 'confirm' ) {
							const data = app.form.serialize();
							WPConsentConfirm.show_please_wait();
							$.post(
								ajaxurl,
								data
							).done(
								function ( response ) {
									WPConsentConfirm.close();
									if ( response.success ) {
										// Display success message and reload after ok.
										$.alert( {
											title: '',
											content: response.data.message,
											onAction: function () {
												WPConsentConfirm.show_please_wait();
												location.reload();
											}
										} );
									}
								}
							);
						}
					},
				} );
			}
		};
		return app;
	}( document, window, jQuery )
);

WPConsentScanner.init();