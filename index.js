'use strict';

var builder = require('./lib/builder');
var get = require('./lib/get');
var t = require('traverse');

function oxford(dict, domain) {
  var dictionary = builder.build(dict);
  if (domain) {
    if (!Array.isArray(domain)) {
      domain = domain.split('.');
    }
    dictionary = t(dictionary).get(domain) || {};
  }
  return {
    dictionary: dictionary,
    get: get.bind(null, dictionary),
    domain: function(domain) {
      return oxford(dictionary, domain);
    }
  };
}

module.exports = oxford;
