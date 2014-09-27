'use strict';

var utilities = require('./utilities.js');

var ImageLine = module.exports = function () {
  this._steps = 12;

  this._rotationFn = function (angle) {
    return angle;
  };
};

utilities.populateProperties(ImageLine.prototype, [
  'start', 'end', 'steps', 'images', 'rotationFn'
]);

ImageLine.prototype.interpolate = function (progress) {
  return this.start()
    .clone()
    .mix(this.end(), progress);
};

ImageLine.prototype.draw = function () {
  // Better way to express this?
  var angle = this.end().clone().subtract(this.start()).angleDeg();

  for (var i = 1; i < this.steps(); i++) {
    var progress = i / this.steps();

    var position = this.interpolate(progress);

    var clone = this.images()
      .image()
      .clone()
      .rotate(this.rotationFn()(angle, i, progress));

    clone.draw(position.x - (clone.width / 2),
               position.y - (clone.height / 2),
               clone.width,
               clone.height);

    this.images().increment();
  }
};
