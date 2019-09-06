'use strict';
var Q = require('q'),
  _ = require('lodash'),
  translations = require('../data/translations-server'),
  UserService = require('../services/user.server.service'),
  EmailService = require('../services/email.server.service'),
  Polyglot = require('node-polyglot'),
  URL = require('url-parse'),
  config = require('../../config/config'),
  log4js = require('log4js');

exports.level = {
  info:'info',
  warn:'warn',
  error:'error',
  fatal:'fatal'
};

exports.log = function(spec) {
  var self = this;
  if (spec.user && _.isString(spec.user)) {
    UserService.findOne({_id:spec.user})
      .then(function(user) {
        spec.user = user;
        try {
          return self.doLogging(spec);
        } catch (e) {
          return this;
        }
      });
  } else {
    try {
      return this.doLogging(spec);
    } catch (e) {
      return this;
    }

  }
  return this;
};

exports.email = function(spec) {
  var polyglot = new Polyglot();
  polyglot.extend( translations[spec.user.lang]);
  var phone = 'unknown',
    host = '',
    widgetServerHost = config.host;
  if (spec.callbackRequest) {
    phone =  spec.callbackRequest.data.phone;
    host = new URL(spec.callbackRequest.data.referer).host;
    widgetServerHost = spec.callbackRequest.data.widgetServerHost;
  }

  var emailData =  {
    error:spec.error,
    text:polyglot.t('EMAIL_CALLBACK_REQUESTS_ERROR1', {phone: phone}),
    widgetServerHost: widgetServerHost
  };
  EmailService.process({
    templatePath: 'app/views/templates/callback-request-error.server.view.html',
    emailData:emailData,
    subject:  polyglot.t('EMAIL_CALLBACK_REQUESTS_ERROR_SUBJECT', {host: host}),
    user:spec.user,
    mailTo: spec.user.email + ',' + config.mailer.to
  });
};

exports.doLogging = function(spec) {
  var logFileName = 'general';
  if (spec.user) {
    logFileName = spec.user.id;
  }
  if (!spec.user || (spec.user && spec.user.doLogging)) {
    log4js.configure({
      appenders: [
        {
          type: 'file',
          maxLogSize: 2048000,
          backups: 1,
          filename: 'logs/' + logFileName + '.log',
          category: spec.category
        }
      ],
      replaceConsole: true
    });
    var logger = log4js.getLogger(spec.category);
    logger[spec.level](spec.message);
  }
  return this;
};