window.WPConsentOnboarding = window.WPConsentOnboarding || (
	function ( document, window, $ ) {
		const app = {
			step: 1,
			maxSteps: wpconsent.max_steps,
			init: function () {
				if ( !app.shouldInit() ) {
					return;
				}
				app.findElements();
				app.removeAdminBar();
				app.stepButtons();
				app.handleRenderingScan();
				app.handleAutoConfigure();
				app.handleBannerLayout();
				app.handleCompleteOnboarding();
			},
			shouldInit: function () {
				return document.querySelector( '.wpconsent-admin-page.wpconsent-onboarding' );
			},
			findElements() {
				app.body = document.querySelector( 'body' );
				app.progressBar = document.querySelector( '.wpconsent-onboarding-progress-bar-inner' );
				app.itemTemplate = document.getElementById( 'wpconsent-onboarding-selectable-item' ).innerHTML;
				app.servicesForm = document.getElementById( 'wpconsent-onboarding-services' );
			},
			removeAdminBar: function () {
				// Remove the wp-toolbar class from the html element.
				document.documentElement.classList.remove( 'wp-toolbar' );
			},
			nextStep() {
				app.step ++;
				app.updateStep();
			},
			prevStep() {
				app.step --;
				app.updateStep();
			},
			updateStep() {
				// Remove all step classes from body.
				for ( let i = 1; i <= app.maxSteps; i ++ ) {
					app.body.classList.remove( 'wpconsent-onboarding-step-' + i );
				}
				// Run a custom event before the step is updated.
				const event = new CustomEvent( 'wpconsent_onboarding_step_change', {
					detail: {
						step: app.step,
					},
				} );
				window.dispatchEvent( event );
				// Add the current step class to body.
				app.body.classList.add( 'wpconsent-onboarding-step-' + app.step );
				app.updateProgressBar();
			},
			updateProgressBar() {
				// Update the progress bar width based on the current step relative to the total number of steps.
				const progress = (
					                 app.step / app.maxSteps
				                 ) * 100;
				app.progressBar.style.width = progress + '%';
			},
			stepButtons() {
				const nextButton = document.querySelectorAll( '.wpconsent-onboarding-next' );
				const prevButton = document.querySelectorAll( '.wpconsent-onboarding-prev' );

				nextButton.forEach( function ( button ) {
					button.addEventListener( 'click', app.nextStep );
				} );
				prevButton.forEach( function ( button ) {
					button.addEventListener( 'click', app.prevStep );
				} );
			},
			handleRenderingScan() {
				$( document ).on( 'wpconsent_after_scan', function ( e, response ) {
					// Save usage tracking preference when scan completes.
					app.saveUsageTrackingPreference();
					app.nextStep();
					const list = app.servicesForm.querySelector( '.wpconsent-onboarding-selectable-list' );
					// Let's empty the target list first.
					list.innerHTML = '';
					Object.values( response.data.scripts ).forEach( function ( category ) {
						category.forEach( function ( item ) {
							app.addItem( item, list );
						} );
					} );
				} );
			},
			addItem( item, target ) {
				const template = app.itemTemplate;
				let newItem = template.replaceAll( '{{name}}', item.name );
				newItem = newItem.replaceAll( '{{logo}}', item.logo );
				newItem = newItem.replaceAll( '{{description}}', item.description );
				newItem = newItem.replaceAll( '{{service}}', item.service );

				const temp = document.createElement( 'div' );
				temp.innerHTML = newItem;
				// Check the checkbox by default
				temp.firstElementChild.querySelector( 'input[type="checkbox"]' ).checked = true;
				target.appendChild( temp.firstElementChild );
			},
			handleAutoConfigure() {
				// On #wpconsent-onboarding-services submit we send the data to the server like in the scanner.
				$( document ).on( 'submit', '#wpconsent-onboarding-services', function ( e ) {
					e.preventDefault();
					const data = $( this ).serialize();
					WPConsentConfirm.show_please_wait( wpconsent.configuring_title );
					$.post( ajaxurl, data, function ( response ) {
						WPConsentConfirm.close();
						if ( response.success ) {
							app.nextStep();
						}
					} );
				} );
			},
			handleBannerLayout() {
				$( document ).on( 'submit', '#wpconsent-onboarding-banner-layout', function ( e ) {
					e.preventDefault();
					const data = $( this ).serialize();
					WPConsentConfirm.show_please_wait( wpconsent.banner_title );
					$.post( ajaxurl, data, function ( response ) {
						WPConsentConfirm.close();
						if ( response.success ) {
							// let's redirect to response.data.redirect
							window.location.href = response.data.redirect;
						}
					} );
				} );
			},
			handleCompleteOnboarding() {
				$( document ).on( 'click', '.wpconsent-complete-onboarding', function ( e ) {
					e.preventDefault();
					WPConsentConfirm.show_please_wait( wpconsent.completing_title );
					$.post( ajaxurl, {
						action: 'wpconsent_complete_onboarding',
						nonce: wpconsent.nonce
					}, function ( response ) {
						WPConsentConfirm.close();
						if ( response.success ) {
							window.location.href = response.data.redirect;
						}
					} );
				} );
			},
			saveUsageTrackingPreference() {
				const usageTrackingCheckbox = document.getElementById( 'wpconsent-usage-tracking' );
				if ( usageTrackingCheckbox ) {
					const isEnabled = usageTrackingCheckbox.checked ? 1 : 0;
					// Save the preference via AJAX.
					$.post( ajaxurl, {
						action: 'wpconsent_save_usage_tracking',
						nonce: wpconsent.nonce,
						usage_tracking: isEnabled
					} );
				}
			},
		};
		return app;
	}( document, window, jQuery )
);

WPConsentOnboarding.init();