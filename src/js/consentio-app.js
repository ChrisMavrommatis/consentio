import styles from '../scss/consentio.scss';

import TemplateRenderer from './template-renderer.js';

import barTemplate from '../html/consentio-bar.html';
import modalTemplate from '../html/consentio-modal.html';
import floatingButtonTemplate from '../html/consentio-floating-button.html';

class ConsentioAppElement extends HTMLElement {

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

		this.bar = this.renderNode(barTemplate, {
			barTitle: this.config.texts.barTitle,
			barDescription: this.config.texts.barDescription,
			buttonSettings: this.config.texts.buttonSettings,
			buttonAcceptAll: this.config.texts.buttonAcceptAll,
		});
		this._shadow.appendChild(this.bar);

		this.modal = this.renderNode(modalTemplate, {

		});
		this._shadow.appendChild(this.modal);

		this.floatingButton = this.renderNode(floatingButtonTemplate, {

		});
		this._shadow.appendChild(this.floatingButton);

	}

	renderNode(template, data) {
		const htmlString = TemplateRenderer.render(template, data);
		const templateElement = document.createElement('template');
		templateElement.innerHTML = htmlString.trim();
		return templateElement.content.firstChild;
	}


	// public api

}

export default ConsentioAppElement;
