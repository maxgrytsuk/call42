'use strict';

var Q = require('q'),
  config = require('../../config/config'),
  LogService = require('../../app/services/log.server.service'),
  CurrencyService = require('../../app/services/currency.server.service'),
  _ = require('lodash');

var SmsPlivoService = this;
module.exports = SmsPlivoService;


SmsPlivoService.create = function() {
  var o = Object.create(this);
  o.init.apply(o, Array.prototype.slice.call(arguments));
  return o;
};

SmsPlivoService.init = function(spec) {
  this.name = 'plivo';
  this.currency = 'USD';
  this.phone = spec.phone;
  return this;
};

SmsPlivoService.getCost = function() {
  var def = Q.defer(), self = this;
  def.resolve({cost:-1, currency:this.currency, name:this.name});
  return def.promise;
};

SmsPlivoService.send = function(spec) {
  var def = Q.defer(), self = this;
  def.resolve({cost:-1});
  return def.promise;
};