import Cookies from './cookies.js';
import type { ConsentRecord } from '../types.js';

/**
 * Denied for everything except strictly necessary - the fallback when there is no stored
 * choice. It needs no config file, which is what lets the loader push it synchronously.
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
