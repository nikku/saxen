import assert from 'node:assert';

import { Parser } from 'saxen';

// https://www.w3.org/TR/xml/#NT-NameStartChar
var NAME_START_CHARS =
  ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D' +
  '\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF' +
  '\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\u{10000}-\\u{EFFFF}';

// https://www.w3.org/TR/xml/#NT-NameChar
var NAME_CHARS = '\\u0300-\\u036F' + NAME_START_CHARS + '\\-.0-9\\u00B7\\u203F-\\u2040';

var NAME_START_CHAR = new RegExp('^[' + NAME_START_CHARS + ']$', 'u');
var NAME_CHAR = new RegExp('^[' + NAME_CHARS + ']$', 'u');


describe('names', function() {

  var nonAsciiBmpChars = [];

  for (var w = 0x80; w <= 0xFFFF; w++) {

    // surrogates are covered via astral code points below
    if (w < 0xD800 || w > 0xDFFF) {
      nonAsciiBmpChars.push(String.fromCharCode(w));
    }
  }

  var astralChars = [
    0x10000,
    0x10330,
    0x1F600,
    0xEFFFF,
    0xF0000,
    0x10FFFF
  ].map(function(codePoint) {
    return String.fromCodePoint(codePoint);
  });

  var chars = nonAsciiBmpChars.concat(astralChars);


  it('should validate first char of element name', function() {
    verify(chars, NAME_START_CHAR, function(char) {
      return isElementName(char);
    });
  });


  it('should validate char of element name', function() {
    verify(chars, NAME_CHAR, function(char) {
      return isElementName('a' + char);
    });
  });


  it('should validate first char of attribute name', function() {
    verify(chars, NAME_START_CHAR, function(char) {
      return isAttributeName(char);
    });
  });


  it('should validate char of attribute name', function() {
    verify(chars, NAME_CHAR, function(char) {
      return isAttributeName('a' + char);
    });
  });

});


// helpers //////////

function verify(chars, expected, isAccepted) {

  var mismatches = chars.filter(function(char) {
    return expected.test(char) !== isAccepted(char);
  }).map(function(char) {
    return 'U+' + char.codePointAt(0).toString(16).toUpperCase();
  });

  assert.deepEqual(mismatches, []);
}

function isElementName(name) {
  var parser = new Parser();
  var accepted = false;

  parser.on('error', function() {});
  parser.on('openTag', function(elementName) {
    accepted = elementName === name;
  });

  parser.parse('<' + name + '/>');

  return accepted;
}

function isAttributeName(name) {
  var parser = new Parser();
  var accepted = false;

  parser.on('error', function() {});
  parser.on('warn', function() {});
  parser.on('openTag', function(elementName, getAttrs) {
    accepted = getAttrs()[name] === '1';
  });

  parser.parse('<root ' + name + '="1"/>');

  return accepted;
}
