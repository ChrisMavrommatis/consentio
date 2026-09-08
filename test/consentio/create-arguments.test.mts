import test from 'node:test';
import assert from 'node:assert/strict';

import Consentio from '../../src/consentio.js';
import type { CookieTableRow } from '../../src/types.js';

/**
 * `Create(settings, language, cookies)` - three objects, one per concern. The two shapes
 * 0.1.0 accepted still work, because a container running an older template sends them and
 * nothing tells its owner a newer one exists.
 */

const COOKIES: CookieTableRow[] = [
	{ name: 'consentio', purpose: 'The stored answer', provenance: 'First-party', duration: '1 year', category: 'strictly_necessary' }
];

test('three objects, each read for its own concern', () => {
	const instance = new Consentio(
		{ consentRequired: true, consents: { statistics_performance: { defaultState: 'granted' } } },
		{ locale: 'el', texts: { barTitle: 'Πολιτική Cookies' }, consents: { strictly_necessary: { title: 'Απολύτως απαραίτητα' } } },
		COOKIES,
		null
	);
	assert.equal(instance.config.consentRequired, true);
	assert.equal(instance.config.locale, 'el');
	assert.equal(instance.config.texts.barTitle, 'Πολιτική Cookies');
	assert.equal(instance.config.consents[0].title, 'Απολύτως απαραίτητα');
	assert.equal(instance.config.consents.find((c) => c.key === 'statistics_performance')!.defaultState, 'granted');
	assert.equal(instance.cookies.length, 1);
});

test('an Array in argument two is 0.1.0 calling, and it is the cookie table', () => {
	const instance = new Consentio({ consentRequired: true }, COOKIES, null);
	assert.equal(instance.cookies.length, 1);
	assert.equal(instance.config.consentRequired, true);
});

test('a settings carrying texts is 0.1.0 config, and is split rather than refused', () => {
	const instance = new Consentio({ cookieName: 'legacy', texts: { barTitle: 'Ours' } }, COOKIES, null);
	assert.equal(instance.settings.cookieName, 'legacy');
	assert.equal(instance.language.texts.barTitle, 'Ours');
	assert.equal(instance.config.texts.barTitle, 'Ours');
	assert.equal(instance.cookies.length, 1);
});

test('0.1.0 categories split into words and behaviour, and alwaysOn is dropped', () => {
	const instance = new Consentio({
		consents: [
			{ key: 'marketing_advertising', title: 'Ads', description: 'Tracking', defaultState: 'granted' },
			{ key: 'preferences_functionality', alwaysOn: true }
		]
	}, [], null);
	const marketing = instance.config.consents.find((c) => c.key === 'marketing_advertising')!;
	assert.equal(marketing.title, 'Ads');
	assert.equal(marketing.description, 'Tracking');
	assert.equal(marketing.defaultState, 'granted');
	const preferences = instance.config.consents.find((c) => c.key === 'preferences_functionality')!;
	assert.equal(preferences.alwaysOn, false, 'only strictly_necessary is ever always-on, and it is derived');
});

test('a pack in argument two beats the wording inside an old config', () => {
	const instance = new Consentio(
		{ texts: { barTitle: 'From the old config', buttonSave: 'Keep' } },
		{ texts: { barTitle: 'From the pack' } },
		[],
		null
	);
	assert.equal(instance.config.texts.barTitle, 'From the pack');
	assert.equal(instance.config.texts.buttonSave, 'Keep', 'what the pack says nothing about still comes through');
});

test('Create takes the same three arguments', () => {
	const instance = Consentio.Create({ cookieName: 'from-create' }, { texts: { barTitle: 'Created' } }, COOKIES);
	assert.equal(instance.config.cookieName, 'from-create');
	assert.equal(instance.config.texts.barTitle, 'Created');
	assert.equal(instance.cookies.length, 1);
	assert.equal(window.ConsentioInstance, instance);
});
