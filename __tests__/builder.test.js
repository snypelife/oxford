'use strict'

// private
var builder = require('../lib/builder')

describe('builder', () => {
  describe('build()', () => {
    test('should build a single level dictionary', () => {
      var test = {
        a: '1',
        b: '2',
        c: '3'
      }

      expect(builder.build(test)).toEqual(test)
    })

    test(
      'should build a multi level dictionary (and covert numbers to strings)',
      () => {
        var test = [
          {
            a: 1,
            b: 2,
            c: 3
          },
          {
            c: 4,
            d: 5,
            e: 6
          },
          {
            x: 7,
            y: 8,
            z: 9
          }
        ]

        expect(builder.build(test)).toEqual({
          a: '1',
          b: '2',
          c: '4',
          d: '5',
          e: '6',
          x: '7',
          y: '8',
          z: '9'
        })
      }
    )

    test(
      'should throw an error if passed anything other than arrays and objects',
      () => {
        expect(builder.build.bind(null, 1)).toThrowError('`build` method only accepts arrays and objects as parameters')
      }
    )

    test('should resolve references on build', () => {
      var test = {
        ref: 'abcd',
        data: {
          a: '{{ref}}',
          b: 'this is a {{ref}}'
        }
      }
      expect(builder.build(test)).toEqual({
        ref: 'abcd',
        data: {
          a: 'abcd',
          b: 'this is a abcd'
        }
      })
    })

    test('should resolve nested references on build', () => {
      var test = {
        ref: 'abcd',
        data: {
          a: '{{ref}} {{data.b}}',
          b: 'this is a {{ref}}'
        }
      }
      expect(builder.build(test)).toEqual({
        ref: 'abcd',
        data: {
          a: 'abcd this is a abcd',
          b: 'this is a abcd'
        }
      })
    })
  })

  describe('merge()', () => {
    test('should merge two objects together', () => {
      var testA = {
        a: 1,
        b: 2,
        c: 3
      }
      var testB = {
        c: 4,
        d: 5,
        e: 6
      }

      expect(builder.merge(testA, testB)).toEqual({
        a: 1,
        b: 2,
        c: 4,
        d: 5,
        e: 6
      })
    })

    test(
      'should replace array properties of two objects merged together',
      () => {
        var testA = {
          a: 1,
          b: 2,
          c: ['v', 'w', 'x', 'y', 'z']
        }
        var testB = {
          c: ['a', 'b', 'c'],
          d: 5,
          e: 6
        }

        expect(builder.merge(testA, testB)).toEqual({
          a: 1,
          b: 2,
          c: ['a', 'b', 'c'],
          d: 5,
          e: 6
        })
      }
    )
  })
})
