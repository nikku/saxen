var assert = require('assert');

var Parser = require('../');


describe('modes', function() {

  it('should parse in proxy mode', function() {

    var parser = new Parser({ proxy: true });

    parser.ns({
      'http://ns': 'ns'
    });

    var counter = 0;

    parser.on('startNode', function(el, decodeEntities) {
      counter++;

      assert.equal(el.name, 'ns:root');
      assert.equal(el.originalName, 'root');

      assert.deepEqual(el.attrs, {
        xmlns: 'http://ns',
        foo: '&quot;'
      });

      assert.equal(decodeEntities(el.attrs.foo), '"');
    });

    // when
    parser.parse('<root xmlns="http://ns" foo="&quot;" />');

    // then
    assert.ok(counter === 1, 'parsed one node');
  });


  it('should instantiate functional', function() {

    var parser = Parser();

    assert.ok(parser instanceof Parser, 'Parser() instanceof Parser');
  });

});