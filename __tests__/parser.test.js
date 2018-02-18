'use strict'

// test files
var base = require('./samples/base-test.json')
var locale = require('./samples/locale-test.json')
var client = require('./samples/client-test.json')
var edges = require('./samples/edge-cases.json')

var builder = require('../lib/builder')
var parser = require('../lib/parser')

var dictionary

describe('parser', () => {
  beforeAll(function () {
    dictionary = builder.build([base, locale, client, edges])
  })

  describe('traverse()', () => {
    test('should traverse complex properties with custom routing', () => {
      expect(parser.traverse(dictionary, 'routed', [2])).toBe('this is a plural(%d) statement')
    })

    test(
      'should traverse nested complex properties with custom routing',
      () => {
        expect(parser.traverse(dictionary, 'routed', [1])).toBe('this is a nested singular(%d) statement')
      }
    )

    test(
      'should throw an error when nested properties are undefined',
      () => {
        expect(
          parser.traverse.bind(null, dictionary, 'bad.nested.path')
        ).toThrowError('`bad.nested.path` does not exist in this context')
      }
    )

    test('should traverse paths that result in empty string values', () => {
      expect(parser.traverse(dictionary, 'nested.emptyString')).toBe('')
    })

    test(
      'should traverse paths and return string if $default is defined',
      () => {
        expect(parser.traverse(dictionary, 'defaultTest')).toBe('this is a default string')
        expect(parser.traverse(dictionary, 'defaultTest.alternate')).toBe('this is an alternate string')
      }
    )
  })

  describe('parse()', () => {
    test('should return a result', () => {
      expect(parser.parse(dictionary, 'test')).toBe('test')
    })

    test('should return a result when passed args', () => {
      expect(
        parser.parse(dictionary, dictionary.printfStringTest, ['parse test'])
      ).toBe('This is a parse test')
    })

    test('should parse nested properties and return a string', () => {
      expect(parser.parse(dictionary, dictionary.nestedMustacheTest)).toBe('this is a nested mustache test')
    })

    test('should throw an error when missing args', () => {
      expect(
        parser.parse.bind(null, dictionary, dictionary.printfMixedTest)
      ).toThrowError('Missing parameters for string `%d %s, %d %s`')
    })
  })

  describe('printf()', () => {
    test('should accept optional parameters', () => {
      expect(parser.printf(dictionary.printfStringTest, ['test'])).toBe('This is a test')
    })

    test('should accept more than 1 argument', () => {
      expect(
        parser.printf(dictionary.printfMixedTest, [1, 'fish', 2, 'fish'])
      ).toBe('1 fish, 2 fish')
    })

    test('should handle string params', () => {
      expect(parser.printf(dictionary.printfStringTest, ['test'])).toBe('This is a test')
    })

    test('should handle number params', () => {
      expect(parser.printf(dictionary.printfNumberTest, [2])).toBe('1 + 1 = 2')
    })

    test('should handle mixed params', () => {
      expect(
        parser.printf(dictionary.printfMixedTest, [1, 'fish', 2, 'fish'])
      ).toBe('1 fish, 2 fish')
    })

    test('should handle params in nested properties', () => {
      expect(parser.printf(dictionary.nested.printfTest, ['test'])).toBe('this is a nested printf test')
    })

    test('should handle index based placeholders', () => {
      expect(
        parser.printf('%s2 %d1, %s4 %d3', [1, 'fish', 2, 'fish'])
      ).toBe('fish 1, fish 2')
    })

    test(
      'should ignore any extra args and without throwing an error',
      () => {
        expect(
          parser.printf(dictionary.printfStringTest, ['fish', 'cat'])
        ).toBe('This is a fish')

        expect(
          parser.printf('this has no placeholders', ['fish', 'cat'])
        ).toBe('this has no placeholders')
      }
    )

    test('should throw an error when passing not enough args', () => {
      expect(parser.printf.bind(null, dictionary.printfMixedTest)).toThrowError('Mismatched number of parameters passed to: "%d %s, %d %s"')
    })

    test(
      'should throw an error if passed anything other than string or number',
      () => {
        expect(
          parser.printf.bind(null, dictionary.printfStringTest, [{}])
        ).toThrowError('Invalid args were passed to: "This is a %s"')
      }
    )

    test(
      'should throw an error if passed a number but expected a string',
      () => {
        expect(
          parser.printf.bind(null, dictionary.printfStringTest, [1])
        ).toThrowError('Mismatched parameter types passed to: "This is a %s"')
      }
    )

    test(
      'should throw an error if passed a string but expected a number',
      () => {
        expect(
          parser.printf.bind(null, dictionary.printfNumberTest, ['one'])
        ).toThrowError('Mismatched parameter types passed to: "1 + 1 = %d"')
      }
    )

    test(
      'should throw an error when string has mix of indexed/non-indexed placeholders',
      () => {
        expect(
          parser.printf.bind(null, '%s %d, %s4 %d3', [1, 'fish', 2, 'fish'])
        ).toThrowError('Mix of indexed/non-indexed placeholders were used for: "%s %d, %s4 %d3"')
      }
    )
  })

  describe('mustache()', () => {
    test('should use a sibling prop to build the string', () => {
      expect(parser.mustache(dictionary, dictionary.mustacheTest)).toBe('This is a mustache test')
    })

    test('should handle mustaches in nested properties', () => {
      expect(
        parser.mustache(dictionary, dictionary.nestedMustacheTest)
      ).toBe('this is a nested mustache test')
    })
  })

  describe('mixin()', () => {
    test('should return a modified string done by a mixin function', () => {
      expect(parser.mixin(dictionary, dictionary.mixinTest)).toBe('This is a Test')
    })

    test(
      'should return a modified string done by a mixin function for a nested property',
      () => {
        expect(parser.mixin(dictionary, dictionary.nested.mixinTest)).toBe('this is a nested mixin Test')
      }
    )
  })

  describe('decode()', () => {
    test('should decode strictly valid HTML entities', () => {
      expect(parser.decode('&comma; &amp; &laquo; &euro;')).toBe(', & « €')
    })
  })
})
