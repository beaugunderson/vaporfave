'use strict';

var fs = require('fs');
var path = require('path');

var Canvas = require('canvas');

var utilities = require('./utilities.js');

var ImageHelper = module.exports = function () {
  Object.defineProperty(this, 'width', {
    get: function () {
      if (this._image) {
        return this._image.width;
      }
    }
  });

  Object.defineProperty(this, 'height', {
    get: function () {
      if (this._image) {
        return this._image.height;
      }
    }
  });
};

utilities.populateProperties(ImageHelper.prototype, [
  'image', 'context'
]);

ImageHelper.fromFile = function (name) {
  var relativeScriptPath = '.';

  if (require.main) {
    relativeScriptPath = path.dirname(require.main.filename);
  }

  var imageFile = fs.readFileSync(path.resolve(relativeScriptPath, name));
  var image = new Canvas.Image();

  image.src = imageFile;

  return new ImageHelper().image(image);
};

ImageHelper.prototype.rotate = function (degrees) {
  if (degrees === 0) {
    return this;
  }

  var size = Math.max(this.width, this.height);

  var canvas = new Canvas(size, size);
  var context = utilities.getContext(canvas);

  context.translate(size / 2, size / 2);
  context.rotate(degrees * Math.PI / 180);
  context.drawImage(this.image(),
                    -(this.width / 2),
                    -(this.height / 2));

  this.image(canvas);

  return this;
};

ImageHelper.prototype.draw = function () {
  if (!this.context()) {
    throw new Error('draw called on an ImageHelper without a context');
  }

  var args = Array.prototype.slice.call(arguments);

  args.unshift(this.image());

  this.context().drawImage.apply(this.context(), args);

  return this;
};

ImageHelper.prototype.clone = function () {
  var clone = new ImageHelper();

  clone._image = this._image;
  clone._context = this._context;

  return clone;
};
