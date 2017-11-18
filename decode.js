'use strict';

module['exports'] = decodeEntities;


var fromCharCode = String.fromCharCode;

var hasOwnProperty = Object.prototype.hasOwnProperty;

var ENTITY_PATTERN = /&#(\d+);|&#x([0-9a-f]+);|&(\w+);/ig;

var ENTITY_MAPPING = {
  'amp': '&',
  'apos': '\'',
  'gt': '>',
  'lt': '<',
  'quot': '"'
};

// map UPPERCASE variants of supported special chars
Object.keys(ENTITY_MAPPING).forEach(function(k) {
  ENTITY_MAPPING[k.toUpperCase()] = ENTITY_MAPPING[k];
});


function replaceEntities(_, d, x, z) {

  // reserved names, i.e. &nbsp;
  if (z) {
    if (hasOwnProperty.call(ENTITY_MAPPING, z)) {
      return ENTITY_MAPPING[z];
    } else {
      // fall back to original value
      return '&' + z + ';';
    }
  }

  // decimal encoded char
  if (d) {
    return fromCharCode(d);
  }

  // hex encoded char
  return fromCharCode(parseInt(x, 16));
}


/**
 * A basic entity decoder that can decode a minimal
 * sub-set of reserved names (&amp;) as well as
 * hex (&#xaaf;) and decimal (&#1231;) encoded characters.
 *
 * @param {string} str
 *
 * @return {string} decoded string
 */
function decodeEntities(s) {
  if (s.length > 3 && s.indexOf('&') !== -1) {
    return s.replace(ENTITY_PATTERN, replaceEntities);
  }

  return s;
}