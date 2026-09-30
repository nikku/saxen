/**
 * Test suite main.
 */

describe('document parsing', function() {

  describe('should parse', function() {

    require('./elements');

  });

  require('./modes');

  require('./decode');

  require('./namespaces');

});


describe('errors', function() {

  require('./errors');

});