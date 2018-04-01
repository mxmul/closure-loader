const path = require('path');
const webpack = require('webpack');
const execBundle = require('./helpers/execBundle');

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
                test: /.*\.js/,
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

test('loads closure library modules with goog.require()', async () => {
    const result = await execBundle('legacy-closure-lib', config);
    expect(result.code).toBe(0);
    expect(result.stdout).toMatchSnapshot();
});
