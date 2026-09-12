import test from 'node:test';
import assert from 'node:assert/strict';

// A data-version that is not a whole number used to become NaN, which matches no stored
// answer, so the banner asked on every page with nothing on the console. Issue 54.

const warnings: string[] = [];
globalThis.console = {
	...console,
	warn: (...args: unknown[]) => { warnings.push(String(args[0])); }
} as Console;

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js" data-version="v2"></script>';

test('issue 54 - a data-version that is not a whole number falls back to 1 and says so', async () => {
	await import('../../src/consentio-loader.js');
	assert.equal(window.ConsentioDefault!.version, 1);
	assert.equal(warnings.length, 1);
	assert.match(warnings[0], /data-version "v2" is not a whole number, so version 1 is used/);
});
