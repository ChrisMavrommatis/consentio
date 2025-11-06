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
		for (let i = 1; i < arguments.length; i++) {
			const source = arguments[i];
			for (const key in source) {
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

	static get(key) {
		if (typeof document === 'undefined' || (arguments.length && !key)) {
			return;
		}

		const cookies = document.cookie ? document.cookie.split('; ') : [];
		let jar = {};
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

	static remove(name) {
		this.set(name, '', { expires: -1 });
	}

}

export default Cookies;
