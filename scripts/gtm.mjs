// Builds each Tag Manager template's .tpl out of the parts under its src/. See gtm/README.md.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

const ROOT = new URL('../', import.meta.url);
const TEMPLATES = ['consentio-tag', 'consentio-tag-cookies'];

// A .tpl is these seven sections in this order, and the order is Google's, not ours.
// `array` means every file under the directory, concatenated in filename order.
const SECTIONS = [
	['TERMS_OF_SERVICE', 'terms-of-service.txt', 'text'],
	['INFO', 'info.json', 'json'],
	['TEMPLATE_PARAMETERS', 'parameters', 'array'],
	['SANDBOXED_JS_FOR_WEB_TEMPLATE', 'sandbox.js', 'text'],
	['WEB_PERMISSIONS', 'permissions.json', 'json'],
	['TESTS', 'tests.yaml', 'text'],
	['NOTES', 'notes.txt', 'text']
];

// The terms of service are Google's wording and identical in both templates.
const SHARED = { 'terms-of-service.txt': new URL('gtm/terms-of-service.txt', ROOT) };

const english = parse(readFileSync(new URL('i18n/en.yaml', ROOT), 'utf8'));


// ## The .tpl format ##

// Marker, blank line, body; two blank lines between sections; a BOM at the front, which
// the tag manager's own export writes and its importer expects.
function assemble(bodies) {
	const blocks = SECTIONS.map(([name], i) => `___${name}___\n\n${bodies[i]}`);
	return `﻿${blocks.join('\n\n\n')}\n`;
}

function split(tpl) {
	const bodies = [];
	let rest = tpl.replace(/^﻿/, '');
	for (let i = 0; i < SECTIONS.length; i++) {
		const marker = `___${SECTIONS[i][0]}___\n\n`;
		const at = rest.indexOf(marker);
		if (at === -1) { throw new Error(`no ___${SECTIONS[i][0]}___ section`); }
		rest = rest.slice(at + marker.length);
		const next = i + 1 < SECTIONS.length ? rest.indexOf(`\n\n\n___${SECTIONS[i + 1][0]}___`) : rest.length - 1;
		bodies.push(rest.slice(0, next));
	}
	return bodies;
}

// The tag manager escapes apostrophes and nothing else. Reproducing that is what keeps a
// composed file byte-identical to one exported from the editor.
function serialise(value) {
	return JSON.stringify(value, null, 2).replace(/'/g, '\\u0027');
}


// ## English comes from i18n/en.yaml ##

// A pre-filled field carries the same words the banner falls back to, so it is a reference
// rather than a copy: {"$text": "texts.barTitle"}.
function resolve(node) {
	if (Array.isArray(node)) { return node.map(resolve); }
	if (node && typeof node === 'object') {
		if (typeof node.$text === 'string') {
			const value = node.$text.split('.').reduce((at, key) => at?.[key], english);
			if (typeof value !== 'string') { throw new Error(`i18n/en.yaml has no ${node.$text}`); }
			return value;
		}
		return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, resolve(value)]));
	}
	return node;
}

// The inverse, for --decompose. Only the strings that are already the English become refs.
function reference(node, path = []) {
	if (Array.isArray(node)) { return node.map((v) => reference(v, path)); }
	if (node && typeof node === 'object') {
		const out = {};
		for (const [key, value] of Object.entries(node)) {
			out[key] = key === 'defaultValue' && typeof value === 'string' && ENGLISH_PATHS.has(value)
				? { $text: ENGLISH_PATHS.get(value) }
				: reference(value, path);
		}
		return out;
	}
	return node;
}

const ENGLISH_PATHS = new Map();
for (const [key, value] of Object.entries(english.texts)) { ENGLISH_PATHS.set(value, `texts.${key}`); }
for (const [key, copy] of Object.entries(english.consents)) {
	ENGLISH_PATHS.set(copy.title, `consents.${key}.title`);
	ENGLISH_PATHS.set(copy.description, `consents.${key}.description`);
}


// ## Reading the parts ##

function partsDir(template) { return new URL(`gtm/${template}/src/`, ROOT); }

function compose(template) {
	const src = partsDir(template);
	return assemble(SECTIONS.map(([, file, kind]) => {
		if (kind === 'text') {
			return readFileSync(SHARED[file] ?? new URL(file, src), 'utf8').replace(/\n$/, '');
		}
		if (kind === 'json') {
			return serialise(resolve(JSON.parse(readFileSync(new URL(file, src), 'utf8'))));
		}
		const dir = new URL(`${file}/`, src);
		const entries = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
			.map((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8')));
		return serialise(resolve(entries));
	}));
}

function decompose(from, template) {
	const src = partsDir(template);
	const bodies = split(readFileSync(from, 'utf8'));
	mkdirSync(src, { recursive: true });

	SECTIONS.forEach(([, file, kind], i) => {
		if (kind === 'text') {
			if (!SHARED[file]) { writeFileSync(new URL(file, src), `${bodies[i]}\n`); }
			return;
		}
		if (kind === 'json') {
			writeFileSync(new URL(file, src), `${JSON.stringify(JSON.parse(bodies[i]), null, '\t')}\n`);
			return;
		}
		const dir = new URL(`${file}/`, src);
		mkdirSync(dir, { recursive: true });
		JSON.parse(bodies[i]).forEach((entry, n) => {
			const name = `${String(n + 1).padStart(2, '0')}-${entry.name ?? 'part'}.json`;
			writeFileSync(new URL(name, dir), `${JSON.stringify(reference(entry), null, '\t')}\n`);
		});
	});
}


// ## Run ##

const DECOMPOSE = process.argv.indexOf('--decompose');

if (DECOMPOSE !== -1) {
	// Takes the file the tag manager's editor exported. There is no committed .tpl to
	// split, because the .tpl is built.
	const [from, into] = process.argv.slice(DECOMPOSE + 1);
	if (!from || !into) {
		process.stderr.write(`usage: gtm.mjs --decompose <exported.tpl> <${TEMPLATES.join('|')}>\n`);
		process.exit(1);
	}
	if (!TEMPLATES.includes(into)) {
		process.stderr.write(`'${into}' is not a template. Use one of: ${TEMPLATES.join(', ')}.\n`);
		process.exit(1);
	}
	decompose(from, into);
	process.stdout.write(`gtm: ${from} -> gtm/${into}/src/\n`);
} else if (process.argv.includes('--check')) {
	// Composes and throws nothing away: bad JSON in a part, or a $text naming a string
	// i18n/en.yaml does not have, fails here rather than in the template editor.
	for (const template of TEMPLATES) { compose(template); }
	process.stdout.write(`gtm: ${TEMPLATES.length} templates compose\n`);
} else {
	// build/ mirrors dist/: one file per template, named after the template it is, so what
	// a release ships can be looked at without writing dist/.
	const dest = process.argv.includes('--dist') ? 'dist' : 'build';
	mkdirSync(new URL(`${dest}/`, ROOT), { recursive: true });

	for (const template of TEMPLATES) {
		writeFileSync(new URL(`${dest}/${template}.tpl`, ROOT), compose(template));
	}
	process.stdout.write(`gtm: ${TEMPLATES.length} templates -> ${dest}/<name>.tpl\n`);
}
