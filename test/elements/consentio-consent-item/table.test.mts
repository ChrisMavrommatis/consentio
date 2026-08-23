import test from 'node:test';
import assert from 'node:assert/strict';

import { TABLE_HEADERS } from '../../helpers.mjs';
import { COOKIES, mountItem } from './mount.mjs';

test('no table is built when the item has no headers', () => {
	const item = mountItem({ cookies: COOKIES, tableHeaders: null });
	assert.equal(item.querySelector('table'), null);
});

test('the table carries the four configured headers, in order', () => {
	const item = mountItem({ cookies: COOKIES });
	const headers = Array.from(item.querySelectorAll('thead th'), (th) => th.textContent);
	assert.deepEqual(headers, Object.values(TABLE_HEADERS));
});

test('there is one row per cookie in the category', () => {
	const item = mountItem({ cookies: COOKIES });
	assert.equal(item.querySelectorAll('tbody tr').length, COOKIES.length);
});

test('each row carries the name, purpose, provenance and duration', () => {
	const item = mountItem({ cookies: COOKIES });
	const cells = Array.from(item.querySelectorAll('tbody tr')[0].querySelectorAll('td'), (td) => td.textContent);
	assert.deepEqual(cells, ['analytics_id', 'Usage data', 'Third-party', '1 Year']);
});

test('cookie text is inserted as text, so a hostile cookie name cannot inject markup', () => {
	const item = mountItem({
		cookies: [{ name: '<img src=x onerror=alert(1)>', purpose: 'p', provenance: 'r', duration: 'd', category: 'statistics_performance' }]
	});
	assert.equal(item.querySelector('tbody img'), null);
	assert.equal(item.querySelector('tbody td')!.textContent, '<img src=x onerror=alert(1)>');
});

test('an empty cookie list still builds the header row', () => {
	const item = mountItem({ cookies: [] });
	assert.equal(item.querySelectorAll('thead th').length, 4);
	assert.equal(item.querySelectorAll('tbody tr').length, 0);
});
