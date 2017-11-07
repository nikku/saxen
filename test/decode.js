var assert = require('assert');

var Parser = require('../');


describe('decode', function() {

  it('should decode entities', function() {

    var parser = new Parser();

    parser.ns();

    var counter = 0;

    parser.on('startNode', function(el, getAttrs, decodeEntities) {
      counter++;

      var attrs = getAttrs();

      assert.equal(decodeEntities(attrs.encoded), '"<>\'&{İ»\x01\x01');
    });

    var specialChars = [
      '&quot;',
      '&lt;',
      '&gt;',
      '&#39;',
      '&#38;',
      '&#0123;',
      '&#x0130;',
      '&raquo;',
      '&foo;',
      '&constructor;'
    ];

    // when
    parser.parse('<root xmlns="http://ns" encoded="' + specialChars.join('') + '" />');

    // then
    assert.ok(counter === 1, 'parsed one node');
  });

});