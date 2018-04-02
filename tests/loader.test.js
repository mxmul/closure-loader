const loader = require('..');

function getLoaderOutput(originalSource) {
    return new Promise((resolve, reject) => {
        const context = {
            async: () => (err, content) => {
                if (err) {
                    reject(err);
                }
                resolve(content);
            },
            query: {},
            options: {},
        };
        loader.apply(context, [originalSource]);
    });
}

test('noop when there are no goog.provide or goog.require statements', async () => {
    const originalSource = 'console.log("hi");';
    const output = await getLoaderOutput(originalSource);
    expect(output).toEqual(originalSource);
});
