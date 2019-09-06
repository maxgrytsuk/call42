'use strict';
var Q = require('q'),
  _ = require('lodash'),
  AsteriskService = require('../../services/asterisk.server.service');

var AsteriskServiceMock = Object.create(AsteriskService);
module.exports = AsteriskServiceMock;

AsteriskServiceMock.connect = function() {
  return Q();
};

AsteriskServiceMock.isOnline = function() {
  return new Q({online:this.isOnlineFlag});
};

AsteriskServiceMock.setIsOnline = function(isOnlineFlag) {
  this.isOnlineFlag = isOnlineFlag;
};
