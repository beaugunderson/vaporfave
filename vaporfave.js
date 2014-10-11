'use strict';

var botUtilities = require('bot-utilities');
var EccoJam = require('./lib/ecco-jam.js');
var fs = require('fs');
var Twit = require('twit');
var _ = require('lodash');

_.mixin(botUtilities.lodashMixins);
_.mixin(Twit.prototype, botUtilities.twitMixins);

var program = require('commander');

program
  .command('tweet')
  .description('Generate and tweet an image')
  .option('-r, --random', 'only post a percentage of the time')
  .action(function (options) {
    if (options.random) {
      if (_.percentChance(98)) {
        console.log('Skipping...');

        process.exit(0);
      }
    }

    var eccoJam = new EccoJam();

    eccoJam.initialize(512 * 2, 255 * 2);
    eccoJam.draw();

    eccoJam.toBuffer(function (err, buffer) {
      if (err) {
        throw err;
      }

      var T = new Twit(botUtilities.getTwitterAuthFromEnv());

      var tweet = '';

      if (_.percentChance(25)) {
        tweet = botUtilities.heyYou(botUtilities.imageBot());
      }

      T.updateWithMedia(tweet, null, buffer, function (err, response, body) {
        if (err || response.statusCode !== 200) {
          return console.log('TUWM error', err, body);
        }

        console.log('TUWM OK');
      });
    });
  });

program
  .command('save <filename>')
  .description('Generate and save an image')
  .action(function (filename) {
    var eccoJam = new EccoJam();

    eccoJam.initialize(512 * 2, 255 * 2);
    eccoJam.draw();

    eccoJam.toBuffer(function (err, buffer) {
      if (err) {
        throw err;
      }

      fs.writeFileSync(filename, buffer);
    });
  });

program.parse(process.argv);
