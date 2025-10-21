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
import ConsentioWrapperElement from './consentio-wrapper.js';
import ConsentioBarElement from './consentio-bar.js';
import ConsentioRequiredElement from './consentio-required.js';
import ConsentioFloatingButtonElement from './consentio-floating-button.js';
import ConsentioModalElement from './consentio-modal.js';


// iifee
(function (global, doc, customElementsRegistry) {
	customElementsRegistry.define('consentio-wrapper', ConsentioWrapperElement);
	customElementsRegistry.define('consentio-bar', ConsentioBarElement);
	customElementsRegistry.define('consentio-required', ConsentioRequiredElement);
	customElementsRegistry.define('consentio-floating-button', ConsentioFloatingButtonElement);
	customElementsRegistry.define('consentio-modal', ConsentioModalElement);
	global.Consentio = new Consentio({

	});

})(window, document, customElements);



