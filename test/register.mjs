// The jsdom bootstrap. `--import`ed by `npm test`, before anything else.
//
// It does two jobs: ./resolve.mjs stands in for the webpack loaders, and the rest of
// this file installs a jsdom window. Tests that do not need a page use
// ./register-plain.mjs instead - see test/README.md.
import './resolve.mjs';

import { JSDOM } from 'jsdom';

// The DOM has to exist before any element module is evaluated, because the classes
// extend HTMLElement at module scope. `--import` runs this file first, so it does.
// node:test gives each test FILE its own process, so each file gets a pristine
// document, cookie jar and custom element registry - which is what lets the
// registration tests run at all.
const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
	url: 'https://consentio.test/'
});

for (const key of [
	'window', 'document', 'location', 'navigator', 'customElements',
	'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLAnchorElement',
	'HTMLTemplateElement', 'Element', 'Node', 'DocumentFragment', 'ShadowRoot',
	'Event', 'CustomEvent', 'MouseEvent', 'KeyboardEvent', 'getComputedStyle'
]) {
	Object.defineProperty(globalThis, key, {
		value: dom.window[key],
		writable: true,
		configurable: true
	});
}
