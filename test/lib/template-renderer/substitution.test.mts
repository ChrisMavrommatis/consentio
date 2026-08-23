import test from 'node:test';
import assert from 'node:assert/strict';

import TemplateRenderer from '../../../src/lib/template-renderer.js';

test('a placeholder is replaced by its value', () => {
	assert.equal(TemplateRenderer.render('<h2>{{ title }}</h2>', { title: 'Cookies' }), '<h2>Cookies</h2>');
});

test('whitespace inside the braces is tolerated', () => {
	const data = { x: 'v' };
	assert.equal(TemplateRenderer.render('{{x}}', data), 'v');
	assert.equal(TemplateRenderer.render('{{ x }}', data), 'v');
	assert.equal(TemplateRenderer.render('{{   x   }}', data), 'v');
});

test('the same placeholder is replaced everywhere it appears', () => {
	assert.equal(TemplateRenderer.render('{{ k }}-{{ k }}', { k: 'a' }), 'a-a');
});

test('a placeholder with no matching value becomes empty', () => {
	assert.equal(TemplateRenderer.render('[{{ missing }}]', {}), '[]');
});

test('markup around the placeholders is left alone', () => {
	const template = '<div class="a"><span>{{ v }}</span></div>';
	assert.equal(TemplateRenderer.render(template, { v: 'x' }), '<div class="a"><span>x</span></div>');
});

test('a template with no placeholders is returned unchanged', () => {
	assert.equal(TemplateRenderer.render('<p>plain</p>', {}), '<p>plain</p>');
});
