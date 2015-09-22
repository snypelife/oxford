'use strict';

var format = require('util').format;

exports.capitalize = function capitalize(text) {
  text = text.trim();
  return text.slice(0, 1).toUpperCase() + text.slice(1);
};

exports.pluralize = function pluralize(value) {
  if (isNaN(Math.abs(value))) {
    throw new TypeError(
      format('Expected value to be a number, but got %s', typeof value)
    );
  }

  value = Math.abs(value);

  return value === 0 ?
         'none' :
         value === 1 ?
         'singular' :
         'plural';
};

function pad(n) {
  if (!n) { return '00'; }
  if (n.length === 1) { return n + '0'; }
  return n;
}

exports.currency = function currency(value, thousandSeparator, decimalSymbol) {
  if (isNaN(Math.abs(value))) {
    throw new TypeError(
      format('Expected value to be a number, but got %s', typeof value)
    );
  }

  value = value.toString();

  var cents = decimalSymbol + pad(value.split('.')[1]);
  var dollars = value.split('.')[0].split('').reverse().map(function (v, i, array) {
    if ((i + 1) % 3 === 0 && (i + 1) !== array.length) {
      return thousandSeparator + v;
    }
    return v;
  }).reverse().join('');

  return dollars + cents;
};
