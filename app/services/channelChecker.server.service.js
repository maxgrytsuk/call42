'use strict';

var ChannelChecker = this;
module.exports = ChannelChecker;

var Q = require('q'),
  LogService = require('../../app/services/log.server.service'),
  Checker = require('../services/checker.base.server.service'),
  _ = require('lodash')
  ;

ChannelChecker.checkers = {
  CheckerEnabled:require('../../app/services/checker.enabled.server.service'),
  CheckerBalance:require('../../app/services/checker.balance.server.service'),
  CheckerSkipOnSuccess:require('../../app/services/checker.skipOnSuccess.server.service'),
  CheckerWorkTime:require('../../app/services/checker.workTime.server.service'),
  CheckerExcludedPrefixes:require('../../app/services/checker.excludedPrefixes.server.service'),
  CheckerAsteriskStatus:require('../../app/services/checker.asterisk.status.server.service'),
  CheckerOnline:require('../../app/services/checker.online.server.service')
};

ChannelChecker.create = function() {
  var o = Object.create(this);
  o.init.apply(o, Array.prototype.slice.call(arguments));
  return o;
};
/**
 * Initialize a new model.
 *
 * @param {Object} spec - specification.
 * @api public
 */
ChannelChecker.init = function(spec) {
  this.channelSettings = spec.channelSettings;
  this.callbackRequest = spec.callbackRequest;
  this.notification = spec.notification;
  this.previousNotifications = spec.previousNotifications;
  this.channel = spec.channel;
  this.user = spec.user;

  return this;
};

ChannelChecker.notify = function() {
  var self = this, logger,
    deferred = Q.defer(),
    checkers = this.channelSettings.checkers;
  self.runCheckers(checkers)
    .then(function() {
      return self.channel.notify({
        params:self.channelSettings.nativeParams.toJSON(),
        guid:self.callbackRequest.guid
      });
    })
    .then(function(info) {
      self.notification.success = true;
      self.notification.info.code = info.code;
      self.notification.cost = _.isUndefined(info.cost)?0:info.cost;
    })
    .fail(function(info) {
      self.notification.success = false;
      self.notification.info.code = info.code?info.code:Checker.statuses.somethingWrong;
      if (info.message) {
        self.notification.info.message = info.message;
        LogService
          .log({message: info.message, user: self.user, category: 'channelChecker', level:LogService.level.fatal})
          .email({user:self.user, callbackRequest: self.callbackRequest, error: info.message});
      }
    })
    .fin(function () {
      deferred.resolve(self.notification);
    });

  return deferred.promise;
};

ChannelChecker.checkStatus = function() {
  var def = Q.defer(), self = this,
    checkers = ['CheckerEnabled', 'CheckerWorkTime', 'CheckerAsteriskStatus', 'CheckerOnline'];

  if (self.channelSettings.checkers.indexOf('CheckerOnline') === -1) {
    def.resolve(false);
  } else {
    this.runCheckers(checkers)
      .then(function() {
        def.resolve(true);
      })
      .fail(function(err) {
        def.resolve(false);
        if (err.message) {
          LogService
            .log({message: err.message, user: self.user, category: 'channelChecker', level:LogService.level.fatal})
            .email({user:self.user, callbackRequest: self.callbackRequest, error: err.message});
        }
      });
  }
  return def.promise;
};

ChannelChecker.runCheckers = function(checkers) {
  var checkPromiseChain = new Q(true), checker, currentChecker, self = this;
  _.forEach(checkers, function(checkerName) {
    checkPromiseChain = checkPromiseChain.then(function() {
      currentChecker = ChannelChecker.checkers[checkerName].create({
        channelSettings: _.isPlainObject(self.channelSettings)?self.channelSettings:self.channelSettings.toJSON(),
        callbackRequest:self.callbackRequest,
        notification:self.notification,
        previousNotifications:self.previousNotifications,
        channel:self.channel,
        user:self.user,
        result:self.result
      });
      return currentChecker.check();
    });
  });
  return checkPromiseChain;
};