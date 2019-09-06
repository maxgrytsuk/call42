'use strict';

var Q = require('q'),
  config = require('../../config/config'),
  ChannelBase = require('../services/channel.base.server.service'),
  AsteriskService = require('../../app/services/asterisk.server.service'),
  _ = require('lodash');

var ChannelAsterisk = Object.create(ChannelBase);
module.exports = ChannelAsterisk;

ChannelAsterisk.notify = function(spec) {
  return this.getAsteriskService().originate({data: this.data, guid: spec.guid});
};

ChannelAsterisk.setAsteriskService = function(service) {
  this.asteriskService = service;
};

ChannelAsterisk.getAsteriskService = function(spec) {
  if (!this.asteriskService) {
    this.asteriskService = AsteriskService.create(spec);
  }
  return this.asteriskService;
};
