const {
  table
} = require('table');

const now = Date.now;


module.exports = function exec(suite, tests, interations) {

  const results = [];

  for (let i = 0; i < tests.length; i++) {

    const [ name, test ] = tests[i];

    const start = now();

    const run = test();

    for (let j = 0; j < interations; j++) {
      run();
    }

    const t = now() - start;

    results.push([ name, t ]);
  }


  const min = results.reduce((min, record) => {

    if (min === -1 || record[1] < min) {
      return record[1];
    }

    return min;
  }, -1);


  const resultsWithDiff = results.map(record => {

    const diff = Math.round((1 - min / record[1]) * 10000) / 100;

    return [ ...record, `${diff >= 0 ? '+' : '-'}${diff}%` ];
  });

  console.log('perf results:', suite);
  console.log(table(resultsWithDiff));
};