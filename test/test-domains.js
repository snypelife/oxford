'use strict';

var expect = require('chai').expect;

var oxford = require('../');

// test file
var base = require('./domain-test.json');

describe('domains', function () {

  var ox;

  it('should default to full domain', function () {
    ox = oxford([base], '');
    expect(oxford([base]).dictionary).to.eql(ox.dictionary);
  });

  it('should accept a single element domain path (string)', function () {
    ox = oxford([base], 'domainTest');
    var expected = oxford([base]).dictionary.domainTest;
    expect(ox.dictionary).to.eql(expected);
  });

  it('should accept a single element domain path (array)', function () {
    ox = oxford([base], ['domainTest']);
    var expected = oxford([base]).dictionary.domainTest;
    expect(ox.dictionary).to.eql(expected);
  });

  it('should accept multi-level path as domain (string)', function () {
    ox = oxford([base], 'domainTest.subDomainOne');
    var expected = {
      content: 'this is test content'
    };
    expect(ox.dictionary).to.eql(expected);
  });

  it('should accept multi-level path as domain (array)', function () {
    ox = oxford([base], ['domainTest', 'subDomainOne']);
    var expected = {
      content: 'this is test content'
    };
    expect(ox.dictionary).to.eql(expected);
  });

  it('should be chainable, but not mutating', function () {
    ox = oxford([base]);
    var domainOx = ox.domain('domainTest.subDomainOne');

    expect(domainOx.get.bind(null, 'domainTest.subDomainOne.content'))
      .to.throw('`domainTest` does not exist in this path context');

    expect(domainOx.get('content')).to.eq('this is test content');

    expect(ox.get.bind(null, 'content'))
      .to.throw('`content` does not exist in string library');

    expect(ox.get('domainTest.subDomainOne.content')).to.eq('this is test content');

  });

  it('should handle references and variables in domains', function () {
    ox = oxford([base]).domain('domainTest.subDomainTwo');

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
    ox = oxford([base]).domain('domainTest.subDomainTwo.subSubDomain');

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

  it('should handle bad domains', function () {
    ox = oxford([base]).domain('domainTest.subDomainTwo.subSubDomain.badbad');
    expect(ox.dictionary).to.eql({});
  });

  it('should handle bad domains more than one level of bad', function () {
    ox = oxford([base]).domain('moe.moe.moe.moe.moe');
    expect(ox.dictionary).to.eql({});
  });

});