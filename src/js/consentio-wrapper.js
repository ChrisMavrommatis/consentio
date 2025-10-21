import styles from '../scss/consentio.scss';

import TemplateRenderer from './template-renderer.js';

import barTemplate from '../html/consentio-bar.html';
import modalTemplate from '../html/consentio-modal.html';
import floatingButtonTemplate from '../html/consentio-floating-button.html';

class ConsentioWrapperElement extends HTMLElement {

	constructor() {
		super();
		this._shadow = this.attachShadow({ mode: 'closed' });
		this.isRendered = false;
		this.isVisible = false;
		this._config = {};
		this.required = null;
		this.bar = null;
		this.modal = null;
		this.floatingButton = null;
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
		const style = document.createElement('style');
		style.textContent = styles;
		this._shadow.appendChild(style);
		// create element
		// append elements

		this.required = document.createElement("consentio-required");
		this._shadow.appendChild(this.required);

		this._shadow.innerHTML += TemplateRenderer.render(barTemplate, {
			barTitle: this.config.texts.barTitle,
			barDescription: this.config.texts.barDescription,
			buttonSettings: this.config.texts.buttonSettings,
			buttonAcceptAll: this.config.texts.buttonAcceptAll,
		});
	}


	// public api

}

export default ConsentioWrapperElement;
