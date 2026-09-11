import test from 'node:test';
import assert from 'node:assert/strict';

import Cookies from '../../../src/lib/cookies.js';
import { boot } from '../../helpers.mjs';

// The stored answer and the held scripts both have to be on the page before the banner is.
Cookies.set('consentio', JSON.stringify({
	version: 1,
	consents: {
		strictly_necessary: 'granted',
		preferences_functionality: 'denied',
		statistics_performance: 'granted',
		marketing_advertising: 'denied'
	}
}));
document.body.insertAdjacentHTML('beforeend', `
	<script type="text/plain" data-consentio="statistics_performance" src="/js/analytics.js"></script>
	<script type="text/plain" data-consentio="marketing_advertising" src="/js/pixel.js"></script>
`);

const held = (key: string) => document.querySelector<HTMLScriptElement>(`script[data-consentio="${key}"]`)!;

boot();

test('a category granted on a previous visit runs its script as the banner appears', () => {
	assert.equal(held('statistics_performance').getAttribute('type'), null);
	assert.equal(held('statistics_performance').getAttribute('src'), '/js/analytics.js');
});

test('a category denied on a previous visit stays held', () => {
	assert.equal(held('marketing_advertising').getAttribute('type'), 'text/plain');
});
