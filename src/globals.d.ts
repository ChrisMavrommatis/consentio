// webpack hands .scss to `asset/source` and .html to html-loader; both arrive as strings.
declare module '*.scss' {
	const content: string;
	export default content;
}

declare module '*.html' {
	const content: string;
	export default content;
}

interface Window {
	dataLayer?: unknown[];
	Consentio?: new (options?: object, cookies?: unknown[], logger?: Console) => unknown;
	ConsentioInstance?: unknown;
}
