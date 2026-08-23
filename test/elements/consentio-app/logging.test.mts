import test from 'node:test';
import assert from 'node:assert/strict';

import type ConsentioLogger from '../../../src/lib/logger.js';
import { boot } from '../../helpers.mjs';

const app = boot();

const saveEvent = () => new CustomEvent('consentio:save-settings', {
	detail: {
		strictly_necessary: 'granted',
		preferences_functionality: 'denied',
		statistics_performance: 'denied',
		marketing_advertising: 'denied'
	}
});

test('issue 19 - saving with no logger attached does not throw', { todo: true }, () => {
	const saved = app.logger;
	app.logger = null;
	try {
		// Called directly rather than dispatched: the DOM swallows a listener's exception,
		// which would make this assertion pass for the wrong reason.
		assert.doesNotThrow(() => app.saveSettings(saveEvent()));
	} finally {
		app.logger = saved;
	}
});

test('issue 19 - a message is logged, not the whole event object', { todo: true }, () => {
	const logged: unknown[] = [];
	const saved = app.logger;
	app.logger = { log: (text: unknown) => { logged.push(text); } } as unknown as ConsentioLogger;
	try {
		app.saveSettings(saveEvent());
		assert.ok(logged.length > 0, 'nothing was logged at all');
		assert.ok(logged.every((entry) => typeof entry === 'string'), `logged a non-string: ${typeof logged[0]}`);
	} finally {
		app.logger = saved;
	}
});
