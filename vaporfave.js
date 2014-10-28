'use strict';

var botUtilities = require('bot-utilities');
var EccoJam = require('./lib/ecco-jam.js');
var fs = require('fs');
var Twit = require('twit');
var _ = require('lodash');

_.mixin(botUtilities.lodashMixins);
_.mixin(Twit.prototype, botUtilities.twitMixins);

var SCREEN_NAME = process.env.SCREEN_NAME;

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
  .command('retweet')
  .description('Retweet replies')
  .action(function () {
    var T = new Twit(botUtilities.getTwitterAuthFromEnv());

    var stream = T.stream('user');

    // Look for tweets where image bots mention us and retweet them
    stream.on('tweet', function (tweet) {
      // Discard tweets where we're not mentioned
      if (!tweet.entities ||
          !_.some(tweet.entities.user_mentions, {screen_name: SCREEN_NAME})) {
        return;
      }

      // Discard tweets that aren't from image bots
      if (!_.contains(botUtilities.IMAGE_BOTS, tweet.user.screen_name)) {
        return;
      }

      T.post('statuses/retweet/:id', {id: tweet.id_str},
          function (err, data, response) {
        if (err || response.statusCode !== 200) {
          return console.log('TUWM error', err, data);
        }

        console.log('Successfully retweeted tweet', tweet.id_str);
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
