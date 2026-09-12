/**
 * The shared panel, as _includes/panel.html prints it, and the two <dialog> methods jsdom
 * lacks. Every page test that opens the panel mounts this.
 */
import { readFileSync } from 'node:fs';

export const PANEL_MARKUP = readFileSync(new URL('../../website/_includes/panel.html', import.meta.url), 'utf8');

export interface StubbedDialog extends HTMLDialogElement {
	opened: number;
}

/** Gives the panel showModal and close, and counts the opens. Call after the markup is in the page. */
export function dialog(): StubbedDialog {
	const panel = document.getElementById('panel') as StubbedDialog;
	panel.opened = 0;
	panel.showModal = () => { panel.opened += 1; panel.setAttribute('open', ''); };
	panel.close = () => { panel.removeAttribute('open'); panel.dispatchEvent(new Event('close')); };
	return panel;
}

export function panelTitle(): string {
	return document.querySelector('.panel__title')!.textContent ?? '';
}

export function panelCode(): string {
	return document.querySelector('.panel__code')!.textContent ?? '';
}

/** Flip the panel's own file-or-variable switch. */
export function panelShape(shape: 'file' | 'variable'): void {
	const radio = document.querySelector<HTMLInputElement>(`[name="panel-shape"][value="${shape}"]`)!;
	radio.click();
	radio.dispatchEvent(new Event('change', { bubbles: true }));
}
