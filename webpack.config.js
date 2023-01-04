const { resolve } = require('path');

module.exports = {
	entry: { index: './src/ui.ts' },
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: 'ts-loader',
				},
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	output: {
		path: resolve(__dirname, 'dist'),
		filename: 'main.js',
		environment: {
			arrowFunction: false,
			const: false,
			destructuring: false,
			forOf: false,
			module: false,
			optionalChaining: false,
			dynamicImport: false,
		},
	},
};
