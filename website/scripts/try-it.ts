/**
 * The cookie readout on the two try-it pages, and the three controls the first one has.
 * The banner publishes the cookie name it used, so it is read back rather than repeated
 * here, and `ConsentioDefault` is set by the loader alone, so it also says which route ran.
 */

interface Openable {
	openSettings(): void;
}

function cookieName(): string {
	return window.ConsentioDefault?.cookieName || 'consentio';
}

function readCookie(name: string): string | null {
	const parts = document.cookie ? document.cookie.split('; ') : [];
	for (const part of parts) {
		const eq = part.indexOf('=');
		if (eq > -1 && part.slice(0, eq) === name) {
			return decodeURIComponent(part.slice(eq + 1));
		}
	}
	return null;
}

/** What the readout says for one cookie value, or for none. */
export function readoutText(name: string, raw: string | null, loaderRan: boolean): string {
	const route = loaderRan ? 'The script tag ran on this page.' : 'No script tag on this page.';
	if (raw === null) {
		return `${route}\nNo "${name}" cookie. You have not answered yet, so the banner should be showing.`;
	}
	try {
		return `${route}\n${name} = ${JSON.stringify(JSON.parse(raw), null, 2)}`;
	} catch {
		return `${route}\n${name} = ${raw}  (does not parse as JSON, which reads as no stored answer)`;
	}
}

// A cookie is only removed at the Domain it was written at. Shared across subdomains it
// sits on the domain the hostnames share, so this expires it host-only and at every
// parent domain the browser could have accepted.
export function expireEverywhere(name: string, hostname: string): string[] {
	const labels = hostname.split('.');
	const writes = [`${name}=; path=/; max-age=0; SameSite=Lax`];
	for (let i = 0; i <= labels.length - 2; i++) {
		writes.push(`${name}=; path=/; max-age=0; SameSite=Lax; domain=${labels.slice(i).join('.')}`);
	}
	return writes;
}

/** Wires the page. False when there is no readout, which is every other page. */
export default function mount(root: Document = document): boolean {
	const readout = root.getElementById('consentio-readout');
	if (!readout) {
		return false;
	}

	const show = (): void => {
		const name = cookieName();
		readout.textContent = readoutText(name, readCookie(name), Boolean(window.ConsentioDefault));
	};

	root.getElementById('consentio-reset')?.addEventListener('click', () => {
		for (const write of expireEverywhere(cookieName(), window.location.hostname)) {
			document.cookie = write;
		}
		window.location.reload();
	});

	root.getElementById('consentio-open')?.addEventListener('click', () => {
		// The bundle is injected by the loader, so a click in the first moment of a page
		// load can arrive before it - the guard the events page asks every site for.
		const instance = window.ConsentioInstance as Openable | undefined;
		if (!instance) {
			readout.textContent = 'The banner has not loaded yet. That is what the guard around openSettings() is for.';
			return;
		}
		instance.openSettings();
	});

	// The held embed's caption says whether the frame has its src yet, so a map that is
	// already there reads as "granted earlier" rather than as a hold that failed.
	const embed = root.querySelector<HTMLIFrameElement>('.fixture__embed iframe');
	const note = root.querySelector<HTMLElement>('.fixture__embed-note');
	const describe = (): void => {
		if (!embed || !note) {
			return;
		}
		const category = embed.dataset.consentio ?? '';
		note.textContent = embed.hasAttribute('src')
			? `Loaded: ${category} is granted. Revoke it and the map stays until the next page load.`
			: `Empty until ${category} is granted.`;
	};

	root.getElementById('consentio-refresh')?.addEventListener('click', show);
	root.addEventListener('consentio:consent-update', show);
	root.addEventListener('consentio:consent-update', describe);
	root.addEventListener('consentio:initialized', describe);
	show();
	describe();
	return true;
}

mount();
