import { clearConsents, readConsents, writeConsents } from './consent-store.js'
import type { ConsentCategory, ConsentRecord } from '../types.js'


class ConsentioState {
	declare cookieName: string;
	declare version: number;
	declare consents: ConsentRecord;
	declare consentGiven: boolean;

	constructor(cookieName: string, version: number, consents: ConsentCategory[]) {
		this.cookieName = cookieName;
		this.version = version;
		// readConsents returns null when there is nothing to honour; the block below backfills it.
		this.consents = readConsents(cookieName, version)!;
		this.consentGiven = this.consents !== null;
		if (!this.consentGiven) {
			// Just in case version didn't match
			clearConsents(this.cookieName);

			// Initialize Minimum consent state
			this.consents = {};
			consents.forEach((consent, index) => {
				this.consents[consent.key] = consent.alwaysOn ? 'granted' : consent.defaultState;
			});
		}


	}

	updateState(newState: ConsentRecord): void {
		this.consents = newState;
		writeConsents(this.cookieName, this.version, this.consents);
		this.consentGiven = true;
	}

	acceptAll(): void {
		Array.from(Object.keys(this.consents)).forEach((key) => {
			this.consents[key] = 'granted';
		});
		writeConsents(this.cookieName, this.version, this.consents);
		this.consentGiven = true;
	}
}

export default ConsentioState
