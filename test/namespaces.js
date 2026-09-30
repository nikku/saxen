import assert from 'assert';

import {
  Parser
} from '../lib';

import test from './test';

var XSI_URI = 'http://www.w3.org/2001/XMLSchema-instance';


/**
 * Parse the given XML in proxy mode and record open / close tags,
 * attributes, a copy of the namespace state as well as errors
 * and warnings.
 *
 * @param {string} xml
 * @param {Object} [nsMap]
 *
 * @return {Array<Object>}
 */
function record(xml, nsMap) {
  var parser = new Parser({ proxy: true });

  var events = [];

  parser.ns(nsMap || {
    'http://a': 'a',
    'http://b': 'b',
    'http://c': 'c'
  });

  parser.on('openTag', function(el, decodeEntities, selfClosing) {
    events.push({
      type: 'openTag',
      name: el.name,
      originalName: el.originalName,
      attrs: Object.assign({}, el.attrs),
      ns: Object.assign({}, el.ns),
      selfClosing: selfClosing
    });
  });

  parser.on('closeTag', function(el) {
    events.push({
      type: 'closeTag',
      name: el.name,
      ns: Object.assign({}, el.ns)
    });
  });

  parser.on('error', function(err) {
    events.push({ type: 'error', message: err.message });
  });

  parser.on('warn', function(warning) {
    events.push({ type: 'warn', message: warning.message });
  });

  parser.parse(xml);

  return events;
}

function names(events) {
  return events.map(function(event) {
    return event.type === 'error' || event.type === 'warn'
      ? [ event.type, event.message ]
      : [ event.type, event.name ];
  });
}

function openTag(events, originalName) {
  return events.filter(function(event) {
    return event.type === 'openTag' && event.originalName === originalName;
  })[0];
}


describe('namespace scoping', function() {

  // ported from GHSA-6w8c-5m3c-g2m8 fix
  // cf. https://github.com/nikku/saxen/commit/e88354c239a071a007a0509803b0eccc02cd0511

  // nested prefix shadowing, restored after close
  test({
    xml: (
      '<root xmlns:a="http://www.w3.org/2005/Atom">' +
        '<a:x xmlns:a="http://purl.org/rss/1.0/">' +
          '<a:y />' +
        '</a:x>' +
        '<a:z />' +
      '</root>'
    ),
    ns: true,
    expect: [
      [ 'openTag', 'root' ],
      [ 'openTag', 'rss:x' ],
      [ 'openTag', 'rss:y' ],
      [ 'closeTag', 'rss:y' ],
      [ 'closeTag', 'rss:x' ],
      [ 'openTag', 'atom:z' ],
      [ 'closeTag', 'atom:z' ],
      [ 'closeTag', 'root' ]
    ]
  });

  // repeated tag name across shadowed scope boundary
  test({
    xml: (
      '<root xmlns:a="http://www.w3.org/2005/Atom">' +
        '<a:x xmlns:a="http://purl.org/rss/1.0/">' +
          '<a:y />' +
        '</a:x>' +
        '<a:y />' +
      '</root>'
    ),
    ns: true,
    expect: [
      [ 'openTag', 'root' ],
      [ 'openTag', 'rss:x' ],
      [ 'openTag', 'rss:y' ],
      [ 'closeTag', 'rss:y' ],
      [ 'closeTag', 'rss:x' ],
      [ 'openTag', 'atom:y' ],
      [ 'closeTag', 'atom:y' ],
      [ 'closeTag', 'root' ]
    ]
  });

  // self-closed element declarations, restored after close
  test({
    xml: (
      '<root xmlns:a="http://www.w3.org/2005/Atom">' +
        '<a:x xmlns:b="urn:unknown" />' +
        '<b:y />' +
      '</root>'
    ),
    ns: true,
    expect: [
      [ 'openTag', 'root' ],
      [ 'openTag', 'atom:x' ],
      [ 'closeTag', 'atom:x' ],
      [ 'error', 'missing namespace on <b:y>' ]
    ]
  });


  it('should drop prefix introduced by child after child closes', function() {

    // when
    var events = record(
      '<root xmlns="http://a">' +
        '<child xmlns:q="http://b"><q:x /></child>' +
        '<sibling />' +
        '<q:y />' +
      '</root>'
    );

    // then
    assert.deepEqual(names(events), [
      [ 'openTag', 'a:root' ],
      [ 'openTag', 'a:child' ],
      [ 'openTag', 'b:x' ],
      [ 'closeTag', 'b:x' ],
      [ 'closeTag', 'a:child' ],
      [ 'openTag', 'a:sibling' ],
      [ 'closeTag', 'a:sibling' ],
      [ 'error', 'missing namespace on <q:y>' ]
    ]);

    assert.equal(openTag(events, 'child').ns.q, 'b');
    assert.equal(openTag(events, 'child').ns.q$uri, 'http://b');

    assert.ok(!('q' in openTag(events, 'sibling').ns));
    assert.ok(!('q$uri' in openTag(events, 'sibling').ns));
    assert.deepEqual(openTag(events, 'sibling').ns, openTag(events, 'root').ns);
  });


  it('should restore parent prefix overridden by child', function() {

    // when
    var events = record(
      '<p:root xmlns:p="http://a">' +
        '<p:child xmlns:p="http://b"><p:x /></p:child>' +
        '<p:y />' +
      '</p:root>'
    );

    // then
    assert.deepEqual(names(events), [
      [ 'openTag', 'a:root' ],
      [ 'openTag', 'b:child' ],
      [ 'openTag', 'b:x' ],
      [ 'closeTag', 'b:x' ],
      [ 'closeTag', 'b:child' ],
      [ 'openTag', 'a:y' ],
      [ 'closeTag', 'a:y' ],
      [ 'closeTag', 'a:root' ]
    ]);

    assert.equal(openTag(events, 'p:child').ns.p, 'b');
    assert.equal(openTag(events, 'p:child').ns.p$uri, 'http://b');

    assert.equal(openTag(events, 'p:y').ns.p, 'a');
    assert.equal(openTag(events, 'p:y').ns.p$uri, 'http://a');
    assert.deepEqual(openTag(events, 'p:y').ns, openTag(events, 'p:root').ns);
  });


  it('should restore nested overrides of the same prefix in reverse order', function() {

    // when
    var events = record(
      '<p:l0 xmlns:p="http://a">' +
        '<p:l1 xmlns:p="http://b">' +
          '<p:l2 xmlns:p="http://c">' +
            '<p:l3 />' +
          '</p:l2>' +
          '<p:after2 />' +
        '</p:l1>' +
        '<p:after1 />' +
      '</p:l0>'
    );

    // then
    assert.deepEqual(names(events), [
      [ 'openTag', 'a:l0' ],
      [ 'openTag', 'b:l1' ],
      [ 'openTag', 'c:l2' ],
      [ 'openTag', 'c:l3' ],
      [ 'closeTag', 'c:l3' ],
      [ 'closeTag', 'c:l2' ],
      [ 'openTag', 'b:after2' ],
      [ 'closeTag', 'b:after2' ],
      [ 'closeTag', 'b:l1' ],
      [ 'openTag', 'a:after1' ],
      [ 'closeTag', 'a:after1' ],
      [ 'closeTag', 'a:l0' ]
    ]);

    assert.deepEqual(openTag(events, 'p:after2').ns, openTag(events, 'p:l1').ns);
    assert.deepEqual(openTag(events, 'p:after1').ns, openTag(events, 'p:l0').ns);
  });


  it('should restore multiple changes of the same key on one element', function() {

    // given
    // <child> changes <ns0$uri> twice: once for the anonymous
    // default namespace alias <ns0> and once for the prefix <ns0>
    var xml =
      '<root xmlns:a="http://a">' +
        '<a:child xmlns="urn:anonymous" xmlns:ns0="urn:other"><x /><ns0:y /></a:child>' +
        '<a:sibling />' +
      '</root>';

    // when
    var events = record(xml);

    // then
    var child = openTag(events, 'a:child');

    assert.equal(child.ns.xmlns, 'ns0');
    assert.equal(child.ns.ns0, 'ns1');
    assert.equal(child.ns.ns0$uri, 'urn:other');

    assert.equal(openTag(events, 'x').name, 'ns0:x');
    assert.equal(openTag(events, 'ns0:y').name, 'ns1:y');

    var sibling = openTag(events, 'a:sibling');

    assert.ok(!('ns0$uri' in sibling.ns));
    assert.ok(!('ns0' in sibling.ns));
    assert.ok(!('xmlns' in sibling.ns));
    assert.deepEqual(sibling.ns, openTag(events, 'root').ns);
  });


  it('should restore default namespace', function() {

    // when
    var events = record(
      '<root xmlns="http://a">' +
        '<child xmlns="http://b">' +
          '<grandchild xmlns="http://c"><x /></grandchild>' +
          '<y />' +
        '</child>' +
        '<z />' +
      '</root>'
    );

    // then
    assert.deepEqual(names(events), [
      [ 'openTag', 'a:root' ],
      [ 'openTag', 'b:child' ],
      [ 'openTag', 'c:grandchild' ],
      [ 'openTag', 'c:x' ],
      [ 'closeTag', 'c:x' ],
      [ 'closeTag', 'c:grandchild' ],
      [ 'openTag', 'b:y' ],
      [ 'closeTag', 'b:y' ],
      [ 'closeTag', 'b:child' ],
      [ 'openTag', 'a:z' ],
      [ 'closeTag', 'a:z' ],
      [ 'closeTag', 'a:root' ]
    ]);

    assert.equal(openTag(events, 'y').ns.xmlns, 'b');
    assert.equal(openTag(events, 'z').ns.xmlns, 'a');
    assert.equal(openTag(events, 'z').ns.xmlns$uri, 'http://a');
    assert.deepEqual(openTag(events, 'z').ns, openTag(events, 'root').ns);
  });


  it('should restore undeclared default namespace', function() {

    // when
    var events = record(
      '<root>' +
        '<child xmlns="http://b"><x /></child>' +
        '<y />' +
      '</root>'
    );

    // then
    assert.deepEqual(names(events), [
      [ 'openTag', 'root' ],
      [ 'openTag', 'b:child' ],
      [ 'openTag', 'b:x' ],
      [ 'closeTag', 'b:x' ],
      [ 'closeTag', 'b:child' ],
      [ 'openTag', 'y' ],
      [ 'closeTag', 'y' ],
      [ 'closeTag', 'root' ]
    ]);

    assert.ok(!('xmlns' in openTag(events, 'y').ns));
    assert.ok(!('xmlns$uri' in openTag(events, 'y').ns));
  });


  it('should let siblings observe parent namespace state', function() {

    // when
    var events = record(
      '<root xmlns:p="http://a" xmlns="http://a">' +
        '<p:s1 xmlns:p="http://b" xmlns:q="http://c" xmlns="http://c" />' +
        '<p:s2 xmlns:p="http://c" xmlns:q="http://b"><q:x /><x /></p:s2>' +
        '<p:s3 />' +
        '<s4 />' +
      '</root>'
    );

    // then
    assert.deepEqual(names(events), [
      [ 'openTag', 'a:root' ],
      [ 'openTag', 'b:s1' ],
      [ 'closeTag', 'b:s1' ],
      [ 'openTag', 'c:s2' ],
      [ 'openTag', 'b:x' ],
      [ 'closeTag', 'b:x' ],
      [ 'openTag', 'a:x' ],
      [ 'closeTag', 'a:x' ],
      [ 'closeTag', 'c:s2' ],
      [ 'openTag', 'a:s3' ],
      [ 'closeTag', 'a:s3' ],
      [ 'openTag', 'a:s4' ],
      [ 'closeTag', 'a:s4' ],
      [ 'closeTag', 'a:root' ]
    ]);

    var rootNs = openTag(events, 'root').ns;

    [ 'p:s3', 's4' ].forEach(function(name) {
      var ns = openTag(events, name).ns;

      assert.deepEqual(ns, rootNs, name + ' ns');
      assert.deepEqual(Object.keys(ns), Object.keys(rootNs), name + ' ns keys');
    });
  });


  it('should expose declarations of self-closing element on close', function() {

    // when
    var events = record(
      '<root>' +
        '<p:x xmlns:p="http://a" />' +
        '<p:y />' +
      '</root>'
    );

    // then
    assert.deepEqual(names(events), [
      [ 'openTag', 'root' ],
      [ 'openTag', 'a:x' ],
      [ 'closeTag', 'a:x' ],
      [ 'error', 'missing namespace on <p:y>' ]
    ]);

    var close = events.filter(function(event) {
      return event.type === 'closeTag';
    })[0];

    assert.equal(close.name, 'a:x');
    assert.equal(close.ns.p, 'a');
  });


  it('should restore after undeclaring default namespace', function() {

    // when
    var events = record(
      '<root xmlns="http://a">' +
        '<x xmlns=""><y /></x>' +
        '<z />' +
      '</root>'
    );

    // then
    assert.deepEqual(names(events), [
      [ 'openTag', 'a:root' ],
      [ 'openTag', 'ns0:x' ],
      [ 'openTag', 'ns0:y' ],
      [ 'closeTag', 'ns0:y' ],
      [ 'closeTag', 'ns0:x' ],
      [ 'openTag', 'a:z' ],
      [ 'closeTag', 'a:z' ],
      [ 'closeTag', 'a:root' ]
    ]);

    assert.equal(openTag(events, 'x').ns.xmlns$uri, '');
    assert.deepEqual(openTag(events, 'z').ns, openTag(events, 'root').ns);
  });


  it('should restore configured prefix after alias collision', function() {

    // when
    var events = record(
      '<a:root xmlns:a="http://other">' +
        '<a:x xmlns:a="http://a" />' +
        '<a:y />' +
      '</a:root>'
    );

    // then
    assert.deepEqual(names(events), [
      [ 'openTag', 'ns0:root' ],
      [ 'openTag', 'a:x' ],
      [ 'closeTag', 'a:x' ],
      [ 'openTag', 'ns0:y' ],
      [ 'closeTag', 'ns0:y' ],
      [ 'closeTag', 'ns0:root' ]
    ]);

    assert.equal(openTag(events, 'a:x').ns.a$uri, 'http://a');
    assert.equal(openTag(events, 'a:y').ns.a, 'ns0');
    assert.equal(openTag(events, 'a:y').ns.a$uri, 'http://other');
  });


  it('should restore Object.prototype named prefixes', function() {

    // given
    var parser = new Parser({ proxy: true });

    parser.ns({ 'http://a': 'a' });

    var events = [];

    parser.on('openTag', function(el) {
      events.push({
        name: el.name,
        ownKeys: Object.keys(el.ns),
        proto: Object.getPrototypeOf(el.ns)
      });
    });

    parser.on('error', function(err) {
      throw err;
    });

    // when
    parser.parse(
      '<root>' +
        '<constructor:x xmlns:constructor="http://c"><constructor:y /></constructor:x>' +
        '<toString:x xmlns:toString="http://t" />' +
        '<hasOwnProperty:x xmlns:hasOwnProperty="http://h"><y xmlns:q="http://a" /></hasOwnProperty:x>' +
        '<x xmlns:__proto__="http://p" />' +
        '<after />' +
      '</root>'
    );

    // then
    assert.deepEqual(events.map(function(event) {
      return event.name;
    }), [
      'root',
      'constructor:x',
      'constructor:y',
      'toString:x',
      'hasOwnProperty:x',
      'y',
      'x',
      'after'
    ]);

    assert.deepEqual(events[5].ownKeys.slice(-2), [ 'q', 'q$uri' ]);

    // __proto__ is not assignable as an own key
    assert.ok(events[6].ownKeys.indexOf('__proto__$uri') !== -1);
    assert.ok(events[6].ownKeys.indexOf('__proto__') === -1);

    events.forEach(function(event) {
      assert.strictEqual(event.proto, Object.prototype, event.name);
    });

    assert.deepEqual(events[7].ownKeys, events[0].ownKeys);
  });


  it('should normalize xsi:type using inherited and redefined prefixes', function() {

    // when
    var events = record(
      '<root xmlns="http://a" xmlns:xsi="' + XSI_URI + '" xmlns:p="http://a">' +
        '<child xmlns="http://b" xmlns:p="http://c" xsi:type="p:T">' +
          '<inherited xsi:type="p:T" />' +
          '<unprefixed xsi:type="T" />' +
          '<undeclared xsi:type="xs:string" />' +
        '</child>' +
        '<restored xsi:type="p:T" />' +
        '<restoredDefault xsi:type="T" />' +
        '<custom xmlns:i="' + XSI_URI + '" i:type="p:T" />' +
      '</root>'
    );

    // then
    function xsiType(name) {
      return openTag(events, name).attrs['xsi:type'];
    }

    assert.equal(xsiType('child'), 'c:T');
    assert.equal(xsiType('inherited'), 'c:T');
    assert.equal(xsiType('unprefixed'), 'b:T');
    assert.equal(xsiType('undeclared'), 'xs:string');
    assert.equal(xsiType('restored'), 'a:T');
    assert.equal(xsiType('restoredDefault'), 'a:T');
    assert.equal(xsiType('custom'), 'a:T');
  });


  it('should handle deeply nested declarations and default namespace churn', function() {

    // given
    // nested prefix + default namespace declarations, followed by
    // siblings each declaring a new default namespace in the innermost scope
    var depth = 2000;

    var open = '', close = '', siblings = '';
    for (var i = 0; i < depth; i++) {
      open += '<p' + i + ':e xmlns:p' + i + '="urn:' + i + '" xmlns="urn:d' + i + '">';
      close = '</p' + i + ':e>' + close;
      siblings += '<s xmlns="urn:s' + i + '" />';
    }

    var xml = '<root xmlns="urn:root">' + open + siblings + '<m />' + close + '<after /></root>';

    var parser = new Parser({ proxy: true });

    parser.ns({});

    var innermost = 'p' + (depth - 1) + ':e';

    var names = [];
    var ns = {};

    parser.on('openTag', function(el) {
      var name = el.originalName;

      names.push(el.name);

      if (name === 'root' || name === innermost || name === 'm' || name === 'after') {
        ns[name] = Object.assign({}, el.ns);
      }
    });

    parser.on('error', function(err) {
      throw err;
    });

    // when
    parser.parse(xml);

    // then
    assert.equal(names.length, depth * 2 + 3);
    assert.equal(names[depth], innermost);
    assert.equal(names[depth * 2], 'ns' + depth * 2 + ':s');

    // innermost scope is restored after sibling churn
    assert.deepEqual(ns.m, ns[innermost]);
    assert.equal(names[depth * 2 + 1], 'ns' + depth + ':m');

    // outer scope is restored after closing all nested elements
    assert.deepEqual(ns.after, ns.root);
    assert.equal(names[depth * 2 + 2], 'ns0:after');
  });


  describe('proxy mode <ns>', function() {

    it('should expose live namespace state', function() {

      // given
      var parser = new Parser({ proxy: true });

      parser.ns({ 'http://a': 'a', 'http://b': 'b' });

      var captured = [];

      parser.on('openTag', function(el) {
        captured.push({
          name: el.originalName,
          ns: el.ns,
          copy: Object.assign({}, el.ns)
        });
      });

      // when
      parser.parse(
        '<root xmlns:p="http://a">' +
          '<p:child xmlns:p="http://b" xmlns:q="http://a"><p:x /></p:child>' +
          '<p:y />' +
        '</root>'
      );

      // then
      // namespace state is not copied per element
      captured.forEach(function(entry) {
        assert.strictEqual(entry.ns, captured[0].ns, entry.name);
      });

      // shallow copies reflect the state at the time of the copy
      assert.equal(captured[1].copy.p, 'b');
      assert.equal(captured[1].copy.q, 'a');
      assert.equal(captured[3].copy.p, 'a');
      assert.ok(!('q' in captured[3].copy));
    });


    it('should retain element copy including namespaces', function() {

      // given
      var parser = new Parser({ proxy: true });

      parser.ns({ 'http://a': 'a', 'http://b': 'b' });

      var copies = [];

      parser.on('openTag', function(el) {

        // cf. README
        copies.push(Object.assign({}, el, {
          ns: Object.assign({}, el.ns)
        }));
      });

      // when
      parser.parse(
        '<root xmlns:p="http://a">' +
          '<p:child xmlns:p="http://b" id="1" />' +
          '<p:y />' +
        '</root>'
      );

      // then
      var child = copies[1];

      assert.equal(child.name, 'b:child');
      assert.equal(child.originalName, 'p:child');
      assert.deepEqual(child.attrs, { 'xmlns:p': 'http://b', id: '1' });
      assert.equal(child.ns.p, 'b');
      assert.equal(child.ns.p$uri, 'http://b');

      assert.equal(copies[2].name, 'a:y');
      assert.equal(copies[2].ns.p, 'a');
      assert.notStrictEqual(child.ns, copies[2].ns);
    });

  });

});
