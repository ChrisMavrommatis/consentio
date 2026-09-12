import test from 'node:test';
import assert from 'node:assert/strict';

import { importScript } from '../helpers.mjs';

const LOADER = new URL('../../src/consentio-loader.js', import.meta.url);

/**
 * A cookie table that comes back 404 costs the visitor the table, not the banner. The
 * settings file is the one fetch that still stops it.
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
	+ ' data-settings-url="/settings.json" data-cookies-url="/cookies.json"></script>';

test('issue 53 - a cookie table that does not load costs the table and not the banner', async () => {
	await importScript(LOADER);
	const injected = document.head.querySelector('script[src="/js/consentio.min.js"]') as HTMLScriptElement;
	await (injected.onload as () => Promise<void>).call(injected);

	assert.equal(calls.length, 1, 'the banner was not constructed');
	const [settings, , cookies] = calls[0] as [Record<string, unknown>, unknown, unknown[]];
	assert.equal(settings.consentRequired, true, 'the settings file still arrives');
	assert.deepEqual(cookies, [], 'no table, not no banner');
	assert.deepEqual(errors, []);
	assert.equal(warnings.length, 1);
	assert.match(warnings[0], /the cookie table did not load, so the settings panel shows no table: .*\/cookies\.json$/);
});
