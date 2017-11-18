var fs = require('fs');

var entities = fs.readFileSync(__dirname + '/entities.txt', 'utf-8').split(/\n/g);

var decodeEntities = require('../../decode');

var exec = require('./exec');


exec('decode', [

  ['noop', () => () => {
    entities.map(function(s) { return s; });
  } ],

  [ 'decodeEntities original', () => () => {
    entities.map(decodeEntities);
  } ]

], 500);