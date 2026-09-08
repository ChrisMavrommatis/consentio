// http, https, or a path on this site. Everything else - javascript:, data:, a bare
// relative path, and //host, which leaves the site - fails. Issue 37.
const ALLOWED = /^(https?:\/\/|\/(?!\/))/i;

/** The address when it is one the banner may put in an href, null when it is not. */
function safeUrl(value: unknown): string | null {
	if (typeof value !== 'string') {
		return null;
	}
	const trimmed = value.trim();
	return ALLOWED.test(trimmed) ? trimmed : null;
}

export { safeUrl };
