var path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = [
	{
		entry: {
			'background': './background.js',
			'inject': './inject.js',
			'options': './options.js'
		},
		output: {
			path: path.join(__dirname, '/TwitterImageDownloader'),
			filename: '[name].js'
		},
		devtool: 'inline-source-map',
		module: {
			rules: [
				{
					enforce: 'pre',
					test: /\.js$/,
					exclude: /node_modules/,
					loader: 'eslint-loader',
					options: {
						formatter: require('eslint-friendly-formatter')
					}
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					loader: 'babel-loader'
				}
			]
		}
	},
	{
		entry: {
			'base': './base.scss'
		},
		output: {
			path: path.join(__dirname, 'TwitterImageDownloader'),
			filename: '[name].css'
		},
		module: {
			rules: [
				{
					test: /\.scss/,
					use: ExtractTextPlugin.extract({
						use:
						[
							{
								loader: 'css-loader',
								options: {
									url: false,
									importLoaders: 2
								}
							},
							{
								loader: 'sass-loader'
							}
						]
					})
				}
			]
		},
		plugins: [
			new ExtractTextPlugin('[name].css')
		]
	}
]
