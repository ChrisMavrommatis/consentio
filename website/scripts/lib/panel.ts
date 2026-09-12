/**
 * The one side panel the site has: a title, a lead sentence, the text, a copy control,
 * and - when both shapes are given - a switch between the file and the Tag Manager
 * variable. Every page that shows real data to copy opens this one; the layout prints it
 * for a page whose front matter says `panel: true`.
 */
import { copyText } from './clipboard.js';

export type Shape = 'file' | 'variable';

export interface Opening {
	title: string;
	lead: string;
	/** One text, or one per shape with the switch shown. */
	text: string | Record<Shape, string>;
	shape?: Shape;
	/** The control that opened it; focus goes back there on close. */
	from: HTMLElement;
}

export interface Panel {
	open(opening: Opening): void;
	close(): void;
	/** What the panel shows right now. */
	text(): string;
}

/** Wires the panel. Null when it is not on the page, or the browser has no <dialog>. */
export function mountPanel(root: Document = document): Panel | null {
	const panel = root.getElementById('panel') as HTMLDialogElement | null;
	if (!panel || typeof panel.showModal !== 'function') {
		return null;
	}

	const title = panel.querySelector('.panel__title') as HTMLElement;
	const lead = panel.querySelector('.panel__lead') as HTMLElement;
	const code = panel.querySelector('.panel__code') as HTMLElement;
	const copy = panel.querySelector('.panel__copy') as HTMLElement;
	const close = panel.querySelector('.panel__close') as HTMLElement;
	const switcher = panel.querySelector('.panel__switch') as HTMLElement;
	const radios = [...switcher.querySelectorAll<HTMLInputElement>('input[type="radio"]')];

	let opener: HTMLElement | null = null;
	let texts: Record<Shape, string> | null = null;

	const shown = (): Shape => (radios.find((radio) => radio.checked)?.value as Shape | undefined) ?? 'file';

	const render = (): void => {
		if (texts) {
			code.textContent = texts[shown()];
		}
	};

	for (const radio of radios) {
		radio.addEventListener('change', render);
	}

	const open = ({ title: heading, lead: sentence, text, shape, from }: Opening): void => {
		opener = from;
		title.textContent = heading;
		lead.textContent = sentence;
		lead.hidden = sentence === '';
		copy.textContent = 'Copy';
		if (typeof text === 'string') {
			texts = null;
			switcher.hidden = true;
			code.textContent = text;
		} else {
			texts = text;
			switcher.hidden = false;
			for (const radio of radios) {
				radio.checked = radio.value === (shape ?? 'file');
			}
			render();
		}
		panel.showModal();
		panel.focus();
	};

	panel.addEventListener('close', () => {
		opener?.focus();
		opener = null;
	});

	// A click on the backdrop lands on the dialog itself; the inner box fills it, so
	// anything inside reports the inner element as its target.
	panel.addEventListener('click', (event) => {
		if (event.target === panel) {
			panel.close();
		}
	});

	close.addEventListener('click', () => { panel.close(); });

	copy.addEventListener('click', () => {
		copyText(code.textContent ?? '', copy, () => {
			copy.textContent = 'Select the text and copy it';
		});
	});

	return {
		open,
		close: () => { panel.close(); },
		text: () => code.textContent ?? ''
	};
}
