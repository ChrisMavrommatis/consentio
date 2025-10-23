import styles from '../scss/consentio.scss';

import TemplateRenderer from './template-renderer.js';

import barTemplate from '../html/consentio-bar.html';
import modalTemplate from '../html/consentio-modal.html';
import consentItemTemplate from '../html/consent-item.html';
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

	connectedCallback() {
		this.render();
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

		var newBar = this.renderNode(barTemplate, {
			barTitle: this.config.texts.barTitle,
			barDescription: this.config.texts.barDescription,
			buttonSettings: this.config.texts.buttonSettings,
			buttonAcceptAll: this.config.texts.buttonAcceptAll,
		});

		var cookieTableHeaders = {
			cookieName: this.config.texts.cookieTableHeaderName,
			cookiePurpose: this.config.texts.cookieTableHeaderPurpose,
			cookieProvenance: this.config.texts.cookieTableHeaderProvenance,
			cookieDuration: this.config.texts.cookieTableHeaderDuration
		};
		this.addOrReplace(newBar, this.bar);

		this.strictly_necessary = this.renderNode(consentItemTemplate, {
			consentKey: 'strictly_necessary',
			consentTitle: this.config.texts.strictlyNecessaryTitle,
			consentDescription: this.config.texts.strictlyNecessaryDescription,
		});
		this.strictly_necessary.alwaysOn = this.config.texts.alwaysOnLabel;
		this.strictly_necessary.tableHeaders = cookieTableHeaders;
		this.strictly_necessary.cookies = [{
			name: 'session_id',
			purpose: 'Maintains user session',
			provenance: 'First-party',
			duration: 'Session'
		}];

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


		var newModal = this.renderNode(modalTemplate, {
			modalTitle: this.config.texts.modalTitle,
			modalDescription: this.config.texts.modalDescription,
			buttonSave: this.config.texts.buttonSave,
			buttonCancel: this.config.texts.buttonCancel,
		});
		var consentList = newModal.querySelector('consentio-consent-items');
		consentList.appendChild(this.strictly_necessary);
		consentList.appendChild(this.preferences_functionality);
		consentList.appendChild(this.statistics_performance);
		consentList.appendChild(this.marketing_advertising);

		this.addOrReplace(newModal, this.modal);


		if (!this.isRendered) {
			this.floatingButton = this.renderNode(floatingButtonTemplate, {

			});
			this._shadow.appendChild(this.floatingButton);
		}
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
		oldEl = newEl;
	}


	// public api

}

export default ConsentioAppElement;
