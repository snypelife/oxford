'use strict';

var parser = require('./parser');

module.exports = function get(dictionary, selector) {
  var args = Array.prototype.slice.call(arguments);
  dictionary = args.shift();
  selector = args.shift();

  if (!selector) {
    throw new Error('Expected a minimum of one(1) parameter');
  }

  var traversalPath = selector.split('.');
  var string;

  // multi-level traversal
  if (traversalPath.length > 1 || typeof dictionary[traversalPath[0]] === 'object') {
    string = parser.traverse(dictionary, traversalPath, args);
  }
  // O(1) for simple root level lookup
  else {
    string = dictionary[traversalPath[0]];
  }

  if (!string) {
    throw new ReferenceError('`' + selector + '` does not exist in string library');
  }

  string = parser.parse(dictionary, string, args);
  string = parser.decode(string);

  return string;
};
