import { isHidden, showElement, hideElement } from './utils.js';

class ConsentioConsentItemElement extends HTMLElement {

	constructor() {
		super();
		this.consentBody = this.querySelector('.consent-body');
		this.switch = this.querySelector('consentio-switch');
		this._alwaysOn = null;
		this._cookies = [];
		this._tableHeaders = null;
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
			var switchLabel = this.switch.querySelector('label');
			switchLabel.innerHTML = '';
			switchLabel.textContent = this.alwaysOn;
		}
		if (!this.cookies || !this.tableHeaders) {
			return;
		}
		var tableFragment = document.createDocumentFragment();
		var table = document.createElement('table');
		tableFragment.appendChild(table);

		var thead = document.createElement('thead');
		table.appendChild(thead);
		var headerRow = document.createElement('tr');
		thead.appendChild(headerRow);

		Array.from(Object.keys(this.tableHeaders)).forEach(key => {
			var th = document.createElement('th');
			th.appendChild(document.createTextNode(this.tableHeaders[key]));
			headerRow.appendChild(th);
		});

		var tbody = document.createElement('tbody');
		table.appendChild(tbody);
		this.cookies.forEach(cookie => {
			var row = document.createElement('tr');
			tbody.appendChild(row);

			var nameCell = document.createElement('td');
			nameCell.appendChild(document.createTextNode(cookie.name));
			row.appendChild(nameCell);

			var purposeCell = document.createElement('td');
			purposeCell.appendChild(document.createTextNode(cookie.purpose));
			row.appendChild(purposeCell);

			var provenanceCell = document.createElement('td');
			provenanceCell.appendChild(document.createTextNode(cookie.provenance));
			row.appendChild(provenanceCell);

			var durationCell = document.createElement('td');
			durationCell.appendChild(document.createTextNode(cookie.duration));
			row.appendChild(durationCell);
		});
		this.consentBody.appendChild(tableFragment);
	}

	connectedCallback() {
		this.addEventListener('click', this.toggleBody);
		this.render();
	}
	disconnectedCallback() {
		this.removeEventListener('click', this.toggleBody);
	}
}

export default ConsentioConsentItemElement;

