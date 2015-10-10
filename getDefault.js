module.exports = function (exports) {
    var args = Array.prototype.slice.call(arguments, 1),
        defaults;

    for (var i = 0; i < args.length; i++) {
        try {
            defaults = eval('exports.' + args[i]);
            if (defaults) {
                return defaults;
            }
        } catch(e) {}
    }
};