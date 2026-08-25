import { isHidden, showElement, hideElement } from '../lib/dom.js';
import type { ConsentState, CookieDescriptor, CookieTableHeaders } from '../types.js';

class ConsentioConsentItemElement extends HTMLElement {

	declare _alwaysOn: string | null;
	declare _cookies: CookieDescriptor[];
	declare _tableHeaders: CookieTableHeaders | null;
	declare _itemState: ConsentState | null;
	declare _onClick: (event: Event) => void;
	declare _onKeydown: (event: Event) => void;

	constructor() {
		super();
		this._alwaysOn = null;
		this._cookies = [];
		this._tableHeaders = null;
		this._itemState = null;
		// Bound once: a fresh bind() never matches what addEventListener was given.
		this._onClick = this.onClick.bind(this);
		this._onKeydown = this.onKeydown.bind(this);
	}

	// Queried on access: a constructor runs before its children exist. Issue 11.
	get consentBody(): HTMLElement | null {
		return this.querySelector<HTMLElement>('.consent-body');
	}

	get consentHeader(): HTMLElement | null {
		return this.querySelector<HTMLElement>('.consent-header');
	}

	get switch(): HTMLElement | null {
		return this.querySelector<HTMLElement>('consentio-switch');
	}

	get input(): HTMLInputElement | null {
		return this.querySelector<HTMLInputElement>('consentio-switch input');
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
		this.consentHeader?.setAttribute('aria-expanded', 'false');
	}

	// The switch sits inside the header, so a click on it must not reach the toggle. Issue 15.
	onClick(event: Event): void {
		const target = event.target as Element | null;
		if (target?.closest('consentio-switch')) {
			return;
		}
		if (target?.closest('.consent-header')) {
			this.toggleBody(event);
		}
	}

	onKeydown(event: Event): void {
		const key = (event as KeyboardEvent).key;
		if (key !== 'Enter' && key !== ' ') {
			return;
		}
		const target = event.target as Element | null;
		if (target !== this.consentHeader) {
			return;
		}
		event.preventDefault();
		this.toggleBody(event);
	}

	toggleBody(event: Event): void {
		event.stopImmediatePropagation();
		const expanded = isHidden(this.consentBody!);
		if (expanded) {
			showElement(this.consentBody!);
		}
		else {
			hideElement(this.consentBody!);
		}
		this.consentHeader?.setAttribute('aria-expanded', String(expanded));
	}

	render(): void {
		// The wrapping label carries no text, so without this the checkbox is unnamed. Issue 14.
		const title = this.querySelector('h5')?.textContent?.trim();
		if (title && this.input) {
			this.input.setAttribute('aria-label', title);
		}
		if (this.alwaysOn !== null) {
			// The checkbox stays: clearing the label detached the node updateState writes to.
			// An <input> contributes no text, so the label reads as the label alone. Issue 23.
			const switchLabel = this.switch!.querySelector('label')!;
			const input = switchLabel.querySelector('input');
			const label = document.createTextNode(this.alwaysOn);
			switchLabel.replaceChildren(...(input ? [input, label] : [label]));
			// A control that cannot change should not be a stop on the way to the buttons.
			if (input) {
				input.disabled = true;
			}
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
		this.addEventListener('click', this._onClick);
		this.addEventListener('keydown', this._onKeydown);
		this.render();
	}

	disconnectedCallback(): void {
		this.removeEventListener('click', this._onClick);
		this.removeEventListener('keydown', this._onKeydown);
	}



}

export default ConsentioConsentItemElement;
