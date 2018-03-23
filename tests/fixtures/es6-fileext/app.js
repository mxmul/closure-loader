import fn from './legacy-code/module';
import {some} from './legacy-code/module';

console.log('Call via default export:');
fn(); // will output to the console

console.log('Call via named export:');
some.legacy.namespace.myFn(); // same as above
console.log('Some var:', some.legacy.namespace.someVar);
