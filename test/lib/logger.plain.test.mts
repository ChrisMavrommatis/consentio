import test from 'node:test';
import assert from 'node:assert/strict';

import ConsentioLogger from '../../src/lib/logger.js';

interface Recorded { level: string; text: unknown }

function recorder(): { console: Console; calls: Recorded[] } {
	const calls: Recorded[] = [];
	const record = (level: string) => (text: unknown) => { calls.push({ level, text }); };
	return {
		calls,
		console: { error: record('error'), warn: record('warn'), info: record('info'), log: record('log') } as unknown as Console
	};
}

test('nothing is logged while debug is off', () => {
	const { console, calls } = recorder();
	new ConsentioLogger(console, false).log('quiet', 'info');
	assert.deepEqual(calls, []);
});

test('each level reaches the matching console method', () => {
	for (const level of ['error', 'warn', 'info'] as const) {
		const { console, calls } = recorder();
		new ConsentioLogger(console, true).log('m', level);
		assert.deepEqual(calls, [{ level, text: 'm' }]);
	}
});

test('an unknown level falls back to console.log', () => {
	const { console, calls } = recorder();
	new ConsentioLogger(console, true).log('m');
	assert.deepEqual(calls, [{ level: 'log', text: 'm' }]);
});

test('a null console is tolerated even with debug on', () => {
	assert.doesNotThrow(() => new ConsentioLogger(null, true).log('m', 'error'));
});
