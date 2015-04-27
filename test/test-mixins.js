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

var builder   = require('../lib/builder');
var mixins    = require('../lib/mixins');

var dictionary;

describe('mixins', function () {

  before(function () {
    dictionary = builder.build([base, locale, client]);
  });

  describe('capitalize()', function () {
    expect(mixins.capitalize('test')).to.equal('Test');
  });

  describe('pluralize()', function () {
    expect(mixins.pluralize(0)).to.equal('none');
    expect(mixins.pluralize(1)).to.equal('singular');
    expect(mixins.pluralize(2)).to.equal('plural');
    expect(mixins.pluralize.bind(null, 'bad-input')).to.throw('Expected value to be a number, but got string');
  });

  describe('currency()', function () {
    expect(mixins.currency(0.01, ',', '.')).to.equal('0.01');
    expect(mixins.currency(0.10, ',', '.')).to.equal('0.10');
    expect(mixins.currency(1, ',', '.')).to.equal('1.00');
    expect(mixins.currency(10, ',', '.')).to.equal('10.00');
    expect(mixins.currency(100, ',', '.')).to.equal('100.00');
    expect(mixins.currency(1000, ',', '.')).to.equal('1,000.00');
    expect(mixins.currency(10000, ',', '.')).to.equal('10,000.00');
    expect(mixins.currency(100000, ',', '.')).to.equal('100,000.00');
    expect(mixins.currency(1000000, ',', '.')).to.equal('1,000,000.00');

    expect(mixins.currency(0.01, ' ', ',')).to.equal('0,01');
    expect(mixins.currency(0.10, ' ', ',')).to.equal('0,10');
    expect(mixins.currency(1, ' ', ',')).to.equal('1,00');
    expect(mixins.currency(10, ' ', ',')).to.equal('10,00');
    expect(mixins.currency(100, ' ', ',')).to.equal('100,00');
    expect(mixins.currency(1000, ' ', ',')).to.equal('1 000,00');
    expect(mixins.currency(10000, ' ', ',')).to.equal('10 000,00');
    expect(mixins.currency(100000, ' ', ',')).to.equal('100 000,00');
    expect(mixins.currency(1000000, ' ', ',')).to.equal('1 000 000,00');

    expect(mixins.currency.bind(null, 'invalid', ',', '.')).to.throw('Expected value to be a number, but got string');
  });
});
