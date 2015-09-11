'use strict';

var expect = require('chai').expect;

var oxford = require('../');

// test file
var base = require('./child-test.json');

describe('child', function () {

  var ox;

  it('should default to full dictionary', function () {
    ox = oxford([base]).child('');
    expect(ox.get('test')).to.eq('test');
  });

  it('should accept a single element child path (string)', function () {
    ox = oxford([base]).child('childTest');
    expect(ox.get('subChildOne.content')).to.eql('this is test content');
  });

  it('should accept a single element child path (array)', function () {
    ox = oxford([base]).child(['childTest']);
    expect(ox.get('subChildOne.content')).to.eql('this is test content');
  });

  it('should accept multi-level path as child path (string)', function () {
    ox = oxford([base]).child('childTest.subChildOne');
    expect(ox.get('content')).to.eql('this is test content');
  });

  it('should accept multi-level path as child path (array)', function () {
    ox = oxford([base]).child(['childTest', 'subChildOne']);
    expect(ox.get('content')).to.eql('this is test content');
  });

  it('should be chainable, but not mutating', function () {
    ox = oxford([base]);
    var childOx = ox.child('childTest.subChildOne');

    expect(childOx.get.bind(null, 'childTest.subChildOne.content'))
      .to.throw('`childTest.subChildOne.content` does not exist in this context');

    expect(childOx.get('content')).to.eq('this is test content');

    expect(ox.get.bind(null, 'content'))
      .to.throw('`content` does not exist in string library');

    expect(ox.get('childTest.subChildOne.content')).to.eq('this is test content');

  });

  it('should handle references and variables in children', function () {
    ox = oxford([base]).child('childTest.subChildTwo');

    var strings = {
      title: ox.get('content.title', 'homer simpson'),
      body: ox.get('content.body')
    };

    var expected = {
      title: 'this is a test title for homer simpson',
      body: 'this is a test body'
    };

    expect(strings).to.eql(expected);
  });

  it('should handle more complex references/variables', function () {
    ox = oxford([base]).child('childTest.subChildTwo.subSubChild');

    var strings = {
      title: ox.get('content.title', 'hello', 39, 'homer simpson'),
      body: ox.get('content.body')
    };

    var expected = {
      title: 'subsub Hello 39 this is a test title for homer simpson',
      body: 'subsub this is a test body'
    };

    expect(strings).to.eql(expected);
  });


  it('should return an object if traversal ends on an object', function () {
    ox = oxford([base]).child('childTest');
    expect(ox.get('mapReference.test')).to.equal('abc');
  });

  it('should handle nested paths with the same name', function () {
    ox = oxford([base]).child('sub');
    expect(ox.get('sub.nested')).to.eq('nested content');
  });

  it('should handle nested paths with the same name chaining', function () {
    ox = oxford([base]).child('sub').child('sub');
    expect(ox.get('nested')).to.eq('nested content');
  });

  it('should handle bad child paths', function () {
    ox = oxford([base]).child('childTest.subChildTwo.subSubChild.badbad');
    expect(ox.dictionary).to.eql({});
  });

  it('should handle bad child paths - more than one level of bad', function () {
    ox = oxford([base]).child('moe.moe.moe.moe.moe');
    expect(ox.dictionary).to.eql({});
  });

});
