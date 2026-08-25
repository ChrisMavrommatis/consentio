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
import type { ConsentCategory, ConsentCategoryOverride, ConsentioConfig, ConsentioOptions, CookieDescriptor } from './types.js'

class Consentio {
	static version = __CONSENTIO_VERSION__;
	static _defaultConfig: ConsentioConfig = {
		cookieName: 'consentio',
		debug: false,
		version: 1,
		consentRequired: false,
		texts: {
			barTitle: 'Cookie Policy',
			barDescription: 'This site uses cookies to enhance your experience. We are assuming that you are okay with that, but you can change that by clicking at the settings button.',
			buttonSettings: 'Settings',
			buttonSave: 'Save',
			buttonCancel: 'Cancel',
			buttonAcceptAll: 'Accept All',
			modalTitle: 'Cookie Settings',
			modalDescription: `Here you can change your cookie preferences. Clicking on save will save the current settings, while clicking on cancel makes no change.
			According to the European general data protection regulation (GDPR) and the ePrivacy directive, websites must receive the user’s consent before using any cookie 
			besides the strictly necessary ones. You can expand each section to learn a bit more for each category. If you are interested to learn more, then follow the link.`,
			alwaysOnLabel: 'Always On',
			cookieTableHeaderName: 'Cookie Name',
			cookieTableHeaderPurpose: 'Cookie Purpose',
			cookieTableHeaderProvenance: 'Provenance',
			cookieTableHeaderDuration: 'Duration'
		},
		consents: [
			{
				key: 'strictly_necessary',
				title: 'Strictly Necessary Cookies',
				description: `These cookies are essential for you to browse the website and use its features, such as accessing secure areas of the site. 
				Cookies that allow web shops to hold your items in your cart while you are shopping online are an example of strictly necessary cookies.`,
				alwaysOn: true,
				defaultState: 'granted'
			},
			{
				key: 'preferences_functionality',
				title: 'Preferences Cookies',
				description: `Preference cookies enable a website to remember information that changes the way the website behaves or looks, 
				such as your preferred language or the region that you are in.`,
				alwaysOn: false,
				defaultState: 'denied'
			},
			{
				key: 'statistics_performance',
				title: 'Statistics Cookies',
				description: `Statistic cookies help website owners to understand how visitors interact with websites by collecting and reporting information anonymously.`,
				alwaysOn: false,
				defaultState: 'denied'
			},
			{
				key: 'marketing_advertising',
				title: 'Marketing Cookies',
				description: `Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the
			 individual user and thereby more valuable for publishers and third party advertisers.`,
				alwaysOn: false,
				defaultState: 'denied'
			}
		],
	};

	declare config: ConsentioConfig;
	declare cookies: CookieDescriptor[];
	declare logger: ConsentioLogger;
	declare state: ConsentioState | null;
	declare el: ConsentioAppElement | null;

	static Create(options: ConsentioOptions = {}, cookies: CookieDescriptor[] = []): Consentio {
		// The loader's double-init guard reads this, so Create has to set it or the two
		// entry points cannot see each other - which is what makes issue 8 bite.
		const instance = new Consentio(options, cookies, window.console);
		window.ConsentioInstance = instance;
		return instance;
	}

	/**
	 * The four categories are fixed, so this only ever changes copy. An unknown key is
	 * warned about and dropped rather than added: a fifth category could never reach a
	 * Google signal, and the loader has to know the set before it can read any config.
	 */
	static mergeConsents(defaultConsents: ConsentCategory[], customConsents: ConsentCategoryOverride[], logger: Console | null = null): ConsentCategory[] {
		const consentMap: Record<string, ConsentCategory> = Object.fromEntries(defaultConsents.map(c => [c.key, c]));
		customConsents.forEach(c => {
			if (!Object.prototype.hasOwnProperty.call(consentMap, c.key)) {
				// Warned, not thrown: the rest of the config is still good and a blank page
				// is a worse answer than a banner missing one category nobody could use.
				logger?.warn(`[Consentio] unknown consent category "${c.key}" ignored - the four categories are fixed`);
				return;
			}
			// Field by field, not a spread of the whole override: a spread carries anything
			// else the site wrote through, including the `signals` routing that used to be
			// honoured here. Copy is a site's to change; taxonomy is not.
			const changes: Partial<ConsentCategory> = {};
			if (c.title !== undefined) { changes.title = c.title; }
			if (c.description !== undefined) { changes.description = c.description; }
			if (c.alwaysOn !== undefined) { changes.alwaysOn = c.alwaysOn; }
			if (c.defaultState !== undefined) { changes.defaultState = c.defaultState; }
			consentMap[c.key] = { ...consentMap[c.key], ...changes };
		});
		return Object.values(consentMap);
	}

	constructor(options: ConsentioOptions = {}, cookies: CookieDescriptor[] = [], logger: Console | null = null) {
		// One cookie identity, not two. The loader already resolved the name and the version
		// off its own tag and published them; taking them back means a tag and a config JSON
		// that disagree cannot point the two halves at different cookies. The tag manager
		// route never runs the loader, so it keeps taking the config's values.
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

	/**
	 * The loader appends the bundle with no `defer`, so a loader tag in `<head>` reaches
	 * here while `document.body` is still null. Issue 10.
	 */
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
		// define() throws on a name already taken, so a second Consentio on the page would
		// die here rather than reuse the registry. Issue 8.
		for (const [name, constructor] of elements) {
			if (!customElements.get(name)) {
				customElements.define(name, constructor);
			}
		}
	}

}


export default Consentio;
