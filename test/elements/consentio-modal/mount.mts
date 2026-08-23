import ConsentioModalElement from '../../../src/elements/consentio-modal.js';
import ConsentioConsentItemElement from '../../../src/elements/consentio-consent-item.js';
import modalTemplate from '../../../src/templates/consentio-modal.html';
import consentItemTemplate from '../../../src/templates/consentio-consent-item.html';
import { CATEGORIES, TABLE_HEADERS, nodeFrom } from '../../helpers.mjs';

customElements.define('consentio-modal', ConsentioModalElement);
customElements.define('consentio-consent-item', ConsentioConsentItemElement);

/**
 * Assemble the modal the way ConsentioAppElement.render does: build every node inside
 * an inert template, nest the items, and only then insert - which is what defers the
 * custom element upgrades until the children exist.
 */
export function mountModal(): { modal: ConsentioModalElement; items: ConsentioConsentItemElement[] } {
	const modal = nodeFrom<ConsentioModalElement>(modalTemplate, {
		modalTitle: 'Cookie Settings',
		modalDescription: 'Change your preferences.',
		buttonSave: 'Save',
		buttonCancel: 'Cancel'
	});
	const list = modal.querySelector('consentio-consent-items')!;

	const items = CATEGORIES.map((category) => {
		const item = nodeFrom<ConsentioConsentItemElement>(consentItemTemplate, {
			consentKey: category.key,
			consentTitle: category.title,
			consentDescription: category.description
		});
		if (category.alwaysOn) {
			item.alwaysOn = 'Always On';
		}
		item.tableHeaders = TABLE_HEADERS;
		item.itemState = category.defaultState;
		list.appendChild(item);
		return item;
	});

	document.body.appendChild(modal);
	return { modal, items };
}
