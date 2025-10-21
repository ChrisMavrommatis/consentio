/**
 * Consentio - Minimal and lightweight consent modal
 * 
 * Consentio is a lightweight, frontend-only consent management solution for privacy compliance.
 * It integrates seamlessly with tag manager and provides transparent consent handling.
 * 
 * @author ChrisMavrommatis
 * @license Apache-2.0
 */

import Consentio from './consentio.js';



// iifee
(function (global, doc, customElementsRegistry) {

	global.Consentio = new Consentio({

	});

})(window, document, customElements);



