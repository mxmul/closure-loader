goog.provide('some.legacy.namespace.myFn');
goog.provide('some.legacy.namespace.someVar');

goog.require('some.legacy.namespace.otherModule.text');


some.legacy.namespace.myFn = function () {
    console.log('this is some.legacy.namespace.myFn');
    console.log('some.legacy.namespace.otherModule.text =', some.legacy.namespace.otherModule.text);
};

some.legacy.namespace.someVar = 42;
