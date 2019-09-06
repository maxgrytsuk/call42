'use strict';
var Q = require('q'),
  _ = require('lodash'),
  SmsPlivoService = require('../../services/sms.plivo.server.service');

var SmsPlivoServiceMock = Object.create(SmsPlivoService);
module.exports = SmsPlivoServiceMock;


SmsPlivoService.init = function(spec) {
  this.name = 'plivo';
  this.currency = spec.plivo.currency;
  this.phone = spec.phone;
  this.cost = spec.plivo.cost;
  return this;
};

SmsPlivoServiceMock.getCost = function() {
  return Q({cost:this.cost, name:this.name, currency: this.currency});
};