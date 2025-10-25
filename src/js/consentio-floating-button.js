class ConsentioFloatingButtonElement extends HTMLElement {
	constructor() {
		super();
		this.button = this.querySelector('button');
	}

	connectedCallback() {
		this.button.addEventListener('click', this.openSettings.bind(this));
	}

	disconnectedCallback() {
		this.button.removeEventListener('click', this.openSettings.bind(this));
	}

	openSettings(event) {
		event.stopImmediatePropagation();
		const customEvent = new CustomEvent('consentio:open-settings', {
			bubbles: true,
			composed: true
		});
		this.dispatchEvent(customEvent);
	}


}

export default ConsentioFloatingButtonElement;
