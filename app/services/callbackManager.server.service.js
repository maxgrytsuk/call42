'use strict';

var Q = require('q'),
  _ = require('lodash'),
  config = require('../../config/config'),
  mongoose = require('mongoose'),
  URL = require('url-parse'),
  UserService = require('../services/user.server.service'),
  EmailService = require('../services/email.server.service'),
  translations = require('../data/translations-server'),
  CallbackRequestService = require('../services/callbackRequest.server.service'),
  BillingService = require('../services/billing.server.service'),
  BalanceService = require('../services/balance.server.service'),
  NotificationService = require('../services/notification.server.service'),
  AccountInfoService = require('../services/accountInfo.server.service'),
  CheckNotificationsService = require('../services/checkNotifications.server.service'),
  CheckerWorkTime = require('../services/checker.workTime.server.service'),
  ChannelSettingsService = require('../services/channelSettings.server.service'),
  WidgetService = require('../services/widgets.server.service'),
  LogService = require('../../app/services/log.server.service'),

  ChannelEmail = require('../../app/services/channel.email.server.service'),
  ChannelSms = require('../../app/services/channel.sms.server.service'),

  AsteriskService = require('../../app/services/asterisk.server.service'),
  ChannelAsterisk = require('../../app/services/channel.asterisk.server.service'),

  ChannelChecker = require('../../app/services/channelChecker.server.service')
  ;

var CallbackManager = this;
module.exports = CallbackManager;

CallbackManager.channelClasses = {
  email:ChannelEmail,
  sms:ChannelSms,
  asterisk:ChannelAsterisk
};

/**
 * Initialize a new model.
 *
 * @param {JSON} spec.
 * @api public
 */

CallbackManager.init = function(spec) {
  this.widget = spec.widget;
  this.callbackRequest = spec.callbackRequest;
  this.channels = [];
  this.notificationsProcessed = [];
  return this;
};

CallbackManager.create = function() {
  var o = Object.create(this);
  this.init.apply(o, Array.prototype.slice.call(arguments));
  return o;
};

CallbackManager.processRequest = function() {
  var self = this, def = Q.defer();
  self.notify()
    .then(function(lastProcessedNotification) {
      self.notificationsProcessed.push(lastProcessedNotification);
      return self.getNotificationService().saveNotifications(self.notificationsProcessed);
    })
    .then(function() {
      //set callback request result when all notifications are processed, 'success' if at least one is successful
      return self.getCallbackRequestService().setResult({notifications:self.notificationsProcessed, callbackRequest:self.callbackRequest});
    })
    .then(function() {
      //if notification has cost returned we need to save it to balance
      return self.getBalanceService().setNotificationCostToBalance(self.notificationsProcessed);
    })
    .then(function() {
      //refresh user data, it can be changed in CheckerBalance
      return self.getUserService().findOne({_id:self.widget.user.id});
    })
    .then(function(user) {
      //Create return accruals for unsuccessful notifications
      return self.getCheckNotificationsService().check({
        user:user,
        notifications:self.notificationsProcessed
      });
    })
    .then(function() {
      //send notification about balance state
      AccountInfoService.sendNotification({
        callbackRequest:self.callbackRequest,
        widget:self.widget
      });
      //resolving here just for testing purposes
      def.resolve();
    })
    .fail(function(err) {
      //rejecting here just for testing purposes
      def.reject();
      if (process.env.NODE_ENV !== 'test') {
        LogService
          .log({message: err, user: self.widget.user, category: 'callback_request', level:LogService.level.fatal})
          .email({user:self.widget.user, callbackRequest: self.callbackRequest, error: err.stack});
      }
    })
  ;
  return def.promise;
};

CallbackManager.notify = function() {
  var self = this, notifyPromiseChain = new Q(), channelChecker;
  var channels = _.sortBy(self.widget.channels, 'idx');
  _.forEach(channels, function(channelSettings) {
    notifyPromiseChain = notifyPromiseChain
      .then(function(processedNotification) {
        return self.getChannel(channelSettings.model)
          .then(function(channel) {
            return self.getNotificationService().createNotification({
              channelData:self.getChannelDataForNotification(channelSettings.model),
              callbackRequest:self.callbackRequest,
              idx:channelSettings.idx
            })
              .then(function(notification) {
                channelChecker = ChannelChecker.create({
                  channelSettings:channelSettings.model,
                  callbackRequest:self.callbackRequest,
                  channel:channel,
                  notification:notification,
                  previousNotifications:self.notificationsProcessed,
                  user:self.widget.user
                });
                if (processedNotification) {
                  self.notificationsProcessed.push(processedNotification);
                }
                return channelChecker.notify();
              })
          });
      });
  });
  return notifyPromiseChain;
};

CallbackManager.checkOnlineStatus = function(mode) {
  switch (mode) {
    case WidgetService.autoInvitationMode.byOnlineChannel:
      return this.isAnyChannelOnline();
    case WidgetService.autoInvitationMode.bySchedule:
      return Q(CheckerWorkTime.isWorkTime({workTime:this.widget.public.auto_invitation.workTime, timezone:this.widget.user.timezone}));
    default :
      return Q(false);
  }
};

CallbackManager.isAnyChannelOnline = function() {
  var self = this, notifyPromiseChain = new Q(), channelChecker;
  _.forEach(self.widget.channels, function(channelSettings) {
    notifyPromiseChain = notifyPromiseChain.then(function(success) {
      if (success) {
        return success;
      } else {
        return self.getChannel(channelSettings.model)
          .then(function(channel) {
            channelChecker = ChannelChecker.create({
              channelSettings:channelSettings.model,
              channel:channel,
              user:self.widget.user
            });
            return channelChecker.checkStatus();
          });
      }
    });
  });
  return notifyPromiseChain;
};

CallbackManager.composeResponse = function(notifications) {
  var response = {text:'dialog_thank_you'};
  _.forEach (notifications, function(item) {
    switch (item.info.code){
      case 'STATUS_ORIGINATE_SUCCESS':
        response.text = null;
        break;
      case 'STATUS_ORIGINATE_FAILURE':
        response.text = 'dialog_connection_failure';
        break;
      case 'STATUS_NO_ROUTE':
      case 'STATUS_EXCLUDED_PREFIX':
        response.text = 'dialog_connection_impossible';
        break;
    }
  });
  return response;
};

CallbackManager.getChannelDataForNotification = function(channel) {
  var result = {type:channel.type};
  switch (channel.type) {
    case 'email':result.info = channel.nativeParams.emails;break;
    case 'sms':result.info = channel.nativeParams.phone;break;
    case 'asterisk':result.info = channel.nativeParams.host + ':' + channel.nativeParams.port;break;
    default: break;
  }
  return result;
};

CallbackManager.createChannel = function(spec) {
  var self = this, channel, type;
  type = spec.channelSettings.type;

  if (_.keys(this.channelClasses).indexOf(type) !== -1) {
    channel = this.channelClasses[type].create();
  }
  if (channel) {
    channel.user = self.widget.user;
    if (this.callbackRequest) {
      channel.setData(this.callbackRequest.data);
    }
    if (type === 'asterisk') {
      var asteriskService = this.getAsteriskService({
        params: spec.channelSettings.nativeParams,
        data: this.callbackRequest?this.callbackRequest.data:null,
        user: channel.user
      });
      channel.setAsteriskService(asteriskService);
      if (spec.channelSettings.isEnabled) {
        //we need asterisk to be connected before starting notification process (for CheckerOnline, CheckerAsteriskStatus)
        return asteriskService.connect()
          .then(function() {
            return Q(channel);
          });
      }
    }
    return Q(channel);
  } else {
    throw new Error('Wrong channel type provided');
  }
};

CallbackManager.setCallbackRequestResult = function(notifications) {
  var def = Q.defer();
  var isSuccess = false;
  _.forEach(notifications, function(notification) {
    if (notification.success) {
      isSuccess = true;
    }
  });
  this.callbackRequest.result = isSuccess?'success':'failure';
  this.getCallbackRequestService().saveCallbackRequest(this.callbackRequest)
    .then(function() {
      def.resolve();
    })
    .fail(function(err) {
      def.reject(err);
    });
  return def.promise;
};

CallbackManager.isWidgetHasChannels = function(widget) {
  var def = Q.defer();
  widget.channels.length?def.resolve(): def.reject({text:'dialog_error'});
  return def.promise;
};

CallbackManager.setChannel = function(channel) {
  this.channels.push(channel);
};

CallbackManager.getChannel = function(channelSettings) {
  var def = Q.defer();
  var channel = _.find(this.channels, {'type': channelSettings.type});
  if (channel) {
    def.resolve(channel.value);
  } else {
    return this.createChannel({
      channelSettings:channelSettings
    });
  }
  return def.promise;
};

CallbackManager.setChannelClasses = function(channelClasses) {
  this.channelClasses = channelClasses;
};

CallbackManager.setUserService = function(userService) {
  this.userService = userService;
};

CallbackManager.getUserService = function() {
  if (!this.userService){
    this.userService = UserService.create();
  }
  return this.userService;
};

CallbackManager.setBillingService = function(billingService) {
  this.billingService = billingService;
};

CallbackManager.getBillingService = function() {
  if (!this.billingService){
    this.billingService = BillingService.create();
  }
  return this.billingService;
};

CallbackManager.setBalanceService = function(service) {
  this.balanceService = service;
};

CallbackManager.getBalanceService = function() {
  if (!this.balanceService){
    this.balanceService = BalanceService.create();
  }
  return this.balanceService;
};

CallbackManager.setNotificationService = function(service) {
  this.notificationService = service;
};

CallbackManager.getNotificationService = function() {
  if (!this.notificationService){
    this.notificationService = NotificationService.create();
  }
  return this.notificationService;
};

CallbackManager.setEmailService = function(service) {
  this.emailService = service;
};

CallbackManager.getEmailService = function() {
  if (!this.emailService){
    this.emailService = EmailService.create();
  }
  return this.emailService;
};

CallbackManager.setAsteriskService = function(service) {
  this.asteriskService = service;
};

CallbackManager.getAsteriskService = function(spec) {
  return AsteriskService.create(spec);
};

CallbackManager.setChannelSettingsService = function(service) {
  this.channelSettingsService = service;
};

CallbackManager.getChannelSettingsService = function() {
  if (!this.channelSettingsService){
    this.channelSettingsService = ChannelSettingsService;
  }
  return this.channelSettingsService;
};

CallbackManager.setCheckNotificationsService = function(service) {
  this.checkNotificationsService = service;
};

CallbackManager.getCheckNotificationsService = function() {
  if (!this.checkNotificationsService){
    this.checkNotificationsService = CheckNotificationsService;
  }
  return this.checkNotificationsService;
};

CallbackManager.setCallbackRequestService = function(service) {
  this.callbackRequestService = service;
};

CallbackManager.getCallbackRequestService = function() {
  if (!this.callbackRequestService){
    this.callbackRequestService = CallbackRequestService.create();
  }
  return this.callbackRequestService;
};