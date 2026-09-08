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
import type { ConsentCategory, ConsentCategoryOverride, ConsentioConfig, ConsentioOptions, CookieDescriptor } from './types.js'

class Consentio {
	static version = __CONSENTIO_VERSION__;
	static _defaultConfig: ConsentioConfig = {
		cookieName: 'consentio',
		debug: false,
		version: 1,
		consentRequired: false,
		policyUrl: '',
		// alwaysOn and defaultState stay here: they are behaviour, not words.
		texts: { ...english.texts },
		consents: [
			{ key: 'strictly_necessary', ...english.consents.strictly_necessary, alwaysOn: true, defaultState: 'granted' },
			{ key: 'preferences_functionality', ...english.consents.preferences_functionality, alwaysOn: false, defaultState: 'denied' },
			{ key: 'statistics_performance', ...english.consents.statistics_performance, alwaysOn: false, defaultState: 'denied' },
			{ key: 'marketing_advertising', ...english.consents.marketing_advertising, alwaysOn: false, defaultState: 'denied' }
		],
	};

	declare config: ConsentioConfig;
	declare cookies: CookieDescriptor[];
	declare logger: ConsentioLogger;
	declare state: ConsentioState | null;
	declare el: ConsentioAppElement | null;

	static Create(options: ConsentioOptions = {}, cookies: CookieDescriptor[] = []): Consentio {
		// The loader's double-init guard reads this. Issue 9.
		const instance = new Consentio(options, cookies, window.console);
		window.ConsentioInstance = instance;
		return instance;
	}

	// The four categories are fixed, so this only ever changes copy. Issue 28.
	static mergeConsents(defaultConsents: ConsentCategory[], customConsents: ConsentCategoryOverride[], logger: Console | null = null): ConsentCategory[] {
		const consentMap: Record<string, ConsentCategory> = Object.fromEntries(defaultConsents.map(c => [c.key, c]));
		customConsents.forEach(c => {
			if (!Object.prototype.hasOwnProperty.call(consentMap, c.key)) {
				// Warned, not thrown: the rest of the config is still good.
				logger?.warn(`[Consentio] unknown consent category "${c.key}" ignored - the four categories are fixed`);
				return;
			}
			// Field by field: a spread would carry through whatever else the site wrote.
			const changes: Partial<ConsentCategory> = {};
			if (c.title !== undefined) { changes.title = c.title; }
			if (c.description !== undefined) { changes.description = c.description; }
			if (c.alwaysOn !== undefined) { changes.alwaysOn = c.alwaysOn; }
			if (c.defaultState !== undefined) { changes.defaultState = c.defaultState; }
			consentMap[c.key] = { ...consentMap[c.key], ...changes };
		});
		return Object.values(consentMap);
	}

	static policyUrl(value: string, logger: Console | null = null): string {
		const url = safeUrl(value);
		if (!url && value) {
			// Warned, not thrown: a banner with no link is better than no banner.
			logger?.warn(`[Consentio] policy URL "${value}" ignored - it must start with http://, https:// or /`);
		}
		return url || '';
	}

	constructor(options: ConsentioOptions = {}, cookies: CookieDescriptor[] = [], logger: Console | null = null) {
		// The loader already resolved the cookie name and version off its own tag. Taking
		// them back is what stops the two halves reading different cookies.
		const fromLoader = typeof window === 'undefined' ? undefined : window.ConsentioDefault;

		this.config = {
			...Consentio._defaultConfig,
			...options,
			...(fromLoader ? { cookieName: fromLoader.cookieName, version: fromLoader.version } : {}),
			texts: {
				...Consentio._defaultConfig.texts,
				...(options.texts || {})
			},
			consents: options.consents
				? Consentio.mergeConsents(Consentio._defaultConfig.consents, options.consents, logger)
				: Consentio._defaultConfig.consents
		};
		// An address is behaviour, not a word, so it is checked rather than escaped - issue 37.
		this.config.policyUrl = Consentio.policyUrl(this.config.policyUrl, logger);
		this.cookies = [
			...cookies
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
