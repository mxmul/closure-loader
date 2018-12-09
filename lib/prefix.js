/* eslint-disable */
const exportPath = require('./export-path');

function createNestedNamespace(globalVars, __eval) {
    var namespace = {};

    globalVars.forEach(function (dottedPath) {
        var rootVar = dottedPath.split('.')[0];
        namespace[rootVar] = getRootVar(rootVar, __eval);

    });

    globalVars.forEach(function (dottedPath) {
        exportPath(namespace, dottedPath);
    });

    return namespace;
}

function getRootVar(name, __eval) {
    return (__eval("typeof " + name) !== "undefined") ? __eval(name) : (typeof window !== "undefined") && window[name] || {};

    // return (eval("typeof " + "${rootVar}") !== "undefined") ? eval("${rootVar}") : (typeof window !== "undefined") && window.${rootVar} || {};
}

function defineVars(namespace, __eval) {
    for (var key in namespace) {
        __eval('var ' + key + ' = ' + '__closureLoaderNamespace.' + key + ';');
    }
    // let evalContent = '';
    // Object.keys(globalVarTree).forEach(rootVar => {
    //     evalContent += `var ${rootVar} = __closureLoaderNamespace.${rootVar};`;
    // });
    // if (useEval) {
    //     prefix += `eval('${evalContent}');`;
    // }
}

module.exports = {
    createNestedNamespace: createNestedNamespace,
    getRootVar: getRootVar,
    defineVars: defineVars,
};
