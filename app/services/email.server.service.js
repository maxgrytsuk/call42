'use strict';

var Q = require('q'),
  swig = require('swig'),
  config = require('../../config/config'),
  DateHelper = require('../../app/services/dateHelper.server.service'),
  translations = require('../data/translations-server'),
  smtpTransport = require('nodemailer').createTransport(config.mailer.options);


var EmailService = this;
module.exports = EmailService;

EmailService.init = function(spec) {
  if (spec) {
    this.smtpTransport = spec.smtpTransport;
  } else {
    this.smtpTransport = this.getSmtpTransport();
  }
  return this;
};

EmailService.create = function() {
  var o = Object.create(this);
  this.init.apply(o, Array.prototype.slice.call(arguments));
  return o;
};

EmailService.process = function(spec) {
  var self = this, def = Q.defer(), mailOptions, mailTo;
  this.render(spec.templatePath, spec.emailData, spec.user)
    .then(function(html) {
      mailTo = spec.mailTo?spec.mailTo:spec.user.email;
      mailOptions = {
        to: mailTo,
        from: config.mailer.from,
        subject: spec.subject,
        html: html
      };
      return self.send(mailOptions);
    })
    .then(function(){
      def.resolve();
    })
    .fail(function(err) {
      def.reject(err);
    });
  return def.promise;
};

EmailService.render = function(template, data, user) {
  var def = Q.defer();

  if (user) {
    swig.setFilter('translate', function (input) {
      return translations[user.lang][input];
    });
    swig.setFilter('dateByTimezone', function (input) {
      return DateHelper.getDateByTimeZone(input, user.timezone);
    });
  }

  swig.renderFile(template, data , function(err, html) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve(html);
    }
  });
  return def.promise;
};

EmailService.send = function(mailOptions) {
  var def = Q.defer();
  this.getSmtpTransport().sendMail(mailOptions, function(err) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve();
    }
  });
  return def.promise;
};

EmailService.setSmtpTransport = function(smtpTransport) {
  this.smtpTransport = smtpTransport;
};

EmailService.getSmtpTransport = function() {
  if (!this.smtpTransport) {
    this.smtpTransport = smtpTransport;
  }
  return this.smtpTransport;
};