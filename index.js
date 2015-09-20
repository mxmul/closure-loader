var loaderUtils = require("loader-utils"),
    _ = require('lodash'),
    mapBuilder = require('./dependencyMapBuilder'),
    defaultConfig = config = {
        paths: [],
        es6mode: false
    };


module.exports = function (source) {
    var query = loaderUtils.parseQuery(this.query),
        localVars = [],
        provideMap,
        config;

    this.cacheable && this.cacheable();

    config = buildConfig(query, this.options[query.config || "closureLoader"]);

    provideMap = mapBuilder(config.paths);

    source = workProvides(source, localVars, config.es6mode);
    source = workRequires(source, localVars, provideMap);
    source = createLocalVariables(source, localVars);

    return source;
};

function workProvides(source, localVars, es6mode) {
    var provideRegExp = /goog\.provide\((['"])(([^.)]+)[^)]*)\1\)/g,
        matchCount = 0,
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
        matchCount++;
    }

    if (es6mode && matchCount === 1 && firstMatch) {
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
        source = prependLine(source, "var " + variable + " = {};")
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