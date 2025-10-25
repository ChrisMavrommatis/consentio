const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const { type } = require('os');

const consentio = {
	entry: './src/js/consentio.js',
	mode: 'production',
	output: {
		filename: 'consentio.js',
		path: path.resolve(__dirname, 'dist'),
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
		path: path.resolve(__dirname, 'dist'),
		clean: false,
		library: {
			name: 'Consentio',
			type: 'umd',
			export: 'default'
		},
		globalObject: 'this'
	},
	plugins: [
	],
	optimization: {
		minimize: true
	}
}


const loader = {
	entry: './src/js/consentio-loader.js',
	mode: 'production',
	output: {
		filename: 'consentio-loader.js',
		path: path.resolve(__dirname, 'dist'),
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
		path: path.resolve(__dirname, 'dist'),
		clean: false
	},
	plugins: [

	],
	optimization: {
		minimize: true
	}
}

const copyDistToDocs = {
	entry: {
		'consentio-loader': './dist/consentio-loader.js',
		'consentio-loader.min': './dist/consentio-loader.min.js',
		'consentio': './dist/consentio.js',
		'consentio.min': './dist/consentio.min.js',
	},
	output: {
		path: path.resolve(__dirname, 'docs/js'),
		filename: '[name].js',
		clean: true
	},
	mode: 'production',
	optimization: {
		minimize: false
	}
}

module.exports = [
	consentio,
	minifiedConsentio,
	loader,
	minifiedLoader,
	copyDistToDocs
];
module.exports.parallelism = 1;
