var {
  table
} = require('table');

var now = Date.now;

module.exports = function(suite, tests, interations) {

  var results = [];

  for (var i = 0; i < tests.length; i++) {

    var [ name, test ] = tests[i];

    var start = now();

    var run = test();

    for (var j = 0; j < interations; j++) {
      run();
    }

    var t = now() - start;

    results.push([ name, t ]);
  }


  var min = results.reduce(function(min, record) {

    if (min === -1 || record[1] < min) {
      return record[1];
    }

    return min;
  }, -1);


  results = results.map(function(record) {

    var diff = Math.round((1 - min / record[1]) * 10000) / 100;

    return [ ...record, diff >= 0 ? '+' + diff + '%' : '-' + diff + '%' ];
  });

  console.log('perf results:', suite);
  console.log(table(results));
};