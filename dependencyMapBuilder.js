var glob = require('glob'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    provideRegExp = /goog\.provide\((['"])(([^.)]+)[^)]*)\1\)/g;

module.exports = function (directories) {
    var files = findJsFiles(directories),
        provideMap = {};

    files.forEach(function (filePath) {
        addFileProvides(filePath, provideMap);
    });

    return provideMap;
};

function addFileProvides(filePath, provideMap) {
    var fileContent = fs.readFileSync(filePath);

    while (matches = provideRegExp.exec(fileContent)) {
        provideMap[matches[2]] = filePath;
    }
}

function findJsFiles(directories) {
    return _.flatten(directories.map(function(dir) {
        return glob.sync(path.join(dir, '/**/*.js'));
    }));
}