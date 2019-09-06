'use strict';

var Q = require('q'),
  CheckerBase = require('../services/checker.base.server.service');

var CheckerEnabled = Object.create(CheckerBase);
module.exports = CheckerEnabled;

CheckerEnabled.check = function() {
  var def = Q.defer();
  if (this.channelSettings.isEnabled) {
    def.resolve();
  } else {
    def.reject({code:this.statuses.disabled});
  }
  return def.promise;
};
