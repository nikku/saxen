var assert = require('assert');

var fs = require('fs');

var EasySax = require('../easysax');


describe('performance', function() {

  var xml = fs.readFileSync(__dirname + '/sample.xml', 'utf-8');

  function time(fn) {

    var s = Date.now();

    fn();

    return Date.now() - s;
  }


  function test() {

    var parser = new EasySax();

    parser.ns({
        'http://foo': 'foo'
    });

    var counter = 0;

    parser.on('startNode', function(name, attrs) {
        counter++;

        attrs();
    });

    // when
    parser.parse(xml);

    // then
    assert.ok(counter > 2000);
  }


  function repeater(fn, times) {
    return function() {
      for (var i = 0; i < times; i++) {
        fn();
      }
    };
  }

  function repeat(fn, times) {
    repeater(fn, times)();
  }


  it('should parse FAST', function() {

    // given
    repeat(test, 5);
    var no = 20;

    // when
    var t = time(repeater(test, no));

    var average = t / no;

    // then
    assert.ok(average < 12, average + ' < 5');
  });

});