/*!
 * The cookie reader below is js-cookie v3.0.1, ported to TypeScript, cut down to what
 * Consentio uses and changed where a consent cookie needs different defaults.
 * https://github.com/js-cookie/js-cookie
 *
 * MIT License
 *
 * Copyright (c) 2018 Copyright 2018 Klaus Hartl, Fagner Brack, GitHub Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { CookieAttributes, CookieConverter } from '../types.js';

class Cookies {

	// No expiry: how long an answer lasts is a setting, and consent-store.ts owns the number.
	static defaultAttributes: CookieAttributes = {
		path: '/',
		sameSite: 'Lax'
	};

	// Read at set() time: at module load there is no page yet.
	static isSecureOrigin(): boolean {
		return typeof location !== 'undefined' && location.protocol === 'https:';
	}

	static converter: CookieConverter = {
		read: function (value: string): string {
			if (value[0] === '"') {
				value = value.slice(1, -1);
			}
			return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
		},
		write: function (value: string): string {
			return encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
		}
	};

	// Parameterless on purpose: the implementation reads `arguments`.
	static assign(target: CookieAttributes, ...sources: (CookieAttributes | undefined)[]): CookieAttributes;
	static assign(target: CookieAttributes): CookieAttributes {
		for (let i = 1; i < arguments.length; i++) {
			const source = arguments[i];
			for (const key in source) {
				target[key] = source[key];
			}
		}
		return target;
	}

	static set(key: string, value: string, attributes?: CookieAttributes): string {
		// Secure over https only. The browser drops a secure cookie on http, silently. Issue 12.
		attributes = this.assign({}, Cookies.defaultAttributes, { secure: Cookies.isSecureOrigin() }, attributes);

		if (typeof attributes.expires === 'number') {
			attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
		}
		if (attributes.expires) {
			attributes.expires = (attributes.expires as Date).toUTCString();
		}

		key = encodeURIComponent(key)
			.replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
			.replace(/[()]/g, escape);

		let stringifiedAttributes = '';
		for (const attributeName in attributes) {
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

	static get(key: string): string | undefined;
	static get(): Record<string, string>;
	static get(key?: string): string | Record<string, string> | undefined {
		if (typeof document === 'undefined' || (arguments.length && !key)) {
			return;
		}

		const cookies = document.cookie ? document.cookie.split('; ') : [];
		let jar: Record<string, string> = {};
		for (let i = 0; i < cookies.length; i++) {
			const parts = cookies[i].split('=');
			const value = parts.slice(1).join('=');

			try {
				const foundKey = decodeURIComponent(parts[0]);
				jar[foundKey] = Cookies.converter.read(value, foundKey);

				if (key === foundKey) {
					break;
				}
			} catch (e) { }
		}

		return key ? jar[key] : jar;
	}

	// A cookie is only removed by a call carrying the domain it was written with. Issue 39.
	static remove(name: string, attributes?: CookieAttributes): void {
		this.set(name, '', this.assign({}, attributes, { expires: -1 }));
	}

}

export default Cookies;
