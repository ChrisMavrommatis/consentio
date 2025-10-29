class ConsentioGTM {
	constructor(logger) {
		this.logger = logger;
		this.dataLayer = window.dataLayer = window.dataLayer || [];
	}

	defaultConsent(state) {
		const gtmConsents = this.mapConsentsToGTM(state);
		this.push('consent', 'default', gtmConsents);
		this.logger?.log('[Consentio:GTM] Default consent set', 'info');
	}

	updateConsent(state) {
		const gtmConsents = this.mapConsentsToGTM(state);
		this.push('consent', 'update', gtmConsents);
		this.logger?.log('[Consentio:GTM] Consent updated', 'info');
	}

	mapConsentsToGTM(state) {
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

	push() {
		this.dataLayer.push(arguments);
		this.logger?.log(`[Consentio:GTM] Pushed event: ${arguments[0]}`, 'info');
	}
}

export default ConsentioGTM;
