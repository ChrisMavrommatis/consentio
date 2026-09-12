// Builds each Tag Manager template's .tpl out of the parts under its src/. See gtm/README.md.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

const ROOT = new URL('../', import.meta.url);
const TEMPLATES = ['consentio-tag'];

// The CDN pin. `sandbox.js` writes `consentio@__VERSION__` and this fills it in from
// package.json, so the .tpl a release attaches loads that release's bundle.
const VERSION = JSON.parse(readFileSync(new URL('package.json', ROOT), 'utf8')).version;
const PIN = /consentio@(?:__VERSION__|\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)/g;

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

// The locale picker lists the language files, so shipping a language means writing its
// yaml and nothing here. Node names the language in English; a name that is not ascii
// would reach the tag manager's screen, so the code alone is shown for one.
const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
const LOCALE_ITEMS = readdirSync(new URL('i18n/', ROOT)).filter((f) => f.endsWith('.yaml')).sort()
	.map((f) => parse(readFileSync(new URL(`i18n/${f}`, ROOT), 'utf8')).locale)
	.map((locale) => {
		const name = languageNames.of(locale);
		return { value: locale, displayValue: /^[\x20-\x7e]+$/.test(name) ? `${name} (${locale})` : locale };
	});


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

// A pre-filled field holds {"$text": "texts.barTitle"} rather than a copy of the words,
// and the locale picker holds {"$locales": true} rather than a list.
function resolve(node) {
	if (Array.isArray(node)) { return node.map(resolve); }
	if (node && typeof node === 'object') {
		if (typeof node.$text === 'string') {
			const value = node.$text.split('.').reduce((at, key) => at?.[key], english);
			if (typeof value !== 'string') { throw new Error(`i18n/en.yaml has no ${node.$text}`); }
			return value;
		}
		if (node.$locales === true) { return LOCALE_ITEMS; }
		return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, resolve(value)]));
	}
	return node;
}

// The inverse, for --decompose. Only the strings that are already the English become refs,
// and only a select listing exactly the locales becomes the picker.
function reference(node, path = []) {
	if (Array.isArray(node)) { return node.map((v) => reference(v, path)); }
	if (node && typeof node === 'object') {
		const out = {};
		for (const [key, value] of Object.entries(node)) {
			if (key === 'defaultValue' && typeof value === 'string' && ENGLISH_PATHS.has(value)) {
				out[key] = { $text: ENGLISH_PATHS.get(value) };
			} else if (key === 'selectItems' && JSON.stringify(value) === JSON.stringify(LOCALE_ITEMS)) {
				out[key] = { $locales: true };
			} else {
				out[key] = reference(value, path);
			}
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
			const body = readFileSync(SHARED[file] ?? new URL(file, src), 'utf8').replace(/\n$/, '');
			return body.replace(PIN, `consentio@${VERSION}`);
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
			// Back to the placeholder, so a decompose of a released .tpl does not freeze
			// that release's version into the source it came from.
			if (!SHARED[file]) {
				writeFileSync(new URL(file, src), `${bodies[i].replace(PIN, 'consentio@__VERSION__')}\n`);
			}
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
	// build/ mirrors dist/, so what a release ships can be looked at without writing dist/.
	const dest = process.argv.includes('--dist') ? 'dist' : 'build';
	mkdirSync(new URL(`${dest}/`, ROOT), { recursive: true });

	for (const template of TEMPLATES) {
		writeFileSync(new URL(`${dest}/${template}.tpl`, ROOT), compose(template));
	}
	process.stdout.write(`gtm: ${TEMPLATES.length} template -> ${dest}/<name>.tpl\n`);
}
