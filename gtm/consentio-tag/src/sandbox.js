// `scripts/gtm.mjs` fills __VERSION__ in from package.json when it composes the .tpl, so a
// released template loads the release it shipped in. Do not type a version here.
const url = 'https://cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio@__VERSION__/dist/consentio.min.js';

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
const JSON = require('JSON');
const Object = require('Object');

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

log('Consentio Tag =', data);

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


// ## Consent default ##
// Before injectScript, which is always async: a default pushed after it is already too late.

// A text field hands back a string once it has been edited.
const version = makeNumber(data.version);

const storedConsents = readStoredConsents(version);
const signals = toGoogleSignals(storedConsents || BASELINE_CONSENTS);
const adsDataRedaction = signals.ad_storage === 'denied';

if (!storedConsents) {
  signals.wait_for_update = WAIT_FOR_UPDATE;
}

setDefaultConsentState(signals);
gtagSet({ ads_data_redaction: adsDataRedaction });

log('consent default =', signals);


// ## Config Setup ##
function removeEmptyValues(obj){
  for(const key in obj){
    const value = obj[key];
    if(value === null || value === undefined || value === ""){
      Object.delete(obj, key);
    }
  }
}

function hasSelectedVariable(obj){
  return obj !== 'none';
}

const hasCookiesVariable = hasSelectedVariable(data.cookies);

const fromFields = data.textSource === 'custom';
const fromVariable = data.textSource === 'variable' && hasSelectedVariable(data.textsVariable);

// The variable holds a published <locale>.json unchanged: the words under `texts`, the
// four categories keyed under `consents`. The custom fields are flat on `data`.
const pack = fromVariable ? data.textsVariable : null;
const packTexts = pack && pack.texts ? pack.texts : {};
const packConsents = pack && pack.consents ? pack.consents : {};

function text(key) {
  if (fromVariable) {
    return packTexts[key];
  }
  if (fromFields) {
    return data[key];
  }
  return null;
}

function category(key, titleField, descriptionField) {
  if (!fromVariable) {
    return { title: text(titleField), description: text(descriptionField) };
  }
  const words = packConsents[key];
  return { title: words ? words.title : null, description: words ? words.description : null };
}

// A blank policyUrl in a pack means this language has no link; only a missing key falls
// back to the tag's own field.
const policyUrl = pack && pack.policyUrl !== undefined && pack.policyUrl !== null
  ? pack.policyUrl
  : data.policyUrl;

const strictlyNecessary = category('strictly_necessary', 'strictlyNecessaryTitle', 'strictlyNecessaryDescription');
const preferencesFunctionality = category('preferences_functionality', 'preferencesFunctionalityTitle', 'preferencesFunctionalityDescription');
const statisticsPerformance = category('statistics_performance', 'statisticsPerformanceTitle', 'statisticsPerformanceDescription');
const marketingAdvertising = category('marketing_advertising', 'marketingAdvertisingTitle', 'marketingAdvertisingDescription');

const config = {
  cookieName: COOKIE_NAME,
  version: version,
  debug: data.debug,
  consentRequired: data.consentRequired,
  hideFloatingButton: data.hideFloatingButton,
  policyUrl: policyUrl,
  texts: {
    barTitle: text('barTitle'),
    barDescription: text('barDescription'),
    buttonSettings: text('buttonSettings'),
    buttonSave: text('buttonSave'),
    buttonCancel: text('buttonCancel'),
    buttonAcceptAll: text('buttonAcceptAll'),
    buttonRejectAll: text('buttonRejectAll'),
    modalTitle: text('modalTitle'),
    modalDescription: text('modalDescription'),
    alwaysOnLabel: text('alwaysOnLabel'),
    policyLinkLabel: text('policyLinkLabel'),
    cookieTableHeaderName: text('cookieTableHeaderName'),
    cookieTableHeaderPurpose: text('cookieTableHeaderPurpose'),
    cookieTableHeaderProvenance: text('cookieTableHeaderProvenance'),
    cookieTableHeaderDuration: text('cookieTableHeaderDuration')
  },
  consents: [
    {
      key: 'strictly_necessary',
      title: strictlyNecessary.title,
      description: strictlyNecessary.description,
      alwaysOn: true,
      defaultState: 'granted'
    },
    {
      key: 'preferences_functionality',
      title: preferencesFunctionality.title,
      description: preferencesFunctionality.description,
      alwaysOn: false,
      defaultState: data.preferencesFunctionalityDefaultState
    },
    {
      key: 'statistics_performance',
      title: statisticsPerformance.title,
      description: statisticsPerformance.description,
      alwaysOn: false,
      defaultState: data.statisticsPerformanceDefaultState
    },
    {
      key: 'marketing_advertising',
      title: marketingAdvertising.title,
      description: marketingAdvertising.description,
      alwaysOn: false,
      defaultState: data.marketingAdvertisingDefaultState
    }
  ]
};
if (data.cookieLifetime) {
  config.cookieLifetime = makeNumber(data.cookieLifetime);
}
if (data.shareAcrossSubdomains) {
  config.shareAcrossSubdomains = true;
}

const cookies = hasCookiesVariable ? data.cookies : [];

removeEmptyValues(config.texts);
for(const consent of config.consents){
  removeEmptyValues(consent);
}

log('config =', config);
log('cookies =', cookies);


// ## load script ##

const scriptLoaded = function () {
  // Two arguments and the merged shape on purpose: the pinned bundle may be older than
  // this template, and it splits a config carrying `texts` itself.
  const consentioInstance = callInWindow('Consentio.Create', config, cookies);
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
