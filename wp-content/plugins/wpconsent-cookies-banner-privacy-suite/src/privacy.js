jQuery( document ).ready( function( $ ) {
	// Early returns for invalid states.
	if ( 'undefined' === typeof wpconsentPrivacy || $( '#cookie-policy-page-row' ).length ) {
		return;
	}

	// Find the privacy policy table and existing dropdown.
	var $privacyTable = $( '.tools-privacy-policy-page' );
	var $existingPageDropdown = $( '.tools-privacy-policy-page select[name="page_for_privacy_policy"]' );
	
	if ( ! $privacyTable.length || ! $existingPageDropdown.length ) {
		return; // No pages available or not on privacy page.
	}

	// Create cookie policy row with exact same structure as existing privacy policy row.
	var $cookiePolicyRow = $( '<tr id="cookie-policy-page-row">' )
		.append(
			$( '<th scope="row">' ).append(
				$( '<label for="page_for_cookie_policy">' ).text( wpconsentPrivacy.labels.cookiePolicyPage )
			),
			$( '<td>' ).append(
				$( '<form method="post">' ).append(
					$( '<input type="hidden" name="action" value="set-cookie-policy-page">' ),
					// Clone and modify the existing dropdown to match exactly.
					$existingPageDropdown.clone()
						.attr( {
							name: 'page_for_cookie_policy',
							id: 'page_for_cookie_policy'
						} )
						.val( wpconsentPrivacy.selectedPageId || '' ),
					$( '<input type="hidden" name="_wpnonce">' ).val( wpconsentPrivacy.nonce ),
					// Add space before the button to match WordPress spacing
					' ',
					// Create submit button with same classes as WordPress uses.
					$( '<input type="submit" name="submit" id="set-cookie-policy-page" class="button button-primary">' )
						.val( wpconsentPrivacy.labels.useThisPage )
				),
				$( '<p class="description">' ).html( wpconsentPrivacy.labels.description )
			)
		);

	// Insert the cookie policy row after the last row in the privacy table.
	$privacyTable.append( $cookiePolicyRow );
} ); 