import type ConsentioConsentItemElement from './consentio-consent-item.js';
import type ConsentioLogger from '../lib/logger.js';
import type { ConsentRecord } from '../types.js';

class ConsentioModalElement extends HTMLElement {

	declare _logger: ConsentioLogger | null;
	declare _onClick: (event: Event) => void;

	constructor() {
		super();
		this._logger = null;
		// Bound once: a fresh bind() never matches what addEventListener was given.
		this._onClick = this.onClick.bind(this);
	}

	// Queried on access: a constructor runs before its children exist. Issue 11.
	get cancelBtn(): HTMLElement | null {
		return this.querySelector<HTMLElement>('[data-role="cancel"]');
	}

	get saveBtn(): HTMLElement | null {
		return this.querySelector<HTMLElement>('[data-role="save"]');
	}

	get consents(): ConsentioConsentItemElement[] {
		return Array.from(
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
		// One delegated listener on the host, so the buttons need not exist yet.
		this.addEventListener('click', this._onClick);
	}

	disconnectedCallback(): void {
		this.removeEventListener('click', this._onClick);
	}

	onClick(event: Event): void {
		const target = event.target as Element | null;
		if (target?.closest('[data-role="cancel"]')) {
			this.cancel(event);
			return;
		}
		if (target?.closest('[data-role="save"]')) {
			this.save(event);
		}
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
