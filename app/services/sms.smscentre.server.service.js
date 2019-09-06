'use strict';

var Q = require('q'),
  config = require('../../config/config'),
  request = require('request'),
  CurrencyService = require('../../app/services/currency.server.service'),
  _ = require('lodash');

var SmsSmscentreService = this;
module.exports = SmsSmscentreService;

SmsSmscentreService.create = function() {
  var o = Object.create(this);
  o.init.apply(o, Array.prototype.slice.call(arguments));
  return o;
};

SmsSmscentreService.init = function(spec) {
  this.name = 'smscentre';
  this.currency = 'UAH';
  this.phone = spec.phone[0] === '+'?spec.phone.slice(1):spec.phone;
  return this;
};

SmsSmscentreService.getCost = function() {
  var def = Q.defer(), self = this;
  this.send({phone:this.phone, cost:1, message:'get cost message'})
    .then(function(data) {
      def.resolve({cost:data.cost, name:self.name, currency: self.currency});
    })
    .fail(function(err) {
      def.reject(err);
    })
  ;

  return def.promise;
};

//https://smscentre.com/api/http/#send
SmsSmscentreService.send = function(spec) {
  var def = Q.defer(), smsCentreConfig = config.sms.smscentre, self = this;
  request({
    uri:smsCentreConfig.url,
    qs: {
      login:smsCentreConfig.login,
      psw:smsCentreConfig.password,
      phones:spec.phone,
      mes:spec.message,
      charset:'utf-8',
      cost: spec.cost?spec.cost:2,
      fmt:'3'
    },
    method: 'GET'
  }, function(error, response, body) {
    var res = JSON.parse(body);
    if (res.error) {
      def.reject(res.error);
    } else {
      if (process.env.NODE_ENV === 'development') {
        res.cost = 0.2444;//for testing purposes (cost returned from smscentre in testing mode is 0)
      }
      def.resolve({cost:res.cost * 10000, currency: self.currency});
    }
  });
  return def.promise;
};