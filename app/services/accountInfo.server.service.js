'use strict';

var Q = require('q'),
  _ = require('lodash'),
  config = require('../../config/config'),
  mongoose = require('mongoose'),
  Polyglot = require('node-polyglot'),
  URL = require('url-parse'),
  UserService = require('../services/user.server.service'),
  translations = require('../data/translations-server'),
  BillingService = require('../services/billing.server.service'),
  EmailService = require('../services/email.server.service'),
  LogService = require('../../app/services/log.server.service')
  ;

var AccountInfoService = this;
module.exports = AccountInfoService;

AccountInfoService.sendNotification = function(spec) {
  var self = this, userDataBefore = spec.widget.user, userDataAfter, price, currency,
    emailData = {
      username:spec.widget.user.username,
      widgetServerHost:spec.callbackRequest.data.widgetServerHost
    },
    url = new URL(spec.callbackRequest.data.widgetServerHost);
  Q.all([
    this.getUserService().findOne({_id:spec.widget.user.id}),
    this.getBillingService().findPrice({
      currency:spec.widget.user.currency,
      notificationType:this.getBillingService().notificationTypes.email
    }),
    this.getBillingService().getCurrencyName(spec.widget.user.currency)
  ])
    .then(function(data) {
      userDataAfter = data[0];
      price = data[1];
      currency = data[2];
      var templatePath = 'app/views/templates/';

      var polyglot = new Polyglot();
      polyglot.extend( translations[userDataAfter.lang]);

      if (self.checkNotifications({userDataBefore:userDataBefore, userDataAfter:userDataAfter, price:price})) {
        self.sendNotificationAboutNotifications({
          user:spec.widget.user,
          userDataBefore:userDataBefore,
          userDataAfter:userDataAfter,
          url:url,
          emailData:emailData,
          templatePath:templatePath,
          polyglot:polyglot
        });
      } else if (self.checkMoney({userDataBefore:userDataBefore, userDataAfter:userDataAfter, price:price})) {
        self.sendNotificationAboutMoney({
          user:spec.widget.user,
          userDataBefore:userDataBefore,
          userDataAfter:userDataAfter,
          currency:currency,
          url:url,
          emailData:emailData,
          templatePath:templatePath,
          polyglot:polyglot
        });
      }
    })
    .fail(function(err) {
      LogService.log({message:err, user:spec.widget.user, category:'account_info_notification', level:LogService.level.error});
    })
  ;
};

AccountInfoService.sendNotificationAboutNotifications = function(spec) {
  var self = this, text, subject;
  if (spec.userDataAfter.notifications) {
    text = spec.polyglot.t('ACCOUNT_INFO_NOTIFICATIONS_EMAIL_TEXT',
      {
        username: spec.user.username,
        notifications:spec.userDataAfter.notifications
      }
    );
    subject = spec.polyglot.t('ACCOUNT_INFO_NOTIFICATIONS_EMAIL_SUBJECT', {host: spec.url.host});
  } else {
    text = spec.polyglot.t('ACCOUNT_INFO_NO_NOTIFICATIONS_EMAIL_TEXT', {username: spec.user.username});
    subject = spec.polyglot.t('ACCOUNT_INFO_NO_NOTIFICATIONS_EMAIL_SUBJECT', {host: spec.url.host});
  }
  spec.emailData.notifications = spec.userDataAfter.notifications?spec.userDataAfter.notifications:'';
  spec.emailData.text = text;
  setTimeout(function() {
    self.getEmailService().process({
      templatePath:spec.templatePath + 'account-info-notifications.server.view.html',
      emailData:spec.emailData,
      subject:subject,
      user:spec.userDataAfter
    })
      .fail(function(err) {
        LogService.log({message:err, user:self.user, category:'account_info_notification', level:LogService.level.error});
      });
  }, 1000);
};

AccountInfoService.sendNotificationAboutMoney = function(spec) {
  var self = this, text, subject;
  if (spec.userDataAfter.money) {
    text = spec.polyglot.t('ACCOUNT_INFO_MONEY_EMAIL_TEXT',
      {
        username: spec.user.username
      }
    );
    subject = spec.polyglot.t('ACCOUNT_INFO_MONEY_EMAIL_SUBJECT', {host: spec.url.host});
  } else {
    text = spec.polyglot.t('ACCOUNT_INFO_NO_MONEY_EMAIL_TEXT', {username: self.user.username});
    subject = spec.polyglot.t('ACCOUNT_INFO_NO_MONEY_EMAIL_SUBJECT', {host: spec.url.host});
  }
  var money = spec.userDataAfter.money?(spec.userDataAfter.money/100).toFixed(2):'';
  var currency = spec.userDataAfter.money?spec.currency:'';
  spec.emailData.money = money;
  spec.emailData.text = text;
  spec.emailData.currency = currency;
  setTimeout(function() {
    self.getEmailService().process({
      templatePath:spec.templatePath + 'account-info-money.server.view.html',
      emailData:spec.emailData,
      subject:subject,
      user:spec.userDataAfter
    })
      .fail(function(err) {
        LogService.log({message:err, user:self.user, category:'account_info_notification', level:LogService.level.error});
      });
  }, 1000);
};

AccountInfoService.checkNotifications = function(spec) {
  return spec.userDataBefore.money < spec.price &&
    spec.userDataBefore.notifications !== spec.userDataAfter.notifications &&
    (
      (spec.userDataBefore.notifications >= 10 && spec.userDataAfter.notifications < 10) ||
      (spec.userDataBefore.notifications >= 2 && spec.userDataAfter.notifications < 2)
    );
};

AccountInfoService.checkMoney = function(spec) {
  return spec.userDataBefore.money &&
    spec.userDataBefore.money > spec.price &&
    spec.userDataBefore.money !== spec.userDataAfter.money &&
    (
      (spec.userDataBefore.money >= spec.price * 10 && spec.userDataAfter.money < spec.price * 10 ) ||
      (spec.userDataBefore.money >= spec.price * 2 && spec.userDataAfter.money < spec.price * 2 )
    );
};

AccountInfoService.setUserService = function(userService) {
  this.userService = userService;
};

AccountInfoService.getUserService = function() {
  if (!this.userService){
    this.userService = UserService.create();
  }
  return this.userService;
};

AccountInfoService.setBillingService = function(billingService) {
  this.billingService = billingService;
};

AccountInfoService.getBillingService = function() {
  if (!this.billingService){
    this.billingService = BillingService.create();
  }
  return this.billingService;
};

AccountInfoService.setEmailService = function(emailService) {
  this.emailService = emailService;
};

AccountInfoService.getEmailService = function() {
  if (!this.emailService){
    this.emailService = EmailService.create();
  }
  return this.emailService;
};