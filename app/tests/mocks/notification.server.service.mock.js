'use strict';
var Q = require('q'),
  _ = require('lodash'),
  NotificationService = require('../../services/notification.server.service');

var NotificationServiceMock = Object.create(NotificationService);
module.exports = NotificationServiceMock;

NotificationServiceMock.notifications = [];

NotificationServiceMock.createNotification = function(spec) {
  return this.saveNotification({
    channelData:spec.channelData,
    callbackRequest:spec.callbackRequest._id,
    idx:spec.idx,
    info:{}
  });
};

NotificationServiceMock.saveNotification = function(notification) {
  var def = Q.defer();
  this.notifications.push(notification);
  def.resolve(notification);
  return def.promise;
};


NotificationServiceMock.saveNotifications = function(notifications) {
  var self = this, promises = [];
  _.forEach(notifications, function(notification) {
    promises.push(self.saveNotification(notification));
  });
  return Q.allSettled(promises);
};