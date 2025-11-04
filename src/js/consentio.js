/**
 * Consentio - Minimal and lightweight consent modal
 * 
 * Consentio is a lightweight, frontend-only consent management solution for privacy compliance.
 * It integrates seamlessly with tag manager and provides transparent consent handling.
 * 
 * @author ChrisMavrommatis
 * @license Apache-2.0
 */


import ConsentioAppElement from './consentio-app.js';
import ConsentioBarElement from './consentio-bar.js';
import ConsentioRequiredElement from './consentio-required.js';
import ConsentioFloatingButtonElement from './consentio-floating-button.js';
import ConsentioConsentItemElement from './consentio-consent-item.js';
import ConsentioModalElement from './consentio-modal.js';
import ConsentioState from './consentio-state.js'
import ConsentioLogger from './consentio-logger.js'

class Consentio {
	static version = '0.0.4';
	static _defaultConfig = {
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

	static Create(options = {}, cookies = []) {
		return new Consentio(options, cookies, window.console);
	}

	static mergeConsents(defaultConsents, customConsents) {
		const consentMap = Object.fromEntries(defaultConsents.map(c => [c.key, c]));
		customConsents.forEach(c => {
			consentMap[c.key] = { ...consentMap[c.key], ...c };
		});
		return Object.values(consentMap);
	}

	constructor(options = {}, cookies = [], logger = null) {
		this.config = {
			...Consentio._defaultConfig,
			...options,
			texts: {
				...Consentio._defaultConfig.texts,
				...(options.texts || {})
			},
			consents: options.consents
				? Consentio.mergeConsents(Consentio._defaultConfig.consents, options.consents)
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



	init() {
		this.state = new ConsentioState(
			this.config.cookieName,
			this.config.version,
			this.config.consents
		);
		this.el = document.createElement("consentio-app");
		this.el.config = this.config;
		this.el.state = this.state;
		this.el.cookies = this.cookies;
		this.el.logger = this.logger;
		document.body.appendChild(this.el);
	}


	defineCustomElements() {
		customElements.define('consentio-app', ConsentioAppElement);
		customElements.define('consentio-bar', ConsentioBarElement);
		customElements.define('consentio-required', ConsentioRequiredElement);
		customElements.define('consentio-floating-button', ConsentioFloatingButtonElement);
		customElements.define('consentio-consent-item', ConsentioConsentItemElement);
		customElements.define('consentio-modal', ConsentioModalElement);
	}

}


export default Consentio;

