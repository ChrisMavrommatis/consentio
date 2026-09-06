// package.json's version, substituted at build time by webpack's DefinePlugin. The test
// harness has no bundler, so test/resolve.mjs sets it from the same file.
declare const __CONSENTIO_VERSION__: string;

// webpack hands .scss to `asset/source` and .html to html-loader; both arrive as strings.
declare module '*.scss' {
	const content: string;
	export default content;
}

declare module '*.html' {
	const content: string;
	export default content;
}

// webpack parses .yaml with a json-type rule, so a language pack arrives as an object.
declare module '*.yaml' {
	const pack: {
		locale: string;
		name: string;
		texts: import('./types.js').ConsentioTexts;
		consents: Record<string, { title: string; description: string }>;
	};
	export default pack;
}

interface Window {
	dataLayer?: unknown[];
	ConsentioDefault?: import('./types.js').ConsentioDefaultState;
	Consentio?: new (options?: object, cookies?: unknown[], logger?: Console) => unknown;
	ConsentioInstance?: unknown;
}
