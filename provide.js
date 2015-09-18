module.exports = function (provide, global) {
    var parts = provide.split('.'),
        firstPart,
        layer = global,
        part;

    while (parts.length) {
        part = parts.shift();
        if (!firstPart) {
            firstPart = part;
        }
        layer[part] = layer[part] || {};
        layer = layer[part];
    }

    return global[firstPart];
};