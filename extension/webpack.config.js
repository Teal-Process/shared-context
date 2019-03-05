const ChromeExtensionReloader  = require('webpack-chrome-extension-reloader')
const { resolve } = require("path")

module.exports = {
	mode: "development",
	watch: true,
	entry: {
		"bundle": "./app/content_scripts.js",
		"background": "./app/background.js"
	},
	output: {
		publicPath: ".",
		path: resolve(__dirname, "dist/"),
		filename: "[name].js",
		libraryTarget: "umd"
	},
	plugins: [
		new ChromeExtensionReloader()
	],
	module: {
        rules: [
            {
			    type: 'javascript/auto',
			    test: /\.json$/,
			    use: [
			        {
			          loader: 'file-loader',
			          options: {
			              name: "./[name].[ext]"
			          }
			        }
			    ]
			},
		    {
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
		    }
        ]
    }
}