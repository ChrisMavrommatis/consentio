import test from 'node:test';
import assert from 'node:assert/strict';

import { importScript } from '../helpers.mjs';

const LOADER = new URL('../../src/consentio-loader.js', import.meta.url);

/**
 * With both attributes set, `data-language-url` is fetched and `data-language` is not,
 * and the loader says so once.
 */

const fetched: string[] = [];
globalThis.fetch = ((url: string) => {
	fetched.push(String(url));
	return Promise.resolve({ ok: true, json: () => Promise.resolve({ locale: 'el' }) });
}) as unknown as typeof fetch;

const warnings: unknown[] = [];
globalThis.console = { ...console, warn: (...args: unknown[]) => { warnings.push(args[0]); } } as Console;

window.Consentio = function () {} as unknown as Window['Consentio'];

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js"'
	+ ' data-language="el" data-language-url="/el.json"></script>';

test('data-language-url wins over data-language, with one warning', async () => {
	await importScript(LOADER);
	const injected = document.head.querySelector('script[src="/js/consentio.min.js"]') as HTMLScriptElement;
	await (injected.onload as () => Promise<void>).call(injected);

	assert.deepEqual(fetched, ['/el.json']);
	assert.deepEqual(warnings, ['[Consentio Loader] both data-language and data-language-url are set - data-language-url wins']);
});
