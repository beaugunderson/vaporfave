'use strict';

var _ = require('lodash');

//if (_.random(0, 1, true) < 0.01) {
//  process.exit(0);
//}

var EccoJam = require('./lib/ecco-jam.js');
var Twit = require('twit');
var updateWithMedia = require('./lib/twitter-update-with-media.js');

//var SCREEN_NAME = process.env.SCREEN_NAME;

_.mixin(Twit.prototype, updateWithMedia);

var T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

var eccoJam = new EccoJam();

eccoJam.initialize(512 * 2, 255 * 2);
eccoJam.draw();

eccoJam.toBuffer(function (err, buffer) {
  if (err) {
    throw err;
  }

  T.updateWithMedia('', null, buffer, function (err, response, body) {
    if (err || response.statusCode !== 200) {
      return console.log('TUWM error', err, body);
    }

    console.log('TUWM OK');
  });
});

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
