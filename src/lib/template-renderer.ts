class TemplateRenderer {

	static illegalRgx = /[\/\?<>\\:\*\|"]/g;
	static controlRgx = /[\x00-\x1f\x80-\x9f]/g;
	static reservedRgx = /^\.+$/;
	static windowsReservedRgx = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
	static windowsTrailingRgx = /[\. ]+$/;

	static render(template: string, data: Record<string, string>): string {
		return template.replace(/{{\s*([\w]+)\s*}}/g, (match: string, p1: string) => {
			// Not `|| ''`: a zero and a false are values a site can legitimately supply.
			const value = data[p1];
			return this.domSanitize(value === undefined || value === null ? '' : String(value));
		});
	}

	/**
	 * A text node escapes `&`, `<` and `>` and nothing else, so a value carrying a quote
	 * could close an attribute it was substituted into - issue 29. Both quotes are escaped
	 * here as well, which is what lets `{{ }}` sit inside an attribute value at all.
	 */
	static domSanitize(value: string): string {
		const div = document.createElement('div');
		div.appendChild(document.createTextNode(value));
		return div.innerHTML
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	static regexSanitize(value: string, replacement: string): string {
		return value
			.replace(TemplateRenderer.illegalRgx, replacement)
			.replace(TemplateRenderer.controlRgx, replacement)
			.replace(TemplateRenderer.reservedRgx, replacement)
			.replace(TemplateRenderer.windowsReservedRgx, replacement)
			.replace(TemplateRenderer.windowsTrailingRgx, replacement);
	}
}

export default TemplateRenderer;
