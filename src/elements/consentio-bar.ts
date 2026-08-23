import type ConsentioLogger from '../lib/logger.js';

class ConsentioBarElement extends HTMLElement {

	declare settingsBtn: HTMLButtonElement | null;
	declare acceptAllBtn: HTMLButtonElement | null;
	declare _logger: ConsentioLogger | null;

	constructor() {
		super();
		this.settingsBtn = this.querySelector<HTMLButtonElement>('button[data-role="settings"]');
		this.acceptAllBtn = this.querySelector<HTMLButtonElement>('button[data-role="acceptAll"]');
		this._logger = null;
	}


	get logger(): ConsentioLogger | null {
		return this._logger;
	}

	set logger(value: ConsentioLogger | null) {
		this._logger = value;

	}
	connectedCallback(): void {
		this.settingsBtn!.addEventListener('click', this.openSettings.bind(this));
		this.acceptAllBtn!.addEventListener('click', this.acceptAll.bind(this));
	}

	disconectedCallback(): void {
		this.settingsBtn!.removeEventListener('click', this.openSettings.bind(this));
		this.acceptAllBtn!.removeEventListener('click', this.acceptAll.bind(this));
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
