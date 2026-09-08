// What a site gets when it hides the floating button and points its own link at
// openSettings instead. Every path that used to show the button has to survive it
// being absent. Issue 40.
import test from 'node:test';
import assert from 'node:assert/strict';

import { boot } from '../../helpers.mjs';

const app = boot({ hideFloatingButton: true });

const shown = (el: HTMLElement | null) => el!.style.display !== 'none';

test('issue 40 - no button is rendered at all', () => {
	assert.equal(app.floatingButton, null);
	assert.equal(shown(app.bar), true, 'a visitor who has not answered still gets the bar');
});

test('issue 40 - the panel opens and cancelling comes back to the bar', () => {
	app.openSettings();
	assert.equal(shown(app.modal), true);

	app.cancelSettings(new CustomEvent('consentio:cancel-settings'));
	assert.equal(shown(app.modal), false);
	assert.equal(shown(app.bar), true);
});

test('issue 40 - rejecting stores the answer with nothing to hand focus to', () => {
	app.rejectAll(new CustomEvent('consentio:reject-all-consents'));

	assert.equal(app.state.consentGiven, true);
	assert.equal(shown(app.bar), false);
	assert.equal(app._focus.container, null, 'nothing blocks the page');
});

test('issue 40 - saving from the reopened panel works', () => {
	app.openSettings();
	app.saveSettings(new CustomEvent('consentio:save-settings', {
		detail: {
			strictly_necessary: 'granted',
			preferences_functionality: 'granted',
			statistics_performance: 'denied',
			marketing_advertising: 'denied'
		}
	}));

	assert.equal(shown(app.modal), false);
	assert.equal(app.state.consents.preferences_functionality, 'granted');
});

test('issue 40 - accepting works with no button to reveal', () => {
	app.acceptAll(new CustomEvent('consentio:accept-all-consents'));

	assert.equal(app.state.consents.marketing_advertising, 'granted');
	assert.equal(app._focus.container, null);
});
