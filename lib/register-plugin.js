'use strict';

var _ = require('lodash');

var validPluginHooks = ['prebuild', 'postbuild', 'preget', 'postget', 'static'];

module.exports = function (context) {
  context.pluginHooks = {};

  validPluginHooks.forEach(function (hook) {
    if (hook === 'static') return;
    context.pluginHooks[hook] = [];
  });

  return function (options) {
    var hook, name, method;

    if (!options) throw new Error('options parameter is required.')
    if (!options.hook) throw new Error('hook name must be provided.');
    if (!_.isString(options.hook)) throw new Error('hook name must be a string.');
    hook = options.hook.toLowerCase().replace(/-|_|\s/g, '');

    if (!_.includes(validPluginHooks, hook)) throw new Error('hook must be one of the following: ' + validPluginHooks.join(', '));

    if (!options.name) throw new Error('a valid plugin name is required.');
    if (!_.isString(options.name)) throw new Error('plugin name must be a string.');
    name = options.name;

    if (!options.method) throw new Error('a valid plugin method is required.');
    if (!_.isFunction(options.method)) throw new Error('plugin method must be a function.');
    method = options.method.bind(context);

    if (hook === 'static') {
      if (!_.isUndefined(context[name]))
        throw new Error('plugin '+ name + ' is already defined.');

      return context[name] = method;
    }

    context.pluginHooks[hook].push(method);
  };
};
