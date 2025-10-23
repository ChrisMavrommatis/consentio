const path = require('path');
const { library } = require('webpack');

const consentio = {
	entry: './src/js/consentio.js',
	mode: 'production',
	output: {
		filename: 'consentio.js',
		path: path.resolve(__dirname, 'docs/js'),
		clean: true,
		library: {
			name: 'Consentio',
			type: 'umd',
			export: 'default'
		},
		globalObject: 'this'
	},
	module: {
		rules: [
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
		path: path.resolve(__dirname, 'docs/js'),
		clean: false,
		library: {
			name: 'Consentio',
			type: 'umd',
			export: 'default'
		},
		globalObject: 'this'
	},
	optimization: {
		minimize: true
	}
}


const loader = {
	entry: './src/js/consentio-loader.js',
	mode: 'production',
	output: {
		filename: 'consentio-loader.js',
		path: path.resolve(__dirname, 'docs/js'),
		clean: false,
	},
	module: {
		rules: []
	},
	plugins: [
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
		path: path.resolve(__dirname, 'docs/js'),
		clean: false
	},
	optimization: {
		minimize: true
	}
}



module.exports = [
	consentio,
	minifiedConsentio,
	loader,
	minifiedLoader
];
