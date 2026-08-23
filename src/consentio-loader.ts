(function (global: Window & typeof globalThis, doc: Document, logger: Console, customElementsRegistry: CustomElementRegistry) {


	const getResource = function (url: string): Promise<any> {
		return new Promise((resolve, reject) => {
			fetch(url)
				.then(response => {
					if (!response.ok) {
						reject(`HTTP error! status: ${response.status}`);
					}
					return response.json();
				})
				.then(data => resolve(data))
				.catch(error => reject(`Fetch error: ${error}`));
		});
	}

	const getResources = function (urls: string[]): Promise<any[]> {
		return Promise.all(urls.map(url => getResource(url)));
	}

	const loaderScript = doc.querySelector<HTMLScriptElement>('script[data-consentio-loader]');

	if (!loaderScript) {
		logger.error('[Consentio Loader] script not found');
		return;
	}

	const debug = loaderScript.dataset.debug === 'true';

	// see where this file was loaded
	// contains 'consentio-loader' either consentio-loader.js or consentio-loader.min.js
	// Find the loader script
	const loaderSrc = loaderScript.getAttribute('src');
	// @ts-expect-error issue 22 - src is never null-checked
	const basePath = loaderSrc.substring(0, loaderSrc.lastIndexOf('/') + 1);
	// @ts-expect-error issue 22 - src is never null-checked
	const isMinified = loaderSrc.includes('.min.js');

	const configUrl = loaderScript.dataset.configUrl || null;
	const cookiesUrl = loaderScript.dataset.cookiesUrl || null;



	// Prevent double initialization
	if (global.ConsentioInstance) {
		debug && logger.warn('[Consentio Loader] Consentio is already initialized');
		return;
	}

	// Create and configure the main script
	const consentioScript = doc.createElement('script');
	consentioScript.src = `${basePath}consentio${isMinified ? '.min' : ''}.js`;
	doc.head.appendChild(consentioScript);

	// Handle successful load
	consentioScript.onload = async function () {
		// Check if Consentio constructor exists
		if (typeof global.Consentio !== 'function') {
			logger.error('[Consentio Loader] Constructor not found after script load');
			return;
		}

		let config = {};
		let cookies: unknown[] = [];
		let resources: string[] = [];


		if (configUrl) {
			debug && logger.info('[Consentio Loader] Config URL:', configUrl);
			resources.push(configUrl);
		}
		if (cookiesUrl) {
			debug && logger.info('[Consentio Loader] Cookies URL:', cookiesUrl);
			resources.push(cookiesUrl);
		}


		try {

			if (resources.length > 0) {
				const results = await getResources(resources);
				let resultIndex = 0;
				if (configUrl) {
					config = results[resultIndex++];
					debug && logger.info('[Consentio Loader] Config loaded:', config);
				}
				if (cookiesUrl) {
					cookies = results[resultIndex++];
					debug && logger.info('[Consentio Loader] Cookies loaded:', cookies);
				}
				if (results.length > resultIndex) {
					logger.warn('[Consentio Loader] More resources loaded than expected');
				}
			}

			global.ConsentioInstance = new global.Consentio(config, cookies, logger);
			logger.info('[Consentio Loader] Initialized successfully');
		} catch (error) {
			logger.error('[Consentio Loader] Initialization failed:', error);
		}
	};

	// Handle load errors
	consentioScript.onerror = async function () {
		logger.error('[Consentio Loader] Failed to load script:', consentioScript.src);
	};


})(window, document, console, customElements);



