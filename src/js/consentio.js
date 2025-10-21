/**
 * Consentio - Minimal and lightweight consent modal
 * 
 * Consentio is a lightweight, frontend-only consent management solution for privacy compliance.
 * It integrates seamlessly with tag manager and provides transparent consent handling.
 * 
 * @author ChrisMavrommatis
 * @license Apache-2.0
 */

import ConsentioAppElement from './consentio-app.js';
import ConsentioBarElement from './consentio-bar.js';
import ConsentioRequiredElement from './consentio-required.js';
import ConsentioFloatingButtonElement from './consentio-floating-button.js';
import ConsentioModalElement from './consentio-modal.js';

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
		this.defineCustomElements();
		this.init();
	}

	init() {
		this.el = document.createElement("consentio-app");
		this.el.config = this.config;
		document.body.appendChild(this.el);
	}

	defineCustomElements() {
		customElements.define('consentio-app', ConsentioAppElement);
		customElements.define('consentio-bar', ConsentioBarElement);
		customElements.define('consentio-required', ConsentioRequiredElement);
		customElements.define('consentio-floating-button', ConsentioFloatingButtonElement);
		customElements.define('consentio-modal', ConsentioModalElement);
	}

}


export default Consentio;
