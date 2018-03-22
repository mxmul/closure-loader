const exportPath = require('../lib/export-path');

describe('export-path', () => {
    it('creates namespaces', () => {
        const namespace = {};
        exportPath(namespace, 'foo.bar.baz');
        expect(namespace.foo.bar.baz).toEqual({});
    });

    it('optionally assigns value', () => {
        const namespace = {};
        exportPath(namespace, 'x.y.z', 42);
        expect(namespace.x.y.z).toBe(42);
    });
});
