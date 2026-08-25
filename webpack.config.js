const path = require('path');
const webpack = require('webpack');

// Where each target writes. `lib` is the default so an ordinary local build cannot reach
// dist/ - only the release workflow writes it, and CI fails a push that disagrees.
const DESTINATIONS = {
	lib: 'build/lib',
	website: 'website/js',
	dist: 'dist'
};

module.exports = (env, argv) => {

	this.parallelism = 1;

	const target = env.build ?? 'lib';
	const dest = DESTINATIONS[target];
	if (!dest) {
		throw new Error(`Unknown build target '${target}'. Use one of: ${Object.keys(DESTINATIONS).join(', ')}.`);
	}
	console.log(`Environment Build: ${target} -> ${dest}`);

	// The one place the version enters the bundle. src/ carries no literal; the test
	// harness does the same substitution in test/resolve.mjs.
	const version = require('./package.json').version;
	const define = () => new webpack.DefinePlugin({
		__CONSENTIO_VERSION__: JSON.stringify(version)
	});

	const consentio = {
		entry: './src/consentio.ts',
		mode: 'production',
		output: {
			filename: 'consentio.js',
			path: path.resolve(__dirname, dest),
			clean: false,
			library: {
				name: 'Consentio',
				type: 'umd',
				export: 'default'
			},
			globalObject: 'this'
		},
		resolve: {
			extensions: ['.ts', '.js'],
			extensionAlias: {
				'.js': ['.ts', '.js'],
			},
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: 'ts-loader',
					exclude: /node_modules/,
				},
				{
					test: /\.scss$/i,
					type: 'asset/source',
					use: [
						'postcss-loader',
						'sass-loader'
					],
				},
				{
					test: /\.html$/,
					use: 'html-loader',
				}
			],
		},
		plugins: [
			define()
		],
		optimization: {
			minimize: false
		}
	}

	const minifiedConsentio = {
		...consentio,
		mode: 'production',
		output: {
			filename: 'consentio.min.js',
			path: path.resolve(__dirname, dest),
			clean: false,
			library: {
				name: 'Consentio',
				type: 'umd',
				export: 'default'
			},
			globalObject: 'this'
		},
		plugins: [
			define()
		],
		optimization: {
			minimize: true
		}
	}


	const loader = {
		entry: './src/consentio-loader.ts',
		mode: 'production',
		output: {
			filename: 'consentio-loader.js',
			path: path.resolve(__dirname, dest),
			clean: false,
		},
		resolve: {
			extensions: ['.ts', '.js'],
			extensionAlias: {
				'.js': ['.ts', '.js'],
			},
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: 'ts-loader',
					exclude: /node_modules/,
				},
			]
		},
		plugins: [
			define()
		],
		optimization: {
			minimize: false
		}
	}
	const minifiedLoader = {
		...loader,
		mode: 'production',
		output: {
			filename: 'consentio-loader.min.js',
			path: path.resolve(__dirname, dest),
			clean: false
		},
		plugins: [
			define()
		],
		optimization: {
			minimize: true
		}
	}

	return [
		consentio,
		minifiedConsentio,
		loader,
		minifiedLoader,
	];

};
