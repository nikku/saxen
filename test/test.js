import {
  Parser
} from '../lib';

import assert from 'assert';
import { inspect } from 'util';

export default function test(op) {
  it(op.xml.substr(0, 275), function() {
    _test(op || {});
  });
}

// allow .only and .skip on test helper
[ 'only', 'skip' ].forEach(function(key) {
  test[key] = function(op) {
    it[key](op.xml.substr(0, 275), function() {
      test(op || {});
    });
  };
});


function _test(options) {
  var parser = options.parser;
  var error = false;
  var expectedEntries = options.expect;

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

  var recordedEntries = [];

  function record() {
    recordedEntries.push(arguments);
  }

  function verifyRecord(actual, actualIdx, expected) {

    function prefix(columnIdx) {
      return 'record ' + actualIdx + (typeof columnIdx !== 'undefined' ? ',' + columnIdx : '') + ' ';
    }

    assert.ok(expected, prefix() + 'unexpected: ' + inspect(actual));

    var name = actual[0];

    var obj;

    for (var idx = 0, l = expected.length; idx < l; idx++) {
      var expectedValue = expected[idx];
      var actualValue = actual[idx];

      if (name === 'openTag' && idx === 2) {
        // be able to skip attrs check
        if (expectedValue === false) {
          assert.equal(actualValue, expectedValue, prefix(idx) + ' attrs to equal ' + expectedValue);
        } else {
          assert.ok(typeof actualValue === 'object', prefix(idx) + ' attrs is an object');

          obj = {};

          // validate individual, expected attrs
          for (var key in expectedValue) {
            if (Object.prototype.hasOwnProperty.call(expectedValue, key)) {
              obj[key] = actualValue[key];
            }
          }

          assert.deepEqual(
            obj,
            expectedValue,
            prefix(idx) + ' attrs should equal');
        }

        continue;
      }


      // compare actual Error{message} with expected error message
      if ((name === 'error' || name === 'warn') && idx === 1) {
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

    assert.equal(
      recordedEntries.length,
      expectedEntries.length,
      'expected ' + expectedEntries.length + ' records, got ' + recordedEntries.length + ': \n\n' +
      indent(inspect(recordedEntries), '  ') + '\n\n---\n\n' +
      indent(inspect(expectedEntries), '  ') + '\n'
    );

    for (var idx = 0; idx < recordedEntries.length; idx++) {
      verifyRecord(recordedEntries[idx], idx, expectedEntries[idx]);
    }
  }

  parser.on('error', function(err, getContext) {
    record('error', err, getContext());
  });

  parser.on('warn', function(err, getContext) {
    record('warn', err, getContext());
  });

  parser.on('openTag', function(elem, attr, uq, tagend, getContext) {
    record('openTag', elem, attr(), tagend, getContext());
  });

  parser.on('closeTag', function(elem, uq, tagstart, getContext) {
    record('closeTag', elem, tagstart, getContext());
  });

  parser.on('text', function(s, uq, getContext) {
    record('text', s, getContext());
  });

  parser.on('cdata', function(data, getContext) {
    record('cdata', data, getContext());
  });

  parser.on('comment', function(text, uq, getContext) {
    record('comment', text, getContext());
  });

  parser.on('attention', function(data, uq, getContext) {
    record('attention', data, getContext());
  });

  parser.on('question', function(data, getContext) {
    record('question', data, getContext());
  });

  parser.parse(options.xml);

  return verify();
}



function indent(text, str) {
  return str + text.split(/\n/g).join('\n' + str);
}