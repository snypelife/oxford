'use strict';

var builder = require('./lib/builder');
var get = require('./lib/get');

module.exports = function oxford(dict) {
  var dictionary = builder.build(dict);
  return {
    dictionary: dictionary,
    get: get.bind(null, dictionary)
  };
};
