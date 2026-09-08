function isHidden(el: HTMLElement): boolean {
	return el.style.display === 'none' || el.offsetParent === null;
}

// Null is a real state, not a mistake: there is no floating button when a site hides it.
function showElement(el: HTMLElement | null): void {
	if (el) {
		el.style.display = 'block';
	}
}

function hideElement(el: HTMLElement | null): void {
	if (el) {
		el.style.display = 'none';
	}
}

export { isHidden, showElement, hideElement };
