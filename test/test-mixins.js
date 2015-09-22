'use strict';

var chai = require('chai');
var expect = chai.expect;

// test files
var mixins = require('../lib/mixins');

describe('mixins', function () {
  describe('capitalize()', function () {
    it('should capitalize the first provided string', function () {
      expect(mixins.capitalize('test')).to.equal('Test');
    });
  });

  describe('pluralize()', function () {
    it('should return plural state based on provided value', function () {
      expect(mixins.pluralize(0)).to.equal('none');
      expect(mixins.pluralize(1)).to.equal('singular');
      expect(mixins.pluralize(2)).to.equal('plural');
    });
    it('should throw an error when passed a bad value', function () {
      expect(mixins.pluralize.bind(null, 'bad-input')).to.throw('Expected value to be a number, but got string');
    });
  });

  describe('currency()', function () {
    it('should parse values into currency format', function () {
      expect(mixins.currency(0.01, ',', '.')).to.equal('0.01');
      expect(mixins.currency(0.10, ',', '.')).to.equal('0.10');
      expect(mixins.currency(0.5, ',', '.')).to.equal('0.50');
      expect(mixins.currency(0.5, '&coma;', '&period;')).to.equal('0&period;50');
      expect(mixins.currency(1050.5, '&comma;', '&period;')).to.equal('1&comma;050&period;50');
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
    });

    it('should throw an error when passed a non-Number', function () {
      expect(mixins.currency.bind(null, 'invalid', ',', '.')).to.throw('Expected value to be a number, but got string');
    });
  });
});
