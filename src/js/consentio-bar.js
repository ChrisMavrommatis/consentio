
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
