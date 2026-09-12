/**
 * The language packs, on both language pages: a row per built pack, and the panel showing
 * the one that was opened as the file or as a Tag Manager variable. The packs arrive in a
 * JSON block the page prints from data/i18n/; the table says which shape to open on.
 */
import { mountPanel } from './lib/panel.js';
import type { Shape } from './lib/panel.js';

const LEAD = 'The whole pack. Change the words you want; a key you leave out falls back to the built-in English.';

interface Pack {
	locale: string;
	name: string;
	file: string;
	variable: string;
}

/** Wires the page. False when there is no pack table on it, or no <dialog>. */
export default function mount(root: Document = document): boolean {
	const panel = mountPanel(root);
	const table = root.querySelector<HTMLElement>('.packs');
	const data = root.getElementById('packs-data');
	if (!panel || !table || !data) {
		return false;
	}

	const packs = JSON.parse(data.textContent ?? '[]') as Pack[];
	const shape = (table.dataset.shape === 'variable' ? 'variable' : 'file') as Shape;

	for (const button of table.querySelectorAll<HTMLElement>('.packs__open')) {
		button.addEventListener('click', () => {
			const pack = packs[Number(button.dataset.pack)];
			if (pack) {
				panel.open({
					title: `${pack.name} - ${pack.locale}`,
					lead: LEAD,
					text: { file: pack.file, variable: pack.variable },
					shape,
					from: button
				});
			}
		});
	}

	// The whole row opens the panel too, through its button. A drag to select text does not.
	for (const row of table.querySelectorAll<HTMLElement>('.packs__row')) {
		row.addEventListener('click', (event) => {
			if ((event.target as Element).closest('button, a')) {
				return;
			}
			if (window.getSelection()?.toString()) {
				return;
			}
			row.querySelector<HTMLElement>('.packs__open')?.click();
		});
	}
	return true;
}

mount();
