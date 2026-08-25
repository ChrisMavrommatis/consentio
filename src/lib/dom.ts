function isHidden(el: HTMLElement): boolean {
	return el.style.display === 'none' || el.offsetParent === null;
}
function showElement(el: HTMLElement): void {
	el.style.display = 'block';
}

function hideElement(el: HTMLElement): void {
	el.style.display = 'none';
}

export { isHidden, showElement, hideElement };
