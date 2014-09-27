'use strict';

var _ = require('lodash');

exports.backAndForth = function (optionalOffset) {
  if (!optionalOffset) {
    optionalOffset = _.random(35, 65);
  }

  return function (angle, i) {
    if (i % 2 === 0) {
      return angle + optionalOffset;
    }

    return angle - optionalOffset;
  };
};

exports.clockwise = function (optionalSteps) {
  if (!optionalSteps) {
    optionalSteps = 12;
  }

  var index = 1;

  return function (angle) {
    return angle + ((360 / optionalSteps) * (index++ % optionalSteps));
  };
};
