import test from 'node:test';
import assert from 'node:assert/strict';

import TemplateRenderer from '../../../src/lib/template-renderer.js';

test('a value cannot inject markup', () => {
	const rendered = TemplateRenderer.render('<p>{{ v }}</p>', { v: '<img src=x onerror=alert(1)>' });
	assert.equal(rendered, '<p>&lt;img src=x onerror=alert(1)&gt;</p>');
	assert.doesNotMatch(rendered, /<img/);
});

test('a value cannot close the surrounding element', () => {
	assert.doesNotMatch(TemplateRenderer.render('<p>{{ v }}</p>', { v: '</p><script>x</script>' }), /<script>/);
});

test('ampersands are escaped', () => {
	assert.equal(TemplateRenderer.render('{{ v }}', { v: 'Tom & Jerry' }), 'Tom &amp; Jerry');
});

test('domSanitize escapes angle brackets and ampersands', () => {
	assert.equal(TemplateRenderer.domSanitize('<b>&</b>'), '&lt;b&gt;&amp;&lt;/b&gt;');
});

test('regexSanitize strips path-hostile characters', () => {
	assert.equal(TemplateRenderer.regexSanitize('a/b:c*d', '-'), 'a-b-c-d');
});
