/**
 * Consentio - Minimalist Consent Modal
 * 
 * A lightweight, frontend-only consent management solution for privacy compliance.
 * Integrates seamlessly with tag manager and provides transparent consent handling.
 * 
 * @author ChrisMavrommatis
 * @license Apache-2.0
 */
class Consentio {
	constructor(options = {}) {
		this.options = {
			cookieName: 'consentio',
			texts: {
				barTitle: 'Cookie Policy',
				barDescription: 'This site uses cookies to enhance your experience. We are assuming that you are okay with that, but you can change that by clicking at the settings button.',
				buttonSettings: 'Settings',
				buttonAcceptAll: 'Accept All'
			}
		};
		this.el = null;
		this.init();
	}

	init() {
		this.el = document.createElement("consentio-el");
		this.el.config = this.options;
		document.body.appendChild(this.el);
	}

}

// iifee
(function (global, document) {
	customElements.define('consentio-el', ConsentioElement);
	customElements.define('consentio-bar', ConsentioBarElement);
	global.Consentio = new Consentio({

	});

})(window, document);


