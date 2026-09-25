/**
 * Inspector Storage Module.
 *
 * Manages sessionStorage accumulation of detected cookies
 * with page attribution and de-duplication. Uses an in-memory
 * cache to avoid repeated JSON parsing from sessionStorage.
 */

const STORAGE_KEY = 'wpconsent_inspector';

/**
 * In-memory cache of the storage data.
 *
 * @type {Object|null}
 */
let cache = null;

/**
 * Load stored inspector data, using in-memory cache when available.
 *
 * @return {Object} Map of cookie name to cookie data.
 */
export function load() {
	if ( null !== cache ) {
		return cache;
	}

	try {
		const data = sessionStorage.getItem( STORAGE_KEY );
		cache = data ? JSON.parse( data ) : {};
	} catch ( e ) {
		cache = {};
	}

	return cache;
}

/**
 * Persist the in-memory cache to sessionStorage.
 *
 * @param {Object} data - Map of cookie name to cookie data.
 */
export function save( data ) {
	cache = data;
	try {
		sessionStorage.setItem( STORAGE_KEY, JSON.stringify( data ) );
	} catch ( e ) {
		// SessionStorage full or unavailable.
	}
}

/**
 * Add or merge a detected cookie into storage.
 *
 * @param {Object} cookieData - Cookie data from collector.
 * @param {string} cookieData.name - Cookie name.
 * @param {string} cookieData.value - Cookie value.
 * @param {string} cookieData.page - Page URL where detected.
 * @param {number} cookieData.timestamp - Detection timestamp.
 * @param {boolean} cookieData.preExisting - Whether cookie existed before interception.
 * @param {string} cookieData.stack - Stack trace string (empty for pre-existing).
 * @return {Object} Updated full storage data.
 */
export function addCookie( cookieData ) {
	const data = load();
	const key = cookieData.name;

	if ( data[ key ] ) {
		if ( ! data[ key ].pages.includes( cookieData.page ) ) {
			data[ key ].pages.push( cookieData.page );
		}

		if ( cookieData.stack && ! cookieData.preExisting ) {
			data[ key ].traces[ cookieData.page ] = {
				stack: cookieData.stack,
			};
		}

		data[ key ].lastSeen = cookieData.timestamp;
		data[ key ].value = cookieData.value;

		// Update duration if the existing entry has none (e.g. pre-existing cookie re-set by JS).
		if ( ! data[ key ].duration && cookieData.duration ) {
			data[ key ].duration = cookieData.duration;
		}
	} else {
		const traces = {};
		if ( cookieData.stack && ! cookieData.preExisting ) {
			traces[ cookieData.page ] = {
				stack: cookieData.stack,
			};
		}

		data[ key ] = {
			name: cookieData.name,
			value: cookieData.value,
			pages: [ cookieData.page ],
			traces,
			firstSeen: cookieData.timestamp,
			lastSeen: cookieData.timestamp,
			preExisting: cookieData.preExisting || false,
			consentState: cookieData.consentState || 'pre-consent',
			duration: cookieData.duration || null,
		};
	}

	save( data );
	return data;
}

/**
 * Update trace info for a specific cookie and page.
 *
 * @param {string} cookieName - Cookie name.
 * @param {string} page - Page URL.
 * @param {Object} traceInfo - Parsed trace info (scriptUrl, suggestedPattern).
 */
export function updateTrace( cookieName, page, traceInfo ) {
	const data = load();

	if ( ! data[ cookieName ] ) {
		return;
	}

	if ( ! data[ cookieName ].traces[ page ] ) {
		data[ cookieName ].traces[ page ] = {};
	}

	Object.assign( data[ cookieName ].traces[ page ], traceInfo );
	save( data );
}

/**
 * Get all stored cookie data.
 *
 * @return {Object} Map of cookie name to cookie data.
 */
export function getAll() {
	return load();
}

/**
 * Clear all inspector data from sessionStorage.
 */
export function clear() {
	cache = null;
	sessionStorage.removeItem( STORAGE_KEY );
}
