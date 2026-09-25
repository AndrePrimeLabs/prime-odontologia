jQuery( function( $ ) {
	$('.wpconsent-input-text').on('keyup', function() {
		const target = $(this).data('target');
		if (target) {
			document.getElementById("wpconsent-container").shadowRoot.querySelector(target).innerText = $(this).val();
		}
	});
});
