/**
 * List of items with filters and search in the sidebar.
 * Used for Library and Generators lists in the admin.
 *
 * @type {{}}
 */
const WPConsentItemsList = window.WPConsentItemsList || (
	function ( document, window, $ ) {
		const ItemList = function ( container ) {
			this.container = $( container );
			this.category = '*';
			this.search_term = '';
			this.categories_list = this.container.find( '.wpconsent-items-filters' );
			this.search_input = this.container.find( '.wpconsent-items-search-input' );
			this.items = this.container.find( '.wpconsent-list-item' );
			this.banner = null;

			this.init();
		};

		ItemList.prototype = {
			init: function () {
				if ( !this.should_init() ) {
					return;
				}
				this.init_category_switch();
				this.init_search();
				this.show_connect_banner();
				this.init_custom_event_handlers();
			},

			init_custom_event_handlers() {
				this.container.on( 'wpconsent_reset_items', () => { this.reset_items() } );

				this.container.on( 'wpconsent_select_item', ( event, item_id ) => {
					this.set_item( item_id );
				});

			},

			set_item( item_id ) {
				this.reset_items();
				// Find the item with data-id equal to item_id
				const item = this.items.filter( function () {
					return $( this ).data( 'id' ) === item_id;
				} );
				// Remove the active class from all items.
				this.items.removeClass( 'wpconsent-list-item-selected' );
				// Add the active class to the item
				item.addClass( 'wpconsent-list-item-selected' );
				// Select the category of the item.
				const categories = item.data( 'categories' );
				const category = categories.length > 0 ? categories[0] : '*';
				this.switch_to_category( category );
				// Find the button that corresponds to the category
				const button = this.categories_list.find( `button[data-category="${category}"]` );
				this.switch_category_button( button );

				// If there's a radio in the item, check it.
				const radio = item.find( 'input[type="radio"]' );
				if ( radio.length > 0 ) {
					radio.prop( 'checked', true );
				}
			},

			reset_items() {
				this.search_input.val( '' );
				this.search_term = '';
				const button = this.categories_list.find( 'button' ).first();
				this.switch_to_category( button.data( 'category' ) );
				this.switch_category_button( button );
			},

			should_init: function () {
				return this.categories_list.length > 0;
			},

			init_category_switch: function () {
				const self = this;
				this.categories_list.on( 'click', 'button', function () {
					const button = $( this );
					if ( button.hasClass( 'wpconsent-active' ) ) {
						return;
					}
					self.switch_to_category( button.data( 'category' ) );
					self.switch_category_button( button );
				} );
			},

			switch_category_button: function ( $button ) {
				this.categories_list.find( 'button' ).removeClass( 'wpconsent-active' );
				$button.addClass( 'wpconsent-active' );
			},

			switch_to_category: function ( category ) {
				this.category = category;
				this.filter_items();
			},

			filter_items: function () {
				let filtered;
				const self = this;

				const $category_items = this.items.filter( function () {
					if ( self.category === '*' ) {
						return true;
					}
					return $( this ).data( 'categories' ).indexOf( self.category ) > - 1;
				} );

				if ( self.search_term.length > 2 ) {
					const search = self.search_term.toLowerCase();
					filtered = this.items.filter( function () {
						return $( this ).text().toLowerCase().indexOf( search ) > - 1;
					} );
				} else {
					filtered = $category_items;
				}

				self.items.hide();
				filtered.show();
				this.update_banner_position();
			},

			init_search: function () {
				const self = this;
				this.search_input.on( 'keyup change search', function () {
					const val = $( this ).val();
					self.search_term = val.length < 3 ? '' : val;
					self.filter_items();
				} );
			},

			show_connect_banner: function () {
				const $connect_banner = $( '#tmpl-wpconsent-library-connect-banner' );

				if ( !$connect_banner.length ) {
					return;
				}

				const $snippets = this.container.find( '.wpconsent-items-list-category .wpconsent-list-item:visible' );

				if ( $snippets.length > 5 ) {
					$snippets.eq( 5 ).after( $connect_banner.html() );
				} else {
					$snippets.last().after( $connect_banner.html() );
				}

				this.banner = this.container.find( '#wpconsent-library-connect-banner' );
			},

			update_banner_position: function () {
				const $snippets = this.container.find( '.wpconsent-items-list-category .wpconsent-list-item:visible' );
				if ( this.banner && this.banner.length > 0 ) {
					if ( $snippets.length > 5 ) {
						this.banner.insertAfter( $snippets.eq( 5 ) );
					} else {
						this.banner.insertAfter( $snippets.last() );
					}
				}
			}
		};

		// Initialize all item lists on the page
		$( document ).ready( function () {
			$( '.wpconsent-items-metabox' ).each( function () {
				new ItemList( this );
			} );
		} );
	}( document, window, jQuery )
);
