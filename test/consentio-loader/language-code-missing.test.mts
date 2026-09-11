import test from 'node:test';
import assert from 'node:assert/strict';

import { importScript } from '../helpers.mjs';

const LOADER = new URL('../../src/consentio-loader.js', import.meta.url);

/**
 * A code with no published pack is a 404 on the CDN. The banner still renders, in its
 * built-in English, and the loader says which file did not load.
 */

globalThis.fetch = ((url: string) => Promise.resolve({
	ok: String(url).endsWith('/settings.json'),
	status: 404,
	json: () => Promise.resolve({ consentRequired: true })
})) as unknown as typeof fetch;

const warnings: string[] = [];
const errors: unknown[] = [];
globalThis.console = {
	...console,
	warn: (...args: unknown[]) => { warnings.push(String(args[0])); },
	error: (...args: unknown[]) => { errors.push(args[0]); }
} as Console;

const calls: unknown[][] = [];
window.Consentio = function (...args: unknown[]) { calls.push(args); } as unknown as Window['Consentio'];

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js"'
	+ ' data-settings-url="/settings.json" data-language="xx"></script>';

test('a code with no pack falls back to built-in English and still renders', async () => {
	await importScript(LOADER);
	const injected = document.head.querySelector('script[src="/js/consentio.min.js"]') as HTMLScriptElement;
	await (injected.onload as () => Promise<void>).call(injected);

	assert.equal(calls.length, 1, 'the banner was not constructed');
	const [settings, language] = calls[0] as [Record<string, unknown>, Record<string, unknown>];
	assert.equal(settings.consentRequired, true, 'the settings file still arrives');
	assert.deepEqual(language, {}, 'the language falls back to nothing, which is the built-in English');
	assert.deepEqual(errors, []);
	assert.equal(warnings.length, 1);
	assert.match(warnings[0], /the language file did not load, so the banner keeps its built-in English: .*\/dist\/i18n\/xx\.json$/);
});
