'use strict';

var Q = require('q'),
  CheckerBase = require('../services/checker.base.server.service');

var CheckerAsteriskStatus = Object.create(CheckerBase);
module.exports = CheckerAsteriskStatus;

CheckerAsteriskStatus.check = function() {
  var def = Q.defer(),
    asteriskService = this.channel.getAsteriskService();
  if (asteriskService.errorStatus) {
    def.reject({code: asteriskService.errorStatus});
  } else {
    def.resolve();
  }
  return def.promise;
};
