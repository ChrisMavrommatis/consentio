class TemplateRenderer {

	static illegalRgx = /[\/\?<>\\:\*\|"]/g;
	static controlRgx = /[\x00-\x1f\x80-\x9f]/g;
	static reservedRgx = /^\.+$/;
	static windowsReservedRgx = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
	static windowsTrailingRgx = /[\. ]+$/;

	static render(template: string, data: Record<string, string>): string {
		return template.replace(/{{\s*([\w]+)\s*}}/g, (match: string, p1: string) => {
			return this.domSanitize(data[p1] || '');
		});
	}

	static domSanitize(value: string): string {
		const div = document.createElement('div');
		div.appendChild(document.createTextNode(value));
		return div.innerHTML
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
