import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { importScript } from '../helpers.mjs';

const LOADER = new URL('../../src/consentio-loader.js', import.meta.url);
const VERSION = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).version as string;

/**
 * `data-language="el"` is shorthand for `data-language-url` pointing at the published pack
 * on the CDN, at this loader's own version - the same pin the tag template carries.
 */

const fetched: string[] = [];
globalThis.fetch = ((url: string) => {
	fetched.push(String(url));
	return Promise.resolve({ ok: true, json: () => Promise.resolve({ locale: 'el', texts: { barTitle: 'Πολιτική Cookies' } }) });
}) as unknown as typeof fetch;

const calls: unknown[][] = [];
window.Consentio = function (...args: unknown[]) { calls.push(args); } as unknown as Window['Consentio'];

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js" data-language="el"></script>';

test('a language code fetches the published pack at the loader\'s own version', async () => {
	await importScript(LOADER);
	const injected = document.head.querySelector('script[src="/js/consentio.min.js"]') as HTMLScriptElement;
	await (injected.onload as () => Promise<void>).call(injected);

	assert.deepEqual(fetched, [`https://cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio@${VERSION}/dist/i18n/el.json`]);
	assert.equal(calls.length, 1);
	const [, language] = calls[0] as [unknown, Record<string, unknown>];
	assert.equal(language.locale, 'el');
});
