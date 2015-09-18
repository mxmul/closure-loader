module.exports = function (provide, local) {
    var parts = provide.split('.'),
        layer = local,
        part;

    parts.shift();

    while (parts.length) {
        part = parts.shift();
        layer[part] = layer[part] || {};
        layer = layer[part];
    }
};