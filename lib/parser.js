'use strict';

var util = require('util');
var he = require('he');
var t = require('traverse');

var mixins = require('./mixins');

var regex = {
  printf: /\%([sd](\d)?)/g,
  mustache: /(\{\{\s*(.[^\{\}]+)\s*\}\})/g,
  mixin: /\#([A-z0-9\-\_]+)\(([^\(\)]+)\)/g,
  htmlentity: /\&.+\;?/g
};

function parse(dictionary, string, args) {
  var result = string;
  var inProgress = true;
  var placeholderMatches = result.match(regex.printf) || [];
  var mixinMatches = result.match(regex.mixin) || [];
  var htmlentityMatches = result.match(regex.htmlentity) || [];

  if (!args || !args.length) {
    if (placeholderMatches && placeholderMatches.length) {
      throw new ReferenceError('Missing parameters for string `' + string + '`');
    }
    if (
        (!mixinMatches || !mixinMatches.length) &&
        (!htmlentityMatches || !htmlentityMatches.length)
       ) {
      return result;
    }
  }

  do {
    result = printf(result, args);
    result = mixin(dictionary, result);

    // there is no else, this just loops
    /* istanbul ignore else */
    if (
        !regex.printf.test(result) &&
        !regex.mixin.test(result)
        ) {
      inProgress = false;
    }
  } while (inProgress);

  return result;
}

function hasMismatchingNumberOfArgsAndPlaceholders(args, placeholders) {
  return args.length < placeholders.length;
}

function hasInvalidArgType(args) {
  var validTypes = ['string', 'number'];
  function map(arg) { return typeof arg; }
  function filter(el) { return validTypes.indexOf(el) < 0; }

  return args.map(map).filter(filter).length > 0;
}

function hasMismatchingTypesOfArgsAndPlaceholders(args, placeholders) {
  var types = { 'string': '%s', 'number': '%d'};
  var argTypes = args.map(function (arg) {return typeof arg; });
  var mismatches = placeholders.map(function (plc, i) {
    return plc.indexOf(types[argTypes[i]]) < 0;
  }).filter(function filterFalsey(val) {
    return val;
  });

  return mismatches.length > 0;
}

function hasIndexedPlaceholders(placeholders) {
  var hasIndexes = function (val) {
    return !val.match(/\d/);
  };
  return !placeholders.every(hasIndexes);
}

function hasMixOfIndexedAndNonIndexedPlaceholders(placeholders) {
  var hasIndexes = hasIndexedPlaceholders(placeholders);
  var hasMix = function (val) {
    return !hasIndexes || !!val.match(/\d/);
  };
  return !placeholders.every(hasMix);
}
function rearrangePrintfArgs(val) {
  return this[parseInt(val.match(/\d/)[0], 10) - 1];
}

function stripPrintfIndexes(match, p1, p2) {
  return '%' + p1.replace(p2, '');
}

function decode(string) {
  return he.decode(string, {'strict': true});
}

function printf(string, args) {
  args = args || [];
  var placeholders = string.match(regex.printf) || [];
  var errMessage;

  if (hasMismatchingNumberOfArgsAndPlaceholders(args, placeholders)) {
    errMessage = util.format('Mismatched number of parameters passed to: "%s"', string);
    throw new ReferenceError(errMessage);
  }

  if (hasInvalidArgType(args)) {
    errMessage = util.format('Invalid args were passed to: "%s"', string);
    throw new TypeError(errMessage);
  }

  if (hasMixOfIndexedAndNonIndexedPlaceholders(placeholders)) {
    errMessage = util.format('Mix of indexed/non-indexed placeholders were used for: "%s"', string);
    throw new ReferenceError(errMessage);
  }

  if (hasIndexedPlaceholders(placeholders)) {
    args = placeholders.map(rearrangePrintfArgs, args);
    string = string.replace(regex.printf, stripPrintfIndexes);
  }

  if (hasMismatchingTypesOfArgsAndPlaceholders(args, placeholders)) {
    errMessage = util.format('Mismatched parameter types passed to: "%s"', string);
    throw new TypeError(errMessage);
  }

  if (args.length > placeholders) {
    args = args.slice(0, (placeholders.length - 1));
  }

  string = util.format.apply(null, [].concat([string], args));

  // placeholders.forEach(function (placeholder, i) {
  //   var type = typeof args[i];

  //   if (type !== 'string' && type !== 'number') {
  //     throw new Error('Invalid param type: ' + type);
  //   }

  //   if (
  //       (placeholder === '%s' && type !== 'string') ||
  //       (placeholder === '%d' && type !== 'number')
  //       ) {
  //     throw new TypeError('Mismatched parameter type. Expected a ' +
  //                         (placeholder === '%s' ? 'string' : 'number') +
  //                         ' but got ' + type);
  //   }

  //   string = string.replace(placeholder, args[i]);
  // });

  return string;
}

function mixin(dictionary, str) {
  dictionary.mixins = mixins;

  return str.replace(regex.mixin, function (match, func, input) {
    var mixinArgs = input.split(',').map(function (mixinArg) {
      return mixinArg.trim();
    });

    return dictionary.mixins[func].apply(null, mixinArgs);
  });
}

function mustache(dictionary, str) {
  return str.replace(regex.mustache, function (match, mus, attribute) {
    attribute = attribute.trim();
    return t(dictionary).get(attribute.split('.'));
  });
}

function traverse(dictionary, path, args) {
  if (!Array.isArray(path)) {
    path = path.split('.');
  }

  var level = dictionary;
  var result;

  do {
    // if there's a $key, then some fancy footwork
    // needs to be performed such as invoking a mixin.
    // This kind of thing comes at the end of a traversal,
    // but has additional paths that need to be parsed.
    // E.g. dynamically getting the correct plurality of a string
    var nextLevel = path.shift().trim();

    if (level[nextLevel] && level[nextLevel].$key) {
      level = level[nextLevel];
      // TODO: cleanup this array of array of args for nested complex routes
      nextLevel = parse(dictionary, level.$key, args);
      path.unshift(nextLevel);
      continue;
    }

    level = level[nextLevel];

    // somethin' don't exist
    // better tell somebody
    if (!level) {
      throw new ReferenceError('`' + nextLevel + '` does not exist in this path context');
    }

    // end of the line folks
    if (!path.length) {
      result = level;
    }
  } while (path.length);

  return result;
}

exports.regex = regex;
exports.parse = parse;
exports.printf = printf;
exports.mixin = mixin;
exports.mustache = mustache;
exports.decode = decode;
exports.traverse = traverse;
