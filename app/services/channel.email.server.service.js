'use strict';

var Q = require('q'),
  geoip = require('geoip-ultralight'),
  URL = require('url-parse'),
  config = require('../../config/config'),
  translations = require('../data/translations-server'),
  ChannelBase = require('../services/channel.base.server.service'),
  Checker = require('../services/checker.base.server.service'),
  LogService = require('../../app/services/log.server.service'),
  EmailService = require('../services/email.server.service');

var ChannelEmail = Object.create(ChannelBase);
module.exports = ChannelEmail;

ChannelEmail.notify = function(spec) {
  var self = this,
    deferred = Q.defer(),
    params = spec.params,
    url = new URL(self.data.referer),
    mailOptions,
    dataText = translations[self.user.lang].EMAIL_CALLBACK_REQUEST + ' ' + self.data.phone + ' - ' + url.host;

  var emailViewData = {
    text: dataText,
    phone: self.data.phone,
    country: geoip.lookupCountry(self.data.ip),
    ip: self.data.ip,
    host:self.data.host,
    widgetServerHost:self.data.widgetServerHost,
    referer: self.data.referer
  };

  self.getEmailService().render('app/views/templates/callbackRequest-notification-email.server.view.html', emailViewData, self.user)
    .then(function(html) {
      mailOptions = {
        to: params.emails,
        from: config.mailer.from,
        subject: dataText,
        html: html
      };
      return self.getEmailService().send(mailOptions);
    })
    .then(function() {
      deferred.resolve({code:Checker.statuses.sendSuccess});
      var message = 'Send email success to "'+params.emails+'", callback request guid "' + spec.guid + '", phone: "' + self.data.phone + '"';
      LogService.log({message: message, user: self.user, category: 'email', level: LogService.level.info});
    })
    .fail(function(err) {
      var message = 'Send email failure to "'+params.emails+'", callback request guid "' + spec.guid + '", phone "'+self.data.phone+'", error: "' + JSON.stringify(err) + '"';
      LogService.log({message: message, user: self.user, category: 'email', level: LogService.level.error});
      deferred.reject({code:Checker.statuses.sendFailure, message:err.message});
    });

  return deferred.promise;
};

ChannelEmail.getEmailService = function() {
  if (!this.emailService) {
    this.emailService = EmailService;
  }
  return this.emailService;
};
