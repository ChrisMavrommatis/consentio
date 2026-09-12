/**
 * The cookie catalogue: a JSON button per row, a copy-all control per vendor, one side
 * panel for whichever was clicked, and the builder - tick rows across every vendor and
 * take them as the file or as a Tag Manager variable. The rows arrive in a JSON block the
 * page prints from the same data file the tables are built from.
 */
import type { CookieTableRow } from '../../src/types.js';
import { copyText } from './lib/clipboard.js';
import { asFile, asVariable } from './lib/output.js';

interface Vendor {
	vendor: string;
	rows: CookieTableRow[];
}

/** The ticked rows, in catalogue order, whatever order they were ticked in. */
export function selected(vendors: Vendor[], ticked: (vendor: number, row: number) => boolean): CookieTableRow[] {
	const rows: CookieTableRow[] = [];
	vendors.forEach((vendor, v) => {
		vendor.rows.forEach((row, r) => {
			if (ticked(v, r)) {
				rows.push(row);
			}
		});
	});
	return rows;
}

/** What the strip says. */
export function count(n: number): string {
	return n === 1 ? '1 cookie selected' : `${n} cookies selected`;
}

/** Wires the page. False when the panel is not there, or the browser has no <dialog>. */
export default function mount(root: Document = document): boolean {
	const panel = root.getElementById('catalogue-panel') as HTMLDialogElement | null;
	const data = root.getElementById('catalogue-data');
	if (!panel || !data || typeof panel.showModal !== 'function') {
		return false;
	}

	const vendors = JSON.parse(data.textContent ?? '[]') as Vendor[];
	const title = panel.querySelector('.catalogue-panel__title') as HTMLElement;
	const code = panel.querySelector('.catalogue-panel__code') as HTMLElement;
	const copy = panel.querySelector('.catalogue-panel__copy') as HTMLElement;
	const close = panel.querySelector('.catalogue-panel__close') as HTMLElement;
	let opener: HTMLElement | null = null;

	const open = (heading: string, text: string, from: HTMLElement): void => {
		opener = from;
		title.textContent = heading;
		code.textContent = text;
		copy.textContent = 'Copy';
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

	for (const block of root.querySelectorAll<HTMLElement>('.catalogue')) {
		const vendor = vendors[Number(block.dataset.vendor)];
		if (!vendor) {
			continue;
		}

		const all = block.querySelector('.catalogue__copy-all') as HTMLElement;
		all.addEventListener('click', () => {
			const json = asFile(vendor.rows);
			copyText(json, all, () => { open(`${vendor.vendor} - all rows`, json, all); });
		});

		for (const button of block.querySelectorAll<HTMLElement>('.catalogue__open')) {
			button.addEventListener('click', () => {
				const row = vendor.rows[Number(button.dataset.row)];
				if (row) {
					open(row.name, JSON.stringify(row, null, 2), button);
				}
			});
		}

		// The whole row opens the panel too, through its button, so the keyboard and the
		// mouse reach the same control. A drag to select text does not, and nor does the
		// tick box.
		for (const row of block.querySelectorAll<HTMLElement>('.catalogue__row')) {
			row.addEventListener('click', (event) => {
				if ((event.target as Element).closest('button, a, input, label')) {
					return;
				}
				if (window.getSelection()?.toString()) {
					return;
				}
				row.querySelector<HTMLElement>('.catalogue__open')?.click();
			});
		}
	}

	// The builder. The strip is hidden until a row is ticked and reads the tick boxes
	// fresh on every click, so there is no state to keep in step with the page.
	const strip = root.getElementById('cookie-builder');
	if (strip) {
		const boxes = [...root.querySelectorAll<HTMLInputElement>('.catalogue__pick')];
		const ticked = (v: number, r: number): boolean =>
			boxes.some((box) => box.checked && Number(box.dataset.vendor) === v && Number(box.dataset.row) === r);
		const rows = (): CookieTableRow[] => selected(vendors, ticked);
		const label = strip.querySelector('.builder-strip__count') as HTMLElement;

		const update = (): void => {
			const n = rows().length;
			label.textContent = count(n);
			strip.hidden = n === 0;
		};

		for (const box of boxes) {
			box.addEventListener('change', update);
		}

		strip.querySelector('.builder-strip__show')?.addEventListener('click', (event) => {
			open(`Your cookie table - ${count(rows().length)}`, asFile(rows()), event.currentTarget as HTMLElement);
		});

		const copyAs = (selector: string, shape: (rows: CookieTableRow[]) => string, heading: string): void => {
			const button = strip.querySelector<HTMLElement>(selector);
			button?.addEventListener('click', () => {
				const text = shape(rows());
				copyText(text, button, () => { open(`${heading} - ${count(rows().length)}`, text, button); });
			});
		};
		copyAs('.builder-strip__file', asFile, 'Your cookie table, as the file');
		copyAs('.builder-strip__variable', asVariable, 'Your cookie table, as a Tag Manager variable');

		strip.querySelector('.builder-strip__clear')?.addEventListener('click', () => {
			for (const box of boxes) {
				box.checked = false;
			}
			update();
		});

		update();
	}
	return true;
}

mount();
