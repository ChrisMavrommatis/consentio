import test from 'node:test';
import assert from 'node:assert/strict';

import FocusTrap from '../../src/lib/focus.js';

// Defect 14. The app attaches its shadow root with { mode: 'closed' }, so
// document.activeElement retargets to the host and cannot say what is focused inside.
// Every assertion here would fail if the trap read the document instead of the root.

function surface(): { host: HTMLElement; root: ShadowRoot; trap: FocusTrap; buttons: HTMLButtonElement[] } {
	const host = document.createElement('div');
	document.body.appendChild(host);
	const root = host.attachShadow({ mode: 'closed' });
	const container = document.createElement('div');
	root.appendChild(container);
	const buttons = ['first', 'second', 'third'].map((name) => {
		const button = document.createElement('button');
		button.textContent = name;
		container.appendChild(button);
		return button;
	});
	return { host, root, trap: new FocusTrap(root), buttons };
}

function tab(shiftKey = false): KeyboardEvent {
	return new globalThis.window.KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true });
}

test('activeElement reads the shadow root, which is the only thing that can see inside it', () => {
	const { host, root, trap, buttons } = surface();
	buttons[1]!.focus();

	assert.equal(trap.activeElement, buttons[1]);
	assert.equal(document.activeElement, host, 'a closed root retargets the document to the host');
});

test('entering focuses the first control in the surface', () => {
	const { trap, root, buttons } = surface();
	trap.enter(root.firstElementChild as HTMLElement, true);
	assert.equal(trap.activeElement, buttons[0]);
});

test('Tab off the last control wraps to the first instead of leaving the surface', () => {
	const { trap, root, buttons } = surface();
	trap.enter(root.firstElementChild as HTMLElement, true);
	buttons[2]!.focus();

	const event = tab();
	trap.handleTab(event);

	assert.equal(trap.activeElement, buttons[0]);
	assert.equal(event.defaultPrevented, true);
});

test('shift+Tab off the first control wraps to the last', () => {
	const { trap, root, buttons } = surface();
	trap.enter(root.firstElementChild as HTMLElement, true);

	const event = tab(true);
	trap.handleTab(event);

	assert.equal(trap.activeElement, buttons[2]);
	assert.equal(event.defaultPrevented, true);
});

test('Tab in the middle of the surface is left to the browser', () => {
	const { trap, root, buttons } = surface();
	trap.enter(root.firstElementChild as HTMLElement, true);
	buttons[1]!.focus();

	const event = tab();
	trap.handleTab(event);

	assert.equal(event.defaultPrevented, false);
	assert.equal(trap.activeElement, buttons[1]);
});

test('focus that has escaped the surface is pulled back', () => {
	const { trap, root, buttons } = surface();
	trap.enter(root.firstElementChild as HTMLElement, true);
	const outside = document.createElement('button');
	document.body.appendChild(outside);
	outside.focus();

	trap.handleTab(tab());
	assert.equal(trap.activeElement, buttons[0]);
});

test('a control in a collapsed branch is not a stop on the way round', () => {
	const { trap, root, buttons } = surface();
	const hidden = document.createElement('div');
	hidden.style.display = 'none';
	const buried = document.createElement('button');
	hidden.appendChild(buried);
	root.firstElementChild!.appendChild(hidden);

	assert.deepEqual(trap.focusable(root.firstElementChild as HTMLElement), buttons);
});

test('a disabled control is not a stop either', () => {
	const { trap, root, buttons } = surface();
	buttons[1]!.disabled = true;
	assert.deepEqual(trap.focusable(root.firstElementChild as HTMLElement), [buttons[0], buttons[2]]);
});

test('leaving with nothing to go to gives focus back to the page', () => {
	const { trap, root } = surface();
	const outside = document.createElement('button');
	document.body.appendChild(outside);
	outside.focus();

	trap.enter(root.firstElementChild as HTMLElement, true);
	trap.leave(null);

	assert.equal(document.activeElement, outside);
	assert.equal(trap.container, null);
});

test('leaving for another surface focuses that one and stops trapping', () => {
	const { trap, root } = surface();
	const next = document.createElement('div');
	const nextButton = document.createElement('button');
	next.appendChild(nextButton);
	root.appendChild(next);

	trap.enter(root.firstElementChild as HTMLElement, true);
	trap.leave(next);

	assert.equal(trap.activeElement, nextButton);
	assert.equal(trap.container, null);
});
