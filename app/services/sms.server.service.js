'use strict';

var Q = require('q'),
  config = require('../../config/config'),
  LogService = require('../../app/services/log.server.service'),
  Checker = require('../services/checker.base.server.service'),
  CurrencyService = require('../../app/services/currency.server.service'),
  URL = require('url-parse'),
  translations = require('../data/translations-server'),
  _ = require('lodash');


var SmsService = this;
module.exports = SmsService;

SmsService.serviceNames = {
  smscentre: 'smscentre',
  plivo: 'plivo'
};

SmsService.services = {
  smscentre: require('../../app/services/sms.smscentre.server.service'),
  plivo: require('../../app/services/sms.plivo.server.service')
};

SmsService.detectAdvantageousService = function(spec) {
  var def = Q.defer(), costPromises= [], advService = {};
  _.forEach(SmsService.services, function(service) {
    costPromises.push(service.create(spec).getCost());
  });
  Q.all(costPromises)
    .then(function(data) {
      costPromises = [];
      _.forEach(data, function(item) {
        costPromises.push(
          CurrencyService.convert({cost:item.cost, currencyFrom:item.currency, currencyTo:spec.user.currency.name})
            .then(function(cost) {
              return Q({name:item.name, cost:cost});
            })
        );
      });
      Q.all(costPromises)
        .then(function(data) {
          _.forEach(data, function(item) {
            if (!advService.cost || (item.cost > 0 && item.cost < advService.cost)) {
              advService = item;
            }
          });
          advService.name?def.resolve(advService):def.reject({message:'Detect sms service problem'});
        })
        .fail(function(err) {
          def.reject(err);
        });

    })
    .fail(function(err) {
      def.reject(err);
    });
  return def.promise;
};

SmsService.send = function(spec) {
  var def = Q.defer();
  var url = new URL(spec.data.referer),
    message = translations[spec.user.lang].SMS_CALLBACK_REQUEST + ' ' + spec.data.phone + ' - ' + url.host;
  var service = SmsService.services[spec.params.service].create(spec.params);
  service.send({phone:spec.params.phone, message: message})
    .then(function(data) {
      CurrencyService.convert({cost:data.cost, currencyFrom:data.currency, currencyTo:spec.user.currency.name})
        .then(function(cost) {
          def.resolve({code:Checker.statuses.sendSuccess, cost:cost});
        })
    })
    .fail(function(err) {
      LogService.log({message: err, user: spec.user, category: 'sms', level: LogService.level.error});
      def.reject({code: Checker.statuses.sendFailure});
    });

  return def.promise;
};