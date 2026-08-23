import test from 'node:test';
import assert from 'node:assert/strict';

import { boot } from '../../helpers.mjs';

const app = boot();

test('assigning config after the first render rebuilds the bar and the modal', () => {
	const before = app.bar;
	app.config = { consentRequired: false };
	assert.notEqual(app.bar, before, 'render() builds fresh nodes');
});

test('issue 13 - a re-render re-applies visibility instead of showing everything', { todo: true }, () => {
	const visible = [app.bar, app.modal].filter((el) => el!.style.display !== 'none');
	assert.ok(
		visible.length <= 1,
		'the fresh nodes carry no inline display, and initState only runs from connectedCallback'
	);
});

test('issue 13 - the bar is the one that stays visible after a re-render', { todo: true }, () => {
	assert.equal(app.bar!.style.display, 'block');
	assert.equal(app.modal!.style.display, 'none');
});
