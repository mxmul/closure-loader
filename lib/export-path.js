/**
 * Ensure that a dotted path is defined on a namespace object. Will create
 * intermediate namespaces that are not defined as empty objects, and will
 * optionally set a value at the end of the path.
 *
 * @param {Object} namespace
 * @param {string} name
 * @param {*=} value
 */
module.exports = function exportPath(namespace, name, value) {
    const parts = name.split('.');
    let target = namespace;

    for (let i = 0; i < parts.length; i += 1) {
        const part = parts[i];
        if (i === parts.length - 1 && value !== undefined) {
            target[part] = value;
        } else if (target[part]) {
            target = target[part];
        } else {
            target[part] = {};
            target = target[part];
        }
    }
};
