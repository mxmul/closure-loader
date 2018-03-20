const _ = require('lodash');
const path = require('path');
const chokidar = require('chokidar');
const Promise = require('bluebird');
const glob = Promise.promisify(require('glob'));
const fs = require('graceful-fs');

const cache = {};
const lstat = Promise.promisify(fs.lstat);
const readFile = Promise.promisify(fs.readFile);
const provideRegExp = /goog\.provide\((['"])(([^.)]+)[^)]*)\1\)/g;

/**
 * Promisified watch
 *
 * Resolves promise after watcher is ready to prevent `add` events during
 * initializations wich repeatedly deletes our cache.
 *
 * @returns {Promise}
 */
function createWatchPromise(directory) {
    return new Promise(resolve => {
        const watcher = chokidar.watch(directory).on('ready', () => {
            watcher.on('all', () => {
                delete cache[directory];
            });
            resolve(watcher);
        });
    });
}

/**
 * Scans the given file path for occurences of `goog.provide()` and fulfills
 * in an object wich mapps each namespace to the file path
 *
 * @param {string} filePath
 * @returns {Promise}
 */
function findProvideCalls(filePath) {
    return lstat(filePath).then(stats => {
        if (!stats.isFile()) {
            return {};
        }

        return readFile(filePath).then(fileContent => {
            const result = {};

            let matches = null;
            // eslint-disable-next-line no-cond-assign
            while ((matches = provideRegExp.exec(fileContent)) !== null) {
                result[matches[2]] = filePath;
            }
            return result;
        });
    });
}

/**
 * Fulfills in an object wich maps namespace to file path. The result will be
 * cached by the given directory name. A file watcher watches for any changes
 * in this directory and deletes the cached object.
 *
 * @param {string} directory
 * @param {boolean} watch Watch for changes is mapped files to invalidate cache
 * @param {string} fileExt Searched file extensions
 * @returns {Promise}
 */
function resolveAndCacheDirectory(directory, watch, fileExt) {
    if (cache[directory]) {
        return cache[directory];
    }

    cache[directory] = (watch
        ? createWatchPromise(directory)
        : Promise.resolve()
    )
        .then(() => glob(path.join(directory, '**', `*${fileExt}`)))
        .map(filePath => findProvideCalls(filePath))
        .then(results => _.assign(...results));

    return cache[directory];
}

/**
 * Fulfills in an object wich maps namespaces to file paths found in given
 * directories.
 *
 * @param {string[]} directories Directories to be processed
 * @param {boolean} watch Watch for changes is mapped files to invalidate cache
 * @param {string} fileExt Searched file extensions
 * @returns {Promise}
 */
module.exports = function dependencyMapBuilder(directories, watch, fileExt) {
    return Promise.map(directories, dir =>
        resolveAndCacheDirectory(dir, watch, fileExt),
    ).then(results => _.assign(...results));
};
