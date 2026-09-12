import test from 'node:test';
import assert from 'node:assert/strict';

import mount, { readoutText, expireEverywhere } from '../../website/scripts/try-it.js';

/**
 * The readout on the two try-it pages. Importing the script runs it once against the
 * empty document, which is what every other page does with it.
 */

const MARKUP = '<button id="consentio-reset"></button><button id="consentio-open"></button>'
	+ '<button id="consentio-refresh"></button><p id="consentio-readout">Reading…</p>';

test('the readout says which route ran and what the cookie holds', () => {
	assert.equal(
		readoutText('consentio', null, true),
		'The script tag ran on this page.\nNo "consentio" cookie. You have not answered yet, so the banner should be showing.'
	);
	assert.equal(readoutText('consentio', '{"version":1}', false), 'No script tag on this page.\nconsentio = {\n  "version": 1\n}');
	assert.match(readoutText('consentio', 'not json', false), /does not parse as JSON/);
});

test('the cookie is expired host-only and at every parent domain', () => {
	assert.deepEqual(expireEverywhere('consentio', 'docs.example.co.uk'), [
		'consentio=; path=/; max-age=0; SameSite=Lax',
		'consentio=; path=/; max-age=0; SameSite=Lax; domain=docs.example.co.uk',
		'consentio=; path=/; max-age=0; SameSite=Lax; domain=example.co.uk',
		'consentio=; path=/; max-age=0; SameSite=Lax; domain=co.uk'
	]);
	assert.deepEqual(expireEverywhere('consentio', 'localhost'), ['consentio=; path=/; max-age=0; SameSite=Lax']);
});

test('a page without the readout is left alone', () => {
	assert.equal(mount(document), false);
});

test('the readout follows the cookie, the refresh control and the consent-update event', () => {
	document.body.innerHTML = MARKUP;
	const readout = document.getElementById('consentio-readout')!;
	assert.equal(mount(document), true);
	assert.match(readout.textContent!, /^No script tag on this page\.\nNo "consentio" cookie/);

	document.cookie = 'consentio=' + encodeURIComponent('{"version":1,"consents":{"strictly_necessary":"granted"}}');
	document.getElementById('consentio-refresh')!.click();
	assert.match(readout.textContent!, /"strictly_necessary": "granted"/);

	document.cookie = 'consentio=; max-age=0';
	document.dispatchEvent(new CustomEvent('consentio:consent-update'));
	assert.match(readout.textContent!, /No "consentio" cookie/);
});

test('the open control guards against a banner that has not loaded, then opens it', () => {
	document.body.innerHTML = MARKUP;
	const readout = document.getElementById('consentio-readout')!;
	mount(document);

	delete window.ConsentioInstance;
	document.getElementById('consentio-open')!.click();
	assert.match(readout.textContent!, /has not loaded yet/);

	let opened = 0;
	window.ConsentioInstance = { openSettings: () => { opened += 1; } };
	document.getElementById('consentio-open')!.click();
	assert.equal(opened, 1);
});

test('the readout uses the name the loader published', () => {
	document.body.innerHTML = MARKUP;
	window.ConsentioDefault = { cookieName: 'answer', version: 1, consents: {}, consentGiven: false };
	mount(document);
	assert.match(document.getElementById('consentio-readout')!.textContent!, /^The script tag ran on this page\.\nNo "answer" cookie/);
	delete window.ConsentioDefault;
});
