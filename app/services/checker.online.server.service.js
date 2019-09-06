'use strict';

var Q = require('q'),
  CheckerBase = require('../services/checker.base.server.service');

var CheckerOnline = Object.create(CheckerBase);
module.exports = CheckerOnline;

CheckerOnline.check = function() {
  var def = Q.defer(),
    self = this;

    if (this.channelSettings.sendIfOffline === true) {
      def.resolve();
    } else {
      this.channel.getAsteriskService().isOnline()
        .then(function (res) {
          if (res.online) {
            def.resolve();
          } else {
            def.reject({code: self.statuses.noActivePeers});
          }
        })
        .fail(function(err) {
          def.reject({code:self.statuses.somethingWrong, message: err.message});
        })
      ;
    }

  return def.promise;
};
