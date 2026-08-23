/**
 * Shared helpers that need a browser.
 *
 * This file loads Consentio and the element classes, which extend HTMLElement as soon as
 * they load, so importing it commits a test to jsdom. Anything that does not need a page
 * belongs in basics.mts - see the note at the top of that file.
 *
 * It re-exports basics.mts so a test needing both imports one file.
 */
import { JSDOM } from 'jsdom';

import TemplateRenderer from '../src/lib/template-renderer.js';
import type { ConsentioOptions, CookieDescriptor } from '../src/types.js';
import Consentio from '../src/consentio.js';
import type ConsentioAppElement from '../src/elements/consentio-app.js';

export * from './basics.mjs';

/**
 * Run `fn` against a document served from a different origin. Defect 12 is only visible
 * over plain http, which the suite's default https origin cannot show.
 */
export function withOrigin<T>(url: string, fn: () => T): T {
	const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url });
	const saved = {
		window: globalThis.window,
		document: globalThis.document,
		location: globalThis.location
	};
	swap('window', dom.window);
	swap('document', dom.window.document);
	swap('location', dom.window.location);
	try {
		return fn();
	} finally {
		swap('window', saved.window);
		swap('document', saved.document);
		swap('location', saved.location);
	}
}

function swap(key: string, value: unknown): void {
	Object.defineProperty(globalThis, key, { value, writable: true, configurable: true });
}

/**
 * Build a detached element from a template the way ConsentioAppElement.renderNode does.
 * Custom elements inside an inert <template> are not upgraded until the node is inserted
 * into the document, so append the result before expecting a constructor to have run.
 */
export function nodeFrom<T extends Element>(template: string, data: Record<string, string> = {}): T {
	const host = document.createElement('template');
	host.innerHTML = TemplateRenderer.render(template, data).trim();
	return host.content.firstChild as T;
}

/** Collect the events of one type that reach the document while `fn` runs. */
export function captureEvents(type: string, fn: () => void): CustomEvent[] {
	const seen: CustomEvent[] = [];
	const listener = (event: Event) => { seen.push(event as CustomEvent); };
	document.addEventListener(type, listener);
	try {
		fn();
	} finally {
		document.removeEventListener(type, listener);
	}
	return seen;
}

export function click(el: Element): void {
	el.dispatchEvent(new globalThis.window.MouseEvent('click', { bubbles: true, cancelable: true }));
}

/**
 * Construct Consentio and hand back its app element, already connected to the document.
 *
 * Call this ONCE per test file. `defineCustomElements` registers six tag names with no
 * `customElements.get` guard (defect 8), so a second construction in the same process
 * throws - which is why the element tests are split one scenario per file, each getting
 * its own process and its own registry from node:test.
 */
export function boot(options: ConsentioOptions = {}, cookies: CookieDescriptor[] = []): ConsentioAppElement {
	return new Consentio(options, cookies, null).el!;
}

/**
 * Import a module for its side effects, by URL rather than by specifier.
 *
 * `consentio-loader.ts` has no imports and no exports, which is exactly right for a file
 * that ships as a plain `<script>` - but it means TypeScript calls it "not a module" and
 * refuses a static specifier. Giving it a URL keeps the tests honest without adding an
 * `export {}` to the source, which would flip webpack's output into a strict-mode module
 * wrapper and change the shipped bundle.
 */
export function importScript(url: URL): Promise<unknown> {
	return import(url.href);
}
