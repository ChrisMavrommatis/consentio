// The guard is what tells a hand-written dist/ from a released one, and it has no other
// way of being exercised - CI runs it once, on real history. So it gets a throwaway
// repository here, with the three commit shapes it has to sort.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const GUARD = new URL('../../.github/scripts/dist-guard.sh', import.meta.url).pathname;
const BOT = '41898282+github-actions[bot]@users.noreply.github.com';

function repository() {
	const dir = mkdtempSync(join(tmpdir(), 'consentio-guard-'));
	const git = (...args: string[]) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
	git('init', '-q', '-b', 'main');
	git('config', 'user.name', 'A Person');
	git('config', 'user.email', 'person@example.test');
	mkdirSync(join(dir, 'dist'));

	const commit = (subject: string, file: string, bot = false) => {
		writeFileSync(join(dir, file), `${subject}\n`);
		git('add', '-A');
		const args = ['commit', '-q', '-m', subject];
		if (bot) {
			args.unshift('-c', 'user.name=github-actions[bot]', '-c', `user.email=${BOT}`);
		}
		git(...args);
		return git('rev-parse', 'HEAD');
	};

	return { dir, git, commit };
}

function guard(dir: string, before: string, head: string) {
	const run = spawnSync('bash', [GUARD], {
		cwd: dir,
		encoding: 'utf8',
		env: { ...process.env, BEFORE: before, HEAD_SHA: head, BASE_SHA: '' }
	});
	return { passed: run.status === 0, output: run.stdout + run.stderr };
}

test('a commit that leaves dist/ alone passes', () => {
	const { dir, commit } = repository();
	const before = commit('root', 'README.md');
	const head = commit('a source change', 'source.ts');
	const { passed, output } = guard(dir, before, head);
	assert.ok(passed, output);
});

test('the release bot may write dist/', () => {
	const { dir, commit } = repository();
	const before = commit('root', 'README.md');
	const head = commit('release 0.1.0', 'dist/consentio.min.js', true);
	const { passed, output } = guard(dir, before, head);
	assert.ok(passed, output);
	assert.match(output, /^ok /m);
});

test('a person writing dist/ fails, however fresh it is', () => {
	const { dir, commit } = repository();
	const before = commit('root', 'README.md');
	const head = commit('rebuild dist', 'dist/consentio.min.js');
	const { passed, output } = guard(dir, before, head);
	assert.ok(!passed, output);
	assert.match(output, /touches dist\/ but was not written by the release workflow/);
});

test('the bot cannot smuggle one in under another subject', () => {
	const { dir, commit } = repository();
	const before = commit('root', 'README.md');
	const head = commit('tidy up', 'dist/consentio.min.js', true);
	const { passed, output } = guard(dir, before, head);
	assert.ok(!passed, output);
	assert.match(output, /was not written by the release workflow/);
});

test('every commit in the push is judged, not only the tip', () => {
	const { dir, commit } = repository();
	const before = commit('root', 'README.md');
	commit('rebuild dist', 'dist/consentio.min.js');
	const head = commit('a source change', 'source.ts');
	const { passed, output } = guard(dir, before, head);
	assert.ok(!passed, output);
	assert.match(output, /rebuild dist/);
});
