// Make the class available globally
window.WPConsentCookieManagement = class WPConsentCookieManagement {
	constructor() {
		if ( document.getElementById( 'wpconsent-modal-add-cookie' ) ) {
			this.modal = new WPConsentModalForm( 'wpconsent-modal-add-cookie' );
			this.bindEvents();
		}
		this.initializeAccordions();
	}

	bindEvents() {
		// Add new cookie buttons (one per category)
		document.addEventListener( 'click', ( e ) => {
			const addButton = e.target.closest( '.wpconsent-add-cookie' );
			if ( addButton ) {
				this.handleAddCookie( e );
			}
		} );

		// Edit cookie buttons
		document.addEventListener( 'click', ( e ) => {
			const button = e.target.closest( '.wpconsent-edit-cookie' );
			if ( button ) {
				this.handleEditCookie( e );
			}
		} );

		// Delete cookie buttons
		document.addEventListener( 'click', ( e ) => {
			const deleteButton = e.target.closest( '.wpconsent-delete-cookie' );
			if ( deleteButton ) {
				this.handleDeleteCookie( e );
			}
		} );
	}

	handleAddCookie( e ) {
		const button = e.target.closest( '.wpconsent-add-cookie' );
		const categoryId = button.dataset.categoryId;
		this.updateServicesSelect( categoryId );

		this.modal.open( {
			title: 'Add New Cookie',
			data: {
				cookie_name: '',
				cookie_id: '',
				cookie_description: '',
				cookie_service_policy: '',
				cookie_service: '',
				category_duration: '',
				cookie_category: categoryId,
				action: 'wpconsent_manage_cookie'
			},
			successCallback: ( response ) => {
				if ( response.success ) {
					this.addCookieToList( response.data, categoryId );
				}
				this.modal.close();
			}
		} );
	}

	handleEditCookie( e ) {
		const button = e.target.closest( '.wpconsent-edit-cookie' );
		const cookieItem = button.closest( '.wpconsent-cookie-item' );
		const cookieId = cookieItem.querySelector( '.wpconsent-cookie-id' ).value;
		const cookieName = cookieItem.querySelector( '.cookie-name' ).textContent;
		const cookieDescription = cookieItem.querySelector( '.cookie-desc' ).textContent;
		const categoryId = button.closest( '.wpconsent-accordion-item' )
		                         .querySelector( '.wpconsent-add-cookie' ).dataset.categoryId;
		const postId = button.dataset.cookieId;
		const serviceElement = cookieItem.querySelector( '.wpconsent-cookie-service' );
		const duration = cookieItem.querySelector( '.cookie-duration' ).textContent;
		let serviceId = 0;
		if ( serviceElement ) {
			serviceId = serviceElement.value;
		}

		this.updateServicesSelect( categoryId ).then( () => {
			this.modal.open( {
				title: 'Edit Cookie',
				data: {
					cookie_id: cookieId,
					cookie_name: cookieName,
					cookie_description: cookieDescription,
					cookie_category: categoryId,
					cookie_service: serviceId,
					cookie_duration: duration,
					post_id: postId,
					action: 'wpconsent_manage_cookie'
				},
				successCallback: ( response ) => {
					if ( response.success ) {
						this.updateCookieInList( response.data );
					}
					this.modal.close();
				}
			} );
		} );
	}

	handleDeleteCookie( e ) {
		if ( !confirm( 'Are you sure you want to delete this cookie?' ) ) {
			return;
		}

		const button = e.target.closest( '.wpconsent-delete-cookie' );
		const cookieItem = button.closest( '.wpconsent-cookie-item' );
		const cookieId = button.dataset.cookieId;

		const data = new FormData();
		data.append( 'action', 'wpconsent_delete_cookie' );
		data.append( 'cookie_id', cookieId );
		data.append( 'nonce', window.wpconsent.nonce );

		fetch( ajaxurl, {
			method: 'POST',
			body: data,
			credentials: 'same-origin'
		} )
			.then( response => response.json() )
			.then( response => {
				if ( response.success ) {
					cookieItem.remove();
					this.maybe_hide_header();
				} else {
					alert( 'Failed to delete cookie. Please try again.' );
				}
			} )
			.catch( error => {
				console.error( 'Error deleting cookie:', error );
				alert( 'Failed to delete cookie. Please try again.' );
			} );
	}

	addCookieToList( response, categoryId ) {
		const cookiesList = document.querySelector(
			`.wpconsent-accordion-item [data-category-id="${categoryId}"]`
		).closest( '.wpconsent-accordion-item' )
		                            .querySelector( '.wpconsent-cookies-list' ).querySelector( '.wpconsent-cookie-header' );

		// Find the service element by looking for the hidden input with the service ID
		let serviceElement = null;
		if (response.service_id) {
			// Try to find the service by its ID stored in the hidden input
			const serviceItem = document.querySelector(`.wpconsent-service-item .wpconsent-service-id[value="${response.service_id}"]`);
			if (serviceItem) {
				serviceElement = serviceItem.closest('.wpconsent-service-item').querySelector('.wpconsent-cookies-list');
			}
		}

		const template = document.getElementById( 'wpconsent-new-cookie-row' ).innerHTML;
		const newRow = template
			.replace( /{{id}}/g, response.id )
			.replace( /{{name}}/g, response.name )
			.replace( /{{description}}/g, response.description )
			.replace( /{{duration}}/g, response.duration )
			.replace( /{{cookie_id}}/g, response.cookie_id );

		if ( serviceElement ) {
			serviceElement.insertAdjacentHTML( 'afterend', newRow );
		} else {
			cookiesList.insertAdjacentHTML( 'afterend', newRow );
		}

		this.maybe_hide_header();

		// Let's update the open accordion height to include the new cookie.
		const content = cookiesList.closest( '.wpconsent-accordion-content' );
		content.style.maxHeight = content.scrollHeight + 'px';
	}

	updateCookieInList( response ) {
		const cookieItem = document.querySelector(
			`.wpconsent-cookie-item .wpconsent-edit-cookie[data-cookie-id="${response.id}"]`
		).closest( '.wpconsent-cookie-item' );

		if ( cookieItem ) {
			cookieItem.querySelector( '.cookie-name' ).textContent = response.name;
			cookieItem.querySelector( '.cookie-desc' ).textContent = response.description;
			cookieItem.querySelector( '.cookie-duration' ).textContent = response.duration;

			// Update cookie id.
			cookieItem.querySelector( '.wpconsent-cookie-id' ).value = response.cookie_id;
		}
	}

	initializeAccordions() {
		document.querySelectorAll( '.wpconsent-accordion' ).forEach( ( accordion ) => {
			accordion.querySelectorAll( '.wpconsent-accordion-item' ).forEach( ( accordion, index ) => {
				const header = accordion.querySelector( '.wpconsent-accordion-header' );
				const content = accordion.querySelector( '.wpconsent-accordion-content' );
				const toggleButton = accordion.querySelector( '.wpconsent-accordion-toggle' );
				const tableHeader = content ? content.querySelector( '.wpconsent-cookie-header' ) : null;

				// Open the first accordion item by default
				if ( index === 0 ) {
					accordion.classList.add( 'active' );
					content.style.maxHeight = content.scrollHeight + 'px';
					const arrow = toggleButton.querySelector( '.dashicons' );
					arrow.classList.add( 'dashicons-arrow-up-alt2' );
					arrow.classList.remove( 'dashicons-arrow-down-alt2' );
					this.maybe_hide_header();
				}

				// Function to toggle the accordion
				const toggleAccordion = (e) => {
					// Don't toggle if clicking on buttons inside the header
					if ( e.target.closest( '.wpconsent-button' ) ) {
						return;
					}

					// Close all other accordion items
					document.querySelectorAll( '.wpconsent-accordion-item' ).forEach( ( item ) => {
						if ( item !== accordion ) {
							item.classList.remove( 'active' );
							item.querySelector( '.wpconsent-accordion-content' ).style.maxHeight = null;
							const otherArrow = item.querySelector( '.wpconsent-accordion-toggle .dashicons' );
							otherArrow.classList.add( 'dashicons-arrow-down-alt2' );
							otherArrow.classList.remove( 'dashicons-arrow-up-alt2' );
						}
					} );

					// Toggle active state
					accordion.classList.toggle( 'active' );

					// Toggle arrow icon
					const arrow = toggleButton.querySelector( '.dashicons' );
					arrow.classList.toggle( 'dashicons-arrow-down-alt2' );
					arrow.classList.toggle( 'dashicons-arrow-up-alt2' );

					// Toggle content visibility
					if ( accordion.classList.contains( 'active' ) ) {
						content.style.maxHeight = content.scrollHeight + 'px';
					} else {
						content.style.maxHeight = null;
					}
				};

				// Add click event to the accordion header
				header.addEventListener( 'click', toggleAccordion );

				// Add click event to the table header if it exists
				if ( tableHeader ) {
					tableHeader.addEventListener( 'click', (e) => {
						// If the accordion is not already active, toggle it
						if ( !accordion.classList.contains( 'active' ) ) {
							toggleAccordion(e);
						}
					});
				}
			} );
		} );
	}

	updateServicesSelect( categoryId = null ) {
		// Update #cookie_service with options from an ajax call to grab the list of services based on the selected category.
		const categorySelect = document.getElementById( 'cookie_category' );
		const serviceSelect = document.getElementById( 'cookie_service' );

		if ( !categorySelect || !serviceSelect ) {
			return;
		}

		if ( categoryId ) {
			categorySelect.value = categoryId;
		}

		const data = new FormData();
		data.append( 'action', 'wpconsent_get_services' );
		data.append( 'category_id', categorySelect.value );
		data.append( 'nonce', window.wpconsent.nonce );

		return fetch( ajaxurl, {
			method: 'POST',
			body: data,
			credentials: 'same-origin'
		} )
			.then( response => response.json() )
			.then( response => {
				if ( response.success ) {
					serviceSelect.innerHTML = response.data;
				}
			} )
			.catch( error => {
				console.error( 'Error updating services select:', error );
			} );
	}

	maybe_hide_header() {
		// Checks if any .wpconsent-cookies-list has no direct .wpconsent-cookie-item children and hides the .wpconsent-cookie-header if so.
		document.querySelectorAll( '.wpconsent-cookies-list' ).forEach( ( list ) => {
			// Check if there are any direct children that are .wpconsent-cookie-item, ignore .wpconsent-cookie-item elements that are not direct children.
			const hasItems = Array.from( list.children ).some( ( child ) => {
				return child.classList.contains( 'wpconsent-cookie-item' );
			} );
			const header = list.querySelector( '.wpconsent-cookie-header' );

			if ( !header ) {
				return;
			}
			// If it doesn't have items let's hide the .wpconsent-cookie-header that is the direct child of this cookies-list.
			if ( !hasItems ) {
				header.style.display = 'none';
			} else {
				header.style.display = 'grid';
			}
		} );
	}
}

// Initialize when DOM is ready
document.addEventListener( 'DOMContentLoaded', () => {
	new WPConsentCookieManagement();
} );
