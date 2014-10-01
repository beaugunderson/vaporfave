// Adapted from https://github.com/Larixk/sort

'use strict';

var utilities = require('./utilities.js');

var PixelSorter = module.exports = function () {
  this._strength = 0.6;
  this._threshold = 0.5;
  this._scale = 1;
  this._vertical = false;
  this._iterations = 12;
};

utilities.populateProperties(PixelSorter.prototype, [
  'context', 'strength', 'threshold', 'scale', 'vertical', 'width', 'height',
  'iterations'
]);

// Change the color of a pixel in a bitmap with alpha blending
PixelSorter.prototype.setPixel = function (index, r, g, b) {
  var orgR = this._pixels[index];
  var orgG = this._pixels[index + 1];
  var orgB = this._pixels[index + 2];

  // Linear interpolation with strength
  this._pixels[index] = orgR + this._strength * (r - orgR);
  this._pixels[index + 1] = orgG + this._strength * (g - orgG);
  this._pixels[index + 2] = orgB + this._strength * (b - orgB);
};

// Compare the difference between two indexes in the bitmap
PixelSorter.prototype.compare = function (sourceIndex, targetIndex) {
  var oldTotal = this._pixels[targetIndex] +
    this._pixels[targetIndex + 1] +
    this._pixels[targetIndex + 2];

  var newTotal = this._pixels[sourceIndex] +
    this._pixels[sourceIndex + 1] +
    this._pixels[sourceIndex + 2];

  // Which way are we comparing?
  if (this._thresholdInt > 0) {
    return (oldTotal - newTotal) > this._thresholdInt;
  }

  return (oldTotal - newTotal) < this._thresholdInt;
};

// Compare and recolor two bitmap indices
PixelSorter.prototype.processIndexPair = function (sourceIndex, targetIndex) {
  if (!this.compare(sourceIndex, targetIndex)) {
    return;
  }

  // Save values before overwriting
  var oldR = this._pixels[targetIndex];
  var oldG = this._pixels[targetIndex + 1];
  var oldB = this._pixels[targetIndex + 2];

  // Swap them pixels
  this.setPixel(targetIndex,
                this._pixels[sourceIndex],
                this._pixels[sourceIndex + 1],
                this._pixels[sourceIndex + 2]);

  this.setPixel(sourceIndex, oldR, oldG, oldB);
};

// Do a single iteration
PixelSorter.prototype.iterate = function () {
  // Loop through all the pixels
  for (var rowIndex = 0; rowIndex < this._maxRow; rowIndex += this._rowWidth) {
    var maxY = rowIndex + this._maxColumn;

    for (var columnIndex = rowIndex; columnIndex < maxY; columnIndex += 4) {
      if (this._vertical) {
        // Compare [x, y] with [x, y + 1]
        this.processIndexPair(columnIndex, columnIndex + this._rowWidth);
      } else {
        // Compare [x, y] with [x + 1, y]
        this.processIndexPair(columnIndex, columnIndex + 4);
      }
    }
  }

  // Repeat immediately
  // this.iterate();
};

// Start drawing, start moving
PixelSorter.prototype.sort = function () {
  // Scale over maximum value
  this._thresholdInt = Math.floor(Math.pow(this._threshold, 7) * 3 * 255);

  // How big is the image?
  var width  = this._width * this._scale;
  var height = this._height * this._scale;

  // Define compared pixels
  this._rowWidth = width * 4;

  if (this._vertical) {
    // All but the bottom row
    this._maxColumn = this._rowWidth;
    this._maxRow = (height - 1) * this._rowWidth;
  } else {
    // All but the right column (= 4 values)
    this._maxColumn = this._rowWidth - 4;
    this._maxRow = height * this._rowWidth;
  }

  this._imageData = this._context.getImageData(0, 0, width, height);
  this._pixels = this._imageData.data;

  for (var i = 0; i < this._iterations; i++) {
    this.iterate();
  }

  this._context.putImageData(this._imageData, 0, 0);
};
