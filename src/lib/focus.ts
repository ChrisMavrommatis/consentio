const FOCUSABLE = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])'
].join(', ');

/** Keeps Tab inside one surface and puts focus back where it came from. */
class FocusTrap {

	declare _root: ShadowRoot;
	declare _container: HTMLElement | null;
	declare _returnTo: HTMLElement | null;

	constructor(root: ShadowRoot) {
		this._root = root;
		this._container = null;
		this._returnTo = null;
	}

	get container(): HTMLElement | null {
		return this._container;
	}

	// The shadow root is closed, so document.activeElement gives the host, not the focused node.
	get activeElement(): Element | null {
		return this._root.activeElement;
	}

	/** Focus the first control in `container`, and hold Tab there when `blocking`. */
	enter(container: HTMLElement | null, blocking: boolean): void {
		if (!container) {
			return;
		}
		const outer = document.activeElement as HTMLElement | null;
		// document.activeElement is our own host while focus is inside, which is nothing to return to.
		if (!this._returnTo && outer && !this._root.host.contains(outer)) {
			this._returnTo = outer;
		}
		this._container = blocking ? container : null;
		this.focusFirst(container);
	}

	/** Release Tab and hand focus to `next`, or back to the page when there is no next. */
	leave(next: HTMLElement | null): void {
		this._container = null;
		if (next) {
			this.focusFirst(next);
			return;
		}
		const back = this._returnTo;
		this._returnTo = null;
		if (back?.isConnected) {
			back.focus();
		}
	}

	/** Wrap Tab at the ends of the trapped surface. Does nothing when nothing is trapped. */
	handleTab(event: KeyboardEvent): void {
		if (event.key !== 'Tab' || !this._container) {
			return;
		}
		const items = this.focusable(this._container);
		if (items.length === 0) {
			return;
		}
		const first = items[0]!;
		const last = items[items.length - 1]!;
		const current = this.activeElement;
		const outside = !this._container.contains(current);
		if (event.shiftKey && (outside || current === first)) {
			event.preventDefault();
			last.focus();
			return;
		}
		if (!event.shiftKey && (outside || current === last)) {
			event.preventDefault();
			first.focus();
		}
	}

	focusable(container: HTMLElement): HTMLElement[] {
		return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
			.filter((el) => !this.inHiddenBranch(el, container));
	}

	focusFirst(container: HTMLElement): void {
		this.focusable(container)[0]?.focus();
	}

	// Inline display is all the visibility this component uses, and all jsdom models.
	inHiddenBranch(el: HTMLElement, container: HTMLElement): boolean {
		for (let node: HTMLElement | null = el; node; node = node.parentElement) {
			if (node.style.display === 'none') {
				return true;
			}
			if (node === container) {
				return false;
			}
		}
		return false;
	}

}

export default FocusTrap;
