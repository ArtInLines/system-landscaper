const path = require('path');

module.exports = {
	entry: { index: './built/ui.js' },
	mode: 'development', // TODO: Set this to production eventually
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [['@babel/preset-env', { targets: 'defaults' }]],
					},
				},
			},
		],
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
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
