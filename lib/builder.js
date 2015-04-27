'use strict';

var _ = require('lodash');

function merge(target, input) {
  return _.merge(target, input, function(a, b) {
    if (Array.isArray(a)) {
      return a.concat(b);
    }
  });
}

function build(dict) {
  var dictionary = {};

  if (Array.isArray(dict)) {
    while (dict.length) {
      dictionary = merge(dictionary, dict.shift());
    }
  }
  else if ('object' === typeof dict) {
    dictionary = merge(dictionary, dict);
  }
  else {
    throw new TypeError('`build` method only accepts arrays and objects as parameters');
  }

  return dictionary;
}

exports.build = build;
exports.merge = merge;
