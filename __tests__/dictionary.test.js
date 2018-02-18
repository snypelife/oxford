'use strict'

var oxford = require('../')

describe('dictionary', () => {
  var ox

  var testDictionary

  beforeAll(function () {
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
    }
  })

  beforeEach(() => {
    ox = oxford([testDictionary])
  })

  test('should expose the internal dictionary', () => {
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
    }

    expect(ox.dictionary).toEqual(expected)
  })

  test('should expose the internal dictionary of a child', () => {
    var expected = {
      b: {
        c: 'foo',
        d: 'bar test'
      }
    }

    expect(ox.child('test.a').dictionary).toEqual(expected)
  })

  test('should survive stringify', () => {
    var stringDictionary = JSON.stringify(ox.dictionary)

    var recreatedDictionary = JSON.parse(stringDictionary)

    expect(oxford([recreatedDictionary]).dictionary).toEqual(ox.dictionary)
  })
})
