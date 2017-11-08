var test = require('./test');

// // default ns:
// // {
// //     'http://search.yahoo.com/mrss/': 'media',
// //     'http://www.w3.org/1999/xhtml': 'xhtml',
// //     'http://www.w3.org/2005/Atom': 'atom',
// //     'http://purl.org/rss/1.0/': 'rss',
// // }

test({
  xml: '<div/>',
  to: [
    ['openTag', 'div', true, true],
    ['closeTag', 'div', true],
  ],
});

test({
  xml: '<DIVa="B"></DIV>',
  to: [
    ['openTag', 'DIV'],
    ['closeTag', 'DIV'],
  ],
});

test({
  xml: '<div></div >',
  to: [
    ['openTag', 'div'],
    ['error', 'close tag'],
  ]
});

test({
  xml: '\n\x01asdasd',
  to: [
    ['error', 'missing start tag']
  ]
});

test({
  xml: '<!XXXXX zzzz="eeee">',
  to: [
    ['attention', '<!XXXXX zzzz="eeee">'],
  ],
});

test({
  xml: '<!-- HELLO -->',
  to: [
    ['comment', ' HELLO '],
  ],
});

test({
  xml: '<!-- HELLO',
  to: [
    ['error', 'unclosed comment'],
  ],
});

test({
  xml: '<!- HELLO',
  to: [
    ['error', 'unclosed tag'],
  ],
});

test({
  xml: '<? QUESTION ?>',
  to: [
    ['question', '<? QUESTION ?>'],
  ],
});

test({
  xml: '<? QUESTION',
  to: [
    ['error', 'unclosed question'],
  ],
});

test({
  xml: '<a><b/></a>',
  to: [
    ['openTag', 'a', true, false],
    ['openTag', 'b', true, true],
    ['closeTag', 'b', true],
    ['closeTag', 'a', false],
  ],
});

test({
  xml: '<open',
  to: [
    ['error', 'unclosed tag'],
  ],
});

test({
  xml: '<open /',
  to: [
    ['error', 'unclosed tag'],
  ],
});

test({
  xml: '<=div></=div>',
  to: [
    ['error', 'illegal first char nodeName'],
  ],
});

test({
  xml: '<div=></div=>',
  to: [
    ['error', 'invalid nodeName'],
  ],
});

test({
  xml: '<a><b></c></b></a>',
  to: [
    ['openTag', 'a', true, false],
    ['openTag', 'b', true, false],
    ['error', 'closing tag mismatch', { data: '</c>', line: 0, column: 6 } ],
  ],
});

test({
  xml: '<_a><:b></:b></_a>',
  to: [
    ['openTag', '_a', true, false],
    ['openTag', ':b', true, false],
    ['closeTag', ':b', false],
    ['closeTag', '_a', false],
  ],
});

test({
  xml: '<a><!--comment text--></a>',
  to: [
    ['openTag', 'a', true, false],
    ['comment', 'comment text'],
    ['closeTag', 'a', false],
  ],
});

test({
  xml: '<root><foo>',
  to: [
    ['openTag', 'root'],
    ['openTag', 'foo'],
    ['error', 'unexpected end of file', { data: '', line: 0, column: 11 } ],
  ],
});

test({
  xml: '<root/><f',
  to: [
    ['openTag', 'root', true, true],
    ['closeTag', 'root', true],
    ['error', 'unclosed tag', { data: '<f', line: 0, column: 7 } ],
  ],
});

test({
  xml: '<root></rof',
  to: [
    ['openTag', 'root', true, false],
    ['error', 'unclosed tag', { data: '</rof', line: 0, column: 6 } ]
  ],
});

test({
  xml: '<root></rof</root>',
  to: [
    ['openTag', 'root', true, false],
    ['error', 'closing tag mismatch', { data: '</rof</root>', line: 0, column: 6 } ]
  ],
});

test({
  xml: '<root>text</root>',
  to: [
    ['openTag', 'root'],
    ['text', 'text'],
    ['closeTag', 'root'],
  ],
});

test({
  xml: '<root LENGTH="abc=ABC"></root>',
  to: [
    ['openTag', 'root', { LENGTH: 'abc=ABC' }, false],
    ['closeTag', 'root', false],
  ],
});

test({
  xml: '<root length=\'abc=abc\'></root>',
  to: [
    ['openTag', 'root', { length: 'abc=abc' }, false],
    ['closeTag', 'root', false],
  ],
});

test({
  xml: '<root _abc="abc=abc" :abc="abc"></root>',
  to: [
    ['openTag', 'root', { _abc: 'abc=abc', ':abc': 'abc' }, false],
    ['closeTag', 'root', false],
  ],
});


test({
  xml: '<root attr1="first"\t attr2="second"/>',
  to: [
    ['openTag', 'root', { attr1: 'first', attr2: 'second' }, true],
    ['closeTag', 'root', true],
  ],
});

test({
  xml: '<root length=\'12345\'><item/></root>',
  to: [
    ['openTag', 'root', { length: '12345' }, false],
    ['openTag', 'item', true, true],
    ['closeTag', 'item', true],
    ['closeTag', 'root', false]
  ],
});

test({
  xml: '<r><![CDATA[ this is ]]><![CDATA[ this is ]]></r>',
  to: [
    ['openTag', 'r'],
    ['cdata', ' this is '],
    ['cdata', ' this is '],
    ['closeTag', 'r'],
  ],
});

test({
  xml: '<r><![CDATA[[[[[[[[[]]]]]]]]]]></r>',
  to: [
    ['openTag', 'r'],
    ['cdata', '[[[[[[[[]]]]]]]]'],
    ['closeTag', 'r'],
  ],
});

test({
  xml: '<r><![CDATA[</r>',
  to: [
    ['openTag', 'r'],
    ['error', 'unclosed cdata'],
  ],
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" id="aa" media:title="bb"/>',
  ns: true,
  to: [
    ['openTag', 'atom:feed', { id: 'aa', 'media:title': 'bb' }],
    ['closeTag', 'atom:feed'],
  ],
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" id="aa" media:title="bb"></feed>',
  ns: true,
  to: [
    ['openTag', 'atom:feed', { id: 'aa', 'media:title': 'bb' }],
    ['closeTag', 'atom:feed'],
  ],
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:m="http://search.yahoo.com/mrss/" id="aa" m:title="bb"/>',
  ns: true,
  to: [
    ['openTag', 'atom:feed', { id: 'aa', 'media:title': 'bb' }],
    ['closeTag', 'atom:feed'],
  ],
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:a="http://www.w3.org/2005/Atom" id="aa" a:title="bb"/>',
  ns: true,
  to: [
    ['openTag', 'atom:feed', { id: 'aa', 'title': 'bb' }],
    ['closeTag', 'atom:feed'],
  ],
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/"><media:title>text</media:title></feed>',
  ns: true,
  to: [
    ['openTag', 'atom:feed'],
    ['openTag', 'media:title'],
    ['text', 'text'],
    ['closeTag', 'media:title'],
    ['closeTag', 'atom:feed'],
  ],
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:m="http://search.yahoo.com/mrss/"><m:title>text</m:title></feed>',
  ns: true,
  to: [
    ['openTag', 'atom:feed'],
    ['openTag', 'media:title'],
    ['text', 'text'],
    ['closeTag', 'media:title'],
    ['closeTag', 'atom:feed'],
  ],
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:a="http://www.w3.org/2005/Atom"><a:title>text</a:title></feed>',
  ns: true,
  to: [
    ['openTag', 'atom:feed'],
    ['openTag', 'atom:title'],
    ['text', 'text'],
    ['closeTag', 'atom:title'],
    ['closeTag', 'atom:feed'],
  ],
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:="http://search.yahoo.com/mrss/" id="aa" :title="bb"><:text/></feed>',
  ns: true,
  to: [
    ['openTag', 'atom:feed', { id: 'aa', 'media:title': 'bb' }],
    ['openTag', 'media:text'],
    ['closeTag', 'media:text'],
    ['closeTag', 'atom:feed'],
  ],
});

// un-registered namespace handling
test({
  xml: '<root xmlns="http://foo" xmlns:bar="http://bar" id="aa" bar:title="bb"><bar:child /></root>',
  ns: true,
  to: [
    ['openTag', 'ns0:root', { id: 'aa', 'bar:title': 'bb' }],
    ['openTag', 'bar:child'],
    ['closeTag', 'bar:child'],
    ['closeTag', 'ns0:root'],
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
  ns: true,
  to: [
    ['openTag', 'atom:feed', { id: 'aa', 'media:title': 'bb' }, false, {
      line: 0,
      column: 0,
      data: '<feed xmlns="http://www.w3.org/2005/Atom" \r\n      xmlns:="http://search.yahoo.com/mrss/" id="aa" :title="bb">'
    }],
    ['text', '\r  '],
    ['openTag', 'media:text', true, true, { line: 2, column: 2, data: '<:text/>' }],
    ['closeTag', 'media:text', true, { line: 2, column: 2, data: '<:text/>' }],
    ['text', '\n'],
    ['closeTag', 'atom:feed', false, {
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
  ns: true,
  to: [
    ['openTag', 'atom:feed', { id: 'aa', 'media:title': 'bb' }, false, {
      line: 0,
      column: 0,
      data: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:="http://search.yahoo.com/mrss/" id="aa" :title="bb">'
    }],
    ['openTag', 'media:text', true, true, { line: 0, column: 101, data: '<:text/>' }],
    ['closeTag', 'media:text', true, { line: 0, column: 101, data: '<:text/>' }],
    ['closeTag', 'atom:feed', false, {
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
  ns: true,
  to: [
    ['openTag', 'ns0:foo', { id: 'aa', 'that:title': 'bb' }, true, {
      line: 0,
      column: 0,
      data: '<foo xmlns="http://this" xmlns:that="http://that" id="aa" that:title="bb" />'
    }],
    ['closeTag', 'ns0:foo', true, {
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
  ns: true,
  to: [
    ['openTag', 'ns0:foo', true, false],
    ['openTag', 'ns1:t', { id: 'aa', 'bar:title': 'bb' }, true],
    ['closeTag', 'ns1:t', true],
    ['closeTag', 'ns0:foo', false],
  ],
});

// nested <unprefixed /> namespace handling
test({
  xml: (
    '<foo xmlns="http://this" xmlns:bar="http://bar">' +
      '<t xmlns="http://that">' +
        '<n/>' +
        '<n/>' +
      '</t>' +
    '</foo>'
  ),
  ns: true,
  to: [
    ['openTag', 'ns0:foo'],
    ['openTag', 'ns1:t'],
    ['openTag', 'ns1:n'],
    ['closeTag', 'ns1:n'],
    ['openTag', 'ns1:n'],
    ['closeTag', 'ns1:n'],
    ['closeTag', 'ns1:t'],
    ['closeTag', 'ns0:foo'],
  ],
});

// nested <unprefixed></unprefixed> with default namespace
test({
  xml: (
    '<foo xmlns="http://this" xmlns:bar="http://bar">' +
      '<t xmlns="http://that">' +
        '<n id="b" bar:title="BAR"></n>' +
      '</t>' +
    '</foo>'
  ),
  ns: true,
  to: [
    ['openTag', 'ns0:foo'],
    ['openTag', 'ns1:t' ],
    ['openTag', 'ns1:n', { id: 'b', 'bar:title': 'BAR' }],
    ['closeTag', 'ns1:n'],
    ['closeTag', 'ns1:t'],
    ['closeTag', 'ns0:foo'],
  ],
});

// nested <unprefixed /> with non-default namespace handling
test({
  xml: (
    '<foo:root xmlns:foo="http://foo" xmlns:bar="http://bar">' +
      '<bar:outer>' +
        '<nested/>' +
      '</bar:outer>' +
    '</foo:root>'
  ),
  ns: true,
  to: [
    ['openTag', 'foo:root'],
    ['openTag', 'bar:outer'],
    ['openTag', 'bar:nested'],
    ['closeTag', 'bar:nested'],
    ['closeTag', 'bar:outer'],
    ['closeTag', 'foo:root'],
  ],
});

// nested namespace re-declaration
test({
  xml: (
    '<foo xmlns="http://this" xmlns:bar="http://bar">' +
      '<t xmlns="http://that" xmlns:b="http://bar">' +
        '<b:other bar:attr="BAR" />' +
      '</t>' +
    '</foo>'
  ),
  ns: true,
  to: [
    ['openTag', 'ns0:foo'],
    ['openTag', 'ns1:t'],
    ['openTag', 'bar:other', { 'bar:attr': 'BAR' }],
    ['closeTag', 'bar:other'],
    ['closeTag', 'ns1:t'],
    ['closeTag', 'ns0:foo'],
  ],
});

// test namespace attribute exposure
test({
  xml: (
    '<foo xmlns="http://xxx"></foo>'
  ),
  ns: true,
  to: [
    ['openTag', 'ns0:foo', { xmlns: 'http://xxx' } ],
    ['closeTag', 'ns0:foo', false],
  ],
});

// test namespace attribute rewrite
test({
  xml: (
    '<foo xmlns="http://xxx" xmlns:a="http://www.w3.org/2005/Atom" a:xx="foo"></foo>'
  ),
  ns: true,
  to: [
    ['openTag', 'ns0:foo', {
      'xmlns:a': 'http://www.w3.org/2005/Atom',
      'xmlns': 'http://xxx',
      'atom:xx': 'foo'
    } ],
    ['closeTag', 'ns0:foo', false],
  ],
});

// test missing namespace
test({
  xml: (
    '<foo xmlns="http://xxx">' +
      '<bar:unknown />' +
    '</foo>'
  ),
  ns: true,
  to: [
    ['openTag', 'ns0:foo' ],
    ['error', 'missing namespace on <bar:unknown>', {
      data: '<bar:unknown />',
      line: 0,
      column: 24
    } ]
  ],
});

// illegal namespace prefix
test({
  xml: (
    '<a$uri:foo xmlns:a$uri="http://not-atom" />'
  ),
  ns: true,
  to: [
    ['error', 'invalid nodeName'],
  ],
});

// namespace collision
test({
  xml: (
    '<atom:foo xmlns:atom="http://not-atom" />'
  ),
  ns: true,
  to: [
    ['openTag', 'ns0:foo'],
    ['closeTag', 'ns0:foo'],
  ],
});

// anonymous ns prefix collision
test({
  xml: (
    '<foo xmlns="http://not-ns0" xmlns:ns0="http://ns0" ns0:bar="BAR" />'
  ),
  ns: true,
  to: [
    ['openTag', 'ns0:foo', { 'ns1:bar': 'BAR' } ],
    ['closeTag', 'ns0:foo'],
  ],
});

// normalize xsi:type
test({
  xml: (
    '<foo xmlns="http://foo" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Foo" />'
  ),
  ns: true,
  to: [
    ['openTag', 'ns0:foo', { 'xsi:type': 'ns0:Foo' } ],
    ['closeTag', 'ns0:foo'],
  ],
});

// normalize prefixed xsi:type
test({
  xml: (
    '<foo xmlns="http://foo" xmlns:bar="http://bar" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="bar:Bar" />'
  ),
  ns: true,
  to: [
    ['openTag', 'ns0:foo', { 'xsi:type': 'bar:Bar' } ],
    ['closeTag', 'ns0:foo'],
  ],
});

// normalize xsi:type / preserve unknown prefix in value
test({
  xml: (
    '<foo xmlns="http://foo" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string" />'
  ),
  ns: true,
  to: [
    ['openTag', 'ns0:foo', { 'xsi:type': 'xs:string' } ],
    ['closeTag', 'ns0:foo'],
  ],
});

// unmapped prefix
test({
  xml: (
    '<foo:foo xmlns:foo="http://foo" bar:no-ns="BAR" />'
  ),
  ns: true,
  to: [
    ['warn', 'unmapped prefix <bar>', {
      column: 0,
      line: 0,
      data: '<foo:foo xmlns:foo="http://foo" bar:no-ns="BAR" />'
    }],
    ['openTag', 'foo:foo'],
    ['closeTag', 'foo:foo']
  ],
});