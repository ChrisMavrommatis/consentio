class ConsentioFloatingButtonElement extends HTMLElement {

	declare _onClick: (event: Event) => void;

	constructor() {
		super();
		// Bound once: a fresh bind() never matches what addEventListener was given.
		this._onClick = this.onClick.bind(this);
	}

	// Queried on access, so an element upgraded before its children exist still finds it.
	get button(): HTMLButtonElement | null {
		return this.querySelector('button');
	}

	connectedCallback(): void {
		this.addEventListener('click', this._onClick);
	}

	disconnectedCallback(): void {
		this.removeEventListener('click', this._onClick);
	}

	onClick(event: Event): void {
		if ((event.target as Element | null)?.closest('button')) {
			this.openSettings(event);
		}
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
