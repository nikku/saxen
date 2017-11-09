# `/saxen/` parser <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Coat_of_arms_of_Saxony.svg/220px-Coat_of_arms_of_Saxony.svg.png" align="right" />

[![Build Status](https://travis-ci.org/nikku/saxen.svg?branch=master)](https://travis-ci.org/nikku/saxen)

A tiny, super fast, namespace aware [sax-style](https://en.wikipedia.org/wiki/Simple_API_for_XML) XML parser written in plain JavaScript.


## Features

* (optional) entity decoding and attribute parsing
* (optional) namespace aware
* element / attribute normalization in namespaced mode
* tiny (`4Kb` minified + gzipped)


## Usage

```javascript
var Parser = require('saxen');

var parser = new Parser();

// enable namespace parsing: element prefixes will
// automatically adjusted to the ones configured here
// elements in other namespaces will still be processed
parser.ns({
  'http://foo': 'foo',
  'http://bar': 'bar'
});

parser.on('openTag', function(elementName, attrGetter, decodeEntity, selfClosing, getContext) {

  elementName;
  // with prefix, i.e. foo:blub

  var attrs = attrGetter();
  // { 'bar:aa': 'A', ... }
});

parser.parse('<blub xmlns="http://foo" xmlns:bar="http://bar" bar:aa="A" />');
```


## Supported Hooks

Saxen supports the following parse hooks:

* `openTag(elementName, attrGetter, decodeEntities, selfClosing, contextGetter)`
* `closeTag(elementName, selfClosing, contextGetter)`
* `error(err, contextGetter)`
* `warn(warning, contextGetter)`
* `text(value, decodeEntities)`
* `cdata(value)`
* `comment(value, decodeEntities)`
* `attention(str, decodeEntities)`
* `question(str)`

In contrast to `error`, `warn` receives recoverable errors, such as malformed attributes.


## Namespace Handling

In namespace mode, the parser will adjust tag and attribute namespace prefixes before
passing the elements name to `openTag` or `closeTag`. To do that, you need to
configure default prefixes for wellknown namespaces:

```javascript
parser.ns({
  'http://foo': 'foo',
  'http://bar': 'bar'
});
```

To skip the adjustment and still process namespace information:

```javascript
parser.ns();
```


## Non-Features

This library lacks some features known in other XML parsers such as [sax-js](https://github.com/isaacs/sax-js):

* no support for parsing loose documents, such as arbitrary HTML snippets
* no support for text trimming
* no automatic entity decoding
* no automatic attribute parsing

...and that is ok ❤.


## Credits

This library builds on the awesome work done by [easysax](https://github.com/vflash/easysax).

It is named after [Sachsen](https://en.wikipedia.org/wiki/Saxony), a federal state of Germany. So geht sächsisch!


## LICENSE

MIT
