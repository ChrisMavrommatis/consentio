/**
 * The settings builder on the configuration page: one control per key, and the file the
 * controls add up to - only what differs from the default, so the file says what the site
 * changed. The keys, types and defaults arrive in a JSON block printed from
 * _data/settings.yml, which is held to the banner's own defaults by a test.
 */
import { copyText } from './lib/clipboard.js';
import { asFile, asVariable } from './lib/output.js';

export interface SettingKey {
	key: string;
	type: 'boolean' | 'number' | 'string' | 'state';
	default: boolean | number | string;
	label: string;
}

type Value = boolean | number | string;

function put(into: Record<string, unknown>, path: string, value: Value): void {
	const keys = path.split('.');
	let at = into;
	for (const key of keys.slice(0, -1)) {
		at[key] ??= {};
		at = at[key] as Record<string, unknown>;
	}
	at[keys[keys.length - 1]!] = value;
}

/** The file: every key whose value is not its default, nested where the key is dotted. */
export function changed(keys: SettingKey[], values: Map<string, Value | undefined>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const setting of keys) {
		const value = values.get(setting.key);
		if (value !== undefined && value !== setting.default) {
			put(out, setting.key, value);
		}
	}
	return out;
}

function readControl(form: HTMLFormElement, setting: SettingKey): Value | undefined {
	const control = form.elements.namedItem(setting.key) as HTMLInputElement | HTMLSelectElement | null;
	if (!control) {
		return undefined;
	}
	if (setting.type === 'boolean') {
		return (control as HTMLInputElement).checked;
	}
	if (setting.type === 'number') {
		// Blank or nonsense is left out rather than written: the banner would refuse it anyway.
		const number = Number(control.value);
		return control.value.trim() !== '' && Number.isFinite(number) && number > 0 ? number : undefined;
	}
	return control.value;
}

/** Wires the page. False when the builder is not there. */
export default function mount(root: Document = document): boolean {
	const form = root.getElementById('settings-builder') as HTMLFormElement | null;
	const data = root.getElementById('settings-data');
	const output = root.getElementById('settings-output');
	if (!form || !data || !output) {
		return false;
	}

	const keys = JSON.parse(data.textContent ?? '[]') as SettingKey[];

	const text = (): string => {
		const file = changed(keys, new Map(keys.map((setting) => [setting.key, readControl(form, setting)])));
		const shape = (form.elements.namedItem('output') as RadioNodeList | null)?.value;
		return shape === 'variable' ? asVariable(file) : asFile(file);
	};

	const render = (): void => {
		output.textContent = text();
	};

	form.addEventListener('input', render);
	form.addEventListener('change', render);
	form.addEventListener('reset', () => { setTimeout(render, 0); });
	form.addEventListener('submit', (event) => { event.preventDefault(); });

	const copy = root.getElementById('settings-copy');
	copy?.addEventListener('click', () => {
		copyText(text(), copy, () => { copy.textContent = 'Select the text and copy it'; });
	});

	render();
	return true;
}

mount();
