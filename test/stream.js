import {
  Parser
} from 'saxen';

import assert from 'node:assert';


/**
 * Collect all parse events emitted while writing the given
 * chunks to a streaming parser.
 *
 * @param {string[]} chunks
 * @param {Object} [options]
 *
 * @return {{ events: Array, error: Error }}
 */
function collect(chunks, options) {
  var parser = new Parser(options);

  if (options && options.ns) {
    parser.ns(options.ns);
  }

  var events = [];
  var error;

  parser.on('openTag', function(name, attrGetter, decodeEntities) {
    events.push([ 'openTag', name, attrGetter() ]);
  });
  parser.on('closeTag', function(name) {
    events.push([ 'closeTag', name ]);
  });
  parser.on('text', function(value, decodeEntities) {
    events.push([ 'text', decodeEntities(value) ]);
  });
  parser.on('cdata', function(value) {
    events.push([ 'cdata', value ]);
  });
  parser.on('comment', function(value) {
    events.push([ 'comment', value ]);
  });
  parser.on('question', function(value) {
    events.push([ 'question', value ]);
  });
  parser.on('attention', function(value) {
    events.push([ 'attention', value ]);
  });
  parser.on('error', function(err) {
    error = err;
  });

  chunks.forEach(function(chunk) {
    parser.write(chunk);
  });

  error = parser.end() || error;

  return { events: events, error: error };
}


/**
 * Collect all parse events emitted while writing the given chunks
 * to a streaming parser running in proxy mode.
 *
 * The element view is cloned per event, as it is only a live view
 * into the current parser state.
 *
 * @param {string[]} chunks
 * @param {Object} [options]
 *
 * @return {{ events: Array, error: Error }}
 */
function collectProxy(chunks, options) {
  var parser = new Parser({ proxy: true });

  if (options && options.ns) {
    parser.ns(options.ns);
  }

  var events = [];
  var error;

  parser.on('openTag', function(el, decodeEntities, selfClosing) {
    events.push([
      'openTag',
      el.name,
      el.originalName,
      Object.assign({}, el.attrs),
      Object.assign({}, el.ns),
      selfClosing
    ]);
  });
  parser.on('closeTag', function(el) {
    events.push([ 'closeTag', el.name ]);
  });
  parser.on('text', function(value, decodeEntities) {
    events.push([ 'text', decodeEntities(value) ]);
  });
  parser.on('error', function(err) {
    error = err;
  });

  chunks.forEach(function(chunk) {
    parser.write(chunk);
  });

  error = parser.end() || error;

  return { events: events, error: error };
}


describe('stream', function() {

  describe('#write / #end', function() {

    it('should return the parser from #write', function() {

      // given
      var parser = new Parser();

      // then
      assert.strictEqual(parser.write('<root'), parser);
      assert.strictEqual(parser.write('/>'), parser);
    });


    it('should throw on invalid arg', function() {

      // given
      var parser = new Parser();

      // then
      assert.throws(function() {
        parser.write({});
      }, /required args <xml=string>/);
    });


    it('should parse XML written as a single chunk', function() {

      // when
      var result = collect([ '<root>text</root>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', {} ],
        [ 'text', 'text' ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should parse XML written character by character', function() {

      // given
      var xml = '<root a="1">hi <child/> there</root>';

      // when
      var result = collect(xml.split(''));

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', { a: '1' } ],
        [ 'text', 'hi ' ],
        [ 'openTag', 'child', {} ],
        [ 'closeTag', 'child' ],
        [ 'text', ' there' ],
        [ 'closeTag', 'root' ]
      ]);
    });

  });


  describe('chunk boundaries', function() {

    it('should split an open tag', function() {

      // when
      var result = collect([ '<ro', 'ot', ' a', '="1"', '>', '</root>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', { a: '1' } ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split an attribute value', function() {

      // when
      var result = collect([ '<root a="va', 'lue"/>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', { a: 'value' } ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split a self-closing tag', function() {

      // when
      var result = collect([ '<root', '/', '>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', {} ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split a closing tag', function() {

      // when
      var result = collect([ '<root><', '/', 'root', '>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', {} ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should buffer text until the next tag', function() {

      // when
      var result = collect([ '<root>hel', 'lo wor', 'ld</root>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', {} ],
        [ 'text', 'hello world' ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should not emit text twice on a following incomplete tag', function() {

      // when
      var result = collect([ '<root>text<chi', 'ld/></root>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', {} ],
        [ 'text', 'text' ],
        [ 'openTag', 'child', {} ],
        [ 'closeTag', 'child' ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split an entity in text', function() {

      // when
      var result = collect([ '<root>a &am', 'p; b</root>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', {} ],
        [ 'text', 'a & b' ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split a CDATA section', function() {

      // when
      var result = collect([ '<root><![CD', 'ATA[a <b> c]', ']></root>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', {} ],
        [ 'cdata', 'a <b> c' ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split a CDATA section right after "<"', function() {

      // when
      // split as <|!|[CDATA[...]]> — the marker is not yet known
      // when only "<" has been written; a ">" inside the section
      // must not close it prematurely
      var result = collect([ '<root>', '<', '!', '[CDATA[a > b]]>', '</root>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', {} ],
        [ 'cdata', 'a > b' ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split a comment', function() {

      // when
      var result = collect([ '<root><!-- a ', '-- b -->x</root>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', {} ],
        [ 'comment', ' a -- b ' ],
        [ 'text', 'x' ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split a comment right after "<"', function() {

      // when
      // split as <|!|-- ... -->
      var result = collect([ '<root>', '<', '!', '-- some comment -->', '</root>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', {} ],
        [ 'comment', ' some comment ' ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split a comment containing ">" right after "<"', function() {

      // when
      var result = collect([ '<root>', '<', '!-- a > b -->', '</root>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', {} ],
        [ 'comment', ' a > b ' ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split a processing instruction', function() {

      // when
      var result = collect([ '<?xml vers', 'ion="1.0"?><root/>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'question', '<?xml version="1.0"?>' ],
        [ 'openTag', 'root', {} ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split a processing instruction right after "<"', function() {

      // when
      // split as <|?|xml ...?>
      var result = collect([ '<', '?', 'xml version="1.0"?>', '<root/>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'question', '<?xml version="1.0"?>' ],
        [ 'openTag', 'root', {} ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split an attention tag', function() {

      // when
      var result = collect([ '<!DOCT', 'YPE root><root/>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'attention', '<!DOCTYPE root>' ],
        [ 'openTag', 'root', {} ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split an attention tag right after "<"', function() {

      // when
      // split as <|!|DOCTYPE ...>
      var result = collect([ '<', '!', 'DOCTYPE root>', '<root/>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'attention', '<!DOCTYPE root>' ],
        [ 'openTag', 'root', {} ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split leading whitespace before the root', function() {

      // when
      var result = collect([ '  ', '\n  ', '<root/>' ]);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'root', {} ],
        [ 'closeTag', 'root' ]
      ]);
    });


    it('should split namespace declarations', function() {

      // when
      var result = collect([
        '<foo:root xmlns:foo="http://', 'foo" foo:a="A"/>'
      ], {
        ns: { 'http://foo': 'foo' }
      });

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'foo:root', { 'xmlns:foo': 'http://foo', 'foo:a': 'A' } ],
        [ 'closeTag', 'foo:root' ]
      ]);
    });


    it('should produce the same result regardless of chunking', function() {

      // given
      var xml =
        '<root xmlns:x="urn:x">' +
          '<x:child a="1">hi &amp; bye</x:child>' +
          '<![CDATA[ raw <data> ]]>' +
          '<!-- comment -->' +
        '</root>';

      var options = { ns: { 'urn:x': 'x' } };

      // when
      var whole = collect([ xml ], options);
      var perChar = collect(xml.split(''), options);

      // then
      assert.equal(whole.error, undefined);
      assert.equal(perChar.error, undefined);
      assert.deepEqual(perChar.events, whole.events);
    });

  });


  describe('errors', function() {

    it('should report unclosed tag on #end', function() {

      // given
      var parser = new Parser();

      var error;
      parser.on('error', function(err) {
        error = err;
      });

      // when
      parser.write('<root');

      // then
      assert.equal(error, undefined, 'no error while streaming');

      // when
      var returnError = parser.end();

      // then
      assert.ok(returnError, 'error returned');
      assert.equal(returnError.message, 'unclosed tag');
      assert.strictEqual(error, returnError);
    });


    it('should report unexpected end of file for an open root', function() {

      // when
      var result = collect([ '<root>', '<child/>' ]);

      // then
      assert.ok(result.error);
      assert.equal(result.error.message, 'unexpected end of file');
    });


    it('should report missing start tag for empty input', function() {

      // when
      var result = collect([ '   ' ]);

      // then
      assert.ok(result.error);
      assert.equal(result.error.message, 'missing start tag');
    });

  });


  describe('reuse', function() {

    it('should reset state between streams', function() {

      // given
      var parser = new Parser();

      var openTags = [];
      parser.on('openTag', function(name) {
        openTags.push(name);
      });

      // when
      parser.write('<a/>').end();
      parser.write('<b/>').end();

      // then
      assert.deepEqual(openTags, [ 'a', 'b' ]);
    });


    it('should throw on #parse while streaming', function() {

      // given
      var parser = new Parser();

      parser.write('<root>');

      // then
      assert.throws(function() {
        parser.parse('<other/>');
      }, /parse during stream/);
    });

  });


  describe('namespaces + attributes', function() {

    var ns = {
      ns: {
        'http://foo': 'foo',
        'http://bar': 'bar'
      }
    };

    it('should parse namespaced attributes split across chunks', function() {

      // given
      var chunks = [
        '<root xmlns="http://foo" xmlns:b',
        'ar="http://bar" bar:aa="A"',
        ' id="1">hi</root>'
      ];

      // when
      var result = collect(chunks, ns);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [ 'openTag', 'foo:root', {
          'xmlns': 'http://foo',
          'xmlns:bar': 'http://bar',
          'bar:aa': 'A',
          'id': '1'
        } ],
        [ 'text', 'hi' ],
        [ 'closeTag', 'foo:root' ]
      ]);
    });


    it('should be independent of chunk boundaries', function() {

      // given
      var xml =
        '<root xmlns="http://foo" xmlns:bar="http://bar" bar:aa="A" id="1">' +
          'hi' +
        '</root>';

      // when
      var whole = collect([ xml ], ns);
      var perChar = collect(xml.split(''), ns);

      // then
      assert.equal(whole.error, undefined);
      assert.equal(perChar.error, undefined);
      assert.deepEqual(perChar.events, whole.events);
    });

  });


  describe('proxy mode', function() {

    var ns = { ns: { 'http://foo': 'foo' } };

    it('should expose element view for streamed chunks', function() {

      // given
      var chunks = [
        '<root xmlns="http://foo" fo',
        'o="&quot;" id="1" ',
        '/>'
      ];

      // when
      var result = collectProxy(chunks, ns);

      // then
      assert.equal(result.error, undefined);
      assert.deepEqual(result.events, [
        [
          'openTag',
          'foo:root',
          'root',
          { 'xmlns': 'http://foo', 'foo': '&quot;', 'id': '1' },
          {
            'foo': 'foo',
            'foo$uri': 'http://foo',
            'xmlns': 'foo',
            'xmlns$uri': 'http://foo'
          },
          true
        ],
        [ 'closeTag', 'foo:root' ]
      ]);
    });


    it('should be independent of chunk boundaries', function() {

      // given
      var xml = '<root xmlns="http://foo" foo="&quot;" id="1">hi</root>';

      // when
      var whole = collectProxy([ xml ], ns);
      var perChar = collectProxy(xml.split(''), ns);

      // then
      assert.equal(whole.error, undefined);
      assert.equal(perChar.error, undefined);
      assert.deepEqual(perChar.events, whole.events);
    });

  });

});
