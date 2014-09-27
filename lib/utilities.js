'use strict';

exports.uglyContext = function (context) {
  context.imageSmoothingEnabled = false;

  context.antialias = 'none';

  context.filter = 'fast';
  context.patternQuality = 'fast';
};

var prettyContext = exports.prettyContext = function (context) {
  context.imageSmoothingEnabled = true;

  context.antialias = 'subpixel';

  context.filter = 'best';
  context.patternQuality = 'best';
};

exports.getContext = function (canvas) {
  var context = canvas.getContext('2d');

  prettyContext(context);

  return context;
};

exports.templateImageNames = function (name, start, end, optionalExtension) {
  if (!optionalExtension) {
    optionalExtension = '.png';
  }

  var imageNames = [];

  for (var i = start; i <= end; i++) {
    imageNames.push(name + '-' + i + optionalExtension);
  }

  return imageNames;
};

var getSet = exports.getSet = function (property) {
  return function (_) {
    if (!arguments.length) {
      return this[property];
    }

    this[property] = _;

    return this;
  };
};

exports.populateProperties = function (prototype, properties) {
  properties.forEach(function (property) {
    prototype[property] = getSet('_' + property);
  });
};
