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
/**
 * The gtag `set` key that carries the ad-click id across same-site links in the URL while
 * ad storage is denied. Off unless the site asks: it puts a click id in every internal link.
 */
const URL_PASSTHROUGH = 'url_passthrough';
// `null` for waitForUpdate when there is a stored choice: waiting for a banner that will
// never appear only delays the tag.
function toConsentDefault(signals, waitForUpdate) {
    return waitForUpdate === null ? { ...signals } : { ...signals, wait_for_update: waitForUpdate };
}

;// ./src/lib/cookies.ts
/*!
 * The cookie reader below is js-cookie v3.0.1, ported to TypeScript, cut down to what
 * Consentio uses and changed where a consent cookie needs different defaults.
 * https://github.com/js-cookie/js-cookie
 *
 * MIT License
 *
 * Copyright (c) 2018 Copyright 2018 Klaus Hartl, Fagner Brack, GitHub Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
class Cookies {
    // No expiry: how long an answer lasts is a setting, and consent-store.ts owns the number.
    static defaultAttributes = {
        path: '/',
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
    // A cookie is only removed by a call carrying the domain it was written with. Issue 39.
    static remove(name, attributes) {
        this.set(name, '', this.assign({}, attributes, { expires: -1 }));
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
/** How long a stored answer lasts when the site names none, in days. The one place it is written. */
const DEFAULT_LIFETIME_DAYS = 90;
/** Written and read back to ask the browser which domains it will take, then deleted. */
const PROBE_COOKIE = 'consentio_probe';
let probedHost = null;
let probedDomain = '';
/**
 * The broadest Domain this browser accepts for the page it is on, or '' when there is none.
 * Asked rather than computed: a label strip gets `co.uk` from `site.co.uk`, and doing it
 * properly needs the public suffix list. Issue 39.
 */
function sharedDomain() {
    const hostname = typeof location === 'undefined' ? '' : location.hostname;
    if (typeof hostname !== 'string' || !hostname) {
        return '';
    }
    if (hostname !== probedHost) {
        probedHost = hostname;
        probedDomain = probeSharedDomain(hostname);
    }
    return probedDomain;
}
function probeSharedDomain(hostname) {
    // `localhost` and an IP address carry no shared domain, and probing one says so slowly.
    if (hostname.indexOf('.') === -1 || hostname.indexOf(':') !== -1 || /^[\d.]+$/.test(hostname)) {
        return '';
    }
    const labels = hostname.split('.');
    for (let i = labels.length - 2; i >= 0; i--) {
        const candidate = labels.slice(i).join('.');
        // No expiry, so a probe the removal below somehow missed dies with the tab.
        consent_store_Cookies.set(PROBE_COOKIE, '1', { domain: candidate });
        const accepted = consent_store_Cookies.get(PROBE_COOKIE) === '1';
        consent_store_Cookies.remove(PROBE_COOKIE, { domain: candidate });
        if (accepted) {
            return candidate;
        }
    }
    return '';
}
function attributesFor(options) {
    const lifetime = typeof options.lifetime === 'number' && options.lifetime > 0
        ? options.lifetime
        : DEFAULT_LIFETIME_DAYS;
    const attributes = { expires: lifetime };
    const domain = options.shared ? sharedDomain() : '';
    if (domain) {
        attributes.domain = domain;
    }
    return attributes;
}
/** The stored choice, or null when there is none to honour at this version. */
function readConsents(cookieName, version) {
    const cookie = cookies.get(cookieName);
    if (!cookie) {
        return null;
    }
    try {
        const stored = JSON.parse(cookie);
        // A flat value written before the nesting has no `consents`, and reads as no answer.
        // Nothing tests the date: a value written before it existed is still an answer. Issue 38.
        if (stored === null || typeof stored !== 'object' || stored.version !== version || !stored.consents) {
            return null;
        }
        return { ...stored.consents };
    }
    catch {
        return null;
    }
}
/** Writes the answer. False means the browser did not keep it, which should not happen. Issue 39. */
function writeConsents(cookieName, version, consents, options = {}) {
    // Nothing reads the date yet, and a cookie that already exists cannot be given one. Issue 38.
    const value = JSON.stringify({ version, consents, date: new Date().toISOString() });
    // The other scope goes first, so flipping the setting cannot leave two cookies of one
    // name for the browser to send together.
    clearConsents(cookieName);
    consent_store_Cookies.set(cookieName, value, attributesFor(options));
    return consent_store_Cookies.get(cookieName) === value;
}
/** Both scopes, whichever is in use: a cookie is only removed at the Domain it was written at. Issue 39. */
function clearConsents(cookieName) {
    consent_store_Cookies.remove(cookieName);
    const domain = sharedDomain();
    if (domain) {
        consent_store_Cookies.remove(cookieName, { domain });
    }
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
    // Every failure names the address: the console is the only place a wrong URL shows. Issue 55.
    const getResource = function (url) {
        return fetch(url)
            .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
            .catch(error => { throw new Error(`${url} did not load: ${error instanceof Error ? error.message : error}`); });
    };
    const loaderScript = doc.querySelector('script[data-consentio-loader]');
    if (!loaderScript) {
        logger.error('[Consentio Loader] script not found');
        return;
    }
    const debug = loaderScript.dataset.debug === 'true';
    const loaderSrc = loaderScript.getAttribute('src');
    // Three files, one per concern.
    const settingsUrl = loaderScript.dataset.settingsUrl || null;
    const cookiesUrl = loaderScript.dataset.cookiesUrl || null;
    // `data-language="el"` is the published pack at this loader's own version; a url beats it.
    const languageCode = loaderScript.dataset.language || null;
    const languageUrl = loaderScript.dataset.languageUrl
        || (languageCode ? `https://cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio@${"1.0.1"}/dist/i18n/${languageCode}.json` : null);
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
        // NaN matches no stored answer, so a typo would ask every visitor on every page. Issue 54.
        let version = Number(loaderScript.dataset.version || 1);
        if (!Number.isInteger(version) || version < 1) {
            logger.warn(`[Consentio Loader] data-version "${loaderScript.dataset.version}" is not a whole number, so version 1 is used`);
            version = 1;
        }
        const waitForUpdate = Number(loaderScript.dataset.waitForUpdate || 500);
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
        // A `set` has to be on dataLayer before the tag manager reads it, which is why it is an
        // attribute and not a settings key.
        const urlPassthrough = loaderScript.dataset.urlPassthrough === 'true';
        if (urlPassthrough) {
            gtag('set', URL_PASSTHROUGH, true);
        }
        const publish = { cookieName, version, consents, consentGiven: stored !== null, urlPassthrough };
        // Carried across, not used: an attribute the tag leaves out must not beat a settings file.
        if (loaderScript.dataset.cookieLifetime) {
            publish.cookieLifetime = Number(loaderScript.dataset.cookieLifetime);
        }
        if (loaderScript.dataset.shareAcrossSubdomains !== undefined) {
            publish.shareAcrossSubdomains = loaderScript.dataset.shareAcrossSubdomains === 'true';
        }
        global.ConsentioDefault = publish;
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
        let settings = {};
        let language = {};
        let cookies = [];
        // Name and url, so what came back is read by name rather than by counting.
        const resources = [];
        const add = function (name, url) {
            if (!url) {
                return;
            }
            debug && logger.info(`[Consentio Loader] ${name} URL:`, url);
            resources.push([name, url]);
        };
        if (loaderScript.dataset.languageUrl && languageCode) {
            logger.warn('[Consentio Loader] both data-language and data-language-url are set - data-language-url wins');
        }
        add('settings', settingsUrl);
        add('language', languageUrl);
        add('cookies', cookiesUrl);
        try {
            if (resources.length > 0) {
                // Only the settings file can stop the banner: the other two cost their own
                // words or table, and the tag route already forgives them. Issue 53.
                const forgiven = {
                    language: ['the language file did not load, so the banner keeps its built-in English', {}],
                    cookies: ['the cookie table did not load, so the settings panel shows no table', []]
                };
                const results = await Promise.all(resources.map(([name, url]) => !forgiven[name]
                    ? getResource(url)
                    : getResource(url).catch((error) => {
                        logger.warn(`[Consentio Loader] ${forgiven[name][0]}: ${url}`, error);
                        return forgiven[name][1];
                    })));
                resources.forEach(([name], index) => {
                    const loaded = results[index];
                    debug && logger.info(`[Consentio Loader] ${name} loaded:`, loaded);
                    if (name === 'settings') {
                        settings = loaded;
                    }
                    if (name === 'language') {
                        language = loaded;
                    }
                    if (name === 'cookies') {
                        cookies = loaded;
                    }
                });
            }
            global.ConsentioInstance = new global.Consentio(settings, language, cookies, logger);
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