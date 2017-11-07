'use strict';

module.exports = Saxen;

var stringFromCharCode = String.fromCharCode;
var xharsQuot = {
  constructor: false,
  propertyIsEnumerable: false,
  toLocaleString: false,
  hasOwnProperty: false,
  isPrototypeOf: false,
  toString: false,
  valueOf: false,
  quot: '"',
  QUOT: '"',
  amp: '&',
  AMP: '&',
  nbsp: '\u00A0',
  apos: '\'',
  lt: '<',
  LT: '<',
  gt: '>',
  GT: '>',
  copy: '\u00A9',
  laquo: '\u00AB',
  raquo: '\u00BB',
  reg: '\u00AE',
  deg: '\u00B0',
  plusmn: '\u00B1',
  sup2: '\u00B2',
  sup3: '\u00B3',
  micro: '\u00B5',
  para: '\u00B6'
};

function error(msg) {
  return new Error(msg);
}

function replaceEntities(s, d, x, z) {
  if (z) {
    return xharsQuot[z] || '\x01';
  }

  if (d) {
    return stringFromCharCode(d);
  }

  return stringFromCharCode(parseInt(x, 16));
}

function decodeEntities(s) {
  s = ('' + s);

  if (s.length > 3 && s.indexOf('&') !== -1) {
    if (s.indexOf('&quot;') !== -1) s = s.replace(/&quot;/g, '"');
    if (s.indexOf('&gt;') !== -1) s = s.replace(/&gt;/g, '>');
    if (s.indexOf('&lt;') !== -1) s = s.replace(/&lt;/g, '<');

    if (s.indexOf('&') !== -1) {
      s = s.replace(/&#(\d+);|&#x([0123456789abcdef]+);|&(\w+);/ig, replaceEntities);
    }
  }

  return s;
}

function cloneNsMatrix(nsMatrix) {
  var clone = {}, key;
  for (key in nsMatrix) {
    clone[key] = nsMatrix[key];
  }
  return clone;
}

function uriPrefix(prefix) {
  return prefix + '$uri';
}

function buildNsMatrix(nsUriToPrefix) {
  var nsMatrix = {},
      uri,
      prefix;

  for (uri in nsUriToPrefix) {
    prefix = nsUriToPrefix[uri];
    nsMatrix[prefix] = prefix;
    nsMatrix[uriPrefix(prefix)] = uri;
  }

  return nsMatrix;
}

function noopGetContext() {  return { line: 0, column: 0 }; }

function nullFunc() {}

function throwFunc(err) {
  throw err;
}

/**
 * Creates a new parser with the given options.
 *
 * @constructor
 *
 * @param  {!Object<string, ?>} options
 */
function Saxen(options) {

  if (!this) {
    return new Saxen(options);
  }

  var proxy = options && options.proxy;

  var onTextNode = nullFunc,
      onStartNode = nullFunc,
      onEndNode = nullFunc,
      onCDATA = nullFunc,
      onError = throwFunc,
      onComment,
      onQuestion,
      onAttention;

  var getContext = noopGetContext;

  /**
   * Do we need to parse the current elements attributes for namespaces?
   *
   * @type {boolean}
   */
  var maybeNS = false;

  /**
   * Do we process namespaces at all?
   *
   * @type {boolean}
   */
  var isNamespace = false;

  /**
   * The caught error returned on parse end
   *
   * @type {Error}
   */
  var returnError = null;

  /**
   * Should we stop parsing?
   *
   * @type {boolean}
   */
  var parseStop = false; // прервать парсер

  /**
   * A map of { uri: prefix } used by the parser.
   *
   * This map will ensure we can normalize prefixes during processing;
   * for each uri, only one prefix will be exposed to the handlers.
   *
   * @type {!Object<string, string>}}
   */
  var nsUriToPrefix;


  function failSafe(cb, onError) {
    return function() {
      try {
        cb.apply(this, arguments);
      } catch (err) {
        onError(err);
      }
    };
  }

  function handleError(err) {
    if (!(err instanceof Error)) {
      err = error(err);
    }

    returnError = err;

    onError(err, getContext);
  }

  /**
   * Register parse listener.
   *
   * @param  {string}   name
   * @param  {Function} cb
   *
   * @return {Saxen}
   */
  this.on = function(name, cb) {

    if (typeof cb !== 'function') {
      throw error('required args <name, cb>');
    }

    if (name !== 'error') {
      cb = failSafe(cb, handleError);
    }

    switch (name) {
    case 'startNode': onStartNode = cb; break;
    case 'textNode': onTextNode = cb; break;
    case 'endNode': onEndNode = cb; break;
    case 'error': onError = cb; break;
    case 'cdata': onCDATA = cb; break;

    case 'attention': onAttention = cb; break; // <!XXXXX zzzz="eeee">
    case 'question': onQuestion = cb; break; // <? ....  ?>
    case 'comment': onComment = cb; break;
    default:
      throw error('unsupported event: ' + name);
    }

    return this;
  };

  /**
   * Set the namespace to prefix mapping.
   *
   * @example
   *
   * parser.ns({
   *   'http://foo': 'foo',
   *   'http://bar': 'bar'
   * });
   *
   * @param  {!Object<string, string>} nsMap
   *
   * @return {Saxen}
   */
  this.ns = function(nsMap) {

    if (typeof nsMap === 'undefined') {
      nsMap = {};
    }

    if (typeof nsMap !== 'object') {
      throw error('required args <nsMap={}>');
    }

    var _nsUriToPrefix = {}, k;

    for (k in nsMap) {
      _nsUriToPrefix[k] = nsMap[k];
    }

    isNamespace = true;
    nsUriToPrefix = _nsUriToPrefix;

    return this;
  };

  /**
   * Parse xml string.
   *
   * @param  {string} xml
   *
   * @return {Error} returnError, if not thrown
   */
  this.parse = function(xml) {
    if (typeof xml !== 'string') {
      throw error('required args <xml=string>');
    }

    returnError = null;

    parse(xml);

    getContext = noopGetContext;
    parseStop = false;

    return returnError;
  };

  /**
   * Stop parsing.
   */
  this.stop = function() {
    parseStop = true;
  };

  /**
   * Parse string, invoking configured listeners on element.
   *
   * @param  {string} str
   */
  function parse(str) {
    var xml = ('' + str),
        nsMatrixStack = isNamespace ? [] : null,
        nsMatrix = isNamespace ? buildNsMatrix(nsUriToPrefix) : null,
        _nsMatrix,
        nodeStack = [],
        anonymousNsCount = 0,
        tagStart = false,
        tagEnd = false,
        j = 0, i = 0,
        x, y, q, w,
        xmlns,
        xmlnsStack = isNamespace ? [] : null,
        _xmlns,
        elementName,
        _elementName,
        elementProxy
        ;

    var attrsString = '',
        attrsStart = 0,
        cachedAttrs // false = parsed with errors, null = needs parsing
        ;

    /**
     * Parse attributes on demand and returns the parsed attributes.
     *
     * Return semantics: (1) `false` on attribute parse error,
     * (2) true on no attributes, (3) object hash on extracted attrs.
     *
     * @return {boolean|Object}
     */
    function getAttrs() {
      if (cachedAttrs !== null) {
        return cachedAttrs;
      }

      var nsAttrName,
          nsUri,
          nsUriPrefix,
          attrList = isNamespace && maybeNS ? [] : null,
          i = attrsStart,
          s = attrsString,
          l = s.length,
          hasNewMatrix,
          newalias,
          value,
          alias,
          name,
          attrs = {},
          ok,
          w,
          j;


      for (; i < l; i++) {
        w = s.charCodeAt(i);

        if (w === 32 || (w < 14 && w > 8) ) { // \f\n\r\t\v
          continue;
        }

        // wait for non whitespace character
        if (w < 65 || w > 122 || (w > 90 && w < 97) ) {
          if (w !== 95 && w !== 58) { // char 95"_" 58":"
            return cachedAttrs = false; // error. invalid first char
          }
        }

        // parse attribute name
        for (j = i + 1; j < l; j++) {
          w = s.charCodeAt(j);

          if ( w > 96 && w < 123 || w > 64 && w < 91 || w > 47 && w < 59 || w === 45 || w === 95) {
            continue;
          }

          if (w !== 61) { // "=" == 61
            return cachedAttrs = false; // error. invalid char "="
          }

          break;
        }

        name = s.substring(i, j);
        ok = true;

        if (name === 'xmlns:xmlns') {
          return cachedAttrs = false; // error. invalid name
        }

        w = s.charCodeAt(j + 1);

        if (w === 34) {  // '"'
          j = s.indexOf('"', i = j + 2 );

        } else {
          if (w !== 39) { // "'"
            return cachedAttrs = false; // error. invalid char
          }

          j = s.indexOf('\'', i = j + 2 );
        }

        if (j === -1) {
          return cachedAttrs = false; // error. invalid char
        }

        if (j + 1 < l) {
          w = s.charCodeAt(j + 1);

          if (w > 32 || w < 9 || (w < 32 && w > 13)) {
            // error. invalid char
            return cachedAttrs = false;
          }
        }


        value = s.substring(i, j);

        // advance cursor to next attribute
        i = j + 1;

        if (!isNamespace) {
          attrs[name] = value;
          continue;
        }

        // try to extract namespace information
        if (maybeNS) {
          newalias = (
            name === 'xmlns'
              ? 'xmlns'
              : (name.charCodeAt(0) === 120 && name.substr(0, 6) === 'xmlns:')
                ? name.substr(6)
                : null
          );

          // handle xmlns(:alias) assignment
          if (newalias !== null) {
            nsUri = decodeEntities(value);
            nsUriPrefix = uriPrefix(newalias);

            alias = nsUriToPrefix[nsUri];

            if (!alias) {
              // no prefix defined or prefix collision
              if (
                (newalias === 'xmlns') ||
                (nsUriPrefix in nsMatrix && nsMatrix[nsUriPrefix] !== nsUri)
              ) {
                // alocate free ns prefix
                do {
                  alias = 'ns' + (anonymousNsCount++);
                } while (typeof nsMatrix[alias] !== 'undefined');
              } else {
                alias = newalias;
              }

              nsUriToPrefix[nsUri] = alias;
            }

            if (nsMatrix[newalias] !== alias) {
              if (!hasNewMatrix) {
                nsMatrix = cloneNsMatrix(nsMatrix);
                hasNewMatrix = true;
              }

              nsMatrix[newalias] = alias;
              if (newalias === 'xmlns') {
                nsMatrix[uriPrefix(alias)] = nsUri;
              }

              nsMatrix[nsUriPrefix] = nsUri;
            }

            // expose xmlns(:asd)="..." in attributes
            attrs[name] = value;
            continue;
          }

          // collect attributes until all namespace declarations
          // are processed
          attrList.push(name, value);
          continue;
        }

        w = name.indexOf(':');
        if (w === -1) {
          attrs[name] = value;
          continue;
        }

        // normalize namespaced attribute names
        if ((nsAttrName = nsMatrix[name.substring(0, w)])) {
          nsAttrName = nsMatrix['xmlns'] === nsAttrName ? name.substr(w + 1) : nsAttrName;
          attrs[nsAttrName + name.substr(w)] = value;
        }
      }


      if (!ok) {
        // could not parse attributes, skipping
        return cachedAttrs = true;
      }

      // handle deferred, possibly namespaced attributes
      if (maybeNS)  {
        alias = nsMatrix['xmlns'];

        for (i = 0, l = attrList.length; i < l; i++) {
          name = attrList[i++];

          w = name.indexOf(':');
          if (w !== -1) {
            if ((nsAttrName = nsMatrix[name.substring(0, w)])) {
              nsAttrName = alias === nsAttrName ? name.substr(w + 1) : nsAttrName + name.substr(w);
              attrs[nsAttrName] = attrList[i];
            }
            continue;
          }
          attrs[name] = attrList[i];
        }
      }

      return cachedAttrs = attrs;
    }

    /**
     * Extract the parse context { line, column, part }
     * from the current parser position.
     *
     * @return {Object} parse context
     */
    function getParseContext() {
      var splitsRe = /(\r\n|\r|\n)/g;

      var line = 0;
      var column = 0;
      var startOfLine = 0;
      var endOfLine = j;
      var match;
      var data;

      while (i >= startOfLine) {

        match = splitsRe.exec(xml);

        if (!match) {
          break;
        }

        // end of line = (break idx + break chars)
        endOfLine = match[0].length + match.index;

        if (endOfLine > i) {
          break;
        }

        // advance to next line
        line += 1;

        startOfLine = endOfLine;
      }

      // EOF errors
      if (i == -1) {
        column = endOfLine;
        data = '';
      } else {
        column = i - startOfLine;
        data = (j == -1 ? xml.substring(i) : xml.substring(i, j + 1));
      }

      return {
        data: data,
        line: line,
        column: column
      };
    }

    getContext = getParseContext;


    if (proxy) {
      elementProxy = Object.create({}, {
        name: {
          get: function() {
            return elementName;
          }
        },
        originalName: {
          get: function() {
            return _elementName;
          }
        },
        attrs: {
          get: getAttrs
        }
      });
    }

    // actual parse logic
    while (j !== -1) {

      if (xml.charCodeAt(j) === 60) { // "<"
        i = j;
      } else {
        i = xml.indexOf('<', j);
      }

      if (i === -1) { // конец разбора
        if (nodeStack.length) {
          return handleError('unexpected end of file');
        }

        return;
      }

      if (j !== i) {
        onTextNode(xml.substring(j, i), decodeEntities);
        if (parseStop) {
          return;
        }
      }

      w = xml.charCodeAt(i+1);

      // parse comments + CDATA
      if (w === 33) { // "!"
        w = xml.charCodeAt(i+2);
        if (w === 91 && xml.substr(i + 3, 6) === 'CDATA[') { // 91 == "["
          j = xml.indexOf(']]>', i);
          if (j === -1) {
            return handleError('unclosed cdata');
          }

          onCDATA(xml.substring(i + 9, j), false);
          if (parseStop) {
            return;
          }

          j += 3;
          continue;
        }


        if (w === 45 && xml.charCodeAt(i + 3) === 45) { // 45 == "-"
          j = xml.indexOf('-->', i);
          if (j === -1) {
            return handleError('unclosed comment');
          }


          if (onComment) {
            onComment(xml.substring(i + 4, j), decodeEntities);
            if (parseStop) {
              return;
            }
          }

          j += 3;
          continue;
        }

        j = xml.indexOf('>', i + 1);
        if (j === -1) {
          return handleError('unclosed tag');
        }

        if (onAttention) {
          onAttention(xml.substring(i, j + 1), decodeEntities);
          if (parseStop) {
            return;
          }
        }

        j += 1;
        continue;
      }

      if (w === 63) { // "?"
        j = xml.indexOf('?>', i);
        if (j === -1) { // error
          return handleError('unclosed question');
        }

        if (onQuestion) {
          onQuestion(xml.substring(i, j + 2));
          if (parseStop) {
            return;
          }
        }

        j += 2;
        continue;
      }

      j = xml.indexOf('>', i + 1);

      if (j == -1) { // error
        return handleError('unclosed tag');
      }

      cachedAttrs = true; // stop attribute processing

      //if (xml.charCodeAt(i+1) === 47) { // </...
      if (w === 47) { // </...
        tagStart = false;
        tagEnd = true;

        // verify open <-> close tag match
        x = elementName = nodeStack.pop();
        q = i + 2 + x.length;

        if (xml.substring(i + 2, q) !== x) {
          return handleError('closing tag mismatch');
        }

        // проверим что в закрываюшем теге нет лишнего
        for (; q < j; q++) {
          w = xml.charCodeAt(q);

          if (w === 32 || (w > 8 && w < 14)) {  // \f\n\r\t\v space
            continue;
          }

          return handleError('close tag');
        }

      } else {
        if (xml.charCodeAt(j - 1) ===  47) { // .../>
          x = elementName = xml.substring(i + 1, j - 1);

          tagStart = true;
          tagEnd = true;

        } else {
          x = elementName = xml.substring(i + 1, j);

          tagStart = true;
          tagEnd = false;
        }

        if (!(w > 96  && w < 123 || w > 64 && w < 91 || w === 95 || w === 58)) { // char 95"_" 58":"
          return handleError('illegal first char nodeName');
        }

        for (q = 1, y = x.length; q < y; q++) {
          w = x.charCodeAt(q);

          if (w > 96 && w < 123 || w > 64 && w < 91 || w > 47 && w < 59 || w === 45 || w === 95) {
            continue;
          }

          if (w === 32 || (w < 14 && w > 8)) { // \f\n\r\t\v space
            elementName = x.substring(0, q);
            // maybe there are attributes
            cachedAttrs = null;
            break;
          }

          return handleError('invalid nodeName');
        }

        if (!tagEnd) {
          nodeStack.push(elementName);
        }
      }

      if (isNamespace) {

        _nsMatrix = nsMatrix;
        _xmlns = xmlns;

        if (tagStart) {
          // remember old namespace
          // unless we're self-closing
          if (!tagEnd) {
            nsMatrixStack.push(_nsMatrix);
            xmlnsStack.push(xmlns);
          }

          if (cachedAttrs !== true) {
            // quick check, whether there may be namespace
            // declarations on the node; if that is the case
            // we need to eagerly parse the node attributes
            if ((maybeNS = x.indexOf('xmlns', q) !== -1)) {
              attrsStart = q;
              attrsString = x;

              getAttrs();

              maybeNS = false;
            }
          }
        }

        _elementName = elementName;

        w = elementName.indexOf(':');
        if (w !== -1) {
          xmlns = nsMatrix[elementName.substring(0, w)];
          elementName = elementName.substr(w + 1);
        } else {
          xmlns = nsMatrix['xmlns'];

          if (!xmlns && _xmlns) {
            // if no default xmlns is defined,
            // inherit xmlns from parent
            xmlns = _xmlns;
          }
        }

        if (!xmlns) {
          return handleError('missing namespace on <' + _elementName + '>');
        }

        elementName = xmlns + ':' + elementName;
      }

      if (tagStart) {
        attrsStart = q;
        attrsString = x;

        if (proxy) {
          onStartNode(elementProxy, decodeEntities, tagEnd, getContext);
        } else {
          onStartNode(elementName, getAttrs, decodeEntities, tagEnd, getContext);
        }

        if (parseStop) {
          return;
        }

        cachedAttrs = true;
      }

      if (tagEnd) {
        onEndNode(proxy ? elementProxy : elementName, decodeEntities, tagStart, getContext);

        if (parseStop) {
          return;
        }

        // restore old namespace
        if (isNamespace) {
          if (!tagStart) {
            nsMatrix = nsMatrixStack.pop();
            xmlns = xmlnsStack.pop();
          } else {
            nsMatrix = _nsMatrix;
            xmlns = _xmlns;
          }
        }
      }

      j += 1;
    }
  } /** end parse */

}