import styles from '../scss/consentio.scss';

import TemplateRenderer from './template-renderer.js';

import barTemplate from '../html/consentio-bar.html';
import modalTemplate from '../html/consentio-modal.html';
import consentItemTemplate from '../html/consent-item.html';
import floatingButtonTemplate from '../html/consentio-floating-button.html';
import { showElement, hideElement } from './utils.js';

class ConsentioAppElement extends HTMLElement {

	constructor() {
		super();
		this._shadow = this.attachShadow({ mode: 'closed' });
		this.isRendered = false;
		this.isVisible = false;
		this._config = {};
		this._state = {};
		this._cookies = [];
		this.required = null;
		this.bar = null;
		this.modal = null;
		this.strictly_necessary = null;
		this.preferences_functionality = null;
		this.statistics_performance = null;
		this.marketing_advertising = null;
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

	get state() {
		return this._state;
	}

	set state(value) {
		this._state = { ...this._state, ...value };
	}

	get cookies() {
		return this._cookies;
	}

	set cookies(value) {
		this._cookies = [...this._cookies, ...value];
	}

	connectedCallback() {
		this.render();
		this.initState();
		this.isRendered = true;
	}

	render() {
		if (!this.isRendered) {
			const style = document.createElement('style');
			style.textContent = styles;
			this._shadow.appendChild(style);

			this.required = document.createElement("consentio-required");
			this._shadow.appendChild(this.required);
		}

		const newBar = this.renderNode(barTemplate, {
			barTitle: this.config.texts.barTitle,
			barDescription: this.config.texts.barDescription,
			buttonSettings: this.config.texts.buttonSettings,
			buttonAcceptAll: this.config.texts.buttonAcceptAll,
		});

		const cookieTableHeaders = {
			cookieName: this.config.texts.cookieTableHeaderName,
			cookiePurpose: this.config.texts.cookieTableHeaderPurpose,
			cookieProvenance: this.config.texts.cookieTableHeaderProvenance,
			cookieDuration: this.config.texts.cookieTableHeaderDuration
		};
		this.addOrReplace(newBar, this.bar);
		this.bar = newBar;

		this.strictly_necessary = this.renderNode(consentItemTemplate, {
			consentKey: 'strictly_necessary',
			consentTitle: this.config.texts.strictlyNecessaryTitle,
			consentDescription: this.config.texts.strictlyNecessaryDescription,
		});
		this.strictly_necessary.alwaysOn = this.config.texts.alwaysOnLabel;
		this.strictly_necessary.tableHeaders = cookieTableHeaders;

		this.preferences_functionality = this.renderNode(consentItemTemplate, {
			consentKey: 'preferences_functionality',
			consentTitle: this.config.texts.preferencesTitle,
			consentDescription: this.config.texts.preferencesDescription,
		});
		this.statistics_performance = this.renderNode(consentItemTemplate, {
			consentKey: 'statistics_performance',
			consentTitle: this.config.texts.statisticsTitle,
			consentDescription: this.config.texts.statisticsDescription,
		});
		this.marketing_advertising = this.renderNode(consentItemTemplate, {
			consentKey: 'marketing_advertising',
			consentTitle: this.config.texts.marketingTitle,
			consentDescription: this.config.texts.marketingDescription,
		});


		const newModal = this.renderNode(modalTemplate, {
			modalTitle: this.config.texts.modalTitle,
			modalDescription: this.config.texts.modalDescription,
			buttonSave: this.config.texts.buttonSave,
			buttonCancel: this.config.texts.buttonCancel,
		});
		const consentList = newModal.querySelector('consentio-consent-items');
		consentList.appendChild(this.strictly_necessary);
		consentList.appendChild(this.preferences_functionality);
		consentList.appendChild(this.statistics_performance);
		consentList.appendChild(this.marketing_advertising);

		this.addOrReplace(newModal, this.modal);
		this.modal = newModal;


		if (!this.isRendered) {
			this.floatingButton = this.renderNode(floatingButtonTemplate, {

			});
			this._shadow.appendChild(this.floatingButton);
		}
	}

	initState() {
		hideElement(this.required);
		hideElement(this.bar);
		hideElement(this.modal);
		hideElement(this.floatingButton);
		if (this.state.consentGiven) {
			showElement(this.floatingButton);
			return;
		}
		showElement(this.bar)
	}

	renderNode(template, data) {
		const htmlString = TemplateRenderer.render(template, data);
		const templateElement = document.createElement('template');
		templateElement.innerHTML = htmlString.trim();
		return templateElement.content.firstChild;
	}

	addOrReplace(newEl, oldEl) {
		if (!this.isRendered) {
			this._shadow.appendChild(newEl);
		}
		else {
			this._shadow.replaceChild(newEl, oldEl);
		}
	}


	// public api

}

export default ConsentioAppElement;
