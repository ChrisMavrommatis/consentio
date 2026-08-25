export type ConsentState = 'granted' | 'denied';

export type LogLevel = 'error' | 'warn' | 'info' | 'log';

/** Consent key -> state, as stored in the cookie and passed around at runtime. */
export type ConsentRecord = Record<string, ConsentState>;

export interface ConsentioTexts {
	barTitle: string;
	barDescription: string;
	buttonSettings: string;
	buttonSave: string;
	buttonCancel: string;
	buttonAcceptAll: string;
	modalTitle: string;
	modalDescription: string;
	alwaysOnLabel: string;
	cookieTableHeaderName: string;
	cookieTableHeaderPurpose: string;
	cookieTableHeaderProvenance: string;
	cookieTableHeaderDuration: string;
}

export interface ConsentCategory {
	key: string;
	title: string;
	description: string;
	alwaysOn: boolean;
	defaultState: ConsentState;
}

/** What the loader leaves on the page once it has pushed the consent default. */
export interface ConsentioDefaultState {
	cookieName: string;
	version: number;
	consents: ConsentRecord;
	consentGiven: boolean;
}

/**
 * What a site may supply for one of the four categories: copy, not taxonomy. The key
 * selects which category is being changed and must be one of the four - issue 28.
 */
export type ConsentCategoryOverride = Partial<ConsentCategory> & { key: string };

export interface ConsentioConfig {
	cookieName: string;
	debug: boolean;
	version: number;
	consentRequired: boolean;
	texts: ConsentioTexts;
	consents: ConsentCategory[];
}

export type ConsentioOptions =
	Partial<Omit<ConsentioConfig, 'texts' | 'consents'>>
	& {
		texts?: Partial<ConsentioTexts>;
		consents?: ConsentCategoryOverride[];
	};

/** One row of the per-category cookie table, as supplied by the cookies JSON. */
export interface CookieDescriptor {
	name: string;
	purpose: string;
	provenance: string;
	duration: string;
	category: string;
}

export interface CookieTableHeaders {
	cookieName: string;
	cookiePurpose: string;
	cookieProvenance: string;
	cookieDuration: string;
}

export interface CookieAttributes {
	path?: string;
	expires?: number | Date | string;
	sameSite?: string;
	secure?: boolean;
	domain?: string;
	[attribute: string]: any;
}

export interface CookieConverter {
	read(value: string, name?: string): string;
	write(value: string, name?: string): string;
}
