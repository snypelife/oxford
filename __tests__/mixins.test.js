'use strict'

// test files
var mixins = require('../lib/mixins')

describe('mixins', () => {
  describe('capitalize()', () => {
    test('should capitalize the first provided string', () => {
      expect(mixins.capitalize('test')).toBe('Test')
    })
  })

  describe('pluralize()', () => {
    test('should return plural state based on provided value', () => {
      expect(mixins.pluralize(0)).toBe('none')
      expect(mixins.pluralize(1)).toBe('singular')
      expect(mixins.pluralize(2)).toBe('plural')
    })
    test('should throw an error when passed a bad value', () => {
      expect(mixins.pluralize.bind(null, 'bad-input')).toThrowError('Expected value to be a number, but got string')
    })
  })

  describe('currency()', () => {
    test('should parse values into currency format', () => {
      expect(mixins.currency(0.01, ',', '.')).toBe('0.01')
      expect(mixins.currency(0.1, ',', '.')).toBe('0.10')
      expect(mixins.currency(0.5, ',', '.')).toBe('0.50')
      expect(mixins.currency(0.5, '&coma;', '&period;')).toBe('0&period;50')
      expect(mixins.currency(1050.5, '&comma;', '&period;')).toBe('1&comma;050&period;50')
      expect(mixins.currency(1, ',', '.')).toBe('1.00')
      expect(mixins.currency(10, ',', '.')).toBe('10.00')
      expect(mixins.currency(100, ',', '.')).toBe('100.00')
      expect(mixins.currency(1000, ',', '.')).toBe('1,000.00')
      expect(mixins.currency(10000, ',', '.')).toBe('10,000.00')
      expect(mixins.currency(100000, ',', '.')).toBe('100,000.00')
      expect(mixins.currency(1000000, ',', '.')).toBe('1,000,000.00')

      expect(mixins.currency(0.01, ' ', ',')).toBe('0,01')
      expect(mixins.currency(0.1, ' ', ',')).toBe('0,10')
      expect(mixins.currency(1, ' ', ',')).toBe('1,00')
      expect(mixins.currency(10, ' ', ',')).toBe('10,00')
      expect(mixins.currency(100, ' ', ',')).toBe('100,00')
      expect(mixins.currency(1000, ' ', ',')).toBe('1 000,00')
      expect(mixins.currency(10000, ' ', ',')).toBe('10 000,00')
      expect(mixins.currency(100000, ' ', ',')).toBe('100 000,00')
      expect(mixins.currency(1000000, ' ', ',')).toBe('1 000 000,00')
    })

    test('should throw an error when passed a non-Number', () => {
      expect(mixins.currency.bind(null, 'invalid', ',', '.')).toThrowError('Expected value to be a number, but got string')
    })
  })
})
