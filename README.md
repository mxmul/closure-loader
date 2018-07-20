# closure-loader

[![npm][npm]][npm-url]
[![deps][deps]][deps-url]
[![test][test]][test-url]

This is a Webpack loader which resolves `goog.provide()` and `goog.require()` statements in Webpack
as if they were regular CommonJS modules.

## Installation
```npm install --save-dev closure-loader```

## Usage
[Documentation: Using loaders](https://webpack.js.org/concepts/loaders/#using-loaders)

**NOTE**: This loader is mainly meant for building (probably older) Closure Compiler projects with Webpack
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

In the simplest way you can just use those two statements like you usually would with Google Closure Tools.

**NOTE**: Usually the Closure compiler simply creates all namespaces on the **global** scope (i.e. the window object).
This is **not** the case if you use this loader. Every file ("module") has its own scope just like it would have
if you used CommonJS syntax.

You can use Closure dependencies in conjunction with CommonJS syntax. You can load any module that uses
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
Here is an example Webpack config for this loader:

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
        rules: [
            {
                test: /\/src\/.*\.js$/,
                loader: 'closure-loader',
                options: {
                    paths: [
                        __dirname + '/src',
                    ],
                    es6mode: true,
                    watch: true,
                    fileExt: '.js',
                },
                exclude: [/node_modules/, /test/]
            }
        ]
    },
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
- **fileExt** (string, default: '.js'): Files extension which will be searched for dependency resolving. 
  Support [glob](https://github.com/isaacs/node-glob) pattern syntax.

**NOTE**: This loader in no way includes or wraps the actual Google Closure Library. If you want to use the Closure Library you will have to include it yourself and ensure correct shimming:

```javascript
module: {
    rules: [
        {
            test: /google-closure-library\/closure\/goog\/base/,
            use: [
                'imports-loader?this=>{goog:{}}&goog=>this.goog',
                'exports-loader?goog',
            ],
        },
    ],
},
plugins: [
    new webpack.ProvidePlugin({
        goog: 'google-closure-library/closure/goog/base',
    }),
]
```

## Authors

* **Steven Weingärtner** - *Original author & maintainer* - [eXaminator](https://github.com/eXaminator)
* **Matt Mulder** - *Current maintainer* - [mxmul](https://github.com/mxmul)

See also the list of [contributors](https://github.com/mxmul/closure-loader/graphs/contributors) who participated in this project.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)

[npm]: https://img.shields.io/npm/v/closure-loader.svg
[npm-url]: https://npmjs.com/package/closure-loader

[deps]: https://david-dm.org/mxmul/closure-loader.svg
[deps-url]: https://david-dm.org/mxmul/closure-loader

[test]: http://img.shields.io/travis/mxmul/closure-loader/master.svg
[test-url]: https://travis-ci.org/mxmul/closure-loader
