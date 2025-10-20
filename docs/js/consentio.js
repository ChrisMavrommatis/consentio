
/**
 * Consentio - Minimalist Consent Modal
 * 
 * A lightweight, frontend-only consent management solution for privacy compliance.
 * Integrates seamlessly with tag manager and provides transparent consent handling.
 * 
 * @author ChrisMavrommatis
 * @license Apache-2.0
 */
class ConsentioBarElement extends HTMLElement {

	constructor() {
		super();
		this._shadow = this.attachShadow({ mode: 'closed' });
		this.isRendered = false;
		this._texts = {
		};
		this._els = {
			required: null,
			bar: null
		}
	}

	get texts() {
		return this._texts;
	}

	set texts(value) {
		this._texts = { ...this._texts, ...value };
		if (this.isRendered) {
			this.render();
		}
	}

	connectedCallback() {
		this.render();
		this.isRendered = true;
	}



	render() {
		this._shadow.innerHTML = `
			<div class="container">
				<div class="main">
					<h5 data-role="bar-title">${this._texts.barTitle}</h5>
					<p data-role="bar-description">
						${this._texts.barDescription}
					</p>
				</div>
				<div class="actions">
					<button data-role="bar-button-settings">${this._texts.buttonSettings}</button>
					<button data-role="bar-button-accept-all">${this._texts.buttonAcceptAll}</button>
				</div>
			</div>
		`;
	}


	// public api

}


/**
 * Consentio - Minimalist Consent Modal
 * 
 * A lightweight, frontend-only consent management solution for privacy compliance.
 * Integrates seamlessly with tag manager and provides transparent consent handling.
 * 
 * @author ChrisMavrommatis
 * @license Apache-2.0
 */
class ConsentioElement extends HTMLElement {

	constructor() {
		super();
		this._shadow = this.attachShadow({ mode: 'closed' });
		this.isRendered = false;
		this.isVisible = false;
		this._config = {};
		this._els = {
			required: null,
			bar: null
		}
	}

	get config() {
		return this._config;
	}

	set config(value) {
		this._config = { ...this._config, ...value };
		if (this.isRendered) {
			this.render();
		}
	}

	connectedCallback() {
		this.render();
		this.isRendered = true;
	}

	render() {
		// create element
		this._els.required = document.createElement("consentio-required");
		this._els.bar = document.createElement("consentio-bar");
		this._els.bar.texts = this._config.texts;
		// append elements

		this._shadow.appendChild(this._els.required);
		this._shadow.appendChild(this._els.bar);
	}


	// public api

}

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


