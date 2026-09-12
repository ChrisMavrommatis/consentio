import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The rule that a markdown page carries no JavaScript: a page names its scripts in front
 * matter, each one is a TypeScript file under website/scripts/, and the layout is the one
 * place that prints a script tag for them.
 */

const ROOT = new URL('../../', import.meta.url).pathname;
const PAGES = join(ROOT, 'website/pages');

function markdownFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const file = join(dir, name);
		return statSync(file).isDirectory() ? markdownFiles(file) : name.endsWith('.md') ? [file] : [];
	});
}

function frontMatter(source: string): string {
	return /^---\n([\s\S]*?)\n---\n/.exec(source)?.[1] ?? '';
}

// Fenced blocks and inline code show script tags to the reader; only what is outside them runs.
function prose(source: string): string {
	return source.slice(frontMatter(source).length).replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

const pages = markdownFiles(PAGES);

test('no page carries a script with code in it', () => {
	for (const page of pages) {
		const tags = prose(readFileSync(page, 'utf8')).match(/<script\b[^>]*>/g) ?? [];
		for (const tag of tags) {
			assert.match(tag, /type="application\/json"/, `${page.slice(ROOT.length)} has ${tag}`);
		}
	}
});

test('every script a page names is a TypeScript file under website/scripts/', () => {
	let named = 0;
	for (const page of pages) {
		const list = /^scripts:\s*\[([^\]]*)\]/m.exec(frontMatter(readFileSync(page, 'utf8')))?.[1];
		if (!list) {
			continue;
		}
		for (const name of list.split(',').map((s) => s.trim())) {
			named += 1;
			assert.ok(existsSync(join(ROOT, 'website/scripts', `${name}.ts`)), `${page.slice(ROOT.length)} names ${name}, which has no source`);
		}
	}
	assert.ok(named > 0, 'no page names a script');
});

test('the layout prints the tags, deferred, and nothing else does', () => {
	const layout = readFileSync(join(ROOT, 'website/_layouts/base.html'), 'utf8');
	assert.match(layout, /for script in page\.scripts[\s\S]*?\/js\/pages\/[\s\S]*?defer/);
	for (const page of pages) {
		assert.doesNotMatch(readFileSync(page, 'utf8'), /js\/pages\//, `${page.slice(ROOT.length)} prints its own tag`);
	}
});

test('the built scripts are ignored and the sources are typechecked', () => {
	assert.match(readFileSync(join(ROOT, '.gitignore'), 'utf8'), /^\/website\/js\/pages$/m);
	assert.match(readFileSync(join(ROOT, 'tsconfig.json'), 'utf8'), /website\/scripts\/\*\*\/\*\.ts/);
});
