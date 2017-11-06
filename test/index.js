/**
 * Test suite main.
 */

describe('document parsing', function() {

  describe('should parse', function() {

    require('./elements');

  });


  if (!process.env.TRAVIS) {
    require('./performance');
  }

});


describe('errors', function() {

  require('./errors');

});