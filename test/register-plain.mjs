// The no-browser bootstrap, used by `npm run test:plain`.
//
// Its job is to keep a promise: the cookie, saved-state and Google-signal tests do not
// need a browser, and must not quietly start needing one. It gives them a cookie jar and
// a dataLayer in about forty lines and nothing else, so a test that reaches for a real
// page fails here rather than passing under jsdom and hiding the coupling.
//
// It is not a second test suite. Every one of these files also runs under `npm test`.
import './resolve.mjs';

const jar = new Map();

// document.cookie round-trips `name=value; name2=value2` on read, and takes one
// `name=value; attr; attr=x` string on write. An expiry in the past is a deletion, which
// is how Cookies.remove works.
const doc = {
	get cookie() {
		return Array.from(jar, ([name, value]) => `${name}=${value}`).join('; ');
	},
	set cookie(written) {
		const [pair, ...attributes] = written.split(';');
		const index = pair.indexOf('=');
		const name = pair.slice(0, index).trim();
		if (!name) {
			return;
		}
		const expiry = attributes
			.map((attribute) => /^\s*expires=(.*)$/i.exec(attribute))
			.find(Boolean);
		if (expiry && new Date(expiry[1]).getTime() <= Date.now()) {
			jar.delete(name);
			return;
		}
		jar.set(name, pair.slice(index + 1));
	}
};

function install(key, value) {
	Object.defineProperty(globalThis, key, { value, writable: true, configurable: true });
}

install('document', doc);
install('window', { dataLayer: [] });
// https, so the secure flag behaves as it does on a real site. Defect 12 - the flag being
// set on plain http too - is checked in cookies/secure-flag.test.mts, which swaps the
// origin and therefore needs jsdom.
install('location', { protocol: 'https:' });
