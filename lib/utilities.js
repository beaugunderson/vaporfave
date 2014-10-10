'use strict';

exports.mixin = function (lodash) {
  lodash.mixin({
    percentChance: function (percent) {
      return this.random(1, 100) <= percent;
    }
  });
};
