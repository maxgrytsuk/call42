'use strict';

var Q = require('q'),
  _ = require('lodash'),
  CheckerBase = require('../services/checker.base.server.service');

var CheckerExcludedPrefixes = Object.create(CheckerBase);
module.exports = CheckerExcludedPrefixes;

CheckerExcludedPrefixes.check = function() {
  var def = Q.defer(),
    phone = this.callbackRequest.data.phone,
    result,
    prefixes=[],
    method2params = this.channelSettings.nativeParams.method2Params;

  if (method2params && method2params.excludedPrefixes) {
    prefixes = method2params.excludedPrefixes.split(/[\s*\n*\r*]+/);
    _.forEach(prefixes, function(prefix) {
      if (phone && phone.indexOf(prefix.trim()) === 0) {
        result = true;
      }
    });
  }

  if (!result) {
    def.resolve();
  } else {
    def.reject({code:this.statuses.excludedPrefix});
  }
  return def.promise;
};
