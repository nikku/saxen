var test = require('./easysax.test.js');

// // default ns:
// // {
// //     'http://search.yahoo.com/mrss/': 'media',
// //     'http://www.w3.org/1999/xhtml': 'xhtml',
// //     'http://www.w3.org/2005/Atom': 'atom',
// //     'http://purl.org/rss/1.0/': 'rss',
// // }


describe('parsing', function() {

    test({
        xml: '<div/>',
        to: [
            ['startNode', 'div', true, true],
            ['endNode', 'div', true],
        ],
    });

    test({
        xml: '<a><b/></a>',
        to: [
            ['startNode', 'a', true, false],
            ['startNode', 'b', true, true],
            ['endNode', 'b', true],
            ['endNode', 'a', false],
        ],
    });

    test({
        xml: '<a><b></c></b></a>',
        to: [
            ['startNode', 'a', true, false],
            ['startNode', 'b', true, false],
            ['error', 'closing tag mismatch', { data: '</c>', line: 0, column: 6 } ],
        ],
    });

    test({
        xml: '<_a><:b></:b></_a>',
        to: [
            ['startNode', '_a', true, false],
            ['startNode', ':b', true, false],
            ['endNode', ':b', false],
            ['endNode', '_a', false],
        ],
    });

    test({
        xml: '<a><!--comment text--></a>',
        to: [
            ['startNode', 'a', true, false],
            ['comment', 'comment text'],
            ['endNode', 'a', false],
        ],
    });

    test({
        xml: '<root><foo>',
        to: [
            ['startNode', 'root'],
            ['startNode', 'foo'],
            ['error', 'unexpected end of file', { data: '', line: 0, column: 11 } ],
        ],
    });

    test({
        xml: '<root/><f',
        to: [
            ['startNode', 'root', true, true],
            ['endNode', 'root', true],
            ['error', 'unclosed tag', { data: '<f', line: 0, column: 7 } ],
        ],
    });

    test({
        xml: '<root></rof',
        to: [
            ['startNode', 'root', true, false],
            ['error', 'unclosed tag', { data: '</rof', line: 0, column: 6 } ]
        ],
    });

    test({
        xml: '<root></rof</root>',
        to: [
            ['startNode', 'root', true, false],
            ['error', 'closing tag mismatch', { data: '</rof</root>', line: 0, column: 6 } ]
        ],
    });

    test({
        xml: '<root>text</root>',
        to: [
            ['startNode', 'root'],
            ['textNode', 'text'],
            ['endNode', 'root'],
        ],
    });

    test({
        xml: '<root length="abc=abc"></root>',
        to: [
            ['startNode', 'root', {length: 'abc=abc'}, false],
            ['endNode', 'root', false],
        ],
    });

    test({
        xml: '<root length=\'abc=abc\'></root>',
        to: [
            ['startNode', 'root', {length: 'abc=abc'}, false],
            ['endNode', 'root', false],
        ],
    });

    test({
        xml: '<root _abc="abc=abc" :abc="abc"></root>',
        to: [
            ['startNode', 'root', {_abc: 'abc=abc', ':abc': 'abc'}, false],
            ['endNode', 'root', false],
        ],
    });


    test({
        xml: '<root attr1="first"\t attr2="second"/>',
        to: [
            ['startNode', 'root', {attr1: 'first', attr2: 'second'}, true],
            ['endNode', 'root', true],
        ],
    });

    test({
        xml: '<root length=\'12345\'><item/></root>',
        to: [
            ['startNode', 'root', {length: '12345'}, false],
            ['startNode', 'item', true, true],
            ['endNode', 'item', true],
            ['endNode', 'root', false]
        ],
    });

    test({
        xml: '<r><![CDATA[ this is ]]><![CDATA[ this is ]]></r>',
        to: [
            ['startNode', 'r'],
            ['cdata', ' this is '],
            ['cdata', ' this is '],
            ['endNode', 'r'],
        ],
    });

    test({
        xml: '<r><![CDATA[[[[[[[[[]]]]]]]]]]></r>',
        to: [
            ['startNode', 'r'],
            ['cdata', '[[[[[[[[]]]]]]]]'],
            ['endNode', 'r'],
        ],
    });

    test({
        xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" id="aa" media:title="bb"/>',
        ns: 'atom',
        to: [
            ['startNode', 'atom:feed', {id: 'aa', 'media:title': 'bb'}],
            ['endNode', 'atom:feed'],
        ],
    });

    test({
        xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" id="aa" media:title="bb"></feed>',
        ns: 'atom',
        to: [
            ['startNode', 'atom:feed', {id: 'aa', 'media:title': 'bb'}],
            ['endNode', 'atom:feed'],
        ],
    });

    test({
        xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:m="http://search.yahoo.com/mrss/" id="aa" m:title="bb"/>',
        ns: 'atom',
        to: [
            ['startNode', 'atom:feed', {id: 'aa', 'media:title': 'bb'}],
            ['endNode', 'atom:feed'],
        ],
    });

    test({
        xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:a="http://www.w3.org/2005/Atom" id="aa" a:title="bb"/>',
        ns: 'atom',
        to: [
            ['startNode', 'atom:feed', {id: 'aa', 'title': 'bb'}],
            ['endNode', 'atom:feed'],
        ],
    });

    test({
        xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/"><media:title>text</media:title></feed>',
        ns: 'atom',
        to: [
            ['startNode', 'atom:feed'],
            ['startNode', 'media:title'],
            ['textNode', 'text'],
            ['endNode', 'media:title'],
            ['endNode', 'atom:feed'],
        ],
    });

    test({
        xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:m="http://search.yahoo.com/mrss/"><m:title>text</m:title></feed>',
        ns: 'atom',
        to: [
            ['startNode', 'atom:feed'],
            ['startNode', 'media:title'],
            ['textNode', 'text'],
            ['endNode', 'media:title'],
            ['endNode', 'atom:feed'],
        ],
    });


    test({
        xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:a="http://www.w3.org/2005/Atom"><a:title>text</a:title></feed>',
        ns: 'atom',
        to: [
            ['startNode', 'atom:feed'],
            ['startNode', 'atom:title'],
            ['textNode', 'text'],
            ['endNode', 'atom:title'],
            ['endNode', 'atom:feed'],
        ],
    });

    test({
        xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:="http://search.yahoo.com/mrss/" id="aa" :title="bb"><:text/></feed>',
        ns: 'atom',
        to: [
            ['startNode', 'atom:feed', {id: 'aa', 'media:title': 'bb'}],
            ['startNode', 'media:text'],
            ['endNode', 'media:text'],
            ['endNode', 'atom:feed'],
        ],
    });

    // un-registered namespace handling
    test({
        xml: '<root xmlns="http://foo" xmlns:bar="http://bar" id="aa" bar:title="bb"><bar:child /></root>',
        ns: 'atom',
        to: [
            ['startNode', 'ns0:root', {id: 'aa', 'bar:title': 'bb'}],
            ['startNode', 'bar:child'],
            ['endNode', 'bar:child'],
            ['endNode', 'ns0:root'],
        ],
    });

    // context with whitespace
    test({
        xml: (
            '<feed xmlns="http://www.w3.org/2005/Atom" \r\n' +
            '      xmlns:="http://search.yahoo.com/mrss/" id="aa" :title="bb">\r' +
            '  <:text/>\n' +
            '</feed>'
        ),
        ns: 'atom',
        to: [
            ['startNode', 'atom:feed', {id: 'aa', 'media:title': 'bb'}, false, {
                line: 0,
                column: 0,
                data: '<feed xmlns="http://www.w3.org/2005/Atom" \r\n      xmlns:="http://search.yahoo.com/mrss/" id="aa" :title="bb">'
            }],
            ['textNode', '\r  '],
            ['startNode', 'media:text', true, true, { line: 2, column: 2, data: '<:text/>' }],
            ['endNode', 'media:text', true, { line: 2, column: 2, data: '<:text/>' }],
            ['textNode', '\n'],
            ['endNode', 'atom:feed', false, {
                line: 3,
                column: 0,
                data: '</feed>'
            }],
        ],
    });

    // context without whitespace
    test({
        xml: (
            '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:="http://search.yahoo.com/mrss/" id="aa" :title="bb">' +
                '<:text/>' +
            '</feed>'
        ),
        ns: 'atom',
        to: [
            ['startNode', 'atom:feed', {id: 'aa', 'media:title': 'bb'}, false, {
                line: 0,
                column: 0,
                data: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:="http://search.yahoo.com/mrss/" id="aa" :title="bb">'
            }],
            ['startNode', 'media:text', true, true, { line: 0, column: 101, data: '<:text/>' }],
            ['endNode', 'media:text', true, { line: 0, column: 101, data: '<:text/>' }],
            ['endNode', 'atom:feed', false, {
                line: 0,
                column: 109,
                data: '</feed>'
            }],
        ],
    });

    // context with annonymous namespace
    test({
        xml: (
            '<foo xmlns="http://this" xmlns:that="http://that" id="aa" that:title="bb" />'
        ),
        ns: 'atom',
        to: [
            ['startNode', 'ns0:foo', { id: 'aa', 'that:title': 'bb' }, true, {
                line: 0,
                column: 0,
                data: '<foo xmlns="http://this" xmlns:that="http://that" id="aa" that:title="bb" />'
            }],
            ['endNode', 'ns0:foo', true, {
                line: 0,
                column: 0,
                data: '<foo xmlns="http://this" xmlns:that="http://that" id="aa" that:title="bb" />'
            }],
        ],
    });

    // nested namespace handling
    test({
        xml: (
            '<foo xmlns="http://this" xmlns:bar="http://bar">' +
                '<t xmlns="http://that" id="aa" bar:title="bb" />' +
            '</foo>'
        ),
        ns: 'atom',
        to: [
            ['startNode', 'ns0:foo', true, false],
            ['startNode', 'ns1:t', { id: 'aa', 'bar:title': 'bb' }, true],
            ['endNode', 'ns1:t', true],
            ['endNode', 'ns0:foo', false],
        ],
    });

    // nested <unprefixed /> namespace handling
    test({
        xml: (
            '<foo xmlns="http://this" xmlns:bar="http://bar">' +
                '<t xmlns="http://that" id="a" bar:title="BAR">' +
                    '<n id="b1" bar:title="BAR" />' +
                    '<n id="b2" />' +
                '</t>' +
            '</foo>'
        ),
        ns: 'atom',
        to: [
            ['startNode', 'ns0:foo'],
            ['startNode', 'ns1:t', { id: 'a', 'bar:title': 'BAR' }],
            ['startNode', 'ns1:n', { id: 'b1', 'bar:title': 'BAR' }],
            ['endNode', 'ns1:n'],
            ['startNode', 'ns1:n', { id: 'b2' }],
            ['endNode', 'ns1:n'],
            ['endNode', 'ns1:t'],
            ['endNode', 'ns0:foo'],
        ],
    });

    // nested <unprefixed></unprefixed> namespace handling
    test({
        xml: (
            '<foo xmlns="http://this" xmlns:bar="http://bar">' +
                '<t xmlns="http://that" id="a" bar:title="BAR">' +
                    '<n id="b" bar:title="BAR"></n>' +
                '</t>' +
            '</foo>'
        ),
        ns: 'atom',
        to: [
            ['startNode', 'ns0:foo'],
            ['startNode', 'ns1:t', { id: 'a', 'bar:title': 'BAR' }],
            ['startNode', 'ns1:n', { id: 'b', 'bar:title': 'BAR' }],
            ['endNode', 'ns1:n'],
            ['endNode', 'ns1:t'],
            ['endNode', 'ns0:foo'],
        ],
    });

    // nested namespace re-declaration
    test({
        xml: (
            '<foo xmlns="http://this" xmlns:bar="http://bar">' +
                '<t xmlns="http://that" xmlns:b="http://bar">' +
                    '<b:other title="OTHER" bar:attr="BAR" />' +
                '</t>' +
            '</foo>'
        ),
        ns: 'atom',
        to: [
            ['startNode', 'ns0:foo'],
            ['startNode', 'ns1:t'],
            ['startNode', 'bar:other', { title: 'OTHER', 'attr': 'BAR' }],
            ['endNode', 'bar:other'],
            ['endNode', 'ns1:t'],
            ['endNode', 'ns0:foo'],
        ],
    });

});


var EasySax = require('../easysax');
var assert = require('assert');


describe('error handling', function() {

    var parser;

    beforeEach(function() {

        parser = new EasySax();

        parser.ns('foo', {
            'http://foo': 'foo'
        });
    })

    it('should propagate handler errors to #onError', function() {

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
        assert.ok(called);
    });


    it('should not catch #onError errors', function() {

        // given
        var called = false;

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

});