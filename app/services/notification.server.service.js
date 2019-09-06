'use strict';

var Q = require('q'),
  _ = require('lodash'),
  mongoose = require('mongoose'),
  CheckerBase = require('../services/checker.base.server.service'),
  Notification = mongoose.model('Notification')
  ;

var NotificationService = this;
module.exports = NotificationService;


NotificationService.create = function() {
  return Object.create(this);
};

NotificationService.createNotification = function(spec) {
  return this.saveNotification(new Notification({
    channelData:spec.channelData,
    callbackRequest:spec.callbackRequest._id,
    idx:spec.idx,
    info:{
      code:CheckerBase.statuses.start
    }
  }));
};

NotificationService.saveNotification = function(notification) {
  var def = Q.defer();
  notification.save(function (err) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve(notification);
    }
  });
  return def.promise;
};

NotificationService.saveNotifications = function(notifications) {
  var self = this, promises = [];
  _.forEach(notifications, function(notification) {
    promises.push(self.saveNotification(notification));
  });
  return Q.allSettled(promises);
};