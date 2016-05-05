'use strict';

var _ = require('lodash');
var t = require('traverse');
var parser = require('./parser.js');

function merge(target, input) {
  return _.merge(target, input, function (a, b) {
  if (_.isArray(a) && _.isArray(b)) {
    return b;
  }
});
}

//also calls toString() on all leafs
function resolve(dict) {
  //clone to deal with the mutation that traverse does
  var clone = _.cloneDeep(dict);
  t(clone).forEach(function (val) {
    if (this.isLeaf) {
      var str = val.toString();
      var prev;
      //resolve nested refs until there are none left to resolve
      do {
        prev = str;
        str = parser.mustache(dict, str);
      } while (prev !== str);

      str = parser.reference(dict, str);

      this.update(str);
    }
  });
  return clone;
}

function build(dict) {
  var dictionary = {};

  if (_.isArray(dict)) {
    dict.forEach(function (item) {
      dictionary = merge(dictionary, item);
    });
    return resolve(dictionary);
  } else if (_.isPlainObject(dict)) {
    dictionary = merge(dictionary, dict);
    return resolve(dictionary);
  }

  throw new TypeError('`build` method only accepts arrays and objects as parameters');
}

exports.build = build;
exports.merge = merge;
