const MemoryFS = require('memory-fs');
const path = require('path');
const compile = require('./helpers/compile');

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
                                path.join(__dirname, 'fixtures', 'es6-fileext', 'legacy-code'),
                            ],
                            es6mode: true,
                            fileExt: '.{js,es6}',
                            watch: false,
                        }
                    },
                ]

            },
        ],
    },
};

test('detects modules in files matching fileExt', async () => {
    const fs = new MemoryFS();
    const stats = (await compile('es6-fileext', config, fs)).toJson();
    expect(stats.errors).toHaveLength(0);

    const bundle = fs.readFileSync('/dist/main.bundle.js', 'utf-8');
    const spy = jest.spyOn(console, 'log');

    eval(bundle);

    expect(spy).toMatchSnapshot();

    spy.mockReset();
    spy.mockRestore();
});
