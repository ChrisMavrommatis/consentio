// http, https, or a path on this site. Everything else - javascript:, data:, a bare
// relative path, and //host, which leaves the site - fails. Issue 37.
const ALLOWED = /^(https?:\/\/|\/(?!\/))/i;

function safeUrl(value: unknown): string | null {
	if (typeof value !== 'string') {
		return null;
	}
	const trimmed = value.trim();
	return ALLOWED.test(trimmed) ? trimmed : null;
}

export { safeUrl };
