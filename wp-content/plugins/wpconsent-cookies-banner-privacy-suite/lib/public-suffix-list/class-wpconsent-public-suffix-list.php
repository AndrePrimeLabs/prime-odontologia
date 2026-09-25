<?php
/**
 * Public Suffix List Parser
 *
 * Optimized implementation to extract the registrable domain from a hostname
 * using a curated list of common multi-level TLDs.
 *
 * Falls back gracefully to last 2 domain parts for unknown TLDs.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Public_Suffix_List
 */
class WPConsent_Public_Suffix_List {

	/**
	 * Cached PSL rules
	 *
	 * @var array
	 */
	private static $rules = null;

	/**
	 * Get the registrable domain (eTLD+1) from a hostname
	 *
	 * For example:
	 * - subdomain.example.com → example.com
	 * - www.example.co.uk → example.co.uk
	 * - example.com → example.com
	 *
	 * @param string $hostname The hostname to parse.
	 * @return string The registrable domain, or empty string on failure.
	 */
	public static function get_registrable_domain( $hostname ) {
		$hostname = strtolower( trim( $hostname ) );

		$hostname = preg_replace( '#^https?://#', '', $hostname );
		$hostname = preg_replace( '#/.*$#', '', $hostname );

		$hostname = preg_replace( '#:\d+$#', '', $hostname );

		if ( filter_var( $hostname, FILTER_VALIDATE_IP ) ) {
			return '';
		}

		if ( 'localhost' === $hostname || preg_match( '/\.local$/', $hostname ) ) {
			return '';
		}

		// Load PSL rules if not already loaded.
		if ( null === self::$rules ) {
			self::load_rules();
		}

		// Split hostname into parts.
		$parts = explode( '.', $hostname );

		// Need at least 2 parts (domain.tld).
		if ( count( $parts ) < 2 ) {
			return '';
		}

		// Find the longest matching rule.
		$matching_rule = self::find_matching_rule( $parts );

		if ( null === $matching_rule ) {
			// No matching rule, use the last 2 parts as default.
			return implode( '.', array_slice( $parts, -2 ) );
		}

		// Calculate the suffix length from the matched TLD.
		$rule_parts    = explode( '.', $matching_rule );
		$suffix_length = count( $rule_parts );

		// Check if hostname has enough parts to form a registrable domain.
		// If hostname IS the public suffix itself, return empty string.
		if ( count( $parts ) <= $suffix_length ) {
			return '';
		}

		// The registrable domain is suffix + 1 label.
		$registrable_parts = array_slice( $parts, -( $suffix_length + 1 ) );

		return implode( '.', $registrable_parts );
	}

	/**
	 * Find the matching PSL rule for the given domain parts
	 *
	 * @param array $parts Domain parts.
	 * @return string|null The matching TLD rule, or null if no match found.
	 */
	private static function find_matching_rule( $parts ) {
		$matching_rule = null;
		$max_length    = 0;

		// Try to find matching rules from longest to shortest.
		for ( $i = count( $parts ) - 1; $i >= 0; $i-- ) {
			$test_parts  = array_slice( $parts, $i );
			$test_domain = implode( '.', $test_parts );

			// Check for exact match.
			if ( isset( self::$rules[ $test_domain ] ) ) {
				if ( count( $test_parts ) > $max_length ) {
					$matching_rule = $test_domain;
					$max_length    = count( $test_parts );
				}
			}

			// Check for wildcard match.
			$wildcard_parts    = $test_parts;
			$wildcard_parts[0] = '*';
			$wildcard_domain   = implode( '.', $wildcard_parts );

			if ( isset( self::$rules[ $wildcard_domain ] ) ) {
				if ( count( $test_parts ) > $max_length ) {
					$matching_rule = $wildcard_domain;
					$max_length    = count( $test_parts );
				}
			}
		}

		return $matching_rule;
	}

	/**
	 * Get the curated list of common multi-level TLDs
	 *
	 * This list covers 95%+ of WordPress users worldwide.
	 * Optimized from 316KB to ~2-3KB by including only the most common multi-level TLDs.
	 *
	 * @return array Simple array of TLD strings.
	 */
	private static function get_common_tlds() {
		$tlds = array(
			// United Kingdom.
			'co.uk',
			'gov.uk',
			'ac.uk',
			'org.uk',
			'me.uk',
			'ltd.uk',
			'plc.uk',
			'net.uk',
			'sch.uk',
			'nhs.uk',

			// Australia.
			'com.au',
			'gov.au',
			'net.au',
			'org.au',
			'edu.au',
			'asn.au',
			'id.au',

			// New Zealand.
			'co.nz',
			'net.nz',
			'org.nz',
			'govt.nz',
			'ac.nz',
			'geek.nz',
			'school.nz',

			// South Africa.
			'co.za',
			'gov.za',
			'org.za',
			'net.za',
			'ac.za',
			'web.za',

			// India.
			'co.in',
			'net.in',
			'org.in',
			'gov.in',
			'ac.in',
			'ind.in',
			'firm.in',

			// Brazil.
			'com.br',
			'gov.br',
			'org.br',
			'net.br',
			'edu.br',
			'mil.br',

			// Japan.
			'co.jp',
			'ne.jp',
			'or.jp',
			'go.jp',
			'ac.jp',
			'ad.jp',
			'gr.jp',

			// China.
			'com.cn',
			'net.cn',
			'org.cn',
			'gov.cn',
			'edu.cn',
			'ac.cn',

			// Canada.
			'gc.ca',
			'gov.ab.ca',
			'gov.bc.ca',
			'gov.mb.ca',
			'gov.nb.ca',
			'gov.nl.ca',
			'gov.ns.ca',
			'gov.nt.ca',
			'gov.nu.ca',
			'gov.on.ca',
			'gov.pe.ca',
			'gov.qc.ca',
			'gov.sk.ca',
			'gov.yt.ca',

			// Germany.
			'co.de',

			// France.
			'gouv.fr',

			// Spain.
			'com.es',
			'org.es',
			'gob.es',
			'edu.es',

			// Italy.
			'gov.it',

			// Netherlands.
			'co.nl',

			// Belgium.
			'gov.be',

			// Mexico.
			'com.mx',
			'gob.mx',
			'org.mx',
			'net.mx',
			'edu.mx',

			// Argentina.
			'com.ar',
			'gov.ar',
			'org.ar',
			'net.ar',
			'edu.ar',

			// Russia.
			'gov.ru',

			// Israel.
			'co.il',
			'gov.il',
			'org.il',
			'net.il',
			'ac.il',

			// Singapore.
			'com.sg',
			'gov.sg',
			'org.sg',
			'net.sg',
			'edu.sg',

			// Hong Kong.
			'com.hk',
			'gov.hk',
			'org.hk',
			'net.hk',
			'edu.hk',

			// Taiwan.
			'com.tw',
			'gov.tw',
			'org.tw',
			'net.tw',
			'edu.tw',

			// Malaysia.
			'com.my',
			'gov.my',
			'org.my',
			'net.my',
			'edu.my',

			// Philippines.
			'com.ph',
			'gov.ph',
			'org.ph',
			'net.ph',
			'edu.ph',

			// Thailand.
			'co.th',
			'go.th',
			'or.th',
			'net.th',
			'ac.th',

			// Vietnam.
			'com.vn',
			'gov.vn',
			'org.vn',
			'net.vn',
			'edu.vn',

			// Indonesia.
			'co.id',
			'go.id',
			'or.id',
			'net.id',
			'ac.id',

			// Pakistan.
			'com.pk',
			'gov.pk',
			'org.pk',
			'net.pk',
			'edu.pk',

			// South Korea.
			'co.kr',
			'go.kr',
			'or.kr',
			'ne.kr',
			'ac.kr',

			// United Arab Emirates.
			'co.ae',
			'gov.ae',
			'org.ae',
			'net.ae',
			'ac.ae',

			// Saudi Arabia.
			'com.sa',
			'gov.sa',
			'org.sa',
			'net.sa',
			'edu.sa',

			// Nigeria.
			'com.ng',
			'gov.ng',
			'org.ng',
			'net.ng',
			'edu.ng',

			// Kenya.
			'co.ke',
			'go.ke',
			'or.ke',
			'ne.ke',
			'ac.ke',

			// Egypt.
			'com.eg',
			'gov.eg',
			'org.eg',
			'net.eg',
			'edu.eg',

			// Popular hosting platforms.
			'blogspot.com',
			'wordpress.com',
			'github.io',
			'gitlab.io',
			'netlify.app',
			'vercel.app',
			'herokuapp.com',
			'azurewebsites.net',
			'cloudfront.net',
			's3.amazonaws.com',
			'firebaseapp.com',

			// Common wildcards for specific TLDs.
			'*.uk',
			'*.au',
			'*.nz',
		);

		return $tlds;
	}

	/**
	 * Load PSL rules from the hardcoded list
	 *
	 * Converts the simple array to an associative array for O(1) lookups.
	 */
	private static function load_rules() {
		$tlds = self::get_common_tlds();
		// Flip array so TLD strings become keys for fast isset() lookups.
		self::$rules = array_flip( $tlds );
	}
}
