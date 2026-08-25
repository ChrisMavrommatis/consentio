import styles from '../scss/consentio.scss';

import TemplateRenderer from '../lib/template-renderer.js';

import barTemplate from '../templates/consentio-bar.html';
import modalTemplate from '../templates/consentio-modal.html';
import consentItemTemplate from '../templates/consentio-consent-item.html';
import floatingButtonTemplate from '../templates/consentio-floating-button.html';
import ConsentioGTM from '../lib/gtm.js';
import FocusTrap from '../lib/focus.js';
import { showElement, hideElement } from '../lib/dom.js';

import type ConsentioBarElement from './consentio-bar.js';
import type ConsentioModalElement from './consentio-modal.js';
import type ConsentioConsentItemElement from './consentio-consent-item.js';
import type ConsentioRequiredElement from './consentio-required.js';
import type ConsentioFloatingButtonElement from './consentio-floating-button.js';
import type ConsentioLogger from '../lib/logger.js';
import type ConsentioState from '../lib/state.js';
import type { ConsentioConfig, ConsentRecord, CookieDescriptor, CookieTableHeaders } from '../types.js';

class ConsentioAppElement extends HTMLElement {

	declare _shadow: ShadowRoot;
	declare isRendered: boolean;
	declare isVisible: boolean;
	declare _config: ConsentioConfig;
	declare _state: ConsentioState;
	declare _cookies: CookieDescriptor[];
	declare _logger: ConsentioLogger | null;
	declare required: ConsentioRequiredElement | null;
	declare bar: ConsentioBarElement | null;
	declare modal: ConsentioModalElement | null;
	declare consentItems: ConsentioConsentItemElement[];
	declare floatingButton: ConsentioFloatingButtonElement | null;
	declare gtm: ConsentioGTM | null;
	declare _handlers: [string, (event: Event) => void][];
	declare _focus: FocusTrap;
	declare _onKeydown: (event: Event) => void;

	constructor() {
		super();
		this._shadow = this.attachShadow({ mode: 'closed' });
		this._focus = new FocusTrap(this._shadow);
		this._onKeydown = this.onKeydown.bind(this);
		// Bound once: a fresh bind() never matches what addEventListener was given. Issue 7.
		this._handlers = [
			['consentio:open-settings', this.openSettings.bind(this)],
			['consentio:accept-all-consents', this.acceptAll.bind(this)],
			['consentio:cancel-settings', this.cancelSettings.bind(this)],
			['consentio:save-settings', this.saveSettings.bind(this)]
		];
		this.isRendered = false;
		this.isVisible = false;
		// Placeholders until Consentio.init assigns the real config and state.
		this._config = {} as ConsentioConfig;
		this._state = {} as ConsentioState;
		this._cookies = [];
		this._logger = null;
		this.required = null;
		this.bar = null;
		this.modal = null;
		this.consentItems = [];
		this.floatingButton = null;
		this.gtm = null;
	}

	get config(): ConsentioConfig {
		return this._config;
	}

	set config(value: Partial<ConsentioConfig>) {
		this._config = { ...this._config, ...value };
		if (this.isRendered) {
			this.render();
			// The fresh nodes carry no inline display, so without this both show at once. Issue 13.
			this.initState();
		}
	}

	get state(): ConsentioState {
		return this._state;
	}

	set state(value: ConsentioState) {
		this._state = value;
	}

	get cookies(): CookieDescriptor[] {
		return this._cookies;
	}

	set cookies(value: CookieDescriptor[]) {
		this._cookies = [...value];
	}

	get logger(): ConsentioLogger | null {
		return this._logger;
	}
	set logger(value: ConsentioLogger | null) {
		this._logger = value;
	}

	connectedCallback(): void {
		this.render();
		this.initState();
		for (const [event, handler] of this._handlers) {
			this.addEventListener(event, handler);
		}
		// On document, not on the host: a key pressed after focus escapes still has to be caught.
		document.addEventListener('keydown', this._onKeydown);

		this.gtm = new ConsentioGTM(this.logger);
		this.isRendered = true;
		this.emit('consentio:initialized', this.state.consents);
		// No `consent default` from here - it would be two fetches too late. The loader has it.
	}

	disconnectedCallback(): void {
		for (const [event, handler] of this._handlers) {
			this.removeEventListener(event, handler);
		}
		document.removeEventListener('keydown', this._onKeydown);
		this._focus.leave(null);
	}

	onKeydown(event: Event): void {
		if ((event as KeyboardEvent).key === 'Escape' && this.modal && this.modal.style.display !== 'none') {
			this.cancelSettings(event);
			return;
		}
		this._focus.handleTab(event as KeyboardEvent);
	}

	render(): void {
		if (!this.isRendered) {
			const style = document.createElement('style');
			style.textContent = styles;
			this._shadow.appendChild(style);

			this.required = document.createElement("consentio-required") as ConsentioRequiredElement;
			this.required.setAttribute('aria-hidden', 'true');
			this._shadow.appendChild(this.required);
		}

		const newBar = this.renderNode<ConsentioBarElement>(barTemplate, {
			barTitle: this.config.texts.barTitle,
			barDescription: this.config.texts.barDescription,
			buttonSettings: this.config.texts.buttonSettings,
			buttonAcceptAll: this.config.texts.buttonAcceptAll,
		});

		const cookieTableHeaders: CookieTableHeaders = {
			cookieName: this.config.texts.cookieTableHeaderName,
			cookiePurpose: this.config.texts.cookieTableHeaderPurpose,
			cookieProvenance: this.config.texts.cookieTableHeaderProvenance,
			cookieDuration: this.config.texts.cookieTableHeaderDuration
		};
		this.addOrReplace(newBar, this.bar);
		this.bar = newBar;
		this.bar.logger = this.logger;
		if (this.config.consentRequired) {
			// Nothing behind the overlay can be reached, so the bar is a dialog rather than a region.
			this.bar.setAttribute('role', 'dialog');
			this.bar.setAttribute('aria-modal', 'true');
		}

		this.consentItems = this.config.consents.map(consent => {
			const consentItem = this.renderNode<ConsentioConsentItemElement>(consentItemTemplate, {
				consentKey: consent.key,
				consentTitle: consent.title,
				consentDescription: consent.description,
			});
			if (consent.alwaysOn) {
				consentItem.alwaysOn = this.config.texts.alwaysOnLabel;
			}
			consentItem.tableHeaders = cookieTableHeaders;
			consentItem.cookies = this.cookies.filter(cookie => cookie.category === consent.key);
			if (this.state.consentGiven) {
				consentItem.itemState = this.state.consents[consentItem.id];
			} else {
				consentItem.itemState = consent.defaultState;
			}
			return consentItem;
		});

		const newModal = this.renderNode<ConsentioModalElement>(modalTemplate, {
			modalTitle: this.config.texts.modalTitle,
			modalDescription: this.config.texts.modalDescription,
			buttonSave: this.config.texts.buttonSave,
			buttonCancel: this.config.texts.buttonCancel,
		});
		const consentList = newModal.querySelector('consentio-consent-items');
		this.consentItems.forEach(consentItem => {
			consentList!.appendChild(consentItem);
		});

		this.addOrReplace(newModal, this.modal);
		this.modal = newModal;
		this.modal.logger = this.logger;


		if (!this.isRendered) {
			this.floatingButton = this.renderNode<ConsentioFloatingButtonElement>(floatingButtonTemplate, {

			});
			this._shadow.appendChild(this.floatingButton);
		}
	}

	initState(): void {
		hideElement(this.required!);
		hideElement(this.bar!);
		hideElement(this.modal!);
		hideElement(this.floatingButton!);
		if (this.state.consentGiven) {
			showElement(this.floatingButton!);
			return;
		}
		showElement(this.bar!);
		if (this.config.consentRequired) {
			showElement(this.required!);
			this._focus.enter(this.bar, true);
		}
	}

	renderNode<T extends Element>(template: string, data: Record<string, string>): T {
		const htmlString = TemplateRenderer.render(template, data);
		const templateElement = document.createElement('template');
		templateElement.innerHTML = htmlString.trim();
		return templateElement.content.firstChild as T;
	}

	addOrReplace(newEl: Node, oldEl: Node | null): void {
		if (!this.isRendered) {
			this._shadow.appendChild(newEl);
		}
		else {
			this._shadow.replaceChild(newEl, oldEl!);
		}
	}

	openSettings(event: Event): void {
		event.stopImmediatePropagation();
		hideElement(this.bar!);
		hideElement(this.floatingButton!);
		showElement(this.modal!);
		if (this.config.consentRequired) {
			showElement(this.required!);
		}
		this._focus.enter(this.modal, true);
	}
	acceptAll(event: Event): void {
		event.stopImmediatePropagation();
		this.state.acceptAll();
		this.consentItems.forEach((consentItem) => {
			consentItem.updateState(this.state.consents[consentItem.id]);
			consentItem.reset();
		});
		hideElement(this.bar!);
		hideElement(this.required!);
		showElement(this.floatingButton!);
		this._focus.leave(this.floatingButton);
		this.emit('consentio:consent-update', this.state.consents);
		this.gtm?.updateConsent(this.state.consents);
	}

	cancelSettings(event: Event): void {
		event.stopImmediatePropagation();
		this.consentItems.forEach((consentItem) => {
			consentItem.reset();
		});
		hideElement(this.modal!);
		if (!this.state.consentGiven) {
			showElement(this.bar!);
			if (this.config.consentRequired) {
				showElement(this.required!);
			}
			this._focus.enter(this.bar, !!this.config.consentRequired);
			return;
		}
		hideElement(this.bar!);
		hideElement(this.required!);
		showElement(this.floatingButton!);
		this._focus.leave(this.floatingButton);
	}

	saveSettings(event: Event): void {
		event.stopImmediatePropagation();
		this.logger?.log('[Consentio:Event] save-settings', 'info');
		this.state.updateState((event as CustomEvent<ConsentRecord>).detail);
		this.consentItems.forEach((consentItem) => {
			consentItem.updateState(this.state.consents[consentItem.id]);
			consentItem.reset();
		});
		hideElement(this.modal!);
		if (!this.state.consentGiven) {
			showElement(this.bar!);
			if (this.config.consentRequired) {
				showElement(this.required!);
			}
			this._focus.enter(this.bar, !!this.config.consentRequired);
			return;
		}
		hideElement(this.bar!);
		hideElement(this.required!);
		showElement(this.floatingButton!);
		this._focus.leave(this.floatingButton);
		this.emit('consentio:consent-update', this.state.consents);
		this.gtm?.updateConsent(this.state.consents);
	}

	emit(event: string, data: unknown): void {
		this.dispatchEvent(new CustomEvent(event, {
			bubbles: true,
			composed: true,
			detail: data
		}));
	}

}

export default ConsentioAppElement;
