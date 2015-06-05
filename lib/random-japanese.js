'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');

var RandomJapanese = module.exports = function () {
  var data = fs.readFileSync(path.resolve(__dirname,
    '../words/internet-jp.num'), {encoding: 'utf8'});

  this.lines = data.split('\n');

  var self = this;

  // Remove the explanatory text
  _.times(4, function () {
    self.lines.shift();
  });
};

RandomJapanese.prototype.lemma = function () {
  var line = _.sample(this.lines);

  return line.match(/.*? .*? (.*)/)[1];
};
