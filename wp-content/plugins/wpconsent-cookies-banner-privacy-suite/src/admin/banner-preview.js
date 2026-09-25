(
	function () {
		const root = document.getElementById( 'wpconsent-root' );
		const container = document.getElementById( 'wpconsent-container' );
		const template = document.getElementById( 'wpconsent-template' );

		// Check if we're in a preview context
		const isPreview = container.closest('.wpconsent-banner-preview-wrapper') !== null;

		// Get existing shadow root or create new one
		let shadowRoot = container.shadowRoot;
		if ( !shadowRoot ) {
			shadowRoot = container.attachShadow( {mode: 'open'} );
			// Clone the entire template content (including styles and HTML) into shadow DOM
			const content = template.content.cloneNode( true );
			shadowRoot.appendChild( content );

			// Clean up the template after cloning
			template.remove();

			// Load and inject the external CSS
			loadExternalCSS(container);

			// Add preview class if we're in preview context
			if (isPreview) {
				container.classList.add('wpconsent-preview-mode');
			}
		}

  /**
	 * Add a custom close button to the banner holder if the regular close button is disabled
	 * @param {Element} bannerHolder - The banner holder element
	 */
	function addCustomCloseButton(bannerHolder) {
		// Check if the close button is not present (disabled in settings) and add a custom close button if needed
		const closeButton = shadowRoot.querySelector('.wpconsent-banner-close');

		// Always remove any existing custom close button to avoid duplicates
		const existingCustomCloseButton = bannerHolder.querySelector('.wpconsent-preview-close-button');
		if (existingCustomCloseButton) {
			existingCustomCloseButton.remove();
		}

		// If the regular close button is not present, add a custom close button
		if (!closeButton) {
			const customCloseButton = document.createElement('button');
			customCloseButton.className = 'wpconsent-preview-close-button';
			customCloseButton.setAttribute('aria-label', 'Close preview');
			customCloseButton.innerHTML = '&times;'; // × symbol

			customCloseButton.addEventListener('click', function() {
				const previewButton = document.getElementById('wpconsent-show-banner-preview');
				if (previewButton) {
					previewButton.classList.remove('wpconsent-button-active');
				}
				bannerHolder.classList.remove('wpconsent-banner-preview-visible');
				localStorage.setItem('wpconsent-banner-preview-visible', 'false');
			});

			bannerHolder.appendChild(customCloseButton);
		}
	}

	// Expose the addCustomCloseButton function to the global scope
	window.addCustomCloseButton = addCustomCloseButton;

		/**
		 * Load and inject external CSS into shadow DOM
		 */
		async function loadExternalCSS(container) {
			try {
				// Add cache-busting version parameter
				const cssUrl = `${wpconsent.css_url}?ver=${wpconsent.css_version}`;
				const response = await fetch( cssUrl );
				const css = await response.text();

				// Create and inject the stylesheet
				const style = document.createElement( 'style' );
				style.textContent = css;
				shadowRoot.appendChild( style );
				container.style.display = 'block';
			} catch ( error ) {
				console.error( 'Failed to load WPConsent styles:', error );
			}
		}

		// Update banner position within shadow DOM
		function updateBannerPosition( position ) {
			const banner = shadowRoot.querySelector( '.wpconsent-banner' );
			if (!banner) {
				return;
			}

			// Remove all position classes
			banner.classList.remove(
				'wpconsent-banner-top',
				'wpconsent-banner-bottom',
				'wpconsent-banner-bottom-left',
				'wpconsent-banner-bottom-right',
				'wpconsent-banner-top-left',
				'wpconsent-banner-top-right'
			);

			// Add the new position class
			banner.classList.add( `wpconsent-banner-${position}` );
		}

	window.wpconsent_show_banner = function ( position ) {
		if ( shadowRoot ) {
			const bannerHolder = shadowRoot.querySelector( '#wpconsent-banner-holder' );
			if (bannerHolder) {
				bannerHolder.classList.add('wpconsent-banner-preview-visible');
				addCustomCloseButton(bannerHolder);
			}
			updateBannerPosition( position );
		}
	};

		// Listen for position changes from the admin
		window.addEventListener( 'message', function ( event ) {
			if ( event.data.type === 'wpconsent_update_position' ) {
				updateBannerPosition( event.data.position );
			}
		} );
	}
)();

jQuery(function($) {
	// Handle banner position changes
	$('#banner_position').on('change', function() {
		const position = $(this).val();
		const shadowRoot = document.getElementById('wpconsent-container').shadowRoot;
		if (!shadowRoot) return;

		const banner = shadowRoot.querySelector('.wpconsent-banner');
		if (banner) {
			// Remove all position classes
			banner.classList.remove('wpconsent-banner-top', 'wpconsent-banner-bottom', 'wpconsent-banner-bottom-left', 'wpconsent-banner-bottom-right', 'wpconsent-banner-top-left', 'wpconsent-banner-top-right');
			// Add the new position class
			banner.classList.add('wpconsent-banner-' + position);
		}
	});

	// Handle banner layout changes
	$('input[name="banner_layout"]').on('change', function() {
		const layout = $(this).val();
		const shadowRoot = document.getElementById('wpconsent-container').shadowRoot;
		if (!shadowRoot) return;

		const bannerHolder = shadowRoot.querySelector('#wpconsent-banner-holder');
		if (!bannerHolder) return;

		// Remove all layout classes
		bannerHolder.classList.remove('wpconsent-banner-long', 'wpconsent-banner-floating', 'wpconsent-banner-modal');

		// Remove all position-specific classes dynamically
		const longPositions = $('input[name="banner_long_position"]').map(function() {
			return 'wpconsent-banner-long-' + $(this).val();
		}).get();
		const floatingPositions = $('input[name="banner_floating_position"]').map(function() {
			return 'wpconsent-banner-floating-' + $(this).val();
		}).get();
		longPositions.concat(floatingPositions).forEach(className => {
			bannerHolder.classList.remove(className);
		});

		// Add the new layout class
		bannerHolder.classList.add('wpconsent-banner-' + layout);

		// Add default position class based on layout
		if (layout === 'long') {
			const defaultLongPosition = $('input[name="banner_long_position"]').first().val();
			bannerHolder.classList.add('wpconsent-banner-long-' + defaultLongPosition);
			$('input[name="banner_long_position"][value="' + defaultLongPosition + '"]').prop('checked', true);
		} else if (layout === 'floating') {
			const defaultFloatingPosition = $('input[name="banner_floating_position"]').first().val();
			bannerHolder.classList.add('wpconsent-banner-floating-' + defaultFloatingPosition);
			$('input[name="banner_floating_position"][value="' + defaultFloatingPosition + '"]').prop('checked', true);
		}
	});

	// Handle long position changes
	$('input[name="banner_long_position"]').on('change', function() {
		const position = $(this).val();
		const shadowRoot = document.getElementById('wpconsent-container').shadowRoot;
		if (!shadowRoot) return;

		const bannerHolder = shadowRoot.querySelector('#wpconsent-banner-holder');
		if (bannerHolder) {
			bannerHolder.classList.remove('wpconsent-banner-long-top', 'wpconsent-banner-long-bottom');
			bannerHolder.classList.add('wpconsent-banner-long-' + position);
		}
	});

	// Handle floating position changes
	$('input[name="banner_floating_position"]').on('change', function() {
		const position = $(this).val();
		const shadowRoot = document.getElementById('wpconsent-container').shadowRoot;
		if (!shadowRoot) return;

		const bannerHolder = shadowRoot.querySelector('#wpconsent-banner-holder');
		if (bannerHolder) {
			const classes = $('input[name="banner_floating_position"]').map(function() {
				return 'wpconsent-banner-floating-' + $(this).val();
			}).get();
			classes.forEach(className => {
				bannerHolder.classList.remove(className);
			});
			bannerHolder.classList.add('wpconsent-banner-floating-' + position);
		}
	});

	// Handle text updates
	$('[data-target-text]').on('input', function() {
		const target = $(this).data('target-text');
		const value = $(this).val();
		const shadowRoot = document.getElementById('wpconsent-container').shadowRoot;
		if (!shadowRoot) return;

		const targetElement = shadowRoot.querySelector(target);
		if (targetElement) {
			targetElement.textContent = value;
		}
	});

	// Handle button type changes
	$('#banner_button_type').on('change', function() {
		const buttonType = $(this).val();
		const shadowRoot = document.getElementById('wpconsent-container').shadowRoot;
		if (!shadowRoot) return;

		const inputs = ['banner_accept_bg', 'banner_cancel_bg', 'banner_preferences_bg'];
		inputs.forEach(function(input) {
			const targetProperty = buttonType === 'outlined' ? 'border-color' : 'background-color';
			$(`#${input}`).data('target-property', targetProperty);
			const target = $(`#${input}`).data('target');
			const targetElement = shadowRoot.querySelector(target);
			if (targetElement) {
				targetElement.style[targetProperty] = $(`#${input}`).val();
			}
		});
	});

	// Handle banner preview toggle
	$('#wpconsent-show-banner-preview').on('click', function() {
		const shadowRoot = document.getElementById('wpconsent-container').shadowRoot;
		if (!shadowRoot) return;

		const bannerHolder = shadowRoot.querySelector('#wpconsent-banner-holder');
		if (bannerHolder) {
			bannerHolder.classList.toggle('wpconsent-banner-preview-visible');
			$(this).toggleClass('wpconsent-button-active');
			localStorage.setItem('wpconsent-banner-preview-visible', bannerHolder.classList.contains('wpconsent-banner-preview-visible'));

			// Add custom close button if banner is visible
			if (bannerHolder.classList.contains('wpconsent-banner-preview-visible')) {
				addCustomCloseButton(bannerHolder);
			}
		}
	});

	// Restore visibility state
	const bannerPreviewVisible = localStorage.getItem('wpconsent-banner-preview-visible');
	if (bannerPreviewVisible === 'true') {
		$('#wpconsent-show-banner-preview').addClass('wpconsent-button-active');
		const shadowRoot = document.getElementById('wpconsent-container').shadowRoot;
		if (shadowRoot) {
			const bannerHolder = shadowRoot.querySelector('#wpconsent-banner-holder');
			if (bannerHolder) {
				bannerHolder.classList.add('wpconsent-banner-preview-visible');
				addCustomCloseButton(bannerHolder);
			}
		}
	}

	// Handle close button click
	const shadowRoot = document.getElementById('wpconsent-container').shadowRoot;
	if (shadowRoot) {
		const closeButton = shadowRoot.querySelector('.wpconsent-banner-close');
		if (closeButton) {
			closeButton.addEventListener('click', function() {
				$('#wpconsent-show-banner-preview').removeClass('wpconsent-button-active');
				const bannerHolder = shadowRoot.querySelector('#wpconsent-banner-holder');
				if (bannerHolder) {
					bannerHolder.classList.remove('wpconsent-banner-preview-visible');
				}
				localStorage.setItem('wpconsent-banner-preview-visible', 'false');
			});
		} else {
			// If the close button is not present (disabled in settings), add a custom close button to the banner holder
			const bannerHolder = shadowRoot.querySelector('#wpconsent-banner-holder');
			if (bannerHolder) {
				addCustomCloseButton(bannerHolder);
			}
		}
	}
});
