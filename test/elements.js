import test from './test';

// // default ns:
// // {
// //     'http://search.yahoo.com/mrss/': 'media',
// //     'http://www.w3.org/1999/xhtml': 'xhtml',
// //     'http://www.w3.org/2005/Atom': 'atom',
// //     'http://purl.org/rss/1.0/': 'rss',
// // }

test({
  xml: '<div/>',
  expect: [
    ['openTag', 'div', {}, true],
    ['closeTag', 'div', true],
  ],
});

test({
  xml: '<div />',
  expect: [
    ['openTag', 'div', {}, true],
    ['closeTag', 'div', true],
  ],
});

test({
  xml: '<div></div>',
  expect: [
    ['openTag', 'div', {}, false ],
    ['closeTag', 'div', false ],
  ]
});

test({
  xml: '<DIV/>',
  expect: [
    ['openTag', 'DIV', {}, true],
    ['closeTag', 'DIV', true],
  ],
});

test({
  xml: '<dateTime.iso8601 />',
  expect: [
    ['openTag', 'dateTime.iso8601', {}, true],
    ['closeTag', 'dateTime.iso8601', true],
  ],
});

test({
  xml: '<DIV />',
  expect: [
    ['openTag', 'DIV', {}, true],
    ['closeTag', 'DIV', true],
  ],
});

test({
  xml: '<DIV></DIV>',
  expect: [
    ['openTag', 'DIV', {}, false ],
    ['closeTag', 'DIV', false ],
  ]
});

test({
  xml: '<DIVa="B"></DIV>',
  expect: [
    ['openTag', 'DIV'],
    ['closeTag', 'DIV'],
  ],
});

test({
  xml: '<div></div >',
  expect: [
    ['openTag', 'div'],
    ['error', 'close tag'],
  ]
});

test({
  xml: '\n\x01asdasd',
  expect: [
    ['error', 'missing start tag']
  ]
});

test({
  xml: '<!XXXXX zzzz="eeee">',
  expect: [
    ['attention', '<!XXXXX zzzz="eeee">', {
      data: '<!XXXXX zzzz="eeee">',
      line: 0,
      column: 0
    }],
  ],
});

test({
  xml: '<!-- HELLO -->',
  expect: [
    ['comment', ' HELLO ', {
      data: '<!-- HELLO -',
      line: 0,
      column: 0
    }],
  ],
});

test({
  xml: '<!-- HELLO',
  expect: [
    ['error', 'unclosed comment', {
      data: '<!-- HELLO',
      line: 0,
      column: 0
    }],
  ],
});

test({
  xml: '</a>',
  expect: [
    ['error', 'missing open tag'],
  ],
});

test({
  xml: '<!- HELLO',
  expect: [
    ['error', 'unclosed tag', {
      line: 0,
      column: 0,
      data: '<!- HELLO'
    }]
  ],
});

test({
  xml: '<? QUESTION ?>',
  expect: [
    ['question', '<? QUESTION ?>', {
      data: '<? QUESTION ?',
      line: 0,
      column: 0
    }],
  ],
});

test({
  xml: '<? QUESTION',
  expect: [
    ['error', 'unclosed question', {
      data: '<? QUESTION',
      line: 0,
      column: 0
    }],
  ],
});

test({
  xml: '<a><b/></a>',
  expect: [
    ['openTag', 'a', {}, false],
    ['openTag', 'b', {}, true],
    ['closeTag', 'b', true],
    ['closeTag', 'a', false],
  ],
});

test({
  xml: '<open',
  expect: [
    ['error', 'unclosed tag'],
  ],
});

test({
  xml: '<open /',
  expect: [
    ['error', 'unclosed tag'],
  ],
});

test({
  xml: '<=div></=div>',
  expect: [
    ['error', 'illegal first char nodeName', {
      data: '<=div>',
      line: 0,
      column: 0
    }],
  ],
});

test({
  xml: '<div=></div=>',
  expect: [
    ['error', 'invalid nodeName'],
  ],
});

test({
  xml: '<a><b></c></b></a>',
  expect: [
    ['openTag', 'a', {}, false],
    ['openTag', 'b', {}, false],
    ['error', 'closing tag mismatch', { data: '</c>', line: 0, column: 6 } ],
  ],
});

test({
  xml: '<_a><:b></:b></_a>',
  expect: [
    ['openTag', '_a', {}, false],
    ['openTag', ':b', {}, false],
    ['closeTag', ':b', false],
    ['closeTag', '_a', false],
  ],
});

test({
  xml: '<root a:::="A" :b="B" ::c="C"/>',
  expect: [
    ['openTag', 'root', {
      'a:::': 'A',
      ':b': 'B',
      '::c': 'C'
    }, true],
    ['closeTag', 'root', true],
  ],
});

test({
  xml: '<a><!--comment text--></a>',
  expect: [
    ['openTag', 'a', {}, false],
    ['comment', 'comment text'],
    ['closeTag', 'a', false],
  ],
});

test({
  xml: '<root><foo>',
  expect: [
    ['openTag', 'root'],
    ['openTag', 'foo'],
    ['error', 'unexpected end of file', { data: '', line: 0, column: 11 } ],
  ],
});

test({
  xml: '<root/><f',
  expect: [
    ['openTag', 'root', {}, true],
    ['closeTag', 'root', true],
    ['error', 'unclosed tag', { data: '<f', line: 0, column: 7 } ],
  ],
});

test({
  xml: '<root></rof',
  expect: [
    ['openTag', 'root', {}, false],
    ['error', 'unclosed tag', { data: '</rof', line: 0, column: 6 } ]
  ],
});

test({
  xml: '<root></rof</root>',
  expect: [
    ['openTag', 'root', {}, false],
    ['error', 'closing tag mismatch', { data: '</rof</root>', line: 0, column: 6 } ]
  ],
});

test({
  xml: '<root>text</root>',
  expect: [
    ['openTag', 'root'],
    ['text', 'text', {
      data: 'ext',
      line: 0,
      column: 10
    }],
    ['closeTag', 'root'],
  ],
});

// text / before first tag
test({
  xml: 'a<root />',
  expect: [
    ['warn', 'non-whitespace outside of root node', { data: 'a', line: 0, column: 0 }],
    ['openTag', 'root'],
    ['closeTag', 'root'],
  ],
});

// text / after last tag
test({
  xml: '<root />a',
  expect: [
    ['openTag', 'root'],
    ['closeTag', 'root'],
    ['warn', 'non-whitespace outside of root node', { data: 'a', line: 0, column: 8 }],
  ],
});

// text / around child element
test({
  xml: '<root>a<child />b</root>',
  expect: [
    ['openTag', 'root'],
    ['text', 'a'],
    ['openTag', 'child'],
    ['closeTag', 'child'],
    ['text', 'b'],
    ['closeTag', 'root'],
  ],
});

// processing instruction + whitespace outside of root node
test({
  xml: '<?xml version="1.0" encoding="UTF-8"?>\n\t <root/>',
  expect: [
    ['question', '<?xml version="1.0" encoding="UTF-8"?>'],
    ['openTag', 'root'],
    ['closeTag', 'root']
  ],
});

// processing instruction + non-whitespace outside of root node
test({
  xml: '<?xml version="1.0" encoding="UTF-8"?>\na\n<root/>\n',
  expect: [
    ['question', '<?xml version="1.0" encoding="UTF-8"?>'],
    ['warn', 'non-whitespace outside of root node'],
    ['openTag', 'root'],
    ['closeTag', 'root']
  ],
});

// multiple-root elements
test({
  xml: '<root /><otherRoot />\n',
  expect: [
    ['openTag', 'root'],
    ['closeTag', 'root'],
    ['openTag', 'otherRoot'],
    ['closeTag', 'otherRoot']
  ],
});

// multiple-root elements / xmlns
test({
  xml:
    '<root xmlns="http://www.w3.org/2005/Atom" />' +
    '<atom:otherRoot xmlns:atom="http://not-atom" />',
  ns: true,
  expect: [
    ['openTag', 'atom:root' ],
    ['closeTag', 'atom:root'],
    ['openTag', 'ns0:otherRoot'],
    ['closeTag', 'ns0:otherRoot']
  ],
});

// attributes / ""
test({
  xml: '<root LENGTH="abc=ABC"></root>',
  expect: [
    ['openTag', 'root', { LENGTH: 'abc=ABC' }, false],
    ['closeTag', 'root', false],
  ],
});

// attributes / no xmlns assignment
test({
  xml: '<root xmlns:xmlns="http://foo" a="B"></root>',
  expect: [
    ['warn', 'illegal declaration of xmlns'],
    ['openTag', 'root', { a: 'B' }],
    ['closeTag', 'root'],
  ],
});

// attributes / ''
test({
  xml: '<root length=\'abc=abc\'></root>',
  expect: [
    ['openTag', 'root', { length: 'abc=abc' }, false],
    ['closeTag', 'root', false],
  ],
});

// attributes / = inside attribute
test({
  xml: '<root _abc="abc=abc" :abc="abc"></root>',
  expect: [
    ['openTag', 'root', { _abc: 'abc=abc', ':abc': 'abc' }, false],
    ['closeTag', 'root', false],
  ],
});

// attributes / space between attributes
test({
  xml: '<root attr1="first"\t attr2="second"/>',
  expect: [
    ['openTag', 'root', { attr1: 'first', attr2: 'second' }, true],
    ['closeTag', 'root', true],
  ],
});

// attributes / warnings / no space between attributes
test({
  xml: '<root attr1="first"attr2="second" attr1="a"b a="B" />',
  expect: [
    ['warn', 'illegal character after attribute end' ],
    ['warn', 'illegal character after attribute end' ],
    ['openTag', 'root', { a: 'B' }, true],
    ['closeTag', 'root', true],
  ],
});

// attributes / warnings / illegal first char
test({
  xml: '<root =attr1="first" a="B" />',
  expect: [
    ['warn', 'illegal first char attribute name'],
    ['openTag', 'root', { a: 'B' }, true],
    ['closeTag', 'root', true],
  ],
});

test({
  xml: '<root .attr1="first" a="B" />',
  expect: [
    ['warn', 'illegal first char attribute name'],
    ['openTag', 'root', { a: 'B' }, true],
    ['closeTag', 'root', true],
  ],
});

// attributes / warnings / open - close missmatch
test({
  xml: '<root a="B" attr1="first\' />',
  expect: [
    ['warn', 'attribute value quote missmatch'],
    ['openTag', 'root', { a: 'B' }, true],
    ['closeTag', 'root', true],
  ],
});

// attributes / warnings / missing closing quotes
test({
  xml: '<root a="B" attr1="first />',
  expect: [
    ['warn', 'missing closing quotes'],
    ['openTag', 'root', { a: 'B' }, true],
    ['closeTag', 'root', true],
  ],
});

// attributes / warnings / open - close missmatch
test({
  xml: '<root attr1=\'first" a="B" />',
  expect: [
    ['warn', 'attribute value quote missmatch'],
    ['openTag', 'root', { a: 'B' }, true],
    ['closeTag', 'root', true],
  ],
});

// attributes / warnings / illegal first char attribute name
test({
  xml: '<root $attr1="first" ☂attr1="first" attr2="second"/>',
  expect: [
    ['warn', 'illegal first char attribute name' ],
    ['warn', 'illegal first char attribute name' ],
    ['openTag', 'root', { attr2: 'second' }, true],
    ['closeTag', 'root', true],
  ],
});

// attributes / unicode attr value
test({
  xml: '<root rain="☂"/>',
  expect: [
    ['openTag', 'root', { rain: '☂' }, true],
    ['closeTag', 'root', true],
  ],
});

// attributes / warnings / illegal first char attribute name
test({
  xml: '<root <attr1="first" attr2="second"/>',
  expect: [
    ['warn', 'illegal first char attribute name' ],
    ['openTag', 'root', { attr2: 'second' }, true],
    ['closeTag', 'root', true],
  ],
});

// attributes / warnings / illegal attribute name char
test({
  xml: '<root attr1☂="first" attr2="second"/>',
  expect: [
    ['warn', 'illegal attribute name char' ],
    ['openTag', 'root', { attr2: 'second' }, true],
    ['closeTag', 'root', true],
  ],
});

test({
  xml: '<root xmlns:color_1-.0="http://color" />',
  expect: [
    ['openTag', 'root', { 'xmlns:color_1-.0': 'http://color' }, true],
    ['closeTag', 'root', true],
  ],
});

test({
  xml: '<root a:b:c="B" xmlns:b:c="http://color" />',
  expect: [
    ['openTag', 'root', { 'xmlns:b:c': 'http://color' }, true],
    ['closeTag', 'root', true],
  ],
});

test({
  xml: '<root color_1-.0="green" />',
  expect: [
    ['openTag', 'root', { 'color_1-.0': 'green' }, true],
    ['closeTag', 'root', true],
  ],
});

// attributes / warnings / attribute without value
test({
  xml: '<root attr1 a="B"/>',
  expect: [
    ['warn', 'missing attribute value' ],
    ['openTag', 'root', { a: 'B' }, true],
    ['closeTag', 'root', true],
  ],
});

test({
  xml: '<root attr1\na="B"/>',
  expect: [
    ['warn', 'missing attribute value' ],
    ['openTag', 'root', { a: 'B' }, true],
    ['closeTag', 'root', true],
  ],
});

// attributes / warnings / missing quoting
test({
  xml: '<root attr1=value a="B" />',
  expect: [
    ['warn', 'missing attribute value quotes' ],
    ['openTag', 'root', { a: 'B' }, true],
    ['closeTag', 'root', true],
  ],
});

// attributes / warnings / missing quoting
test({
  xml: '<root attr1=value\na="B" />',
  expect: [
    ['warn', 'missing attribute value quotes' ],
    ['openTag', 'root', { a: 'B' }, true],
    ['closeTag', 'root', true],
  ],
});

test({
  xml: '<root length=\'12345\'><item/></root>',
  expect: [
    ['openTag', 'root', { length: '12345' }, false],
    ['openTag', 'item', {}, true],
    ['closeTag', 'item', true],
    ['closeTag', 'root', false]
  ],
});

test({
  xml: '<r><![CDATA[ this is ]]><![CDATA[ this is [] ]]></r>',
  expect: [
    ['openTag', 'r'],
    ['cdata', ' this is '],
    ['cdata', ' this is [] '],
    ['closeTag', 'r'],
  ],
});

test({
  xml: '<r><![CDATA[[[[[[[[[]]]]]]]]]]></r>',
  expect: [
    ['openTag', 'r'],
    ['cdata', '[[[[[[[[]]]]]]]]'],
    ['closeTag', 'r'],
  ],
});

test({
  xml: '<r><![CDATA[</r>',
  expect: [
    ['openTag', 'r'],
    ['error', 'unclosed cdata'],
  ],
});

test({
  xml: '<r>&lt;![CDATA[ this is ]]&gt;</r>',
  expect: [
    ['openTag', 'r'],
    ['text', '&lt;![CDATA[ this is ]]&gt;'],
    ['closeTag', 'r'],
  ],
});

test({
  xml: '<html><head><script>\'<div>foo</div></\'</script></head></html>',
  expect: [
    ['openTag', 'html'],
    ['openTag', 'head'],
    ['openTag', 'script'],
    ['text', '\''],
    ['openTag', 'div'],
    ['text', 'foo'],
    ['closeTag', 'div'],
    ['error', 'closing tag mismatch'],
  ]
});

// namespaces
test({
  xml: '<xmlns/>',
  ns: true,
  expect: [
    ['openTag', 'xmlns'],
    ['closeTag', 'xmlns'],
  ]
});

// no root namespace (broken rss?)
test({
  xml: '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">' +
         '<channel></channel>' +
       '</rss>',
  ns: true,
  expect: [
    ['openTag', 'rss', { 'xmlns:atom': 'http://www.w3.org/2005/Atom', version: '2.0' }],
    ['openTag', 'channel'],
    ['closeTag', 'channel'],
    ['closeTag', 'rss' ]
  ]
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" id="aa" media:title="bb"/>',
  ns: true,
  expect: [
    ['openTag', 'atom:feed', { id: 'aa', 'media:title': 'bb' }],
    ['closeTag', 'atom:feed'],
  ],
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" id="aa" media:title="bb"></feed>',
  ns: true,
  expect: [
    ['openTag', 'atom:feed', { id: 'aa', 'media:title': 'bb' }],
    ['closeTag', 'atom:feed'],
  ],
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:m="http://search.yahoo.com/mrss/" id="aa" m:title="bb"/>',
  ns: true,
  expect: [
    ['openTag', 'atom:feed', { id: 'aa', 'media:title': 'bb' }],
    ['closeTag', 'atom:feed'],
  ],
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:a="http://www.w3.org/2005/Atom" id="aa" a:title="bb"/>',
  ns: true,
  expect: [
    ['openTag', 'atom:feed', { id: 'aa', 'title': 'bb' }],
    ['closeTag', 'atom:feed'],
  ],
});

test({
  xml: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/"><media:title>text</media:title></feed>',
  ns: true,
  expect: [
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
  expect: [
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
  expect: [
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
  expect: [
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
  expect: [
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
  expect: [
    ['openTag', 'atom:feed', { id: 'aa', 'media:title': 'bb' }, false, {
      line: 0,
      column: 0,
      data: '<feed xmlns="http://www.w3.org/2005/Atom" \r\n      xmlns:="http://search.yahoo.com/mrss/" id="aa" :title="bb">'
    }],
    ['text', '\r  '],
    ['openTag', 'media:text', {}, true, { line: 2, column: 2, data: '<:text/>' }],
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
  expect: [
    ['openTag', 'atom:feed', { id: 'aa', 'media:title': 'bb' }, false, {
      line: 0,
      column: 0,
      data: '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:="http://search.yahoo.com/mrss/" id="aa" :title="bb">'
    }],
    ['openTag', 'media:text', {}, true, { line: 0, column: 101, data: '<:text/>' }],
    ['closeTag', 'media:text', true, { line: 0, column: 101, data: '<:text/>' }],
    ['closeTag', 'atom:feed', false, {
      line: 0,
      column: 109,
      data: '</feed>'
    }],
  ],
});

// context with anonymous namespace
test({
  xml: (
    '<foo xmlns="http://this" xmlns:that="http://that" id="aa" that:title="bb" />'
  ),
  ns: true,
  expect: [
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
  expect: [
    ['openTag', 'ns0:foo', {}, false],
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
  expect: [
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
  expect: [
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
  expect: [
    ['openTag', 'foo:root'],
    ['openTag', 'bar:outer'],
    ['openTag', 'nested'],
    ['closeTag', 'nested'],
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
  expect: [
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
  expect: [
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
  expect: [
    ['openTag', 'ns0:foo', {
      'xmlns:a': 'http://www.w3.org/2005/Atom',
      'xmlns': 'http://xxx',
      'atom:xx': 'foo'
    } ],
    ['closeTag', 'ns0:foo', false],
  ],
});

// test missing namespace / element
test({
  xml: (
    '<foo xmlns="http://xxx">' +
      '<bar:unknown />' +
    '</foo>'
  ),
  ns: true,
  expect: [
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
  expect: [
    ['error', 'invalid nodeName'],
  ],
});

// namespace collision
test({
  xml: (
    '<atom:foo xmlns:atom="http://not-atom" />'
  ),
  ns: true,
  expect: [
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
  expect: [
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
  expect: [
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
  expect: [
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
  expect: [
    ['openTag', 'ns0:foo', { 'xsi:type': 'xs:string' } ],
    ['closeTag', 'ns0:foo'],
  ],
});

// normalize nested xsi:type
test({
  xml: (
    '<foo xmlns="http://foo" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      '<bar xsi:type="Bar" />' +
    '</foo>'
  ),
  ns: true,
  expect: [
    ['openTag', 'ns0:foo' ],
    ['openTag', 'ns0:bar', { 'xsi:type': 'ns0:Bar' } ],
    ['closeTag', 'ns0:bar'],
    ['closeTag', 'ns0:foo'],
  ],
});

// normalize nested prefixed xsi:type
test({
  xml: (
    '<foo xmlns="http://foo" xmlns:bar="http://bar" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      '<bar xsi:type="bar:Bar" />' +
    '</foo>'
  ),
  ns: true,
  expect: [
    ['openTag', 'ns0:foo' ],
    ['openTag', 'ns0:bar', { 'xsi:type': 'bar:Bar' } ],
    ['closeTag', 'ns0:bar'],
    ['closeTag', 'ns0:foo'],
  ],
});

// normalize nested xsi:type / preserve unknown prefix in value
test({
  xml: (
    '<foo xmlns="http://foo" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      '<bar xsi:type="xs:string" />' +
    '</foo>'
  ),
  ns: true,
  expect: [
    ['openTag', 'ns0:foo' ],
    ['openTag', 'ns0:bar', { 'xsi:type': 'xs:string' } ],
    ['closeTag', 'ns0:bar'],
    ['closeTag', 'ns0:foo'],
  ],
});

// attributes / missing namespace for prefixed
test({
  xml: (
    '<foo:foo xmlns:foo="http://foo" bar:no-ns="BAR" />'
  ),
  ns: true,
  expect: [
    ['warn', 'missing namespace for prefix <bar>', {
      column: 0,
      line: 0,
      data: '<foo:foo xmlns:foo="http://foo" bar:no-ns="BAR" />'
    }],
    ['openTag', 'foo:foo'],
    ['closeTag', 'foo:foo']
  ],
});

test({
  xml: (
    '<foo xmlns="http://foo">' +
      '<bar xx:bar="BAR" />' +
    '</foo>'
  ),
  ns: true,
  expect: [
    ['openTag', 'ns0:foo'],
    ['warn', 'missing namespace for prefix <xx>'],
    ['openTag', 'ns0:bar'],
    ['closeTag', 'ns0:bar'],
    ['closeTag', 'ns0:foo']
  ],
});

// attributes / missing namespace for prefixed / default ns
test({
  xml: (
    '<foo xmlns="http://xxx" bar:no-ns="BAR" />'
  ),
  ns: true,
  expect: [
    ['warn', 'missing namespace for prefix <bar>'],
    ['openTag', 'ns0:foo' ],
    ['closeTag', 'ns0:foo' ]
  ],
});

// whitespace / BOM at start
test({
  xml: '\uFEFF<div>\uFEFF</div>',
  expect: [
    ['openTag', 'div'],
    ['text', '\uFEFF' ],
    ['closeTag', 'div'],
  ],
});

// whitespace / _ at start
test({
  xml: ' \uFEFF<div />',
  expect: [
    ['openTag', 'div'],
    ['closeTag', 'div'],
  ],
});

// cyrillic in text
test({
  xml: '<P>тест</P>',
  expect: [
    ['openTag', 'P'],
    ['text', 'тест'],
    ['closeTag', 'P'],
  ],
});

// kanji in attribute value
test({
  xml: '<P foo="误" />',
  expect: [
    ['openTag', 'P', { foo: '误' }, true],
    ['closeTag', 'P'],
  ],
});

// nested namespace re-declaration
test({
  xml: '<e:root xmlns:e="http://extensions">' +
          '<bar:bar xmlns:bar="http://bar">' +
            '<other:child b="B" xmlns:other="http://other" />' +
          '</bar:bar>' +
          '<foo xmlns="http://foo">' +
            '<child a="A" />' +
          '</foo>' +
        '</e:root>',
  ns: true,
  expect: [
    ['openTag', 'e:root', { 'xmlns:e': 'http://extensions' }],
    ['openTag', 'bar:bar', { 'xmlns:bar': 'http://bar' }],
    ['openTag', 'other:child', { b: 'B', 'xmlns:other': 'http://other' }],
    ['closeTag', 'other:child'],
    ['closeTag', 'bar:bar'],
    ['openTag', 'ns0:foo', { xmlns: 'http://foo' }],
    ['openTag', 'ns0:child', { a: 'A' }],
    ['closeTag', 'ns0:child'],
    ['closeTag', 'ns0:foo'],
    ['closeTag', 'e:root' ]
  ],
});

// local namespace re-declaration
test({
  xml: '<e:root xmlns:e="http://extensions" xmlns:e="http://other" />',
  ns: true,
  expect: [
    ['warn', 'attribute <xmlns:e> already defined'],
    ['openTag', 'e:root', { 'xmlns:e': 'http://extensions' } ],
    ['closeTag', 'e:root']
  ],
});

// local namespace re-declaration / default namespace
test({
  xml: '<root xmlns="http://extensions" xmlns="http://other" />',
  ns: true,
  expect: [
    ['warn', 'attribute <xmlns> already defined'],
    ['openTag', 'ns0:root', { xmlns: 'http://extensions' }],
    ['closeTag', 'ns0:root']
  ],
});

// local attribute re-declaration / no ns
test({
  xml: '<root a="A" a="B" />',
  expect: [
    ['warn', 'attribute <a> already defined'],
    ['openTag', 'root', { a: 'A' }],
    ['closeTag', 'root']
  ],
});

// local attribute re-declaration / with namespace
test({
  xml: '<root xmlns="http://extensions" a="A" a="B" />',
  ns: true,
  expect: [
    ['warn', 'attribute <a> already defined'],
    ['openTag', 'ns0:root', { xmlns: 'http://extensions', a: 'A' }],
    ['closeTag', 'ns0:root']
  ],
});

// local attribute re-declaration / with other namespace
test({
  xml: '<root xmlns="http://extensions" xmlns:bar="http://bar" bar:a="A" bar:a="B" />',
  ns: true,
  expect: [
    ['warn', 'attribute <bar:a> already defined'],
    ['openTag', 'ns0:root', {
      xmlns: 'http://extensions',
      'xmlns:bar': 'http://bar',
      'bar:a': 'A'
    } ],
    ['closeTag', 'ns0:root']
  ],
});

// Should not throw with '>' in attribute value of regular  element (#17)
test({
  xml: '<doc><element id="sample>error"></element></doc>',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['openTag', 'element', { id: 'sample>error' }, false],
    ['closeTag', 'element', false],
    ['closeTag', 'doc', false],
  ],
});

test({
  xml: '<doc> \n<element id="sample>error" > \n </element></doc>',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['text', ' \n'],
    ['openTag', 'element', { id: 'sample>error' }, false],
    ['text', ' \n '],
    ['closeTag', 'element', false],
    ['closeTag', 'doc', false],
  ],
});

// should handle > in attribute name
test({
  xml: '<doc><element fo>o="FOO" bar="BAR" /></doc>',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['warn', 'illegal attribute name char'],
    ['openTag', 'element', { bar: 'BAR' }],
    ['closeTag', 'element'],
    ['closeTag', 'doc'],
  ],
});

// should handle > between attributes
test({
  xml: '<doc><element foo="FOO" >> bar="BAR" /></doc>',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['warn', 'illegal first char attribute name'],
    ['warn', 'illegal attribute name char'],
    ['warn', 'missing attribute value'],
    ['openTag', 'element', { foo: 'FOO', bar: 'BAR' }],
    ['closeTag', 'element'],
    ['closeTag', 'doc'],
  ],
});


// should handle > after attribute
test({
  xml: '<doc><element foo="FOO"> bar="BAR" /></doc>',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['warn', 'illegal character after attribute end'],
    ['openTag', 'element', { bar: 'BAR' }],
    ['closeTag', 'element'],
    ['closeTag', 'doc'],
  ],
});

// should handle > after tag name
test({
  xml: '<doc><element />></doc>',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['warn', 'illegal first char attribute name'],
    ['warn', 'illegal attribute name char'],
    ['warn', 'missing attribute value quotes'],
    ['openTag', 'element', {}, false],
    ['error', 'closing tag mismatch']
  ],
});

// should handle > in tag name
test({
  xml: '<doc><element>/></doc>',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['error', 'invalid nodeName']
  ],
});

// should not throw with '>' in attribute value of self-closing element (#17)
test({
  xml: '<doc><element id="sample>error" /></doc>',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['openTag', 'element', { id: 'sample>error' }, true],
    ['closeTag', 'element', true],
    ['closeTag', 'doc', false],
  ],
});

test({
  xml: '<doc> \n<element id="sample>error"\n /> </doc>',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['text', ' \n'],
    ['openTag', 'element', { id: 'sample>error' }, true],
    ['closeTag', 'element', true],
    ['text', ' '],
    ['closeTag', 'doc', false],
  ],
});

// should not throw with '>' in attribute value of self-closing element at the end of the document
test({
  xml: '<doc></doc><element id="sample>error" />',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['closeTag', 'doc', false],
    ['openTag', 'element', { id: 'sample>error' }, true],
    ['closeTag', 'element', true],
  ],
});

test({
  xml: '<doc></doc><element id="sample>error" />\n ',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['closeTag', 'doc', false],
    ['openTag', 'element', { id: 'sample>error' }, true],
    ['closeTag', 'element', true],
  ],
});

// should not throw with '>' in attribute value of self-closing element at the end of the document
test({
  xml: '<doc></doc><!-- !>>> --><element id="sample>error" />',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['closeTag', 'doc', false],
    ['comment', ' !>>> '],
    ['openTag', 'element', { id: 'sample>error' }, true],
    ['closeTag', 'element', true],
  ]
});

test({
  xml: '<doc></doc><!-- !>>> --> <element id="sample>error" />',
  ns: true,
  expect: [
    ['openTag', 'doc', {}, false],
    ['closeTag', 'doc', false],
    ['comment', ' !>>> '],
    ['openTag', 'element', { id: 'sample>error' }, true],
    ['closeTag', 'element', true],
  ]
});