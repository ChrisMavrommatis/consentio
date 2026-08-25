// The changelog parser gates every release and prints the release body, so the four
// things it has to get right are pinned here against fixtures rather than against the
// real CHANGELOG.md, which will change under it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = new URL('../../scripts/changelog.mjs', import.meta.url).pathname;

function run(changelog: string, ...args: string[]) {
	const file = join(mkdtempSync(join(tmpdir(), 'consentio-changelog-')), 'CHANGELOG.md');
	writeFileSync(file, changelog);
	return execFileSync(process.execPath, [SCRIPT, ...args], {
		encoding: 'utf8',
		env: { ...process.env, CHANGELOG_FILE: file }
	}).trimEnd();
}

const PROMOTED = `# Changelog

## [3.0.0] - 2026-01-02

## Added

- a thing

## Fixed

- another thing

## 2.0.0

- the older one
`;

test('a section ends at the next version heading, not the next ## ', () => {
	const body = run(PROMOTED, 'extract', '3.0.0');
	assert.match(body, /## Added/);
	assert.match(body, /## Fixed/, 'the notes were truncated at their first subheading');
	assert.doesNotMatch(body, /the older one/);
});

test('a bare `## 2.0.0` heading is a version heading too', () => {
	assert.equal(run(PROMOTED, 'extract', '2.0.0'), '- the older one');
});

test('headings are promoted so the shallowest becomes ##, keeping relative depth', () => {
	const body = run(`# Changelog

## [1.0.0]

### Added

- a thing

#### Detail

## [0.9.0]
`, 'extract', '1.0.0');
	assert.equal(body, ['## Added', '', '- a thing', '', '### Detail'].join('\n'));
});

test('headings inside a fenced code block are content, not structure', () => {
	const body = run(`# Changelog

## [1.0.0]

### Added

\`\`\`markdown
## 2.0.0
### not a heading here
\`\`\`

## [0.9.0]

- older
`, 'extract', '1.0.0');
	assert.match(body, /## 2\.0\.0/, 'the fenced sample ended the section');
	assert.match(body, /### not a heading here/, 'the fenced sample was promoted');
	assert.doesNotMatch(body, /older/);
});

test('check fails on a missing section and on an empty one', () => {
	const file = `# Changelog

## [Unreleased]

## [1.0.0]

- shipped
`;
	assert.throws(() => run(file, 'check', 'Unreleased'), /empty/);
	assert.throws(() => run(file, 'check', '2.0.0'), /no '## \[2\.0\.0\]'/);
	assert.equal(run(file, 'check', '1.0.0'), "CHANGELOG.md section '1.0.0' is present and not empty.");
});

test('a prerelease publishes Unreleased, and a leading v is stripped', () => {
	const file = `# Changelog

## [Unreleased]

- pending

## [1.0.0] - 2026-01-01

- shipped
`;
	assert.equal(run(file, 'extract', 'v0.1.0-beta.1'), '- pending');
	assert.equal(run(file, 'extract', 'v1.0.0'), '- shipped');
});

test('date stamps the heading and keeps the bracket style', () => {
	const file = `# Changelog

## [1.0.0]

- shipped
`;
	assert.equal(run(file, 'date', '1.0.0', '2026-08-25'), '## [1.0.0] - 2026-08-25');
	assert.equal(run(file.replace('[1.0.0]', '1.0.0'), 'date', '1.0.0', '2026-08-25'), '## 1.0.0 - 2026-08-25');
});
