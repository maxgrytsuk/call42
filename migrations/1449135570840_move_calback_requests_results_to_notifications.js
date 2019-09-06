var mongojs = require('mongojs'),
  _ = require('lodash'),
  Q = require('q'),
  config = require('../config/config');

var db = mongojs(config.db, ['callback_requests', 'notifications']);

exports.up = function(next){

  var notificationInsert = Q.nbind(db.notifications.insert, db.notifications);
  var callbackRequestsFind = Q.nbind(db.callback_requests.find, db.callback_requests);
  var callbackRequestUpdate = Q.nbind(db.callback_requests.update, db.callback_requests);
  var promises = [], idx;
  callbackRequestsFind()
    .then(function(callbackRequests) {
      _.forEach(callbackRequests, function(callbackRequest) {
        idx = 0;
        _.forEach(callbackRequest.results, function(notification) {
          promises.push(notificationInsert({
            created:new Date(),
            channel:notification.channel,
            callbackRequest:callbackRequest._id,
            success:notification.success,
            idx:idx,
            info:notification.info
          }));
          idx += 1;
        });
      });
      return Q.allSettled(promises);
    })
    .then(function() {
      return callbackRequestUpdate({}, {$unset:{results:''}}, {multi:true});
    })
    .then(function() {
      next();
    });
};

exports.down = function(next){
  next();
};