var HtmlWebpackPlugin = require('html-webpack-plugin');
var pathUtil = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        app: './src/app.js'
    },
    output: {
        path: pathUtil.resolve(__dirname, 'build'),
        filename: '[name].js',
        publicPath: '',
    },
    resolveLoader: {
        modules: [pathUtil.resolve(__dirname, '..', '..'), pathUtil.resolve(__dirname, 'node_modules')],
    },
    module: {
        rules: [
            {
                test: /google-closure-library\/closure\/goog\/base/,
                loaders: [
                    'imports-loader?this=>{goog:{}}&goog=>this.goog',
                    'exports-loader?goog',
                ],
            },
            // Loader for closure library
            {
                test: /google-closure-library\/closure\/goog\/.*\.js/,
                loader: require.resolve('../../index'),
                options: {
                    es6mode: true,
                    paths: [
                        __dirname + '/node_modules/google-closure-library/closure/goog',
                    ],
                },
                exclude: [/google-closure-library\/closure\/goog\/base\.js$/],
            },
            // Loader for project js files
            {
                test: /\/src\/.*\.js/,
                loader: 'babel-loader',
                options: {
                    presets: ['es2015'],
                },
                exclude: [/node_modules/, /test/],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin(),
        new webpack.ProvidePlugin({
            goog: 'google-closure-library/closure/goog/base.js',
        }),
    ],
    devServer: {
        contentBase: './build',
        noInfo: true,
        inline: true,
        historyApiFallback: true,
    },
    devtool: 'source-map',
};
