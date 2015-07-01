'use strict';

var _ = require('lodash');
var t = require('traverse');
var parser = require('./parser.js');

function merge(target, input) {
  return _.merge(target, input, function(a, b) {
    if (Array.isArray(a)) {
      return a.concat(b);
    }
  });
}

//mutates
//also calls toString() on all leafs
function resolveRefs(dict) {
  t(dict).forEach(function (val) {
    if (this.isLeaf) {
      var str = val.toString();
      var prev;
      //resolve nested refs until there are none left to resolve
      do {
        prev = str;
        str = parser.mustache(dict, str);
      } while (prev !== str);
      this.update(str);
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

  resolveRefs(dictionary);

  return dictionary;
}

exports.build = build;
exports.merge = merge;
