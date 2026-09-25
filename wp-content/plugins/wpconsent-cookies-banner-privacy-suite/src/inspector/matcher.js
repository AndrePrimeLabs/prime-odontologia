/**
 * Cookie Matcher Module.
 *
 * Matches detected cookies against the list of documented cookies
 * from WPConsent settings. Supports exact match and prefix match
 * (cookie IDs ending with _ are treated as prefixes).
 */

/**
 * Find a documented cookie that matches the given cookie name.
 *
 * @param {string} cookieName - Detected cookie name.
 * @param {Array} documentedCookies - Array of documented cookie objects.
 * @return {Object|null} Matching documented cookie or null.
 */
export function findMatch( cookieName, documentedCookies ) {
	// Exact match first.
	for ( const doc of documentedCookies ) {
		if ( doc.cookie_id === cookieName ) {
			return doc;
		}
	}

	// Prefix match: documented cookies ending with _ are prefixes.
	for ( const doc of documentedCookies ) {
		if ( doc.cookie_id.endsWith( '_' ) && cookieName.startsWith( doc.cookie_id ) ) {
			return doc;
		}
	}

	return null;
}

/**
 * Check whether a cookie name matches any admin-context prefix.
 *
 * Entries act as both exact and prefix matches — `wordpress_test_cookie`
 * matches equality; `wp-settings-` matches any name starting with it.
 *
 * @param {string} cookieName - Detected cookie name.
 * @param {Array<string>} prefixes - Admin-context prefix list from config.
 * @return {boolean} True if the cookie is admin-context.
 */
export function isAdminContext( cookieName, prefixes ) {
	if ( ! Array.isArray( prefixes ) || 0 === prefixes.length ) {
		return false;
	}
	return prefixes.some( ( prefix ) => cookieName === prefix || cookieName.startsWith( prefix ) );
}

/**
 * Classify all detected cookies into consent-aware urgency groups.
 *
 * Precedence: documented wins (mode-specific routing); else admin-context
 * (always informational, never a violation); else unknown (undocumented).
 *
 * @param {Object} detectedCookies - Map of cookie name to cookie data from storage.
 * @param {Array}  documentedCookies - Array of documented cookie objects from localized data.
 * @param {string} inspectorMode - 'optin', 'optout', or 'discovery'.
 * @param {Array<string>} [adminContextPrefixes] - Cookie-name prefixes that only fire for signed-in users.
 * @return {{ needsAttention: Array, unknown: Array, adminContext: Array, ok: Array }} Classified cookies.
 */
export function classifyCookies( detectedCookies, documentedCookies, inspectorMode, adminContextPrefixes = [] ) {
	const results = {
		needsAttention: [],
		unknown: [],
		adminContext: [],
		ok: [],
	};

	for ( const cookieData of Object.values( detectedCookies ) ) {
		const match = findMatch( cookieData.name, documentedCookies );
		const isPreConsent = 'pre-consent' === cookieData.consentState;
		const enriched = match ? { ...cookieData, matchedTo: match } : cookieData;

		if ( ! match ) {
			// Documented always wins. Since it isn't documented, check admin-context next.
			if ( isAdminContext( cookieData.name, adminContextPrefixes ) ) {
				results.adminContext.push( enriched );
			} else {
				results.unknown.push( enriched );
			}
			continue;
		}

		const isEssential = 'essential' === match.slug;

		if ( isEssential ) {
			// Essential cookies are always fine.
			results.ok.push( enriched );
			continue;
		}

		if ( 'discovery' === inspectorMode ) {
			// Discovery mode: no violations, all documented non-essential are ok.
			results.ok.push( enriched );
		} else if ( 'optout' === inspectorMode ) {
			// Opt-out: pre-consent non-essential is expected (allowed by default).
			// Post-rejection non-essential is a violation (should have been blocked).
			if ( ! isPreConsent ) {
				results.needsAttention.push( enriched );
			} else {
				results.ok.push( enriched );
			}
		} else {
			// Opt-in (default): pre-consent non-essential is a violation.
			if ( isPreConsent ) {
				results.needsAttention.push( enriched );
			} else {
				results.ok.push( enriched );
			}
		}
	}

	return results;
}
