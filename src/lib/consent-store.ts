import Cookies from './cookies.js';
import type { ConsentRecord } from '../types.js';

/**
 * Denied for everything except strictly necessary. The core pushes this when there is no
 * stored choice to honour, and it is the only defensible default - which is what lets the
 * core skip the config file entirely and stay synchronous.
 */
export const BASELINE_CONSENTS: ConsentRecord = {
	strictly_necessary: 'granted'
};

/** The stored choice, or null when there is none to honour at this version. */
export function readConsents(cookieName: string, version: number): ConsentRecord | null {
	const cookie = Cookies.get(cookieName);
	if (!cookie) {
		return null;
	}
	try {
		const stored = JSON.parse(cookie) as ConsentRecord & { version?: number };
		if (stored.version !== version) {
			return null;
		}
		delete stored.version;
		return stored;
	} catch {
		return null;
	}
}

export function writeConsents(cookieName: string, version: number, consents: ConsentRecord): void {
	Cookies.set(cookieName, JSON.stringify({ version, ...consents }));
}

export function clearConsents(cookieName: string): void {
	Cookies.remove(cookieName);
}
