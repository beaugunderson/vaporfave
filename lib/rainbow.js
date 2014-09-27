'use strict';

var color = require('onecolor');

var utilities = require('./utilities.js');

var Rainbow = module.exports = function () {
  this._x1 = 0;
  this._x2 = 200;

  this._y1 = 0;
  this._y2 = 200;
};

utilities.populateProperties(Rainbow.prototype, [
  'context', 'x1', 'x2', 'y1', 'y2'
]);

Rainbow.prototype.draw = function () {
  var c = color('red');

  var adjustment = 1 / Math.abs(this._y1 - this._y2);

  for (var i = this._y1; i < this._y2; i++) {
    c = c.hue(adjustment, true);

    this._context.beginPath();
    this._context.moveTo(this._x1, i);
    this._context.lineTo(this._x2, i);
    this._context.lineWidth = 1;
    this._context.strokeStyle = c.hex();
    this._context.stroke();
  }
};
