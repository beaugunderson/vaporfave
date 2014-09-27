'use strict';

var Victor = require('victor');

var ImageLine = require('./image-line.js');
var utilities = require('./utilities.js');

var ImageRays = module.exports = function () {
  // Defaults
  this._steps = 10;
  this._rays = 12;
  this._rotationOffset = 0;
  this._reset = true;

  this._rotationFn = function (angle) {
    return angle;
  };
};

utilities.populateProperties(ImageRays.prototype, [
  'images', 'center', 'distance', 'steps', 'rays', 'rotationOffset', 'reset',
  'rotationFn'
]);

ImageRays.prototype.drawRay = function (angle) {
  var end = new Victor(this._distance, 0)
    .rotateDeg(angle)
    .add(this._center);

  var line = new ImageLine()
    .start(this._center)
    .end(end)
    .rotationFn(this._rotationFn)
    .steps(this._steps)
    .images(this._images);

  line.draw();
};

ImageRays.prototype.draw = function () {
  for (var i = 0; i < 360; i += 360 / this._rays) {
    if (this._reset) {
      this._images.reset();
    }

    this.drawRay(i + this._rotationOffset);
  }
};
