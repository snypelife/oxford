'use strict';

var expect = require('chai').expect;

var oxford = require('../');


describe('dictionary', function () {

  var ox;

  var testDictionary;

  before(function () {
    testDictionary = {
      test: {
        testRef: 'test',
        a: {
          b: {
            c: 'foo',
            d: 'bar {{test.testRef}}'
          }
        }
      }
    };
  });

  beforeEach(function () {
    ox = oxford([testDictionary]);
  });

  it('should expose the internal dictionary', function () {

    var expected = {
      test: {
        testRef: 'test',
        a: {
          b: {
            c: 'foo',
            d: 'bar test'
          }
        }
      }
    };

    expect(ox.dictionary).to.eql(expected);

  });

  it('should expose the internal dictionary of a child', function () {

    var expected = {
      b: {
        c: 'foo',
        d: 'bar test'
      }
    };

    expect(ox.child('test.a').dictionary).to.eql(expected);

  });

  it('should survive stringify', function () {

    var stringDictionary = JSON.stringify(ox.dictionary);

    var recreatedDictionary = JSON.parse(stringDictionary);

    expect(oxford([recreatedDictionary]).dictionary).to.eql(ox.dictionary);

  });


});