'use strict';

var Q = require('q'),
  ChannelBaseMock = require('../../../app/tests/mocks/channel.base.server.service.mock');

var ChannelAsteriskMock = Object.create(ChannelBaseMock);
module.exports = ChannelAsteriskMock;

ChannelAsteriskMock.setAsteriskService = function(service) {
  this.asteriskService = service;
};

ChannelAsteriskMock.getAsteriskService = function() {
  return this.asteriskService;
};