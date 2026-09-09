import { clearConsents, readConsents, writeConsents } from './consent-store.js'
import type { ConsentCookieOptions } from './consent-store.js'
import type { ConsentCategory, ConsentRecord } from '../types.js'


class ConsentioState {
	declare cookieName: string;
	declare version: number;
	declare categories: ConsentCategory[];
	declare consents: ConsentRecord;
	declare consentGiven: boolean;
	declare cookie: ConsentCookieOptions;
	declare logger: Console | null;

	constructor(
		cookieName: string,
		version: number,
		consents: ConsentCategory[],
		cookie: ConsentCookieOptions = {},
		logger: Console | null = null
	) {
		this.cookieName = cookieName;
		this.version = version;
		// Kept because rejectAll has to know which categories stay granted.
		this.categories = consents;
		this.cookie = cookie;
		this.logger = logger;
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

	persist(): void {
		// A browser drops a cookie it will not take in silence, so the write is read back. Issue 39.
		const stored = writeConsents(this.cookieName, this.version, this.consents, this.cookie);
		this.consentGiven = true;
		if (stored) {
			return;
		}
		this.logger?.warn(`[Consentio] the answer did not read back - the browser did not keep the "${this.cookieName}" cookie. Nothing Consentio asks for should be refused, so look for something else on the page clearing cookies.`);
	}

	updateState(newState: ConsentRecord): void {
		this.consents = newState;
		this.persist();
	}

	acceptAll(): void {
		Array.from(Object.keys(this.consents)).forEach((key) => {
			this.consents[key] = 'granted';
		});
		this.persist();
	}

	rejectAll(): void {
		const alwaysOn = this.categories.filter((category) => category.alwaysOn).map((category) => category.key);
		Array.from(Object.keys(this.consents)).forEach((key) => {
			this.consents[key] = alwaysOn.includes(key) ? 'granted' : 'denied';
		});
		this.persist();
	}
}

export default ConsentioState
