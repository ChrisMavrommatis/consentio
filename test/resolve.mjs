// Test-time stand-in for the webpack loaders, so node:test can import the real
// sources instead of a build artifact:
//   - a `./x.js` specifier resolves to `x.ts` (and `.mjs`/`.cjs` likewise), which
//     webpack does for the bundle via resolve.extensionAlias
//   - `.html` becomes its own text, which is what html-loader hands the bundle
//   - `.scss` becomes an empty string; the bundle gets compiled CSS there, and no test
//     asserts on styling
import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ASSET = /\.(scss|html)$/;

registerHooks({
	resolve(specifier, context, nextResolve) {
		if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('file:')) {
			const url = new URL(specifier, context.parentURL);
			if (ASSET.test(url.pathname)) {
				return { url: url.href, format: 'module', shortCircuit: true };
			}
			for (const [from, to] of [['.js', '.ts'], ['.mjs', '.mts'], ['.cjs', '.cts']]) {
				if (!url.pathname.endsWith(from)) continue;
				const ts = new URL(url.href.slice(0, -from.length) + to);
				if (existsSync(fileURLToPath(ts))) {
					return { url: ts.href, format: 'module-typescript', shortCircuit: true };
				}
			}
		}
		return nextResolve(specifier, context);
	},

	load(url, context, nextLoad) {
		if (ASSET.test(new URL(url).pathname)) {
			const text = url.endsWith('.scss') ? '' : readFileSync(fileURLToPath(url), 'utf8');
			return { format: 'module', source: `export default ${JSON.stringify(text)};`, shortCircuit: true };
		}
		return nextLoad(url, context);
	}
});
