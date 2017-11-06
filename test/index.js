/**
 * Test suite main.
 */

describe('document parsing', function() {

  describe('should parse', function() {

    require('./elements');

  });


  if (!process.env.TRAVIS && !process.env.NO_PERF) {
    require('./performance');
  }

  require('./proxy');

});


describe('errors', function() {

  require('./errors');

});