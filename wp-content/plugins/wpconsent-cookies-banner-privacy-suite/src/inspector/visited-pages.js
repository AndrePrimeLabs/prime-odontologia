/**
 * Visited Pages Module.
 *
 * Shared helpers for reading the inspector's visited-pages list from sessionStorage.
 */

export const VISITED_PAGES_KEY = 'wpconsent_inspector_pages';

/**
 * Get the list of paths visited in this inspection session.
 *
 * @return {Array<string>} Array of pathname strings.
 */
export function getVisitedPaths() {
	try {
		const raw = sessionStorage.getItem( VISITED_PAGES_KEY );
		return raw ? JSON.parse( raw ) : [];
	} catch ( e ) {
		return [];
	}
}

/**
 * Get the number of pages visited in this inspection session.
 *
 * @return {number} Number of visited pages (minimum 1).
 */
export function getVisitedCount() {
	return getVisitedPaths().length || 1;
}
