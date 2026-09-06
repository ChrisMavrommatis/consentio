// What fails when a part stops composing: bad JSON, or a $text naming a string that is
// not in i18n/en.yaml. The .tpl is built, so there is no committed file to compare against.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const SCRIPT = new URL('../../scripts/gtm.mjs', import.meta.url).pathname;

test('every template composes from its parts', () => {
	const output = execFileSync(process.execPath, [SCRIPT, '--check'], { encoding: 'utf8' });
	assert.match(output, /templates compose/);
});
