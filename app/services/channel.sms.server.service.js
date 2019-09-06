'use strict';

var Q = require('q'),
  config = require('../../config/config'),
  ChannelBase = require('../services/channel.base.server.service'),
  SmsService = require('../../app/services/sms.server.service'),
  _ = require('lodash');

var ChannelSms = Object.create(ChannelBase);
module.exports = ChannelSms;

ChannelSms.notify = function(spec) {
  return this.getSmsService().send({params:spec.params, data: this.data, user: this.user});
};

ChannelSms.setSmsService = function(service) {
  this.smsService = service;
};

ChannelSms.getSmsService = function() {
  if (!this.smsService) {
    this.smsService = SmsService;
  }
  return this.smsService;
};
