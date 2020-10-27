'use strict'

// test files
var base = require('./samples/base-test.json')
var locale = require('./samples/locale-test.json')
var client = require('./samples/client-test.json')
var edges = require('./samples/edge-cases.json')
var encoded = require('./samples/encoded-test.json')

var builder = require('../lib/builder')
var get = require('../lib/get')

var dictionary

describe('get()', () => {
  beforeAll(function () {
    dictionary = builder.build([base, locale, client, edges, encoded])
    get = get.bind(require('../index.js'))
  })

  test('should expect an input', () => {
    expect(get).toThrowError('Expected a minimum of one(1) parameter')
  })

  test('should return a string', () => {
    expect(typeof get(dictionary, 'test')).toBe('string')
  })

  test(
    'should return a string even when additional processing is required',
    () => {
      expect(get(dictionary, 'printfNumberTest', 2)).toBe('1 + 1 = 2')

      expect(get(dictionary, 'currency.format', 2)).toBe('$2.00')

      expect(get(dictionary, 'mustacheTest')).toBe('This is a mustache test')

      expect(get(dictionary, 'nested.mustacheTest')).toBe('this is a nested mustache test')

      expect(get(dictionary, 'nested.mustacheTestSingleChar')).toBe('this is single char mustache t')

      expect(get(dictionary, 'routed', 1)).toBe('this is a nested singular(1) statement')

      expect(get(dictionary, 'routed', 2)).toBe('this is a plural(2) statement')
    }
  )

  test(
    "should throw an error if string isn't defined in dictionary",
    () => {
      expect(get.bind(null, dictionary, 'undefinedStringTest')).toThrowError('`undefinedStringTest` does not exist in string library')
    }
  )

  test('should retrieve an empty string', () => {
    expect(get(dictionary, 'emptyString')).toBe('')
  })

  test('should retrieve a nested empty string', () => {
    expect(get(dictionary, 'nested.emptyString')).toBe('')
  })

  test('should retrieve a referenced string', () => {
    expect(get(dictionary, 'references.refMessages.messageOne')).toBe('one message')
  });

  test('should retrieve a multi referenced string', () => {
    expect(get(dictionary, 'references.refMessages.routed', 1)).toBe('this is a nested singular(1) statement')
  })

  test('should retrieve a single char referenced string', () => {
    expect(get(dictionary, 'references.singleChar.t')).toBe('t')
  })

  test('should retrieve and decode html characters', () => {
    expect(get(dictionary, 'encodedString')).toBe('this&that')
  })

  test('should retrieve and not decode if an ampersand is used but is not an encoded character', () => {
    expect(get(dictionary, 'ampersandString')).toBe('this&that')
  })

  test('should retrieve and encode partially if there is a combination of encoded characters and ampersands', () => {
    expect(get(dictionary, 'encodedCombination')).toBe('this&that&other')
  })

  test('should decode substitution where applicable', () => {
    expect(get(dictionary, 'parameteredEncoded', '&amp;', '&oth')).toBe('this&that&other')
  })

})
