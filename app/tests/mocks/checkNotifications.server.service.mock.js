'use strict';
var Q = require('q'),
  _ = require('lodash'),
  CheckNotificationsService = require('../../services/checkNotifications.server.service');

var CheckNotificationsServiceMock = Object.create(CheckNotificationsService);
module.exports = CheckNotificationsServiceMock;


CheckNotificationsServiceMock.check = function(spec) {
  return Q();
};
