'use strict'

var $f = require('util').format
var _ = require('lodash')

// test files
var base = require('./samples/base-test.json')
var locale = require('./samples/locale-test.json')
var client = require('./samples/client-test.json')

var oxford = require('../index.js')

var pluginHooks = ['prebuild', 'postbuild', 'preget', 'postget', 'static']

function cleanOxford () {
  // remove static plugins
  _.functions(oxford).forEach(function (name) {
    if (name !== 'registerPlugin') {
      delete oxford[name]
    }
  })

  // remove pre and post hook plugins
  Object.keys(oxford.pluginHooks).forEach(function (key) {
    if (_.isArray(oxford.pluginHooks[key])) oxford.pluginHooks[key] = []
    else delete oxford.pluginHooks[key]
  })
}

function pluginFactory (hookName, pluginName, pluginMethod) {
  return oxford.registerPlugin.bind(null, {
    hook: hookName,
    name: pluginName,
    method: pluginMethod
  })
}

describe('registerPlugin', () => {
  beforeEach(() => {
    oxford([base, locale, client])
  })

  afterEach(cleanOxford)

  test('should be a static method', () => {
    expect(oxford.registerPlugin).toBeDefined()
    expect(typeof oxford.registerPlugin).toBe('function')
  })

  test('should throw if missing option parameter', () => {
    expect(oxford.registerPlugin).toThrowError('options parameter is required.')
  })

  test('should throw if missing a hook name', () => {
    expect(pluginFactory()).toThrowError('hook name must be provided.')
  })

  test('should throw if hook name is not a string', () => {
    expect(pluginFactory(1)).toThrowError('hook name must be a string.')
  })

  test('should throw if given an invalid hook name', () => {
    expect(pluginFactory('invalidHook')).toThrowError($f('hook must be one of the following: %s', pluginHooks.join(', ')))
  })

  test('should throw if missing plugin name', () => {
    expect(pluginFactory('preget')).toThrowError('a valid plugin name is required.')
  })

  test('should throw if plugin name is not a string', () => {
    expect(pluginFactory('preget', 1)).toThrowError('plugin name must be a string.')
  })

  test('should throw if missing plugin method', () => {
    expect(pluginFactory('preget', 'pluginName')).toThrowError('a valid plugin method is required.')
  })

  test('should throw if plugin method is not a function', () => {
    expect(pluginFactory('preget', 'pluginName', 1)).toThrowError('plugin method must be a function.')
  })

  pluginHooks.forEach(function (hook) {
    test(
      $f('should register a %s plugin method without error', hook),
      () => {
        expect(pluginFactory(hook, 'test', function () {})).not.toThrowError(Error)
      }
    )

    test(
      $f('should register a %s plugin method when format is hyphenated', hook),
      () => {
        hook = hook.replace('pre', 'pre-').replace('post', 'post-')
        expect(pluginFactory(hook, 'test', function () {})).not.toThrowError(Error)
      }
    )

    test(
      $f('should register a %s plugin method when format is underscored', hook),
      () => {
        hook = hook.replace('pre', 'pre_').replace('post', 'post_')
        expect(pluginFactory(hook, 'test', function () {})).not.toThrowError(Error)
      }
    )

    test($f(
      'should register a %s plugin method when format is space separated',
      hook
    ), () => {
      hook = hook.replace('pre', 'pre ').replace('post', 'post ')
      expect(pluginFactory(hook, 'test', function () {})).not.toThrowError(Error)
    })
  })

  test('should append to hook array', () => {
    pluginFactory('prebuild', 'test1', function () {})()
    expect(oxford.pluginHooks.prebuild).toBeDefined()
    expect(Array.isArray(oxford.pluginHooks.prebuild)).toBe(true)
    expect(oxford.pluginHooks.prebuild).toHaveLength(1)
    pluginFactory('prebuild', 'test2', function () {})()
    expect(oxford.pluginHooks.prebuild).toBeDefined()
    expect(Array.isArray(oxford.pluginHooks.prebuild)).toBe(true)
    expect(oxford.pluginHooks.prebuild).toHaveLength(2)
  })

  describe('Static', () => {
    test('should register the plugin method', () => {
      pluginFactory('static', 'staticPlugin', function () {
        expect(typeof this).toBe('function')
        return 'foo'
      })()
      expect(oxford.staticPlugin).toBeDefined()
      expect(typeof oxford.staticPlugin).toBe('function')
      expect(oxford.staticPlugin()).toEqual('foo')
    })

    test('should throw if the plugin is already defined', () => {
      var dupePlugin = pluginFactory('static', 'staticPlugin', function () {})

      // first invocation
      pluginFactory('static', 'staticPlugin', function () {})()

      // second dupe call + test
      expect(dupePlugin).toThrowError('plugin staticPlugin is already defined.')
    })
  })

  ;['Pre-build', 'Post-build'].forEach(function (hook) {
    describe(hook, () => {
      hook = hook.toLowerCase().replace('-', '')
      test('should register the plugin method', () => {
        pluginFactory(hook, 'plugin', function () {
          return 'foo'
        })()
        expect(oxford.pluginHooks[hook]).toBeDefined()
        expect(Array.isArray(oxford.pluginHooks[hook])).toBe(true)
        expect(oxford.pluginHooks[hook]).toHaveLength(1)
        expect(oxford.pluginHooks[hook][0]()).toEqual('foo')
      })

      test(
        $f('should pass the %s dictionary object to the plugin method', hook),
        () => {
          var spy = jest.fn(function (dict) {
            return dict
          })
          var data = { a: 'a', b: 'b', c: 'c' }
          pluginFactory(hook, 'test', spy)()
          oxford(data)
          expect(spy).toHaveBeenCalledWith(data)
        }
      )

      test($f(
        'should waterfall the %s dictionary object thru to each plugin method',
        hook
      ), () => {
        var spy1 = jest.fn(function (dict) {
          dict.x = 'x'
          return dict
        })
        var spy2 = jest.fn(function (dict) {
          dict.y = 'y'
          return dict
        })
        var data = { a: 'a', b: 'b', c: 'c' }
        pluginFactory(hook, 'test', spy1)()
        pluginFactory(hook, 'test2', spy2)()
        oxford(data)
        expect(spy1).toHaveBeenCalledWith({
          a: 'a',
          b: 'b',
          c: 'c',
          x: 'x'
        })
        expect(spy2).toHaveBeenCalledWith({
          a: 'a',
          b: 'b',
          c: 'c',
          x: 'x',
          y: 'y'
        })
      })
    })
  })

  ;['Pre-get', 'Post-get'].forEach(function (hook) {
    describe(hook, () => {
      hook = hook.toLowerCase().replace('-', '')
      test('should register the plugin method', () => {
        pluginFactory(hook, 'plugin', function () {
          return 'foo'
        })()
        expect(oxford.pluginHooks[hook]).toBeDefined()
        expect(Array.isArray(oxford.pluginHooks[hook])).toBe(true)
        expect(oxford.pluginHooks[hook]).toHaveLength(1)
        expect(oxford.pluginHooks[hook][0]()).toEqual('foo')
      })

      test(
        $f('should pass the %s dictionary object to the plugin method', hook),
        () => {
          var spy = jest.fn(function (string) {
            return string.toUpperCase()
          })

          pluginFactory(hook, 'test', spy)()

          var data = { a: 'a', b: 'b', c: 'c' }
          var ox = oxford(data)
          var string = ox.get('a')

          expect(spy).toHaveBeenCalledWith(data.a)
          expect(string).toBe(data.a.toUpperCase())
        }
      )

      test($f(
        'should waterfall the %s dictionary object thru to each plugin method',
        hook
      ), () => {
        var spy1 = jest.fn(function (string) {
          return string.toUpperCase()
        })
        var spy2 = jest.fn(function (string) {
          return _.repeat(string, 3)
        })

        pluginFactory(hook, 'test', spy1)()
        pluginFactory(hook, 'test2', spy2)()

        var data = { a: 'a', b: 'b', c: 'c' }
        var ox = oxford(data)
        var string = ox.get('a')

        expect(spy1).toHaveBeenCalledWith(data.a)
        expect(spy2).toHaveBeenCalledWith(data.a.toUpperCase())
        expect(string).toBe(_.repeat(data.a, 3).toUpperCase())
      })
    })
  })

  test(
    'should register plugins from a oxford-plugin module using shorthand',
    () => {
      var food = oxford({
        food: 'donuts'
      })
      oxford.registerPlugin('test')
      expect(food.get('food')).toBe('Mmm, donuts')
    }
  )

  test(
    'should register plugins from a oxford-plugin module using full name',
    () => {
      var food = oxford({
        food: 'donuts'
      })
      oxford.registerPlugin('oxford-plugin-test')
      expect(food.get('food')).toBe('Mmm, donuts')
    }
  )

  test(
    'should register plugins from a non oxford-plugin style module',
    () => {
      var food = oxford({
        food: 'donuts'
      })
      // should not used like this, but for test this should be relative to the lib folder
      oxford.registerPlugin('../__tests__/oxford-plugin-local-test')

      expect(food.get('food')).toBe('Mmm, donuts')
    }
  )

  test(
    'should error if the plugin cannot be registered (via string)',
    () => {
      expect(
        oxford.registerPlugin.bind(null, 'testDoesNotExist')
      ).toThrowError('testDoesNotExist')
    }
  )
})
