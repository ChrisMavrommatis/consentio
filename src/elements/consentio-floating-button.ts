class ConsentioFloatingButtonElement extends HTMLElement {
	declare button: HTMLButtonElement | null;

	constructor() {
		super();
		this.button = this.querySelector('button');
	}

	connectedCallback(): void {
		this.button!.addEventListener('click', this.openSettings.bind(this));
	}

	disconnectedCallback(): void {
		this.button!.removeEventListener('click', this.openSettings.bind(this));
	}

	openSettings(event: Event): void {
		event.stopImmediatePropagation();
		this.emit('consentio:open-settings', {});
	}

	emit(event: string, data: unknown): void {
		this.dispatchEvent(new CustomEvent(event, {
			bubbles: true,
			composed: true,
			detail: data
		}));
	}


}

export default ConsentioFloatingButtonElement;
