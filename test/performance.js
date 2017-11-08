var assert = require('assert');

var fs = require('fs');

var Parser = require('../');


describe('performance', function() {

  var xml = fs.readFileSync(__dirname + '/sample.xml', 'utf-8');

  function time(fn) {

    var s = Date.now();

    fn();

    return Date.now() - s;
  }


  function test(options) {

    return function() {
      var parser = new Parser(options);

      parser.ns({
        'http://foo': 'foo'
      });

      var counter = 0;

      parser.on('openTag', function(el, attrs) {
        counter++;

        // el.attrs;
        el.name;
        el.originalName;
        el.ns;

        // attrs();
      });

      // when
      parser.parse(xml);

      // then
      assert.ok(counter > 2000);
    };

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


  it('should parse FAST (proxy)', function() {

    this.timeout(10000);

    console.log('PERF (proxy -> plain)');

    repeat(function() {
      // given
      var no = 200;

      // when
      repeat(test({ proxy: true }), 5);

      var t = time(repeater(test({ proxy: true }), no));

      var average = t / no;

      repeat(test(), 5);

      var t1 = time(repeater(test(), no));

      var average1 = t1 / no;

      var difference = Math.round((t/t1) * 100) - 100;

      console.table({
        PLAIN: {
          avg: average1,
          sum: t1,
          diff: ''
        },
        PROXY: {
          avg: average,
          sum: t,
          diff: (difference > 0 ? '+' : '') + difference + '%'
        }
      });

      console.log('diff: %s%s% ', (difference > 0 ? '+' : ''), difference);

      // then
      assert.ok(average < 12, average + ' < 5');
    }, 5);
  });

});