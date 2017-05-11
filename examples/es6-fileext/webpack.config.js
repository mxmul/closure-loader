var HtmlWebpackPlugin = require('html-webpack-plugin'),
    pathUtil = require('path');

module.exports = {
    entry: {
        app: './src/app.js'
    },
    output: {
        path: './build',
        filename: '[name].js',
        publicPath: '',
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
            // Loader for legacy google closure code
            {
                test: /src\/legacyCode\/.*\.(js|es6)/,
                loaders: [
                    require.resolve('../..'),
                ],
                exclude: [/test/, /node_modules/],
            },
            // Loader for project js files
            {
                test: /\/src\/.*\.js/,
                loaders: [
                    'babel?stage=0',
                ],
                exclude: [/node_modules/, /test/, /legacyCode/],
            },
        ],
    },
    plugins: [
        // This will copy the index.html to the build directory and insert script tags
        new HtmlWebpackPlugin({
            template: 'src/index.html',
        }),
    ],
    closureLoader: {
        paths: [
            __dirname + '/src/legacyCode',
        ],
        es6mode: true,
        fileExt: '.{js,es6}'
    },
    devServer: {
        contentBase: './build',
        noInfo: true,
        inline: true,
        historyApiFallback: true,
    },
    devtool: 'source-map',
};
