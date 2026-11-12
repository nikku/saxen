import assert from 'node:assert';

import {
  decode,
  Parser
} from 'saxen';


describe('decode', function() {

  it('should decode entities', function() {

    var parser = new Parser();

    parser.ns();

    var counter = 0;

    parser.on('openTag', function(el, getAttrs, decodeEntities) {
      counter++;

      var attrs = getAttrs();

      assert.strictEqual(decodeEntities, decode);

      assert.equal(decodeEntities(attrs.encoded), '&\'><"&Quot;"\'&{İ&raquo;&constructor;');
    });

    var specialChars = [
      '&amp;',
      '&apos;',
      '&gt;',
      '&lt;',
      '&quot;',
      '&Quot;',
      '&QUOT;',
      '&#39;',
      '&#38;',
      '&#0123;',
      '&#x0130;',
      '&raquo;',
      '&constructor;'
    ];

    // when
    parser.parse('<root xmlns="http://ns" encoded="' + specialChars.join('') + '" />');

    // then
    assert.ok(counter === 1, 'parsed one node');
  });

  it('should decode legal character references including astral characters', function() {
    assert.equal(decode('&#9;&#10;&#13;&#32;&#xD7FF;&#xE000;&#xFFFD;&#x10000;&#1114111;&amp;#0;'),
      '\t\n\r \uD7FF\uE000\uFFFD\u{10000}\u{10FFFF}&#0;');
  });

});