class ConsentioBarElement extends HTMLElement {

	constructor() {
		super();
		this.settingsBtn = this.querySelector('button[data-role="settings"]');
		this.acceptAllBtn = this.querySelector('button[data-role="acceptAll"]');
		this._logger = null;
	}


	get logger() {
		return this._logger;
	}

	set logger(value) {
		this._logger = value;

	}
	connectedCallback() {
		this.settingsBtn.addEventListener('click', this.openSettings.bind(this));
		this.acceptAllBtn.addEventListener('click', this.acceptAll.bind(this));
	}

	disconectedCallback() {
		this.settingsBtn.removeEventListener('click', this.openSettings.bind(this));
		this.acceptAllBtn.removeEventListener('click', this.acceptAll.bind(this));
	}


	openSettings(event) {
		event.stopImmediatePropagation();
		this.emit('consentio:open-settings', {});
		this.logger?.log('[Consentio:Event] open-settings', 'info');
	}

	acceptAll(event) {
		event.stopImmediatePropagation();
		this.emit('consentio:accept-all-consents', {});
		this.logger?.log('[Consentio:Event] accept-all-consents', 'info');
	}

	emit(event, data) {
		this.dispatchEvent(new CustomEvent(event, {
			bubbles: true,
			composed: true,
			detail: data
		}));
	}


}

export default ConsentioBarElement;
