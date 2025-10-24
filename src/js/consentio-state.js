import Cookies from './cookies.js'


class ConsentioState {
	constructor(cookieName, version, consents) {
		this.cookieName = cookieName;
		this.version = version;
		this.consents = this.getCookieConsents();
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

	getCookieConsents() {
		const cookie = Cookies.get(this.cookieName);
		if (!cookie) {
			return null;
		}
		try {
			var state = JSON.parse(cookie);
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
}

export default ConsentioState
