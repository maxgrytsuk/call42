'use strict';
var config = require('../../config/config'), path = require('path');
config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
  require(path.resolve(modelPath));
});
var Q = require('q'),
  _ = require('lodash'),
  mongoose = require('mongoose'),
  BillingService = require('../services/billing.server.service'),
  BalanceService = require('../services/balance.server.service'),
  UserService = require('../services/user.server.service'),
  CheckerBase = require('../services/checker.base.server.service');

var CheckerBalance = Object.create(CheckerBase);
module.exports = CheckerBalance;

CheckerBalance.check = function() {
  var def = Q.defer(), self = this, reason;
  var checkProcess = self.getUserService().findOne({_id:self.user.id})
    .then(function(user) {
      self.user = user;
      return Q();
    });

  if (BillingService.notificationTypes[this.channelSettings.type] === 'EMAIL') {
    checkProcess = checkProcess.then(self.checkUserMaxNotificationsCount.bind(this));
  }
  checkProcess.then(self.checkAccount.bind(this))
    .then(function() {
      def.resolve();
    })
    .fail(function(err) {
      if (err.message !== self.statuses.notEnoughMoney) {
        reason = {code:self.statuses.somethingWrong, message: err.message};
      } else {
        reason = {code:self.statuses.notEnoughMoney};
      }
      def.reject(reason);
    });
  return def.promise;
};

CheckerBalance.checkUserMaxNotificationsCount = function() {
  return this.getLastNotificationsMonthlyAccrual()
    .then(this.updateUserMaxNotificationsCount.bind(this));
};

CheckerBalance.getLastNotificationsMonthlyAccrual = function() {
  var month = -1, accruals;
  return this.getBalanceService().getBalance({
    userId:this.user.id,
    type:this.getBalanceService().balanceTypes.notificationsMonthlyAccrual,
    sort:{ _id: -1 },
    perPage: 1
  })
    .then(function(data) {
      accruals = data.results;
      if (accruals && accruals.length && accruals[0].created) {
        month = accruals[0].created.getMonth();
      }
      return Q(month);
    })
    ;
};

/*
 *  Set user's notifications value to max possible at the beginning of the month and
 *  create appropriate accrual record.
 * */
CheckerBalance.updateUserMaxNotificationsCount = function(lastNotificationAccrualMonth) {
  var self = this, now = new Date(),
    notifications = self.user.notifications_max -  self.user.notifications;
  if (lastNotificationAccrualMonth !== now.getMonth() && notifications > 0) {
    return this.getUserService().updateUser(self.user.id, {notifications:self.user.notifications_max})
      .then(function(user){
        self.user = user;
        return self.getBalanceService().createBalanceItem({
          user: self.user.id,
          money : 0,
          free: notifications,
          moneyCurrent: self.user.money,
          freeCurrent: self.user.notifications_max,
          type : self.getBalanceService().balanceTypes.notificationsMonthlyAccrual,
          created : new Date()
        });
      })
      ;
  }
  return Q();
};

CheckerBalance.checkAccount = function() {
  var checkAccountProcess = Q();
  if (BillingService.notificationTypes[this.channelSettings.type] === 'EMAIL') {
    checkAccountProcess = checkAccountProcess.then(this.checkNotificationsCount.bind(this));
  }
  return checkAccountProcess.then(this.checkMoneyCount.bind(this));
};

CheckerBalance.checkNotificationsCount = function() {
  var self = this;
  if (self.user.notifications > 0) {
    return this.getUserService()
      .updateUser(self.user.id, {notifications: self.user.notifications - 1})
      .then(function(user){
        self.user = user;
        return self.getBalanceService().createBalanceItem({
          user: self.user.id,
          notification: self.notification.id,
          free: -1,
          freeCurrent:self.user.notifications,
          moneyCurrent:self.user.money,
          type: self.getBalanceService().balanceTypes.notificationsWithdrawal
        });
      })
      ;
  }
  return Q();
};

CheckerBalance.checkMoneyCount = function(isBalanceCreated) {
  if (!isBalanceCreated) {
    return this.setMoneyBalance(BillingService.notificationTypes[this.channelSettings.type])
  }
  return Q();
};

CheckerBalance.setMoneyBalance = function(notificationType) {
  var self = this, moneyBalance, moneyToWithdraw;
  return self.getPrice(self.user.currency, notificationType)
    .then(function(price) {
      moneyBalance = self.user.money - price;
      if (moneyBalance >= 0) {
        return self.getUserService().updateUser(self.user.id, {money:moneyBalance})
          .then(function(user){
            self.user = user;
            moneyToWithdraw = parseInt('-' + price);
            return self.getBalanceService().createBalanceItem({
              user: self.user.id,
              notification: self.notification.id,
              money: moneyToWithdraw,
              freeCurrent: self.user.notifications,
              moneyCurrent: self.user.money,
              type: self.getBalanceService().balanceTypes.moneyWithdrawal
            });
          })
          ;
      }
      throw new Error(self.statuses.notEnoughMoney)
    })
    ;
};

CheckerBalance.getPrice = function(currency, notificationType) {
  if (this.channelSettings.price) {
    return Q(this.channelSettings.price);
  } else {
    return this.getBillingService().findPrice({
      currency: _.isObject(currency)?currency.id:currency,
      notificationType:notificationType
    })
      .then(function(price) {
        return Q(price);
      })
      ;
  }

};

CheckerBalance.setUserService = function(userService) {
  this.userService = userService;
};

CheckerBalance.getUserService = function() {
  if (!this.userService){
    this.userService = UserService.create();
  }
  return this.userService;
};

CheckerBalance.setBillingService = function(billingService) {
  this.billingService = billingService;
};

CheckerBalance.getBillingService = function() {
  if (!this.billingService){
    this.billingService = BillingService.create();
  }
  return this.billingService;
};

CheckerBalance.setBalanceService = function(balanceService) {
  this.balanceService = balanceService;
};

CheckerBalance.getBalanceService = function() {
  if (!this.balanceService){
    this.balanceService = BalanceService.create();
  }
  return this.balanceService;
};
