var mongojs = require('mongojs'),
  _ = require('lodash'),
  Q = require('q'),
  config = require('../config/config');

var db = mongojs(config.db, ['channels']);

exports.up = function(next){

  var channelsFind = Q.nbind(db.channels.find, db.channels);
  var channelUpdate = Q.nbind(db.channels.update, db.channels);
  var promises = [];
  channelsFind({type:'asterisk'})
    .then(function(channels) {
      promises = [];
      _.forEach(channels, function(channel) {
        promises.push(channelUpdate({_id:channel._id}, {
          $set:{
            'nativeParams.callMethod': '2',
            'nativeParams.method1Params': {
              peer :'',
              context : ''
            },
            'nativeParams.method2Params': {
              checkActivePeers :channel.nativeParams.check_active_peers,
              destination : channel.nativeParams.destination,
              excludedPrefixes : channel.nativeParams.excludedPrefixes,
              routes: channel.nativeParams.routes
            }
          },
          $unset:{
            'nativeParams.check_active_peers':'',
            'nativeParams.destination':'',
            'nativeParams.excludedPrefixes':'',
            'nativeParams.routes':[]
          }
        }));
      });
      return Q.all(promises);
    })
    .then(function() {
      next();
    })
    .fail(function() {
      next();
    })
  ;
};

exports.down = function(next){
  next();
};