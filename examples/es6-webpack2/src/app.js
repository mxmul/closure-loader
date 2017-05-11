import fn from './legacyCode/module';
import {some} from './legacyCode/module';

console.log('Call via default export:');
fn(); // will output to the console

console.log('Call via named export:');
some.legacy.namespace.myFn(); // same as above
console.log('Some var:', some.legacy.namespace.someVar);