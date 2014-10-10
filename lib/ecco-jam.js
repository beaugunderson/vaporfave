'use strict';

var fs = require('fs');
var path = require('path');

var Victor = require('victor');

var Canvas = require('canvas-utilities').Canvas;
var ImageHelper = require('canvas-utilities/lib/image-helper.js');
var ImageLine = require('canvas-utilities/lib/image-line.js');
var ImageRays = require('canvas-utilities/lib/image-rays.js');
var PixelSorter = require('canvas-utilities/lib/pixel-sorter.js');
var PoissonImageGrid = require('canvas-utilities/lib/poisson-image-grid.js');
var Rainbow = require('canvas-utilities/lib/rainbow.js');
var rotations = require('canvas-utilities/lib/rotation-functions.js');
var SequentialImageSet = require('canvas-utilities/lib/sequential-image-set.js');
var canvasUtilities = require('canvas-utilities/lib/utilities.js');

var utilities = require('./utilities.js');

var _ = require('lodash');

utilities.mixin(_);

var RandomJapanese = require('./random-japanese.js');

var EccoJam = module.exports = function () {
  this.randomJapanese = new RandomJapanese();
};

EccoJam.sprites = {
  backgrounds: [
    './images/bg-marble-sea.png',
    './images/bg-origin-beach.png'
  ],
  busts: [
    './images/bust-1-dithered.png'
  ],
  macintosh: [
    './images/macintosh-dithered.png'
  ],
  animals: [
    new SequentialImageSet(canvasUtilities.templateImageNames(
      './images/stingray/stingray', 1, 6)),
    new SequentialImageSet(canvasUtilities.templateImageNames(
      './images/ecco/ecco', 1, 5)),
    new SequentialImageSet(canvasUtilities.templateImageNames(
      './images/shark/shark-attack', 1, 2)),
    new SequentialImageSet(canvasUtilities.templateImageNames(
      './images/jelly/jelly', 1, 5)),
    new SequentialImageSet(canvasUtilities.templateImageNames(
      './images/seahorse/seahorse', 1, 18)),
    _.sample([
      new SequentialImageSet(canvasUtilities.templateImageNames(
        './images/spider-crab/spider-crab', 1, 2)),
      new SequentialImageSet(canvasUtilities.templateImageNames(
        './images/spider-crab/spider-crab', 3, 4))
    ]),
    new SequentialImageSet(canvasUtilities.templateImageNames(
      './images/dunkle/dunkle', 1, 4)),
    new SequentialImageSet(canvasUtilities.templateImageNames(
      './images/tube/tube', 1, 8))
  ],
  columns: [
    './images/columns/long-column.png',
    './images/columns/long-shadow-column.png',
    './images/columns/top-half-column.png'
  ],
  errors: [
    './images/error-message.gif'
  ]
};

EccoJam.prototype.initialize = function (width, height) {
  this.width = width;
  this.height = height;

  this.center = new Victor(width / 2, height / 2);

  this.canvas = new Canvas(width, height);
  this.context = canvasUtilities.getContext(this.canvas);
};

EccoJam.prototype.loadFonts = function () {
  var fontPath = path.resolve(__dirname, '../fonts/Arial Unicode.ttf');
  var arialUnicode = new Canvas.Font('Arial Unicode MS', fontPath);

  this.context.addFont(arialUnicode);
};

EccoJam.prototype.drawBackground = function () {
  if (_.percentChance(100 / 3)) {
    new Rainbow()
      .context(this.context)
      .x2(this.width)
      .y2(this.height)
      .draw();
  } else {
    canvasUtilities.uglyContext(this.context);

    // TODO: Define the context size based on this image
    var background = ImageHelper.fromFile(_.sample(EccoJam.sprites.backgrounds))
      .context(this.context);

    background.draw(0, 0, background.width * 2, background.height * 2);

    canvasUtilities.prettyContext(this.context);
  }
};

// XXX: Abstract this to canvas-utilities?
EccoJam.prototype.drawCenterWithinBounds = function (imageHelper) {
  var scaledHeight = Math.min(imageHelper.height, this.height);
  var scaledWidth = imageHelper.width * (scaledHeight / imageHelper.height);

  var modifier = _.random(0.5, 1.25);

  scaledHeight *= modifier;
  scaledWidth *= modifier;

  var halfWidth = scaledWidth / 2;
  var halfHeight = scaledHeight / 2;

  imageHelper.draw(_.random(0 - halfWidth, this.width - halfWidth),
                   _.random(0 - halfHeight, this.height - halfHeight),
                   scaledWidth,
                   scaledHeight);
};

EccoJam.prototype.drawColumn = function () {
  var column = ImageHelper.fromFile(_.sample(EccoJam.sprites.columns))
    .context(this.context);

  // XXX: Probably need to draw this one entirely in bounds?
  this.drawCenterWithinBounds(column);
};

EccoJam.prototype.drawMac = function () {
  var mac = ImageHelper.fromFile(_.sample(EccoJam.sprites.macintosh))
    .context(this.context);

  this.drawCenterWithinBounds(mac);
};

EccoJam.prototype.drawBust = function () {
  var bust = ImageHelper.fromFile(_.sample(EccoJam.sprites.busts))
    .context(this.context);

  this.drawCenterWithinBounds(bust);
};

EccoJam.prototype.randomMessage = function () {
  var topLines = [
    'Exception in misandry.dll:',
    'Exception in future.dll:',
    'capitalism.exe exited abruptly:',
    'Catastrophic error averted:'
  ];

  var bottomLines = [
    'No additional information available.',
    'Please consult a hagiography.',
    'Too many ordinals.',
    '^H^H^H^H',
    'Please see the Knowledgebase™',
    'E_OVERRIDE_OVERRIDEN',
    'E_TOO_MANY_TOPONYMS'
  ];

  if (_.percentChance(10)) {
    return ['Error: Success', 'Error: Success', 'Error: Success'];
  }

  return [_.sample(topLines), _.sample(bottomLines)];
};

EccoJam.prototype.japaneseMessage = function (optionalMaxLength) {
  var message = _.times(_.random(2, 8), this.randomJapanese.lemma,
    this.randomJapanese).join(' ');

  if (optionalMaxLength) {
    return message.substring(0, optionalMaxLength);
  }

  return message;
};

EccoJam.prototype.drawTextLines = function (lines, spacing, x, y) {
  var self = this;

  lines.forEach(function (line, i) {
    self.context.fillText(line, x, y + (i * spacing));
  });
};

EccoJam.prototype.drawErrorMessage = function () {
  var error = ImageHelper.fromFile(_.sample(EccoJam.sprites.errors))
    .context(this.context);

  var x = _.random(0, this.width - error.width);
  var y = _.random(0, this.height - error.height);

  error.draw(x, y);

  this.context.antialias = 'gray';

  this.context.fillStyle = 'white';
  this.context.font = 'bold 12px Microsoft Sans Serif';

  var errorTitles = [
    '+++ATH0',
    'Fatal Error',
    'Guru Meditation',
    'Failure',
    'OH SHI-'
  ];

  this.context.fillText(_.sample(errorTitles), x + 8, y + 16);

  this.context.fillStyle = 'black';

  var messageLines;

  if (_.percentChance(50)) {
    messageLines = _.times(_.random(1, 3),
                           _.partial(this.japaneseMessage, 16), this);

    this.context.font = '14px "Arial Unicode MS"';
  } else {
    messageLines = this.randomMessage();

    this.context.font = '12px Microsoft Sans Serif';
  }

  this.drawTextLines(messageLines, 16, x + 58, y + 43);

  this.context.antialias = 'subpixel';
};

EccoJam.prototype.drawRays = function () {
  var types = _.random(2, 6);
  var center = this.center;

  if (_.percentChance(50)) {
    var bottomLeft = new Victor(0, 0);
    var topRight = new Victor(this.width, this.height);

    center = new Victor().randomize(bottomLeft, topRight);
  }

  for (var i = 0; i < types; i++) {
    new ImageRays()
      .images(_.sample(EccoJam.sprites.animals).context(this.context))
      .steps(_.random(10, 25))
      .distance(Math.max(this.width, this.height))
      .center(center)
      .rays(_.random(4, 24))
      .reset(_.sample([true, false]))
      .rotationOffset(_.random(0, 360))
      .rotationFn(_.sample([
        rotations.backAndForth(),
        rotations.clockwise(_.random(6, 24))
      ]))
      .draw();
  }
};

EccoJam.prototype.drawLines = function () {
  var lines = _.random(1, 5);

  for (var i = 0; i < lines; i++) {
    var images = _.sample(EccoJam.sprites.animals)
      .context(this.context);

    var halfImageHeight = Math.round(images.image().height / 2);
    var lineY = _.random(halfImageHeight, this.height - halfImageHeight);

    new ImageLine()
      .images(images)
      .start(new Victor(0, lineY))
      .end(new Victor(this.width, lineY))
      .steps(_.random(12, 32))
      .draw();
  }
};

EccoJam.prototype.drawPoissonGrid = function () {
  var images = _.sample(EccoJam.sprites.animals)
    .context(this.context);

  new PoissonImageGrid()
    .images(images)
    .width(this.width)
    .height(this.height)
    .draw();
};

EccoJam.prototype.drawPixelSort = function () {
  new PixelSorter()
    .width(this.width)
    .height(this.height)
    .context(this.context)
    .iterations(_.random(16, 64))
    .vertical(_.sample([true, false]))
    .sort();
};

EccoJam.prototype.draw = function () {
  this.loadFonts();

  this.drawBackground();

  if (_.percentChance(100 / 3)) {
    this.drawPoissonGrid();
  } else if (_.percentChance(80)) {
    if (_.percentChance(50)) {
      this.drawLines();
    } else {
      this.drawRays();
    }
  } else {
    this.drawRays();
    this.drawLines();
  }

  // TODO: Get better column images
  //this.drawColumn();

  if (_.percentChance(100 / 3)) {
    this.drawPixelSort();
  }

  if (_.percentChance(100 / 3)) {
    if (_.percentChance(100 / 3)) {
      this.drawMac();
    } else {
      this.drawBust();
    }
  }

  if (_.percentChance(50)) {
    this.drawErrorMessage();
  }
};

EccoJam.prototype.toBuffer = function (callback) {
  this.canvas.toBuffer(function (err, buffer) {
    if (err) {
      callback(err);
    }

    callback(null, buffer);
  });
};

EccoJam.prototype.render = function () {
  this.toBuffer(function (err, buffer) {
    if (err) {
      throw err;
    }

    var filename = process.argv[2] || './output/output.png';

    fs.writeFile(filename, buffer, function (err) {
      if (err) {
        throw err;
      }
    });
  });
};
