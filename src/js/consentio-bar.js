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
		const customEvent = new CustomEvent('consentio:open-settings', {
			bubbles: true,
			composed: true
		});
		this.dispatchEvent(customEvent);
		this.logger?.log('[Consentio:Event] open-settings', 'info');
	}

	acceptAll(event) {
		event.stopImmediatePropagation();
		const customEvent = new CustomEvent('consentio:accept-all-consents', {
			bubbles: true,
			composed: true
		});
		this.dispatchEvent(customEvent);
		this.logger?.log('[Consentio:Event] accept-all-consents', 'info');
	}


}

export default ConsentioBarElement;
