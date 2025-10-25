class ConsentioModalElement extends HTMLElement {

	constructor() {
		super();
		this._logger = null;
		this.cancelBtn = this.querySelector('[data-role="cancel"]');
		this.saveBtn = this.querySelector('[data-role="save"]');
		this.consents = Array.from(
			this.querySelectorAll('consentio-consent-item')
		);
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
		this.emit('consentio:cancel-settings', {});
		this.logger?.log('[Consentio:Event] cancel-settings', 'info');
	}

	save(event) {
		event.stopImmediatePropagation();
		const state = {};
		this.consents.forEach((consentItem) => {
			const consentName = consentItem.id;
			state[consentName] = consentItem.readState();
		});
		this.emit('consentio:save-settings', state);
		this.logger?.log('[Consentio:Event] save-settings', 'info');
	}

	emit(event, data) {
		this.dispatchEvent(new CustomEvent(event, {
			bubbles: true,
			composed: true,
			detail: data
		}));
	}
}

export default ConsentioModalElement;
