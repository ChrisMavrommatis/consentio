import test from 'node:test';
import assert from 'node:assert/strict';

import { boot } from '../../helpers.mjs';

// One held iframe per category. An iframe loads the moment it has a src, so "loaded" is
// asserted as: the src is there and data-src is gone.
const KEYS = ['strictly_necessary', 'preferences_functionality', 'statistics_performance', 'marketing_advertising'];
for (const key of KEYS) {
	document.body.insertAdjacentHTML('beforeend', `<iframe data-consentio="${key}" data-src="https://embed.example/${key}" title="${key}"></iframe>`);
}
document.body.insertAdjacentHTML('beforeend', '<iframe id="unmarked" data-src="https://embed.example/unmarked" title="unmarked"></iframe>');
document.body.insertAdjacentHTML('beforeend', '<iframe id="already" data-consentio="statistics_performance" src="https://embed.example/already" data-src="https://embed.example/other" title="already"></iframe>');

const held = (key: string) => document.querySelector<HTMLIFrameElement>(`iframe[data-consentio="${key}"][title="${key}"]`)!;
const loaded = (key: string) => held(key).getAttribute('src') === `https://embed.example/${key}` && !held(key).hasAttribute('data-src');

const app = boot();

test('nothing loads at the default, the always-on category included', () => {
	assert.ok(KEYS.every((key) => held(key).getAttribute('src') === null));
});

test('granting one category loads that iframe and no other', () => {
	app.saveSettings(new CustomEvent('consentio:save-settings', {
		detail: { strictly_necessary: 'granted', preferences_functionality: 'denied', statistics_performance: 'granted', marketing_advertising: 'denied' }
	}));

	assert.equal(loaded('statistics_performance'), true);
	assert.ok(['preferences_functionality', 'marketing_advertising'].every((key) => held(key).getAttribute('src') === null));
});

test('the element stays where it was, with its other attributes', () => {
	assert.equal(held('statistics_performance').getAttribute('title'), 'statistics_performance');
	assert.equal(held('statistics_performance').dataset.consentio, 'statistics_performance');
});

test('revoking does not unload it, and accepting all loads the rest', () => {
	app.saveSettings(new CustomEvent('consentio:save-settings', {
		detail: { strictly_necessary: 'granted', preferences_functionality: 'denied', statistics_performance: 'denied', marketing_advertising: 'denied' }
	}));
	assert.equal(loaded('statistics_performance'), true);

	app.acceptAll(new CustomEvent('consentio:accept-all-consents'));
	assert.ok(KEYS.every((key) => loaded(key)));
});

test('an iframe without data-consentio, or one that already has a src, is never touched', () => {
	assert.equal(document.getElementById('unmarked')!.getAttribute('src'), null);
	assert.equal(document.getElementById('already')!.getAttribute('src'), 'https://embed.example/already');
	assert.equal(document.getElementById('already')!.dataset.src, 'https://embed.example/other');
});
