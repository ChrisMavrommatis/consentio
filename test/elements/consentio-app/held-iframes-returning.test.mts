import test from 'node:test';
import assert from 'node:assert/strict';

import Cookies from '../../../src/lib/cookies.js';
import { boot } from '../../helpers.mjs';

// A stored answer loads a held iframe as the banner is set up, without a click.
Cookies.set('consentio', JSON.stringify({
	version: 1,
	consents: { strictly_necessary: 'granted', preferences_functionality: 'denied', statistics_performance: 'granted', marketing_advertising: 'denied' }
}));
document.body.insertAdjacentHTML('beforeend', '<iframe id="stats" data-consentio="statistics_performance" data-src="https://embed.example/stats"></iframe>');
document.body.insertAdjacentHTML('beforeend', '<iframe id="ads" data-consentio="marketing_advertising" data-src="https://embed.example/ads"></iframe>');

boot();

test('a returning visitor\'s granted category loads its iframe on set-up, and a denied one stays empty', () => {
	assert.equal(document.getElementById('stats')!.getAttribute('src'), 'https://embed.example/stats');
	assert.equal(document.getElementById('ads')!.getAttribute('src'), null);
});
