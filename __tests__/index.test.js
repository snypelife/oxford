'use strict'

// test files
var base = require('./samples/base-test.json')
var locale = require('./samples/locale-test.json')
var client = require('./samples/client-test.json')

var oxford = require('../index.js')

var ox

describe('index', () => {
  beforeAll(function () {
    ox = oxford([base, locale, client])
  })

  test('should exist', () => {
    expect(ox).toBeDefined()
  })

  test('should expose the get() method', () => {
    expect(ox.get).toBeDefined()
    expect(typeof ox.get).toBe('function')
  })
})
