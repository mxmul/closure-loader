var HtmlWebpackPlugin = require('html-webpack-plugin');
var pathUtil = require('path');

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
            // Loader for legacy google closure code
            {
                test: /src\/legacyCode\/.*\.js/,
                loader: pathUtil.resolve(__dirname, '../..'),
                options: {
                    paths: [
                        pathUtil.resolve(__dirname, 'src/legacyCode'),
                    ],
                    es6mode: true,
                },
                exclude: [/test/, /node_modules/],
            },
            // Loader for project js files
            {
                test: /\/src\/.*\.js/,
                loader: 'babel-loader',
                options: {
                    presets: ['es2015'],
                },
                exclude: [/node_modules/, /test/, /legacyCode/],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin(),
    ],
    devServer: {
        contentBase: './build',
        noInfo: true,
        inline: true,
        historyApiFallback: true,
    },
    devtool: 'source-map',
};
