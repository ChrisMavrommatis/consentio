import type { ConsentRecord } from '../types.js';

/**
 * Runs every `<script type="text/plain" data-consentio="<category>">` whose category is
 * granted. A browser ignores the unknown type, so the site owner's script has not run;
 * once released it stays run - revoking cannot take a script back.
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
}

export { releaseHeldScripts };
