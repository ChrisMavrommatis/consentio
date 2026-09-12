/**
 * Consentio - a frontend-only consent banner for static sites.
 *
 * @author ChrisMavrommatis
 * @license Apache-2.0
 */


import ConsentioAppElement from './elements/consentio-app.js';
import ConsentioBarElement from './elements/consentio-bar.js';
import ConsentioRequiredElement from './elements/consentio-required.js';
import ConsentioFloatingButtonElement from './elements/consentio-floating-button.js';
import ConsentioConsentItemElement from './elements/consentio-consent-item.js';
import ConsentioModalElement from './elements/consentio-modal.js';
import ConsentioState from './lib/state.js'
import { DEFAULT_LIFETIME_DAYS } from './lib/consent-store.js'
import ConsentioLogger from './lib/logger.js'
import { safeUrl } from './lib/url.js'
import english from '../i18n/en.yaml'
import type {
	CategoryTexts, ConsentCategory, ConsentioDefaultState, ConsentioLanguage, ConsentioSettings,
	ConsentioTexts, CookieTableRow, LanguageInput, ResolvedConfig, SettingsInput
} from './types.js'

/** The behaviour keys a settings file may carry. Anything else in it is ignored. */
const SETTINGS_KEYS = [
	'cookieName', 'cookieLifetime', 'shareAcrossSubdomains', 'debug', 'version', 'consentRequired',
	'policyUrl', 'hideFloatingButton'
] as const;

/** The words a pack may carry, taken from en.yaml so there is one key list. */
const TEXT_KEYS = Object.keys(english.texts) as (keyof ConsentioTexts)[];

/** The one category that is always on. The four are fixed, so this is derived, not supplied. */
const ALWAYS_ON = 'strictly_necessary';

class Consentio {
	static version = __CONSENTIO_VERSION__;

	/** Behaviour only. The words live in _defaultLanguage and nowhere else. */
	static _defaultSettings: ConsentioSettings = {
		cookieName: 'consentio',
		cookieLifetime: DEFAULT_LIFETIME_DAYS,
		shareAcrossSubdomains: false,
		debug: false,
		version: 1,
		consentRequired: false,
		policyUrl: '',
		hideFloatingButton: false,
		consents: {
			strictly_necessary: { defaultState: 'granted' },
			preferences_functionality: { defaultState: 'denied' },
			statistics_performance: { defaultState: 'denied' },
			marketing_advertising: { defaultState: 'denied' }
		}
	};

	/** i18n/en.yaml, as published. A pack a site supplies is this shape too - issue 34. */
	static _defaultLanguage: ConsentioLanguage = english;

	declare settings: ConsentioSettings;
	declare language: ConsentioLanguage;
	declare config: ResolvedConfig;
	declare cookies: CookieTableRow[];
	declare logger: ConsentioLogger;
	declare state: ConsentioState | null;
	declare el: ConsentioAppElement | null;

	static Create(
		settings: SettingsInput = {},
		language: LanguageInput = {},
		cookies: CookieTableRow[] = []
	): Consentio {
		// The loader's double-init guard reads this. Issue 9.
		const instance = new Consentio(settings, language, cookies, window.console);
		window.ConsentioInstance = instance;
		return instance;
	}

	/** Field by field, and only the fields named: a spread carries through whatever else was written. */
	static copy<T extends object>(target: T, source: unknown, keys: readonly (keyof T)[]): T {
		if (!source || typeof source !== 'object') {
			return target;
		}
		const from = source as Record<string, unknown>;
		for (const key of keys) {
			if (from[key as string] !== undefined) {
				target[key] = from[key as string] as T[keyof T];
			}
		}
		return target;
	}

	// The four categories are fixed, so a settings file only ever changes a default state. Issue 28.
	static mergeSettings(defaults: ConsentioSettings, supplied: SettingsInput = {}, logger: Console | null = null): ConsentioSettings {
		const merged: ConsentioSettings = Consentio.copy({ ...defaults, consents: {} }, supplied, SETTINGS_KEYS);
		for (const key of Object.keys(defaults.consents)) {
			merged.consents[key] = { ...defaults.consents[key] };
		}
		for (const [key, value] of Object.entries(supplied.consents || {})) {
			if (!Object.prototype.hasOwnProperty.call(merged.consents, key)) {
				// Warned, not thrown: the rest of the settings are still good.
				logger?.warn(`[Consentio] unknown consent category "${key}" ignored - the four categories are fixed`);
				continue;
			}
			Consentio.copy(merged.consents[key], value, ['defaultState']);
		}
		return merged;
	}

	// A pack may change every string but no key: a fifth category would reach no Google signal.
	static mergeLanguage(defaults: ConsentioLanguage, supplied: LanguageInput = {}, logger: Console | null = null): ConsentioLanguage {
		const merged: ConsentioLanguage = Consentio.copy(
			{ ...defaults, texts: { ...defaults.texts }, consents: {} },
			supplied,
			['locale', 'name', 'policyUrl']
		);
		for (const key of Object.keys(defaults.consents)) {
			merged.consents[key] = { ...defaults.consents[key] };
		}
		// Blank is not absent: '' is a supplied value and renders as an empty string. Leaving
		// the key out is what falls back to English.
		Consentio.copy(merged.texts, supplied.texts, TEXT_KEYS);
		for (const [key, value] of Object.entries(supplied.consents || {})) {
			if (!Object.prototype.hasOwnProperty.call(merged.consents, key)) {
				logger?.warn(`[Consentio] unknown consent category "${key}" ignored - the four categories are fixed`);
				continue;
			}
			Consentio.copy(merged.consents[key], value, ['title', 'description']);
		}
		return merged;
	}

	static resolve(settings: ConsentioSettings, language: ConsentioLanguage, logger: Console | null = null): ResolvedConfig {
		// A language that names a policy page wins, blank included - '' is no link in this
		// language. Leaving the key out is what falls back to the settings.
		const address = language.policyUrl === undefined ? settings.policyUrl : language.policyUrl;
		return {
			cookieName: settings.cookieName,
			cookieLifetime: settings.cookieLifetime,
			shareAcrossSubdomains: settings.shareAcrossSubdomains,
			debug: settings.debug,
			version: settings.version,
			consentRequired: settings.consentRequired,
			hideFloatingButton: settings.hideFloatingButton,
			// An address is behaviour, not a word, so it is checked rather than escaped - issue 37.
			policyUrl: Consentio.policyUrl(address, logger),
			locale: language.locale,
			texts: language.texts,
			consents: Object.keys(settings.consents).map((key): ConsentCategory => ({
				key,
				title: language.consents[key]?.title ?? '',
				description: language.consents[key]?.description ?? '',
				alwaysOn: key === ALWAYS_ON,
				defaultState: settings.consents[key].defaultState
			}))
		};
	}

	/**
	 * A settings file cannot name the cookie or the version, because the loader has already
	 * read the cookie by the time the file arrives. Said out loud rather than dropped. Issue 43.
	 */
	static warnLoaderWins(supplied: SettingsInput, fromLoader: ConsentioDefaultState, logger: Console | null = null): void {
		const attributes: [keyof ConsentioDefaultState & keyof SettingsInput, string][] = [
			['cookieName', 'data-cookie-name'],
			['version', 'data-version']
		];
		for (const [key, attribute] of attributes) {
			if (supplied[key] !== undefined && supplied[key] !== fromLoader[key]) {
				logger?.warn(`[Consentio] "${key}" in the settings file is ignored - the loader tag reads the cookie before the file arrives. Set ${attribute} on the tag instead.`);
			}
		}
	}

	static policyUrl(value: string, logger: Console | null = null): string {
		const url = safeUrl(value);
		if (!url && value) {
			// Warned, not thrown: a banner with no link is better than no banner.
			logger?.warn(`[Consentio] policy URL "${value}" ignored - it must start with http://, https:// or /`);
		}
		return url || '';
	}

	/** `new Consentio(settings, language, cookies, logger)` - three objects, one per concern. */
	constructor(
		settings: SettingsInput = {},
		language: LanguageInput = {},
		cookies: CookieTableRow[] = [],
		logger: Console | null = null
	) {
		const rows = Array.isArray(cookies) ? cookies : [];

		this.settings = Consentio.mergeSettings(Consentio._defaultSettings, settings, logger);
		this.language = Consentio.mergeLanguage(Consentio._defaultLanguage, language, logger);

		// The loader already resolved the cookie name and version off its own tag. Taking
		// them back is what stops the two halves reading different cookies.
		const fromLoader = typeof window === 'undefined' ? undefined : window.ConsentioDefault;
		if (fromLoader) {
			Consentio.warnLoaderWins(settings, fromLoader, logger);
			this.settings.cookieName = fromLoader.cookieName;
			this.settings.version = fromLoader.version;
			// Published only when the tag names them, so a settings file still gets to.
			if (fromLoader.cookieLifetime !== undefined) {
				this.settings.cookieLifetime = fromLoader.cookieLifetime;
			}
			if (fromLoader.shareAcrossSubdomains !== undefined) {
				this.settings.shareAcrossSubdomains = fromLoader.shareAcrossSubdomains;
			}
		}

		this.config = Consentio.resolve(this.settings, this.language, logger);
		if (this.config.hideFloatingButton) {
			// Warned, not thrown: the site may well have its own link, and nothing here can see it.
			logger?.warn('[Consentio] hideFloatingButton is set - the site now owes the visitor a link of its own calling window.ConsentioInstance.openSettings()');
		}
		this.cookies = [
			...rows
		];

		this.logger = new ConsentioLogger(logger, this.config.debug);
		this.state = null
		this.el = null;
		this.defineCustomElements();
		this.init();
	}



	init(): void {
		this.state = new ConsentioState(
			this.config.cookieName,
			this.config.version,
			this.config.consents,
			{ lifetime: this.config.cookieLifetime, shared: this.config.shareAcrossSubdomains },
			this.logger.logger
		);
		this.el = document.createElement("consentio-app") as ConsentioAppElement;
		// The pack says which language its words are in, so the banner can say so too.
		this.el.setAttribute('lang', this.config.locale);
		this.el.config = this.config;
		this.el.state = this.state;
		this.el.cookies = this.cookies;
		this.el.logger = this.logger;
		this.attach();
	}

	// A loader tag in `<head>` reaches here before there is a body. Issue 10.
	attach(): void {
		if (document.body) {
			document.body.appendChild(this.el!);
			return;
		}
		document.addEventListener('DOMContentLoaded', () => {
			document.body.appendChild(this.el!);
		}, { once: true });
	}


	/**
	 * The page's supported way into the settings panel - a footer link, a cookie policy
	 * page. Issue 40.
	 *
	 * A call made before the banner is in the document is ignored rather than queued:
	 * the panel it would open has not been built yet, and the only caller that early is
	 * a script in `<head>`, which has no visitor to open it for.
	 */
	openSettings(): void {
		if (!this.el?.isRendered) {
			this.logger?.log('[Consentio] openSettings ignored - the banner is not on the page yet', 'warn');
			return;
		}
		this.el.openSettings();
	}


	defineCustomElements(): void {
		const elements: [string, CustomElementConstructor][] = [
			['consentio-app', ConsentioAppElement],
			['consentio-bar', ConsentioBarElement],
			['consentio-required', ConsentioRequiredElement],
			['consentio-floating-button', ConsentioFloatingButtonElement],
			['consentio-consent-item', ConsentioConsentItemElement],
			['consentio-modal', ConsentioModalElement]
		];
		// define() throws on a name already taken. Issue 8.
		for (const [name, constructor] of elements) {
			if (!customElements.get(name)) {
				customElements.define(name, constructor);
			}
		}
	}

}


export default Consentio;
