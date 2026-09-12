import test from 'node:test';
import assert from 'node:assert/strict';

import Consentio from '../../src/consentio.js';
import type { CookieTableRow } from '../../src/types.js';

/**
 * `Create(settings, language, cookies)` - three objects, one per concern, and the only
 * shape there is. 0.1.0's merged config and its positional call were retired in 1.0.0:
 * a template loads the release it shipped in, so it speaks that release's shape.
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

test('defect 51 - Create keeps the console as its logger, and a debug line does not throw', () => {
	const instance = Consentio.Create({ debug: true }, { texts: { barTitle: 'Ours' } }, COOKIES);
	assert.equal(instance.logger.logger, window.console);
	assert.equal(instance.cookies.length, 1);
	assert.doesNotThrow(() => instance.logger.log('[Consentio] a debug line', 'info'));
});

test('anything but an Array in argument three is no cookie table', () => {
	const instance = new Consentio({}, {}, { name: 'consentio' } as never, null);
	assert.equal(instance.cookies.length, 0);
});

test('Create takes the same three arguments', () => {
	const instance = Consentio.Create({ cookieName: 'from-create' }, { texts: { barTitle: 'Created' } }, COOKIES);
	assert.equal(instance.config.cookieName, 'from-create');
	assert.equal(instance.config.texts.barTitle, 'Created');
	assert.equal(instance.cookies.length, 1);
	assert.equal(window.ConsentioInstance, instance);
});
