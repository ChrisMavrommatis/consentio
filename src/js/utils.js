function isHidden(el) {
	return el.style.display === 'none' || el.offsetParent === null;
}
function showElement(el) {
	el.style.display = 'block';
}

function hideElement(el) {
	el.style.display = 'none';
}

export { isHidden, showElement, hideElement };
