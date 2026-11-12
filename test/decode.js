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

      assert.equal(decodeEntities(attrs.encoded), '&\'><"&Quot;"\'&{İ&raquo;&constructor;&#NaN;');
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
      '&constructor;',
      '&#NaN;'
    ];

    // when
    parser.parse('<root xmlns="http://ns" encoded="' + specialChars.join('') + '" />');

    // then
    assert.ok(counter === 1, 'parsed one node');
  });


  it('should decode character references above U+FFFF', function() {

    // then
    assert.equal(decode('&#128512;|&#x1F389;|&#X1f600;'), '\u{1F600}|\u{1F389}|\u{1F600}');
    assert.equal(decode('&#1114111;|&#x10FFFF;'), '\u{10FFFF}|\u{10FFFF}');
  });


  it('should keep character references above U+10FFFF as is', function() {

    // then
    assert.equal(decode('&#1114112;|&#x110000;'), '&#1114112;|&#x110000;');
    assert.equal(decode('&#99999999999999999999;|&#x7FFFFFFFFFFF;'), '&#99999999999999999999;|&#x7FFFFFFFFFFF;');
  });


  it('should decode character references above U+FFFF in text', function() {

    // given
    var parser = new Parser();

    var text = '';

    parser.on('text', function(value, decodeEntities) {
      text += decodeEntities(value);
    });

    // when
    parser.parse('<a>&#128512;|&#x1F389;</a>');

    // then
    assert.equal(text, '\u{1F600}|\u{1F389}');
  });

});