const path = require('path');
const webpack = require('webpack');
const { parse } = require('yaml');

// `build` is the default, so nothing local reaches dist/ or the published site by accident.
const DESTINATIONS = {
	build: 'build',
	website: 'website/js',
	dist: 'dist'
};

module.exports = (env, argv) => {

	this.parallelism = 1;

	const target = env.build ?? 'build';
	const dest = DESTINATIONS[target];
	if (!dest) {
		throw new Error(`Unknown build target '${target}'. Use one of: ${Object.keys(DESTINATIONS).join(', ')}.`);
	}
	console.log(`Environment Build: ${target} -> ${dest}`);

	// The one place the version enters the bundle; src/ carries no literal.
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
				},
				{
					// `type: 'json'` is webpack's own, so this needs no loader package.
					test: /\.ya?ml$/,
					type: 'json',
					parser: { parse }
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
