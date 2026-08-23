const fs = require('node:fs');

const xml = fs.readFileSync(`${__dirname}/sample.xml`, 'utf-8');

const {
  Parser
} = require('saxen');

const exec = require('./exec.cjs');


exec('parse', [

  [ 'default', () => () => {
    const parser = new Parser();

    parser.ns();

    parser.on('openTag', (elementName) => { });

    parser.parse(xml);
  } ],


  [ 'default + attrs', () => () => {
    const parser = new Parser();

    parser.ns();

    parser.on('openTag', (elementName, attrs) => {
      attrs();
    });

    parser.parse(xml);
  } ],


  [ 'proxy', () => () => {
    const parser = new Parser({ proxy: true });

    parser.ns();

    parser.on('openTag', el => {
      el.name;
    });

    parser.parse(xml);
  } ],


  [ 'proxy + attrs', () => () => {

    const parser = new Parser({ proxy: true });

    parser.ns();

    parser.on('openTag', el => {
      el.name;

      // el.originalName;
      // el.ns;
      el.attrs;
    });

    parser.parse(xml);
  } ],


  [ 'proxy / cached parser', () => {

    const parser = new Parser({ proxy: true });

    parser.ns();

    parser.on('openTag', el => {
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
    const parser = new Parser({ proxy: true });

    parser.ns();

    parser.on('openTag', el => {
      el.name;
      el.originalName;
      el.ns;
      el.attrs;
    });

    parser.parse(xml);
  } ]
], 100);