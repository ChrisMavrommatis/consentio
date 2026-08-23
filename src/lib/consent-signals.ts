import type { ConsentCategory, ConsentRecord, ConsentState } from '../types.js';

/**
 * The seven signals Google Consent Mode reads. **This is the only file in which a Google
 * signal name appears.** Anything else pushed under `consent` is dropped silently, which
 * is why a wrong name looks like it works.
 */
export const GOOGLE_SIGNALS = [
	'ad_storage',
	'ad_user_data',
	'ad_personalization',
	'analytics_storage',
	'functionality_storage',
	'personalization_storage',
	'security_storage'
] as const;

export type GoogleSignal = typeof GOOGLE_SIGNALS[number];

export type ConsentSignals = Record<GoogleSignal, ConsentState>;

/** Consent category key -> the signals that category drives. */
export type SignalMap = Record<string, readonly GoogleSignal[]>;

/**
 * What the four built-in categories map to. The core uses this as-is: it has no config
 * file, so it has nothing else to go on.
 */
export const DEFAULT_SIGNAL_MAP: SignalMap = {
	strictly_necessary: ['security_storage'],
	preferences_functionality: ['functionality_storage', 'personalization_storage'],
	statistics_performance: ['analytics_storage'],
	marketing_advertising: ['ad_storage', 'ad_user_data', 'ad_personalization']
};

/**
 * Build the map from the configured categories, so a category a site adds can reach a
 * signal instead of falling into a hardcoded four-key lookup and reaching nothing. A
 * category that names no `signals` falls back to the built-in mapping for its key, which
 * is what lets a site override copy without restating the routing.
 */
export function signalMapFrom(categories: readonly ConsentCategory[]): SignalMap {
	const map: SignalMap = {};
	for (const category of categories) {
		const signals = category.signals ?? DEFAULT_SIGNAL_MAP[category.key];
		if (signals) {
			map[category.key] = signals;
		}
	}
	return map;
}

export function toGoogleSignals(consents: ConsentRecord, map: SignalMap = DEFAULT_SIGNAL_MAP): ConsentSignals {
	// Deny wins. A signal is granted only when every category routed to it is granted,
	// which is the safe reading when a site points two categories at one signal, and the
	// only reading that keeps an unmapped signal denied.
	const state = (signal: GoogleSignal): ConsentState => {
		const sources = Object.keys(map).filter((key) => map[key].includes(signal));
		return sources.length > 0 && sources.every((key) => consents[key] === 'granted') ? 'granted' : 'denied';
	};

	// Every signal is named, one line each, on purpose. The return type is
	// Record<GoogleSignal, ConsentState>, so deleting a line here fails the build - and a
	// signal left out of a `consent update` keeps its previous value, which is how a
	// category that was granted and then revoked stays granted.
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
export const ADS_DATA_REDACTION = 'ads_data_redaction';

export function needsAdsDataRedaction(signals: ConsentSignals): boolean {
	return signals.ad_storage === 'denied';
}

export type ConsentDefault = ConsentSignals & { wait_for_update?: number };

/**
 * The payload for a `consent default` push. Pass `null` for `waitForUpdate` when there is
 * a stored choice: `wait_for_update` only helps a first-time visitor, and making the tag
 * wait for a banner that will never appear only delays it.
 */
export function toConsentDefault(signals: ConsentSignals, waitForUpdate: number | null): ConsentDefault {
	return waitForUpdate === null ? { ...signals } : { ...signals, wait_for_update: waitForUpdate };
}
