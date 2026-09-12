import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { asFile, asVariable } from '../../website/scripts/lib/output.js';

/**
 * A builder's variable form is what scripts/i18n.mjs writes for a pack's .gtm.js. The
 * committed English pack is the witness: the same object through both must be one text.
 */

const packs = new URL('../../website/data/i18n/', import.meta.url);

test('the variable form is the .gtm.js wrapper, byte for byte', () => {
	const pack = JSON.parse(readFileSync(new URL('en.json', packs), 'utf8')) as unknown;
	assert.equal(asVariable(pack), readFileSync(new URL('en.gtm.js', packs), 'utf8'));
});

test('the file form is two-space indented and ends in a newline', () => {
	assert.equal(asFile({ a: [1] }), '{\n  "a": [\n    1\n  ]\n}\n');
	assert.equal(asFile({}), '{}\n');
});
