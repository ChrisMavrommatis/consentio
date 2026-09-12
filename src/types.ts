export type ConsentState = 'granted' | 'denied';

export type LogLevel = 'error' | 'warn' | 'info' | 'log';

/** Consent key -> state, as stored in the cookie and passed around at runtime. */
export type ConsentRecord = Record<string, ConsentState>;

/**
 * The three objects a site supplies, one per concern:
 *
 *   settings  - behaviour, from consentio-settings.json / data-settings-url
 *   language  - every word the visitor reads, from the published pack / data-language-url
 *   cookies   - the cookie table, from consentio-cookies.json / data-cookies-url
 *
 * `Consentio.Create(settings, language, cookies)`. Words and behaviour change on
 * different days and by different people, which is why they are different files.
 */

export interface ConsentioTexts {
	barTitle: string;
	barDescription: string;
	buttonSettings: string;
	buttonSave: string;
	buttonCancel: string;
	buttonAcceptAll: string;
	buttonRejectAll: string;
	modalTitle: string;
	modalDescription: string;
	alwaysOnLabel: string;
	policyLinkLabel: string;
	cookieTableHeaderName: string;
	cookieTableHeaderPurpose: string;
	cookieTableHeaderProvenance: string;
	cookieTableHeaderDuration: string;
}

/** One category's words - the half of a category that translates. */
export interface CategoryTexts {
	title: string;
	description: string;
}

/**
 * One category's behaviour - the half that does not translate. `alwaysOn` is not here:
 * only `strictly_necessary` is ever always-on and the four categories are fixed, so it
 * is derived rather than supplied.
 */
export interface CategorySettings {
	defaultState: ConsentState;
}

/** Behaviour: how the banner acts and what it stores. Argument one of Create. */
export interface ConsentioSettings {
	cookieName: string;
	/** Days a stored answer lasts. Defaults to DEFAULT_LIFETIME_DAYS - issue 38. */
	cookieLifetime: number;
	/** Binds the answer to the domain the site's hosts share, not this one - issue 39. */
	shareAcrossSubdomains: boolean;
	debug: boolean;
	version: number;
	consentRequired: boolean;
	/** Address of the site's privacy policy, or '' for no link. A language may override it. */
	policyUrl: string;
	/** Drops the round reopen button, for a site that has its own link - issue 40. */
	hideFloatingButton: boolean;
	/** Carries the ad-click id in same-site links while ad storage is denied. Read on the tag route; the loader tag carries it on the other. */
	urlPassthrough: boolean;
	consents: Record<string, CategorySettings>;
}

/**
 * Words: the published language pack, unchanged. Argument two of Create, and the same
 * file `scripts/i18n.mjs` writes and the tag's variable reads - issue 34.
 *
 * `policyUrl` is here as well as in the settings because a Greek site links a Greek
 * policy page. A key that is present wins, blank included: '' means no link in this
 * language, and leaving the key out is what falls back to `settings.policyUrl`.
 */
export interface ConsentioLanguage {
	locale: string;
	name: string;
	policyUrl?: string;
	texts: ConsentioTexts;
	consents: Record<string, CategoryTexts>;
}

/** What a site may actually write in a settings file: any subset of the above. */
export type SettingsInput =
	Partial<Omit<ConsentioSettings, 'consents'>>
	& { consents?: Record<string, Partial<CategorySettings>> };

/** What a site may actually write in a language file: any subset of a pack. */
export type LanguageInput =
	Partial<Omit<ConsentioLanguage, 'texts' | 'consents'>>
	& {
		texts?: Partial<ConsentioTexts>;
		consents?: Record<string, Partial<CategoryTexts>>;
	};

/**
 * Settings and language resolved into the one object the elements read. It is built at
 * construction and never appears in a file.
 */
export interface ResolvedConfig {
	cookieName: string;
	cookieLifetime: number;
	shareAcrossSubdomains: boolean;
	debug: boolean;
	version: number;
	consentRequired: boolean;
	policyUrl: string;
	hideFloatingButton: boolean;
	locale: string;
	texts: ConsentioTexts;
	consents: ConsentCategory[];
}

/** One resolved category: its words, its behaviour and the key that names it. */
export interface ConsentCategory {
	key: string;
	title: string;
	description: string;
	alwaysOn: boolean;
	defaultState: ConsentState;
}

/**
 * What the loader leaves on the page once it has pushed the consent default. The last two
 * are optional: the loader publishes each only when its attribute is on the tag.
 */
export interface ConsentioDefaultState {
	cookieName: string;
	version: number;
	consents: ConsentRecord;
	consentGiven: boolean;
	/** True when `url_passthrough` went out with the default. */
	urlPassthrough?: boolean;
	cookieLifetime?: number;
	shareAcrossSubdomains?: boolean;
}

/** One row of the per-category cookie table, as supplied by the cookies JSON. */
export interface CookieTableRow {
	name: string;
	purpose: string;
	provenance: string;
	duration: string;
	category: string;
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
