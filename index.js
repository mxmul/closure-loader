var loaderUtils = require("loader-utils"),
    _ = require('lodash'),
    mapBuilder = require('./dependencyMapBuilder'),
    defaultConfig = config = {
        paths: [],
        es6mode: false
    };


module.exports = function (source, inputSourceMap) {
    var self = this,
        query = loaderUtils.parseQuery(this.query),
        callback = this.async(),
        localVars = [],
        provideMap,
        config;

    this.cacheable && this.cacheable();

    config = buildConfig(query, this.options[query.config || "closureLoader"]);

    mapBuilder(config.paths).then(function(provideMap) {
        source = workProvides(source, localVars, config.es6mode);
        source = workRequires(source, localVars, provideMap);
        source = createLocalVariables(source, localVars);

        callback(null, source, inputSourceMap);
    });
};

function workProvides(source, localVars, es6mode) {
    var provideRegExp = /goog\.provide\((['"])(([^.)]+)[^)]*)\1\)/g,
        firstMatch,
        matches;

    while (matches = provideRegExp.exec(source)) {
        if (!firstMatch) {
            source = prependLine(source, "var googProvide = require('closure-loader/provide.js');");
            firstMatch = matches[2];
        }

        if (localVars.indexOf(matches[3]) < 0) {
            localVars.push(matches[3]);
        }
        source = source.replace(matches[0], createProvide(matches[2], matches[3]));
    }

    if (es6mode && firstMatch) {
        source = appendLine(source, 'module.exports.default = ' + firstMatch + ';');
        source = appendLine(source, 'module.exports.__esModule = true;');
    }

    return source;
}

function workRequires(source, localVars, provideMap) {
    var requireRegExp = /goog\.require\((['"])(([^.)]+)[^)]*)\1\)/g,
        isFirst = true,
        matches;

    while (matches = requireRegExp.exec(source)) {
        if (isFirst) {
            source = prependLine(source, "var googRequire = require('closure-loader/require.js');");
            isFirst = false;
        }
        if (localVars.indexOf(matches[3]) < 0) {
            localVars.push(matches[3]);
        }
        source = source.replace(matches[0], createRequire(matches[2], matches[3], provideMap));
    }

    return source;
}

function createLocalVariables(source, localVars) {
    localVars.forEach(function (variable) {
        source = prependLine(
            source,
            "if(typeof " + variable + " === 'undefined') eval('var " + variable + " = {};'); " +
            "module.exports." + variable + " = " + variable + ";"
        )
    });
    return source;
}

function buildConfig(query, options) {
    return _.merge(_.clone(defaultConfig), options, query);
}

function prependLine(source, line) {
    return line + '\n' + source;
}

function appendLine(source, line) {
    return source + '\n' + line;
}

function createProvide(key, localVar) {
    return localVar + " = googProvide('" + key + "', module.exports)";
}

function createRequire(key, localVar, provideMap) {
    if (!provideMap[key]) {
        throw new Error("Can't find closure dependency " + key);
    }

    return "googRequire('" + key + "', " + localVar + "); " + key + " = require('" + provideMap[key] + "')." + key;
}