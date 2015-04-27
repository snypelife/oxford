'use strict';

var chai      = require('chai');
var expect    = chai.expect;
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

// test files
var base      = require('./base-test.json');
var locale    = require('./locale-test.json');
var client    = require('./client-test.json');

var builder   = require('../lib/builder');
var get       = require('../lib/get');

var dictionary;

describe('get()', function () {

  before(function () {
    dictionary = builder.build([base, locale, client]);
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
    expect(get(dictionary, 'mustacheTest'))
    .to
    .equal('This is a mustache test');

    expect(get(dictionary, 'nested.mustacheTest'))
    .to
    .equal('this is a nested mustache test');

    expect(get(dictionary, 'routed', [1], [1], 1))
    .to
    .equal('this is a nested singular(1) statement');
  });

  it('should throw an error if string isn\'t defined in dictionary', function () {
    expect(get.bind(null, dictionary, 'undefinedStringTest'))
    .to
    .throw('`undefinedStringTest` does not exist in string library');
  });
});
