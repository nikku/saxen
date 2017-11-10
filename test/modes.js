var assert = require('assert');

var Parser = require('../');


describe('modes', function() {

  describe('should parse in proxy mode', function() {

    it('exposing additional details', function() {

      var parser = new Parser({ proxy: true });

      parser.ns({
        'http://ns': 'ns'
      });

      var counter = 0;

      parser.on('openTag', function(el, decodeEntities) {
        counter++;

        assert.equal(el.name, 'ns:root');
        assert.equal(el.originalName, 'root');

        assert.deepEqual(el.attrs, {
          xmlns: 'http://ns',
          foo: '&quot;'
        });

        assert.deepEqual(el.ns, {
          'ns': 'ns',
          'ns$uri': 'http://ns',
          'xmlns': 'ns',
          'xmlns$uri': 'http://ns',
          'xsi': 'xsi',
          'xsi$uri': 'http://www.w3.org/2001/XMLSchema-instance'
        });

        assert.equal(decodeEntities(el.attrs.foo), '"');
      });

      // when
      parser.parse('<root xmlns="http://ns" foo="&quot;" />');

      // then
      assert.ok(counter === 1, 'parsed one node');
    });


    it('providing clonable properties', function() {

      var parser = new Parser({ proxy: true });

      parser.ns({
        'http://ns': 'ns'
      });

      var counter = 0;

      parser.on('openTag', function(el, decodeEntities) {
        counter++;

        // clone
        var clone = Object.assign({}, el);

        assert.equal(clone.name, 'ns:root');
        assert.equal(clone.originalName, 'root');

        assert.deepEqual(clone.attrs, {
          xmlns: 'http://ns',
          foo: '&quot;'
        });

        assert.deepEqual(clone.ns, {
          'ns': 'ns',
          'ns$uri': 'http://ns',
          'xmlns': 'ns',
          'xmlns$uri': 'http://ns',
          'xsi': 'xsi',
          'xsi$uri': 'http://www.w3.org/2001/XMLSchema-instance'
        });
      });

      // when
      parser.parse('<root xmlns="http://ns" foo="&quot;" />');

      // then
      assert.ok(counter === 1, 'parsed one node');
    });

  });


  it('should instantiate functional', function() {

    var parser = Parser();

    assert.ok(parser instanceof Parser, 'Parser() instanceof Parser');
  });

});