'use strict';

var Q = require('q'),
  CheckerBase = require('../services/checker.base.server.service'),
  _ = require('lodash');

var CheckerSkipOnSuccess = Object.create(CheckerBase);
module.exports = CheckerSkipOnSuccess;

CheckerSkipOnSuccess.check = function() {
  var def = Q.defer(),
    previousSuccessfulNotification = _.find(this.previousNotifications, {success:true});
  if (this.channelSettings.skipOnSuccess && previousSuccessfulNotification) {
    def.reject({code:this.statuses.noSendIfsuccess});
  } else {
    def.resolve();
  }
  return def.promise;
};