// `scripts/gtm.mjs` fills the version in from package.json when it composes the .tpl, so a
// released template loads the release it shipped in. Do not type a version here.
const url = 'https://cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio@__VERSION__/dist/consentio.min.js';
// The published language packs, at the same release as the bundle so the two cannot disagree.
const packBaseUrl = 'https://cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio@__VERSION__/dist/i18n/';

const log = require('logToConsole');
const injectScript = require('injectScript');
const callInWindow = require('callInWindow');
const setInWindow = require('setInWindow');
const copyFromWindow = require('copyFromWindow');
const getCookieValues = require('getCookieValues');
const setDefaultConsentState = require('setDefaultConsentState');
const gtagSet = require('gtagSet');
const templateStorage = require('templateStorage');
const makeNumber = require('makeNumber');
const getType = require('getType');
const JSON = require('JSON');

// Not a field: the get_cookies permission can only name a cookie known at publish time.
const COOKIE_NAME = 'consentio';

// Milliseconds Google holds tags for while the visitor answers.
const WAIT_FOR_UPDATE = 500;

// Has to stay identical to the banner's map.
const SIGNAL_MAP = {
  strictly_necessary: ['security_storage'],
  preferences_functionality: ['functionality_storage', 'personalization_storage'],
  statistics_performance: ['analytics_storage'],
  marketing_advertising: ['ad_storage', 'ad_user_data', 'ad_personalization']
};

// No stored answer is one granted key, not four denied: all-denied would deny
// security_storage, which the direct install route grants for the same visitor.
const BASELINE_CONSENTS = { strictly_necessary: 'granted' };

const RAN_KEY = 'consentio-tag-ran';

// What a published <locale>.js assigns the pack to when the tag loads one from the CDN.
const PACK_GLOBAL = 'ConsentioLanguage';

log('Consentio Tag =', data);

// The loader sets this on its blocking pass, before the container has even loaded, so it
// is the one sign of the direct route that is visible this early.
if (copyFromWindow('ConsentioDefault')) {
  log('Consentio Tag: the direct install route is on this page, so the tag stands down');
  data.gtmOnSuccess();
  return;
}

// The window key only appears once the injected script has run, so the flag covers the gap.
if (templateStorage.getItem(RAN_KEY) || copyFromWindow('ConsentioInstance')) {
  log('Consentio Tag: already initialized');
  data.gtmOnSuccess();
  return;
}
templateStorage.setItem(RAN_KEY, true);


// ## Stored consent ##

function readStoredConsents(version) {
  const values = getCookieValues(COOKIE_NAME);
  if (!values || values.length === 0) {
    return null;
  }
  // Malformed JSON returns undefined here rather than throwing.
  const stored = JSON.parse(values[0]);
  if (!stored || typeof stored !== 'object') {
    return null;
  }
  // No consents key is how a value written before the categories were nested reads.
  if (stored.version !== version || !stored.consents) {
    return null;
  }
  return stored.consents;
}

function toGoogleSignals(consents) {
  // Every signal is named on every push. One left out keeps whatever it had.
  const signals = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'denied'
  };
  for (const key in SIGNAL_MAP) {
    if (consents[key] !== 'granted') {
      continue;
    }
    const names = SIGNAL_MAP[key];
    for (let i = 0; i < names.length; i++) {
      signals[names[i]] = 'granted';
    }
  }
  return signals;
}


// ## The three inputs ##
// Each picker takes the same file the loader fetches: JSON text from a Constant, or the
// parsed value from any other variable. None is the built-in default.

function readInput(value) {
  if (value === 'none') {
    return undefined;
  }
  if (getType(value) === 'string') {
    // Malformed JSON returns undefined here rather than throwing.
    value = JSON.parse(value);
  }
  return value;
}

function readObject(value, what) {
  value = readInput(value);
  if (getType(value) !== 'object') {
    if (value !== undefined && value !== null) {
      log('Consentio Tag: the ' + what + ' is not a JSON object, so it is ignored');
    }
    return {};
  }
  return value;
}

const settings = readObject(data.settings, 'Settings');

// The get_cookies permission names one cookie at publish time, so a settings file naming
// another would leave this tag reading a cookie the banner never writes.
if (settings.cookieName !== undefined && settings.cookieName !== COOKIE_NAME) {
  log('Consentio Tag: cookieName is fixed to ' + COOKIE_NAME + ' on this route, so ' + settings.cookieName + ' is ignored');
}
settings.cookieName = COOKIE_NAME;

// The banner defaults to 1; the tag has to agree, or it discards every stored answer.
const version = settings.version === undefined ? 1 : makeNumber(settings.version);

// The cookie table is one file however it arrives, and it is an array or nothing.
function readCookies() {
  const value = readInput(data.cookies);
  if (getType(value) !== 'array') {
    if (value !== undefined && value !== null) {
      log('Consentio Tag: the Cookie table is not a JSON array, so the settings panel shows no table');
    }
    return [];
  }
  return value;
}

const cookies = readCookies();

const fromVariable = data.languageSource === 'variable';
const fromPack = data.languageSource === 'pack' && !!data.languagePack;


// ## Consent default ##
// Before injectScript, which is always async: a default pushed after it is already too late.

const storedConsents = readStoredConsents(version);
const signals = toGoogleSignals(storedConsents || BASELINE_CONSENTS);
const adsDataRedaction = signals.ad_storage === 'denied';

if (!storedConsents) {
  signals.wait_for_update = WAIT_FOR_UPDATE;
}

setDefaultConsentState(signals);
gtagSet({ ads_data_redaction: adsDataRedaction });
// Off unless the settings file says so: it puts a click id in every internal link.
if (settings.urlPassthrough === true) {
  gtagSet({ url_passthrough: true });
}

log('consent default =', signals);


// ## load script ##

// A pack is a published <locale>.json unchanged, whether a variable held it, the page
// carried it or the CDN served it. Built-in English is an empty object.
function loadBanner(language) {
  log('settings =', settings);
  log('language =', language);
  log('cookies =', cookies);

  const scriptLoaded = function () {
    // Three objects, one per concern - the shape the loader sends. The template loads
    // the release it shipped in, so the bundle always speaks it.
    const consentioInstance = callInWindow('Consentio.Create', settings, language, cookies);
    // The banner sets this too; setting it here is what makes the guard above work against
    // an older pinned bundle.
    setInWindow('ConsentioInstance', consentioInstance, true);
    data.gtmOnSuccess();
  };

  const scriptNotLoaded = function () {
    log('Consentio Tag: the banner script did not load');
    data.gtmOnFailure();
  };

  injectScript(url, scriptLoaded, scriptNotLoaded, url);
}

if (!fromPack) {
  loadBanner(readObject(fromVariable ? data.languageVariable : 'none', 'Language pack'));
  return;
}

// The pack first, then the bundle either way: a pack that does not load must not cost the
// visitor the banner.
const packUrl = packBaseUrl + data.languagePack + '.js';

const packNotLoaded = function () {
  log('Consentio Tag: the language pack did not load, so the banner keeps its built-in English', packUrl);
  loadBanner({});
};

const packLoaded = function () {
  const pack = copyFromWindow(PACK_GLOBAL);
  if (!pack) {
    packNotLoaded();
    return;
  }
  loadBanner(pack);
};

injectScript(packUrl, packLoaded, packNotLoaded, packUrl);
