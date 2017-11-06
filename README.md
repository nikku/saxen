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

// enable namespace parsing
// element prefixes will automatically adjusted
// to the ones configured here
parser.ns({
  'http://foo': 'foo',
  'bar': 'http://bar'
});

parser.on('startNode', function(elementName, getAttrs, decodeEntity, isClosing, getContext) {

  elementName;
  // with prefix, i.e. foo:blub

  var attrs = getAttrs();
  // { name: value }
});

parser.on('endNode', function(elementName, decodeEntity, isOpening, getContext) {
  ...
});

parser.on('error', function(err, getContext) {
  // rethrow or compensate for err
});

parser.parse('<blub xmlns="http://foo" />');
```


## Credits

This library builds on the awesome work done by [easysax](https://github.com/vflash/easysax) and adds anonymous namespace handling and an object mode.

It is named after [Sachsen](https://en.wikipedia.org/wiki/Saxony), a federal state of Germany. So geht sächsisch!


## LICENSE

MIT
