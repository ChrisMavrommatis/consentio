import Cookies from './cookies.js';
import type { ConsentRecord } from '../types.js';

/**
 * Denied for everything except strictly necessary - the fallback when there is no stored
 * choice. It needs no config file, which is what lets the loader push it synchronously.
 */
export const BASELINE_CONSENTS: ConsentRecord = {
	strictly_necessary: 'granted'
};

/**
 * What one cookie holds. The categories are nested rather than siblings of `version`, so
 * a category cannot collide with it - issue 18.
 */
interface StoredConsent {
	version?: number;
	consents?: ConsentRecord;
}

/** The stored choice, or null when there is none to honour at this version. */
export function readConsents(cookieName: string, version: number): ConsentRecord | null {
	const cookie = Cookies.get(cookieName);
	if (!cookie) {
		return null;
	}
	try {
		const stored = JSON.parse(cookie) as StoredConsent;
		// A value written before the nesting has no `consents`, and reads as no answer -
		// the same outcome as a version mismatch, which is the established behaviour.
		if (stored === null || typeof stored !== 'object' || stored.version !== version || !stored.consents) {
			return null;
		}
		return { ...stored.consents };
	} catch {
		return null;
	}
}

export function writeConsents(cookieName: string, version: number, consents: ConsentRecord): void {
	Cookies.set(cookieName, JSON.stringify({ version, consents }));
}

export function clearConsents(cookieName: string): void {
	Cookies.remove(cookieName);
}
