/*! based on js-cookie v3.0.1 */

import type { CookieAttributes, CookieConverter } from '../types.js';

class Cookies {

	static defaultAttributes: CookieAttributes = {
		path: '/',
		expires: 90,
		sameSite: 'Lax',
		secure: true
	};

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

	// The overload declares the variadic call; the implementation reads `arguments`
	// so it stays parameterless and the emitted body is unchanged.
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
		attributes = this.assign({}, Cookies.defaultAttributes, attributes);

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

	static remove(name: string): void {
		this.set(name, '', { expires: -1 });
	}

}

export default Cookies;
