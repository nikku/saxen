const fs = require('node:fs');

const entities = fs.readFileSync(__dirname + '/entities.txt', 'utf-8').split(/\n/g);

const {
  decode
} = require('saxen');

const exec = require('./exec.cjs');


exec('decode', [

  [ 'noop', () => () => {
    entities.map(function(s) { return s; });
  } ],

  [ 'decodeEntities original', () => () => {
    entities.map(decode);
  } ]

], 500);