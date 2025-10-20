
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
