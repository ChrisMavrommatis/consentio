const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
				use: [
					'to-string-loader',
					'css-loader',
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
		new HtmlWebpackPlugin(),
		new MiniCssExtractPlugin({
			filename: 'styles.css',
		}),
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
