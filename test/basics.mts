/**
 * Shared helpers that do NOT need a browser.
 *
 * Kept apart from helpers.mts on purpose. That file builds banners, so it loads the
 * element classes, and those extend HTMLElement the moment they load. Anything importing
 * it therefore needs a browser even if the test itself only reads a cookie. Tests that
 * check cookies, saved settings or the Google signals import this file instead, and run
 * against the small stand-in in register-plain.mjs.
 *
 * Nothing here may import from src/consentio.js or from src/elements/.
 */
import type { ConsentCategory, ConsentRecord, CookieTableHeaders } from '../src/types.js';

/**
 * The seven signals Google actually reads. Defect 2 is that the map emits an eighth,
 * `essential_storage`, which Google drops silently.
 */
export const GOOGLE_SIGNALS = [
	'ad_storage',
	'ad_user_data',
	'ad_personalization',
	'analytics_storage',
	'functionality_storage',
	'personalization_storage',
	'security_storage'
] as const;

export interface Push {
	command: unknown;
	action: unknown;
	payload: Record<string, unknown>;
}

/**
 * `ConsentioGTM.push` forwards `arguments` verbatim, so the dataLayer holds IArguments
 * objects rather than arrays. That is the gtag convention and is deliberate - read the
 * entries positionally.
 */
export function pushes(): Push[] {
	const layer = (globalThis.window as { dataLayer?: unknown[] }).dataLayer ?? [];
	return Array.from(layer, (entry) => {
		const args = entry as Record<number, unknown>;
		return { command: args[0], action: args[1], payload: args[2] as Record<string, unknown> };
	});
}

/**
 * Empty the dataLayer in place. ConsentioGTM caches the array in its constructor, so
 * assigning a fresh one here would orphan every already-constructed instance and the
 * pushes would land somewhere the assertions cannot see.
 */
export function resetDataLayer(): void {
	const page = globalThis.window as { dataLayer?: unknown[] };
	if (page.dataLayer) {
		page.dataLayer.length = 0;
	} else {
		page.dataLayer = [];
	}
}

export function clearCookies(): void {
	for (const pair of document.cookie.split(';')) {
		const name = pair.split('=')[0].trim();
		if (name) {
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
		}
	}
}

/** A minimal three-category set, enough to exercise alwaysOn and both default states. */
export const CATEGORIES: ConsentCategory[] = [
	{ key: 'strictly_necessary', title: 'S', description: '', alwaysOn: true, defaultState: 'granted' },
	{ key: 'statistics_performance', title: 'A', description: '', alwaysOn: false, defaultState: 'denied' },
	{ key: 'marketing_advertising', title: 'M', description: '', alwaysOn: false, defaultState: 'denied' }
];

/** The four default categories at their post-banner state: only the necessary one granted. */
export const FULL_CONSENT: ConsentRecord = {
	strictly_necessary: 'granted',
	preferences_functionality: 'denied',
	statistics_performance: 'denied',
	marketing_advertising: 'denied'
};

export const TABLE_HEADERS: CookieTableHeaders = {
	cookieName: 'Cookie Name',
	cookiePurpose: 'Cookie Purpose',
	cookieProvenance: 'Provenance',
	cookieDuration: 'Duration'
};

/** Every `{{ name }}` a template asks for, in order of appearance. */
export function placeholdersIn(template: string): string[] {
	return Array.from(template.matchAll(/{{\s*(\w+)\s*}}/g), (match) => match[1]);
}
