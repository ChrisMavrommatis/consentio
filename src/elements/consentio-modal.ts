import type ConsentioConsentItemElement from './consentio-consent-item.js';
import type ConsentioLogger from '../lib/logger.js';
import type { ConsentRecord } from '../types.js';

class ConsentioModalElement extends HTMLElement {

	declare _logger: ConsentioLogger | null;
	declare cancelBtn: HTMLAnchorElement | null;
	declare saveBtn: HTMLAnchorElement | null;
	declare consents: ConsentioConsentItemElement[];

	constructor() {
		super();
		this._logger = null;
		this.cancelBtn = this.querySelector<HTMLAnchorElement>('[data-role="cancel"]');
		this.saveBtn = this.querySelector<HTMLAnchorElement>('[data-role="save"]');
		this.consents = Array.from(
			this.querySelectorAll<ConsentioConsentItemElement>('consentio-consent-item')
		);
	}

	get logger(): ConsentioLogger | null {
		return this._logger;
	}

	set logger(value: ConsentioLogger | null) {
		this._logger = value;
	}

	connectedCallback(): void {
		this.cancelBtn!.addEventListener('click', this.cancel.bind(this));
		this.saveBtn!.addEventListener('click', this.save.bind(this));

	}

	disconnectedCallback(): void {
		this.cancelBtn!.removeEventListener('click', this.cancel.bind(this));
		this.saveBtn!.removeEventListener('click', this.save.bind(this));
	}

	cancel(event: Event): void {
		event.stopImmediatePropagation();
		this.emit('consentio:cancel-settings', {});
		this.logger?.log('[Consentio:Event] cancel-settings', 'info');
	}

	save(event: Event): void {
		event.stopImmediatePropagation();
		const state: ConsentRecord = {};
		this.consents.forEach((consentItem) => {
			const consentName = consentItem.id;
			state[consentName] = consentItem.readState();
		});
		this.emit('consentio:save-settings', state);
		this.logger?.log('[Consentio:Event] save-settings', 'info');
	}

	emit(event: string, data: unknown): void {
		this.dispatchEvent(new CustomEvent(event, {
			bubbles: true,
			composed: true,
			detail: data
		}));
	}
}

export default ConsentioModalElement;
