/**
 * The one copy control the site has. Every page that copies something goes through here,
 * so a browser without the clipboard API gets the same fallback everywhere.
 */

const FLASH_MS = 1500;

/** Show `text` on the button for a moment, then put its own label back. */
export function flash(button: HTMLElement, text: string): void {
	const label = button.dataset.label ?? button.textContent ?? '';
	button.dataset.label = label;
	button.textContent = text;
	setTimeout(() => { button.textContent = label; }, FLASH_MS);
}

/**
 * Copy `text`, telling the visitor on the button. `fallback` runs when the page cannot
 * reach the clipboard - a plain http page, or a browser without the API.
 */
export function copyText(text: string, button: HTMLElement, fallback: () => void): void {
	const clipboard = navigator.clipboard as Clipboard | undefined;
	if (!clipboard) {
		fallback();
		return;
	}
	clipboard.writeText(text).then(() => { flash(button, 'Copied'); }, fallback);
}
