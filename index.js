'use strict';

var builder = require('./lib/builder');
var get = require('./lib/get');
var t = require('traverse');

function oxford(dict, childPath) {
  var dictionary = builder.build(dict);
  if (childPath) {
    if (!Array.isArray(childPath)) {
      childPath = childPath.split('.');
    }
    dictionary = t(dictionary).get(childPath) || {};
  }
  return {
    dictionary: dictionary,
    get: get.bind(null, dictionary),
    child: function(path) {
      return oxford(dictionary, path);
    }
  };
}

module.exports = oxford;
