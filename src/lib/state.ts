import Cookies from './cookies.js'
import type { ConsentCategory, ConsentRecord } from '../types.js'


class ConsentioState {
	declare cookieName: string;
	declare version: number;
	declare consents: ConsentRecord;
	declare consentGiven: boolean;

	constructor(cookieName: string, version: number, consents: ConsentCategory[]) {
		this.cookieName = cookieName;
		this.version = version;
		// getCookieConsents returns null when there is nothing to honour; the block below backfills it.
		this.consents = this.getCookieConsents()!;
		this.consentGiven = this.consents !== null;
		if (!this.consentGiven) {
			// Just in case version didn't match
			Cookies.remove(this.cookieName);

			// Initialize Minimum consent state
			this.consents = {};
			consents.forEach((consent, index) => {
				this.consents[consent.key] = consent.alwaysOn ? 'granted' : consent.defaultState;
			});
		}


	}

	getCookieConsents(): ConsentRecord | null {
		const cookie = Cookies.get(this.cookieName);
		if (!cookie) {
			return null;
		}
		try {
			var state = JSON.parse(cookie) as ConsentRecord & { version?: number };
			if (state.version === this.version) {
				// remove version from object
				delete state.version;

				return state;
			}
			return null;
		}
		catch {
			return null;
		}
	}

	updateState(newState: ConsentRecord): void {
		this.consents = newState;
		// Issue 18 - a category keyed `version` clobbers the version here.
		var state = { version: this.version, ...this.consents };
		Cookies.set(this.cookieName, JSON.stringify(state));
		this.consentGiven = true;
	}

	acceptAll(): void {
		Array.from(Object.keys(this.consents)).forEach((key) => {
			this.consents[key] = 'granted';
		});
		// Issue 18 - as above.
		var state = { version: this.version, ...this.consents };
		Cookies.set(this.cookieName, JSON.stringify(state));
		this.consentGiven = true;
	}
}

export default ConsentioState
