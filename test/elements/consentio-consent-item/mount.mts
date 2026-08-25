import ConsentioConsentItemElement from '../../../src/elements/consentio-consent-item.js';
import consentItemTemplate from '../../../src/templates/consentio-consent-item.html';
import type { CookieDescriptor } from '../../../src/types.js';
import { TABLE_HEADERS, nodeFrom } from '../../helpers.mjs';

customElements.define('consentio-consent-item', ConsentioConsentItemElement);

export const COOKIES: CookieDescriptor[] = [
	{ name: 'analytics_id', purpose: 'Usage data', provenance: 'Third-party', duration: '1 Year', category: 'statistics_performance' },
	{ name: 'session_id', purpose: 'Session', provenance: 'First-party', duration: 'Session', category: 'statistics_performance' }
];

export interface MountOptions {
	alwaysOn?: string;
	cookies?: CookieDescriptor[];
	tableHeaders?: typeof TABLE_HEADERS | null;
}

/** render() only builds the cookie table once tableHeaders is set, so set it before inserting. */
export function mountItem(options: MountOptions = {}): ConsentioConsentItemElement {
	const item = nodeFrom<ConsentioConsentItemElement>(consentItemTemplate, {
		consentKey: 'statistics_performance',
		consentTitle: 'Statistics Cookies',
		consentDescription: 'How visitors use the site.'
	});
	if (options.alwaysOn) {
		item.alwaysOn = options.alwaysOn;
	}
	item.cookies = options.cookies ?? [];
	item.tableHeaders = options.tableHeaders === undefined ? TABLE_HEADERS : options.tableHeaders;
	document.body.appendChild(item);
	return item;
}
