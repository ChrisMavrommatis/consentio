const path = require('path');

const loader = {
	entry: './src/js/consentio-loader.js',
	mode: 'production',
	output: {
		filename: 'consentio-loader.js',
		path: path.resolve(__dirname, 'docs/js'),
		clean: true,
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

module.exports = [loader, minifiedLoader];
