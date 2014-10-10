require('chai').should();

var _ = require('lodash');

var utilities = require('../lib/utilities.js');

utilities.mixin(_);

describe('percentChance', function () {
  it('should behave correctly', function () {
    this.timeout(100);

    var TRIALS = 1000000;
    var passed = 0;

    for (var i = 0; i < TRIALS; i++) {
      if (_.percentChance(50)) {
        passed++;
      }
    }

    var percentage = passed / TRIALS;

    percentage.should.be.closeTo(0.5, 0.01);
  });
});
