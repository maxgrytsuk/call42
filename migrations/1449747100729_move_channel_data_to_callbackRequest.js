var mongojs = require('mongojs'),
  _ = require('lodash'),
  Q = require('q'),
  config = require('../config/config');

var db = mongojs(config.db, ['notifications', 'channels']);

exports.up = function(next){
  function getChannelData(channel) {
    var result = {type:channel.type};
    switch (channel.type) {
      case 'email':result.emails = channel.nativeParams.emails;break;
      default: break;
    }
    return result;
  }
  var notificationsFind = Q.nbind(db.notifications.find, db.notifications);
  var channelsFind = Q.nbind(db.channels.find, db.channels);
  var notificationUpdate = Q.nbind(db.notifications.update, db.notifications);
  var promises = [], notificationsToUpdate, channel, ids;
  notificationsFind()
    .then(function(notifications) {
      notificationsToUpdate = notifications;
      ids = _.reduce(notificationsToUpdate, function(result, notification) {
        result.push(notification.channel);
        return result;
      }, []);
      return channelsFind({ _id: { $in: ids } })
    })
    .then(function(channels) {
      promises = [];
      _.forEach(notificationsToUpdate, function(notification) {
        channel = _.find(channels, function(channel) {
          return notification.channel.toJSON() === channel._id.toJSON();
        });
        if (channel) {
          promises.push(notificationUpdate({_id:notification._id}, {
            $set:{channelData:getChannelData(channel)}
          }));
        }
        promises.push(notificationUpdate({_id:notification._id}, {
          $unset:{channel:''}
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