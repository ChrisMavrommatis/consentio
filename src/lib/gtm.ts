import { ADS_DATA_REDACTION, DEFAULT_SIGNAL_MAP, needsAdsDataRedaction, toGoogleSignals } from './consent-signals.js';
import type { SignalMap } from './consent-signals.js';
import type ConsentioLogger from './logger.js';
import type { ConsentRecord } from '../types.js';

/**
 * The asynchronous half. It only ever pushes `consent update` - the default belongs to
 * the loader, which pushes it before the tag manager. Anything pushed from here has
 * already missed the tag's read of the consent defaults.
 */
class ConsentioGTM {
	declare logger: ConsentioLogger | null;
	declare dataLayer: unknown[];
	declare signalMap: SignalMap;

	constructor(logger: ConsentioLogger | null, signalMap: SignalMap = DEFAULT_SIGNAL_MAP) {
		this.logger = logger;
		this.signalMap = signalMap;
		this.dataLayer = window.dataLayer = window.dataLayer || [];
	}

	updateConsent(state: ConsentRecord): void {
		const signals = toGoogleSignals(state, this.signalMap);
		this.push('consent', 'update', signals);
		// Pushed either way, so that revoking marketing turns redaction back on rather
		// than leaving it wherever the previous push left it.
		this.push('set', ADS_DATA_REDACTION, needsAdsDataRedaction(signals));
		this.logger?.log('[Consentio:GTM] Consent updated', 'info');
	}

	// Parameterless on purpose: `arguments` is forwarded verbatim to keep the gtag shape.
	push(...args: unknown[]): void;
	push(): void {
		this.dataLayer.push(arguments);
		this.logger?.log(`[Consentio:GTM] Pushed event: ${arguments[0]}`, 'info');
	}
}

export default ConsentioGTM;
