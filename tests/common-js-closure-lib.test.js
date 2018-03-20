const MemoryFS = require('memory-fs');
const path = require('path');
const webpack = require('webpack');
const compile = require('./helpers/compile');

// these tests are slower, because they map all the deps in google-closure-library
jest.setTimeout(40000);

const config = {
    module: {
        rules: [
            {
                test: /google-closure-library\/closure\/goog\/base/,
                use: [
                    'imports-loader?this=>{goog:{}}&goog=>this.goog',
                    'exports-loader?goog',
                ],
            },
            {
                test: /google-closure-library\/closure\/goog\/.*\.js/,
                exclude: [/google-closure-library\/closure\/goog\/base\.js$/],
                use: [
                    {
                        loader: require.resolve('..'),
                        options: {
                            paths: [
                                path.join(
                                    __dirname,
                                    '..',
                                    'node_modules/google-closure-library/closure/goog',
                                ),
                            ],
                            es6mode: false,
                            watch: false,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            goog: 'google-closure-library/closure/goog/base',
        }),
    ],
};

test('loads closure library modules with require()', async () => {
    const fs = new MemoryFS();
    const stats = (await compile('common-js-closure-lib', config, fs)).toJson();
    expect(stats.errors).toHaveLength(0);

    const bundle = fs.readFileSync('/dist/main.bundle.js', 'utf-8');
    const spy = jest.spyOn(console, 'log');

    // eslint-disable-next-line no-eval
    eval(bundle);

    expect(spy).toMatchSnapshot();

    spy.mockReset();
    spy.mockRestore();
});
