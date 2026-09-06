// Pinned, never floating: the CDN serves the git tree at this exact tag, so a range would
// let the bytes under a site change with no edit here. Tag first, then this.
const url = 'https://cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio@0.1.0/dist/consentio.min.js';

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

// The banner reads and writes this same cookie. It is fixed rather than a field: the
// get_cookies permission can only name a cookie known at publish time, and a name that
// could drift from the banner's is one more way the two readers disagree.
const COOKIE_NAME = 'consentio';

// Milliseconds Google holds tags for while the visitor answers. Only ever sent to
// someone who has not answered.
const WAIT_FOR_UPDATE = 500;

// Consent category to the Google signals it drives. The four categories are fixed, so
// this is the only map there is, and it has to stay identical to the banner's.
const SIGNAL_MAP = {
  strictly_necessary: ['security_storage'],
  preferences_functionality: ['functionality_storage', 'personalization_storage'],
  statistics_performance: ['analytics_storage'],
  marketing_advertising: ['ad_storage', 'ad_user_data', 'ad_personalization']
};

// No stored answer is one granted key, not four denied ones. Four denied categories would
// deny security_storage, which the other install route grants, and the two would disagree
// about the same visitor.
const BASELINE_CONSENTS = { strictly_necessary: 'granted' };

const RAN_KEY = 'consentio-tag-ran';

log('Consentio Tag =', data);

// A second trigger must not push another default or inject a second banner. The window key
// only appears once the injected script has run, so the page-lifetime flag covers the gap.
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
  // A version mismatch discards the whole value. So does a value with no consents key,
  // which is how one written before the categories were nested reads.
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

// A text field hands back a string once it has been edited, and the banner stores this
// value in the cookie the reader above compares against.
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

// Built-in English sends no strings at all, so the banner keeps its own and picks up any
// later correction to them.
const fromFields = data.textSource === 'custom';
const fromVariable = data.textSource === 'variable' && hasSelectedVariable(data.textsVariable);
const supplied = fromVariable ? data.textsVariable : data;

function text(key) {
  return fromFields || fromVariable ? supplied[key] : null;
}

function category(key, titleField, descriptionField) {
  const title = fromVariable ? (supplied[key] ? supplied[key].title : null) : text(titleField);
  const description = fromVariable ? (supplied[key] ? supplied[key].description : null) : text(descriptionField);
  return { title: title, description: description };
}

const strictlyNecessary = category('strictly_necessary', 'strictlyNecessaryTitle', 'strictlyNecessaryDescription');
const preferencesFunctionality = category('preferences_functionality', 'preferencesFunctionalityTitle', 'preferencesFunctionalityDescription');
const statisticsPerformance = category('statistics_performance', 'statisticsPerformanceTitle', 'statisticsPerformanceDescription');
const marketingAdvertising = category('marketing_advertising', 'marketingAdvertisingTitle', 'marketingAdvertisingDescription');

const config = {
  cookieName: COOKIE_NAME,
  version: version,
  debug: data.debug,
  consentRequired: data.consentRequired,
  texts: {
    barTitle: text('barTitle'),
    barDescription: text('barDescription'),
    buttonSettings: text('buttonSettings'),
    buttonSave: text('buttonSave'),
    buttonCancel: text('buttonCancel'),
    buttonAcceptAll: text('buttonAcceptAll'),
    modalTitle: text('modalTitle'),
    modalDescription: text('modalDescription'),
    alwaysOnLabel: text('alwaysOnLabel'),
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
const cookies = hasCookiesVariable ? data.cookies : [];

removeEmptyValues(config.texts);
for(const consent of config.consents){
  removeEmptyValues(consent);
}

log('config =', config);
log('cookies =', cookies);


// ## load script ##

const scriptLoaded = function () {
  const consentioInstance = callInWindow('Consentio.Create', config, cookies);
  // The banner sets this too. Setting it here as well is what makes the guard above work
  // against an older pinned bundle.
  setInWindow('ConsentioInstance', consentioInstance, true);
  data.gtmOnSuccess();
};

const scriptNotLoaded = function () {
  log('Consentio Tag: the banner script did not load');
  data.gtmOnFailure();
};

injectScript(url, scriptLoaded, scriptNotLoaded, url);
