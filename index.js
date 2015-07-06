'use strict';

var builder = require('./lib/builder');
var get = require('./lib/get');
var t = require('traverse');

function oxford(dict) {
  var dictionary = builder.build(dict);

  function buildChild(childPath) {
    var dict = dictionary;

    if (childPath) {
      if (!Array.isArray(childPath)) {
        childPath = childPath.split('.');
      }
      dict = t(dict).get(childPath) || {};
    }

    return {
      dictionary: dict,
      get: get.bind(null, dict),
      child: buildChild
    };
  }

  return buildChild();
}

module.exports = oxford;
