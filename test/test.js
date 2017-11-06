var Parser = require('../');
var assert = require('assert');
var util = require('util');

var inspect = util.inspect;

/*
describe('test-01', function() {
    it('создание корневого элемента', function() {
        assert.equal('MyBlock', b(''));
    });
});


test({
    xml: '<div/>',
    ns: false, // 'rss',
    to: [
        ['startNode', 'div', {}, true],
    ],
});
*/

module.exports = function(op) {
  it(op.xml.substr(0, 275), function() {
    test(op || {});
  });
};


// allow .only and .skip on test helper
[ 'only', 'skip' ].forEach(function(key) {
  module.exports[key] = function(op) {
    it[key](op.xml.substr(0, 275), function() {
      test(op || {});
    });
  };
});


function test(options) {
  var parser = options.parser;
  var error = false;
  var list = options.to;

  if (!parser) {
    parser = new Parser();

    if (options.ns) {
      parser.ns({
        'http://search.yahoo.com/mrss/': 'media',
        'http://www.w3.org/1999/xhtml': 'xhtml',
        'http://www.w3.org/2005/Atom': 'atom',
        'http://purl.org/rss/1.0/': 'rss',
      });
    }
  }

  var results = [];

  function record() {
    results.push(arguments);
  }

  function verifyRecord(actual, actualIdx, expected) {

    function prefix(columnIdx) {
      return 'record ' + actualIdx + (typeof columnIdx !== undefined ? ',' + columnIdx : '') + ' ';
    }

    if (!expected) {
      assert(expected, prefix() + util.inspect(actual));
    }

    var name = actual[0];

    for (var idx = 0, l = expected.length; idx < l; idx++) {
      var expectedValue = expected[idx];
      var actualValue = actual[idx];

      if (name === 'startNode' && idx === 2) {
        // be able to skip attrs check
        if (!expectedValue || expectedValue === true) {
          assert.equal(!!actualValue, expectedValue, prefix(idx) + ' attrs equal ' + expectedValue);

        } else {

          // validate individual, expected attrs
          for (var key in expectedValue) {
            assert.equal(
              actualValue[key],
              expectedValue[key],
              prefix(idx) + ' attrs[' + key + '] equal ' + expectedValue[key]);
          }
        }

        continue;
      }


      // compare actual Error{message} with expected error message
      if (name === 'error' && idx === 1) {
        assert.ok(actualValue instanceof Error, prefix(idx) + inspect(actualValue) + ' is Error');
        assert.equal(actualValue.message, expectedValue);

        continue;
      }

      assert.deepEqual(
        actualValue,
        expectedValue,
        prefix(idx) + inspect(actualValue) + ' deepEqual ' + inspect(expectedValue)
      );
    }
  }

  function verify() {
    if (error) {
      return;
    }

    for (var idx = 0; idx < results.length; idx++) {
      verifyRecord(results[idx], idx, list[idx]);
    }

    assert.equal(results.length, list.length, 'expected ' + list.length + ' records, got ' + results.length);
  }

  parser.on('error', function(msg, getContext) {
    record('error', msg, getContext());
  });

  parser.on('startNode', function(elem, attr, uq, tagend, getContext) {
    record('startNode', elem, attr(), tagend, getContext());
  });

  parser.on('endNode', function(elem, uq, tagstart, getContext) {
    record('endNode', elem, tagstart, getContext());
  });

  parser.on('textNode', function(s, uq) {
    record('textNode', s);
  });

  parser.on('cdata', function(data) {
    record('cdata', data);
  });

  parser.on('comment', function(text) {
    record('comment', text);
  });

  parser.parse(options.xml);

  return verify();
}


