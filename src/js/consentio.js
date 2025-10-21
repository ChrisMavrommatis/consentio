/**
 * Consentio - Minimal and lightweight consent modal
 * 
 * Consentio is a lightweight, frontend-only consent management solution for privacy compliance.
 * It integrates seamlessly with tag manager and provides transparent consent handling.
 * 
 * @author ChrisMavrommatis
 * @license Apache-2.0
 */

class Consentio {
	static _defaultConfig = {
		cookieName: 'consentio',
		texts: {
			barTitle: 'Cookie Policy',
			barDescription: 'This site uses cookies to enhance your experience. We are assuming that you are okay with that, but you can change that by clicking at the settings button.',
			buttonSettings: 'Settings',
			buttonAcceptAll: 'Accept All'
		}
	};

	constructor(options = {}) {
		this.config = {
			...Consentio._defaultConfig,
			...options
		};

		this.el = null;
		this.init();
	}

	init() {
		this.el = document.createElement("consentio-wrapper");
		this.el.config = this.config;
		document.body.appendChild(this.el);
	}

}


export default Consentio;
