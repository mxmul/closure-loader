var loaderUtils = require("loader-utils"),
    _ = require('lodash'),
    mapBuilder = require('./dependencyMapBuilder'),
    SourceNode = require("source-map").SourceNode,
    SourceMapConsumer = require("source-map").SourceMapConsumer,
    defaultConfig = config = {
        paths: [],
        es6mode: false,
        watch: true
    },
    prefix, postfix;


module.exports = function (source, inputSourceMap) {
    var self = this,
        query = loaderUtils.parseQuery(this.query),
        callback = this.async(),
        originalSource = source,
        globalVars = [],
        exportedVars = [],
        config;

    this.cacheable && this.cacheable();

    config = buildConfig(query, this.options[query.config || "closureLoader"]);

    mapBuilder(config.paths, config.watch).then(function(provideMap) {
        var provideRegExp = /goog\.provide *?\((['"])(.*)\1\);?/,
            requireRegExp = /goog\.require *?\((['"])(.*)\1\);?/,
            globalVarTree = {},
            exportVarTree = {},
            matches;

        while (matches = provideRegExp.exec(source)) {
            source = source.replace(new RegExp(escapeRegExp(matches[0]), 'g'), '');
            globalVars.push(matches[2]);
            exportedVars.push(matches[2]);
        }

        while (matches = requireRegExp.exec(source)) {
            source = replaceRequire(source, matches[2], matches[0], provideMap);
            globalVars.push(matches[2]);
        }

        globalVars = globalVars
            .filter(deduplicate)
            .map(buildVarTree(globalVarTree));

        exportedVars = exportedVars
            .filter(deduplicate)
            .map(buildVarTree(exportVarTree));

        prefix = createPrefix(globalVarTree);
        postfix = createPostfix(exportVarTree, exportedVars, config);

        if(inputSourceMap) {
            var currentRequest = loaderUtils.getCurrentRequest(self),
                node = SourceNode.fromStringWithSourceMap(originalSource, new SourceMapConsumer(inputSourceMap));

            node.prepend(prefix + "\n");
            node.add(postfix);
            var result = node.toStringWithSourceMap({
                file: currentRequest
            });

            callback(null, source, result.map.toJSON());
            return;
        }

        callback(null, prefix + "\n" + source + postfix, inputSourceMap);
    });


    function escapeRegExp(string) {
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    function replaceRequire(source, key, search, provideMap) {
        var path;

        if (!provideMap[key]) {
            throw new Error("Can't find closure dependency " + key);
        }

        path = loaderUtils.stringifyRequest(self, provideMap[key]);
        return source.replace(new RegExp(escapeRegExp(search), 'g'), key + '=require(' + path + ').' + key + ';');
    }

    function deduplicate(key, idx, arr) {
        return arr.indexOf(key) === idx;
    }

    function buildVarTree(tree) {
        return function (key) {
            var layer = tree;
            key.split('.').forEach(function (part) {
                layer[part] = layer[part] || {};
                layer = layer[part];
            });
            return key;
        }
    }

    function enrichExport(object, path) {
        path = path ? path + '.' : '';
        Object.keys(object).forEach(function (key) {
            var subPath = path + key;

            if (Object.keys(object[key]).length) {
                enrichExport(object[key], subPath);
            } else {
                object[key] = '%' + subPath + '%';
            }
        });
    }

    function buildConfig(query, options) {
        return _.merge(_.clone(defaultConfig), options, query);
    }

    function createPostfix(exportVarTree, exportedVars, config) {
        postfix = ';';
        Object.keys(exportVarTree).forEach(function (rootVar) {
            var jsonObj;
            enrichExport(exportVarTree[rootVar], rootVar);
            jsonObj = JSON.stringify(exportVarTree[rootVar]).replace(/(['"])%(.*?)%\1/g, '$2');
            postfix += 'exports.' + rootVar + '=' + jsonObj + ';';
        });

        if (config.es6mode && exportedVars.length) {
            postfix += 'exports.default=' + exportedVars.shift() + ';exports.__esModule=true;';
        }

        return postfix;
    }

    function createPrefix(globalVarTree) {
        var merge = "var __merge=require(" + loaderUtils.stringifyRequest(self, require.resolve('deepmerge')) + ");";
        prefix = '';
        Object.keys(globalVarTree).forEach(function (rootVar) {
            prefix += [
                'var ',
                rootVar,
                '=__merge(',
                rootVar,
                '||{},',
                JSON.stringify(globalVarTree[rootVar]),
                ');'
            ].join('');
            //prefix += 'var ' + rootVar + '=' + rootVar + '||' + JSON.stringify(globalVarTree[rootVar]) + ';';
        });

        return merge + "eval('" +  prefix.replace(/'/g, "\\'") + "');";
    }
};
