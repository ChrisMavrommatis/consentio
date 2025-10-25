import { isHidden, showElement, hideElement } from './utils.js';

class ConsentioConsentItemElement extends HTMLElement {

	constructor() {
		super();
		this.consentBody = this.querySelector('.consent-body');
		this.switch = this.querySelector('consentio-switch');
		this.input = this.switch.querySelector('input');
		this._alwaysOn = null;
		this._cookies = [];
		this._tableHeaders = null;
		this._itemState = null;
	}

	set alwaysOn(value) {
		this._alwaysOn = value;
	}
	get alwaysOn() {
		return this._alwaysOn;
	}

	get cookies() {
		return this._cookies;
	}

	set cookies(value) {
		this._cookies = value;
	}

	set tableHeaders(value) {
		this._tableHeaders = value;
	}

	get tableHeaders() {
		return this._tableHeaders;
	}

	get itemState() {
		return this._itemState;
	}

	set itemState(value) {
		this._itemState = value;
	}

	readState() {
		if (!!this.alwaysOn) {
			return 'granted';
		}
		return this.input.checked ? 'granted' : 'denied';
	}

	updateState(value) {
		this.itemState = value;
		this.input.checked = value === 'granted';
	}

	reset() {
		this.input.checked = this.itemState === 'granted';
		hideElement(this.consentBody);
	}

	toggleBody(event) {
		event.stopImmediatePropagation();
		if (isHidden(this.consentBody)) {
			showElement(this.consentBody);
		}
		else {
			hideElement(this.consentBody);
		}
	}

	render() {
		if (this.alwaysOn !== null) {
			const switchLabel = this.switch.querySelector('label');
			switchLabel.innerHTML = '';
			switchLabel.textContent = this.alwaysOn;
		}
		if (!this.cookies || !this.tableHeaders) {
			return;
		}
		const tableFragment = document.createDocumentFragment();
		const table = document.createElement('table');
		tableFragment.appendChild(table);

		const thead = document.createElement('thead');
		table.appendChild(thead);
		const headerRow = document.createElement('tr');
		thead.appendChild(headerRow);


		Array.from(Object.keys(this.tableHeaders)).forEach(key => {
			const th = document.createElement('th');
			th.appendChild(document.createTextNode(this.tableHeaders[key]));
			headerRow.appendChild(th);
		});

		const tbody = document.createElement('tbody');
		table.appendChild(tbody);
		this.cookies.forEach(cookie => {
			const row = document.createElement('tr');
			tbody.appendChild(row);

			const nameCell = document.createElement('td');
			nameCell.appendChild(document.createTextNode(cookie.name));
			row.appendChild(nameCell);

			const purposeCell = document.createElement('td');
			purposeCell.appendChild(document.createTextNode(cookie.purpose));
			row.appendChild(purposeCell);

			const provenanceCell = document.createElement('td');
			provenanceCell.appendChild(document.createTextNode(cookie.provenance));
			row.appendChild(provenanceCell);

			const durationCell = document.createElement('td');
			durationCell.appendChild(document.createTextNode(cookie.duration));
			row.appendChild(durationCell);
		});
		this.consentBody.appendChild(tableFragment);
		this.input.checked = this.itemState === 'granted';
	}

	connectedCallback() {
		this.addEventListener('click', this.toggleBody.bind(this));
		this.render();
	}
	disconnectedCallback() {
		this.removeEventListener('click', this.toggleBody.bind(this));
	}



}

export default ConsentioConsentItemElement;

