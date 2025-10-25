class ConsentioModalElement extends HTMLElement {

	constructor() {
		super();
		this._logger = null;
		this.cancelBtn = this.querySelector('[data-role="cancel"]');
		this.saveBtn = this.querySelector('[data-role="save"]');
	}

	get logger() {
		return this._logger;
	}

	set logger(value) {
		this._logger = value;
	}

	connectedCallback() {
		this.cancelBtn.addEventListener('click', this.cancel.bind(this));
		this.saveBtn.addEventListener('click', this.save.bind(this));

	}

	disconnectedCallback() {
		this.cancelBtn.removeEventListener('click', this.cancel.bind(this));
		this.saveBtn.removeEventListener('click', this.save.bind(this));
	}

	cancel(event) {
		event.stopImmediatePropagation();
		const customEvent = new CustomEvent('consentio:cancel-settings', {
			bubbles: true,
			composed: true
		});
		this.dispatchEvent(customEvent);
		this.logger?.log('[Consentio:Event] cancel-settings', 'info');
	}

	save(event) {
		event.stopImmediatePropagation();
		const customEvent = new CustomEvent('consentio:save-settings', {
			bubbles: true,
			composed: true
		});
		this.dispatchEvent(customEvent);
		this.logger?.log('[Consentio:Event] save-settings', 'info');
	}
}

export default ConsentioModalElement;
