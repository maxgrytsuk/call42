'use strict';
var Q = require('q'),
  ChannelBaseMock = require('../../../app/tests/mocks/channel.base.server.service.mock');

var ChannelEmailMock = Object.create(ChannelBaseMock);
module.exports = ChannelEmailMock;


ChannelEmailMock.notify = function() {
  return new Q({code:'STATUS_SEND_SUCCESS'});
};

ChannelEmailMock.setSmtpTransport = function(smtpTransport) {
  this.smtpTransport = smtpTransport;
};

ChannelEmailMock.setApp = function(app) {
  this.app = app;
};

