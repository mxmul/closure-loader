# Closure library dependency loader for [Webpack](http://webpack.github.io/)

[![Join the chat at https://gitter.im/eXaminator/closure-loader](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/eXaminator/closure-loader?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Dependency Status](https://david-dm.org/examinator/closure-loader.svg)](https://david-dm.org/examinator/closure-loader)
[![npm version](https://badge.fury.io/js/closure-loader.svg)](https://badge.fury.io/js/closure-loader)

This is a webpack loader which resolves `goog.provide()` and `goog.require()` statements in webpack
just like if they were regular CommonJS modules.

## Installation
```npm install --save-dev closure-loader```

## Usage
[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

**NOTE**: This loader is mainly meant for building (probably older) closure library projects with webpack
and to make a transition to other module systems (CommonJS or ES6) easier.

There are two parts to this loader:
- `goog.provide()`
    - Basically just creates the given namespace in the local scope of that module
    - Any file containing this statement will be added to a map for require lookups
- `goog.require()`
    - Like `goog.provide()` it creates the given namespace in the scope of that module
    - It finds the corresponding file with the `goog.provide()` statement and loads it (see configuration below)
    - It assigns the value of the namespace from the provide file and assign it to the same
      namespace in the current module

In the simplest way you can just use those two statements like you usually would with the google closure library.

**NOTE**: Usually the closure lib simply creates all namespaces on the **global** scope (i.e. the window object).
This is **not** the case if you use this loader. Every file ("module") has its own scope just like it would have
if you used CommonJS syntax.

You can use closure library dependencies in conjunction with CommonJS syntax. You can load any module that uses
`goog.provide()` with `require()`, but not the other way round.

```javascript
// module.js
goog.provide('my.app.module');

my.app.module = function () {
    console.log('my module was loaded');
}

// index.js
var module = require('./module.js').my.app.module;

module(); // will output 'my module was loaded' to the console
```

## ES6 Modules
If you use babel you can even use ES6 import syntax. If you have enabled the `es6mode` in the loader config
the first `goog.provide()` of each file will be exported as "default" in addition to its full namespace.

```javascript
// module.js
goog.provide('my.app.module');

my.app.module = function () {
    console.log('my module was loaded');
}

// index.js
import module from './module.js';
// is the same as
var module = require('./module.js').default;
// or
var module = require('./module.js').my.app.module;

module(); // will output 'my module was loaded' to the console
```

## Configuration
Here is an example webpack config for this loader:

```javascript
module.exports = {
    entry: {
        app: './src/index.js'
    },
    output: {
        path: './build',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\/src\/.*\.js$/,
                loaders: [
                    'closure-loader'
                ],
                exclude: [/node_modules/, /test/]
            }
        ]
    },
    closureLoader: {
        paths: [
            __dirname + '/src'
        ],
        es6mode: true,
        watch: true
    }
};
```

Here are the configuration options specific for this loader:

- **paths** (array): An array of path strings. The loader will search all `*.js` files within theses
  paths for `goog.provide()` statements when resolving a `goog.require()`. You can only `goog.require()`
  dependencies that can be found under one of these paths.
- **es6mode** (boolean, default: false): If enabled it will add the value of the first `goog.provide()`
  as default export for usage with babel. For this reason it will also export the corresponding flag
  `module.exports.__esModule = true`
- **watch** (boolean, default: true): If true, the loader will intitialise watchers which check for
  changes in the mapped files. This is neccesary to be able to delete the internal map cache. But
  it also makes problems with CI sytstems and build scripts, because the watcher will prevent the
  process from beeing exited.

## Examples
In the hopes of clarifying the usage of the loader a bit I have provided a couple of examples which
you can find in the `examples` directory.

To run an example please follow these steps:
- `npm install` in the closure-loader root directory
- `npm install` in the directory of the example
- `npm start` or `npm run build` in the directory of the example

The following examples are available:
- **common-js**: This example shows how to load some legacy code that contains `goog.provide()` and
  `goog.require()` via commonJs `require()` calls.
- **common-js-closure-lib**: This example shows how to load the closure library via commonJs
  `require()` calls.
- **es6**: This example shows how to load some legacy code that contains `goog.provide()` and
  `goog.require()` via babel and es6 `import` calls.
- **es6-closure-lib**: This example shows how to load the closure library via babel and es6
  `import` calls.
- **legacy-closure-lib**: This example shows how to load the closure library via your own `goog.require()`
  calls. This is not advised. If you are using webpack you should think about using a proper module loader,
  preferably es6 as this is now the standard.

**NOTE**: This loader does in no way include or wrap the actual google closure library. If you want to use the closure library you will have to include it yourself and ensure correct shimming. See the above examples on how this can be done.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
