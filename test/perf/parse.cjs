const fs = require('node:fs');

const xml = fs.readFileSync(`${__dirname}/sample.xml`, 'utf-8');

const {
  Parser
} = require('saxen');

const exec = require('./exec.cjs');

const xmlChunks = split(xml, 139);


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
  } ],


  [ 'stream', () => () => {
    const parser = new Parser();

    parser.ns();

    parser.on('openTag', (elementName) => { });

    streamTo(parser, xmlChunks);
  } ],


  [ 'stream + attrs', () => () => {
    const parser = new Parser();

    parser.ns();

    parser.on('openTag', (elementName, attrs) => {
      attrs();
    });

    streamTo(parser, xmlChunks);
  } ],


  [ 'stream + proxy + attrs', () => () => {
    const parser = new Parser();

    parser.ns();

    parser.on('openTag', (elementName, attrs) => {
      attrs();
    });

    streamTo(parser, xmlChunks);
  } ],
], 100);


function split(xml, chunkSize) {

  const chunks = [];

  let startIdx = 0;

  do {
    const endIdx = Math.min(xml.length, startIdx + chunkSize);

    chunks.push(xml.substring(startIdx, endIdx));

    startIdx = endIdx;
  } while (startIdx < xml.length);

  return chunks;
}

function streamTo(parser, xmlChunks) {

  for (const chunk of xmlChunks) {
    parser.write(chunk);
  }
}