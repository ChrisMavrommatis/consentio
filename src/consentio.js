/**
 * Consentio - Minimalist Consent Modal
 * 
 * A lightweight, frontend-only consent management solution for privacy compliance.
 * Integrates seamlessly with tag manager and provides transparent consent handling.
 * 
 * @author ChrisMavrommatis
 * @license Apache-2.0
 */
class Consentio {
	constructor(options = {}) {
		this.options = {
			cookieName: 'consentio',
		}
	}

	init() {
		console.log('Consentio initialized with options:', this.options);
	}
}
