// Builds each language into the json a site passes to Consentio.Create. See i18n/README.md.
//
// One destination per verb: build/i18n/ by default, website/data/i18n/ under `--website`
// beside the site's other json, dist/i18n/ under `--dist`. All three get the same thing:
// `<code>.json`, in the shape Consentio.Create takes.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

const ROOT = new URL('../', import.meta.url);
const SOURCE = new URL('i18n/', ROOT);

// A pack may change every string but no key: a fifth would reach no Google signal.
const CATEGORY_KEYS = [
	'strictly_necessary',
	'preferences_functionality',
	'statistics_performance',
	'marketing_advertising'
];


// ## Reading and checking ##

// en.yaml is the key list the rest are held to.
function readPacks() {
	const problems = [];
	const packs = new Map();
	const fail = (name, message) => problems.push(`i18n/${name}: ${message}`);

	const names = readdirSync(SOURCE).filter((file) => file.endsWith('.yaml')).sort();
	if (!names.includes('en.yaml')) {
		problems.push('i18n/en.yaml is missing, and it is the list every other language is checked against');
		return { packs, problems };
	}

	for (const name of names) {
		const pack = parse(readFileSync(new URL(name, SOURCE), 'utf8'));
		if (!pack || typeof pack !== 'object' || !pack.texts || !pack.consents) {
			fail(name, 'needs a locale, a name, texts and consents');
			continue;
		}
		for (const key of ['locale', 'name']) {
			if (typeof pack[key] !== 'string' || pack[key].trim() === '') { fail(name, `needs a ${key}`); }
		}
		for (const [key, value] of Object.entries(pack.texts)) {
			checkString(fail, name, `texts.${key}`, value);
		}
		for (const key of CATEGORY_KEYS) {
			const category = pack.consents[key];
			if (!category || typeof category !== 'object') {
				fail(name, `consents.${key} is missing`);
				continue;
			}
			checkString(fail, name, `consents.${key}.title`, category.title);
			checkString(fail, name, `consents.${key}.description`, category.description);
		}
		for (const key of Object.keys(pack.consents)) {
			if (!CATEGORY_KEYS.includes(key)) { fail(name, `consents.${key} is not one of the four categories`); }
		}
		packs.set(name, pack);
	}

	const english = packs.get('en.yaml');
	for (const [name, pack] of packs) {
		if (name === 'en.yaml' || !english) { continue; }
		const wanted = Object.keys(english.texts);
		const found = Object.keys(pack.texts);
		for (const key of wanted) {
			if (!found.includes(key)) { fail(name, `texts.${key} is missing`); }
		}
		for (const key of found) {
			if (!wanted.includes(key)) { fail(name, `texts.${key} is not a string the banner uses`); }
		}
	}

	return { packs, problems };
}

// A blank is not a fallback: at runtime it is a supplied value, and shows as an empty string.
function checkString(fail, name, path, value) {
	if (typeof value !== 'string') {
		fail(name, `${path} is missing`);
	} else if (value.trim() === '') {
		fail(name, `${path} is blank - remove the key to fall back to English`);
	}
}


// What Consentio.Create takes.
function bannerPack(pack) {
	return {
		texts: pack.texts,
		consents: CATEGORY_KEYS.map((key) => ({
			key,
			title: pack.consents[key].title,
			description: pack.consents[key].description
		}))
	};
}

// ## Run ##

const checkOnly = process.argv.includes('--check');
// dist/ and the site are both reached by a flag; build/ is what you get otherwise.
const dest = process.argv.includes('--dist') ? 'dist'
	: process.argv.includes('--website') ? 'website'
	: 'build';

const { packs, problems } = readPacks();
if (problems.length > 0) {
	process.stderr.write(`${problems.length} problem${problems.length === 1 ? '' : 's'} in the language files:\n`);
	for (const problem of problems) { process.stderr.write(`  ${problem}\n`); }
	process.exit(1);
}

const locales = [...packs.values()].map((pack) => pack.locale).join(', ');

if (checkOnly) {
	process.stdout.write(`i18n: ${packs.size} languages (${locales}) are complete\n`);
} else {
	const outDir = new URL(dest === 'website' ? 'website/data/i18n/' : `${dest}/i18n/`, ROOT);
	mkdirSync(outDir, { recursive: true });

	for (const pack of packs.values()) {
		writeFileSync(new URL(`${pack.locale}.json`, outDir), `${JSON.stringify(bannerPack(pack), null, '\t')}\n`);
	}

	process.stdout.write(`i18n: ${packs.size} languages (${locales}) -> ${outDir.pathname.replace(ROOT.pathname, '')}\n`);
}
