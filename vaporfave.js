'use strict';

var EccoJam = require('./lib/ecco-jam.js');
var fs = require('fs');
var Twit = require('twit');
var updateWithMedia = require('./lib/twitter-update-with-media.js');
var utilities = require('./lib/utilities.js');
var _ = require('lodash');

utilities.mixin(_);

_.mixin(Twit.prototype, updateWithMedia);

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

      console.log('Tweeting...');

      var T = new Twit({
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
      });

      var imageBots = [
        '@plzrevisit',
        '@pixelsorter',
        '@a_quilt_bot',
        '@badpng'
      ];

      var arrows = [
        '→',
        '👋'
      ];

      var tweet = '';

      if (_.percentChance(25)) {
        tweet = _.sample(arrows) + ' ' + _.sample(imageBots);
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

//var stream = T.stream('user');
//
//stream.on('tweet', function (tweet) {
//  // Discard tweets where we're not mentioned
//  if (!_.some(tweet.entities.user_mentions, {screen_name: SCREEN_NAME})) {
//    return;
//  }
//
//  // Discard mentions where there's no media
//  if (!tweet.entities || !tweet.entities.media) {
//    return;
//  }
//
//  tweet.entities.media.forEach(function (media) {
//    //T.updateWithMedia('@' + tweet.user.screen_name, tweet.id_str, result,
//    //    function (err, response, body) {
//    //  console.log('TUWM status', err, response.statusCode, body);
//    //});
//  });
//});
