(function (global, doc, logger, customElementsRegistry) {
	// see where this file was loaded
	// constains 'consentio-loader' either consentio-loader.js or consentio-loader.min.js
	// Find the loader script
	const loaderScript = Array.from(doc.getElementsByTagName('script')).find(script => {
		const src = script.getAttribute('src');
		return src && src.includes('consentio-loader');
	});


	if (!loaderScript) {
		logger.error('[Consentio] Loader script not found');
		return;
	}

	const loaderSrc = loaderScript.getAttribute('src');
	const basePath = loaderSrc.substring(0, loaderSrc.lastIndexOf('/') + 1);
	const isMinified = loaderSrc.includes('.min.js');

	// Prevent double initialization
	if (global.ConsentioInstance) {
		logger.warn('[Consentio] Already initialized');
		return;
	}

	// Create and configure the main script
	const consentioScript = doc.createElement('script');
	consentioScript.src = `${basePath}consentio${isMinified ? '.min' : ''}.js`;
	doc.head.appendChild(consentioScript);

	// Handle successful load
	consentioScript.onload = function () {
		// Check if Consentio constructor exists
		if (typeof global.Consentio !== 'function') {
			logger.error('[Consentio] Constructor not found after script load');
			return;
		}

		let config = {
			debug: true,
		};
		let cookies = [
			{
				name: 'session_id',
				purpose: 'Maintains user session',
				provenance: 'First-party',
				duration: 'Session',
				category: 'strictly_necessary'
			},
			{
				name: 'analytics_id',
				purpose: 'Collects anonymous site usage data',
				provenance: 'Third-party',
				duration: '1 Year',
				category: 'statistics_performance'
			},
			{
				name: 'ad_tracker',
				purpose: 'Tracks user behavior for targeted advertising',
				provenance: 'Third-party',
				duration: '6 Months',
				category: 'marketing_advertising'
			},
			{
				name: 'language_pref',
				purpose: 'Remembers user language preference',
				provenance: 'First-party',
				duration: '1 Year',
				category: 'preferences_functionality'
			}
		];
		try {
			global.ConsentioInstance = new global.Consentio(config, cookies, logger);
			logger.log('[Consentio] loaded');
		} catch (error) {
			logger.error('[Consentio] Initialization failed:', error);
		}
	};

	// Handle load errors
	consentioScript.onerror = function () {
		logger.error('[Consentio] Failed to load script:', consentioScript.src);
	};


})(window, document, console, customElements);



