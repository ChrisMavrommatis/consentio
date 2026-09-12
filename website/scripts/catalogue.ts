/**
 * The cookie catalogue: a JSON button per row, a copy-all control per vendor, one side
 * panel for whichever was clicked, and the builder - tick rows across every vendor and
 * take them as the file or as a Tag Manager variable. The rows arrive in a JSON block the
 * page prints from the same data file the tables are built from.
 */
import type { CookieTableRow } from '../../src/types.js';
import { copyText } from './lib/clipboard.js';
import { asFile, asVariable } from './lib/output.js';
import { mountPanel } from './lib/panel.js';
import type { Shape } from './lib/panel.js';

const ROW_LEAD = 'In the shape the cookie table takes. Check it against the vendor before you ship it.';
const TABLE_LEAD = 'Your cookie table, from the rows you ticked. Save it as consentio-cookies.json, or paste the variable into Tag Manager.';

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
	const panel = mountPanel(root);
	const data = root.getElementById('catalogue-data');
	if (!panel || !data) {
		return false;
	}

	const vendors = JSON.parse(data.textContent ?? '[]') as Vendor[];
	const open = (title: string, text: string, from: HTMLElement): void => {
		panel.open({ title, lead: ROW_LEAD, text, from });
	};

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

		const show = (shape: Shape, from: HTMLElement): void => {
			panel.open({
				title: `Your cookie table - ${count(rows().length)}`,
				lead: TABLE_LEAD,
				text: { file: asFile(rows()), variable: asVariable(rows()) },
				shape,
				from
			});
		};

		strip.querySelector('.builder-strip__show')?.addEventListener('click', (event) => {
			show('file', event.currentTarget as HTMLElement);
		});

		const copyAs = (selector: string, shape: Shape, as: (rows: CookieTableRow[]) => string): void => {
			const button = strip.querySelector<HTMLElement>(selector);
			button?.addEventListener('click', () => {
				copyText(as(rows()), button, () => { show(shape, button); });
			});
		};
		copyAs('.builder-strip__file', 'file', asFile);
		copyAs('.builder-strip__variable', 'variable', asVariable);

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
