import test from 'node:test';
import assert from 'node:assert/strict';

import { importScript } from '../helpers.mjs';

const LOADER = new URL('../../src/consentio-loader.js', import.meta.url);

/**
 * A site on 0.1.0's two files is untouched: the merged config still arrives as argument
 * one, the cookie table still arrives as argument three, and the banner splits the first.
 * It is told once, on the console, that the attribute goes in 1.0.0.
 */

const CONFIG = { consentRequired: true, texts: { barTitle: 'Ours' }, consents: [{ key: 'marketing_advertising', title: 'Ads' }] };
const COOKIES = [{ name: 'consentio', purpose: 'The stored answer', provenance: 'First-party', duration: '1 year', category: 'strictly_necessary' }];

const FILES: Record<string, unknown> = { '/c.json': CONFIG, '/cookies.json': COOKIES };

globalThis.fetch = ((url: string) => Promise.resolve({
	ok: true,
	json: () => Promise.resolve(FILES[String(url)])
})) as unknown as typeof fetch;

const warnings: unknown[] = [];
globalThis.console = { ...console, warn: (...args: unknown[]) => { warnings.push(args[0]); } } as Console;

const calls: unknown[][] = [];
window.Consentio = function (...args: unknown[]) { calls.push(args); } as unknown as Window['Consentio'];

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js"'
	+ ' data-config-url="/c.json" data-cookies-url="/cookies.json"></script>';

test('the merged config and the cookie table arrive where they always did', async () => {
	await importScript(LOADER);
	const injected = document.head.querySelector('script[src="/js/consentio.min.js"]') as HTMLScriptElement;
	await (injected.onload as () => Promise<void>).call(injected);

	assert.equal(calls.length, 1);
	const [settings, language, cookies] = calls[0] as [Record<string, unknown>, Record<string, unknown>, unknown[]];
	assert.deepEqual(settings, CONFIG, 'the file is handed over as it was written');
	assert.deepEqual(language, {}, 'there is no language file on this route');
	assert.deepEqual(cookies, COOKIES);
});

test('the deprecation is said once, naming the two attributes to move to', () => {
	assert.deepEqual(warnings, ['[Consentio Loader] data-config-url is deprecated and is removed in 1.0.0 - use data-settings-url and data-language-url']);
});
