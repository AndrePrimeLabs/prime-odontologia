jQuery( function ( $ ) {
	$( '#wpconsent-reset-banner-content' ).on( 'click', function ( e ) {
		e.preventDefault();

		$.confirm( {
			title: wpconsent.reset_warning_title || 'Warning: Reset To Defaults',
			content: `
				<div class="wpconsent-reset-warning">
					<p>${wpconsent.reset_warning_message || 'This action will reset all banner content and default categories/cookies to the default English state. This cannot be undone. We recommend exporting your current settings as a backup before proceeding.'}</p>
				</div>
			`,
			boxWidth: '600px',
			theme: 'modern',
			type: 'blue',
			buttons: {
				reset: {
					text: wpconsent.reset_button || 'Reset to Defaults',
					btnClass: 'btn-confirm',
					action: function () {
						var data = {
							action: 'wpconsent_reset_to_defaults',
							nonce: wpconsent.nonce
						};

						$.post( ajaxurl, data, function () {
							window.location.reload();
						} );
					}
				},
				cancel: {
					text: wpconsent.cancel_button || 'Cancel',
					btnClass: ''
				}
			}
		} );
	} );
} );
