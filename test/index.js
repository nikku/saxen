/**
 * Test suite main.
 */

describe('document parsing', async function() {

  describe('should parse', async function() {

    return import('./elements.js');

  });

  await import('./modes.js');

  await import('./decode.js');

});


describe('errors', async function() {

  await import('./errors.js');

});