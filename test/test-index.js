'use strict'

var chai = require('chai')
var expect = chai.expect

// test files
var base = require('./samples/base-test.json')
var locale = require('./samples/locale-test.json')
var client = require('./samples/client-test.json')

var oxford = require('../index.js')

var ox

describe('index', function () {
  before(function () {
    ox = oxford([base, locale, client])
  })

  it('should exist', function () {
    expect(ox).to.exist
  })

  it('should expose the get() method', function () {
    expect(ox.get).to.exist
    expect(ox.get).to.be.a('Function')
  })
})
