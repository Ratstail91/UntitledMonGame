const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

// Remove unused bootstrap css 90% reduction in size
const purgecss = require('@fullhuman/postcss-purgecss')({
	content: [
		'./client/**/*.html',
		'./client/**/*.jsx',
	],
	defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
	// Choose what to keep
	whitelist: ['btn', 'h1','h2','h3', 'p','ol','li', 'ul', 'em'], // Ignore buttons and typography
	whitelistPatterns: [/btn-/]
})


module.exports = env => {
	return {
		mode: 'production',
		entry: `./client/index${env === 'production' ? '' : '_dev'}.jsx`,
		output: {
			path: __dirname + '/dist/',
			filename: 'main.[contentHash].js',
			publicPath: '/'
		},
		module: {
			rules: [{
					test: /\.(js|jsx)$/,
					exclude: /(node_modules)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env', '@babel/preset-react'],
							plugins: ['react-loadable/babel', '@babel/plugin-syntax-dynamic-import']
						}
					}
				},
				{
					test: /\.(css)$/,
					use: [
						MiniCssExtractPlugin.loader,
						"css-loader",
						{
							loader: 'postcss-loader',
							options: {
								// parser: 'sugarss',
								plugins: (loader) => [
									require('postcss-import')({ root: loader.resourcePath }),
									require('postcss-preset-env')(),
									require('cssnano')(),
									purgecss
								  ]
							}
						}
					]
				},
				{
					test: /\.(svg|png|gif|jpg|jpeg)$/,
					use: [{
							loader: 'file-loader',
							options: {
								outputPath: 'images',
								publicPath: '/images',
								name: '[name].[hash].[ext]'
							}
						},
						{
							loader: 'image-webpack-loader',
							options: {
								mozjpeg: {
									progressive: true,
									quality: 70
								},
								// optipng.enabled: false will disable optipng
								optipng: {
									enabled: false,
								},
								pngquant: {
									quality: [0.70, 0.90],
									speed: 4
								},
								gifsicle: {
									interlaced: false,
								},
								// the webp option will enable WEBP
								webp: {
									quality: 75
								}
							}
						},
					]
				},
				{
					test: /\.(md)$/,
					use: [{
						loader: 'url-loader',
						options: {
							limit: 9000,
							outputPath: 'content',
							publicPath: '/content',
							name: '[name].[hash].[ext]'
						},
					}, ],
				},
			],

		},
		optimization: {
			minimize: true,
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						output: {
							comments: false,
						},
					},
				}),
				new HtmlWebpackPlugin({
					template: "./client/template.html",
					minify: {
						collapseWhitespace: true,
						removeComments: true,
						removeAttributeQuotes: true
					}
				}),
			]
		},
		plugins: [
			new CleanWebpackPlugin(),
			new MiniCssExtractPlugin({
				filename: "[name].[contentHash].css"
			}),
			new CompressionWebpackPlugin({
				compressionOptions: {
					level: 9,
				},
				threshold: 1
			}),
			new CopyPlugin([
				{
					from: './public',
					to: ''
				},
			]),
		]
	};
};