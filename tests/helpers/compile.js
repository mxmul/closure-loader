const Promise = require('bluebird');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

module.exports = function compile(fixture, config, fs) {
    const fixtureDir = path.resolve(__dirname, '..', 'fixtures', fixture);
    const baseConfig = {
        context: fixtureDir,
        entry: './app.js',
        target: 'node',
        output: {
            path: '/dist',
            filename: '[name].bundle.js',
        },
    };

    const compiler = webpack(merge(baseConfig, config));
    compiler.outputFileSystem = fs;
    const runAsync = Promise.promisify(compiler.run.bind(compiler));
    return runAsync();
};
