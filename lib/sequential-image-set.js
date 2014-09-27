'use strict';

var ImageHelper = require('./image-helper.js');

var SequentialImageSet = module.exports = function (imageNames) {
  this.index = 0;

  this.imageHelpers = [];
  this.imageNames = imageNames;
};

SequentialImageSet.prototype.context = function (context) {
  if (!arguments.length) {
    return this._context;
  }

  this._context = context;

  return this;
};

SequentialImageSet.prototype.reset = function () {
  this.index = 0;
};

SequentialImageSet.prototype.increment = function () {
  this.index = (this.index + 1) % this.imageNames.length;
};

SequentialImageSet.prototype.image = function () {
  var imageHelper = this.imageHelpers[this.index];

  if (!imageHelper) {
    imageHelper = ImageHelper.fromFile(this.imageNames[this.index])
      .context(this.context());

    this.imageHelpers[this.index] = imageHelper;
  }

  return imageHelper;
};
