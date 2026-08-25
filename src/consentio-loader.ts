/**
 * Consentio Loader - blocking, and first on the page.
 *
 * It does two jobs, in this order:
 *
 *   1. Pushes `consent default` straight away, from the cookie. A tag manager reads
 *      consent the moment it loads, so this cannot wait for a fetch or for the banner.
 *      That is why the tag is blocking and why this runs before anything else here.
 *   2. Everything it did before - injects the banner, fetches the config and cookie
 *      tables, constructs Consentio. All still async, all still after the tag manager.
 *
 * The Google Tag Manager custom template route does NOT use this file. A template cannot
 * inject a blocking script, so it sets the default itself through the tag manager's own
 * consent API and injects `consentio.min.js` directly.
 *
 * @author ChrisMavrommatis
 * @license Apache-2.0
 */

import { ADS_DATA_REDACTION, needsAdsDataRedaction, toConsentDefault, toGoogleSignals } from './lib/consent-signals.js';
import { BASELINE_CONSENTS, readConsents } from './lib/consent-store.js';

(function (global: Window & typeof globalThis, doc: Document, logger: Console, customElementsRegistry: CustomElementRegistry) {


	const getResource = function (url: string): Promise<any> {
		return new Promise((resolve, reject) => {
			fetch(url)
				.then(response => {
					if (!response.ok) {
						reject(`HTTP error! status: ${response.status}`);
					}
					return response.json();
				})
				.then(data => resolve(data))
				.catch(error => reject(`Fetch error: ${error}`));
		});
	}

	const getResources = function (urls: string[]): Promise<any[]> {
		return Promise.all(urls.map(url => getResource(url)));
	}

	const loaderScript = doc.querySelector<HTMLScriptElement>('script[data-consentio-loader]');

	if (!loaderScript) {
		logger.error('[Consentio Loader] script not found');
		return;
	}

	const debug = loaderScript.dataset.debug === 'true';

	const loaderSrc = loaderScript.getAttribute('src');

	const configUrl = loaderScript.dataset.configUrl || null;
	const cookiesUrl = loaderScript.dataset.cookiesUrl || null;



	if (global.ConsentioInstance) {
		debug && logger.warn('[Consentio Loader] Consentio is already initialized');
		return;
	}

	// The consent default. Synchronous, and before the injection below - everything after
	// this point is a network round trip away.
	//
	// Warn about async/defer regardless of the debug flag: a banner that silently gates
	// nothing is worth the noise.
	if (!global.ConsentioDefault) {
		// The attributes, not the properties: the attribute is what the site author typed.
		if (loaderScript.hasAttribute('async') || loaderScript.hasAttribute('defer')) {
			logger.warn('[Consentio Loader] loaded with async or defer, so the consent default cannot arrive before the tag manager');
		}

		const cookieName = loaderScript.dataset.cookieName || 'consentio';
		const version = Number(loaderScript.dataset.version || 1);
		const waitForUpdate = Number(loaderScript.dataset.waitForUpdate || 500);

		// readConsents returns null when there is no stored answer to honour.
		const stored = readConsents(cookieName, version);
		const consents = stored || BASELINE_CONSENTS;
		const signals = toGoogleSignals(consents);

		const dataLayer: unknown[] = global.dataLayer = global.dataLayer || [];

		// The gtag shape: an arguments object, not an array and not a plain object. Google
		// reads dataLayer entries positionally.
		function gtag(...args: unknown[]): void;
		function gtag(): void {
			dataLayer.push(arguments);
		}

		// wait_for_update only helps a first-time visitor; a returning one already has an answer.
		gtag('consent', 'default', toConsentDefault(signals, stored ? null : waitForUpdate));
		gtag('set', ADS_DATA_REDACTION, needsAdsDataRedaction(signals));

		global.ConsentioDefault = { cookieName, version, consents, consentGiven: stored !== null };
		debug && logger.info('[Consentio Loader] Consent default pushed:', consents);
	}

	// A tag pasted inline rather than linked loses the banner and keeps the default. Issue 22.
	if (loaderSrc === null) {
		logger.error('[Consentio Loader] the loader tag has no src, so the banner cannot be located');
		return;
	}

	// `.min.js` in the loader's own filename is what selects the minified build.
	const basePath = loaderSrc.substring(0, loaderSrc.lastIndexOf('/') + 1);
	const isMinified = loaderSrc.includes('.min.js');

	const consentioScript = doc.createElement('script');
	consentioScript.src = `${basePath}consentio${isMinified ? '.min' : ''}.js`;
	doc.head.appendChild(consentioScript);

	consentioScript.onload = async function () {
		if (typeof global.Consentio !== 'function') {
			logger.error('[Consentio Loader] Constructor not found after script load');
			return;
		}

		let config = {};
		let cookies: unknown[] = [];
		let resources: string[] = [];


		if (configUrl) {
			debug && logger.info('[Consentio Loader] Config URL:', configUrl);
			resources.push(configUrl);
		}
		if (cookiesUrl) {
			debug && logger.info('[Consentio Loader] Cookies URL:', cookiesUrl);
			resources.push(cookiesUrl);
		}


		try {

			if (resources.length > 0) {
				const results = await getResources(resources);
				let resultIndex = 0;
				if (configUrl) {
					config = results[resultIndex++];
					debug && logger.info('[Consentio Loader] Config loaded:', config);
				}
				if (cookiesUrl) {
					cookies = results[resultIndex++];
					debug && logger.info('[Consentio Loader] Cookies loaded:', cookies);
				}
				if (results.length > resultIndex) {
					logger.warn('[Consentio Loader] More resources loaded than expected');
				}
			}

			global.ConsentioInstance = new global.Consentio(config, cookies, logger);
			logger.info('[Consentio Loader] Initialized successfully');
		} catch (error) {
			logger.error('[Consentio Loader] Initialization failed:', error);
		}
	};

	consentioScript.onerror = async function () {
		logger.error('[Consentio Loader] Failed to load script:', consentioScript.src);
	};


})(window, document, console, customElements);



