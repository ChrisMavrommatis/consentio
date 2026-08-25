import type { ConsentRecord, ConsentState } from '../types.js';

// Google drops an unknown key silently, which is why a wrong name looks like it works.
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

// The four are fixed, so this is the only map there is.
export const DEFAULT_SIGNAL_MAP: SignalMap = {
	strictly_necessary: ['security_storage'],
	preferences_functionality: ['functionality_storage', 'personalization_storage'],
	statistics_performance: ['analytics_storage'],
	marketing_advertising: ['ad_storage', 'ad_user_data', 'ad_personalization']
};

export function toGoogleSignals(consents: ConsentRecord, map: SignalMap = DEFAULT_SIGNAL_MAP): ConsentSignals {
	// Deny wins, so a signal nothing is routed to stays denied.
	const state = (signal: GoogleSignal): ConsentState => {
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
export const ADS_DATA_REDACTION = 'ads_data_redaction';

export function needsAdsDataRedaction(signals: ConsentSignals): boolean {
	return signals.ad_storage === 'denied';
}

export type ConsentDefault = ConsentSignals & { wait_for_update?: number };

// `null` for waitForUpdate when there is a stored choice: waiting for a banner that will
// never appear only delays the tag.
export function toConsentDefault(signals: ConsentSignals, waitForUpdate: number | null): ConsentDefault {
	return waitForUpdate === null ? { ...signals } : { ...signals, wait_for_update: waitForUpdate };
}
