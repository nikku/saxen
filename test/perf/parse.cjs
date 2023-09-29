const fs = require('node:fs');

const xml = fs.readFileSync(__dirname + '/sample.xml', 'utf-8');

const {
  Parser
} = require('saxen');

const exec = require('./exec.cjs');


exec('parse', [

  [ 'proxy', () => () => {
    var parser = new Parser({ proxy: true });

    parser.ns();

    parser.on('openTag', function(el) {
      el.name;
    });

    parser.parse(xml);
  } ],


  [ 'default', () => () => {
    var parser = new Parser();

    parser.ns();

    parser.on('openTag', function(elementName) { });

    parser.parse(xml);
  } ],


  [ 'proxy + attrs', () => () => {

    var parser = new Parser({ proxy: true });

    parser.ns();

    parser.on('openTag', function(el) {
      el.name;

      // el.originalName;
      // el.ns;
      el.attrs;
    });

    parser.parse(xml);
  } ],


  [ 'default + attrs', () => () => {
    var parser = new Parser();

    parser.ns();

    parser.on('openTag', function(elementName, attrs) {
      attrs();
    });

    parser.parse(xml);
  } ],


  [ 'proxy / cached parser', () => {

    var parser = new Parser({ proxy: true });

    parser.ns();

    parser.on('openTag', function(el) {
      el.name;
      el.originalName;
      el.ns;
      el.attrs;
    });

    return () => {
      parser.parse(xml);
    };
  } ],


  [ 'proxy / full', () => () => {
    var parser = new Parser({ proxy: true });

    parser.ns();

    parser.on('openTag', function(el) {
      el.name;
      el.originalName;
      el.ns;
      el.attrs;
    });

    parser.parse(xml);
  } ]
], 100);