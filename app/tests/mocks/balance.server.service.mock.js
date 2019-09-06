'use strict';
var Q = require('q'),
  _ = require('lodash'),
  BalanceService = require('../../services/balance.server.service');

var BalanceServiceMock = Object.create(BalanceService);
module.exports = BalanceServiceMock;


BalanceServiceMock.balance = {results:[]};

BalanceServiceMock.getBalance = function() {
  return Q(this.balance);
};

BalanceServiceMock.getBalanceItem = function(spec) {
  return _.find(this.balance.results, function(item) {
    return item.notification === spec.notification;
  });
};

BalanceServiceMock.setNotificationCostToBalance = function(spec) {
  return Q();
};

BalanceServiceMock.setBalance = function(balance) {
  this.balance = balance;
};

BalanceServiceMock.createBalanceItem = function(data) {
  this.balance.results.push(data);
  return Q(data);
};