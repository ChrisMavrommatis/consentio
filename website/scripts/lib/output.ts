/**
 * The two forms a builder hands back: the file the HTML route hosts, and the same value
 * as a Custom JavaScript variable for the Tag Manager route. The variable form is what
 * scripts/i18n.mjs writes for a pack's .gtm.js, byte for byte.
 */

/** The file, two-space indented, the way the docs show it. */
export function asFile(value: unknown): string {
	return `${JSON.stringify(value, null, 2)}\n`;
}

/** A Custom JavaScript variable returning the value. */
export function asVariable(value: unknown): string {
	const json = JSON.stringify(value, null, '\t');
	return `function () {\n\treturn ${json.replace(/\n/g, '\n\t')};\n}\n`;
}
