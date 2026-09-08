/**
 * Consentio - a frontend-only consent banner for static sites.
 *
 * This is the asynchronous half. It renders the banner and pushes `consent update`.
 * The `consent default` belongs to consentio-loader.ts, which runs before the tag manager.
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
import ConsentioLogger from './lib/logger.js'
import { safeUrl } from './lib/url.js'
import english from '../i18n/en.yaml'
import type {
	CategoryTexts, ConsentCategory, ConsentioLanguage, ConsentioSettings, ConsentioTexts,
	CookieTableRow, LanguageInput, LegacyConfig, ResolvedConfig, SettingsInput
} from './types.js'

/** The behaviour keys a settings file may carry. Anything else in it is ignored. */
const SETTINGS_KEYS = [
	'cookieName', 'debug', 'version', 'consentRequired', 'policyUrl', 'hideFloatingButton'
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
		settings: SettingsInput | LegacyConfig = {},
		language: LanguageInput | CookieTableRow[] = {},
		cookies: CookieTableRow[] = []
	): Consentio {
		// The loader's double-init guard reads this. Issue 9.
		const instance = new Consentio(settings, language, cookies, window.console);
		window.ConsentioInstance = instance;
		return instance;
	}

	/**
	 * A merged object with `texts`, or with `consents` as an array, is 0.1.0's config.
	 * A settings file never has either.
	 */
	static isLegacy(settings: SettingsInput | LegacyConfig): boolean {
		if (!settings || typeof settings !== 'object') {
			return false;
		}
		return 'texts' in settings || Array.isArray((settings as LegacyConfig).consents);
	}

	/** 0.1.0's one object, taken apart into the two it is now. */
	static splitLegacy(config: LegacyConfig): { settings: SettingsInput; language: LanguageInput } {
		const settings: SettingsInput = Consentio.copy<SettingsInput>({}, config, SETTINGS_KEYS);
		const language: LanguageInput = {};
		if (config.texts) {
			language.texts = config.texts;
		}
		if (!Array.isArray(config.consents)) {
			return { settings, language };
		}
		for (const entry of config.consents) {
			if (!entry || typeof entry.key !== 'string') {
				continue;
			}
			// alwaysOn is read and dropped: it is derived from the key now.
			const words = Consentio.copy<Partial<CategoryTexts>>({}, entry, ['title', 'description']);
			if (Object.keys(words).length > 0) {
				language.consents = { ...language.consents, [entry.key]: words };
			}
			if (entry.defaultState !== undefined) {
				settings.consents = { ...settings.consents, [entry.key]: { defaultState: entry.defaultState } };
			}
		}
		return { settings, language };
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

	/** Two language inputs, the second winning. A supplied pack beats a legacy config's texts. */
	static overlayLanguage(base: LanguageInput, over: LanguageInput): LanguageInput {
		return {
			...base,
			...over,
			texts: { ...base.texts, ...over.texts },
			consents: { ...base.consents, ...over.consents }
		};
	}

	/** Settings and language into the one object the elements read. */
	static resolve(settings: ConsentioSettings, language: ConsentioLanguage, logger: Console | null = null): ResolvedConfig {
		// A language that names a policy page wins, blank included - '' is no link in this
		// language. Leaving the key out is what falls back to the settings.
		const address = language.policyUrl === undefined ? settings.policyUrl : language.policyUrl;
		return {
			cookieName: settings.cookieName,
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

	static policyUrl(value: string, logger: Console | null = null): string {
		const url = safeUrl(value);
		if (!url && value) {
			// Warned, not thrown: a banner with no link is better than no banner.
			logger?.warn(`[Consentio] policy URL "${value}" ignored - it must start with http://, https:// or /`);
		}
		return url || '';
	}

	/**
	 * `new Consentio(settings, language, cookies, logger)`.
	 *
	 * 0.1.0's `(config, cookies, logger)` still works: an Array in argument two is that
	 * call, and a settings carrying `texts` is that config, split internally.
	 */
	constructor(
		settings: SettingsInput | LegacyConfig = {},
		language: LanguageInput | CookieTableRow[] = {},
		cookies: CookieTableRow[] | Console | null = [],
		logger: Console | null = null
	) {
		if (Array.isArray(language)) {
			logger = (cookies as Console | null) ?? null;
			cookies = language;
			language = {};
		}
		const rows = Array.isArray(cookies) ? cookies : [];

		let settingsInput = settings as SettingsInput;
		let languageInput = language as LanguageInput;
		if (Consentio.isLegacy(settings)) {
			const split = Consentio.splitLegacy(settings as LegacyConfig);
			settingsInput = split.settings;
			// A pack supplied as argument two beats the wording inside the old config.
			languageInput = Consentio.overlayLanguage(split.language, languageInput);
		}

		this.settings = Consentio.mergeSettings(Consentio._defaultSettings, settingsInput, logger);
		this.language = Consentio.mergeLanguage(Consentio._defaultLanguage, languageInput, logger);

		// The loader already resolved the cookie name and version off its own tag. Taking
		// them back is what stops the two halves reading different cookies.
		const fromLoader = typeof window === 'undefined' ? undefined : window.ConsentioDefault;
		if (fromLoader) {
			this.settings.cookieName = fromLoader.cookieName;
			this.settings.version = fromLoader.version;
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
			this.config.consents
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
