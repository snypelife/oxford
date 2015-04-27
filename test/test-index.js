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

var oxford    = require('../');

var ox;

describe('index', function () {

  before(function () {
    ox = oxford([base, locale, client]);
  });

  it('should exist', function () {
    expect(ox).to.exist;
  });

  it('should expose the get() method', function () {
    expect(ox.get).to.exist;
    expect(ox.get).to.be.a('Function');
  });
});
