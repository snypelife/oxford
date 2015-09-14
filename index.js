'use strict';

var _ = require('lodash');
var builder = require('./lib/builder');
var get = require('./lib/get');

function buildChild(dictionary, childPath) {
  var child = dictionary;

  if (childPath) {
    child = _.get(child, childPath, {});
  }

  return {
    dictionary: child,
    get: get.bind(null, child),
    child: buildChild.bind(null, child)
  };
}

module.exports = function oxford(dict) {
  var dictionary = builder.build(dict);

  return buildChild(dictionary);
};
