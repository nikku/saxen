var Parser = require('../');
var assert = require('assert');


describe('handler errors', function() {

  var parser;

  beforeEach(function() {

    parser = new Parser();
  });


  it('should pass to #onError', function() {

    // given
    var called = false;

    parser.on('error', function(err, getContext) {

      called = true;

      assert.equal(err.message, 'foo');
      assert.ok(getContext);
    });

    parser.on('openTag', function() {
      throw new Error('foo');
    });

    // when
    parser.parse('<xml />');

    // then
    assert.ok(called, 'error called == true');
  });


  it('should throw per default', function() {

    // given
    parser.on('openTag', function() {
      throw new Error('foo');
    });

    // when
    assert.throws(function() {

      // then
      parser.parse('<xml />');
    }, /foo/);
  });


  it('should handle in #onError', function() {

    // given
    parser.on('error', function(err, getContext) {
      throw err;
    });

    parser.on('openTag', function() {
      throw new Error('foo');
    });

    // when
    assert.throws(function() {
      parser.parse('<xml />');
    }, /foo/);
  });

});


describe('#parse', function() {

  it('should throw on invalid arg', function() {

    // given
    var parser = new Parser();

    // when
    function parse() {
      parser.parse({});
    }

    // then
    assert.throws(parse, /required args <xml=string>/);
  });

});


describe('#on', function() {

  it('should throw on invalid args', function() {

    // given
    var parser = new Parser();

    // when
    function configure() {
      parser.on('openTag');
    }

    // then
    assert.throws(configure, /required args <name, cb>/);
  });


  it('should throw on invalid event', function() {

    // given
    var parser = new Parser();

    // when
    function configure() {
      parser.on('foo', function() { });
    }

    // then
    assert.throws(configure, /unsupported event: foo/);
  });

});


describe('#ns', function() {

  it('should throw on invalid args', function() {

    // given
    var parser = new Parser();

    // when
    function configure() {
      parser.ns('bar');
    }

    // then
    assert.throws(configure, /required args <nsMap={}>/);
  });


  it('should NOT throw on no args', function() {

    // given
    var parser = new Parser();

    // when
    function configure() {
      parser.ns();
    }

    // then
    assert.doesNotThrow(configure);
  });

});