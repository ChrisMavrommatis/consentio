import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { clearConsents, readConsents, sharedDomain, writeConsents } from '../../../src/lib/consent-store.js';
import ConsentioState from '../../../src/lib/state.js';
import Cookies from '../../../src/lib/cookies.js';
import { CATEGORIES } from '../../basics.mjs';

// jsdom only: the stand-in jar in register-plain.mjs keeps whatever domain it is given,
// and a jar that refuses one the way a browser does is what makes the walk testable at
// all. jsdom's refuses a public suffix and anything that is not a parent of the page.
//
// Each test puts the page on a hostname of its own, because the derived domain is cached
// against the hostname it was derived from.

function pageOn(hostname: string): void {
	const dom = new JSDOM('<!doctype html>', { url: `https://${hostname}/` });
	for (const key of ['window', 'document', 'location']) {
		Object.defineProperty(globalThis, key, {
			value: dom.window[key as 'document'],
			writable: true,
			configurable: true
		});
	}
}

function named(name: string): string[] {
	return document.cookie.split('; ').filter((pair) => pair.startsWith(`${name}=`));
}

test('the shared domain is the broadest one the browser will take', () => {
	pageOn('www.site.com');
	assert.equal(sharedDomain(), 'site.com');
});

test('a domain the browser refuses is walked past rather than used', () => {
	// Stripping the first label off this host gives `b.site.co.uk`, and stripping labels
	// until two are left gives `co.uk`, which no browser accepts. Neither is the answer.
	pageOn('a.b.site.co.uk');
	assert.equal(sharedDomain(), 'site.co.uk');
});

test('a hostname with no dot has no shared domain', () => {
	pageOn('localhost');
	assert.equal(sharedDomain(), '');
});

test('an address literal has no shared domain', () => {
	pageOn('192.168.0.1');
	assert.equal(sharedDomain(), '');
});

test('the probe cookies are gone by the time the walk answers', () => {
	pageOn('shop.probe.test');
	assert.equal(sharedDomain(), 'probe.test');
	assert.equal(document.cookie, '');
});

test('a shared answer is stored, and read back as the answer', () => {
	pageOn('www.share.test');
	assert.equal(writeConsents('consentio', 1, { strictly_necessary: 'granted' }, { shared: true }), true);
	assert.deepEqual(readConsents('consentio', 1), { strictly_necessary: 'granted' });
});

test('clearing removes the shared answer even with sharing turned off', () => {
	pageOn('www.clear.test');
	writeConsents('consentio', 1, { strictly_necessary: 'granted' }, { shared: true });
	assert.equal(named('consentio').length, 1, 'precondition: the shared answer is stored');

	clearConsents('consentio');
	assert.equal(Cookies.get('consentio'), undefined);
});

test('turning sharing off replaces the shared answer instead of leaving two', () => {
	pageOn('www.flip.test');
	writeConsents('consentio', 1, { strictly_necessary: 'granted' }, { shared: true });
	writeConsents('consentio', 1, { strictly_necessary: 'granted', statistics_performance: 'granted' }, {});

	assert.equal(named('consentio').length, 1, 'the browser is sending two cookies of one name');
	assert.deepEqual(readConsents('consentio', 1), {
		strictly_necessary: 'granted',
		statistics_performance: 'granted'
	});
});

test('an answer the browser does not keep reaches the console', () => {
	pageOn('www.warn.test');
	const warnings: string[] = [];
	const logger = { warn: (message: string) => warnings.push(message) } as unknown as Console;
	const set = Cookies.set;
	// Nothing Consentio asks for should be refused now, so a page that keeps no cookie at
	// all stands in for whatever unexpected thing is left.
	Cookies.set = () => '';

	try {
		new ConsentioState('consentio', 1, CATEGORIES, { shared: true }, logger).acceptAll();
	} finally {
		Cookies.set = set;
	}

	assert.equal(warnings.length, 1, 'nothing was said about a dropped cookie');
	assert.match(warnings[0], /did not read back/);
});

test('an answer the browser keeps says nothing at all', () => {
	pageOn('www.quiet.test');
	const warnings: string[] = [];
	const logger = { warn: (message: string) => warnings.push(message) } as unknown as Console;

	new ConsentioState('consentio', 1, CATEGORIES, { shared: true }, logger).acceptAll();

	assert.deepEqual(warnings, []);
});
