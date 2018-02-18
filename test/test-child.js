'use strict'

var oxford = require('../')

// test file
var base = require('./samples/child-test.json')

describe('child', () => {
  var ox

  test('should default to full dictionary', () => {
    ox = oxford([base]).child('')
    expect(ox.get('test')).toEqual('test')
  })

  test('should accept a single element child path (string)', () => {
    ox = oxford([base]).child('childTest')
    expect(ox.get('subChildOne.content')).toEqual('this is test content')
  })

  test('should accept a single element child path (array)', () => {
    ox = oxford([base]).child(['childTest'])
    expect(ox.get('subChildOne.content')).toEqual('this is test content')
  })

  test('should accept multi-level path as child path (string)', () => {
    ox = oxford([base]).child('childTest.subChildOne')
    expect(ox.get('content')).toEqual('this is test content')
  })

  test('should accept multi-level path as child path (array)', () => {
    ox = oxford([base]).child(['childTest', 'subChildOne'])
    expect(ox.get('content')).toEqual('this is test content')
  })

  test('should be chainable, but not mutating', () => {
    ox = oxford([base])
    var childOx = ox.child('childTest.subChildOne')

    expect(childOx.get.bind(null, 'childTest.subChildOne.content')).toThrowError('`childTest.subChildOne.content` does not exist in this context')

    expect(childOx.get('content')).toEqual('this is test content')

    expect(ox.get.bind(null, 'content')).toThrowError('`content` does not exist in string library')

    expect(ox.get('childTest.subChildOne.content')).toEqual(
      'this is test content'
    )
  })

  test('should handle references and variables in children', () => {
    ox = oxford([base]).child('childTest.subChildTwo')

    var strings = {
      title: ox.get('content.title', 'homer simpson'),
      body: ox.get('content.body')
    }

    var expected = {
      title: 'this is a test title for homer simpson',
      body: 'this is a test body'
    }

    expect(strings).toEqual(expected)
  })

  test('should handle more complex references/variables', () => {
    ox = oxford([base]).child('childTest.subChildTwo.subSubChild')

    var strings = {
      title: ox.get('content.title', 'hello', 39, 'homer simpson'),
      body: ox.get('content.body')
    }

    var expected = {
      title: 'subsub Hello 39 this is a test title for homer simpson',
      body: 'subsub this is a test body'
    }

    expect(strings).toEqual(expected)
  })

  test('should return an object if traversal ends on an object', () => {
    ox = oxford([base]).child('childTest')
    expect(ox.get('mapReference.test')).toBe('abc')
  })

  test('should handle nested paths with the same name', () => {
    ox = oxford([base]).child('sub')
    expect(ox.get('sub.nested')).toEqual('nested content')
  })

  test('should handle nested paths with the same name chaining', () => {
    ox = oxford([base])
      .child('sub')
      .child('sub')
    expect(ox.get('nested')).toEqual('nested content')
  })

  test('should handle bad child paths', () => {
    ox = oxford([base]).child('childTest.subChildTwo.subSubChild.badbad')
    expect(ox.dictionary).toEqual({})
  })

  test(
    'should handle bad child paths - more than one level of bad',
    () => {
      ox = oxford([base]).child('moe.moe.moe.moe.moe')
      expect(ox.dictionary).toEqual({})
    }
  )
})
