const TerserPlugin = require('terser-webpack-plugin');

module.exports = env => {
	return {
		entry: `./client/index${env === 'production' ? '' : '_dev'}.jsx`,
		output: {
			path: __dirname + '/public/',
			filename: 'app.bundle.js',
			sourceMapFilename: 'app.bundle.js.map'
		},
		devtool: 'source-map',
		module: {
			rules: [
				{
					test: /(\.js$|\.jsx$)/,
					exclude: /(node_modules)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env', '@babel/preset-react'],
							plugins: ['react-loadable/babel', '@babel/plugin-syntax-dynamic-import']
						}
					}
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