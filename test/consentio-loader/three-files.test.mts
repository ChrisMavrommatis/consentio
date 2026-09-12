import test from 'node:test';
import assert from 'node:assert/strict';

import { importScript } from '../helpers.mjs';

const LOADER = new URL('../../src/consentio-loader.js', import.meta.url);

/**
 * The loader fetches three files, one per concern, and hands them to Create as three
 * objects.
 */

const FILES: Record<string, unknown> = {
	'/settings.json': { consentRequired: true, consents: { statistics_performance: { defaultState: 'granted' } } },
	'/el.json': { locale: 'el', texts: { barTitle: 'Πολιτική Cookies' } },
	'/cookies.json': [{ name: 'consentio', purpose: 'The stored answer', provenance: 'First-party', duration: '1 year', category: 'strictly_necessary' }]
};

globalThis.fetch = ((url: string) => Promise.resolve({
	ok: true,
	json: () => Promise.resolve(FILES[String(url)])
})) as unknown as typeof fetch;

const calls: unknown[][] = [];
window.Consentio = function (...args: unknown[]) { calls.push(args); } as unknown as Window['Consentio'];

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js"'
	+ ' data-settings-url="/settings.json" data-language-url="/el.json" data-cookies-url="/cookies.json"></script>';

test('the three files reach Create as three objects, in that order', async () => {
	await importScript(LOADER);
	const injected = document.head.querySelector('script[src="/js/consentio.min.js"]') as HTMLScriptElement;
	assert.ok(injected, 'no bundle was injected');
	await (injected.onload as () => Promise<void>).call(injected);

	assert.equal(calls.length, 1);
	const [settings, language, cookies] = calls[0] as [Record<string, unknown>, Record<string, unknown>, unknown[]];
	assert.equal(settings.consentRequired, true);
	assert.equal(language.locale, 'el');
	assert.equal(cookies.length, 1);
});
