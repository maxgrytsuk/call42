'use strict';
var Q = require('q'),
  _ = require('lodash'),
  BillingService = require('../../services/billing.server.service');

var BillingServiceMock = Object.create(BillingService);
module.exports = BillingServiceMock;

BillingServiceMock.prices = {
  EMAIL:50,
  SMS:70,
  ASTERISK:80
};

BillingServiceMock.findPrice = function(spec) {
  if (spec.notificationType === 'EMAIL') {
    return Q(this.prices.EMAIL);
  } else if (spec.notificationType === 'ASTERISK'){
    return Q(this.prices.ASTERISK);
  } else if (spec.notificationType === 'SMS'){
    return Q(this.prices.SMS);
  }
  else {
    throw new Error('unknown notification type');
  }
};

BillingServiceMock.balance = {results:[]};

BillingServiceMock.getBalance = function() {
  return Q(this.balance);
};

BillingServiceMock.getBalanceItem = function(spec) {
  return _.find(this.balance.results, function(item) {
    return item.notification === spec.notification;
  });
};

BillingServiceMock.setBalance = function(balance) {
  this.balance = balance;
};

BillingServiceMock.createBalanceItem = function(data) {
  this.balance.results.push(data);
  return Q(data);
};