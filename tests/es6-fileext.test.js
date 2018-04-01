const path = require('path');
const execBundle = require('./helpers/execBundle');

const config = {
    module: {
        rules: [
            {
                test: /legacy-code\/.*\.(js|es6)$/,
                use: [
                    {
                        loader: require.resolve('..'),
                        options: {
                            paths: [
                                path.join(
                                    __dirname,
                                    'fixtures',
                                    'es6-fileext',
                                    'legacy-code',
                                ),
                            ],
                            es6mode: true,
                            fileExt: '.{js,es6}',
                            watch: false,
                        },
                    },
                ],
            },
        ],
    },
};

test('detects modules in files matching fileExt', async () => {
    const result = await execBundle('es6-fileext', config);
    expect(result.code).toBe(0);
    expect(result.stdout).toMatchSnapshot();
});
