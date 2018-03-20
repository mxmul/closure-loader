const MemoryFS = require('memory-fs');
const path = require('path');
const compile = require('./helpers/compile');

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
    const fs = new MemoryFS();
    const stats = (await compile('es6', config, fs)).toJson();
    expect(stats.errors).toHaveLength(0);

    const bundle = fs.readFileSync('/dist/main.bundle.js', 'utf-8');
    const spy = jest.spyOn(console, 'log');

    // eslint-disable-next-line no-eval
    eval(bundle);

    expect(spy).toMatchSnapshot();

    spy.mockReset();
    spy.mockRestore();
});
