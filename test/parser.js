import {
  Parser
} from 'saxen';

import assert from 'node:assert';


describe('parser', function() {

  describe('reuse', function() {

    it('should reset state between parses', function() {

      // given
      var parser = new Parser();

      var openTags = [];
      parser.on('openTag', function(name) {
        openTags.push(name);
      });

      // when
      parser.parse('<a/>');
      parser.parse('<b/>');

      // then
      assert.deepEqual(openTags, [ 'a', 'b' ]);
    });

  });

});