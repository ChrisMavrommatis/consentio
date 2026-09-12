import test from 'node:test';
import assert from 'node:assert/strict';

import { importScript } from '../helpers.mjs';

const LOADER = new URL('../../src/consentio-loader.js', import.meta.url);

/**
 * The settings file is the one fetch that stops the banner: running it with behaviour the
 * site did not choose is worse than not running it.
 */

globalThis.fetch = ((url: string) => Promise.resolve({
	ok: !String(url).endsWith('/settings.json'),
	status: 404,
	json: () => Promise.resolve([])
})) as unknown as typeof fetch;

const errors: string[] = [];
const reasons: unknown[] = [];
globalThis.console = {
	...console,
	error: (...args: unknown[]) => { errors.push(String(args[0])); reasons.push(args[1]); }
} as Console;

const calls: unknown[][] = [];
window.Consentio = function (...args: unknown[]) { calls.push(args); } as unknown as Window['Consentio'];

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js"'
	+ ' data-settings-url="/settings.json" data-cookies-url="/cookies.json"></script>';

test('issue 53 - a settings file that does not load still stops the banner', async () => {
	await importScript(LOADER);
	const injected = document.head.querySelector('script[src="/js/consentio.min.js"]') as HTMLScriptElement;
	await (injected.onload as () => Promise<void>).call(injected);

	assert.equal(calls.length, 0, 'the banner ran with settings the site did not choose');
	assert.equal(errors.length, 1);
	assert.match(errors[0], /Initialization failed/);
});

test('issue 55 - the error names the file that did not load and the status', async () => {
	assert.match(String(reasons[0]), /\/settings\.json did not load: HTTP 404/);
});
