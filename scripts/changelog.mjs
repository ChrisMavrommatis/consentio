// Reads CHANGELOG.md. `check` gates a release before anything is built; `extract` prints
// the body that becomes the release notes; `date` stamps the release date at commit time.
// No dependencies - the release workflow runs this on a bare `npm ci`.
//
// Why the section matcher is fussier than it looks: a released section carries its own
// `##` subheadings once `Unreleased` is promoted, so stopping at the next `## ` would cut
// the notes off at their first subheading. Only a *version* heading ends a section.

import { readFileSync, writeFileSync } from 'node:fs';

// CHANGELOG_FILE points the parser at a fixture; the tests are the only caller that
// sets it.
const FILE = process.env.CHANGELOG_FILE
	? new URL(process.env.CHANGELOG_FILE, `file://${process.cwd()}/`)
	: new URL('../CHANGELOG.md', import.meta.url);

// `## 3.0.0`, `## [3.0.0]`, `## [Unreleased]`, any of them with a trailing ` - 2026-08-25`.
const VERSION_HEADING =
	/^##[ \t]+\[?(Unreleased|\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)*)\]?(?:[ \t]+[-–—][ \t]+(\S.*?))?[ \t]*$/i;

const HEADING = /^(#{1,6})([ \t]+\S.*)$/;
const FENCE = /^[ \t]{0,3}(```+|~~~+)/;

// A prerelease has no section of its own; it publishes whatever Unreleased holds.
function resolveSection(input) {
	const name = input.replace(/^v/, '');
	if (/^unreleased$/i.test(name) || name.includes('-')) {
		return 'Unreleased';
	}
	return name;
}

// Marks every line that is inside a fenced code block, so headings in sample output are
// left as content.
function fenced(lines) {
	const inside = new Array(lines.length).fill(false);
	let open = null;
	for (const [index, line] of lines.entries()) {
		const fence = FENCE.exec(line);
		if (open === null) {
			if (fence) {
				open = fence[1][0];
				inside[index] = true;
			}
			continue;
		}
		inside[index] = true;
		if (fence && fence[1][0] === open) {
			open = null;
		}
	}
	return inside;
}

function locate(section) {
	const lines = readFileSync(FILE, 'utf8').split('\n');
	const inside = fenced(lines);

	let start = -1;
	let end = lines.length;
	for (const [index, line] of lines.entries()) {
		if (inside[index]) {
			continue;
		}
		const heading = VERSION_HEADING.exec(line);
		if (!heading) {
			continue;
		}
		if (start === -1) {
			if (heading[1].toLowerCase() === section.toLowerCase()) {
				start = index;
			}
			continue;
		}
		end = index;
		break;
	}

	return { lines, inside, start, end };
}

function body(section) {
	const { lines, inside, start, end } = locate(section);
	if (start === -1) {
		return null;
	}
	const slice = lines.slice(start + 1, end);
	const insideSlice = inside.slice(start + 1, end);
	while (slice.length && !slice[0].trim()) {
		slice.shift();
		insideSlice.shift();
	}
	while (slice.length && !slice[slice.length - 1].trim()) {
		slice.pop();
		insideSlice.pop();
	}
	return { slice, insideSlice };
}

// In the file a release is `##` and its own sections are `###`, under one `# Changelog`.
// A release body has no such parent, so lift the shallowest heading to `##` and move the
// rest by the same amount - relative depth survives and nothing has to be recorded.
function promote({ slice, insideSlice }) {
	let shallowest = 7;
	for (const [index, line] of slice.entries()) {
		if (insideSlice[index]) {
			continue;
		}
		const heading = HEADING.exec(line);
		if (heading) {
			shallowest = Math.min(shallowest, heading[1].length);
		}
	}
	const shift = shallowest === 7 ? 0 : 2 - shallowest;
	if (shift === 0) {
		return slice;
	}
	return slice.map((line, index) => {
		if (insideSlice[index]) {
			return line;
		}
		const heading = HEADING.exec(line);
		return heading ? '#'.repeat(heading[1].length + shift) + heading[2] : line;
	});
}

function fail(message) {
	process.stderr.write(`${message}\n`);
	process.exit(1);
}

const [command, argument, extra] = process.argv.slice(2);

if (!command || !argument) {
	fail('usage: changelog.mjs check|extract <section> | changelog.mjs date <section> <YYYY-MM-DD>');
}

const section = resolveSection(argument);
const found = body(section);

if (command === 'check') {
	if (!found) {
		fail(`CHANGELOG.md has no '## [${section}]' section.`);
	}
	if (!found.slice.some((line) => line.trim())) {
		fail(`CHANGELOG.md section '${section}' is empty.`);
	}
	process.stdout.write(`CHANGELOG.md section '${section}' is present and not empty.\n`);
} else if (command === 'extract') {
	if (!found) {
		fail(`CHANGELOG.md has no '## [${section}]' section.`);
	}
	process.stdout.write(`${promote(found).join('\n')}\n`);
} else if (command === 'date') {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(extra ?? '')) {
		fail('date needs a YYYY-MM-DD argument.');
	}
	const { lines, start } = locate(section);
	if (start === -1) {
		fail(`CHANGELOG.md has no '## [${section}]' section.`);
	}
	const bracketed = lines[start].includes('[');
	lines[start] = `## ${bracketed ? `[${section}]` : section} - ${extra}`;
	writeFileSync(FILE, lines.join('\n'));
	process.stdout.write(`${lines[start]}\n`);
} else {
	fail(`Unknown command '${command}'.`);
}
