'use strict';
var Q = require('q'),
  _ = require('lodash'),
  SmsSmscentreService = require('../../services/sms.smscentre.server.service');

var SmsSmscentreServiceMock = Object.create(SmsSmscentreService);
module.exports = SmsSmscentreServiceMock;


SmsSmscentreService.init = function(spec) {
  this.name = 'smscentre';
  this.currency = spec.smscentre.currency;
  this.phone = spec.phone;
  this.cost = spec.smscentre.cost;
  return this;
};

SmsSmscentreServiceMock.getCost = function() {
  return Q({cost:this.cost, name:this.name, currency: this.currency});
};