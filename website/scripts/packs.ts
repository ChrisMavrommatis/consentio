/**
 * The copy button on each language pack the packs page prints. The pack's text is the
 * <pre> beside the button, so nothing here knows what a pack looks like.
 */
import { copyText } from './lib/clipboard.js';

/** Wires the page. False when there is no pack on it. */
export default function mount(root: Document = document): boolean {
	const buttons = root.querySelectorAll<HTMLElement>('.snippet__copy');
	if (buttons.length === 0) {
		return false;
	}
	for (const button of buttons) {
		button.addEventListener('click', () => {
			const code = button.closest('.snippet')?.querySelector('pre')?.textContent ?? '';
			copyText(code, button, () => {
				button.textContent = 'Select the text and copy it';
			});
		});
	}
	return true;
}

mount();
