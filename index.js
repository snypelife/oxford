'use strict';

var builder = require('./lib/builder');
var get = require('./lib/get');
var t = require('traverse');


function buildChild(dictionary, childPath) {
  var child = dictionary;

  if (childPath) {
    if (!Array.isArray(childPath)) {
      childPath = childPath.split('.');
    }
    child = t(child).get(childPath) || {};
  }

  return {
    dictionary: child,
    get: get.bind(null, child),
    child: buildChild.bind(null, child)
  };
}

function oxford(dict) {
  var dictionary = builder.build(dict);

  return buildChild(dictionary);
}

module.exports = oxford;
