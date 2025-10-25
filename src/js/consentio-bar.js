class ConsentioBarElement extends HTMLElement {

	constructor() {
		super();
		this.settingsBtn = this.querySelector('button[data-role="Settings"]');
		this.acceptAllBtn = this.querySelector('button[data-role="AcceptAll"]');
	}

	connectedCallback() {
		this.settingsBtn.addEventListener('click', this.openSettings.bind(this));
		this.acceptAllBtn.addEventListener('click', this.acceptAll.bind(this));
	}

	disconectedCallback() {
		this.settingsBtn.removeEventListener('click', this.openSettings.bind(this));
		this.acceptAllBtn.removeEventListener('click', this.acceptAll.bind(this));
	}


	openSettings() {
		const event = new CustomEvent('open-consentio-modal', {
			bubbles: true,
			composed: true
		});
		this.dispatchEvent(event);
		console.log('[Consentio] Opening settings modal');
	}

	acceptAll() {
		const event = new CustomEvent('accept-all-consents', {
			bubbles: true,
			composed: true
		});
		this.dispatchEvent(event);
		console.log('[Consentio] Accepting all consents');
	}


}

export default ConsentioBarElement;
