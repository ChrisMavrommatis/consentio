(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Consentio"] = factory();
	else
		root["Consentio"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ consentio)
});

;// ./src/scss/consentio.scss
const consentio_namespaceObject = ":host{--required-bg-color: rgba(0, 0, 0, 0.7);--theme-bar-title-color: #455a64;--bar-shadow-color: rgba(0, 0, 0, 0.37);--bar-bg-color: #e0e0e0;--bar-text-color: #424242;--button-bg-color: #37474f;--button-text-color: #e0e0e0;--button-flat-bg-color: #37474f;--button-flat-text-color: #e0e0e0;--modal-title-color: #455a64;--modal-bg-color: #e0e0e0;--modal-text-color: #424242;--modal-footer-bg-color: #D3D3D3;--modal-footer-border-color: #bdbdbd;--consent-header-bg-color: #ececec;--consent-header-text-color: #455a64;--consent-border-color: #a8a8a8;--consent-shadow-color: #8e8e8e69;--switch-text-color: #37474f;--switch-bg-color: rgba(0, 0, 0, .38);--switch-off-color: #f1f1f1;--switch-on-color: #37474f;--table-border-color: #636363;--floating-btn-bg-color: #37474f;--floating-btn-color: #704747;--link-text-color: #546e7a}:host consentio-required{display:none}:host consentio-bar{display:none}:host consentio-modal{display:none}:host consentio-floating-button{display:none}:host p,:host h1,:host h2,:host h3,:host h4,:host h5,:host h6,:host div,:host li,:host a,:host th,:host td{font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Oxygen-Sans,Ubuntu,Cantarell,\"Helvetica Neue\",sans-serif;text-transform:none;line-height:1.5;letter-spacing:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;font-size:15px}:host h1,:host h2,:host h3,:host h4,:host h5,:host h6{font-weight:400;color:var(--modal-title-color);font-size:2.28rem !important}:host h2{font-size:1.83rem !important}:host h3{font-size:1.5rem !important}:host h4{font-size:1.25rem !important}:host h5{font-size:1rem !important;font-weight:bold !important}:host h6{font-size:.83rem !important}:host th,:host td{background-color:inherit;min-width:inherit;border-bottom:0;border-left:0}:host a,:host .link{color:var(--link-text-color)}:host a:hover,:host .link:hover{filter:brightness(115%)}:host .button{color:var(--button-text-color);background-color:var(--button-bg-color);border:none;border-radius:2px;cursor:pointer;vertical-align:middle;letter-spacing:.5px;display:inline-block;text-align:center;height:36px;min-width:200px;padding:8px 20px;margin:8px 5px;transition:background-color .3s ease-out;-webkit-tap-highlight-color:rgba(0,0,0,0)}:host .button:hover{filter:brightness(115%)}:host .button-flat{background-color:var(--button-flat-bg-color);color:var(--button-flat-text-color);cursor:pointer;vertical-align:middle;letter-spacing:.5px;display:inline-block;text-align:center;height:15 px;border-radius:2px;min-width:100px;padding:5px 10px;margin:4px 2px;transition:background-color .3s ease-out;-webkit-tap-highlight-color:rgba(0,0,0,0)}:host .button-flat:hover{filter:brightness(115%)}:host consentio-required{position:fixed;z-index:15001;width:100%;height:100%;top:0;left:0;background:var(--required-bg-color)}:host consentio-bar{box-sizing:border-box;position:fixed;bottom:0;left:0;width:100%;z-index:15002;line-height:1;box-shadow:0 0 10px var(--bar-shadow-color);overflow-y:auto;background:var(--bar-bg-color);color:var(--bar-text-color);padding:15px 10px 30px 15px}:host consentio-bar>.container{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;margin:0 auto;width:80%}:host consentio-bar>.container>main{max-width:1000px;width:100%}:host consentio-bar>.container>main>h5{color:var(--bar-title-color);margin:0 0 10px;padding:0;font-size:20px;line-height:1.2;font-weight:300}:host consentio-bar>.container>main>p{font-size:14px}:host consentio-bar>.container>footer{align-items:end;margin:-5px}:host consentio-modal{position:fixed;top:10%;z-index:15003;left:0;right:0;background-color:var(--modal-bg-color);color:var(--modal-text-color);padding:0;margin:auto;overflow-y:auto;border-radius:2px;box-shadow:0 0 10px var(--bar-shadow-color);width:70%;max-height:90%;height:70%}@media only screen and (max-width : 992.99px){:host consentio-modal{top:5%;width:90%;height:90%}}:host consentio-modal main{padding:24px 24px 0px 24px;position:absolute;overflow-y:auto;height:calc(100% - 48px - 24px);max-height:100%}:host consentio-modal main p{padding-bottom:10px;margin-bottom:.5rem}:host consentio-modal main>h4{margin-top:0;color:var(--modal-title-color);font-size:2.28rem !important}:host consentio-modal footer{border-radius:0 0 2px 2px;position:absolute;bottom:0;padding:4px 6px;height:40px;width:calc(100% - 12px);text-align:right;background-color:var(--modal-footer-bg-color);border-top:1px solid var(--modal-footer-border-color)}:host consentio-modal footer .logo{position:absolute;padding:6px 12px 12px 12px}:host consentio-consent-items{margin-top:1rem}:host consentio-consent-items consentio-consent-item .consent-header{display:flex;cursor:pointer;line-height:1.5;padding:1rem;align-items:center;justify-content:space-between;background-color:var(--consent-header-bg-color);color:var(--consent-header-text-color);border-bottom:1px solid var(--consent-border-color);border-left:1px solid var(--consent-border-color);border-right:1px solid var(--consent-border-color)}:host consentio-consent-items consentio-consent-item .consent-header h5{max-width:57%;display:flex}:host consentio-consent-items consentio-consent-item .consent-body{display:none;border-bottom:1px solid var(--consent-border-color);border-left:1px solid var(--consent-border-color);border-right:1px solid var(--consent-border-color);box-sizing:border-box;padding:1.5rem}@media only screen and (max-width : 992.99px){:host consentio-consent-items consentio-consent-item .consent-body{padding:1rem}}:host consentio-consent-items consentio-consent-item:first-child .consent-header{border-top:1px solid var(--consent-border-color)}:host consentio-switch{user-select:none;-webkit-tap-highlight-color:rgba(0,0,0,0)}:host consentio-switch label{cursor:pointer;font-size:.8rem;color:var(--switch-text-color)}:host consentio-switch input[type=checkbox]{opacity:0;width:0;height:0}:host consentio-switch input[type=checkbox]:checked:not([disabled]){background-color:#84c7c1}:host consentio-switch input[type=checkbox]:not(:checked),:host consentio-switch input[type=checkbox]:checked{position:absolute;opacity:0;pointer-events:none}:host consentio-switch .switch-lever{content:\"\";display:inline-block;position:relative;width:36px;height:14px;background-color:var(--switch-bg-color);border-radius:15px;margin-right:10px;transition:background .3s ease;vertical-align:middle;margin:0 16px}:host consentio-switch .switch-lever::before{background-color:rgba(38,166,154,.15)}:host consentio-switch .switch-lever::after{background-color:var(--switch-off-color);box-shadow:0px 3px 1px -2px rgba(0,0,0,.2),0px 2px 2px 0px rgba(0,0,0,.14),0px 1px 5px 0px rgba(0,0,0,.12)}:host consentio-switch .switch-lever::before,:host consentio-switch .switch-lever::after{content:\"\";position:absolute;display:inline-block;width:20px;height:20px;border-radius:50%;left:0;top:-3px;transition:left .3s ease,background .3s ease,box-shadow .1s ease,transform .1s ease}:host consentio-switch input[type=checkbox]:checked:checked+.switch-lever::before,:host consentio-switch input[type=checkbox]:checked:checked+.switch-lever::after{left:18px}:host consentio-switch input[type=checkbox]:checked:checked+.switch-lever::after{background-color:var(--switch-on-color)}:host table{width:100%;display:table;border-collapse:collapse;border-spacing:0;border:none}@media only screen and (max-width : 992.99px){:host table{overflow-wrap:anywhere}}:host table td,:host table th{padding:15px 5px;display:table-cell;text-align:left;vertical-align:middle;border-radius:2px}:host table tr{border-bottom:none;border-bottom:1px solid var(--table-border-color)}:host table tbody>tr>td{border-radius:0}:host consentio-floating-button{position:fixed;right:40px;bottom:40px;z-index:15000;box-sizing:border-box}:host consentio-floating-button button{font-family:inherit;line-height:inherit;border:none;cursor:pointer;background:var(--floating-btn-bg-color);border-radius:50%;transition:background-color .2s ease-in-out;align-items:center;display:flex;justify-content:center;box-shadow:0px 3px 5px -1px rgba(0,0,0,.2),0px 6px 10px rgba(0,0,0,.14),0px 1px 18px rgba(0,0,0,.12);color:var(--floating-btn-color);width:64px;height:64px;left:initial;padding:0}:host consentio-floating-button button:hover{filter:brightness(115%)}:host consentio-floating-button button .icon{color:var(--floating-btn-color);padding:12px;height:auto;width:inherit}:host consentio-floating-button button .icon:hover{filter:brightness(115%)}";
;// ./src/js/template-renderer.js
class TemplateRenderer {

	static illegalRgx = /[\/\?<>\\:\*\|"]/g;
	static controlRgx = /[\x00-\x1f\x80-\x9f]/g;
	static reservedRgx = /^\.+$/;
	static windowsReservedRgx = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
	static windowsTrailingRgx = /[\. ]+$/;

	static render(template, data) {
		return template.replace(/{{\s*([\w]+)\s*}}/g, (match, p1) => {
			return this.domSanitize(data[p1] || '');
		});
	}

	static domSanitize(value) {
		const div = document.createElement('div');
		div.appendChild(document.createTextNode(value));
		return div.innerHTML
	}

	static regexSanitize(value, replacement) {
		return value
			.replace(TemplateRenderer.illegalRgx, replacement)
			.replace(TemplateRenderer.controlRgx, replacement)
			.replace(TemplateRenderer.reservedRgx, replacement)
			.replace(TemplateRenderer.windowsReservedRgx, replacement)
			.replace(TemplateRenderer.windowsTrailingRgx, replacement);
	}
}

/* harmony default export */ const template_renderer = (TemplateRenderer);

;// ./src/html/consentio-bar.html
// Module
var code = `<consentio-bar> <div class="container"> <main> <h2>{{ barTitle }}</h2> <p> {{ barDescription }} </p> </main> <footer> <button class="button" data-role="settings">{{ buttonSettings }}</button> <button class="button" data-role="acceptAll">{{ buttonAcceptAll }}</button> </footer> </div> </consentio-bar> `;
// Exports
/* harmony default export */ const consentio_bar = (code);
;// ./src/html/consentio-modal.html
// Module
var consentio_modal_code = `<consentio-modal> <main> <h4>{{ modalTitle }}</h4> <p>{{ modalDescription }}</p> <consentio-consent-items> {{ consentItems }} </consentio-consent-items> </main> <footer> <div class="logo"> <a href="https://github.com/ChrisMavrommatis/consentio" target="_blank" rel="noopener noreferrer" class="link"> Consentio </a> </div> <a class="button-flat" data-role="cancel">{{ buttonCancel }}</a> <a class="button-flat" data-role="save">{{ buttonSave }}</a> </footer> </consentio-modal> `;
// Exports
/* harmony default export */ const consentio_modal = (consentio_modal_code);
;// ./src/html/consent-item.html
// Module
var consent_item_code = `<consentio-consent-item id="{{ consentKey }}"> <div class="consent-header"> <h5>{{ consentTitle }}</h5> <consentio-switch> <label> <input name="{{ consentKey }}_cookies" id="{{ consentKey }}_cookies" type="checkbox" autocomplete="off"/> <span class="switch-lever"></span> </label> </consentio-switch> </div> <div class="consent-body" style="display:none"> <span>{{ consentDescription }}</span> </div> </consentio-consent-item> `;
// Exports
/* harmony default export */ const consent_item = (consent_item_code);
;// ./src/html/consentio-floating-button.html
// Module
var consentio_floating_button_code = `<consentio-floating-button> <button> <div class="icon"> <svg viewBox="0 0 122.88 121.74"> <g> <path stroke="white" fill="white" d="M32.18,105.73c0.7-1.11,2.16-1.44,3.27-0.74c1.11,0.7,1.44,2.16,0.74,3.27l-4.81,7.68c-0.7,1.11-2.16,1.44-3.27,0.74 c-1.11-0.7-1.44-2.16-0.74-3.27L32.18,105.73L32.18,105.73z M6.57,75.32c0.33,1.27-0.42,2.57-1.69,2.9 c-1.27,0.33-2.57-0.42-2.9-1.69c-0.39-1.5-0.73-3.01-1.02-4.54c-0.28-1.52-0.5-3.03-0.66-4.54c-0.1-0.98-0.18-1.98-0.22-2.99 C0.02,63.37,0,62.36,0,61.44C0,44.47,6.88,29.11,18,18C29.11,6.88,44.47,0,61.44,0c16.97,0,32.34,6.83,43.47,17.91 c11.11,11.06,17.97,26.36,17.97,43.3c0,1.31-1.07,2.38-2.38,2.38c-1.31,0-2.38-1.07-2.38-2.38c0-15.64-6.33-29.74-16.56-39.93 C91.3,11.06,77.12,4.76,61.44,4.76c-15.65,0-29.82,6.34-40.08,16.6C11.11,31.62,4.76,45.79,4.76,61.44c0,1.04,0.02,1.97,0.06,2.8 c0.04,0.91,0.11,1.82,0.2,2.73c0.15,1.4,0.35,2.79,0.61,4.17C5.89,72.51,6.2,73.9,6.57,75.32L6.57,75.32z M12.97,96.87 c-0.99,0.86-2.49,0.75-3.35-0.24c-0.86-0.99-0.75-2.49,0.24-3.35c0.6-0.52,1.13-1.14,1.58-1.86c0.47-0.74,0.86-1.61,1.17-2.6 c1.59-5.06,0.63-10.34-0.34-15.69c-0.66-3.64-1.33-7.31-1.3-11.14c0.12-19.6,12.38-35.58,28.42-43.77 c6.73-3.44,14.15-5.5,21.63-5.89c7.51-0.39,15.08,0.93,22.07,4.25C98.7,24,111.38,41.37,114.02,72.13 c0.11,1.31-0.87,2.46-2.18,2.57c-1.31,0.11-2.46-0.87-2.57-2.18c-2.47-28.79-14.02-44.89-28.21-51.64 c-6.26-2.98-13.05-4.15-19.8-3.81c-6.79,0.35-13.55,2.24-19.71,5.38C26.96,29.89,15.82,44.34,15.71,62 c-0.02,3.4,0.61,6.86,1.23,10.29c1.08,5.94,2.14,11.8,0.21,17.95c-0.43,1.38-1,2.62-1.69,3.72C14.76,95.07,13.92,96.04,12.97,96.87 L12.97,96.87z M109.22,82.01c0-1.32,1.07-2.38,2.38-2.38s2.38,1.07,2.38,2.38v9.98c0,1.32-1.07,2.38-2.38,2.38 s-2.38-1.07-2.38-2.38V82.01L109.22,82.01z M20.01,106.56c-0.98,0.87-2.48,0.78-3.35-0.2c-0.87-0.98-0.78-2.48,0.2-3.35 c2.95-2.6,5.1-5.96,6.34-10.17c1.28-4.34,1.6-9.61,0.85-15.92c-1.38-6.78-1.63-13.04-0.82-18.69c0.84-5.91,2.84-11.15,5.89-15.63 c0.74-1.08,2.22-1.36,3.3-0.62c1.08,0.74,1.36,2.22,0.62,3.3c-2.64,3.87-4.37,8.44-5.11,13.62c-0.73,5.13-0.5,10.84,0.77,17.07 c0.03,0.12,0.06,0.24,0.07,0.36c0.84,6.97,0.45,12.88-1.01,17.85C26.26,99.28,23.63,103.36,20.01,106.56L20.01,106.56z M44.18,34.97c-1.14,0.66-2.59,0.27-3.25-0.87c-0.66-1.14-0.27-2.59,0.87-3.25c2.66-1.54,5.5-2.76,8.43-3.65 c8.04-2.44,16.77-2.37,24.71,0.41c7.98,2.8,15.15,8.32,20.03,16.77c1.63,2.81,3,5.96,4.06,9.45c1.51,4.98,2.54,10.54,3.07,16.65 c0.52,6.01,0.55,12.61,0.09,19.79c0,0.07-0.01,0.13-0.02,0.2l-1.66,16.38c-0.13,1.3-1.29,2.26-2.6,2.13 c-1.3-0.13-2.26-1.29-2.13-2.6l1.66-16.4l0-0.01c0.44-6.91,0.41-13.29-0.09-19.1c-0.5-5.82-1.46-11.05-2.86-15.66 c-0.94-3.11-2.17-5.92-3.63-8.45c-4.27-7.4-10.53-12.23-17.48-14.67c-6.99-2.45-14.68-2.51-21.77-0.36 C49.04,32.53,46.55,33.6,44.18,34.97L44.18,34.97z M38.95,98.15c-0.23,1.29-1.46,2.16-2.75,1.93c-1.29-0.23-2.16-1.46-1.93-2.75 c0.55-3.08,0.86-6.53,0.97-10.29c0.11-3.81,0.02-7.98-0.24-12.44c-0.05-0.96-0.14-2.15-0.22-3.31c-0.54-7.59-0.97-13.71,3.47-21.6 c0.98-1.74,2.15-3.36,3.55-4.84c1.4-1.48,3.01-2.82,4.84-3.99c0.12-0.08,0.24-0.14,0.37-0.19c2.71-1.3,5.4-2.31,8.09-2.97 c2.77-0.68,5.52-0.98,8.23-0.83c1.31,0.07,2.32,1.18,2.25,2.49c-0.07,1.31-1.18,2.32-2.49,2.25c-2.25-0.12-4.54,0.13-6.87,0.7 c-2.32,0.57-4.7,1.46-7.12,2.62c-1.47,0.95-2.75,2.01-3.84,3.17c-1.12,1.19-2.07,2.49-2.86,3.91c-3.74,6.66-3.36,12.14-2.88,18.94 c0.07,1,0.14,2.04,0.22,3.38c0.26,4.54,0.35,8.84,0.24,12.83C39.85,91.22,39.53,94.9,38.95,98.15L38.95,98.15z M72.44,44.51 c-1.12-0.68-1.47-2.15-0.79-3.26c0.68-1.12,2.14-1.47,3.26-0.79c0.73,0.45,1.44,0.93,2.13,1.45c0.68,0.51,1.35,1.07,2.02,1.68 c9.06,8.23,12.13,21.46,12.33,35.3c0.19,13.48-2.34,27.54-4.66,37.91c-0.28,1.28-1.55,2.09-2.83,1.8c-1.28-0.28-2.09-1.55-1.8-2.83 c2.26-10.12,4.74-23.81,4.55-36.83c-0.18-12.66-2.88-24.65-10.79-31.84c-0.55-0.5-1.12-0.97-1.69-1.4 C73.6,45.25,73.02,44.86,72.44,44.51L72.44,44.51z M43.15,119.69c-0.76,1.07-2.24,1.33-3.31,0.57c-1.07-0.76-1.33-2.24-0.57-3.31 c1.68-2.37,3.1-4.97,4.26-7.79c1.16-2.84,2.06-5.93,2.68-9.27c1.16-6.23,0.61-14.17,0.08-21.67c-0.18-2.53-0.35-5-0.46-7.54 c-0.16-3.71-0.23-7.35,0.46-10.66c0.75-3.61,2.37-6.74,5.62-9.02c0.73-0.51,1.52-0.97,2.37-1.36c0.85-0.39,1.77-0.74,2.76-1.02 c0.74-0.21,1.47-0.38,2.18-0.5c4.87-0.83,8.73,0.43,11.71,3.03c2.83,2.47,4.75,6.11,5.93,10.24c0.35,1.24,0.64,2.53,0.87,3.85 c0.12,0.72,0.23,1.45,0.31,2.18c0.08,0.72,0.15,1.46,0.2,2.22c0.5,7.54,0.17,16.95-0.85,26.16c-0.98,8.83-2.6,17.53-4.75,24.3 c-0.4,1.25-1.73,1.94-2.98,1.55c-1.25-0.4-1.94-1.73-1.55-2.98c2.04-6.43,3.59-14.81,4.54-23.38c0.99-8.95,1.31-18.06,0.83-25.34 c-0.04-0.63-0.1-1.29-0.18-1.97c-0.07-0.64-0.17-1.28-0.28-1.91c-0.2-1.14-0.45-2.26-0.75-3.35c-0.94-3.31-2.4-6.15-4.48-7.96 c-1.92-1.67-4.47-2.47-7.77-1.91c-0.53,0.09-1.09,0.22-1.68,0.39c-0.77,0.22-1.46,0.47-2.07,0.76c-0.62,0.29-1.17,0.6-1.64,0.93 c-2.09,1.46-3.16,3.59-3.68,6.09c-0.58,2.79-0.51,6.1-0.37,9.49c0.1,2.25,0.28,4.81,0.46,7.43c0.54,7.78,1.12,16.01-0.16,22.85 c-0.68,3.65-1.67,7.04-2.96,10.2C46.64,114.11,45.04,117.02,43.15,119.69L43.15,119.69z M59.44,62.15 c-0.24-1.29,0.62-2.53,1.91-2.76c1.29-0.24,2.53,0.62,2.76,1.91c1.21,6.52,1.79,13.11,1.81,19.73c0.02,6.59-0.52,13.21-1.54,19.84 c-0.2,1.29-1.41,2.18-2.71,1.98c-1.29-0.2-2.18-1.41-1.98-2.71c0.99-6.38,1.51-12.76,1.49-19.11C61.16,74.7,60.6,68.4,59.44,62.15 L59.44,62.15z M56.72,108.31c0.28-1.28,1.55-2.09,2.83-1.8c1.28,0.28,2.09,1.55,1.8,2.83l-2.08,9.37c-0.28,1.28-1.55,2.09-2.83,1.8 c-1.28-0.28-2.09-1.55-1.8-2.83L56.72,108.31L56.72,108.31z"/> </g> </svg> </div> </button> </consentio-floating-button> `;
// Exports
/* harmony default export */ const consentio_floating_button = (consentio_floating_button_code);
;// ./src/js/consentio-gtm.js
class ConsentioGTM {
	constructor(logger) {
		this.logger = logger;
		this.dataLayer = window.dataLayer = window.dataLayer || [];
	}

	defaultConsent(state) {
		const gtmConsents = this.mapConsentsToGTM(state);
		this.push('consent', 'default', gtmConsents);
		this.dataLayer.push({ event: 'default_consent' });
		this.logger?.log('[Consentio:GTM] Default consent set', 'info');
	}

	updateConsent(state) {
		const gtmConsents = this.mapConsentsToGTM(state);
		this.push('consent', 'update', gtmConsents);
		this.dataLayer.push({ event: 'update_consent' });
		this.logger?.log('[Consentio:GTM] Consent updated', 'info');
	}

	mapConsentsToGTM(state) {
		return {
			essential_storage: state['strictly_necessary'],
			security_storage: state['strictly_necessary'],
			functionality_storage: state['preferences_functionality'],
			personalization_storage: state['preferences_functionality'],
			analytics_storage: state['statistics_performance'],
			ad_storage: state['marketing_advertising'],
			ad_user_data: state['marketing_advertising'],
			ad_personalization: state['marketing_advertising']
		};

	}

	push() {
		this.dataLayer.push(arguments);
		this.logger?.log(`[Consentio:GTM] Pushed event: ${arguments[0]}`, 'info');
	}
}

/* harmony default export */ const consentio_gtm = (ConsentioGTM);

;// ./src/js/utils.js
function isHidden(el) {
	return el.style.display === 'none' || el.offsetParent === null;
}
function showElement(el) {
	el.style.display = 'block';
}

function hideElement(el) {
	el.style.display = 'none';
}



;// ./src/js/consentio-app.js











class ConsentioAppElement extends HTMLElement {

	constructor() {
		super();
		this._shadow = this.attachShadow({ mode: 'closed' });
		this.isRendered = false;
		this.isVisible = false;
		this._config = {};
		this._state = {};
		this._cookies = [];
		this._logger = null;
		this.required = null;
		this.bar = null;
		this.modal = null;
		this.consentItems = [];
		this.floatingButton = null;
		this.gtm = null;
	}

	get config() {
		return this._config;
	}

	set config(value) {
		this._config = { ...this._config, ...value };
		if (this.isRendered) {
			this.render();
		}
	}

	get state() {
		return this._state;
	}

	set state(value) {
		this._state = value;
	}

	get cookies() {
		return this._cookies;
	}

	set cookies(value) {
		this._cookies = [...value];
	}

	get logger() {
		return this._logger;
	}
	set logger(value) {
		this._logger = value;
	}

	connectedCallback() {
		this.render();
		this.initState();
		this.addEventListener('consentio:open-settings', this.openSettings.bind(this));
		this.addEventListener('consentio:accept-all-consents', this.acceptAll.bind(this));
		this.addEventListener('consentio:cancel-settings', this.cancelSettings.bind(this));
		this.addEventListener('consentio:save-settings', this.saveSettings.bind(this));

		this.gtm = new consentio_gtm(this.logger);
		this.isRendered = true;
		this.emit('consentio:initialized', this.state.consents);
		this.gtm?.defaultConsent(this.state.consents);

	}

	disconectedCallback() {
		this.removeEventListener('consentio:open-settings', this.openSettings.bind(this));
		this.removeEventListener('consentio:accept-all-consents', this.acceptAll.bind(this));
		this.removeEventListener('consentio:cancel-settings', this.cancelSettings.bind(this));
		this.removeEventListener('consentio:save-settings', this.saveSettings.bind(this));
	}

	render() {
		if (!this.isRendered) {
			const style = document.createElement('style');
			style.textContent = consentio_namespaceObject;
			this._shadow.appendChild(style);

			this.required = document.createElement("consentio-required");
			this._shadow.appendChild(this.required);
		}

		const newBar = this.renderNode(consentio_bar, {
			barTitle: this.config.texts.barTitle,
			barDescription: this.config.texts.barDescription,
			buttonSettings: this.config.texts.buttonSettings,
			buttonAcceptAll: this.config.texts.buttonAcceptAll,
		});

		const cookieTableHeaders = {
			cookieName: this.config.texts.cookieTableHeaderName,
			cookiePurpose: this.config.texts.cookieTableHeaderPurpose,
			cookieProvenance: this.config.texts.cookieTableHeaderProvenance,
			cookieDuration: this.config.texts.cookieTableHeaderDuration
		};
		this.addOrReplace(newBar, this.bar);
		this.bar = newBar;
		this.bar.logger = this.logger;

		this.consentItems = this.config.consents.map(consent => {
			const consentItem = this.renderNode(consent_item, {
				consentKey: consent.key,
				consentTitle: consent.title,
				consentDescription: consent.description,
			});
			if (consent.alwaysOn) {
				consentItem.alwaysOn = this.config.texts.alwaysOnLabel;
			}
			consentItem.tableHeaders = cookieTableHeaders;
			consentItem.cookies = this.cookies.filter(cookie => cookie.category === consent.key);
			if (this.state.consentGiven) {
				consentItem.itemState = this.state.consents[consentItem.id];
			} else {
				consentItem.itemState = consent.defaultState;
			}
			return consentItem;
		});

		const newModal = this.renderNode(consentio_modal, {
			modalTitle: this.config.texts.modalTitle,
			modalDescription: this.config.texts.modalDescription,
			buttonSave: this.config.texts.buttonSave,
			buttonCancel: this.config.texts.buttonCancel,
		});
		const consentList = newModal.querySelector('consentio-consent-items');
		this.consentItems.forEach(consentItem => {
			consentList.appendChild(consentItem);
		});

		this.addOrReplace(newModal, this.modal);
		this.modal = newModal;
		this.modal.logger = this.logger;


		if (!this.isRendered) {
			this.floatingButton = this.renderNode(consentio_floating_button, {

			});
			this._shadow.appendChild(this.floatingButton);
		}
	}

	initState() {
		hideElement(this.required);
		hideElement(this.bar);
		hideElement(this.modal);
		hideElement(this.floatingButton);
		if (this.state.consentGiven) {
			showElement(this.floatingButton);
			return;
		}
		showElement(this.bar);
		if (this.config.consentRequired) {
			showElement(this.required);
		}
	}

	renderNode(template, data) {
		const htmlString = template_renderer.render(template, data);
		const templateElement = document.createElement('template');
		templateElement.innerHTML = htmlString.trim();
		return templateElement.content.firstChild;
	}

	addOrReplace(newEl, oldEl) {
		if (!this.isRendered) {
			this._shadow.appendChild(newEl);
		}
		else {
			this._shadow.replaceChild(newEl, oldEl);
		}
	}

	openSettings(event) {
		event.stopImmediatePropagation();
		hideElement(this.bar);
		hideElement(this.floatingButton);
		showElement(this.modal);
		if (this.config.consentRequired) {
			showElement(this.required);
		}
	}
	acceptAll(event) {
		event.stopImmediatePropagation();
		this.state.acceptAll();
		this.consentItems.forEach((consentItem) => {
			consentItem.updateState(this.state.consents[consentItem.id]);
			consentItem.reset();
		});
		hideElement(this.bar);
		hideElement(this.required);
		showElement(this.floatingButton);
		this.emit('consentio:consent-update', this.state.consents);
		this.gtm?.updateConsent(this.state.consents);
	}

	cancelSettings(event) {
		event.stopImmediatePropagation();
		this.consentItems.forEach((consentItem) => {
			consentItem.reset();
		});
		hideElement(this.modal);
		if (!this.state.consentGiven) {
			showElement(this.bar);
			if (this.config.consentRequired) {
				showElement(this.required);
			}
			return;
		}
		hideElement(this.bar);
		hideElement(this.required);
		showElement(this.floatingButton);
	}

	saveSettings(event) {
		event.stopImmediatePropagation();
		this.logger.log(event, 'info');
		this.state.updateState(event.detail);
		this.consentItems.forEach((consentItem) => {
			consentItem.updateState(this.state.consents[consentItem.id]);
			consentItem.reset();
		});
		hideElement(this.modal);
		if (!this.state.consentGiven) {
			showElement(this.bar);
			if (this.config.consentRequired) {
				showElement(this.required);
			}
			return;
		}
		hideElement(this.bar);
		hideElement(this.required);
		showElement(this.floatingButton);
		this.emit('consentio:consent-update', this.state.consents);
		this.gtm?.updateConsent(this.state.consents);
	}

	emit(event, data) {
		this.dispatchEvent(new CustomEvent(event, {
			bubbles: true,
			composed: true,
			detail: data
		}));
	}

	// public api

}

/* harmony default export */ const consentio_app = (ConsentioAppElement);

;// ./src/js/consentio-bar.js
class ConsentioBarElement extends HTMLElement {

	constructor() {
		super();
		this.settingsBtn = this.querySelector('button[data-role="settings"]');
		this.acceptAllBtn = this.querySelector('button[data-role="acceptAll"]');
		this._logger = null;
	}


	get logger() {
		return this._logger;
	}

	set logger(value) {
		this._logger = value;

	}
	connectedCallback() {
		this.settingsBtn.addEventListener('click', this.openSettings.bind(this));
		this.acceptAllBtn.addEventListener('click', this.acceptAll.bind(this));
	}

	disconectedCallback() {
		this.settingsBtn.removeEventListener('click', this.openSettings.bind(this));
		this.acceptAllBtn.removeEventListener('click', this.acceptAll.bind(this));
	}


	openSettings(event) {
		event.stopImmediatePropagation();
		this.emit('consentio:open-settings', {});
		this.logger?.log('[Consentio:Event] open-settings', 'info');
	}

	acceptAll(event) {
		event.stopImmediatePropagation();
		this.emit('consentio:accept-all-consents', {});
		this.logger?.log('[Consentio:Event] accept-all-consents', 'info');
	}

	emit(event, data) {
		this.dispatchEvent(new CustomEvent(event, {
			bubbles: true,
			composed: true,
			detail: data
		}));
	}


}

/* harmony default export */ const js_consentio_bar = (ConsentioBarElement);

;// ./src/js/consentio-required.js
class ConsentioRequiredElement extends HTMLElement {

	constructor() {
		super();
	}

}


/* harmony default export */ const consentio_required = (ConsentioRequiredElement);

;// ./src/js/consentio-floating-button.js
class ConsentioFloatingButtonElement extends HTMLElement {
	constructor() {
		super();
		this.button = this.querySelector('button');
	}

	connectedCallback() {
		this.button.addEventListener('click', this.openSettings.bind(this));
	}

	disconnectedCallback() {
		this.button.removeEventListener('click', this.openSettings.bind(this));
	}

	openSettings(event) {
		event.stopImmediatePropagation();
		this.emit('consentio:open-settings', {});
	}

	emit(event, data) {
		this.dispatchEvent(new CustomEvent(event, {
			bubbles: true,
			composed: true,
			detail: data
		}));
	}


}

/* harmony default export */ const js_consentio_floating_button = (ConsentioFloatingButtonElement);

;// ./src/js/consentio-consent-item.js


class ConsentioConsentItemElement extends HTMLElement {

	constructor() {
		super();
		this.consentBody = this.querySelector('.consent-body');
		this.switch = this.querySelector('consentio-switch');
		this.input = this.switch.querySelector('input');
		this._alwaysOn = null;
		this._cookies = [];
		this._tableHeaders = null;
		this._itemState = null;
	}

	set alwaysOn(value) {
		this._alwaysOn = value;
	}
	get alwaysOn() {
		return this._alwaysOn;
	}

	get cookies() {
		return this._cookies;
	}

	set cookies(value) {
		this._cookies = value;
	}

	set tableHeaders(value) {
		this._tableHeaders = value;
	}

	get tableHeaders() {
		return this._tableHeaders;
	}

	get itemState() {
		return this._itemState;
	}

	set itemState(value) {
		this._itemState = value;
	}

	readState() {
		if (!!this.alwaysOn) {
			return 'granted';
		}
		return this.input.checked ? 'granted' : 'denied';
	}

	updateState(value) {
		this.itemState = value;
		this.input.checked = value === 'granted';
	}

	reset() {
		this.input.checked = this.itemState === 'granted';
		hideElement(this.consentBody);
	}

	toggleBody(event) {
		event.stopImmediatePropagation();
		if (isHidden(this.consentBody)) {
			showElement(this.consentBody);
		}
		else {
			hideElement(this.consentBody);
		}
	}

	render() {
		if (this.alwaysOn !== null) {
			const switchLabel = this.switch.querySelector('label');
			switchLabel.innerHTML = '';
			switchLabel.textContent = this.alwaysOn;
		}
		if (!this.cookies || !this.tableHeaders) {
			return;
		}
		const tableFragment = document.createDocumentFragment();
		const table = document.createElement('table');
		tableFragment.appendChild(table);

		const thead = document.createElement('thead');
		table.appendChild(thead);
		const headerRow = document.createElement('tr');
		thead.appendChild(headerRow);


		Array.from(Object.keys(this.tableHeaders)).forEach(key => {
			const th = document.createElement('th');
			th.appendChild(document.createTextNode(this.tableHeaders[key]));
			headerRow.appendChild(th);
		});

		const tbody = document.createElement('tbody');
		table.appendChild(tbody);
		this.cookies.forEach(cookie => {
			const row = document.createElement('tr');
			tbody.appendChild(row);

			const nameCell = document.createElement('td');
			nameCell.appendChild(document.createTextNode(cookie.name));
			row.appendChild(nameCell);

			const purposeCell = document.createElement('td');
			purposeCell.appendChild(document.createTextNode(cookie.purpose));
			row.appendChild(purposeCell);

			const provenanceCell = document.createElement('td');
			provenanceCell.appendChild(document.createTextNode(cookie.provenance));
			row.appendChild(provenanceCell);

			const durationCell = document.createElement('td');
			durationCell.appendChild(document.createTextNode(cookie.duration));
			row.appendChild(durationCell);
		});
		this.consentBody.appendChild(tableFragment);
		this.input.checked = this.itemState === 'granted';
	}

	connectedCallback() {
		this.addEventListener('click', this.toggleBody.bind(this));
		this.render();
	}
	disconnectedCallback() {
		this.removeEventListener('click', this.toggleBody.bind(this));
	}



}

/* harmony default export */ const consentio_consent_item = (ConsentioConsentItemElement);


;// ./src/js/consentio-modal.js
class ConsentioModalElement extends HTMLElement {

	constructor() {
		super();
		this._logger = null;
		this.cancelBtn = this.querySelector('[data-role="cancel"]');
		this.saveBtn = this.querySelector('[data-role="save"]');
		this.consents = Array.from(
			this.querySelectorAll('consentio-consent-item')
		);
	}

	get logger() {
		return this._logger;
	}

	set logger(value) {
		this._logger = value;
	}

	connectedCallback() {
		this.cancelBtn.addEventListener('click', this.cancel.bind(this));
		this.saveBtn.addEventListener('click', this.save.bind(this));

	}

	disconnectedCallback() {
		this.cancelBtn.removeEventListener('click', this.cancel.bind(this));
		this.saveBtn.removeEventListener('click', this.save.bind(this));
	}

	cancel(event) {
		event.stopImmediatePropagation();
		this.emit('consentio:cancel-settings', {});
		this.logger?.log('[Consentio:Event] cancel-settings', 'info');
	}

	save(event) {
		event.stopImmediatePropagation();
		const state = {};
		this.consents.forEach((consentItem) => {
			const consentName = consentItem.id;
			state[consentName] = consentItem.readState();
		});
		this.emit('consentio:save-settings', state);
		this.logger?.log('[Consentio:Event] save-settings', 'info');
	}

	emit(event, data) {
		this.dispatchEvent(new CustomEvent(event, {
			bubbles: true,
			composed: true,
			detail: data
		}));
	}
}

/* harmony default export */ const js_consentio_modal = (ConsentioModalElement);

;// ./src/js/cookies.js
/*! based on js-cookie v3.0.1 */

class Cookies {

	static defaultAttributes = {
		path: '/',
		expires: 90,
		sameSite: 'Lax',
		secure: true
	};

	static converter = {
		read: function (value) {
			if (value[0] === '"') {
				value = value.slice(1, -1);
			}
			return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
		},
		write: function (value) {
			return encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
		}
	};

	static assign(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				target[key] = source[key];
			}
		}
		return target;
	}

	static set(key, value, attributes) {
		attributes = this.assign({}, Cookies.defaultAttributes, attributes);

		if (typeof attributes.expires === 'number') {
			attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
		}
		if (attributes.expires) {
			attributes.expires = attributes.expires.toUTCString();
		}

		key = encodeURIComponent(key)
			.replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
			.replace(/[()]/g, escape);

		var stringifiedAttributes = '';
		for (var attributeName in attributes) {
			if (!attributes[attributeName]) {
				continue;
			}

			stringifiedAttributes += '; ' + attributeName;

			if (attributes[attributeName] === true) {
				continue;
			}

			stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
		}
		return (document.cookie = key + '=' + Cookies.converter.write(value, key) + stringifiedAttributes);
	}

	static get(key) {
		if (typeof document === 'undefined' || (arguments.length && !key)) {
			return;
		}

		var cookies = document.cookie ? document.cookie.split('; ') : [];
		var jar = {};
		for (var i = 0; i < cookies.length; i++) {
			var parts = cookies[i].split('=');
			var value = parts.slice(1).join('=');

			try {
				var foundKey = decodeURIComponent(parts[0]);
				jar[foundKey] = Cookies.converter.read(value, foundKey);

				if (key === foundKey) {
					break;
				}
			} catch (e) { }
		}

		return key ? jar[key] : jar;
	}

	static remove(name) {
		this.set(name, '', { expires: -1 });
	}

}

/* harmony default export */ const cookies = (Cookies);

;// ./src/js/consentio-state.js



class ConsentioState {
	constructor(cookieName, version, consents) {
		this.cookieName = cookieName;
		this.version = version;
		this.consents = this.getCookieConsents();
		this.consentGiven = this.consents !== null;
		if (!this.consentGiven) {
			// Just in case version didn't match
			cookies.remove(this.cookieName);

			// Initialize Minimum consent state
			this.consents = {};
			consents.forEach((consent, index) => {
				this.consents[consent.key] = consent.alwaysOn ? 'granted' : consent.defaultState;
			});
		}


	}

	getCookieConsents() {
		const cookie = cookies.get(this.cookieName);
		if (!cookie) {
			return null;
		}
		try {
			var state = JSON.parse(cookie);
			if (state.version === this.version) {
				// remove version from object
				delete state.version;

				return state;
			}
			return null;
		}
		catch {
			return null;
		}
	}

	updateState(newState) {
		this.consents = newState;
		var state = { version: this.version, ...this.consents };
		cookies.set(this.cookieName, JSON.stringify(state));
		this.consentGiven = true;
	}

	acceptAll() {
		Array.from(Object.keys(this.consents)).forEach((key) => {
			this.consents[key] = 'granted';
		});
		var state = { version: this.version, ...this.consents };
		cookies.set(this.cookieName, JSON.stringify(state));
		this.consentGiven = true;
	}
}

/* harmony default export */ const consentio_state = (ConsentioState);

;// ./src/js/consentio-logger.js
class ConsentioLogger {
	constructor(logger, debug) {
		this.logger = logger;
		this.debug = debug;
	}

	log(text, level) {
		if (!this.debug || !this.logger) {
			return;
		}

		switch (level) {
			case 'error':
				this.logger?.error(text);
				break;
			case 'warn':
				this.logger.warn(text);
				break;
			case 'info':
				this.logger?.info(text);
				break;
			default:
				this.logger?.log(text);
				break;
		}

	}
}

/* harmony default export */ const consentio_logger = (ConsentioLogger);

;// ./src/js/consentio.js
/**
 * Consentio - Minimal and lightweight consent modal
 * 
 * Consentio is a lightweight, frontend-only consent management solution for privacy compliance.
 * It integrates seamlessly with tag manager and provides transparent consent handling.
 * 
 * @author ChrisMavrommatis
 * @license Apache-2.0
 */











class Consentio {
	static version = '0.0.1';
	static _defaultConfig = {
		cookieName: 'consentio',
		debug: false,
		version: 1,
		consentRequired: false,
		texts: {
			barTitle: 'Cookie Policy',
			barDescription: 'This site uses cookies to enhance your experience. We are assuming that you are okay with that, but you can change that by clicking at the settings button.',
			buttonSettings: 'Settings',
			buttonSave: 'Save',
			buttonCancel: 'Cancel',
			buttonAcceptAll: 'Accept All',
			modalTitle: 'Cookie Settings',
			modalDescription: `Here you can change your cookie preferences. Clicking on save will save the current settings, while clicking on cancel makes no change.
			According to the European general data protection regulation (GDPR) and the ePrivacy directive, websites must receive the user’s consent before using any cookie 
			besides the strictly necessary ones. You can expand each section to learn a bit more for each category. If you are interested to learn more, then follow the link.`,
			alwaysOnLabel: 'Always On',
			cookieTableHeaderName: 'Cookie Name',
			cookieTableHeaderPurpose: 'Cookie Purpose',
			cookieTableHeaderProvenance: 'Provenance',
			cookieTableHeaderDuration: 'Duration'
		},
		consents: [
			{
				key: 'strictly_necessary',
				title: 'Strictly Necessary Cookies',
				description: `These cookies are essential for you to browse the website and use its features, such as accessing secure areas of the site. 
				Cookies that allow web shops to hold your items in your cart while you are shopping online are an example of strictly necessary cookies.`,
				alwaysOn: true,
				defaultState: 'granted'
			},
			{
				key: 'preferences_functionality',
				title: 'Preferences Cookies',
				description: `Preference cookies enable a website to remember information that changes the way the website behaves or looks, 
				such as your preferred language or the region that you are in.`,
				alwaysOn: false,
				defaultState: 'denied'
			},
			{
				key: 'statistics_performance',
				title: 'Statistics Cookies',
				description: `Statistic cookies help website owners to understand how visitors interact with websites by collecting and reporting information anonymously.`,
				alwaysOn: false,
				defaultState: 'denied'
			},
			{
				key: 'marketing_advertising',
				title: 'Marketing Cookies',
				description: `Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the
			 individual user and thereby more valuable for publishers and third party advertisers.`,
				alwaysOn: false,
				defaultState: 'denied'
			}
		],
	};

	constructor(options = {}, cookies = [], logger = {}) {
		this.config = {
			...Consentio._defaultConfig,
			...options
		};
		this.cookies = [
			...cookies
		];

		this.logger = new consentio_logger(logger, this.config.debug);
		this.state = null
		this.el = null;
		this.defineCustomElements();
		this.init();
	}

	init() {
		this.state = new consentio_state(
			this.config.cookieName,
			this.config.version,
			this.config.consents
		);
		this.el = document.createElement("consentio-app");
		this.el.config = this.config;
		this.el.state = this.state;
		this.el.cookies = this.cookies;
		this.el.logger = this.logger;
		document.body.appendChild(this.el);
	}


	defineCustomElements() {
		customElements.define('consentio-app', consentio_app);
		customElements.define('consentio-bar', js_consentio_bar);
		customElements.define('consentio-required', consentio_required);
		customElements.define('consentio-floating-button', js_consentio_floating_button);
		customElements.define('consentio-consent-item', consentio_consent_item);
		customElements.define('consentio-modal', js_consentio_modal);
	}

}


/* harmony default export */ const consentio = (Consentio);


__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});