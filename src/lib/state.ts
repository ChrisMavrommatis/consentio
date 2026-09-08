import { clearConsents, readConsents, writeConsents } from './consent-store.js'
import type { ConsentCategory, ConsentRecord } from '../types.js'


class ConsentioState {
	declare cookieName: string;
	declare version: number;
	declare categories: ConsentCategory[];
	declare consents: ConsentRecord;
	declare consentGiven: boolean;

	constructor(cookieName: string, version: number, consents: ConsentCategory[]) {
		this.cookieName = cookieName;
		this.version = version;
		// Kept because rejectAll has to know which categories stay granted.
		this.categories = consents;
		// Null when there is nothing to honour at this version; the block below backfills it.
		this.consents = readConsents(cookieName, version)!;
		this.consentGiven = this.consents !== null;
		if (!this.consentGiven) {
			// A stored value at the wrong version is discarded, not merged.
			clearConsents(this.cookieName);

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

	rejectAll(): void {
		const alwaysOn = this.categories.filter((category) => category.alwaysOn).map((category) => category.key);
		Array.from(Object.keys(this.consents)).forEach((key) => {
			this.consents[key] = alwaysOn.includes(key) ? 'granted' : 'denied';
		});
		writeConsents(this.cookieName, this.version, this.consents);
		this.consentGiven = true;
	}
}

export default ConsentioState
