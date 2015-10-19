var loaderUtils = require("loader-utils"),
    merge = require('deepmerge'),
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

    config = merge(defaultConfig, this.options[query.config || "closureLoader"], query);

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

    /**
     * Escape a string for usage in a regular expression
     *
     * @param {string} string
     * @returns {string}
     */
    function escapeRegExp(string) {
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    /**
     * Replace a given goog.require() with a CommonJS require() call.
     *
     * @param {string} source
     * @param {string} key
     * @param {string} search
     * @param {Object} provideMap
     * @returns {string}
     */
    function replaceRequire(source, key, search, provideMap) {
        var path;

        if (!provideMap[key]) {
            throw new Error("Can't find closure dependency " + key);
        }

        path = loaderUtils.stringifyRequest(self, provideMap[key]);
        return source.replace(new RegExp(escapeRegExp(search), 'g'), key + '=require(' + path + ').' + key + ';');
    }

    /**
     * Array filter function to remove duplicates
     *
     * @param {string} key
     * @param {number} idx
     * @param {Array} arr
     * @returns {boolean}
     */
    function deduplicate(key, idx, arr) {
        return arr.indexOf(key) === idx;
    }

    /**
     * Creates a function that extends an object based on an array of keys
     *
     * Example: `['abc.def', 'abc.def.ghi', 'jkl.mno']` will become `{abc: {def: {ghi: {}}, jkl: {mno: {}}}`
     *
     * @param {Object} tree - the object to extend
     * @returns {Function} The filter function to be called in forEach
     */
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

    /**
     * Create a string which will be injected after the actual module code
     *
     * This will create export statements for all provided namespaces as well as the default
     * export if es6mode is active.
     *
     * @param {Object} exportVarTree
     * @param {Array} exportedVars
     * @param {Object} config
     * @returns {string}
     */
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

    /**
     * Create a string to inject before the actual module code
     *
     * This will create all provided or required namespaces. It will merge those namespaces into an existing
     * object if existent. The declarations will be executed via eval because other plugins or loaders like
     * the ProvidePlugin will see that a variable is created and might not work as expected.
     *
     * Example: If you require or provide a namespace under 'goog' and have the closure library export
     * its global goog object and use that via ProvidePlugin, the plugin wouldn't inject the goog variable
     * into a module that creates its own goog variables. That's why it has to be executed in eval.
     *
     * @param globalVarTree
     * @returns {string}
     */
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
        });

        return merge + "eval('" +  prefix.replace(/'/g, "\\'") + "');";
    }

    /**
     * Replace all empty objects in an object tree with a special formatted string containing the path
     * of that empty object in the tree
     *
     * Example: `{abc: {def: {}}}` will become `{abc: {def: "%abc.def%"}}`
     *
     * @param {Object} object - The object tree to enhance
     * @param {string} path - The base path for the given object
     */
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
};
