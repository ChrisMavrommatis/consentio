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

// --- defect 29 -------------------------------------------------------------

test('issue 29 - domSanitize escapes both quotes', () => {
	assert.equal(TemplateRenderer.domSanitize(`a "b" and 'c'`), 'a &quot;b&quot; and &#39;c&#39;');
});

test('issue 29 - a value cannot break out of the attribute it is placed in', () => {
	const rendered = TemplateRenderer.render('<div title="{{ v }}"></div>', { v: '" onmouseover="alert(1)' });
	const host = document.createElement('div');
	host.innerHTML = rendered;
	const child = host.firstElementChild!;
	assert.equal(child.getAttribute('onmouseover'), null, 'the value stayed inside the attribute');
	assert.equal(child.getAttribute('title'), '" onmouseover="alert(1)');
});

test('regexSanitize strips path-hostile characters', () => {
	assert.equal(TemplateRenderer.regexSanitize('a/b:c*d', '-'), 'a-b-c-d');
});
