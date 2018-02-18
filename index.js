'use strict'

var _ = require('lodash')
var builder = require('./lib/builder')
var get = require('./lib/get')

function buildChild (dictionary, childPath) {
  var child = dictionary

  if (childPath) {
    child = _.get(child, childPath, {})
  }

  return {
    dictionary: child,
    get: get.bind(oxford, child),
    child: buildChild.bind(null, child)
  }
}

function oxford (dict) {
  function runPlugin (func) {
    dict = func(_.cloneDeep(dict))
  }

  module.exports.pluginHooks.prebuild.forEach(runPlugin)

  var dictionary = builder.build(dict)

  module.exports.pluginHooks.postbuild.forEach(runPlugin)

  return buildChild(dictionary)
}

module.exports = oxford

module.exports.registerPlugin = require('./lib/register-plugin.js')(oxford)
