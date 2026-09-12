import type { ConsentRecord } from '../types.js';

/**
 * Runs every `<script type="text/plain" data-consentio="<category>">` and loads every
 * `<iframe data-consentio="<category>" data-src="...">` whose category is granted. A
 * browser ignores the unknown type and an iframe with no src, so the site owner's thing has
 * not run; once released it stays released - revoking cannot take it back.
 */
function releaseHeldScripts(consents: ConsentRecord): void {
	// A stored answer arrives while the page may still be parsing, and a tag below the
	// parser is not in the document yet.
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => releaseHeldScripts(consents), { once: true });
		return;
	}
	for (const held of document.querySelectorAll<HTMLScriptElement>('script[type="text/plain"][data-consentio]')) {
		if (consents[held.dataset.consentio!] !== 'granted') {
			continue;
		}
		// A script runs once, on insertion. Changing `type` on the tag in place runs nothing.
		const live = document.createElement('script');
		for (const { name, value } of held.attributes) {
			if (name !== 'type') {
				live.setAttribute(name, value);
			}
		}
		live.textContent = held.textContent;
		held.replaceWith(live);
	}
	// An iframe loads when src is set, so the element stays and only the attribute moves.
	for (const held of document.querySelectorAll<HTMLIFrameElement>('iframe[data-consentio][data-src]:not([src])')) {
		if (consents[held.dataset.consentio!] !== 'granted') {
			continue;
		}
		held.setAttribute('src', held.dataset.src!);
		held.removeAttribute('data-src');
	}
}

export { releaseHeldScripts };
