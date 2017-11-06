var assert = require('assert');

var Parser = require('../');


describe('proxy mode', function() {

  it('should parse in proxy mode', function() {

    var parser = new Parser({ proxy: true });

    parser.ns({
      'http://ns': 'ns'
    });

    var counter = 0;

    parser.on('startNode', function(el, attrs) {
      counter++;

      assert.equal(el.name, 'ns:root');
      assert.equal(el.originalName, 'root');

      assert.deepEqual(el.attrs, {
        xmlns: 'http://ns',
        foo: 'BAR'
      });
    });

    // when
    parser.parse('<root xmlns="http://ns" foo="BAR" />');

    // then
    assert.ok(counter === 1, 'parsed one node');
  });

});