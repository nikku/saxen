var EasySax = require('../easysax');
var assert = require('assert');


describe('handler errors', function() {

    var parser;

    beforeEach(function() {

        parser = new EasySax();
    });

    it('should pass to #onError', function() {

        // given
        var called = false;

        parser.on('error', function(err, getContext) {

            called = true;

            assert.equal(err.message, 'foo');
            assert.ok(getContext);
        });

        parser.on('startNode', function() {
            throw new Error('foo');
        });

        // when
        parser.parse('<xml />');

        // then
        assert.ok(called, 'error called == true');
    });


    it('should throw per default', function() {

        // given
        parser.on('startNode', function() {
            throw new Error('foo');
        });

        // when
        assert.throws(function() {

            // then
            parser.parse('<xml />');
        }, /foo/);
    });


    it('should handle in #onError', function() {

        // given
        parser.on('error', function(err, getContext) {
            throw err;
        });

        parser.on('startNode', function() {
            throw new Error('foo');
        });

        // when
        assert.throws(function() {
            parser.parse('<xml />');
        }, /foo/);
    });

});


describe('ns configuration', function() {

    it('should throw on missing default ns uri', function() {

        // given
        var parser = new EasySax();

        // when
        function configure() {
            parser.ns('bar', {
                'http://foo': 'foo'
            });
        }

        // then
        assert.throws(configure, /no namespace uri defined for <bar>/);
    });


    it('should throw on invalid #ns args', function() {

        // given
        var parser = new EasySax();

        // when
        function configure() {
            parser.ns('bar');
        }

        // then
        assert.throws(configure, /required args <defaultPrefix, nsMap>/);
    });

});