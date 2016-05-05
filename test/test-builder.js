'use strict';

var chai = require('chai');
var expect = chai.expect;

// private
var builder = require('../lib/builder');

describe('builder', function () {
  describe('build()', function () {
    it('should build a single level dictionary', function () {
      var test = {
        a: '1',
        b: '2',
        c: '3'
      };

      expect(builder.build(test))
        .to
        .eql(test);
    });

    it('should build a multi level dictionary (and covert numbers to strings)', function () {
      var test = [{
        a: 1,
        b: 2,
        c: 3
      }, {
        c: 4,
        d: 5,
        e: 6
      }, {
        x: 7,
        y: 8,
        z: 9
      }];

      expect(builder.build(test))
        .to
        .eql({
          a: '1',
          b: '2',
          c: '4',
          d: '5',
          e: '6',
          x: '7',
          y: '8',
          z: '9'
        });
    });

    it('should throw an error if passed anything other than arrays and objects', function () {
      expect(builder.build.bind(null, 1))
        .to
        .throw('`build` method only accepts arrays and objects as parameters');
    });

    it('should resolve references on build', function () {
      var test = {
        ref: 'abcd',
        data: {
          a: '{{ref}}',
          b: 'this is a {{ref}}'
        }
      };
      expect(builder.build(test))
        .to
        .eql({
          ref: 'abcd',
          data: {
            a: 'abcd',
            b: 'this is a abcd'
          }
        });
    });

    it('should resolve nested references on build', function () {
      var test = {
        ref: 'abcd',
        data: {
          a: '{{ref}} {{data.b}}',
          b: 'this is a {{ref}}'
        }
      };
      expect(builder.build(test))
        .to
        .eql({
          ref: 'abcd',
          data: {
            a: 'abcd this is a abcd',
            b: 'this is a abcd'
          }
        });
    });
  });

  describe('merge()', function () {
    it('should merge two objects together', function () {
      var testA = {
        a: 1,
        b: 2,
        c: 3
      };
      var testB = {
        c: 4,
        d: 5,
        e: 6
      };

      expect(builder.merge(testA, testB))
        .to
        .eql({
          a: 1,
          b: 2,
          c: 4,
          d: 5,
          e: 6
        });
    });

    it('should merge two objects containing arrays together', function () {
      var testA = {
        a: 1,
        b: 2,
        c: ['v', 'w', 'x', 'y', 'z']
      };
      var testB = {
        c: ['a', 'b', 'c'],
        d: 5,
        e: 6
      };

      expect(builder.merge(testA, testB))
        .to
        .eql({
          a: 1,
          b: 2,
          c: ['a', 'b', 'c'],
          d: 5,
          e: 6
        });
    });
  });
});
