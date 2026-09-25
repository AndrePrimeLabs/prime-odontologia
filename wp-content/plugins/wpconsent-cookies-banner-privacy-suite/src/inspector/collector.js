/**
 * Cookie Collector Module.
 *
 * Captures pre-existing cookies on page load and intercepts new cookies
 * being set via document.cookie at runtime.
 */

/**
 * Convert a duration in seconds to a human-readable string.
 *
 * @param {number} seconds - Duration in seconds (positive integer).
 * @return {string} Human-readable duration.
 */
function secondsToHuman( seconds ) {
	const days   = seconds / 86400;
	const months = days / 30.44;
	const years  = days / 365.25;

	if ( years >= 1 ) {
		const y = Math.round( years );
		return 1 === y ? '1 year' : y + ' years';
	}
	if ( months >= 2 ) {
		return Math.round( months ) + ' months';
	}
	if ( days >= 14 ) {
		return Math.round( days / 7 ) + ' weeks';
	}
	if ( days >= 1 ) {
		const d = Math.round( days );
		return 1 === d ? '1 day' : d + ' days';
	}

	const hours = seconds / 3600;
	if ( hours >= 1 ) {
		const h = Math.round( hours );
		return 1 === h ? '1 hour' : h + ' hours';
	}

	const minutes = seconds / 60;
	if ( minutes >= 1 ) {
		const min = Math.round( minutes );
		return 1 === min ? '1 minute' : min + ' minutes';
	}
	return 'a few seconds';
}

/**
 * Parse the expiry directive from a full cookie setter string.
 * Checks max-age first (RFC 6265 precedence), then expires.
 * Returns null for cookie deletions (max-age <= 0 or expired date).
 *
 * @param {string} setterString - Full document.cookie assignment string.
 * @return {string|null} Human-readable duration, or null for deletions.
 */
function parseDuration( setterString ) {
	const maxAgeMatch = setterString.match( /;\s*max-age\s*=\s*(-?\d+)/i );
	if ( maxAgeMatch ) {
		const seconds = parseInt( maxAgeMatch[ 1 ], 10 );
		return seconds <= 0 ? null : secondsToHuman( seconds );
	}

	const expiresMatch = setterString.match( /;\s*expires\s*=\s*([^;]+)/i );
	if ( expiresMatch ) {
		const expiryDate = new Date( expiresMatch[ 1 ].trim() );
		if ( ! isNaN( expiryDate.getTime() ) ) {
			const seconds = Math.round( ( expiryDate.getTime() - Date.now() ) / 1000 );
			return seconds <= 0 ? null : secondsToHuman( seconds );
		}
	}

	return 'Session';
}

/**
 * Parse a raw cookie string into name and value.
 *
 * @param {string} cookieString - A single cookie string (e.g., "_ga=GA1.2.123").
 * @return {{ name: string, value: string }}
 */
function parseCookie( cookieString ) {
	const [ name, ...valueParts ] = cookieString.split( '=' );
	return {
		name: name.trim(),
		value: valueParts.join( '=' ).trim(),
	};
}

/**
 * Capture all cookies currently set in the browser.
 *
 * @return {Array<Object>} Array of cookie data objects.
 */
export function captureExistingCookies() {
	const raw = document.cookie;
	if ( ! raw ) {
		return [];
	}

	return raw.split( ';' )
		.map( ( cookieStr ) => {
			const { name, value } = parseCookie( cookieStr );
			if ( ! name ) {
				return null;
			}
			return {
				name,
				value,
				page: window.location.href,
				timestamp: Date.now(),
				preExisting: true,
				stack: '',
				duration: null,
			};
		} )
		.filter( Boolean );
}

/**
 * Process the early interceptor queue populated by the inline <head> script.
 * Each entry contains the full setter string, so we can extract duration.
 * Clears the queue when done so the early interceptor stops buffering.
 *
 * @param {Function} onCookieSet - Callback receiving cookie data object.
 */
export function processEarlyQueue( onCookieSet ) {
	const queue = window.__wpconsentEarlyCookies;
	if ( ! queue || ! Array.isArray( queue ) || typeof onCookieSet !== 'function' ) {
		return;
	}

	// Stop the early interceptor from queuing further writes.
	window.__wpconsentEarlyCookies = null;

	queue.forEach( ( entry ) => {
		const parsed = parseCookie( entry.value.split( ';' )[ 0 ] );
		if ( parsed.name ) {
			onCookieSet( {
				name: parsed.name,
				value: parsed.value,
				page: entry.page,
				timestamp: entry.timestamp,
				preExisting: false,
				stack: entry.stack,
				duration: parseDuration( entry.value ),
			} );
		}
	} );
}

/**
 * Install an interceptor on document.cookie setter.
 * Calls onCookieSet callback whenever a cookie is written via JS.
 *
 * @param {Function} onCookieSet - Callback receiving cookie data object.
 * @return {Function} Cleanup function to restore original setter.
 */
export function installInterceptor( onCookieSet ) {
	const descriptor = Object.getOwnPropertyDescriptor( Document.prototype, 'cookie' );

	if ( ! descriptor || ! descriptor.set ) {
		return () => {};
	}

	const originalGet = descriptor.get;
	const originalSet = descriptor.set;

	Object.defineProperty( document, 'cookie', {
		get() {
			return originalGet.call( document );
		},
		set( value ) {
			// The setter string includes directives (path, expires, etc.).
			const parsed = parseCookie( value.split( ';' )[ 0 ] );

			if ( parsed.name && typeof onCookieSet === 'function' ) {
				onCookieSet( {
					name: parsed.name,
					value: parsed.value,
					page: window.location.href,
					timestamp: Date.now(),
					preExisting: false,
					stack: new Error().stack || '',
					duration: parseDuration( value ),
				} );
			}

			return originalSet.call( document, value );
		},
		configurable: true,
	} );

	// Return cleanup function.
	return () => {
		Object.defineProperty( document, 'cookie', descriptor );
	};
}

/**
 * Default admin-context prefixes used as a fallback when the inspector
 * config isn't yet available at reset time. Kept in sync with the PHP
 * defaults in `WPConsent_Inspector::get_admin_context_cookie_prefixes()`.
 */
const DEFAULT_PRESERVED_PREFIXES = [
	'wordpress_logged_in_',
	'wordpress_sec_',
	'wordpress_test_cookie',
	'wp-settings-',
];

/**
 * Return the preserve list from config when present, otherwise the
 * hardcoded defaults. Reading at call-time keeps reset aligned with any
 * filter-extended list from PHP.
 *
 * @return {Array<string>} Prefix list.
 */
function getPreservedPrefixes() {
	const fromConfig = typeof window !== 'undefined'
		&& window.wpconsentInspector
		&& Array.isArray( window.wpconsentInspector.adminContextPrefixes )
			? window.wpconsentInspector.adminContextPrefixes
			: null;

	if ( fromConfig && fromConfig.length > 0 ) {
		return fromConfig;
	}
	return DEFAULT_PRESERVED_PREFIXES;
}

/**
 * Check if a cookie name matches any of the provided preserve prefixes.
 *
 * @param {string} name - Cookie name.
 * @param {Array<string>} prefixes - Preserve prefix list.
 * @return {boolean} True if the cookie should be kept.
 */
function shouldPreserve( name, prefixes ) {
	return prefixes.some( ( prefix ) => name === prefix || name.startsWith( prefix ) );
}

/**
 * Clear all cookies except those needed to keep the admin authenticated.
 * Deletes by setting expiry to the past for all known paths/domains.
 */
export function clearNonEssentialCookies() {
	const raw = document.cookie;
	if ( ! raw ) {
		return;
	}

	const preservePrefixes = getPreservedPrefixes();

	raw.split( ';' ).forEach( ( cookieStr ) => {
		const name = cookieStr.split( '=' )[ 0 ].trim();
		if ( ! name || shouldPreserve( name, preservePrefixes ) ) {
			return;
		}

		// Delete for current path and root path, with and without domain.
		const paths = [ '/', window.location.pathname ];
		const domains = [ '', window.location.hostname, '.' + window.location.hostname ];

		paths.forEach( ( path ) => {
			domains.forEach( ( domain ) => {
				let cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + path;
				if ( domain ) {
					cookie += '; domain=' + domain;
				}
				document.cookie = cookie;
			} );
		} );
	} );
}
