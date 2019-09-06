var mongojs = require('mongojs'),
  _ = require('lodash'),
  Q = require('q'),
  config = require('../config/config');

var db = mongojs(config.db, ['channels']);
var channelsFind = Q.nbind(db.channels.find, db.channels);
var channelUpdate = Q.nbind(db.channels.update, db.channels);
exports.up = function(next){
  var channelUpdatePromises= [], routes, idx;
  channelsFind({name:'asterisk'})
    .then(function(channels) {
      _.forEach(channels, function(channel) {
        idx = 0, routes = [];
        _.forEach(channel.nativeParams.routes, function(route) {
          route.idx = idx;
          routes.push(route);
          idx += 1;
        });
        channelUpdatePromises.push(updateChannel(channel, routes));
      });
      return Q.allSettled(channelUpdatePromises)
    })
    .then(function(){
      next();
    })
    .done();
};


function updateChannel(channel, routes) {
  var def =  Q.defer();
  channelUpdate({_id:channel._id}, {$set:{'nativeParams.routes':routes}})
    .then(function(){
      def.resolve(Q());
    });
  return def.promise;
}

exports.down = function(next){
//no migrate down
  next();
};