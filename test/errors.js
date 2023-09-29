import {
  Parser
} from 'saxen';

import assert from 'node:assert';


describe('handler errors', function() {

  var parser;

  beforeEach(function() {

    parser = new Parser();
  });


  it('should NOT pass to #onError', function() {

    // given
    parser.on('error', function(err, getContext) {
      assert.ok(false, 'error called');
    });

    parser.on('openTag', function() {
      throw new Error('foo');
    });

    // when
    function parse() {
      parser.parse('<xml />');
    }

    // then
    assert.throws(parse, /foo/);
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


  it('should throw on XML parse error', function() {

    // given
    var parser = new Parser();

    // when
    function parse() {
      parser.parse('<not<quite<xml');
    }

    // then
    assert.throws(parse, /unclosed tag/);
  });


  it('should not throw without hooks', function() {

    // given
    var parser = new Parser();

    // when
    function parse() {
      parser.parse([
        '<? question ?>',
        '<!ATTENTION>',
        '<!-- COMMENT -->',
        '<tag a="1\'>',
        'hi',
        '<![CDATA[cdata]]>',
        '</tag>'
      ].join('\n'));
    }

    // then
    assert.doesNotThrow(parse);
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