import test from 'node:test';
import assert from 'node:assert/strict';

import TemplateRenderer from '../../../src/lib/template-renderer.js';

// `render` uses `data[p1] || ''`, so every falsy value is replaced by an empty string.
// The signature says Record<string, string>, but the config is site-supplied JSON and
// nothing validates it before it reaches here.
const loose = (data: Record<string, unknown>) => data as Record<string, string>;

test('issue 17 - a zero is rendered, not silently dropped', () => {
	assert.equal(TemplateRenderer.render('{{ n }}', loose({ n: 0 })), '0');
});

test('issue 17 - a false is rendered, not silently dropped', () => {
	assert.equal(TemplateRenderer.render('{{ b }}', loose({ b: false })), 'false');
});

test('an empty string renders as empty either way', () => {
	assert.equal(TemplateRenderer.render('[{{ s }}]', { s: '' }), '[]');
});
