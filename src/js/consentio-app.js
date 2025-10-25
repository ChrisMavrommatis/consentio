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
		this._logger = null;
		this.required = null;
		this.bar = null;
		this.modal = null;
		this.consentItems = [];
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
		this._state = value;
	}

	get cookies() {
		return this._cookies;
	}

	set cookies(value) {
		this._cookies = [...value];
	}

	get logger() {
		return this._logger;
	}
	set logger(value) {
		this._logger = value;
	}

	connectedCallback() {
		this.render();
		this.initState();
		this.addEventListener('consentio:open-settings', this.openSettings.bind(this));
		this.addEventListener('consentio:accept-all-consents', this.acceptAll.bind(this));
		this.addEventListener('consentio:cancel-settings', this.cancelSettings.bind(this));
		this.addEventListener('consentio:save-settings', this.saveSettings.bind(this));


		this.isRendered = true;
	}

	disconectedCallback() {
		this.removeEventListener('consentio:open-settings', this.openSettings.bind(this));
		this.removeEventListener('consentio:accept-all-consents', this.acceptAll.bind(this));
		this.removeEventListener('consentio:cancel-settings', this.cancelSettings.bind(this));
		this.removeEventListener('consentio:save-settings', this.saveSettings.bind(this));
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
		this.bar.logger = this.logger;

		this.consentItems = this.config.consents.map(consent => {
			const consentItem = this.renderNode(consentItemTemplate, {
				consentKey: consent.key,
				consentTitle: consent.title,
				consentDescription: consent.description,
			});
			if (consent.alwaysOn) {
				consentItem.alwaysOn = this.config.texts.alwaysOnLabel;
			}
			console.log('sd');
			consentItem.tableHeaders = cookieTableHeaders;
			consentItem.cookies = this.cookies;
			if (this.state.consentGiven) {
				consentItem.itemState = this.state.consents[consentItem.id];
			} else {
				consentItem.itemState = consent.defaultState;
			}
			return consentItem;
		});

		const newModal = this.renderNode(modalTemplate, {
			modalTitle: this.config.texts.modalTitle,
			modalDescription: this.config.texts.modalDescription,
			buttonSave: this.config.texts.buttonSave,
			buttonCancel: this.config.texts.buttonCancel,
		});
		const consentList = newModal.querySelector('consentio-consent-items');
		this.consentItems.forEach(consentItem => {
			consentList.appendChild(consentItem);
		});

		this.addOrReplace(newModal, this.modal);
		this.modal = newModal;
		this.modal.logger = this.logger;


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
		showElement(this.bar);
		showElement(this.required);
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

	openSettings(event) {
		event.stopImmediatePropagation();
		hideElement(this.bar);
		hideElement(this.floatingButton);
		showElement(this.modal);
		showElement(this.required);
	}
	acceptAll(event) {
		event.stopImmediatePropagation();
		this.state.acceptAll();
		this.consentItems.forEach((consentItem) => {
			consentItem.updateState(this.state.consents[consentItem.id]);
			consentItem.reset();
		});
		hideElement(this.bar);
		hideElement(this.required);
		showElement(this.floatingButton);
	}

	cancelSettings(event) {
		event.stopImmediatePropagation();
		this.consentItems.forEach((consentItem) => {
			consentItem.reset();
		});
		hideElement(this.modal);
		if (!this.state.consentGiven) {
			showElement(this.bar);
			showElement(this.required);
			return;
		}
		hideElement(this.bar);
		hideElement(this.required);
		showElement(this.floatingButton);
	}
	saveSettings(event) {
		event.stopImmediatePropagation();
		this.logger.log(event, 'info');
		this.state.updateState(event.detail);
		this.consentItems.forEach((consentItem) => {
			consentItem.updateState(this.state.consents[consentItem.id]);
			consentItem.reset();
		});
		hideElement(this.modal);
		if (!this.state.consentGiven) {
			showElement(this.bar);
			showElement(this.required);
			return;
		}
		hideElement(this.bar);
		hideElement(this.required);
		showElement(this.floatingButton);

	}

	// public api

}

export default ConsentioAppElement;
