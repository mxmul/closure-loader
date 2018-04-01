const MemoryFS = require('memory-fs');
const execa = require('execa');
const compile = require('./compile');

module.exports = async function execBundle(fixture, config) {
    const fs = new MemoryFS();
    const stats = (await compile(fixture, config, fs)).toJson();
    expect(stats.errors).toHaveLength(0);
    const bundle = fs.readFileSync('/dist/main.bundle.js', 'utf-8');
    return execa('node', { input: bundle });
};
