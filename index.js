var loaderUtils = require("loader-utils"),
    _ = require('lodash'),
    mapBuilder = require('./dependencyMapBuilder'),
    defaultConfig = config = {
        paths: [],
        es6mode: false
    };


module.exports = function (source, inputSourceMap) {
    var query = loaderUtils.parseQuery(this.query),
        callback = this.async(),
        localVars = [],
        config;

    this.cacheable && this.cacheable();

    config = buildConfig(query, this.options[query.config || "closureLoader"]);

    mapBuilder(config.paths).then(function(provideMap) {
        source = processProvides(source, localVars, config.es6mode);
        source = processRequires(source, localVars, provideMap);
        source = createLocalVariables(source, localVars);

        callback(null, source, inputSourceMap);
    });
};

function processProvides(source, localVars, es6mode) {
    var provideRegExp = /goog\.provide\((['"])(([^.)]+)[^)]*)\1\)/g,
        firstMatch,
        possibleDefaults = [],
        matches;

    source = prependLine(source, "var __googProvide = require('closure-loader/provide.js');");
    source = prependLine(source, "var __getDefault = require('closure-loader/getDefault.js');");

    while (matches = provideRegExp.exec(source)) {
        if (!firstMatch) {
            firstMatch = matches[2];
        }

        possibleDefaults.push(matches[2]);

        if (localVars.indexOf(matches[3]) < 0) {
            localVars.push(matches[3]);
        }

        source = source.replace(matches[0], createProvide(matches[2], matches[3]));
    }

    if (es6mode && firstMatch) {
        source = appendLine(source, 'module.exports.default = __getDefault(module.exports, "' + possibleDefaults.join('", "') + '");');
        source = appendLine(source, 'module.exports.__esModule = true;');
    }

    return source;
}

function processRequires(source, localVars, provideMap) {
    var requireRegExp = /goog\.require\((['"])(([^.)]+)[^)]*)\1\)/g,
        isFirst = true,
        matches;

    while (matches = requireRegExp.exec(source)) {
        if (isFirst) {
            source = prependLine(source, "var __googRequire = require('closure-loader/require.js');");
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
    return localVar + " = __googProvide('" + key + "', module.exports)";
}

function createRequire(key, localVar, provideMap) {
    if (!provideMap[key]) {
        throw new Error("Can't find closure dependency " + key);
    }

    return "__googRequire('" + key + "', " + localVar + "); " + key + " = require('" + provideMap[key] + "')." + key;
}