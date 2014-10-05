'use strict';

var fs = require('fs');
var path = require('path');

var Canvas = require('canvas');
var Victor = require('victor');

var _ = require('lodash');

var utilities = require('./utilities.js');

var ImageHelper = require('./image-helper.js');
var ImageLine = require('./image-line.js');
var ImageRays = require('./image-rays.js');
var PixelSorter = require('./pixel-sorter.js');
var Rainbow = require('./rainbow.js');
var RandomJapanese = require('./random-japanese.js');
var SequentialImageSet = require('./sequential-image-set.js');

var rotations = require('./rotation-functions.js');

var EccoJam = module.exports = function () {
  this.randomJapanese = new RandomJapanese();
};

EccoJam.sprites = {
  backgrounds: [
    './images/bg-marble-sea.png',
    './images/bg-origin-beach.png'
  ],
  animals: [
    new SequentialImageSet(utilities.templateImageNames(
      './images/stingray/stingray', 1, 6)),
    new SequentialImageSet(utilities.templateImageNames(
      './images/ecco/ecco', 1, 5)),
    new SequentialImageSet(utilities.templateImageNames(
      './images/shark/shark-attack', 1, 2)),
    new SequentialImageSet(utilities.templateImageNames(
      './images/jelly/jelly', 1, 5)),
    new SequentialImageSet(utilities.templateImageNames(
      './images/seahorse/seahorse', 1, 18)),
    _.sample([
      new SequentialImageSet(utilities.templateImageNames(
        './images/spider-crab/spider-crab', 1, 2)),
      new SequentialImageSet(utilities.templateImageNames(
        './images/spider-crab/spider-crab', 3, 4))
    ]),
    new SequentialImageSet(utilities.templateImageNames(
      './images/dunkle/dunkle', 1, 4)),
    new SequentialImageSet(utilities.templateImageNames(
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
  this.context = utilities.getContext(this.canvas);
};

EccoJam.prototype.loadFonts = function () {
  var fontPath = path.resolve(__dirname, '../fonts/Arial Unicode.ttf');
  var arialUnicode = new Canvas.Font('Arial Unicode MS', fontPath);

  this.context.addFont(arialUnicode);
};

EccoJam.prototype.drawBackground = function () {
  if (_.random(0, 100) > 75) {
    new Rainbow()
      .context(this.context)
      .x2(this.width)
      .y2(this.height)
      .draw();
  } else {
    utilities.uglyContext(this.context);

    var background = ImageHelper.fromFile(_.sample(EccoJam.sprites.backgrounds))
      .context(this.context);

    background.draw(0, 0, background.width * 2, background.height * 2);

    utilities.prettyContext(this.context);
  }
};

EccoJam.prototype.drawColumn = function () {
  var column = ImageHelper.fromFile(_.sample(EccoJam.sprites.columns))
    .context(this.context);

  var scaledHeight = Math.min(column.height, this.height);
  var scaledWidth = column.width * (scaledHeight / column.height);

  var x = _.random(0, this.width - scaledWidth);
  var y = _.random(0, this.height - scaledHeight);

  column.draw(x, y, scaledWidth, scaledHeight);
};

EccoJam.prototype.randomMessage = function () {
  var topLines = [
    'Exception in misandry.dll',
    'Exception in future.dll',
    'capitalism.exe exited catastrophically',
    'Error: Success',
    'Catastrophic error averted'
  ];

  var bottomLines = [
    'No additional information available',
    'Please consult a hagiography',
    'Too many ordinals',
    '^H^H^H^H',
    'Please see the Knowledgebase™',
    'E_OVERRIDE_OVERRIDE: Override overriden',
    'E_TOO_MANY_TOPONYMS'
  ];

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
  this.context.fillText('Fatal Error', x + 8, y + 16);

  this.context.fillStyle = 'black';

  var messageLines;

  if (_.random(0, 100) < 50) {
    messageLines = _.times(_.random(1, 3),
                           _.partial(this.japaneseMessage, 16), this);

    this.context.font = '14px "Arial Unicode MS"';
  } else {
    messageLines = _.times(_.random(1, 3),
                           _.partial(this.randomMessage, 16), this);

    this.context.font = '12px Microsoft Sans Serif';
  }

  this.drawTextLines(messageLines, 16, x + 58, y + 43);

  this.context.antialias = 'subpixel';
};

EccoJam.prototype.drawRays = function () {
  var types = _.random(2, 6);
  var center = this.center;

  if (_.random(0, 100) > 75) {
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
    var images = _.sample(EccoJam.sprites.animals).context(this.context);

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

  var rand = _.random(0, 100);

  if (rand < 40) {
    this.drawRays();
  } else if (rand < 80) {
    this.drawLines();
  } else {
    this.drawRays();
    this.drawLines();
  }

  // TODO: Get better column images
  //this.drawColumn();

  if (_.random(0, 100) < 25) {
    this.drawPixelSort();
  }

  this.drawErrorMessage();
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
