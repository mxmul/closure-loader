/**
* Ensure that a dotted path is defined on a namespace object. Will create
* intermediate namespaces that are not defined as empty objects, and will
* optionally set a value at the end of the path.
*
 * @param {Object} namespace
 * @param {string} name
 * @param {*=} value
*/
module.exports = function(namespace, name, value) {
  var parts = name.split('.');
  var target = namespace;

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    if (i === parts.length - 1 && value !== undefined) {
      target[part] = value;
    } else if (target[part]) {
      target = target[part];
    } else {
      target = target[part] = {};
    }
  }
};
