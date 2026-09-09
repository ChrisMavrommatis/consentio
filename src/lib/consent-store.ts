import Cookies from './cookies.js';
import type { ConsentRecord, CookieAttributes } from '../types.js';

/**
 * Denied for everything except strictly necessary - the fallback when there is no stored
 * choice. It needs no config file, which is what lets the loader push it synchronously.
 */
export const BASELINE_CONSENTS: ConsentRecord = {
	strictly_necessary: 'granted'
};

/** How long a stored answer lasts when the site names none, in days. The one place it is written. */
export const DEFAULT_LIFETIME_DAYS = 90;

/** What a site may say about where and how long the answer is kept. */
export interface ConsentCookieOptions {
	/** Days the answer lasts. Anything that is not a positive number falls back. */
	lifetime?: number;
	/** True scopes the answer to the shared domain instead of this host alone. */
	shared?: boolean;
}

/** Written and read back to ask the browser which domains it will take, then deleted. */
const PROBE_COOKIE = 'consentio_probe';

let probedHost: string | null = null;
let probedDomain = '';

/**
 * The broadest Domain this browser accepts for the page it is on, or '' when there is none.
 * Asked rather than computed: a label strip gets `co.uk` from `site.co.uk`, and doing it
 * properly needs the public suffix list. Issue 39.
 */
export function sharedDomain(): string {
	const hostname = typeof location === 'undefined' ? '' : location.hostname;
	if (typeof hostname !== 'string' || !hostname) {
		return '';
	}
	if (hostname !== probedHost) {
		probedHost = hostname;
		probedDomain = probeSharedDomain(hostname);
	}
	return probedDomain;
}

function probeSharedDomain(hostname: string): string {
	// `localhost` and an IP address carry no shared domain, and probing one says so slowly.
	if (hostname.indexOf('.') === -1 || hostname.indexOf(':') !== -1 || /^[\d.]+$/.test(hostname)) {
		return '';
	}
	const labels = hostname.split('.');
	for (let i = labels.length - 2; i >= 0; i--) {
		const candidate = labels.slice(i).join('.');
		// No expiry, so a probe the removal below somehow missed dies with the tab.
		Cookies.set(PROBE_COOKIE, '1', { domain: candidate });
		const accepted = Cookies.get(PROBE_COOKIE) === '1';
		Cookies.remove(PROBE_COOKIE, { domain: candidate });
		if (accepted) {
			return candidate;
		}
	}
	return '';
}

// Nested rather than siblings of `version`, so a category cannot collide with it. Issue 18.
interface StoredConsent {
	version?: number;
	consents?: ConsentRecord;
	date?: string;
}

function attributesFor(options: ConsentCookieOptions): CookieAttributes {
	const lifetime = typeof options.lifetime === 'number' && options.lifetime > 0
		? options.lifetime
		: DEFAULT_LIFETIME_DAYS;
	const attributes: CookieAttributes = { expires: lifetime };
	const domain = options.shared ? sharedDomain() : '';
	if (domain) {
		attributes.domain = domain;
	}
	return attributes;
}

/** The stored choice, or null when there is none to honour at this version. */
export function readConsents(cookieName: string, version: number): ConsentRecord | null {
	const cookie = Cookies.get(cookieName);
	if (!cookie) {
		return null;
	}
	try {
		const stored = JSON.parse(cookie) as StoredConsent;
		// A flat value written before the nesting has no `consents`, and reads as no answer.
		// Nothing tests the date: a value written before it existed is still an answer. Issue 38.
		if (stored === null || typeof stored !== 'object' || stored.version !== version || !stored.consents) {
			return null;
		}
		return { ...stored.consents };
	} catch {
		return null;
	}
}

/** Writes the answer. False means the browser did not keep it, which should not happen. Issue 39. */
export function writeConsents(
	cookieName: string,
	version: number,
	consents: ConsentRecord,
	options: ConsentCookieOptions = {}
): boolean {
	// Nothing reads the date yet, and a cookie that already exists cannot be given one. Issue 38.
	const value = JSON.stringify({ version, consents, date: new Date().toISOString() });
	// The other scope goes first, so flipping the setting cannot leave two cookies of one
	// name for the browser to send together.
	clearConsents(cookieName);
	Cookies.set(cookieName, value, attributesFor(options));
	return Cookies.get(cookieName) === value;
}

/** Both scopes, whichever is in use: a cookie is only removed at the Domain it was written at. Issue 39. */
export function clearConsents(cookieName: string): void {
	Cookies.remove(cookieName);
	const domain = sharedDomain();
	if (domain) {
		Cookies.remove(cookieName, { domain });
	}
}
