'use strict';

var Q = require('q'),
  _ = require('lodash'),
  config = require('../../config/config'),
  mongoose = require('mongoose'),
  Balance = mongoose.model('Balance'),
  UserService = require('../services/user.server.service'),
  BillingService = require('../services/billing.server.service'),
  BalanceService = require('../services/balance.server.service')
  ;

var CheckNotificationsService = this;
module.exports = CheckNotificationsService;

CheckNotificationsService.check = function(spec) {
  var self = this, checkResultPromiseChain = new Q();
  this.getUserService().setUser(spec.user);

  _.forEach(spec.notifications, function(notification) {
    if (notification.success === false) {
      checkResultPromiseChain = checkResultPromiseChain
        .then(function() {
          return self.getBalanceService().getBalanceItem({notification:notification.id});
        })
        .then(function(balanceItem) {
          if (balanceItem) {
            return self.createReturnAccrual(notification, balanceItem);
          }
          return Q();
        })
        .then(function(returnAccrual) {
          if (returnAccrual) {
            self.updateUser(returnAccrual);
          }
          return Q();
        });
    }
  });
  return checkResultPromiseChain;
};

CheckNotificationsService.updateUser = function(returnAccrual) {
  var data = {};
  if (returnAccrual.money) {
    data.money = returnAccrual.moneyCurrent;
  } else if (returnAccrual.free) {
    data.notifications = returnAccrual.freeCurrent;
  }
  return this.getUserService().updateUser(this.userService.user, data);
};

CheckNotificationsService.createReturnAccrual = function(notification, balanceItem) {
  var returnBalanceItem = {
    user: this.userService.user.id,
    notification:notification.id
  };
  if (balanceItem.money) {
    returnBalanceItem.money = Math.abs(balanceItem.money);
    returnBalanceItem.moneyCurrent = this.userService.user.money + returnBalanceItem.money;
    returnBalanceItem.freeCurrent = this.userService.user.notifications;
    returnBalanceItem.type = this.getBalanceService().balanceTypes.moneyReturnAccrual;
  } else {
    returnBalanceItem.free = Math.abs(balanceItem.free);
    returnBalanceItem.freeCurrent = this.userService.user.notifications + returnBalanceItem.free;
    returnBalanceItem.moneyCurrent = this.userService.user.money;
    returnBalanceItem.type = this.getBalanceService().balanceTypes.notificationsReturnAccrual;
  }
  return this.getBalanceService().createBalanceItem(returnBalanceItem);
};

CheckNotificationsService.setUserService = function(userService) {
  this.userService = userService;
};

CheckNotificationsService.getUserService = function() {
  if (!this.userService){
    this.userService = UserService.create();
  }
  return this.userService;
};

CheckNotificationsService.setBillingService = function(billingService) {
  this.billingService = billingService;
};

CheckNotificationsService.getBillingService = function() {
  if (!this.billingService){
    this.billingService = BillingService.create();
  }
  return this.billingService;
};

CheckNotificationsService.setBalanceService = function(service) {
  this.balanceService = service;
};

CheckNotificationsService.getBalanceService = function() {
  if (_.isEmpty(this.balanceService)){
    this.balanceService = BalanceService.create();
  }
  return this.balanceService;
};
