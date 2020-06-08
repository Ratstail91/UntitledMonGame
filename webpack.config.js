const { DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const path = require('path');

module.exports = env => {
	const prod = env !== 'development' ? true : false;

	return {
		mode: env,
		entry: `./client/index${prod ? '' : '_dev'}.tsx`,
		output: {
			path: path.resolve(__dirname, 'public'),
			filename: '[name].[hash].js',
			sourceMapFilename: '[name].[hash].js.map',
			publicPath: '/'
		},
		devtool: 'source-map',
		resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.txt'],
        },
		module: {
			rules: [
				{
					test: /\.(ts|tsx)?$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'ts-loader',
							options: {
								configFile: "client/tsconfig.json"
							},
						}
					]
				},
				{
					test: /\.(js|jsx)$/,
					exclude: /(node_modules)/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env', '@babel/preset-react'],
								plugins: ['react-loadable/babel', '@babel/plugin-syntax-dynamic-import']
							}
						}
					]
				},
				{
					test: /\.(css)$/,
					use: [
						// If prod extract css, else include it into js bundle
						...(prod ? [MiniCssExtractPlugin.loader]: ['style-loader'] ),
						"css-loader",
						{
							loader: 'postcss-loader',
							options: {
								plugins: (loader) => [
									require('postcss-import')({ root: loader.resourcePath }),
									...(prod
                                        ? [
                                            // If not dev then build with these
                                            require('postcss-preset-env')(),
											require('cssnano')(),
                                        ]
                                        : []),
								]
							}
						}
					]
				},
				{
					test: /\.(md)$/,
					use: [
						{
							loader: 'url-loader',
							options: {
								limit: 9000,
								outputPath: 'content',
								publicPath: '/content',
								name: '[name].[hash].[ext]'
							},
						},
					],
				},
			],
		},
		optimization: {
			minimize: prod,
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						output: {
							comments: false,
						},
					},
				})
			]
		},
		plugins: [
			new DefinePlugin({
				NODE_ENV: env
			}),
			new CleanWebpackPlugin({
				cleanOnceBeforeBuildPatterns: ['*', '!content*']
			}),
			new HtmlWebpackPlugin({
				template: "./client/template.html",
				minify: {
					collapseWhitespace: prod,
					removeComments: prod,
					removeAttributeQuotes: prod
				}
			}),
			new BundleAnalyzerPlugin({
				analyzerMode: env === 'analyzer' ? 'server' : 'disabled'
			}),
			// Disable compression and css extraction on dev builds
			...(prod) ? [
				new MiniCssExtractPlugin({
					filename: "[name].[hash].css"
				}),
				new CompressionWebpackPlugin({
					compressionOptions: {
						level: 9,
					},
					threshold: 1 //size in bytes
				}),
            ] : []
			
		],
		devServer: {
			contentBase: path.resolve(__dirname, 'public'),
			compress: true,
			port: 3001,
			proxy: {
				'/api/': 'http://localhost:3000/'
			},
			overlay: {
				errors: true
			},
			stats: {
				colors: true,
				hash: false,
				version: false,
				timings: false,
				assets: false,
				chunks: false,
				modules: false,
				reasons: false,
				children: false,
				source: false,
				errors: true,
				errorDetails: false,
				warnings: true,
				publicPath: false
			},
			host: '0.0.0.0',
			disableHostCheck: true,
			clientLogLevel: 'silent',
			historyApiFallback: true,
			hot: true,
			injectHot: true
		},
		watchOptions: {
			ignored: /(node_modules)/
		}
	};
};
