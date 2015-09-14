'use strict';

var _ = require('lodash');
var format = require('util').format;
var parser = require('./parser');

module.exports = function get(dictionary, selector) {
  var args = _.toArray(arguments);
  dictionary = args.shift();
  selector = args.shift();

  if (!selector) {
    throw new ReferenceError('Expected a minimum of one(1) parameter');
  }

  // basic dot notation traversal
  var isMultiLevel = selector.split('.').length > 1;
  var string = _.get(dictionary, selector);

  // custom traversal for handling things such as routing keys
  if (isMultiLevel || _.isPlainObject(string)) {
    string = parser.traverse(dictionary, selector, args);
  }

  if (_.isUndefined(string) || _.isNull(string)) {
    throw new ReferenceError(
      format('`%s` does not exist in string library', selector)
    );
  }

  string = parser.parse(dictionary, string, args);
  string = parser.decode(string);

  return string;
};
