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

// private
var builder   = require('../lib/builder');

var dictionary;

describe('builder', function () {

  before(function () {
    dictionary = builder.build([base, locale, client]);
  });

  describe('build()', function () {
    it('should build a single level dictionary', function () {
      var test = {
        a: 1,
        b: 2,
        c: 3
      };

      expect(builder.build(test))
      .to
      .eql(test);
    });

    it('should build a multi level dictionary', function () {
      var test = [{a: 1, b: 2, c: 3}, {c: 4, d: 5, e: 6}, {x: 7, y: 8, z: 9}];

      expect(builder.build(test))
      .to
      .eql(
        {a: 1, b: 2, c: 4, d: 5, e: 6, x: 7, y: 8, z: 9}
      );
    });

    it('should throw an error if passed anything other than arrays and objects', function () {
      expect(builder.build.bind(null, 1))
      .to
      .throw('`build` method only accepts arrays and objects as parameters');
    });
  });

  describe('merge()', function () {
    it('should merge two objects together', function () {
      var testA = {a: 1, b: 2, c: 3};
      var testB = {c: 4, d: 5, e: 6};

      expect(builder.merge(testA, testB))
      .to
      .eql(
        {a: 1, b:2, c:4, d:5, e:6}
      );
    });

    it('should merge two objects containing arrays together', function () {
      var testA = {a: 1, b: 2, c: ['x', 'y', 'z']};
      var testB = {c: ['a', 'b', 'c'], d: 5, e: 6};

      expect(builder.merge(testA, testB))
      .to
      .eql(
        {a: 1, b:2, c:['x', 'y', 'z', 'a', 'b', 'c'], d:5, e:6}
      );
    });
  });
});
