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
		this.emit('consentio:open-settings', {});
	}

	emit(event, data) {
		this.dispatchEvent(new CustomEvent(event, {
			bubbles: true,
			composed: true,
			detail: data
		}));
	}


}

export default ConsentioFloatingButtonElement;
