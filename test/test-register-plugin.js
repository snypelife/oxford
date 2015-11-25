'use strict';

var $f = require('util').format;
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');
var sinon = require('sinon');
chai.use(require('sinon-chai'));

// test files
var base = require('./samples/base-test.json');
var locale = require('./samples/locale-test.json');
var client = require('./samples/client-test.json');

var oxford = require('../index.js');

var ox;

var pluginHooks = ['prebuild', 'postbuild', 'preget', 'postget', 'static'];

function cleanOxford() {
  // remove static plugins
  _.functions(oxford).forEach(function (name) {
    if (name !== 'registerPlugin') {
      delete oxford[name];
    }
  });

  // remove pre and post hook plugins
  Object.keys(oxford.pluginHooks).forEach(function (key) {
    if (_.isArray(oxford.pluginHooks[key]))
      oxford.pluginHooks[key] = [];
    else
      delete oxford.pluginHooks[key];
  });
}

function pluginFactory(hookName, pluginName, pluginMethod) {
  return oxford.registerPlugin.bind(null, {
    hook: hookName,
    name: pluginName,
    method: pluginMethod
  });
}

describe('registerPlugin', function () {

  beforeEach(function () {
    ox = oxford([base, locale, client]);
  });

  afterEach(cleanOxford);

  it('should be a static method', function () {
    expect(oxford.registerPlugin).to.exist;
    expect(oxford.registerPlugin).to.be.a('function');
  });

  it('should throw if missing option parameter', function () {
    expect(oxford.registerPlugin).to.throw('options parameter is required.');
  });

  it('should throw if missing a hook name', function () {
    expect(pluginFactory()).to.throw('hook name must be provided.');
  });

  it('should throw if hook name is not a string', function () {
    expect(pluginFactory(1)).to.throw('hook name must be a string.');
  });

  it('should throw if given an invalid hook name', function () {
    expect(pluginFactory('invalidHook')).to.throw($f('hook must be one of the following: %s', pluginHooks.join(', ')));
  });

  it('should throw if missing plugin name', function () {
    expect(pluginFactory('preget')).to.throw('a valid plugin name is required.');
  });

  it('should throw if plugin name is not a string', function () {
    expect(pluginFactory('preget', 1)).to.throw('plugin name must be a string.');
  });

  it('should throw if missing plugin method', function () {
    expect(pluginFactory('preget', 'pluginName')).to.throw('a valid plugin method is required.');
  });

  it('should throw if plugin method is not a function', function () {
    expect(pluginFactory('preget', 'pluginName', 1)).to.throw('plugin method must be a function.');
  });

  pluginHooks.forEach(function (hook) {
    it($f('should register a %s plugin method without error', hook), function () {
      expect(pluginFactory(hook, 'test', function () {})).to.not.throw(Error);
    });

    it($f('should register a %s plugin method when format is hyphenated', hook), function () {
      hook = hook.replace('pre', 'pre-').replace('post', 'post-');
      expect(pluginFactory(hook, 'test', function () {})).to.not.throw(Error);
    });

    it($f('should register a %s plugin method when format is underscored', hook), function () {
      hook = hook.replace('pre', 'pre_').replace('post', 'post_');
      expect(pluginFactory(hook, 'test', function () {})).to.not.throw(Error);
    });

    it($f('should register a %s plugin method when format is space separated', hook), function () {
      hook = hook.replace('pre', 'pre ').replace('post', 'post ');
      expect(pluginFactory(hook, 'test', function () {})).to.not.throw(Error);
    });
  });

  it('should append to hook array', function () {
    pluginFactory('prebuild', 'test1', function () {})();
    expect(oxford.pluginHooks.prebuild).to.exist;
    expect(oxford.pluginHooks.prebuild).to.be.an('array');
    expect(oxford.pluginHooks.prebuild).to.have.length(1);
    pluginFactory('prebuild', 'test2', function () {})();
    expect(oxford.pluginHooks.prebuild).to.exist;
    expect(oxford.pluginHooks.prebuild).to.be.an('array');
    expect(oxford.pluginHooks.prebuild).to.have.length(2);
  });

  describe('Static', function () {
    it('should register the plugin method', function () {
      pluginFactory('static', 'staticPlugin', function () {
        expect(this).to.be.a('function');
        return 'foo';
      })();
      expect(oxford.staticPlugin).to.exist;
      expect(oxford.staticPlugin).to.be.a('function');
      expect('foo').to.satisfy(oxford.staticPlugin);
    });

    it('should throw if the plugin is already defined', function () {
      var dupePlugin = pluginFactory('static', 'staticPlugin', function () {});

      // first invocation
      pluginFactory('static', 'staticPlugin', function () {})();

      // second dupe call + test
      expect(dupePlugin).to.throw('plugin staticPlugin is already defined.');
    });
  });

  ['Pre-build', 'Post-build'].forEach(function (hook) {
    describe(hook, function () {
      hook = hook.toLowerCase().replace('-', '');
      it('should register the plugin method', function () {
        pluginFactory(hook, 'plugin', function () { return 'foo'; })();
        expect(oxford.pluginHooks[hook]).to.exist;
        expect(oxford.pluginHooks[hook]).to.be.an('array');
        expect(oxford.pluginHooks[hook]).to.have.length(1);
        expect('foo').to.satisfy(oxford.pluginHooks[hook][0]);
      });

      it($f('should pass the %s dictionary object to the plugin method', hook), function () {
        var spy = sinon.spy(function (dict) { return dict; });
        var data = { a: 'a', b: 'b',  c: 'c' };
        pluginFactory(hook, 'test', spy)();
        oxford(data);
        expect(spy).to.have.been.calledWith(data);
      });

      it($f('should waterfall the %s dictionary object thru to each plugin method', hook), function () {
        var spy1 = sinon.spy(function (dict) {
          dict.x = 'x';
          return dict;
        });
        var spy2 = sinon.spy(function (dict) {
          dict.y = 'y';
          return dict;
        });
        var data = { a: 'a', b: 'b',  c: 'c' };
        pluginFactory(hook, 'test', spy1)();
        pluginFactory(hook, 'test2', spy2)();
        oxford(data);
        expect(spy1).to.have.been.calledWith({ a: 'a', b: 'b',  c: 'c', x: 'x' });
        expect(spy2).to.have.been.calledWith({ a: 'a', b: 'b',  c: 'c', x: 'x', y: 'y' });
      });
    });
  });

  describe('Pre-get', function () {
    it('should register the plugin method', function () {
      pluginFactory('preget', 'pregetPlugin', function () { return 'foo'; })();
      expect(oxford.pluginHooks.preget).to.exist;
      expect(oxford.pluginHooks.preget).to.be.an('array');
      expect(oxford.pluginHooks.preget).to.have.length(1);
      expect('foo').to.satisfy(oxford.pluginHooks.preget[0]);
    });

    it('should pass the pre-built dictionary object to the plugin method', function () {
      var spy = sinon.spy(function (string) { return string.toUpperCase(); });

      pluginFactory('preget', 'test', spy)();

      var data = { a: 'a', b: 'b',  c: 'c' };
      var ox = oxford(data);
      var string = ox.get('a');

      expect(spy).to.have.been.calledWith(data.a);
      expect(string).to.equal(data.a.toUpperCase());
    });

    it('should waterfall the pre-built dictionary object thru to each plugin method', function () {
      var spy1 = sinon.spy(function (string) { return string.toUpperCase(); });
      var spy2 = sinon.spy(function (string) { return _.repeat(string, 3); });

      pluginFactory('preget', 'test', spy1)();
      pluginFactory('preget', 'test2', spy2)();

      var data = { a: 'a', b: 'b',  c: 'c' };
      var ox = oxford(data);
      var string = ox.get('a');

      expect(spy1).to.have.been.calledWith(data.a);
      expect(spy2).to.have.been.calledWith(data.a.toUpperCase());
      expect(string).to.equal(_.repeat(data.a, 3).toUpperCase());
    });
  });

});
