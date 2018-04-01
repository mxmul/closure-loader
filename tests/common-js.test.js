const path = require('path');
const execBundle = require('./helpers/execBundle');

const config = {
    module: {
        rules: [
            {
                test: /legacy-code\/.*\.js$/,
                use: [
                    {
                        loader: require.resolve('..'),
                        options: {
                            paths: [
                                path.join(
                                    __dirname,
                                    'fixtures',
                                    'common-js',
                                    'legacy-code',
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
};

test('loads goog modules with require()', async () => {
    const result = await execBundle('common-js', config);
    expect(result.code).toBe(0);
    expect(result.stdout).toMatchSnapshot();
});
