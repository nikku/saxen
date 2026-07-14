import assert from 'node:assert';

import {
  Parser
} from 'saxen';

describe('stream', function() {

  it('should parse streaming XML', function() {
    var parser = new Parser();

    parser.ns({
      'http://search.yahoo.com/mrss/': 'media',
      'http://www.w3.org/1999/xhtml': 'xhtml',
      'http://www.w3.org/2005/Atom': 'atom',
      'http://purl.org/rss/1.0/': 'rss',
    });

    var openTag,
        attributes,
        closeTag,
        text,
        error;

    function onOpenTag(tagName, attrGetter) {
      openTag = tagName;
      attributes = attrGetter();
    }

    function onCloseTag(tagName) {
      closeTag = tagName;
    }

    function onText(textContent) {
      text = textContent;
    }

    function onError(error_) {
      error = error_;
    }

    parser.on('openTag', onOpenTag);
    parser.on('closeTag', onCloseTag);
    parser.on('text', onText);
    parser.on('error', onError);

    parser
      .write(' ')
      .write('<')
      .write('t')
      .write('a')
      .write('g')
      .write(' ')
      .write('a')
      .write('t')
      .write('t')
      .write('r')
      .write('=')
      .write('"')
      .write('v')
      .write('a')
      .write('l')
      .write('"');

    assert.equal(error, undefined, 'expected no error');
    assert.equal(openTag, undefined, 'expected no open tag');

    parser.write('>');

    assert.equal(error, undefined, 'expected no error');
    assert.equal(openTag, 'tag', 'expected no open tag');
    assert.deepEqual(attributes, { attr: 'val' }, 'expected attributes');

    parser
      .write('t')
      .write('e')
      .write('x')
      .write('t');

    assert.equal(error, undefined, 'expected no error');
    assert.equal(text, undefined, 'expected no text');

    parser
      .write('<');

    assert.equal(error, undefined, 'expected no error');
    assert.equal(text, 'text', 'expected text');

    parser
      .write('/')
      .write('t')
      .write('a')
      .write('g');

    assert.equal(error, undefined, 'expected no error');
    assert.equal(closeTag, undefined, 'expected no close tag');

    parser
      .write('>');

    assert.equal(error, undefined, 'expected no error');
    assert.equal(closeTag, 'tag', 'expected close tag');

    parser
      .end();
  });

  it('report an error on incomplete XML when the stream ends', function() {
    var parser = new Parser();

    var error;

    function onError(error_) {
      error = error_;
    }

    parser.on('error', onError);

    parser.write('<tag');

    assert.equal(error, undefined, 'expected no error');

    parser.end();

    assert.ok(error !== undefined, 'error was reported');
    assert.equal(error.message, 'unclosed tag', 'expected no error');
  });
});