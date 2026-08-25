/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/lib/consent-signals.ts
// Google drops an unknown key silently, which is why a wrong name looks like it works.
const GOOGLE_SIGNALS = (/* unused pure expression or super */ null && ([
    'ad_storage',
    'ad_user_data',
    'ad_personalization',
    'analytics_storage',
    'functionality_storage',
    'personalization_storage',
    'security_storage'
]));
// The four are fixed, so this is the only map there is.
const DEFAULT_SIGNAL_MAP = {
    strictly_necessary: ['security_storage'],
    preferences_functionality: ['functionality_storage', 'personalization_storage'],
    statistics_performance: ['analytics_storage'],
    marketing_advertising: ['ad_storage', 'ad_user_data', 'ad_personalization']
};
function toGoogleSignals(consents, map = DEFAULT_SIGNAL_MAP) {
    // Deny wins, so a signal nothing is routed to stays denied.
    const state = (signal) => {
        const sources = Object.keys(map).filter((key) => map[key].includes(signal));
        return sources.length > 0 && sources.every((key) => consents[key] === 'granted') ? 'granted' : 'denied';
    };
    // A signal left out of a `consent update` keeps its previous value.
    return {
        ad_storage: state('ad_storage'),
        ad_user_data: state('ad_user_data'),
        ad_personalization: state('ad_personalization'),
        analytics_storage: state('analytics_storage'),
        functionality_storage: state('functionality_storage'),
        personalization_storage: state('personalization_storage'),
        security_storage: state('security_storage')
    };
}
/** The gtag `set` key that stops ad identifiers being sent while ad storage is denied. */
const ADS_DATA_REDACTION = 'ads_data_redaction';
function needsAdsDataRedaction(signals) {
    return signals.ad_storage === 'denied';
}
// `null` for waitForUpdate when there is a stored choice: waiting for a banner that will
// never appear only delays the tag.
function toConsentDefault(signals, waitForUpdate) {
    return waitForUpdate === null ? { ...signals } : { ...signals, wait_for_update: waitForUpdate };
}

;// ./src/lib/cookies.ts
/*! based on js-cookie v3.0.1 */
class Cookies {
    static defaultAttributes = {
        path: '/',
        expires: 90,
        sameSite: 'Lax'
    };
    // Read at set() time: at module load there is no page yet.
    static isSecureOrigin() {
        return typeof location !== 'undefined' && location.protocol === 'https:';
    }
    static converter = {
        read: function (value) {
            if (value[0] === '"') {
                value = value.slice(1, -1);
            }
            return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
        },
        write: function (value) {
            return encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
        }
    };
    static assign(target) {
        for (let i = 1; i < arguments.length; i++) {
            const source = arguments[i];
            for (const key in source) {
                target[key] = source[key];
            }
        }
        return target;
    }
    static set(key, value, attributes) {
        // Secure over https only. The browser drops a secure cookie on http, silently. Issue 12.
        attributes = this.assign({}, Cookies.defaultAttributes, { secure: Cookies.isSecureOrigin() }, attributes);
        if (typeof attributes.expires === 'number') {
            attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
        }
        if (attributes.expires) {
            attributes.expires = attributes.expires.toUTCString();
        }
        key = encodeURIComponent(key)
            .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
            .replace(/[()]/g, escape);
        let stringifiedAttributes = '';
        for (const attributeName in attributes) {
            if (!attributes[attributeName]) {
                continue;
            }
            stringifiedAttributes += '; ' + attributeName;
            if (attributes[attributeName] === true) {
                continue;
            }
            stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
        }
        return (document.cookie = key + '=' + Cookies.converter.write(value, key) + stringifiedAttributes);
    }
    static get(key) {
        if (typeof document === 'undefined' || (arguments.length && !key)) {
            return;
        }
        const cookies = document.cookie ? document.cookie.split('; ') : [];
        let jar = {};
        for (let i = 0; i < cookies.length; i++) {
            const parts = cookies[i].split('=');
            const value = parts.slice(1).join('=');
            try {
                const foundKey = decodeURIComponent(parts[0]);
                jar[foundKey] = Cookies.converter.read(value, foundKey);
                if (key === foundKey) {
                    break;
                }
            }
            catch (e) { }
        }
        return key ? jar[key] : jar;
    }
    static remove(name) {
        this.set(name, '', { expires: -1 });
    }
}
/* harmony default export */ const cookies = (Cookies);

;// ./src/lib/consent-store.ts
/* unused harmony import specifier */ var consent_store_Cookies;

/**
 * Denied for everything except strictly necessary - the fallback when there is no stored
 * choice. It needs no config file, which is what lets the loader push it synchronously.
 */
const BASELINE_CONSENTS = {
    strictly_necessary: 'granted'
};
/** The stored choice, or null when there is none to honour at this version. */
function readConsents(cookieName, version) {
    const cookie = cookies.get(cookieName);
    if (!cookie) {
        return null;
    }
    try {
        const stored = JSON.parse(cookie);
        // A flat value written before the nesting has no `consents`, and reads as no answer.
        if (stored === null || typeof stored !== 'object' || stored.version !== version || !stored.consents) {
            return null;
        }
        return { ...stored.consents };
    }
    catch {
        return null;
    }
}
function writeConsents(cookieName, version, consents) {
    consent_store_Cookies.set(cookieName, JSON.stringify({ version, consents }));
}
function clearConsents(cookieName) {
    consent_store_Cookies.remove(cookieName);
}

;// ./src/consentio-loader.ts
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


(function (global, doc, logger, customElementsRegistry) {
    const getResource = function (url) {
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
    };
    const getResources = function (urls) {
        return Promise.all(urls.map(url => getResource(url)));
    };
    const loaderScript = doc.querySelector('script[data-consentio-loader]');
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
        const dataLayer = global.dataLayer = global.dataLayer || [];
        function gtag() {
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
        let cookies = [];
        let resources = [];
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
        }
        catch (error) {
            logger.error('[Consentio Loader] Initialization failed:', error);
        }
    };
    consentioScript.onerror = async function () {
        logger.error('[Consentio Loader] Failed to load script:', consentioScript.src);
    };
})(window, document, console, customElements);

/******/ })()
;