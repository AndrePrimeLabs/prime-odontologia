class WPConsentServiceManagement {
	constructor() {
		if ( document.getElementById( 'wpconsent-modal-add-service' ) ) {
			this.modal = new WPConsentModalForm( 'wpconsent-modal-add-service' );
			this.bindEvents();
		}
	}

	bindEvents() {
		// Add new cookie buttons (one per category)
		document.addEventListener( 'click', ( e ) => {
			const addButton = e.target.closest( '.wpconsent-add-service' );
			if ( addButton ) {
				this.handleAddService( e );
			}
		} );

		// Edit cookie buttons
		document.addEventListener( 'click', ( e ) => {
			const button = e.target.closest( '.wpconsent-edit-service' );
			if ( button ) {
				this.handleEditService( e );
			}
		} );

		// Delete cookie buttons
		document.addEventListener( 'click', ( e ) => {
			const deleteButton = e.target.closest( '.wpconsent-delete-service' );
			if ( deleteButton ) {
				this.handleDeleteService( e );
			}
		} );
	}

	handleAddService( e ) {
		const button = e.target.closest( '.wpconsent-add-service' );
		const categoryId = button.dataset.categoryId;

		this.modal.open( {
			title: 'Add New Service',
			beforeOpen: () => {
				// Set the selected category in the dropdown
				const categorySelect = document.querySelector( '#cookie_category' );
				if ( categorySelect ) {
					categorySelect.value = categoryId;
				}
			},
			data: {
				service_name: '',
				service_description: '',
				service_url: '',
				service_category: categoryId,
				action: 'wpconsent_manage_service'
			},
			successCallback: ( response ) => {
				if ( response.success ) {
					this.addServiceToList( response.data );
				}
				this.modal.close();
			}
		} );
	}

	handleEditService( e ) {
		const button = e.target.closest( '.wpconsent-edit-service' );
		const serviceItem = button.closest( '.wpconsent-service-item' );
		const serviceId = serviceItem.querySelector( '.wpconsent-service-id' ).value;
		const serviceUrl = serviceItem.querySelector( '.wpconsent-service-url' ).value;
		const serviceName = serviceItem.querySelector( '.service-name' ).textContent;
		const serviceDescription = serviceItem.querySelector( '.service-desc' ).textContent;
		const categoryId = button.closest( '.wpconsent-accordion-item' )
		                         .querySelector( '.wpconsent-add-cookie' ).dataset.categoryId;
		const postId = button.dataset.serviceId;

		this.modal.open( {
			title: 'Edit Service',
			beforeOpen: () => {
				// Set the selected category in the dropdown
				const categorySelect = document.querySelector( '#cookie_category' );
				if ( categorySelect ) {
					categorySelect.value = categoryId;
				}
			},
			data: {
				post_id: postId,
				service_name: serviceName,
				service_description: serviceDescription,
				service_url: serviceUrl,
				service_category: categoryId,
				action: 'wpconsent_manage_service'
			},
			successCallback: ( response ) => {
				if ( response.success ) {
					this.updateServiceInList( response.data );
				}
				this.modal.close();
			}
		} );
	}

	handleDeleteService( e ) {
		if ( !confirm( 'Are you sure you want to delete this service?' ) ) {
			return;
		}

		const button = e.target.closest( '.wpconsent-delete-service' );
		const cookieItem = button.closest( '.wpconsent-service-item' );
		const serviceId = button.dataset.serviceId;

		const data = new FormData();
		data.append( 'action', 'wpconsent_delete_service' );
		data.append( 'service_id', serviceId );
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
				} else {
					alert( 'Failed to delete service. Please try again.' );
				}
			} )
			.catch( error => {
				console.error( 'Error deleting service:', error );
				alert( 'Failed to delete service. Please try again.' );
			} );
	}

	addServiceToList( response ) {
		const categoryId = response.category_id;
		const cookiesList = document.querySelector(
			`.wpconsent-accordion-item [data-category-id="${categoryId}"]`
		).closest( '.wpconsent-accordion-item' )
		                            .querySelector( '.wpconsent-cookies-list' );

		const template = document.getElementById( 'wpconsent-new-service-row' ).innerHTML;
		const newRow = template
			.replace( /{{name}}/g, response.name )
			.replace( /{{description}}/g, response.description )
			.replace( /{{service_id}}/g, response.cookie_id )
			.replace( /{{service_url}}/g, response.service_url )
			.replace( /{{id}}/g, response.cookie_id );

		cookiesList.insertAdjacentHTML( 'beforeend', newRow );

		// Let's update the open accordion height to include the new cookie.
		const content = cookiesList.closest( '.wpconsent-accordion-content' );
		content.style.maxHeight = content.scrollHeight + 'px';
	}

	updateServiceInList( response ) {
		const serviceItem = document.querySelector(
			`.wpconsent-service-item .wpconsent-edit-service[data-service-id="${response.id}"]`
		).closest( '.wpconsent-service-item' );

		if ( serviceItem ) {
			serviceItem.querySelector( '.service-name' ).textContent = response.name;
			serviceItem.querySelector( '.service-desc' ).textContent = response.description;
		}
	}
}

// Initialize when DOM is ready
document.addEventListener( 'DOMContentLoaded', () => {
	const mgr = new WPConsentServiceManagement();

	// Listen for service added from library
	document.addEventListener('wpconsent:service-added', (e) => {
		mgr.addServiceToList(e.detail);

		// Add cookies if they exist
		if (e.detail.cookies && e.detail.cookies.length > 0) {
			// Create an instance of the cookie management class
			const cookieMgr = new WPConsentCookieManagement();

			// Add each cookie to the list
			e.detail.cookies.forEach(cookie => {
				// Add service_id to the cookie data so it can be properly associated with the service
				cookie.service_id = e.detail.id;
				cookieMgr.addCookieToList(cookie, e.detail.category_id);
			});
		}
	});
} );
