import type ConsentioLogger from '../lib/logger.js';

class ConsentioBarElement extends HTMLElement {

	declare _logger: ConsentioLogger | null;
	declare _onClick: (event: Event) => void;

	constructor() {
		super();
		this._logger = null;
		// Bound once and kept. `this.fn.bind(this)` builds a new function object every call,
		// so a removeEventListener handed a fresh one never matches what was added.
		this._onClick = this.onClick.bind(this);
	}

	// Queried on access rather than cached in the constructor: an element upgraded in
	// place runs its constructor before its children exist.
	get settingsBtn(): HTMLButtonElement | null {
		return this.querySelector<HTMLButtonElement>('button[data-role="settings"]');
	}

	get acceptAllBtn(): HTMLButtonElement | null {
		return this.querySelector<HTMLButtonElement>('button[data-role="acceptAll"]');
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
		if (target?.closest('button[data-role="settings"]')) {
			this.openSettings(event);
			return;
		}
		if (target?.closest('button[data-role="acceptAll"]')) {
			this.acceptAll(event);
		}
	}

	openSettings(event: Event): void {
		event.stopImmediatePropagation();
		this.emit('consentio:open-settings', {});
		this.logger?.log('[Consentio:Event] open-settings', 'info');
	}

	acceptAll(event: Event): void {
		event.stopImmediatePropagation();
		this.emit('consentio:accept-all-consents', {});
		this.logger?.log('[Consentio:Event] accept-all-consents', 'info');
	}

	emit(event: string, data: unknown): void {
		this.dispatchEvent(new CustomEvent(event, {
			bubbles: true,
			composed: true,
			detail: data
		}));
	}

}

export default ConsentioBarElement;
