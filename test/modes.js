import assert from 'node:assert';

import {
  Parser
} from 'saxen';


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
          'xmlns$uri': 'http://ns'
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
          'xmlns$uri': 'http://ns'
        });
      });

      // when
      parser.parse('<root xmlns="http://ns" foo="&quot;" />');

      // then
      assert.ok(counter === 1, 'parsed one node');
    });


    it('exposing stable ns snapshots', function() {

      // given
      var parser = new Parser({ proxy: true });

      parser.ns({
        'urn:1': 'one',
        'urn:2': 'two'
      });

      var captured, capturedAgain;

      parser.on('openTag', function(el) {
        if (el.originalName === 'a:x') {
          captured = el.ns;
          capturedAgain = el.ns;
        }
      });

      // when
      parser.parse(
        '<root xmlns:a="urn:1">' +
          '<a:x xmlns:b="urn:2">' +
            '<b:y />' +
          '</a:x>' +
        '</root>'
      );

      // then
      // snapshot is cached while matrix is unchanged
      assert.strictEqual(captured, capturedAgain);

      // captured snapshot remains valid after parse moved on
      assert.deepEqual(captured, {
        'one': 'one',
        'one$uri': 'urn:1',
        'two': 'two',
        'two$uri': 'urn:2',
        'a': 'one',
        'a$uri': 'urn:1',
        'b': 'two',
        'b$uri': 'urn:2'
      });
    });

  });


  it('should instantiate functional', function() {

    var parser = Parser();

    assert.ok(parser instanceof Parser, 'Parser() instanceof Parser');
  });

});