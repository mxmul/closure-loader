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
                                    'es6',
                                    'legacy-code',
                                ),
                            ],
                            es6mode: true,
                            watch: false,
                        },
                    },
                ],
            },
        ],
    },
};

test('loads goog modules with es6 import', async () => {
    const result = await execBundle('es6', config);
    expect(result.code).toBe(0);
    expect(result.stdout).toMatchSnapshot();
});
