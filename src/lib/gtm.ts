import type ConsentioLogger from './logger.js';
import type { ConsentRecord, ConsentState } from '../types.js';

class ConsentioGTM {
	declare logger: ConsentioLogger | null;
	declare dataLayer: unknown[];

	constructor(logger: ConsentioLogger | null) {
		this.logger = logger;
		this.dataLayer = window.dataLayer = window.dataLayer || [];
	}

	// Issue 1 - this is the only `consent default` push in the codebase and it runs after
	// two fetches and a DOM insert, long after the tag manager has read consent. The fix
	// is the core split in brief 3, not a change here.
	defaultConsent(state: ConsentRecord): void {
		const gtmConsents = this.mapConsentsToGTM(state);
		this.push('consent', 'default', gtmConsents);
		this.logger?.log('[Consentio:GTM] Default consent set', 'info');
	}

	updateConsent(state: ConsentRecord): void {
		const gtmConsents = this.mapConsentsToGTM(state);
		this.push('consent', 'update', gtmConsents);
		this.logger?.log('[Consentio:GTM] Consent updated', 'info');
	}

	// Issues 2, 4 and 5 all live in this object literal: `essential_storage` is not a
	// Google signal, the keys are hardcoded to the four default categories, and the seven
	// real signals are not all named on every push. Brief 3 replaces it.
	mapConsentsToGTM(state: ConsentRecord): Record<string, ConsentState> {
		return {
			essential_storage: state['strictly_necessary'],
			security_storage: state['strictly_necessary'],
			functionality_storage: state['preferences_functionality'],
			personalization_storage: state['preferences_functionality'],
			analytics_storage: state['statistics_performance'],
			ad_storage: state['marketing_advertising'],
			ad_user_data: state['marketing_advertising'],
			ad_personalization: state['marketing_advertising']
		};

	}

	// The overload declares the variadic call; the implementation forwards `arguments`
	// verbatim to the dataLayer, so it stays parameterless and keeps the gtag shape.
	push(...args: unknown[]): void;
	push(): void {
		this.dataLayer.push(arguments);
		this.logger?.log(`[Consentio:GTM] Pushed event: ${arguments[0]}`, 'info');
	}
}

export default ConsentioGTM;
