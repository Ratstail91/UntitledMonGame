const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = env => {
	return {
		entry: `./client/index${env === 'production' ? '' : '_dev'}.jsx`,
		output: {
			path: __dirname + '/public/',
			filename: 'app.bundle.js',
			sourceMapFilename: 'app.bundle.js.map',
			publicPath: '/'
		},
		devServer: {
			contentBase: path.join(__dirname, 'public'),
			compress: false,
			port: 3001,
			proxy: {
				'/api/': 'http://localhost:3000/',
				'/news/': 'http://localhost:3000/'
			},
			overlay: {
				errors: true
			},
			host: '0.0.0.0',
			historyApiFallback: true
		},
		devtool: 'source-map',
		module: {
			rules: [{
					test: /(\.js$|\.jsx$)/,
					exclude: /(node_modules)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env', '@babel/preset-react'],
							plugins: env === 'production' ? ['react-loadable/babel', '@babel/plugin-syntax-dynamic-import'] : ['react-hot-loader/babel','react-loadable/babel', '@babel/plugin-syntax-dynamic-import']
						}
					}
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader'],
				}
			]
		},
		optimization: {
			minimize: env === 'production',
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						output: {
							comments: false,
						},
					},
				})
			]
		}
	};
};