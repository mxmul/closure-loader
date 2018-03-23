goog.require('goog.math.Box');

var outerBox = new goog.math.Box(0, 100, 100, 0);
var innerBox = new goog.math.Box(0, 50, 50, 0);

console.log('Inner box in outer box', outerBox.contains(innerBox));
console.log('Outer box in inner box', innerBox.contains(outerBox));

// You can also use other goog functions, like goog.inherits

function MyBox() {
    goog.base(this, arguments);

    this.contains = function () {
        console.log('calculating if one box contains another');
        return goog.math.Box.contains.apply(this, arguments);
    };
}
goog.inherits(MyBox, goog.math.Box);

outerBox = new MyBox(0, 100, 100, 0);
innerBox = new MyBox(0, 50, 50, 0);

console.log('Outer box in inner box', innerBox.contains(outerBox));