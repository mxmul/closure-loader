var HtmlWebpackPlugin = require('html-webpack-plugin'),
    webpack = require('webpack'),
    pathUtil = require('path');

module.exports = {
    entry: {
        app: './src/app.js',
    },
    output: {
        path: './build',
        filename: '[name].js',
    },
    resolve: {
        modulesDirectories: ['node_modules'],
        root: [
            __dirname,
        ],
        alias: {
            'npm': __dirname + '/node_modules',
        }
    },
    resolveLoader: {
        root: pathUtil.join(__dirname, 'node_modules'),
    },
    module: {
        loaders: [
            {
                test: /google-closure-library\/closure\/goog\/base/,
                loaders: [
                    'exports?goog',
                ],
            },
            // Loader for closure library
            {
                test: /google-closure-library\/closure\/goog\/.*\.js/,
                loaders: [
                    'closure',
                ],
            },
            // Loader for project js files
            {
                test: /\/src\/.*\.js/,
                loaders: [
                    'closure',
                ],
                exclude: [/node_modules/, /test/],
            },
        ],
    },
    plugins: [
        // This will copy the index.html to the build directory and insert script tags
        new HtmlWebpackPlugin({
            template: 'src/index.html',
        }),
        new webpack.ProvidePlugin({
            goog: 'google-closure-library/closure/goog/base',
        }),
    ],
    closureLoader: {
        paths: [
            __dirname + '/node_modules/google-closure-library/closure/goog',
        ],
        es6mode: false,
    },
    devServer: {
        contentBase: './build',
        noInfo: true,
        inline: true,
        historyApiFallback: true,
    },
    devtool: 'source-map',
};
