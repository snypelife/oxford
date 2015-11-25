'use strict';

var chai = require('chai');
var expect = chai.expect;

// test files
var base = require('./samples/base-test.json');
var locale = require('./samples/locale-test.json');
var client = require('./samples/client-test.json');
var edges = require('./samples/edge-cases.json');

var builder = require('../lib/builder');
var get = require('../lib/get');

var dictionary;

describe('get()', function () {

  before(function () {
    dictionary = builder.build([base, locale, client, edges]);
    get = get.bind(require('../index.js'));
  });

  it('should expect an input', function () {
    expect(get)
      .to
      .throw('Expected a minimum of one(1) parameter');
  });

  it('should return a string', function () {
    expect(get(dictionary, 'test'))
      .to
      .be
      .a('String');
  });

  it('should return a string even when additional processing is required', function () {
    expect(get(dictionary, 'printfNumberTest', 2))
      .to
      .equal('1 + 1 = 2');

    expect(get(dictionary, 'currency.format', 2))
      .to
      .equal('$2.00');

    expect(get(dictionary, 'mustacheTest'))
      .to
      .equal('This is a mustache test');

    expect(get(dictionary, 'nested.mustacheTest'))
      .to
      .equal('this is a nested mustache test');

    expect(get(dictionary, 'routed', 1))
      .to
      .equal('this is a nested singular(1) statement');

    expect(get(dictionary, 'routed', 2))
      .to
      .equal('this is a plural(2) statement');
  });

  it('should throw an error if string isn\'t defined in dictionary', function () {
    expect(get.bind(null, dictionary, 'undefinedStringTest'))
      .to
      .throw('`undefinedStringTest` does not exist in string library');
  });

  it('should retrieve an empty string', function () {
    expect(get(dictionary, 'emptyString'))
      .to
      .equal('');
  });

  it('should retrieve a nested empty string', function () {
    expect(get(dictionary, 'nested.emptyString'))
      .to
      .equal('');
  });
});
