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

  });


  it('should instantiate functional', function() {

    var parser = Parser();

    assert.ok(parser instanceof Parser, 'Parser() instanceof Parser');
  });


  describe('should parse in lax mode', function() {

    function collect(xml, options) {
      var parser = new Parser(options);

      parser.ns();

      var warnings = [];
      var tags = [];

      parser.on('warn', function(err) {
        warnings.push(err.message);
      });

      parser.on('openTag', function(name, attrGetter) {
        tags.push({ name: name, attrs: attrGetter() });
      });

      parser.parse(xml);

      return { warnings: warnings, tags: tags };
    }


    it('should suppress duplicate attribute warning', function() {

      // given
      var xml = '<root a="A" a="B" />';

      // when
      var strict = collect(xml);
      var result = collect(xml, { lax: true });

      // then
      // strict mode warns and keeps the first value
      assert.deepEqual(strict.warnings, [ 'attribute <a> already defined' ]);
      assert.deepEqual(strict.tags[0].attrs, { a: 'A' });

      // lax mode is silent and keeps the last value
      assert.deepEqual(result.warnings, []);
      assert.deepEqual(result.tags[0].attrs, { a: 'B' });
    });


    it('should keep cheap malformed attribute warnings', function() {

      // given
      var xml = '<root a b="B" />';

      // when
      var result = collect(xml, { lax: true });

      // then
      // cheap recoverable warnings are still emitted in lax mode
      assert.deepEqual(result.warnings, [ 'missing attribute value' ]);
      assert.deepEqual(result.tags[0].attrs, { b: 'B' });
    });


    it('should keep non-whitespace outside root warning', function() {

      // given
      var xml = '<root />after';

      // when
      var result = collect(xml, { lax: true });

      // then
      assert.deepEqual(result.warnings, [ 'non-whitespace outside of root node' ]);
    });


    it('should still report errors', function() {

      // given
      var parser = new Parser({ lax: true });

      var errors = [];

      parser.on('error', function(err) {
        errors.push(err.message);
      });

      // when
      parser.parse('<root>');

      // then
      assert.deepEqual(errors, [ 'unexpected end of file' ]);
    });

  });

});