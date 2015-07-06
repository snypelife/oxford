'use strict';

var builder = require('./lib/builder');
var get = require('./lib/get');
var t = require('traverse');

function oxford(dict) {
  var dictionary = builder.build(dict);

  function buildChild(childPath) {
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
      child: buildChild
    };
  }

  return buildChild();
}

module.exports = oxford;
