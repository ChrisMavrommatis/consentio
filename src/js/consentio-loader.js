(function (global, doc, customElementsRegistry) {
	// see where this file was loaded
	// constains 'consentio-loader' either consentio-loader.js or consentio-loader.min.js
	const scripts = doc.getElementsByTagName('script');
	let loaderScript = null;
	for (let i = 0; i < scripts.length; i++) {
		const src = scripts[i].getAttribute('src');
		if (src && src.indexOf('consentio-loader') !== -1) {
			loaderScript = scripts[i];
			break;
		}
	}

	if (loaderScript === null) {
		console.error('Consentio loader script not found');
		return;
	}

	const loaderSrc = loaderScript.getAttribute('src');
	const basePath = loaderSrc.substring(0, loaderSrc.lastIndexOf('/') + 1);

	const consentioScript = doc.createElement('script');
	// check if minified
	if (loaderSrc.indexOf('.min.js') !== -1) {
		consentioScript.src = basePath + 'consentio.min.js';
	} else {
		consentioScript.src = basePath + 'consentio.js';
	}
	doc.head.appendChild(consentioScript);

	// after loading consentio.js, initialize Consentio
	consentioScript.onload = function () {
		console.log('Consentio script loaded');
		global.consentio = new Consentio({

		});
	};


})(window, document, customElements);



