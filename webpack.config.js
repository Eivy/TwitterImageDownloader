var path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = [
	{
		entry: {
			'background': './background.js'
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
			style: './base.scss'
		},
		output: {
			path: __dirname,
			filename: 'base.css'
		},
		module: {
			rules: [{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: 'css-loader!sass-loader'
				})
			}]
		},
		plugins: [
			new ExtractTextPlugin('[name].css')
		]
	}
]
