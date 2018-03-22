var Box = require('google-closure-library/closure/goog/math/box').goog.math.Box; // Think about using a resolve alias

var outerBox = new Box(0, 100, 100, 0);
var innerBox = new Box(0, 50, 50, 0);

console.log('Inner box in outer box', outerBox.contains(innerBox));
console.log('Outer box in inner box', innerBox.contains(outerBox));