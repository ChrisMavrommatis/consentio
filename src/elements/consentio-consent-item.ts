import { isHidden, showElement, hideElement } from '../lib/dom.js';
import type { ConsentState, CookieDescriptor, CookieTableHeaders } from '../types.js';

class ConsentioConsentItemElement extends HTMLElement {

	declare consentBody: HTMLElement | null;
	declare switch: HTMLElement | null;
	declare input: HTMLInputElement | null;
	declare _alwaysOn: string | null;
	declare _cookies: CookieDescriptor[];
	declare _tableHeaders: CookieTableHeaders | null;
	declare _itemState: ConsentState | null;

	constructor() {
		super();
		this.consentBody = this.querySelector<HTMLElement>('.consent-body');
		this.switch = this.querySelector<HTMLElement>('consentio-switch');
		this.input = this.switch!.querySelector<HTMLInputElement>('input');
		this._alwaysOn = null;
		this._cookies = [];
		this._tableHeaders = null;
		this._itemState = null;
	}

	set alwaysOn(value: string | null) {
		this._alwaysOn = value;
	}
	get alwaysOn(): string | null {
		return this._alwaysOn;
	}

	get cookies(): CookieDescriptor[] {
		return this._cookies;
	}

	set cookies(value: CookieDescriptor[]) {
		this._cookies = value;
	}

	set tableHeaders(value: CookieTableHeaders | null) {
		this._tableHeaders = value;
	}

	get tableHeaders(): CookieTableHeaders | null {
		return this._tableHeaders;
	}

	get itemState(): ConsentState | null {
		return this._itemState;
	}

	set itemState(value: ConsentState | null) {
		this._itemState = value;
	}

	readState(): ConsentState {
		if (!!this.alwaysOn) {
			return 'granted';
		}
		return this.input!.checked ? 'granted' : 'denied';
	}

	updateState(value: ConsentState): void {
		this.itemState = value;
		this.input!.checked = value === 'granted';
	}

	reset(): void {
		this.input!.checked = this.itemState === 'granted';
		hideElement(this.consentBody!);
	}

	toggleBody(event: Event): void {
		event.stopImmediatePropagation();
		if (isHidden(this.consentBody!)) {
			showElement(this.consentBody!);
		}
		else {
			hideElement(this.consentBody!);
		}
	}

	render(): void {
		if (this.alwaysOn !== null) {
			const switchLabel = this.switch!.querySelector('label');
			switchLabel!.innerHTML = '';
			switchLabel!.textContent = this.alwaysOn;
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
			th.appendChild(document.createTextNode(this.tableHeaders![key as keyof CookieTableHeaders]));
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
		this.consentBody!.appendChild(tableFragment);
		this.input!.checked = this.itemState === 'granted';
	}

	connectedCallback(): void {
		this.addEventListener('click', this.toggleBody.bind(this));
		this.render();
	}
	disconnectedCallback(): void {
		this.removeEventListener('click', this.toggleBody.bind(this));
	}



}

export default ConsentioConsentItemElement;
